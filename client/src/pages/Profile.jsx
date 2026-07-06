// ============================================
// Profile.jsx — User Profile Page
// ============================================

import { useState, useEffect } from 'react'
import DashboardLayout          from '../components/common/DashboardLayout'
import API                      from '../api/axios'
import useAuth                  from '../hooks/useAuth'
import { formatDate }           from '../utils/helpers'
import '../styles/profile.css'

const Profile = () => {

  const { user, updateUser } = useAuth()

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')
  const [stats,     setStats]     = useState(null)

  const [formData, setFormData] = useState({
    name:           '',
    college:        '',
    branch:         '',
    graduationYear: '',
    linkedin:       '',
    github:         '',
    leetcode:       '',
    geeksforgeeks:  ''
  })

  // ─────────────────────────────────────────
  // POPULATE FORM FROM USER
  // ─────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setFormData({
        name:           user.name           || '',
        college:        user.college        || '',
        branch:         user.branch         || '',
        graduationYear: user.graduationYear || '',
        linkedin:       user.linkedin       || '',
        github:         user.github         || '',
        leetcode:       user.leetcode       || '',
        geeksforgeeks:  user.geeksforgeeks  || ''
      })
    }
  }, [user])

  // ─────────────────────────────────────────
  // FETCH STATS
  // ─────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/problems/stats')
        setStats(response.data.stats)
      } catch (err) {
        console.error('Fetch Stats Error:', err)
      }
    }

    if (user) fetchStats()
  }, [user])

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (error)   setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return setError('Name is required')
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const response = await API.put('/auth/profile', {
        ...formData,
        graduationYear: Number(formData.graduationYear)
      })

      // Update AuthContext so navbar/sidebar refresh
      updateUser(response.data.user)

      setSuccess('Profile updated successfully!')
      setIsEditing(false)

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to update profile. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form to current user data
    if (user) {
      setFormData({
        name:           user.name           || '',
        college:        user.college        || '',
        branch:         user.branch         || '',
        graduationYear: user.graduationYear || '',
        linkedin:       user.linkedin       || '',
        github:         user.github         || '',
        leetcode:       user.leetcode       || '',
        geeksforgeeks:  user.geeksforgeeks  || ''
      })
    }
    setIsEditing(false)
    setError('')
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <DashboardLayout>

      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h2>👤 Profile</h2>
            <p>Manage your personal and professional information</p>
          </div>
          {!isEditing && (
            <button
              className="btn-primary"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="profile-layout">

        {/* ─── Left Column — Avatar + Stats ─── */}
        <div className="profile-left">

          {/* Avatar Card */}
          <div className="profile-avatar-card">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="profile-name">{user?.name}</h3>
            <p className="profile-email">{user?.email}</p>
            {user?.college && (
              <p className="profile-college">🎓 {user.college}</p>
            )}
            {user?.branch && (
              <p className="profile-branch">💼 {user.branch}</p>
            )}
            <p className="profile-joined">
              Joined {formatDate(user?.createdAt)}
            </p>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="profile-stats-card">
              <h4 className="profile-stats-title">📊 My Stats</h4>
              <div className="profile-stats-grid">
                <div className="profile-stat">
                  <span
                    className="profile-stat-value"
                    style={{ color: 'var(--primary-color)' }}
                  >
                    {stats.totalSolved || 0}
                  </span>
                  <span className="profile-stat-label">Solved</span>
                </div>
                <div className="profile-stat">
                  <span
                    className="profile-stat-value"
                    style={{ color: 'var(--easy-color)' }}
                  >
                    {stats.easy || 0}
                  </span>
                  <span className="profile-stat-label">Easy</span>
                </div>
                <div className="profile-stat">
                  <span
                    className="profile-stat-value"
                    style={{ color: 'var(--medium-color)' }}
                  >
                    {stats.medium || 0}
                  </span>
                  <span className="profile-stat-label">Medium</span>
                </div>
                <div className="profile-stat">
                  <span
                    className="profile-stat-value"
                    style={{ color: 'var(--hard-color)' }}
                  >
                    {stats.hard || 0}
                  </span>
                  <span className="profile-stat-label">Hard</span>
                </div>
                <div className="profile-stat">
                  <span
                    className="profile-stat-value"
                    style={{ color: 'var(--warning-color)' }}
                  >
                    🔥 {stats.currentStreak || 0}
                  </span>
                  <span className="profile-stat-label">Streak</span>
                </div>
                <div className="profile-stat">
                  <span
                    className="profile-stat-value"
                    style={{ color: 'var(--secondary-color)' }}
                  >
                    ⭐ {stats.longestStreak || 0}
                  </span>
                  <span className="profile-stat-label">Best</span>
                </div>
              </div>
            </div>
          )}

          {/* Professional Links */}
          {!isEditing && (
            <div className="profile-links-card">
              <h4 className="profile-stats-title">🔗 Links</h4>
              <div className="profile-links">
                {user?.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    <span className="profile-link-icon">💼</span>
                    LinkedIn
                  </a>
                )}
                {user?.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    <span className="profile-link-icon">🐙</span>
                    GitHub
                  </a>
                )}
                {user?.leetcode && (
                  <a
                    href={user.leetcode}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    <span className="profile-link-icon">💻</span>
                    LeetCode
                  </a>
                )}
                {user?.geeksforgeeks && (
                  <a
                    href={user.geeksforgeeks}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    <span className="profile-link-icon">🟢</span>
                    GeeksforGeeks
                  </a>
                )}
                {!user?.linkedin && !user?.github &&
                 !user?.leetcode && !user?.geeksforgeeks && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No links added yet. Edit profile to add.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ─── Right Column — Edit Form or View ─── */}
        <div className="profile-right">

          {/* Success Message */}
          {success && (
            <div className="profile-success">
              ✅ {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="form-error" style={{ marginBottom: '1rem' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {isEditing ? (
            /* ─── Edit Form ─── */
            <div className="profile-form-card">
              <h3 className="profile-section-title">Edit Profile</h3>

              <form onSubmit={handleSubmit} className="profile-form">

                {/* Personal Info */}
                <div className="profile-form-section">
                  <h4 className="profile-form-section-title">
                    Personal Information
                  </h4>

                  <div className="form-group">
                    <label htmlFor="name">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="college">College</label>
                      <input
                        type="text"
                        id="college"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        placeholder="e.g. IIT Delhi"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="branch">Branch</label>
                      <input
                        type="text"
                        id="branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="graduationYear">Graduation Year</label>
                    <select
                      id="graduationYear"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                    >
                      {[2024,2025,2026,2027,2028,2029,2030].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Professional Links */}
                <div className="profile-form-section">
                  <h4 className="profile-form-section-title">
                    Professional Links
                  </h4>

                  <div className="form-group">
                    <label htmlFor="linkedin">
                      <span>💼</span> LinkedIn URL
                    </label>
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="github">
                      <span>🐙</span> GitHub URL
                    </label>
                    <input
                      type="url"
                      id="github"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="leetcode">
                      <span>💻</span> LeetCode URL
                    </label>
                    <input
                      type="url"
                      id="leetcode"
                      name="leetcode"
                      value={formData.leetcode}
                      onChange={handleChange}
                      placeholder="https://leetcode.com/username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="geeksforgeeks">
                      <span>🟢</span> GeeksforGeeks URL
                    </label>
                    <input
                      type="url"
                      id="geeksforgeeks"
                      name="geeksforgeeks"
                      value={formData.geeksforgeeks}
                      onChange={handleChange}
                      placeholder="https://auth.geeksforgeeks.org/user/username"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="btn-loading">
                        <span className="spinner"></span>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>

              </form>
            </div>

          ) : (
            /* ─── View Mode ─── */
            <div className="profile-view-card">
              <h3 className="profile-section-title">Profile Details</h3>

              <div className="profile-detail-list">

                <div className="profile-detail-item">
                  <span className="profile-detail-label">Full Name</span>
                  <span className="profile-detail-value">
                    {user?.name || '—'}
                  </span>
                </div>

                <div className="profile-detail-item">
                  <span className="profile-detail-label">Email</span>
                  <span className="profile-detail-value">
                    {user?.email || '—'}
                  </span>
                </div>

                <div className="profile-detail-item">
                  <span className="profile-detail-label">College</span>
                  <span className="profile-detail-value">
                    {user?.college || 'Not set'}
                  </span>
                </div>

                <div className="profile-detail-item">
                  <span className="profile-detail-label">Branch</span>
                  <span className="profile-detail-value">
                    {user?.branch || 'Not set'}
                  </span>
                </div>

                <div className="profile-detail-item">
                  <span className="profile-detail-label">
                    Graduation Year
                  </span>
                  <span className="profile-detail-value">
                    {user?.graduationYear || 'Not set'}
                  </span>
                </div>

                <div className="profile-detail-item">
                  <span className="profile-detail-label">Member Since</span>
                  <span className="profile-detail-value">
                    {formatDate(user?.createdAt)}
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

    </DashboardLayout>
  )
}

export default Profile
