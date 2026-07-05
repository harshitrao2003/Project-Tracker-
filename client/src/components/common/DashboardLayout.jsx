// ============================================
// DashboardLayout.jsx
// Wrapper used by ALL protected pages
// Contains Sidebar + Navbar + page content
// ============================================

import { useState }  from 'react'
import Sidebar        from './Sidebar'
import Navbar         from './Navbar'
import '../../styles/dashboard.css'

// children = the page content
// Example: <DashboardLayout><Problems /></DashboardLayout>
const DashboardLayout = ({ children }) => {

  // Controls sidebar open/close on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const openSidebar  = () => setSidebarOpen(true)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="layout">

      {/* Sidebar — left panel */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main area — navbar + page content */}
      <div className="layout-main">

        {/* Top navbar */}
        <Navbar onMenuClick={openSidebar} />

        {/* Page content */}
        <main className="layout-content">
          {children}
        </main>

      </div>

    </div>
  )
}

export default DashboardLayout