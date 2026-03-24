import { useState, useEffect } from 'react'
import { ExternalLink, Clock, TrendingUp } from 'lucide-react'
import { getAirdrops } from '../utils/api'
import { Airdrop } from '../types'

const statusStyles = {
  claimable: 'bg-green-500/10 border-green-500/20 text-green-400',
  upcoming: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  expired: 'bg-gray-500/10 border-gray-500/20 text-gray-500',
}

export default function Airdrops() {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    getAirdrops()
      .then(setAirdrops)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? airdrops : airdrops.filter(a => a.status === filter)

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return '—'
    try {
      return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return deadline
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Airdrop Registry</h1>
        <p className="text-gray-400">All tracked airdrops — past, present, and upcoming</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'claimable', 'upcoming', 'expired'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-4 py-2 rounded-lg border transition-colors capitalize ${
              filter === f
                ? 'bg-gold-500 text-black border-gold-500 font-semibold'
                : 'text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 shimmer rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(airdrop => (
            <div
              key={airdrop.id}
              className="bg-dark-700 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold">{airdrop.name}</h3>
                    {airdrop.token_symbol && (
                      <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono">
                        ${airdrop.token_symbol}
                      </span>
                    )}
                    <span className={`text-xs border px-2 py-0.5 rounded-full capitalize ${statusStyles[airdrop.status]}`}>
                      {airdrop.status}
                    </span>
                    <span className="text-xs text-gray-600 capitalize">{airdrop.chain}</span>
                  </div>

                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{airdrop.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {airdrop.estimated_value_usd && (
                      <span className="flex items-center gap-1">
                        <TrendingUp size={12} />
                        Est. ${airdrop.estimated_value_usd.toLocaleString()}
                      </span>
                    )}
                    {airdrop.claim_deadline && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDeadline(airdrop.claim_deadline)}
                      </span>
                    )}
                    {airdrop.total_allocation && (
                      <span>Total: {airdrop.total_allocation}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {airdrop.claim_url && airdrop.status !== 'expired' && (
                    <a
                      href={airdrop.claim_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm bg-gold-500 text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-gold-400 transition-colors"
                    >
                      {airdrop.status === 'claimable' ? 'Claim' : 'Learn More'}
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {airdrop.announcement_url && (
                    <a
                      href={airdrop.announcement_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Announcement <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
