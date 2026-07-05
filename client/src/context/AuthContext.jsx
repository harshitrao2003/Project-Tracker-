import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {

  // ─────────────────────────────────────────
  // Start with null — NOT from localStorage
  // useEffect will read localStorage after mount
  // This ensures loading state works correctly
  // ─────────────────────────────────────────
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)

  // ─────────────────────────────────────────
  // Read localStorage ONLY inside useEffect
  // This runs after first render
  // loading = true until this completes
  // ─────────────────────────────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser  = localStorage.getItem('user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } else {
        setToken(null)
        setUser(null)
      }
    } catch (err) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    } finally {
      // Always runs — sets loading false
      // whether token found or not
      setLoading(false)
    }
  }, [])

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('user',  JSON.stringify(userData))
    localStorage.setItem('token', authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}