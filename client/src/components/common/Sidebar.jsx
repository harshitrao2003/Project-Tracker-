// ============================================
// Sidebar.jsx — Left Navigation Panel
// ============================================

import { NavLink, useNavigate } from 'react-router-dom'
import useAuth                  from '../../hooks/useAuth'
import '../../styles/sidebar.css'

// Navigation items — icon, label, path
const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard',   path: '/dashboard'   },
  { icon: '💻', label: 'Problems',    path: '/problems'    },
  { icon: '📈', label: 'Progress',    path: '/progress'    },
  { icon: '🏢', label: 'Companies',   path: '/companies'   },
  { icon: '📄', label: 'Resumes',     path: '/resumes'     },
  { icon: '🎤', label: 'Interviews',  path: '/interviews'  },
  { icon: '🏆', label: 'Leaderboard', path: '/leaderboard' },
  { icon: '👤', label: 'Profile',     path: '/profile'     },
]

const Sidebar = ({ isOpen, onClose }) => {

  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay — shown on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>

        {/* ─── Logo ─── */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🎯</span>
          <span className="sidebar-logo-text">PlaceTrack</span>
          {/* Close button — mobile only */}
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* ─── User Info ─── */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">
              {user?.name || 'User'}
            </p>
            <p className="sidebar-user-college">
              {user?.college || 'College not set'}
            </p>
          </div>
        </div>

        {/* ─── Navigation ─── */}
        <nav className="sidebar-nav">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="sidebar-link-icon">
                    {item.icon}
                  </span>
                  <span className="sidebar-link-label">
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ─── Logout ─── */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  )
}

export default Sidebar