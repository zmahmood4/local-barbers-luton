import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getServices } from '../firebase/db'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const SERVICE_DETAILS = {
  haircut: {
    description: 'Our signature haircut uses precision scissor and clipper technique tailored to your head shape and style preference. Includes a hot towel finish and styling.',
    includes: ['Consultation', 'Scissor & clipper cut', 'Hot towel finish', 'Styling'],
  },
  beard: {
    description: 'Expert beard shaping, edging and conditioning. We clean up your neckline, define your shape, and leave your beard looking sharp and healthy.',
    includes: ['Beard shaping', 'Neckline cleanup', 'Edging & definition', 'Conditioning'],
  },
  hairbeard: {
    description: 'The full experience — your hair and beard done in one session. Best value for those who want the complete look.',
    includes: ['Full haircut', 'Beard shaping & edging', 'Hot towel finish', 'Styling'],
  },
  kids: {
    description: 'Patient, gentle cuts for children. We make sure the little ones are comfortable and leave with a style they love.',
    includes: ['Patient approach', 'Scissor or clipper cut', 'Child-friendly service', 'Fun finish'],
  },
}

export default function Services() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])

  useEffect(() => { getServices().then(setServices) }, [])

  return (
    <div className="page-with-nav">
      <Nav />

      <div className="page-hero">
        <div className="container-lg page-hero-content">
          <div className="page-hero-eyebrow">What We Offer</div>
          <h1 className="page-hero-title">Our Services</h1>
          <p className="page-hero-sub">Every cut is tailored, every finish is sharp. Transparent pricing, no surprises.</p>
        </div>
      </div>

      <section className="mkt-section" style={{ background: 'var(--black)', flex: 1 }}>
        <div className="container-lg">
          <div style={{ display: 'grid', gap: 16 }}>
            {services.map(s => {
              const detail = SERVICE_DETAILS[s.id] || {}
              return (
                <div key={s.id} className="card" style={{ display: 'grid', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 32 }}>{s.emoji}</span>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)' }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{s.duration} minutes</div>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
                        {detail.description || 'A quality service delivered with expert hands.'}
                      </p>
                      {detail.includes && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {detail.includes.map(inc => (
                            <span key={inc} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                              ✓ {inc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--blue-light)', lineHeight: 1 }}>£{s.price}</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/book', { state: { service: s } })}
                  >
                    Book {s.name} →
                  </button>
                </div>
              )
            })}
          </div>

          {/* FAQ */}
          <div style={{ marginTop: 56 }}>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>Questions</div>
            <h2 className="section-heading" style={{ marginBottom: 24 }}>FAQs</h2>
            {[
              { q: 'How do I book?', a: 'Click "Book Now" on any service, choose your date and time, fill in your details and confirm. You\'ll receive a confirmation email straight away.' },
              { q: 'Can I walk in?', a: 'Walk-ins are welcome subject to availability, but we recommend booking online to secure your preferred time.' },
              { q: 'How do I cancel or reschedule?', a: 'Use the "Manage Booking" page on our site and enter your booking number and name. You can reschedule or cancel from there.' },
              { q: 'What if I\'m late?', a: 'Please contact us if you\'re running late. We\'ll do our best to accommodate you, but late arrivals may need to reschedule.' },
            ].map(({ q, a }) => (
              <div key={q} style={{ borderBottom: '1px solid var(--border)', padding: '18px 0' }}>
                <div style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>{q}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container-lg cta-banner-content">
          <h2 className="cta-banner-title">Ready to book?</h2>
          <p className="cta-banner-sub">Secure your slot in under a minute.</p>
          <button className="btn-cta-white" onClick={() => navigate('/book')}>Book Appointment →</button>
        </div>
      </section>

      <Footer />
    </div>
  )
}