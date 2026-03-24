import { useState } from 'react'
import { EligibilityResult } from '../types'
import AirdropCard from './AirdropCard'

interface Props {
  results: EligibilityResult[]
  address: string
}

type Filter = 'all' | 'eligible' | 'upcoming' | 'expired'

export default function AirdropList({ results, address }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = results.filter(r => {
    if (filter === 'eligible') return r.status === 'eligible' && r.airdrop_status === 'claimable'
    if (filter === 'upcoming') return r.airdrop_status === 'upcoming'
    if (filter === 'expired') return r.airdrop_status === 'expired'
    return true
  })

  const counts = {
    eligible: results.filter(r => r.status === 'eligible' && r.airdrop_status === 'claimable').length,
    upcoming: results.filter(r => r.airdrop_status === 'upcoming').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-200">
          <span className="font-mono text-sm text-gray-500 mr-2">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </h2>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'eligible', 'upcoming', 'expired'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors capitalize ${
              filter === f
                ? 'bg-gold-500 text-black border-gold-500 font-semibold'
                : 'text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {f}
            {f === 'eligible' && counts.eligible > 0 && (
              <span className="ml-1 bg-black/20 rounded px-1 text-xs">{counts.eligible}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No airdrops match this filter</div>
        ) : (
          filtered.map(result => (
            <AirdropCard key={result.airdrop_id} result={result} />
          ))
        )}
      </div>
    </div>
  )
}
