import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAvailability } from '../firebase/db'
import { getDayName } from '../utils/slots'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function Contact() {
  const navigate = useNavigate()
  const [avail, setAvail] = useState(null)

  useEffect(() => { getAvailability().then(setAvail) }, [])

  const todayDow = new Date().getDay()

  const dayOrder = [1, 2, 3, 4, 5, 6, 0] // Mon -> Sun

  return (
    <div className="page-with-nav">
      <Nav />

      <div className="page-hero">
        <div className="container-lg page-hero-content">
          <div className="page-hero-eyebrow">Get In Touch</div>
          <h1 className="page-hero-title">Contact & Hours</h1>
          <p className="page-hero-sub">Find us in Luton and book online — no phone calls needed.</p>
        </div>
      </div>

      <section className="mkt-section" style={{ background: 'var(--black)', flex: 1 }}>
        <div className="container-lg">
          <div style={{ display: 'grid', gap: 32 }}>

            {/* Contact info */}
            <div>
              <div className="section-eyebrow" style={{ marginBottom: 16 }}>Find Us</div>
              <div className="contact-card">
                <span className="contact-icon">📍</span>
                <div>
                  <div className="contact-label">Location</div>
                  <div className="contact-value">Luton, Bedfordshire</div>
                  <div className="contact-sub">Exact address provided on booking confirmation</div>
                </div>
              </div>
              <div className="contact-card">
                <span className="contact-icon">📅</span>
                <div>
                  <div className="contact-label">Booking</div>
                  <div className="contact-value">Online only</div>
                  <div className="contact-sub">Book, reschedule or cancel from this website</div>
                </div>
              </div>
              <div className="contact-card">
                <span className="contact-icon">💈</span>
                <div>
                  <div className="contact-label">Walk-ins</div>
                  <div className="contact-value">Welcome, subject to availability</div>
                  <div className="contact-sub">We recommend booking ahead to secure your slot</div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ marginTop: 8 }}
                onClick={() => navigate('/book')}
              >
                Book Online Now →
              </button>
            </div>

            {/* Opening hours */}
            <div>
              <div className="section-eyebrow" style={{ marginBottom: 16 }}>Opening Hours</div>
              <div className="card" style={{ padding: '8px 16px' }}>
                <div className="hours-table-wrap">
                  {avail ? (
                    <div className="hours-table">
                      {dayOrder.map(dow => {
                        const cfg = avail.days?.[dow]
                        const isToday = dow === todayDow
                        return (
                          <div key={dow} className="hours-row">
                            <span className={`hours-day ${isToday ? 'hours-today' : ''}`}>
                              {getDayName(dow)}{isToday ? ' (Today)' : ''}
                            </span>
                            {cfg?.enabled !== false ? (
                              <span className={`hours-time ${isToday ? 'hours-today' : ''}`}>
                                {formatHour(cfg?.openTime || '09:00')} – {formatHour(cfg?.closeTime || '19:00')}
                              </span>
                            ) : (
                              <span className="hours-closed">Closed</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '20px 0', color: 'var(--muted)', textAlign: 'center', fontSize: 14 }}>
                      Loading hours…
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div>
              <div className="section-eyebrow" style={{ marginBottom: 16 }}>Map</div>
              {/* TO REPLACE: Embed a Google Maps iframe here */}
              <div style={{
                height: 240,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                color: 'var(--muted)',
              }}>
                <span style={{ fontSize: 32 }}>🗺️</span>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Map coming soon</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Luton, Bedfordshire</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function formatHour(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const d = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return m === '00' ? `${d}${ampm}` : `${d}:${m}${ampm}`
}