import { ExternalLink, Clock, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'
import { EligibilityResult } from '../types'

interface Props {
  result: EligibilityResult
}

const statusConfig = {
  eligible: {
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    icon: CheckCircle,
    label: 'Eligible',
  },
  not_eligible: {
    color: 'text-gray-500',
    bg: 'bg-white/5 border-white/10',
    icon: AlertCircle,
    label: 'Not Eligible',
  },
  claimed: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    icon: CheckCircle,
    label: 'Claimed',
  },
  unknown: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    icon: HelpCircle,
    label: 'Unknown',
  },
}

const airdropStatusBadge = {
  claimable: 'bg-green-500/20 text-green-400 border-green-500/30',
  upcoming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  expired: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
}

export default function AirdropCard({ result }: Props) {
  const config = statusConfig[result.status] || statusConfig.unknown
  const StatusIcon = config.icon

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null
    try {
      const date = new Date(deadline)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return deadline
    }
  }

  return (
    <div className={`border rounded-xl p-4 transition-all hover:scale-[1.01] ${config.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-white">{result.airdrop_name}</h3>
            {result.token_symbol && (
              <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono">
                ${result.token_symbol}
              </span>
            )}
            <span className={`text-xs border px-2 py-0.5 rounded-full capitalize ${airdropStatusBadge[result.airdrop_status] || airdropStatusBadge.expired}`}>
              {result.airdrop_status}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <StatusIcon size={14} className={config.color} />
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            <span className="text-gray-500 text-sm">· {result.chain}</span>
          </div>

          <p className="text-xs text-gray-500 mb-2">{result.reason}</p>

          {result.claim_deadline && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              <span>Deadline: {formatDeadline(result.claim_deadline)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {result.estimated_value_usd && result.status === 'eligible' && (
            <div className="text-right">
              <div className="text-lg font-bold text-gold-400">
                ~${result.estimated_value_usd.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">est. value</div>
            </div>
          )}

          {result.claim_url && result.status === 'eligible' && result.airdrop_status === 'claimable' && (
            <a
              href={result.claim_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-gold-500 text-black text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gold-400 transition-colors"
            >
              Claim <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
