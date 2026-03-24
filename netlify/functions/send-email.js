const { Resend } = require('resend')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const BARBER_EMAIL   = process.env.BARBER_EMAIL
  const FROM_EMAIL     = process.env.FROM_EMAIL || 'noreply@localbarbersluton.co.uk'

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable is not set')
    return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) }
  }

  const resend = new Resend(RESEND_API_KEY)

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { type, booking } = body
  if (!type || !booking) {
    return { statusCode: 400, body: 'Missing type or booking' }
  }

  console.log('send-email invoked:', { type, barberEmail: BARBER_EMAIL, clientEmail: booking.email || 'none', from: FROM_EMAIL, apiKeySet: !!process.env.RESEND_API_KEY, testMode: !!process.env.TEST_EMAIL })

  const promises = []

  const testEmail = process.env.TEST_EMAIL

  if (BARBER_EMAIL) {
    promises.push(sendBarberEmail(resend, FROM_EMAIL, type, booking, testEmail || BARBER_EMAIL))
  } else {
    console.warn('BARBER_EMAIL not set — skipping barber notification')
  }

  if (booking.email) {
    promises.push(sendClientEmail(resend, FROM_EMAIL, type, booking, testEmail || booking.email))
  }

  try {
    await Promise.all(promises)
    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('❌ Email send error:', err.message)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

async function sendBarberEmail(resend, FROM_EMAIL, type, booking, to) {
  const subjects = {
    new:    `New Booking — ${booking.name} (${booking.bookingNumber})`,
    edit:   `Rescheduled — ${booking.name} (${booking.bookingNumber})`,
    cancel: `Cancelled — ${booking.name} (${booking.bookingNumber})`
  }

  const titles = {
    new:    '🆕 New Booking',
    edit:   '✏️ Booking Rescheduled',
    cancel: '❌ Booking Cancelled'
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: subjects[type] || 'Booking Update',
    html: buildEmailHtml({ title: titles[type] || 'Booking Update', isBarber: true, booking })
  })
  if (error) throw new Error(error.message)
  console.log('✅ Barber email sent to', to, '— id:', data.id)
}

async function sendClientEmail(resend, FROM_EMAIL, type, booking, to) {
  const subjects = {
    new:    `Booking confirmed — ${booking.bookingNumber}`,
    edit:   `Booking rescheduled — ${booking.bookingNumber}`,
    cancel: `Booking cancelled — ${booking.bookingNumber}`
  }

  const titles = {
    new:    '✅ Booking Confirmed',
    edit:   '✏️ Booking Rescheduled',
    cancel: '❌ Booking Cancelled'
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: subjects[type] || 'Booking Update — Local Barbers Luton',
    html: buildEmailHtml({ title: titles[type] || 'Booking Update', isBarber: false, booking })
  })
  if (error) throw new Error(error.message)
  console.log('✅ Client email sent to', to, '— id:', data.id)
}

function buildEmailHtml({ title, isBarber, booking }) {
  const rows = [
    ['Booking #', booking.bookingNumber],
    ['Service',   booking.serviceName],
    ['Date',      booking.date],
    ['Time',      booking.time],
    ['Name',      booking.name],
    ['Phone',     booking.phone],
    booking.servicePrice != null ? ['Price', `£${booking.servicePrice}`] : null
  ].filter(Boolean)

  const tableRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 16px;color:#888;font-size:14px;white-space:nowrap;width:80px;">${label}</td>
      <td style="padding:8px 16px;color:#f0f0f0;font-size:14px;font-weight:500;">${value}</td>
    </tr>`).join('')

  const footer = isBarber
    ? 'Local Barbers Luton — Barber Dashboard Notification'
    : 'Local Barbers Luton · localbarbersluton.co.uk<br>Keep your booking number safe — you\'ll need it to reschedule or cancel.'

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#141414;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#141414;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
        <tr>
          <td style="background:#0e0e0e;border-radius:12px 12px 0 0;padding:28px 28px 22px;border-bottom:2px solid #c9a84c;">
            <div style="font-size:10px;color:#c9a84c;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">Local Barbers Luton</div>
            <div style="font-size:22px;color:#ffffff;font-weight:700;letter-spacing:-0.3px;">${title}</div>
          </td>
        </tr>
        <tr>
          <td style="background:#161616;padding:8px 0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">${tableRows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#0e0e0e;border-radius:0 0 12px 12px;padding:16px 28px;border-top:1px solid #252525;">
            <div style="font-size:12px;color:#555;line-height:1.7;">${footer}</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}