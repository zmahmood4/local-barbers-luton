import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import About from './pages/About'
import Contact from './pages/Contact'
import BookingFlow from './pages/BookingFlow'
import ManageBooking from './pages/ManageBooking'
import BarberLogin from './pages/BarberLogin'
import BarberDashboard from './pages/BarberDashboard'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/barber/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #2563EB',
              borderRadius: '12px',
              fontFamily: 'inherit'
            },
            success: { iconTheme: { primary: '#2563EB', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } }
          }}
        />
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/gallery"  element={<Gallery />} />
          <Route path="/about"    element={<About />} />
          <Route path="/contact"  element={<Contact />} />
          <Route path="/book"     element={<BookingFlow />} />
          <Route path="/manage"   element={<ManageBooking />} />
          <Route path="/barber/login" element={<BarberLogin />} />
          <Route path="/barber/dashboard" element={
            <ProtectedRoute><BarberDashboard /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}