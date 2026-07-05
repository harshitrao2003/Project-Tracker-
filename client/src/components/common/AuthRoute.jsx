import useAuth from '../../hooks/useAuth'

const AuthRoute = ({ children }) => {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f0f1a',
        color: '#6c63ff',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    )
  }

  return children
}

export default AuthRoute