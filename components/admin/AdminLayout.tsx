import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

interface AdminUser {
  username: string
  role: string
}

export default function AdminLayout({ children, title = 'Admin Dashboard' }: AdminLayoutProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
        
        <style jsx>{`
          .admin-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e6ed;
            border-top: 3px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return null // Redirecting to login
  }

  const dashboardItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/advanced', label: 'Advanced View', icon: '🔬' }
  ]

  const contentItems = [
    { href: '/admin/cases', label: 'Cases', icon: '📁' },
    { href: '/admin/statements', label: 'Statements', icon: '💬' },
    { href: '/admin/people', label: 'People', icon: '👤' },
    { href: '/admin/organizations', label: 'Organizations', icon: '🏢' },
    { href: '/admin/topics', label: 'Topics', icon: '🧩' },
    { href: '/admin/sources', label: 'Sources', icon: '📰' }
  ]

  const adminItems = [
    { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { href: '/admin/apps', label: 'Apps', icon: '📱' },
    { href: '/admin/export', label: 'Export', icon: '📥' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/security', label: 'Security', icon: '🔐' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <>
      <Head>
        <title>{title} - The Words Record Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="admin-layout">
        {/* Mobile menu overlay */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>TWR Admin</h1>
            </Link>
            <button
              type="button"
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          <nav className="sidebar-nav">
            {/* Dashboard Section - No background box */}
            <div className="nav-section">
              {dashboardItems.map((item) => (
                <Link
                  href={item.href}
                  key={item.href}
                  className={`nav-item-card ${
                    router.pathname === item.href ? 'active' : ''
                  }`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="nav-divider-small"></div>

            {/* Content Management Section - Grey/Blue background */}
            <div className="nav-section-box content-box">
              <div className="nav-section">
                {contentItems.map((item) => (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={`nav-item-card ${
                      router.pathname === item.href || router.asPath.startsWith(`${item.href}/`)
                        ? 'active'
                        : ''
                    }`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="nav-divider-small"></div>

            {/* Admin Settings Section - Dark grey background */}
            <div className="nav-section-box admin-box">
              <div className="nav-section">
                {adminItems.map((item) => (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={`nav-item-card ${
                      router.pathname === item.href || router.asPath.startsWith(`${item.href}/`)
                        ? 'active'
                        : ''
                    }`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="main-content admin-main">
          {/* Top bar */}
          <header className="top-bar admin-page-header">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className="admin-page-title">{title}</h1>
            </div>
            <div className="top-bar-actions">
              <Link href="/" className="admin-btn admin-btn-primary">
                🌐 View Site
              </Link>
            </div>
          </header>

          {/* Page content */}
          <main className="page-content admin-content-wrapper">
            <div className="admin-container">
              {children}
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          display: none;
        }

        .sidebar {
          width: 240px;
          background: #2c3e50;
          color: white;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 1000;
          overflow: hidden;
        }

        .sidebar-open {
          transform: translateX(0) !important;
        }

        .sidebar-header {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid #34495e;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .sidebar-header h1 {
          color: white;
          margin: 0;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .sidebar-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: none;
        }

        .sidebar-close:hover {
          background: #34495e;
        }

        .sidebar-nav {
          flex: 1;
          padding: 0.75rem;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        .nav-section {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.5rem;
          padding: 0.5rem 0;
          width: 100%;
        }

        .nav-section-box {
          border-radius: 8px;
          padding: 0.5rem;
          margin: 0 0.25rem;
          width: calc(100% - 0.5rem);
        }

        .nav-section-box.content-box {
          background: rgba(52, 73, 94, 0.15);
          border: 1px solid rgba(52, 73, 94, 0.3);
        }

        .nav-section-box.admin-box {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(0, 0, 0, 0.4);
        }

        .nav-divider {
          height: 1px;
          background: #34495e;
          margin: 0.75rem 0;
          width: 100%;
        }

        .nav-divider-small {
          height: 1px;
          background: #34495e;
          margin: 0.375rem 0;
          width: 100%;
        }

        .nav-item-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding: 0.625rem 0.25rem;
          color: #cbd5e0;
          text-decoration: none;
          transition: all 0.2s;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          min-height: 65px;
          width: 100%;
          box-sizing: border-box;
          position: relative;
        }

        .nav-item-card:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .nav-item-card.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-weight: 600;
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .nav-icon {
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 24px;
          height: 24px;
        }

        .nav-label {
          font-weight: 500;
          letter-spacing: 0.01em;
          font-size: 0.7rem;
          line-height: 1.2;
          word-break: break-word;
          max-width: 100%;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #34495e;
          margin-top: auto;
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }

        .user-name {
          font-weight: 500;
          color: white;
        }

        .user-role {
          font-size: 0.875rem;
          color: #bdc3c7;
          text-transform: capitalize;
        }

        .logout-btn {
          width: 100%;
          background: #e74c3c;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: #c0392b;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .top-bar {
          background: white;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e0e6ed;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .sidebar-toggle {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          color: #2c3e50;
          display: none;
        }

        .sidebar-toggle:hover {
          background: #f8f9fa;
        }

        .top-bar h1 {
          flex: 1;
          margin: 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .top-bar-actions {
          display: flex;
          gap: 0.75rem;
        }

        .view-site-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          text-decoration: none;
          transition: background 0.2s;
        }

        .view-site-btn:hover {
          background: #2980b9;
        }

        .page-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        @media (min-width: 768px) {
          .sidebar {
            transform: translateX(0);
          }

          .sidebar-close {
            display: none;
          }

          .sidebar-overlay {
            display: none !important;
          }

          .main-content {
            margin-left: 240px;
          }
        }

        @media (max-width: 1200px) {
          .sidebar {
            width: 220px;
          }

          .main-content {
            margin-left: 220px;
          }

          .nav-icon {
            font-size: 1.125rem;
          }

          .nav-label {
            font-size: 0.65rem;
          }
        }

        @media (max-width: 767px) {
          .sidebar {
            z-index: 1001;
          }

          .sidebar-overlay {
            display: block !important;
          }

          .sidebar-close {
            display: block !important;
          }

          .sidebar-toggle {
            display: block !important;
          }

          .main-content {
            margin-left: 0;
          }

          .page-content {
            padding: 1rem;
          }

          .top-bar {
            padding: 1rem;
          }

          .top-bar h1 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </>
  )
}
