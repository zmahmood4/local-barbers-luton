import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Home from './pages/Home'
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
              border: '1px solid #c9a84c',
              borderRadius: '12px',
              fontFamily: 'inherit'
            },
            success: { iconTheme: { primary: '#c9a84c', secondary: '#1a1a1a' } },
            error: { iconTheme: { primary: '#ff4444', secondary: '#fff' } }
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookingFlow />} />
          <Route path="/manage" element={<ManageBooking />} />
          <Route path="/barber/login" element={<BarberLogin />} />
          <Route path="/barber/dashboard" element={
            <ProtectedRoute><BarberDashboard /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
