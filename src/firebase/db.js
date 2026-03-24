import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp, setDoc
} from 'firebase/firestore'
import { db } from './config'

// ─── Booking helpers ────────────────────────────────────────

export const generateBookingNumber = () => {
  const prefix = 'LB'
  const num = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}${num}`
}

export const createBooking = async (bookingData) => {
  const bookingNumber = generateBookingNumber()
  const ref = await addDoc(collection(db, 'bookings'), {
    ...bookingData,
    bookingNumber,
    status: 'confirmed',
    createdAt: Timestamp.now()
  })
  return { id: ref.id, bookingNumber }
}

export const getBookingByNumberAndName = async (bookingNumber, name) => {
  const q = query(
    collection(db, 'bookings'),
    where('bookingNumber', '==', bookingNumber.toUpperCase()),
    where('nameLower', '==', name.toLowerCase())
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export const updateBooking = async (id, updates) => {
  await updateDoc(doc(db, 'bookings', id), {
    ...updates,
    updatedAt: Timestamp.now()
  })
}

export const cancelBooking = async (id) => {
  await updateDoc(doc(db, 'bookings', id), {
    status: 'cancelled',
    cancelledAt: Timestamp.now()
  })
}

export const getAllBookings = async () => {
  const q = query(collection(db, 'bookings'), orderBy('date', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getBookingsByDate = async (dateStr) => {
  const q = query(collection(db, 'bookings'), where('date', '==', dateStr))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── Availability helpers ─────────────────────────────────────

export const getAvailability = async () => {
  const snap = await getDoc(doc(db, 'settings', 'availability'))
  const data = snap.exists() ? snap.data() : getDefaultAvailability()
  return normalizeAvailability(data)
}

export const saveAvailability = async (data) => {
  await setDoc(doc(db, 'settings', 'availability'), data)
}

export const getDefaultAvailability = () => ({
  slotDuration: 30,
  days: {
    0: { enabled: true,  openTime: '10:00', closeTime: '18:00' },
    1: { enabled: true,  openTime: '09:00', closeTime: '19:00' },
    2: { enabled: true,  openTime: '09:00', closeTime: '19:00' },
    3: { enabled: true,  openTime: '09:00', closeTime: '19:00' },
    4: { enabled: true,  openTime: '09:00', closeTime: '19:00' },
    5: { enabled: true,  openTime: '09:00', closeTime: '19:00' },
    6: { enabled: true,  openTime: '09:00', closeTime: '18:00' },
  },
  blockedDates: [],
  blockedSlots: {}
})

// Migrates old { days: { 0: true/false }, openTime, closeTime } to per-day format
export const normalizeAvailability = (avail) => {
  if (!avail) return getDefaultAvailability()
  const dayValues = Object.values(avail.days || {})
  const isNewFormat = dayValues.length > 0 && typeof dayValues[0] === 'object'
  if (isNewFormat) return avail

  const globalOpen  = avail.openTime  || '09:00'
  const globalClose = avail.closeTime || '19:00'
  const days = {}
  for (let i = 0; i < 7; i++) {
    days[i] = {
      enabled:   avail.days?.[i] !== false,
      openTime:  globalOpen,
      closeTime: globalClose
    }
  }
  return { slotDuration: avail.slotDuration || 30, days, blockedDates: avail.blockedDates || [], blockedSlots: avail.blockedSlots || {} }
}

// ─── Services helpers ────────────────────────────────────────

export const getServices = async () => {
  const snap = await getDoc(doc(db, 'settings', 'services'))
  if (!snap.exists()) return getDefaultServices()
  return snap.data().list
}

export const saveServices = async (list) => {
  await setDoc(doc(db, 'settings', 'services'), { list })
}

export const getDefaultServices = () => [
  { id: 'haircut',    name: 'Haircut',        price: 15, duration: 30, emoji: '✂️' },
  { id: 'beard',      name: 'Beard',          price: 10, duration: 20, emoji: '🧔' },
  { id: 'hairbeard',  name: 'Hair & Beard',   price: 20, duration: 45, emoji: '💈' },
  { id: 'kids',       name: 'Kids Cut',       price: 12, duration: 30, emoji: '👦' }
]

// ─── FCM Token storage ────────────────────────────────────────

export const saveFCMToken = async (token) => {
  await setDoc(doc(db, 'settings', 'fcmToken'), { token, updatedAt: Timestamp.now() })
}

export const getFCMToken = async () => {
  const snap = await getDoc(doc(db, 'settings', 'fcmToken'))
  return snap.exists() ? snap.data().token : null
}
