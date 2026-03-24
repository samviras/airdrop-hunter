from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class WalletCreate(BaseModel):
    address: str
    chain: str = "ethereum"
    label: Optional[str] = None


class WalletResponse(BaseModel):
    id: UUID
    address: str
    chain: str
    label: Optional[str]
    created_at: datetime


class AirdropResponse(BaseModel):
    id: UUID
    name: str
    token_symbol: Optional[str]
    chain: str
    description: Optional[str]
    eligibility_criteria: dict
    claim_url: Optional[str]
    claim_deadline: Optional[datetime]
    status: str
    estimated_value_usd: Optional[float]
    total_allocation: Optional[str]
    announcement_url: Optional[str]
    created_at: datetime
    updated_at: datetime


class ScanRequest(BaseModel):
    addresses: List[str]
    chains: List[str] = ["ethereum"]


class EligibilityResult(BaseModel):
    airdrop_id: str
    airdrop_name: str
    token_symbol: Optional[str]
    chain: str
    status: str
    estimated_value_usd: Optional[float]
    reason: str
    airdrop_status: str
    claim_url: Optional[str]
    claim_deadline: Optional[str]


class ChainScanResult(BaseModel):
    address: str
    chain: str
    transaction_count: int
    first_tx_date: Optional[str]
    last_tx_date: Optional[str]
    protocols_used: List[str]
    unique_contracts: int
    token_transfers: int
    scan_data: dict
    error: Optional[str]


class WalletScanResult(BaseModel):
    address: str
    chains: dict
    eligibility: List[EligibilityResult]


class ScanSummary(BaseModel):
    total_eligible: int
    total_estimated_value_usd: float
    wallets_scanned: int
    chains_scanned: List[str]


class ScanResponse(BaseModel):
    wallets: List[WalletScanResult]
    summary: ScanSummary
