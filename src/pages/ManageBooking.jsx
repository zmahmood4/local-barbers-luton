import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'
import {
  getBookingByNumberAndName, updateBooking, cancelBooking,
  getAvailability, getBookingsByDate, getServices
} from '../firebase/db'
import { generateSlots, formatDate, formatTime } from '../utils/slots'
import { sendEmailNotification } from '../utils/notifications'
import logo from '../assets/logo.jpg'

export default function ManageBooking() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('lookup') // lookup | view | edit | cancel-confirm
  const [bookingNum, setBookingNum] = useState('')
  const [clientName, setClientName] = useState('')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)

  // Edit state
  const [avail, setAvail] = useState(null)
  const [services, setServices] = useState([])
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  useEffect(() => {
    getAvailability().then(setAvail)
    getServices().then(setServices)
  }, [])

  // Load slots when editing and date changes
  useEffect(() => {
    if (mode !== 'edit' || !newDate || !avail) return
    setSlotsLoading(true)
    getBookingsByDate(newDate).then(bookings => {
      const others = bookings.filter(b => b.id !== booking.id)
      const dayOfWeek = new Date(newDate + 'T00:00:00').getDay()
      const dayConfig = avail.days?.[dayOfWeek]
      const openTime  = dayConfig?.openTime  || '09:00'
      const closeTime = dayConfig?.closeTime || '19:00'
      const blockedForDate = (avail.blockedSlots || {})[newDate] || []
      const generated = generateSlots(openTime, closeTime, avail.slotDuration || 30, others, blockedForDate, newDate)
      setSlots(generated)
      setSlotsLoading(false)
    })
  }, [newDate, avail, mode])

  const handleLookup = async () => {
    if (!bookingNum.trim() || !clientName.trim()) return
    setLoading(true)
    try {
      const found = await getBookingByNumberAndName(bookingNum.trim(), clientName.trim())
      if (!found) {
        toast.error('No booking found. Please check your booking number and name.')
      } else {
        setBooking(found)
        setMode('view')
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = () => {
    setNewDate(booking.date)
    setNewTime(booking.time)
    setMode('edit')
  }

  const handleEdit = async () => {
    if (!newDate || !newTime) return
    setLoading(true)
    try {
      await updateBooking(booking.id, { date: newDate, time: newTime })
      const updated = { ...booking, date: newDate, time: newTime }
      setBooking(updated)
      sendEmailNotification({ type: 'edit', booking: updated }).catch(() => {})
      toast.success('Booking updated!')
      setMode('view')
    } catch {
      toast.error('Failed to update. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    try {
      await cancelBooking(booking.id)
      setBooking(b => ({ ...b, status: 'cancelled' }))
      sendEmailNotification({ type: 'cancel', booking }).catch(() => {})
      toast.success('Booking cancelled.')
      setMode('view')
    } catch {
      toast.error('Failed to cancel. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getDates = () => {
    if (!avail) return []
    const dates = []
    const today = new Date()
    for (let i = 0; i < 45 && dates.length < 30; i++) {
      const d = addDays(today, i)
      const dow = d.getDay()
      if (avail.days?.[dow]?.enabled !== false) {
        const str = format(d, 'yyyy-MM-dd')
        if (!(avail.blockedDates || []).includes(str)) dates.push(str)
      }
    }
    return dates
  }

  return (
    <div className="page pb-safe">
      <div className="header">
        <img src={logo} alt="" className="header-logo" />
        <div>
          <div className="header-title">Local Barbers</div>
          <div className="header-sub">Manage Booking</div>
        </div>
        <button className="header-back" onClick={() => mode === 'lookup' ? navigate('/') : setMode('view')}>
          ← {mode === 'lookup' ? 'Home' : 'Back'}
        </button>
      </div>

      <div className="container" style={{ paddingTop: 28 }}>

        {/* LOOKUP */}
        {mode === 'lookup' && (
          <div className="fade-up">
            <div className="section-title" style={{ marginBottom: 4 }}>Find your booking</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
              Enter your booking number and name to view or manage your appointment.
            </div>
            <div className="form-group">
              <label className="form-label">Booking number</label>
              <input
                className="form-input"
                placeholder="e.g. LB12345"
                value={bookingNum}
                onChange={e => setBookingNum(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', letterSpacing: 2 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Your name</label>
              <input
                className="form-input"
                placeholder="Name used when booking"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              disabled={!bookingNum.trim() || !clientName.trim() || loading}
              onClick={handleLookup}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Searching…' : 'Find Booking'}
            </button>
          </div>
        )}

        {/* VIEW */}
        {mode === 'view' && booking && (
          <div className="fade-up">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 1 }}>Booking</div>
              <div className="confirm-booking-num" style={{ fontSize: 28, margin: '6px 0' }}>
                {booking.bookingNumber}
              </div>
              <span className={`booking-status-badge ${booking.status === 'cancelled' ? 'status-cancelled' : 'status-confirmed'}`}>
                {booking.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
              </span>
            </div>

            <div className="summary">
              <div className="summary-row">
                <span className="summary-label">Service</span>
                <span className="summary-value">{booking.serviceName}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Date</span>
                <span className="summary-value">{formatDate(booking.date)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Time</span>
                <span className="summary-value">{formatTime(booking.time)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Name</span>
                <span className="summary-value">{booking.name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Phone</span>
                <span className="summary-value">{booking.phone}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Price</span>
                <span className="summary-value gold">£{booking.servicePrice}</span>
              </div>
            </div>

            {booking.status !== 'cancelled' && (
              <>
                <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={startEdit}>
                  ✏️ Reschedule
                </button>
                <button
                  className="btn btn-danger"
                  style={{ marginTop: 10 }}
                  onClick={() => setMode('cancel-confirm')}
                >
                  Cancel Booking
                </button>
              </>
            )}

            {booking.status === 'cancelled' && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/book')}>
                Book a New Appointment
              </button>
            )}

            <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={() => { setMode('lookup'); setBooking(null); }}>
              Look up a different booking
            </button>
          </div>
        )}

        {/* EDIT */}
        {mode === 'edit' && (
          <div className="fade-up">
            <div className="section-title" style={{ marginBottom: 4 }}>Reschedule</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              Choose a new date and time for your appointment.
            </div>

            <div className="section-title" style={{ marginBottom: 12 }}>New date</div>
            <div className="date-scroll" style={{ marginBottom: 24 }}>
              {getDates().map(dateStr => {
                const d = new Date(dateStr + 'T00:00:00')
                const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
                return (
                  <div
                    key={dateStr}
                    className={`date-chip ${newDate === dateStr ? 'selected' : ''}`}
                    onClick={() => { setNewDate(dateStr); setNewTime('') }}
                  >
                    <div className="date-chip-day">{isToday ? 'Today' : format(d, 'EEE')}</div>
                    <div className="date-chip-num">{format(d, 'd')}</div>
                    <div className="date-chip-mon">{format(d, 'MMM')}</div>
                  </div>
                )
              })}
            </div>

            {newDate && (
              <>
                <div className="section-title" style={{ marginBottom: 12 }}>New time</div>
                {slotsLoading ? (
                  <div className="loading"><div className="spinner" /></div>
                ) : (
                  <div className="slots-grid">
                    {slots.map(slot => (
                      <div
                        key={slot.time}
                        className={`slot ${!slot.available ? 'slot-taken' : ''} ${newTime === slot.time ? 'selected' : ''}`}
                        onClick={() => slot.available && setNewTime(slot.time)}
                      >
                        {formatTime(slot.time)}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div style={{ marginTop: 24 }}>
              <button
                className="btn btn-primary"
                disabled={!newDate || !newTime || loading}
                onClick={handleEdit}
              >
                {loading ? 'Saving…' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        )}

        {/* CANCEL CONFIRM */}
        {mode === 'cancel-confirm' && (
          <div className="fade-up" style={{ textAlign: 'center', paddingTop: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Cancel booking?</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.6 }}>
              Are you sure you want to cancel your {booking?.serviceName} appointment on {formatDate(booking?.date)} at {formatTime(booking?.time)}?
            </div>
            <button className="btn btn-danger" disabled={loading} onClick={handleCancel}>
              {loading ? 'Cancelling…' : 'Yes, cancel my booking'}
            </button>
            <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={() => setMode('view')}>
              Keep my booking
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
