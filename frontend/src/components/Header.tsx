import { Link, useNavigate } from 'react-router-dom'
import { Zap, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import AuthModal from './AuthModal'

export default function Header() {
  const { user, logout } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <header className="border-b border-white/10 bg-dark-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center group-hover:bg-gold-400 transition-colors">
              <Zap size={18} className="text-black" />
            </div>
            <span className="font-bold text-lg">
              Airdrop<span className="text-gold-500">Hunter</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/airdrops" className="text-sm text-gray-400 hover:text-white transition-colors">
              All Airdrops
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <User size={14} />
                  {user.email.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm bg-gold-500 text-black px-4 py-1.5 rounded-lg font-medium hover:bg-gold-400 transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
