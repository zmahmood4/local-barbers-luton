import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getServices, getAvailability } from '../firebase/db'
import logo from '../assets/logo.jpg'

export default function Home() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [avail, setAvail] = useState(null)

  useEffect(() => {
    getServices().then(setServices)
    getAvailability().then(setAvail)
  }, [])

  const hoursText = avail ? getHoursRange(avail) : '9am – 7pm'
  const openDaysCount = avail
    ? Object.values(avail.days || {}).filter(d => d?.enabled !== false).length
    : 7

  return (
    <div className="page pb-safe">
      {/* Hero */}
      <div className="hero">
        <img src={logo} alt="Local Barbers Luton" className="hero-logo" />
        <div className="hero-name">Local Barbers</div>
        <div className="hero-location">Luton</div>
        <div className="hero-tagline">by Nawazish · Classic cuts, modern style</div>
        <div className="hero-badge">
          <span>💈</span>
          <span>{hoursText} · {openDaysCount === 7 ? '7 days' : `${openDaysCount} days/week`}</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 0' }}>
        <div className="container">

          {/* Book CTA */}
          <button
            className="btn btn-primary"
            style={{ marginBottom: 10 }}
            onClick={() => navigate('/book')}
          >
            Book an Appointment
          </button>
          <button
            className="btn btn-outline"
            style={{ marginBottom: 24 }}
            onClick={() => navigate('/manage')}
          >
            Manage My Booking
          </button>

          {/* Services */}
          <div className="section-title" style={{ marginBottom: 12 }}>Our Services</div>
          <div className="service-grid">
            {services.map(s => (
              <div
                key={s.id}
                className="service-card fade-up"
                onClick={() => navigate('/book', { state: { service: s } })}
              >
                <div className="service-emoji">{s.emoji}</div>
                <div className="service-name">{s.name}</div>
                <div className="service-duration">{s.duration} min</div>
                <div className="service-price">£{s.price}</div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-title">Find Us</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8 }}>
              📍 Luton, Bedfordshire<br />
              📱 Online booking only<br />
              💈 Walk-ins subject to availability
            </div>
          </div>

          {/* Barber portal */}
          <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
            <button
              onClick={() => navigate('/barber/login')}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}
            >
              Barber Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getHoursRange(avail) {
  const enabled = Object.values(avail.days || {}).filter(d => d?.enabled !== false)
  if (!enabled.length) return 'By appointment'
  const opens  = enabled.map(d => d.openTime).sort()[0]
  const closes = enabled.map(d => d.closeTime).sort().reverse()[0]
  return `${formatHour(opens)} – ${formatHour(closes)}`
}

function formatHour(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const d = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return m === '00' ? `${d}${ampm}` : `${d}:${m}${ampm}`
}