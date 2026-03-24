import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class WalletScanner:
    def __init__(self, api_keys: dict):
        self.api_keys = api_keys
        self.api_base_urls = {
            "ethereum": "https://api.etherscan.io/api",
            "arbitrum": "https://api.arbiscan.io/api",
            "optimism": "https://api-optimistic.etherscan.io/api",
            "base": "https://api.basescan.org/api",
        }
        # In-memory cache: {(address, chain): (result, timestamp)}
        self._cache = {}
        self._cache_hours = 1

    def _get_api_key(self, chain: str) -> str:
        key_map = {
            "ethereum": self.api_keys.get("ETHERSCAN_API_KEY", ""),
            "arbitrum": self.api_keys.get("ARBISCAN_API_KEY", "") or self.api_keys.get("ETHERSCAN_API_KEY", ""),
            "optimism": self.api_keys.get("OPTIMISM_API_KEY", "") or self.api_keys.get("ETHERSCAN_API_KEY", ""),
            "base": self.api_keys.get("BASESCAN_API_KEY", "") or self.api_keys.get("ETHERSCAN_API_KEY", ""),
        }
        return key_map.get(chain, "")

    def _is_cached(self, address: str, chain: str) -> bool:
        key = (address.lower(), chain)
        if key in self._cache:
            result, ts = self._cache[key]
            if datetime.utcnow() - ts < timedelta(hours=self._cache_hours):
                return True
        return False

    def _get_cached(self, address: str, chain: str):
        key = (address.lower(), chain)
        return self._cache[key][0]

    def _set_cache(self, address: str, chain: str, result):
        key = (address.lower(), chain)
        self._cache[key] = (result, datetime.utcnow())

    async def scan_wallet(self, address: str, chain: str = "ethereum") -> dict:
        if self._is_cached(address, chain):
            return self._get_cached(address, chain)

        base_url = self.api_base_urls.get(chain)
        if not base_url:
            return self._unknown_result(address, chain, f"Chain {chain} not supported")

        api_key = self._get_api_key(chain)

        try:
            async with aiohttp.ClientSession() as session:
                # Fetch normal transactions and token transfers concurrently
                tx_data, token_data = await asyncio.gather(
                    self._fetch_transactions(session, base_url, address, api_key),
                    self._fetch_token_transfers(session, base_url, address, api_key),
                )

            result = self._process_scan_data(address, chain, tx_data, token_data)
            self._set_cache(address, chain, result)
            return result

        except Exception as e:
            logger.error(f"Error scanning {address} on {chain}: {e}")
            return self._unknown_result(address, chain, str(e))

    async def _fetch_transactions(
        self, session: aiohttp.ClientSession, base_url: str, address: str, api_key: str
    ) -> list:
        params = {
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "sort": "asc",
            "apikey": api_key,
        }
        try:
            async with session.get(
                base_url, params=params, timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                data = await resp.json()
                if data.get("status") == "1":
                    return data.get("result", [])
                return []
        except Exception as e:
            logger.warning(f"Failed to fetch transactions: {e}")
            return []

    async def _fetch_token_transfers(
        self, session: aiohttp.ClientSession, base_url: str, address: str, api_key: str
    ) -> list:
        params = {
            "module": "account",
            "action": "tokentx",
            "address": address,
            "startblock": 0,
            "endblock": 99999999,
            "sort": "asc",
            "apikey": api_key,
        }
        try:
            async with session.get(
                base_url, params=params, timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                data = await resp.json()
                if data.get("status") == "1":
                    return data.get("result", [])
                return []
        except Exception as e:
            logger.warning(f"Failed to fetch token transfers: {e}")
            return []

    def _process_scan_data(
        self, address: str, chain: str, txs: list, token_txs: list
    ) -> dict:
        tx_count = len(txs)

        first_tx_date = None
        last_tx_date = None
        if txs:
            timestamps = [int(tx.get("timeStamp", 0)) for tx in txs]
            timestamps = [t for t in timestamps if t > 0]
            if timestamps:
                first_tx_date = datetime.utcfromtimestamp(min(timestamps)).isoformat()
                last_tx_date = datetime.utcfromtimestamp(max(timestamps)).isoformat()

        # Extract unique contracts interacted with
        contracts = set()
        for tx in txs:
            to = tx.get("to", "").lower()
            if to:
                contracts.add(to)

        known_protocols = self._identify_protocols(contracts, chain)

        return {
            "address": address.lower(),
            "chain": chain,
            "transaction_count": tx_count,
            "first_tx_date": first_tx_date,
            "last_tx_date": last_tx_date,
            "protocols_used": known_protocols,
            "unique_contracts": len(contracts),
            "token_transfers": len(token_txs),
            "scan_data": {
                "contracts": list(contracts)[:50],  # limit stored contracts
            },
            "error": None,
        }

    def _identify_protocols(self, contracts: set, chain: str) -> list:
        # Simplified protocol identification by known contract addresses
        known = {
            "ethereum": {
                "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": "uniswap-v2",
                "0xe592427a0aece92de3edee1f18e0157c05861564": "uniswap-v3",
                "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": "uniswap-v3",
                "0x00000000219ab540356cbb839cbe05303d7705fa": "ethereum-deposit",
                "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41": "ens",
                "0x283af0b28c62c092c9727f1ee09c02ca627eb7f5": "ens",
                "0x66a71dcef29a0ffbdbe3c6a460a3b5bc225cd675": "layerzero",
                "0x3c2269811836af69497e5f486a85d7316753cf62": "layerzero",
                "0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6": "stargate",
                "0x8731d54e9d02c286767d56ac03e8037c07e01e98": "stargate",
            },
            "arbitrum": {
                "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506": "sushiswap",
                "0xe592427a0aece92de3edee1f18e0157c05861564": "uniswap-v3",
            },
            "optimism": {
                "0xe592427a0aece92de3edee1f18e0157c05861564": "uniswap-v3",
                "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": "uniswap-v3",
            },
            "base": {
                "0x2626664c2603336e57b271c5c0b26f421741e481": "uniswap-v3",
                "0x198ef1ec325a96cc354c7266a038be8b5c558f67": "bridge",
            },
        }

        chain_protocols = known.get(chain, {})
        found = []
        for addr in contracts:
            if addr in chain_protocols:
                proto = chain_protocols[addr]
                if proto not in found:
                    found.append(proto)
        return found

    def _unknown_result(self, address: str, chain: str, error: str) -> dict:
        return {
            "address": address.lower(),
            "chain": chain,
            "transaction_count": 0,
            "first_tx_date": None,
            "last_tx_date": None,
            "protocols_used": [],
            "unique_contracts": 0,
            "token_transfers": 0,
            "scan_data": {},
            "error": error,
        }
