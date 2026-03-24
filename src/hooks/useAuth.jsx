import { createContext, useContext, useState, useEffect } from 'react'

// Barber credentials — stored here for simplicity (no backend needed)
// In a production upgrade, move to Firebase Auth
const BARBER_ID = 'nawazish1'
const BARBER_PIN = '987654'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const session = sessionStorage.getItem('barber_session')
    if (session === 'authenticated') setIsAuthenticated(true)
  }, [])

  const login = (id, pin) => {
    if (id === BARBER_ID && pin === BARBER_PIN) {
      sessionStorage.setItem('barber_session', 'authenticated')
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem('barber_session')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
