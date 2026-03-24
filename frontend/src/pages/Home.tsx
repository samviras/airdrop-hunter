import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, TrendingUp, Shield, Globe } from 'lucide-react'
import WalletInput from '../components/WalletInput'
import { scanWallet } from '../utils/api'
import { ScanResponse } from '../types'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleScan = useCallback(async (addresses: string[], chains: string[]) => {
    setLoading(true)
    setError('')
    try {
      const result: ScanResponse = await scanWallet(addresses, chains)
      navigate('/results', { state: { result } })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }, message?: string }
      setError(e.response?.data?.detail || e.message || 'Failed to scan wallet. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm px-4 py-2 rounded-full mb-6">
            <Zap size={14} />
            Free airdrop scanner — no wallet connection needed
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Find Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Free Money
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto">
            Paste your wallet address and discover unclaimed crypto airdrops worth thousands of dollars — in seconds.
          </p>

          <WalletInput onScan={handleScan} loading={loading} />

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: 'No Connection Needed',
              desc: 'Just paste addresses. We never ask for private keys or wallet connections.',
            },
            {
              icon: Globe,
              title: 'Multi-Chain Support',
              desc: 'Scan Ethereum, Arbitrum, Optimism, and Base in one click.',
            },
            {
              icon: TrendingUp,
              title: 'Real-Time Results',
              desc: 'Instant eligibility checks against 15+ tracked airdrop protocols.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-gold-400" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center text-xs text-gray-600">
          Disclaimer: Results are estimates only. Eligibility is determined by on-chain activity and may not be 100% accurate.
          Always verify on official claim pages before taking action. This is not financial advice.
        </div>
      </section>
    </main>
  )
}
