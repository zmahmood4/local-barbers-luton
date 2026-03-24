# Local Barbers Luton — Booking App
### Built for Nawazish · localbarbersluton.co.uk

A full PWA booking system built with React + Firebase. Clients book appointments, manage them by booking number, and get a native app experience on their phone. Nawazish gets push notifications and a full dashboard.

---

## What's included

| Feature | Details |
|---|---|
| Client booking flow | Service → Date → Time → Details → Confirm |
| Unique booking number | e.g. LB83920 — issued on confirmation |
| Manage bookings | Clients look up by booking number + name |
| Reschedule & cancel | Full self-service with barber notification |
| Barber dashboard | Today / Upcoming / All bookings |
| Availability editor | Set hours, days, slot duration |
| Services editor | Edit prices and durations live |
| PIN login | Barber ID: nawazish1 · PIN: 987654 |
| Email notifications | New / edited / cancelled bookings → EmailJS |
| Push notifications | FCM — works on Android & iOS (PWA) |
| PWA | Add to Home Screen, works offline |
| Logo | Used as favicon, Apple Touch Icon, PWA icon |

---

## Tech Stack

- **React 18** + React Router 6
- **Firebase** (Firestore + FCM) — free Spark plan
- **Vite** + vite-plugin-pwa
- **EmailJS** — free 200 emails/month
- **Netlify** or **Vercel** — free hosting
- **Domain** — localbarbersluton.co.uk (~£10/yr)

---

## Setup Guide

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version).

### Step 2 — Install dependencies
Open a terminal in this project folder and run:
```
npm install
```

### Step 3 — Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `local-barbers-luton`
3. Disable Google Analytics (not needed) → Create project

#### Enable Firestore
- Left menu → **Firestore Database** → Create database
- Choose **Start in production mode** → select `europe-west2` (London) → Enable

#### Enable Cloud Messaging (for push notifications)
- Left menu → **Project Settings** → **Cloud Messaging** tab
- Copy your **VAPID key** (Web Push certificates section — generate one if needed)

#### Get your Firebase config
- Left menu → **Project Settings** → **General** tab
- Scroll to "Your apps" → click **</>** (Web)
- Register app name: `local-barbers-web` → Register
- Copy the `firebaseConfig` object shown

### Step 4 — Add Firebase config to the app

