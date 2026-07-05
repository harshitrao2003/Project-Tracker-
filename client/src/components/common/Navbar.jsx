// ============================================
// Navbar.jsx — Top Navigation Bar
// ============================================

import { useLocation }  from 'react-router-dom'
import useAuth          from '../../hooks/useAuth'
import '../../styles/navbar.css'

// Map route paths to page titles
const PAGE_TITLES = {
  '/dashboard':   '📊 Dashboard',
  '/problems':    '💻 Problem Tracker',
  '/progress':    '📈 Progress Tracker',
  '/companies':   '🏢 Company Applications',
  '/resumes':     '📄 Resume Tracker',
  '/interviews':  '🎤 Mock Interviews',
  '/leaderboard': '🏆 Leaderboard',
  '/profile':     '👤 Profile',
}

// onMenuClick — toggles sidebar on mobile
const Navbar = ({ onMenuClick }) => {

  const location = useLocation()
  const { user } = useAuth()

  // Get title for current page
  const pageTitle = PAGE_TITLES[location.pathname] || '🎯 Placement Tracker'

  return (
    <header className="navbar">

      {/* Left — Menu button + Page title */}
      <div className="navbar-left">
        {/* Hamburger — mobile only */}
        <button
          className="navbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <h1 className="navbar-title">{pageTitle}</h1>
      </div>

      {/* Right — User info */}
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="navbar-user-info">
            <p className="navbar-user-name">
              {user?.name || 'User'}
            </p>
            <p className="navbar-user-role">
              {user?.branch || 'Student'}
            </p>
          </div>
        </div>
      </div>

    </header>
  )
}

export default Navbar