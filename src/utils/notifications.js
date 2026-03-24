// Sends email via Netlify serverless function → Resend
// Notifies both the barber and the client (if booking.email is set) in one call.

export const sendEmailNotification = async ({ type, booking }) => {
  try {
    const res = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, booking })
    })
    if (!res.ok) {
      console.error('Email notification failed:', await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('Email notification error:', err)
    return false
  }
}

// Aliases kept so existing call sites don't need changing
export const sendBarberNotification = ({ type, booking }) =>
  sendEmailNotification({ type, booking })

export const sendClientConfirmation = (booking) =>
  sendEmailNotification({ type: 'new', booking })