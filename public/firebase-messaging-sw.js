// Firebase Cloud Messaging Service Worker
// This file MUST be named firebase-messaging-sw.js and placed in /public

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js')

// ⚠️ Replace with your Firebase config values
firebase.initializeApp({
  apiKey: "AIzaSyByVKi1R9OwAKR9b2U6SN6SVzf-QL9JgNw",
  authDomain: "local-barbers-luton.firebaseapp.com",
  projectId: "local-barbers-luton",
  storageBucket: "local-barbers-luton.firebasestorage.app",
  messagingSenderId: "603984792256",
  appId: "1:603984792256:web:db6a29392cb4b9eb393b25"
})

const messaging = firebase.messaging()

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || 'Local Barbers', {
    body: body || 'You have a new booking update.',
    icon: '/apple-touch-icon.png',
    badge: '/apple-touch-icon.png',
    tag: 'booking-notification',
    data: payload.data
  })
})

// Click on notification opens the dashboard
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/barber/dashboard')
  )
})
