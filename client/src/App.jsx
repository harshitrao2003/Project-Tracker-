// ============================================
// App.jsx — Root Component with All Routes
// ============================================
import Progress from './pages/Progress'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auth Pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Main Pages
import Dashboard   from './pages/Dashboard'
import Problems    from './pages/Problems'
import Companies   from './pages/Companies'
import Resumes     from './pages/Resumes'
import Interviews  from './pages/Interviews'
import Leaderboard from './pages/Leaderboard'
import Profile     from './pages/Profile'

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute'
import AuthRoute      from './components/common/AuthRoute'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ─────────────────────────────────────
            ROOT — open the login page
            ───────────────────────────────────── */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* ─────────────────────────────────────
            AUTH ROUTES
            AuthRoute redirects to dashboard
            if user is already logged in
            ───────────────────────────────────── */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />

        {/* ─────────────────────────────────────
            PROTECTED ROUTES
            ProtectedRoute redirects to login
            if user is NOT logged in
            ───────────────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <Problems />
            </ProtectedRoute>
          }
        />
        <Route
  path="/progress"
  element={
    <ProtectedRoute>
      <Progress />
    </ProtectedRoute>
  }
/>

        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <Companies />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <Resumes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interviews"
          element={
            <ProtectedRoute>
              <Interviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ─────────────────────────────────────
            PUBLIC ROUTE
            Leaderboard visible to everyone
            ───────────────────────────────────── */}
        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />

        {/* ─────────────────────────────────────
            404 FALLBACK
            ───────────────────────────────────── */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App