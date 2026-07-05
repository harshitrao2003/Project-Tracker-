// ============================================
// Loader.jsx — Reusable Loading Spinner
// Used by ProtectedRoute and AuthRoute
// during auth state check
// ============================================

import '../../styles/loader.css'

// size  → 'sm' | 'md' | 'lg'
// text  → optional loading text
// full  → true = full screen, false = inline
const Loader = ({
  size = 'md',
  text = 'Loading...',
  full = true
}) => {
  return (
    <div className={`loader-wrapper ${full ? 'loader-full' : ''}`}>
      <div className={`loader-spinner loader-${size}`}></div>
      {text && (
        <p className="loader-text">{text}</p>
      )}
    </div>
  )
}

export default Loader