import { useState } from 'react'
import { Search, Plus, X, ChevronDown } from 'lucide-react'

interface Props {
  onScan: (addresses: string[], chains: string[]) => void
  loading: boolean
}

const CHAINS = [
  { id: 'ethereum', label: 'Ethereum', emoji: '⟠' },
  { id: 'arbitrum', label: 'Arbitrum', emoji: '🔵' },
  { id: 'optimism', label: 'Optimism', emoji: '🔴' },
  { id: 'base', label: 'Base', emoji: '🟦' },
]

export default function WalletInput({ onScan, loading }: Props) {
  const [addresses, setAddresses] = useState<string[]>([''])
  const [selectedChains, setSelectedChains] = useState<string[]>(['ethereum'])
  const [showChains, setShowChains] = useState(false)

  const updateAddress = (index: number, value: string) => {
    const updated = [...addresses]
    updated[index] = value
    setAddresses(updated)
  }

  const addAddress = () => {
    if (addresses.length < 5) setAddresses([...addresses, ''])
  }

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index))
  }

  const toggleChain = (chainId: string) => {
    setSelectedChains(prev =>
      prev.includes(chainId)
        ? prev.filter(c => c !== chainId)
        : [...prev, chainId]
    )
  }

  const handleScan = () => {
    const valid = addresses.filter(a => /^0x[0-9a-fA-F]{40}$/.test(a.trim()))
    if (valid.length === 0) return
    if (selectedChains.length === 0) return
    onScan(valid, selectedChains)
  }

  const isValid = addresses.some(a => /^0x[0-9a-fA-F]{40}$/.test(a.trim())) && selectedChains.length > 0

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {addresses.map((addr, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={addr}
            onChange={(e) => updateAddress(i, e.target.value)}
            placeholder="0x... paste your wallet address"
            className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 font-mono text-sm transition-colors"
          />
          {addresses.length > 1 && (
            <button
              onClick={() => removeAddress(i)}
              className="text-gray-500 hover:text-red-400 transition-colors p-2"
            >
              <X size={18} />
            </button>
          )}
        </div>
      ))}

      {addresses.length < 5 && (
        <button
          onClick={addAddress}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold-500 transition-colors"
        >
          <Plus size={16} />
          Add another wallet
        </button>
      )}

      {/* Chain selector */}
      <div className="relative">
        <button
          onClick={() => setShowChains(!showChains)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors bg-dark-700 border border-white/10 rounded-lg px-4 py-2"
        >
          <span>Chains: {selectedChains.length > 0 ? selectedChains.map(c => CHAINS.find(ch => ch.id === c)?.label).join(', ') : 'None selected'}</span>
          <ChevronDown size={14} className={showChains ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>

        {showChains && (
          <div className="absolute top-full left-0 mt-1 bg-dark-700 border border-white/10 rounded-xl p-2 z-10 min-w-48">
            {CHAINS.map(chain => (
              <label key={chain.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChains.includes(chain.id)}
                  onChange={() => toggleChain(chain.id)}
                  className="accent-gold-500"
                />
                <span className="text-sm">{chain.emoji} {chain.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleScan}
        disabled={!isValid || loading}
        className="w-full bg-gold-500 text-black font-bold py-4 rounded-xl hover:bg-gold-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg pulse-gold"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Search size={20} />
            Find My Airdrops
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        No wallet connection needed — just paste addresses. Results are estimates only.
      </p>
    </div>
  )
}
