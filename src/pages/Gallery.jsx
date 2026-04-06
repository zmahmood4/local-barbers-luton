import Nav from '../components/Nav'
import Footer from '../components/Footer'

// TO REPLACE: Swap ImgPh components with real <img> tags
// Put images in /public/images/ and reference as src="/images/gallery-1.jpg" etc.
function ImgPh({ label }) {
  return (
    <div className="img-ph" style={{ width: '100%', height: '100%' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      {label && <span style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: 1 }}>{label}</span>}
    </div>
  )
}

const PHOTOS = [
  { label: 'Skin Fade', cat: 'Cuts' },
  { label: 'Classic Taper', cat: 'Cuts' },
  { label: 'Scissor Cut', cat: 'Cuts' },
  { label: 'High Fade', cat: 'Cuts' },
  { label: 'Beard Shaping', cat: 'Beards' },
  { label: 'Beard Fade', cat: 'Beards' },
  { label: 'Full Beard', cat: 'Beards' },
  { label: 'Stubble Trim', cat: 'Beards' },
  { label: 'Hair & Beard', cat: 'Combos' },
  { label: 'The Full Look', cat: 'Combos' },
  { label: 'Kids Cut', cat: 'Kids' },
  { label: 'The Shop', cat: 'Shop' },
]

export default function Gallery() {
  return (
    <div className="page-with-nav">
      <Nav />

      <div className="page-hero">
        <div className="container-lg page-hero-content">
          <div className="page-hero-eyebrow">Our Work</div>
          <h1 className="page-hero-title">The Gallery</h1>
          <p className="page-hero-sub">Every cut tells a story. Browse our latest work below.</p>
        </div>
      </div>

      <section className="mkt-section" style={{ background: 'var(--black)', flex: 1 }}>
        <div className="container-lg">
          {/* TO REPLACE: Replace each ImgPh with <img src="/images/gallery-N.jpg" alt="..." /> */}
          <div className="gallery-page-grid">
            {PHOTOS.map((p, i) => (
              <div key={i} className="gallery-pg-item">
                <ImgPh label={p.label} />
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            Follow us on Instagram for the latest cuts and styles.<br />
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--blue-light)', fontWeight: 600, textDecoration: 'none' }}
            >
              @localbarbersluton
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}