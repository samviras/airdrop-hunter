from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def check_eligibility(scan_result: dict, airdrop: dict) -> dict:
    """
    Check if a wallet scan result meets airdrop eligibility criteria.
    Returns: {status, estimated_amount, estimated_value_usd, reason}
    """
    criteria = airdrop.get("eligibility_criteria", {})
    airdrop_status = airdrop.get("status", "unknown")
    chain = airdrop.get("chain", "ethereum")
    wallet_chain = scan_result.get("chain", "ethereum")

    # Solana airdrops cannot be checked for EVM wallets
    if chain == "solana" and wallet_chain != "solana":
        return {
            "status": "unknown",
            "estimated_amount": None,
            "estimated_value_usd": None,
            "reason": "Solana airdrop - EVM wallet not applicable",
        }

    # Check chain compatibility
    required_chains = criteria.get("chains", [])
    if required_chains and wallet_chain not in required_chains and chain != wallet_chain:
        return {
            "status": "not_eligible",
            "estimated_amount": None,
            "estimated_value_usd": None,
            "reason": f"Wallet not on required chain: {', '.join(required_chains)}",
        }

    tx_count = scan_result.get("transaction_count", 0)
    first_tx_date = scan_result.get("first_tx_date")

    # Error scanning the wallet
    if scan_result.get("error") and tx_count == 0:
        return {
            "status": "unknown",
            "estimated_amount": None,
            "estimated_value_usd": None,
            "reason": "Could not scan wallet - API error",
        }

    # New wallet with no transactions
    if tx_count == 0:
        return {
            "status": "not_eligible",
            "estimated_amount": None,
            "estimated_value_usd": None,
            "reason": "No transactions found on this chain",
        }

    # Check minimum transactions
    min_txs = criteria.get("min_transactions", 0)
    if min_txs and tx_count < min_txs:
        return {
            "status": "not_eligible",
            "estimated_amount": None,
            "estimated_value_usd": None,
            "reason": f"Need at least {min_txs} transactions, found {tx_count}",
        }

    # Check before_date criteria (wallet must have transacted before snapshot)
    before_date_str = criteria.get("before_date")
    if before_date_str and first_tx_date:
        try:
            before_date = datetime.fromisoformat(before_date_str)
            first_tx = datetime.fromisoformat(first_tx_date)
            if first_tx > before_date:
                return {
                    "status": "not_eligible",
                    "estimated_amount": None,
                    "estimated_value_usd": None,
                    "reason": f"First transaction after snapshot date {before_date_str}",
                }
        except Exception:
            pass
    elif before_date_str and not first_tx_date:
        return {
            "status": "unknown",
            "estimated_amount": None,
            "estimated_value_usd": None,
            "reason": "Cannot determine transaction dates",
        }

    # If all checks pass, consider potentially eligible — but check if airdrop is expired
    est_value = airdrop.get("estimated_value_usd")

    if airdrop_status == "expired":
        return {
            "status": "not_eligible",
            "estimated_amount": None,
            "estimated_value_usd": None,
            "reason": "Airdrop claim period has expired",
        }

    return {
        "status": "eligible",
        "estimated_amount": None,
        "estimated_value_usd": float(est_value) if est_value is not None else None,
        "reason": f"Wallet appears eligible based on {tx_count} transactions",
    }
