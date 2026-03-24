import re
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import get_settings
from app.schemas.models import ScanRequest
from app.services.scanner import WalletScanner
from app.services.eligibility import check_eligibility

router = APIRouter()

_scanner: WalletScanner | None = None


def get_scanner_singleton() -> WalletScanner:
    global _scanner
    if _scanner is None:
        settings = get_settings()
        _scanner = WalletScanner(
            {
                "ETHERSCAN_API_KEY": settings.ETHERSCAN_API_KEY,
                "ARBISCAN_API_KEY": settings.ARBISCAN_API_KEY,
                "OPTIMISM_API_KEY": settings.OPTIMISM_API_KEY,
                "BASESCAN_API_KEY": settings.BASESCAN_API_KEY,
            }
        )
    return _scanner


def is_valid_address(address: str) -> bool:
    return bool(re.match(r"^0x[0-9a-fA-F]{40}$", address))


@router.post("/scan")
async def scan_wallet(request: ScanRequest, db: AsyncSession = Depends(get_db)):
    # Validate addresses
    for addr in request.addresses:
        if not is_valid_address(addr):
            raise HTTPException(status_code=400, detail=f"Invalid EVM address: {addr}")

    if len(request.addresses) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 addresses per scan")

    if not request.chains:
        raise HTTPException(status_code=400, detail="At least one chain must be specified")

    scanner = get_scanner_singleton()

    # Fetch all airdrops from DB
    result = await db.execute(text("SELECT * FROM airdrops ORDER BY status, name"))
    airdrops = [dict(row._mapping) for row in result.fetchall()]

    all_results = []

    for address in request.addresses:
        address_results: dict = {"address": address, "chains": {}, "eligibility": []}

        for chain in request.chains:
            scan = await scanner.scan_wallet(address, chain)
            address_results["chains"][chain] = scan

            # Check eligibility for each airdrop on this chain's scan result
            for airdrop in airdrops:
                eligibility = check_eligibility(scan, airdrop)
                airdrop_id = str(airdrop["id"])

                # Find existing entry for this airdrop (may have been added by a prior chain)
                existing = next(
                    (e for e in address_results["eligibility"] if e["airdrop_id"] == airdrop_id),
                    None,
                )

                if not existing:
                    address_results["eligibility"].append(
                        {
                            "airdrop_id": airdrop_id,
                            "airdrop_name": airdrop["name"],
                            "token_symbol": airdrop.get("token_symbol"),
                            "chain": airdrop["chain"],
                            "status": eligibility["status"],
                            "estimated_value_usd": eligibility["estimated_value_usd"],
                            "reason": eligibility["reason"],
                            "airdrop_status": airdrop["status"],
                            "claim_url": airdrop.get("claim_url"),
                            "claim_deadline": (
                                str(airdrop["claim_deadline"])
                                if airdrop.get("claim_deadline")
                                else None
                            ),
                        }
                    )
                elif eligibility["status"] == "eligible" and existing["status"] != "eligible":
                    # Prefer eligible over any other status
                    existing.update(
                        {
                            "status": eligibility["status"],
                            "estimated_value_usd": eligibility["estimated_value_usd"],
                            "reason": eligibility["reason"],
                        }
                    )

        all_results.append(address_results)

    # Build summary — only count claimable/upcoming airdrops
    total_eligible = sum(
        1
        for ar in all_results
        for e in ar["eligibility"]
        if e["status"] == "eligible" and e["airdrop_status"] in ("claimable", "upcoming")
    )
    total_value = sum(
        (e.get("estimated_value_usd") or 0)
        for ar in all_results
        for e in ar["eligibility"]
        if e["status"] == "eligible" and e["airdrop_status"] in ("claimable", "upcoming")
    )

    return {
        "wallets": all_results,
        "summary": {
            "total_eligible": total_eligible,
            "total_estimated_value_usd": total_value,
            "wallets_scanned": len(request.addresses),
            "chains_scanned": request.chains,
        },
    }
