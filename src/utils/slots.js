import { format, parse, addMinutes, isBefore, isAfter, startOfDay } from 'date-fns'

export const generateSlots = (openTime, closeTime, slotDuration, bookedSlots = [], blockedSlots = [], selectedDate = null) => {
  const slots = []
  const base = new Date()
  let current = parse(openTime, 'HH:mm', base)
  const end = parse(closeTime, 'HH:mm', base)

  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const isToday = selectedDate === todayStr

  while (isBefore(current, end)) {
    const timeStr = format(current, 'HH:mm')

    // Skip past slots when viewing today
    if (isToday) {
      const slotTime = parse(timeStr, 'HH:mm', new Date())
      if (!isAfter(slotTime, now)) {
        current = addMinutes(current, slotDuration)
        continue
      }
    }

    const isBooked  = bookedSlots.some(b => b.time === timeStr && b.status !== 'cancelled')
    const isBlocked = blockedSlots.includes(timeStr)
    slots.push({ time: timeStr, available: !isBooked && !isBlocked })
    current = addMinutes(current, slotDuration)
  }
  return slots
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return format(d, 'EEEE, d MMMM yyyy')
}

export const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${display}:${m}${ampm}`
}

export const getDayName = (dayIndex) =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex]

export const isDateInPast = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00')
  return isBefore(d, startOfDay(new Date()))
}

export const getTodayString = () => format(new Date(), 'yyyy-MM-dd')