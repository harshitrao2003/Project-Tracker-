// ============================================
// Register.jsx — User Registration Page
// ============================================

import { useState }              from 'react'
import { Link, useNavigate }     from 'react-router-dom'
import useAuth                   from '../../hooks/useAuth'
import API                       from '../../api/axios'
import '../../styles/auth.css'

const Register = () => {

  const navigate     = useNavigate()
  const { login }    = useAuth()

  // ─────────────────────────────────────────
  // FORM STATE
  // One state object for all fields
  // ─────────────────────────────────────────
  const [formData, setFormData] = useState({
    name:           '',
    email:          '',
    password:       '',
    confirmPassword:'',
    college:        '',
    branch:         '',
    graduationYear: new Date().getFullYear()
  })

  // ─────────────────────────────────────────
  // UI STATE
  // ─────────────────────────────────────────
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // Destructure for easy access in JSX
  const {
    name,
    email,
    password,
    confirmPassword,
    college,
    branch,
    graduationYear
  } = formData

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────

  // Single handler for all inputs
  // Uses input name attribute to update
  // the correct field in formData
  const handleChange = (e) => {
    setFormData({
      ...formData,           // Keep all other fields
      [e.target.name]: e.target.value  // Update only changed field
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()   // Prevent browser page reload

    // ─────────────────────────────────────
    // FRONTEND VALIDATION
    // ─────────────────────────────────────
    if (!name || !email || !password || !confirmPassword) {
      return setError('Please fill in all required fields')
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    try {
      setLoading(true)
      setError('')

      // Call Register API
      const response = await API.post('/auth/register', {
        name,
        email,
        password,
        college,
        branch,
        graduationYear: Number(graduationYear)
      })

      // Save token and user to AuthContext + localStorage
      login(response.data.user, response.data.token)

      // Redirect to dashboard after successful register
      navigate('/dashboard')

    } catch (err) {
      // Show error message from backend
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
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

      {/* Right Panel — Register Form */}
      <div className="auth-right">
        <div className="auth-card">

          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Start your placement journey today</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="auth-form">

            {/* Row 1 — Name + Email */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  autoComplete="name"
                />
              </div>

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
                />
              </div>
            </div>

            {/* Row 2 — Password + Confirm Password */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Row 3 — College + Branch */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="college">College</label>
                <input
                  type="text"
                  id="college"
                  name="college"
                  value={college}
                  onChange={handleChange}
                  placeholder="IIT Delhi"
                />
              </div>

              <div className="form-group">
                <label htmlFor="branch">Branch</label>
                <input
                  type="text"
                  id="branch"
                  name="branch"
                  value={branch}
                  onChange={handleChange}
                  placeholder="Computer Science"
                />
              </div>
            </div>

            {/* Row 4 — Graduation Year */}
            <div className="form-group">
              <label htmlFor="graduationYear">Graduation Year</label>
              <select
                id="graduationYear"
                name="graduationYear"
                value={graduationYear}
                onChange={handleChange}
              >
                {/* Generate years from 2024 to 2030 */}
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
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
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

          </form>

          {/* Login Link */}
          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Register
