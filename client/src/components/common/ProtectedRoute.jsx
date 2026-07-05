import { Navigate, useLocation } from 'react-router-dom'
import useAuth                   from '../../hooks/useAuth'

const ProtectedRoute = ({ children }) => {

  const { isAuthenticated, loading } = useAuth()
  const location                     = useLocation()

  // Debug
  console.log('ProtectedRoute:', { isAuthenticated, loading })

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading...</div>
  }

  if (!isAuthenticated) {
    console.log('Not authenticated — redirecting to login')
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute