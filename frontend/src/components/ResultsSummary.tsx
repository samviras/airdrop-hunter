import { TrendingUp, Wallet, Award } from 'lucide-react'
import { ScanResponse } from '../types'

interface Props {
  data: ScanResponse
}

export default function ResultsSummary({ data }: Props) {
  const { summary } = data

  const formatValue = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${value.toFixed(0)}`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/5 border border-gold-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center">
            <Award size={20} className="text-gold-400" />
          </div>
          <span className="text-sm text-gray-400">Eligible Airdrops</span>
        </div>
        <div className="text-4xl font-bold text-gold-400">{summary.total_eligible}</div>
        <div className="text-sm text-gray-500 mt-1">unclaimed drops found</div>
      </div>

      <div className="bg-dark-700 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <span className="text-sm text-gray-400">Est. Total Value</span>
        </div>
        <div className="text-4xl font-bold text-green-400">
          {summary.total_eligible > 0 ? formatValue(summary.total_estimated_value_usd) : '$0'}
        </div>
        <div className="text-sm text-gray-500 mt-1">potential earnings</div>
      </div>

      <div className="bg-dark-700 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Wallet size={20} className="text-blue-400" />
          </div>
          <span className="text-sm text-gray-400">Wallets Scanned</span>
        </div>
        <div className="text-4xl font-bold text-white">{summary.wallets_scanned}</div>
        <div className="text-sm text-gray-500 mt-1">
          on {summary.chains_scanned.join(', ')}
        </div>
      </div>
    </div>
  )
}
