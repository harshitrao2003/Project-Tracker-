// ============================================
// Login.jsx — User Login Page
// Auth redirect handled by AuthRoute in App.jsx
// ============================================

import { useState }                       from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuth                            from '../../hooks/useAuth'
import API                                from '../../api/axios'
import '../../styles/auth.css'

const Login = () => {

  const navigate           = useNavigate()
  const location           = useLocation()
  const { login }          = useAuth()

  // Redirect back to page user originally tried to visit
  const from = location.state?.from?.pathname || '/dashboard'

  // ─────────────────────────────────────────
  // FORM STATE
  // ─────────────────────────────────────────
  const [formData, setFormData] = useState({
    email:    '',
    password: ''
  })

  // ─────────────────────────────────────────
  // UI STATE
  // ─────────────────────────────────────────
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { email, password } = formData

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Frontend validation
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter your email and password')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Call Login API
      const response = await API.post('/auth/login', {
        email,
        password
      })

      // Save to context + localStorage
      login(response.data.user, response.data.token)

      // Redirect to original destination or dashboard
      navigate(from, { replace: true })

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="auth-container">

      {/* Left Panel — Branding */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">🎯</div>
          <h1>Placement Tracker</h1>
          <p>Your complete placement preparation companion</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature-item">
            <span className="feature-icon">📊</span>
            <span>Track DSA Problems</span>
          </div>
          <div className="auth-feature-item">
            <span className="feature-icon">🏢</span>
            <span>Manage Company Applications</span>
          </div>
          <div className="auth-feature-item">
            <span className="feature-icon">🎤</span>
            <span>Monitor Mock Interviews</span>
          </div>
          <div className="auth-feature-item">
            <span className="feature-icon">🏆</span>
            <span>Compete on Leaderboard</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="auth-right">
        <div className="auth-card">

          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="rahul@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

          </form>

          {/* Demo Credentials */}
          <div className="demo-credentials">
            <p className="demo-title">Demo Account</p>
            <p className="demo-info">
              Email: <strong>rahul@example.com</strong>
            </p>
            <p className="demo-info">
              Password: <strong>password123</strong>
            </p>
            <button
              type="button"
              className="demo-btn"
              onClick={() => setFormData({
                email:    'rahul@example.com',
                password: 'password123'
              })}
            >
              Fill Demo Credentials
            </button>
          </div>

          {/* Register Link */}
          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one here</Link>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Login