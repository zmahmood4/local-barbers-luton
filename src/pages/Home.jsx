import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getServices, getAvailability } from '../firebase/db'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// ── Placeholder image component ──────────────────────────────
// Replace <ImgPh /> with <img src="/images/your-photo.jpg" alt="..." />
// Put photos in /public/images/
function ImgPh({ label, style = {}, tall }) {
  return (
    <div
      className="img-ph"
      style={{ width: '100%', height: tall ? '100%' : '100%', ...style }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      {label && <span style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: 1 }}>{label}</span>}
    </div>
  )
}

const SERVICE_DESCRIPTIONS = {
  haircut:   'Our signature scissor & clipper cut, finished with a hot towel and styling.',
  beard:     'Full beard shaping, edging and conditioning for a sharp, clean finish.',
  hairbeard: 'The full treatment — precise haircut combined with expert beard sculpting.',
  kids:      'Patient, gentle cuts for the little ones. Finished with a style they\'ll love.',
}

export default function Home() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [avail, setAvail] = useState(null)

  useEffect(() => {
    getServices().then(setServices)
    getAvailability().then(setAvail)
  }, [])

  const openDaysCount = avail
    ? Object.values(avail.days || {}).filter(d => d?.enabled !== false).length
    : 7

  return (
    <div className="page-with-nav">
      <Nav />

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="hero-pole-stripe" />
        {/* TO REPLACE: Add /public/images/hero-bg.jpg for hero background */}
        <ImgPh label="Hero Background Photo" style={{ position: 'absolute', inset: 0, borderRadius: 0, border: 'none' }} />
        <div className="hero-gradient" />
        <div className="container-lg hero-content" style={{ width: '100%' }}>
          <div className="hero-kicker">
            <span>💈</span>
            <span>Luton's Finest Barber</span>
          </div>
          <h1 className="hero-title">
            Fresh Cuts.
            <span className="hero-title-accent">Sharp Looks.</span>
          </h1>
          <p className="hero-tagline">
            Premium barbering by Nawazish — precision cuts, expert beard work, and a style that speaks for itself.
          </p>
          <div className="hero-ctas">
            <button className="btn-hero-primary" onClick={() => navigate('/book')}>
              Book Appointment →
            </button>
            <button className="btn-hero-outline" onClick={() => navigate('/services')}>
              View Services
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">500+</div>
              <div className="hero-stat-label">Happy clients</div>
            </div>
            <div>
              <div className="hero-stat-num">{openDaysCount}</div>
              <div className="hero-stat-label">Days a week</div>
            </div>
            <div>
              <div className="hero-stat-num">5★</div>
              <div className="hero-stat-label">Rated service</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="mkt-section-sm mkt-section-dark">
        <div className="container-lg">
          <div className="feature-strip">
            <div className="feature-item">
              <span className="feature-icon">✂️</span>
              <div>
                <div className="feature-name">Precision Cuts</div>
                <div className="feature-desc">Every cut is tailored to your face shape and personal style.</div>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <div>
                <div className="feature-name">Easy Booking</div>
                <div className="feature-desc">Book in seconds online — no calls, no waiting.</div>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💆</span>
              <div>
                <div className="feature-name">Relaxed Vibe</div>
                <div className="feature-desc">A chilled, welcoming atmosphere every single time.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="mkt-section" style={{ background: 'var(--black)' }}>
        <div className="container-lg">
          <div style={{ marginBottom: 32 }}>
            <div className="section-eyebrow">What We Offer</div>
            <h2 className="section-heading">Our Services</h2>
            <p className="section-sub">From a classic taper to a full hair & beard combo — we've got you covered.</p>
          </div>
          <div className="services-mkt-grid">
            {services.map(s => (
              <div key={s.id} className="service-mkt-card" onClick={() => navigate('/book', { state: { service: s } })}>
                <span className="svc-emoji">{s.emoji}</span>
                <div className="svc-name">{s.name}</div>
                <div className="svc-desc">{SERVICE_DESCRIPTIONS[s.id] || 'A quality service delivered with expert hands.'}</div>
                <div className="svc-meta">
                  <div className="svc-price">£{s.price}</div>
                  <div className="svc-duration">{s.duration} min</div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-outline"
            style={{ marginTop: 20, maxWidth: 300, margin: '20px auto 0' }}
            onClick={() => navigate('/services')}
          >
            See All Services
          </button>
        </div>
      </section>

      {/* ── ABOUT TEASER ── */}
      <section className="mkt-section mkt-section-dark">
        <div className="container-lg">
          <div className="about-split">
            {/* TO REPLACE: Add /public/images/nawazish-portrait.jpg */}
            <div className="about-img-wrap">
              <ImgPh label="Nawazish Portrait" style={{ height: '100%', borderRadius: 'var(--radius-lg)' }} />
            </div>
            <div>
              <div className="about-text-eyebrow">About The Barber</div>
              <h2 className="about-text-heading">Meet Nawazish</h2>
              <p className="about-text-body">
                With years of experience crafting sharp styles in Luton, Nawazish brings a passion for barbering that goes beyond the cut. Every client gets undivided attention, expert technique, and a finish that leaves you walking out looking your best.
              </p>
              <p className="about-text-body">
                Specialising in everything from classic fades and tapers to full beard shaping and kids' cuts — there's no look we can't deliver.
              </p>
              <div className="about-badges">
                <span className="about-badge">✂️ Expert Cuts</span>
                <span className="about-badge">🧔 Beard Specialist</span>
                <span className="about-badge">👦 Kids Welcome</span>
                <span className="about-badge">📍 Luton Based</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 24, maxWidth: 220 }}
                onClick={() => navigate('/about')}
              >
                Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY PREVIEW ── */}
      <section className="mkt-section" style={{ background: 'var(--black)' }}>
        <div className="container-lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="section-eyebrow">Our Work</div>
              <h2 className="section-heading" style={{ marginBottom: 0 }}>The Gallery</h2>
            </div>
            <button className="btn btn-outline" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => navigate('/gallery')}>
              View All →
            </button>
          </div>

          {/* TO REPLACE: grid items — add /public/images/gallery-1.jpg through gallery-6.jpg */}
          <div className="gallery-grid">
            {[
              { label: 'Fade Cut', tall: true },
              { label: 'Beard Trim', tall: false },
              { label: 'Hair & Beard', tall: false },
              { label: 'Classic Taper', tall: false },
              { label: 'Kids Cut', tall: false },
              { label: 'The Shop', tall: false },
            ].map((item, i) => (
              <div key={i} className={`gallery-item ${item.tall ? 'tall' : ''}`} style={{ aspectRatio: item.tall ? 'auto' : '1' }}>
                <ImgPh label={item.label} style={{ height: item.tall ? 300 : 160, borderRadius: 'var(--radius-sm)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="container-lg cta-banner-content">
          <h2 className="cta-banner-title">Ready for a fresh look?</h2>
          <p className="cta-banner-sub">Book your appointment online in under a minute.</p>
          <button className="btn-cta-white" onClick={() => navigate('/book')}>
            Book Now →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}