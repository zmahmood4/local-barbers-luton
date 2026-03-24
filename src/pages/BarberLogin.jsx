import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.jpg'

const BARBER_ID = 'nawazish1'

export default function BarberLogin() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  if (isAuthenticated) {
    navigate('/barber/dashboard')
    return null
  }

  const handleDigit = (d) => {
    if (pin.length >= 6) return
    const next = pin + d
    setPin(next)
    if (next.length === 6) {
      setTimeout(() => {
        const ok = login(BARBER_ID, next)
        if (ok) {
          navigate('/barber/dashboard')
        } else {
          setShake(true)
          setTimeout(() => { setPin(''); setShake(false) }, 600)
        }
      }, 200)
    }
  }

  const handleDel = () => setPin(p => p.slice(0, -1))

  const keys = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['','0','⌫']
  ]

  return (
    <div className="login-page">
      <img src={logo} alt="Local Barbers" className="login-logo" />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gold)', marginBottom: 4 }}>
        Barber Portal
      </div>
      <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
        Enter your 6-digit PIN
      </div>

      {/* PIN dots */}
      <div className={`pin-dots ${shake ? 'shake' : ''}`} style={shake ? { animation: 'shakeAnim 0.4s ease' } : {}}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
        ))}
      </div>

      {/* Pad */}
      <div className="pin-pad">
        {keys.flat().map((k, i) => {
          if (k === '') return <div key={i} className="pin-btn empty" />
          if (k === '⌫') return (
            <button key={i} className="pin-btn del" onClick={handleDel}>⌫</button>
          )
          return (
            <button key={i} className="pin-btn" onClick={() => handleDigit(k)}>{k}</button>
          )
        })}
      </div>

      <button
        onClick={() => navigate('/')}
        style={{ marginTop: 32, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}
      >
        ← Back to site
      </button>

      <style>{`
        @keyframes shakeAnim {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
