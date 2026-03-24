import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'
import {
  getServices, getAvailability, getBookingsByDate, createBooking
} from '../firebase/db'
import { generateSlots, formatDate, formatTime } from '../utils/slots'
import { sendEmailNotification } from '../utils/notifications'
import logo from '../assets/logo.jpg'

const STEPS = ['Service', 'Date & Time', 'Details', 'Confirm']

export default function BookingFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const preselected = location.state?.service

  const [step, setStep] = useState(preselected ? 1 : 0)
  const [services, setServices] = useState([])
  const [avail, setAvail] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)

  const [sel, setSel] = useState({
    service: preselected || null,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: null,
    name: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    getServices().then(setServices)
    getAvailability().then(setAvail)
  }, [])

  // Reload slots when date changes
  useEffect(() => {
    if (!sel.date || !avail) return
    setLoading(true)
    getBookingsByDate(sel.date).then(bookings => {
      setBookedSlots(bookings)
      const dayOfWeek = new Date(sel.date + 'T00:00:00').getDay()
      const dayConfig = avail.days[dayOfWeek]
      const dayOpen = dayConfig?.enabled !== false
      if (!dayOpen) {
        setSlots([])
      } else {
        const openTime  = dayConfig?.openTime  || '09:00'
        const closeTime = dayConfig?.closeTime || '19:00'
        const blockedForDate = (avail.blockedSlots || {})[sel.date] || []
        setSlots(generateSlots(openTime, closeTime, avail.slotDuration || 30, bookings, blockedForDate, sel.date))
      }
      setLoading(false)
    })
  }, [sel.date, avail])

  const getDates = () => {
    if (!avail) return []
    const dates = []
    const today = new Date()
    for (let i = 0; i < 45 && dates.length < 30; i++) {
      const d = addDays(today, i)
      const dow = d.getDay()
      const dayConfig = avail.days[dow]
      if (dayConfig?.enabled !== false) {
        const str = format(d, 'yyyy-MM-dd')
        if (!(avail.blockedDates || []).includes(str)) dates.push(str)
      }
    }
    return dates
  }

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => step > 0 ? setStep(s => s - 1) : navigate(-1)

  const canNext = () => {
    if (step === 0) return !!sel.service
    if (step === 1) return !!sel.date && !!sel.time
    if (step === 2) return (
      sel.name.trim().length >= 2 &&
      sel.phone.trim().length >= 10 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sel.email.trim())
    )
    return false
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const bookingData = {
        serviceId:    sel.service.id,
        serviceName:  sel.service.name,
        servicePrice: sel.service.price,
        date:         sel.date,
        time:         sel.time,
        name:         sel.name.trim(),
        nameLower:    sel.name.trim().toLowerCase(),
        phone:        sel.phone.trim(),
        email:        sel.email.trim()
      }
      const { bookingNumber } = await createBooking(bookingData)
      const fullBooking = { ...bookingData, bookingNumber }
      setBookingResult(bookingNumber)
      sendEmailNotification({ type: 'new', booking: fullBooking }).catch(() => {})
      setStep(STEPS.length)
      toast.success('Booking confirmed!')
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Confirmation screen
  if (step >= STEPS.length) {
    return (
      <div className="page pb-safe">
        <PageHeader title="Confirmed" onBack={() => navigate('/')} />
        <div className="container">
          <div className="confirm-screen pop">
            <div className="confirm-icon">✓</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Booking Number</div>
            <div className="confirm-booking-num">{bookingResult}</div>
            <div className="confirm-instruction">
              Save this number — you'll need it to manage your booking.
            </div>

            <div className="summary" style={{ textAlign: 'left', marginTop: 28 }}>
              <div className="summary-row">
                <span className="summary-label">Service</span>
                <span className="summary-value">{sel.service?.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date</span>
                <span className="summary-value">{formatDate(sel.date)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Time</span>
                <span className="summary-value">{formatTime(sel.time)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Price</span>
                <span className="summary-value blue">£{sel.service?.price}</span>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
              A confirmation has been sent to {sel.email}
            </div>

            <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
            <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={() => navigate('/manage')}>
              Manage This Booking
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page pb-safe">
      <PageHeader title={STEPS[step]} onBack={back} />

      <div className="container" style={{ padding: '16px 16px 0' }}>
        <div className="steps">
          {STEPS.map((_, i) => (
            <div key={i} className={`step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      <div className="container" style={{ flex: 1, paddingTop: 4, paddingBottom: 0 }}>

        {/* ── Step 0: Service ── */}
        {step === 0 && (
          <div className="fade-up">
            <div className="section-title" style={{ marginBottom: 14 }}>Choose a service</div>
            <div className="service-grid">
              {services.map(s => (
                <div
                  key={s.id}
                  className={`service-card ${sel.service?.id === s.id ? 'selected' : ''}`}
                  onClick={() => setSel(p => ({ ...p, service: s }))}
                >
                  <div className="service-emoji">{s.emoji}</div>
                  <div className="service-name">{s.name}</div>
                  <div className="service-duration">{s.duration} min</div>
                  <div className="service-price">£{s.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Date & Time (combined) ── */}
        {step === 1 && (
          <div className="fade-up">
            <div className="section-title" style={{ marginBottom: 12 }}>Select a date</div>
            {!avail ? (
              <div className="loading"><div className="spinner" /></div>
            ) : (
              <div className="date-scroll">
                {getDates().map(dateStr => {
                  const d = new Date(dateStr + 'T00:00:00')
                  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
                  return (
                    <div
                      key={dateStr}
                      className={`date-chip ${sel.date === dateStr ? 'selected' : ''} ${isToday ? 'today-chip' : ''}`}
                      onClick={() => setSel(p => ({ ...p, date: dateStr, time: null }))}
                    >
                      <div className="date-chip-day">{isToday ? 'Today' : format(d, 'EEE')}</div>
                      <div className="date-chip-num">{format(d, 'd')}</div>
                      <div className="date-chip-mon">{format(d, 'MMM')}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {sel.date && (
              <div style={{ marginTop: 20 }} className="fade-up">
                <div className="section-title" style={{ marginBottom: 12 }}>
                  Available times
                  <span style={{ color: 'var(--muted-light)', marginLeft: 6, textTransform: 'none', letterSpacing: 0, fontSize: 11, fontWeight: 500 }}>
                    {format(new Date(sel.date + 'T00:00:00'), 'EEE d MMM')}
                  </span>
                </div>
                {loading ? (
                  <div className="loading" style={{ padding: '24px 0' }}><div className="spinner" /></div>
                ) : slots.length === 0 ? (
                  <div className="empty" style={{ padding: '20px 0' }}>
                    <div className="empty-icon">🚫</div>
                    <div className="empty-title">No slots available</div>
                    <div className="empty-sub">Closed or fully booked — pick another date above.</div>
                  </div>
                ) : (
                  <div className="slots-grid">
                    {slots.map(slot => (
                      <div
                        key={slot.time}
                        className={`slot ${!slot.available ? 'slot-taken' : ''} ${sel.time === slot.time ? 'selected' : ''}`}
                        onClick={() => slot.available && setSel(p => ({ ...p, time: slot.time }))}
                      >
                        {formatTime(slot.time)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Details ── */}
        {step === 2 && (
          <div className="fade-up">
            <div className="section-title" style={{ marginBottom: 16 }}>Your details</div>
            <div className="form-group">
              <label className="form-label">Full name *</label>
              <input
                className="form-input"
                placeholder="e.g. Ahmed Khan"
                value={sel.name}
                onChange={e => setSel(p => ({ ...p, name: e.target.value }))}
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone number *</label>
              <input
                className="form-input"
                type="tel"
                placeholder="07700 900000"
                value={sel.phone}
                onChange={e => setSel(p => ({ ...p, phone: e.target.value }))}
                autoComplete="tel"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email address *</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={sel.email}
                onChange={e => setSel(p => ({ ...p, email: e.target.value }))}
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (
          <div className="fade-up">
            <div className="section-title" style={{ marginBottom: 16 }}>Review & confirm</div>
            <div className="summary">
              <div className="summary-row">
                <span className="summary-label">Service</span>
                <span className="summary-value">{sel.service?.emoji} {sel.service?.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date</span>
                <span className="summary-value">{formatDate(sel.date)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Time</span>
                <span className="summary-value">{formatTime(sel.time)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Name</span>
                <span className="summary-value">{sel.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Phone</span>
                <span className="summary-value">{sel.phone}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Email</span>
                <span className="summary-value" style={{ fontSize: 13 }}>{sel.email}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Price</span>
                <span className="summary-value blue">£{sel.service?.price}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, lineHeight: 1.7 }}>
              By confirming you agree to attend your appointment. Use your booking number to reschedule or cancel.
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="container" style={{ padding: '12px 16px 20px' }}>
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" disabled={!canNext()} onClick={next}>
            Continue
          </button>
        ) : (
          <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
            {submitting ? 'Confirming…' : 'Confirm Booking'}
          </button>
        )}
      </div>
    </div>
  )
}

function PageHeader({ title, onBack }) {
  return (
    <div className="header">
      <img src={logo} alt="" className="header-logo" />
      <div>
        <div className="header-title">Local Barbers</div>
        <div className="header-sub">{title}</div>
      </div>
      <button className="header-back" onClick={onBack}>← Back</button>
    </div>
  )
}