Open `src/firebase/config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           // from Firebase console
  authDomain: "local-barbers-luton.firebaseapp.com",
  projectId: "local-barbers-luton",
  storageBucket: "local-barbers-luton.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

Also update `public/firebase-messaging-sw.js` with the same values.

### Step 5 — Deploy Firestore rules
Install Firebase CLI (once):
```
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
```
Then deploy:
```
firebase deploy --only firestore:rules,firestore:indexes
```

### Step 6 — Set up EmailJS (free)

1. Go to https://emailjs.com → Sign up free
2. **Add a service** → Connect Gmail → name it anything, copy the **Service ID**
3. **Create a template** for barber notifications:
   - Subject: `{{subject}}`
   - Body:
     ```
     {{message}}
     
     Booking #: {{booking_number}}
     Client: {{client_name}}
     Phone: {{client_phone}}
     Service: {{service}}
     Date: {{date}}
     Time: {{time}}
     ```
   - To email: `{{to_email}}`
   - Copy the **Template ID**

4. **Account** → copy your **Public Key**

5. Open `src/utils/notifications.js` and fill in:
```js
const EMAILJS_SERVICE_ID = 'service_xxxxxxx'
const EMAILJS_TEMPLATE_ID = 'template_xxxxxxx'
const EMAILJS_PUBLIC_KEY = 'xxxxxxxxxxxxxxx'
const BARBER_EMAIL = 'nawazish@gmail.com'   // Nawazish's actual email
```

### Step 7 — Test locally
```
npm run dev
```
Open http://localhost:5173 in your browser.

Test the full flow:
- Book an appointment as a client
- Go to /manage and find your booking
- Log in at /barber/login with ID `nawazish1` and PIN `987654`
- Check the dashboard

### Step 8 — Build for production
```
npm run build
```
This creates a `dist/` folder ready to deploy.

---

## Deployment (Free)

### Option A — Netlify (recommended, easiest)

1. Go to https://netlify.com → sign up free
2. Drag and drop your `dist/` folder onto the Netlify dashboard
   — OR —
   Push to GitHub and connect the repo:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Your site will be live at a `.netlify.app` URL

### Option B — Vercel

1. Go to https://vercel.com → sign up free
2. Import your GitHub repo
3. Framework preset: **Vite**
4. Deploy — live at `.vercel.app`

---

## Connect your domain (localbarbersluton.co.uk)

1. **Buy the domain** at Namecheap (~£10/yr):
   https://www.namecheap.com → search `localbarbersluton.co.uk`

2. **In Netlify/Vercel** → Domain settings → Add custom domain → type `localbarbersluton.co.uk`

3. **In Namecheap** → Manage domain → Advanced DNS → add these records:

   | Type | Host | Value |
   |---|---|---|
   | A | @ | 75.2.60.5 (Netlify) or 76.76.21.21 (Vercel) |
   | CNAME | www | your-site.netlify.app |

4. SSL is automatic and free — takes up to 24 hours to propagate.

---

## Setting up push notifications for Nawazish's phone

1. Nawazish opens the site on his Android phone
2. Taps **Add to Home Screen** (from Chrome menu)
3. Opens the app → goes to **/barber/login** → logs in
4. Browser asks permission for notifications → **Allow**
5. The FCM token is saved to Firebase
6. From now on, every new/edited/cancelled booking triggers a push notification to his phone

> **iOS note**: Push notifications via PWA require iOS 16.4+ and the user must add to Home Screen first.

---

## Firestore data structure

```
firestore/
├── bookings/
│   └── {bookingId}
│       ├── bookingNumber: "LB83920"
│       ├── name: "Ahmed Khan"
│       ├── nameLower: "ahmed khan"
│       ├── phone: "07700900000"
│       ├── email: "ahmed@example.com"
│       ├── serviceId: "haircut"
│       ├── serviceName: "Haircut"
│       ├── servicePrice: 15
│       ├── date: "2026-04-15"
│       ├── time: "10:30"
│       ├── status: "confirmed" | "cancelled"
│       └── createdAt: Timestamp
│
└── settings/
    ├── availability
    │   ├── openTime: "10:00"
    │   ├── closeTime: "19:00"
    │   ├── slotDuration: 30
    │   ├── days: { 0: true, 1: true, ... }
    │   ├── blockedDates: []
    │   └── blockedSlots: {}
    ├── services
    │   └── list: [ { id, name, price, duration, emoji } ]
    └── fcmToken
        └── token: "..."
```

---

## Barber credentials

| Field | Value |
|---|---|
| Barber ID | `nawazish1` |
| PIN | `987654` |
| Dashboard URL | `/barber/login` |

> To change the PIN: open `src/hooks/useAuth.jsx` and update `BARBER_PIN`.

---

## Cost summary

| Item | Cost |
|---|---|
| Hosting (Netlify/Vercel) | **Free** |
| Firebase (Spark plan) | **Free** (50k reads/day, 20k writes/day) |
| EmailJS | **Free** (200 emails/month) |
| FCM push notifications | **Free** |
| Domain localbarbersluton.co.uk | **~£10/year** |
| **Total** | **~£10/year** |

---

## Going live checklist

- [ ] Firebase project created and config added
- [ ] Firestore rules deployed
- [ ] EmailJS set up with Nawazish's email
- [ ] Tested locally (npm run dev)
- [ ] Built (npm run build)
- [ ] Deployed to Netlify or Vercel
- [ ] Domain purchased and connected
- [ ] Nawazish has installed the PWA on his phone
- [ ] Push notification permission granted on his phone
- [ ] Test booking end-to-end on live site
