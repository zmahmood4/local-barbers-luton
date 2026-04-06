import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

function ImgPh({ label, style = {} }) {
  return (
    <div className="img-ph" style={{ width: '100%', ...style }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      {label && <span style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: 1 }}>{label}</span>}
    </div>
  )
}

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="page-with-nav">
      <Nav />

      <div className="page-hero">
        <div className="container-lg page-hero-content">
          <div className="page-hero-eyebrow">Our Story</div>
          <h1 className="page-hero-title">About Us</h1>
          <p className="page-hero-sub">A passion for barbering, rooted in Luton.</p>
        </div>
      </div>

      {/* Main about section */}
      <section className="mkt-section" style={{ background: 'var(--black)' }}>
        <div className="container-lg">
          <div className="about-split">
            {/* TO REPLACE: Add /public/images/nawazish-about.jpg */}
            <div className="about-img-wrap">
              <ImgPh label="Nawazish at Work" style={{ height: 480, borderRadius: 'var(--radius-lg)' }} />
            </div>
            <div>
              <div className="about-text-eyebrow">The Barber</div>
              <h2 className="about-text-heading">Nawazish</h2>
              <p className="about-text-body">
                Barbering isn't just a job — it's a craft. From the moment you sit in the chair, the focus is entirely on you: your style, your face, your look. Every cut is a conversation, and every finish is something to be proud of.
              </p>
              <p className="about-text-body">
                Based in Luton, Nawazish has been shaping the local community's style for years, building a loyal clientele through consistent quality, attention to detail, and a welcoming, relaxed atmosphere.
              </p>
              <p className="about-text-body">
                Whether you're after a classic fade, a sharp taper, a full beard shape, or a kids' cut — you're in expert hands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop photos */}
      <section className="mkt-section mkt-section-dark">
        <div className="container-lg">
          <div className="section-eyebrow" style={{ marginBottom: 8 }}>The Space</div>
          <h2 className="section-heading" style={{ marginBottom: 24 }}>The Shop</h2>
          {/* TO REPLACE: /public/images/shop-1.jpg, shop-2.jpg, shop-3.jpg */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <ImgPh label="Shop Interior" style={{ height: 280, borderRadius: 'var(--radius)' }} />
            <div style={{ display: 'grid', gap: 10 }}>
              <ImgPh label="Barber Chair" style={{ height: 135, borderRadius: 'var(--radius)' }} />
              <ImgPh label="Shop Front" style={{ height: 135, borderRadius: 'var(--radius)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mkt-section" style={{ background: 'var(--black)' }}>
        <div className="container-lg">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-eyebrow">Why Choose Us</div>
            <h2 className="section-heading">What We Stand For</h2>
          </div>
          <div className="values-grid">
            {[
              { icon: '✂️', title: 'Precision First', body: 'No rushed cuts. Every line is clean, every fade is smooth, every finish is sharp.' },
              { icon: '🤝', title: 'Client Focused', body: 'Your comfort and satisfaction comes first — always. We listen before we cut.' },
              { icon: '📱', title: 'Easy Booking', body: 'No phone calls needed. Book, manage, or cancel your appointment online 24/7.' },
              { icon: '💈', title: 'Barber Heritage', body: 'We honour the tradition of great barbering while bringing a modern touch to every style.' },
            ].map(v => (
              <div key={v.title} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <div className="value-title">{v.title}</div>
                <div className="value-body">{v.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container-lg cta-banner-content">
          <h2 className="cta-banner-title">Come see us</h2>
          <p className="cta-banner-sub">Book your appointment online and we'll take care of the rest.</p>
          <button className="btn-cta-white" onClick={() => navigate('/book')}>Book Now →</button>
        </div>
      </section>

      <Footer />
    </div>
  )
}