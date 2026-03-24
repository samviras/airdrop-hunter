import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { ScanResponse } from '../types'
import ResultsSummary from '../components/ResultsSummary'
import AirdropList from '../components/AirdropList'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result as ScanResponse | undefined

  if (!result) {
    navigate('/')
    return null
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Scan Another
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gold-500 hover:text-gold-400 transition-colors"
        >
          <RefreshCw size={14} />
          New Scan
        </button>
      </div>

      <ResultsSummary data={result} />

      <div className="space-y-8">
        {result.wallets.map((wallet) => (
          <div key={wallet.address} className="bg-dark-700 border border-white/10 rounded-2xl p-6">
            <AirdropList results={wallet.eligibility} address={wallet.address} />
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-xs text-gray-600 border-t border-white/5 pt-8">
        Results are estimates only. Verify eligibility on official claim pages.
        On-chain data powered by Etherscan API. Not financial advice.
      </div>
    </main>
  )
}
