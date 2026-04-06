import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpg'

export default function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-pole-stripe" />
      <div className="footer-main">
        <div className="container-lg">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <img src={logo} alt="Local Barbers" className="footer-logo" />
              <div className="footer-brand-name">Local Barbers Luton</div>
              <div className="footer-tagline">Classic cuts, modern style.</div>
            </div>

            {/* Navigate */}
            <div>
              <div className="footer-col-title">Explore</div>
              {['Services', 'Gallery', 'About', 'Contact'].map(p => (
                <button key={p} className="footer-link" onClick={() => navigate('/' + p.toLowerCase())}>{p}</button>
              ))}
            </div>

            {/* Booking */}
            <div>
              <div className="footer-col-title">Booking</div>
              <button className="footer-link" onClick={() => navigate('/book')}>Book Appointment</button>
              <button className="footer-link" onClick={() => navigate('/manage')}>Manage Booking</button>
            </div>

            {/* Info */}
            <div>
              <div className="footer-col-title">Find Us</div>
              <div className="footer-info">
                📍 Luton, Bedfordshire<br />
                💈 Online booking only<br />
                ✂️ Walk-ins welcome
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div>© {year} Local Barbers Luton. All rights reserved.</div>
            <button
              className="footer-link"
              style={{ width: 'auto', fontSize: 11, opacity: 0.5 }}
              onClick={() => navigate('/barber/login')}
            >
              Barber Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}