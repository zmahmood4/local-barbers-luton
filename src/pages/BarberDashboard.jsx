import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
import {
  getAllBookings, getAvailability, saveAvailability,
  getServices, saveServices, cancelBooking
} from '../firebase/db'
import { formatDate, formatTime, getDayName } from '../utils/slots'
import logo from '../assets/logo.jpg'

const TABS = ['Today', 'Upcoming', 'All', 'Availability', 'Services']

export default function BarberDashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [tab, setTab] = useState('Today')
  const [bookings, setBookings] = useState([])
  const [avail, setAvail] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    const [b, a, s] = await Promise.all([getAllBookings(), getAvailability(), getServices()])
    setBookings(b)
    setAvail(a)
    setServices(s)
    setLoading(false)
  }

  const handleLogout = () => { logout(); navigate('/') }

  const todayBookings = bookings.filter(b =>
    b.date === format(new Date(), 'yyyy-MM-dd') && b.status !== 'cancelled'
  )
  const upcomingBookings = bookings.filter(b => {
    const d = new Date(b.date + 'T00:00:00')
    return !isToday(d) && !isPast(d) && b.status !== 'cancelled'
  })

  const getFilteredBookings = () => {
    if (tab === 'Today') return todayBookings
    if (tab === 'Upcoming') return upcomingBookings
    return bookings
  }

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    await cancelBooking(id)
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    toast.success('Booking cancelled')
  }

  const saveAvailabilityChanges = async () => {
    setSaving(true)
    try { await saveAvailability(avail); toast.success('Availability saved!') }
    catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const saveServicesChanges = async () => {
    setSaving(true)
    try { await saveServices(services); toast.success('Services saved!') }
    catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const updateService = (id, field, value) => {
    setServices(ss => ss.map(s => s.id === id
      ? { ...s, [field]: (field === 'price' || field === 'duration') ? Number(value) : value }
      : s
    ))
  }

  const toggleDay = (dayIndex) => {
    setAvail(a => ({
      ...a,
      days: { ...a.days, [dayIndex]: { ...a.days[dayIndex], enabled: !a.days[dayIndex].enabled } }
    }))
  }

  const updateDayHours = (dayIndex, field, value) => {
    setAvail(a => ({
      ...a,
      days: { ...a.days, [dayIndex]: { ...a.days[dayIndex], [field]: value } }
    }))
  }


  return (
    <div className="page pb-safe">
      {/* Header */}
      <div className="header">
        <img src={logo} alt="" className="header-logo" />
        <div>
          <div className="header-title">Dashboard</div>
          <div className="header-sub">Welcome, Nawazish</div>
        </div>
        <button className="header-back" onClick={handleLogout}>Logout</button>
      </div>

      {/* Stats */}
      <div style={{ background: 'var(--dark)', borderBottom: '1px solid var(--border)', padding: '12px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', gap: 20 }}>
          <Stat label="Today" value={todayBookings.length} />
          <Stat label="Upcoming" value={upcomingBookings.length} />
          <Stat label="Total" value={bookings.filter(b => b.status !== 'cancelled').length} />
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        {/* Pill nav */}
        <div className="pill-nav">
          {TABS.map(t => (
            <button key={t} className={`pill ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><span>Loading…</span></div>
        ) : (
          <>
            {/* ── BOOKING TABS ── */}
            {['Today', 'Upcoming', 'All'].includes(tab) && (
              <div className="fade-up">
                {getFilteredBookings().length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">📅</div>
                    <div className="empty-title">No bookings</div>
                    <div className="empty-sub">{tab === 'Today' ? 'No appointments today.' : 'No upcoming bookings.'}</div>
                  </div>
                ) : (
                  getFilteredBookings()
                    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                    .map(booking => (
                      <DashboardBookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={() => handleCancelBooking(booking.id)}
                      />
                    ))
                )}
              </div>
            )}

            {/* ── AVAILABILITY ── */}
            {tab === 'Availability' && avail && (
              <div className="fade-up">
                <div className="card">
                  <div className="card-title">Appointment slots</div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Slot duration</label>
                    <select className="form-input" value={avail.slotDuration}
                      onChange={e => setAvail(a => ({ ...a, slotDuration: Number(e.target.value) }))}>
                      {[15, 20, 25, 30, 45, 60].map(d => <option key={d} value={d}>{d} min slots</option>)}
                    </select>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Weekly schedule</div>
                  {[1,2,3,4,5,6,0].map(day => {
                    const cfg = avail.days[day] || { enabled: false, openTime: '09:00', closeTime: '19:00' }
                    return (
                      <div key={day} className="day-row">
                        <div className="day-row-header">
                          <span className="day-name">{getDayName(day)}</span>
                          <div className={`toggle ${cfg.enabled ? 'on' : ''}`} onClick={() => toggleDay(day)} />
                        </div>
                        {cfg.enabled ? (
                          <div className="day-hours">
                            <input type="time" className="form-input" style={{ flex: 1, padding: '10px 10px', fontSize: 14 }}
                              value={cfg.openTime}
                              onChange={e => updateDayHours(day, 'openTime', e.target.value)} />
                            <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>to</span>
                            <input type="time" className="form-input" style={{ flex: 1, padding: '10px 10px', fontSize: 14 }}
                              value={cfg.closeTime}
                              onChange={e => updateDayHours(day, 'closeTime', e.target.value)} />
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, fontWeight: 500 }}>Closed</div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button className="btn btn-primary" disabled={saving} onClick={saveAvailabilityChanges}>
                  {saving ? 'Saving…' : 'Save Schedule'}
                </button>
              </div>
            )}

            {/* ── SERVICES ── */}
            {tab === 'Services' && (
              <div className="fade-up">
                {services.map(s => (
                  <div key={s.id} className="card" style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <span style={{ fontSize: 24 }}>{s.emoji}</span>
                      <div className="card-title" style={{ margin: 0 }}>{s.name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="form-label">Price (£)</label>
                        <input type="number" className="form-input" value={s.price} min="1"
                          onChange={e => updateService(s.id, 'price', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="form-label">Duration (min)</label>
                        <input type="number" className="form-input" value={s.duration} min="10" step="5"
                          onChange={e => updateService(s.id, 'duration', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-primary" disabled={saving} onClick={saveServicesChanges} style={{ marginTop: 8 }}>
                  {saving ? 'Saving…' : 'Save Services'}
                </button>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue-light)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{label}</div>
    </div>
  )
}

function DashboardBookingCard({ booking, onCancel }) {
  const [open, setOpen] = useState(false)
  const isTodayBooking = booking.date === format(new Date(), 'yyyy-MM-dd')
  const isTomorrowBooking = isTomorrow(new Date(booking.date + 'T00:00:00'))

  return (
    <div className={`booking-item ${booking.status === 'cancelled' ? 'cancelled' : ''}`} onClick={() => setOpen(o => !o)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="booking-num">{booking.bookingNumber}</div>
          <div className="booking-name">{booking.name}</div>
          <div className="booking-meta">{formatTime(booking.time)} · {booking.phone}</div>
        </div>
        <span className={`booking-status-badge ${booking.status === 'cancelled' ? 'status-cancelled' : 'status-confirmed'}`}>
          {booking.status === 'cancelled' ? 'Cancelled' : isTodayBooking ? 'Today' : isTomorrowBooking ? 'Tomorrow' : booking.date}
        </span>
      </div>
      <div className="booking-service">
        <span className="booking-service-badge">{booking.serviceName}</span>
        <span style={{ fontSize: 12, color: 'var(--blue-light)', marginLeft: 4, fontWeight: 700 }}>£{booking.servicePrice}</span>
      </div>
      {open && booking.status !== 'cancelled' && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>📅 {formatDate(booking.date)}</div>
          {booking.email && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>✉️ {booking.email}</div>}
          <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); onCancel() }}>
            Cancel booking
          </button>
        </div>
      )}
    </div>
  )
}
