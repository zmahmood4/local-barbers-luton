import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.jpg'

const LINKS = [
  { label: 'Home',     path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Gallery',  path: '/gallery' },
  { label: 'About',    path: '/about' },
  { label: 'Contact',  path: '/contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { setOpen(false) }, [location.pathname])

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const go = (path) => { navigate(path); setOpen(false) }

  return (
    <>
      <nav className="site-nav">
        <div className="nav-inner container-lg">
          <div className="nav-brand" onClick={() => go('/')}>
            <img src={logo} alt="Local Barbers" className="nav-logo-img" />
            <div>
              <div className="nav-brand-name">Local Barbers</div>
              <div className="nav-brand-sub">Luton</div>
            </div>
          </div>

          <div className="nav-links">
            {LINKS.map(l => (
              <button
                key={l.path}
                className={`nav-link ${location.pathname === l.path ? 'active' : ''}`}
                onClick={() => go(l.path)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="nav-actions">
            <button className="btn-nav-cta" onClick={() => go('/book')}>Book Now</button>
            <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
              <span className={`ham-line ${open ? 'open' : ''}`} />
              <span className={`ham-line ${open ? 'open' : ''}`} />
              <span className={`ham-line ${open ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <>
          <div className="nav-overlay" onClick={() => setOpen(false)} />
          <div className="nav-drawer">
            {LINKS.map(l => (
              <button
                key={l.path}
                className={`nav-drawer-link ${location.pathname === l.path ? 'active' : ''}`}
                onClick={() => go(l.path)}
              >
                {l.label}
              </button>
            ))}
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => go('/book')}>
              Book Appointment
            </button>
          </div>
        </>
      )}
    </>
  )
}