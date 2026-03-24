export interface Airdrop {
  id: string
  name: string
  token_symbol: string | null
  chain: string
  description: string | null
  eligibility_criteria: Record<string, unknown>
  claim_url: string | null
  claim_deadline: string | null
  status: 'upcoming' | 'claimable' | 'expired'
  estimated_value_usd: number | null
  total_allocation: string | null
  announcement_url: string | null
  created_at: string
  updated_at: string
}

export interface EligibilityResult {
  airdrop_id: string
  airdrop_name: string
  token_symbol: string | null
  chain: string
  status: 'eligible' | 'not_eligible' | 'claimed' | 'unknown'
  estimated_value_usd: number | null
  reason: string
  airdrop_status: 'upcoming' | 'claimable' | 'expired'
  claim_url: string | null
  claim_deadline: string | null
}

export interface WalletScanResult {
  address: string
  chains: Record<string, ChainScanData>
  eligibility: EligibilityResult[]
}

export interface ChainScanData {
  address: string
  chain: string
  transaction_count: number
  first_tx_date: string | null
  last_tx_date: string | null
  protocols_used: string[]
  unique_contracts: number
  token_transfers: number
  scan_data: Record<string, unknown>
  error: string | null
}

export interface ScanResponse {
  wallets: WalletScanResult[]
  summary: {
    total_eligible: number
    total_estimated_value_usd: number
    wallets_scanned: number
    chains_scanned: string[]
  }
}

export interface User {
  id: string
  email: string
}

export interface AuthState {
  user: User | null
  token: string | null
}
