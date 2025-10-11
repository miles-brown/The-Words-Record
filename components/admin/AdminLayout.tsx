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

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/people', label: 'People', icon: '👤' },
    { href: '/admin/cases', label: 'Cases', icon: '📰' },
    { href: '/admin/organizations', label: 'Organizations', icon: '🏢' },
    { href: '/admin/drafts', label: 'Drafts', icon: '✅' }
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
            <Link href="/admin">
              <h1>WSW Admin</h1>
            </Link>
            <button 
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <a
                  className={`nav-item ${
                    router.pathname === item.href || router.asPath.startsWith(`${item.href}/`)
                      ? 'active'
                      : ''
                  }`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </a>
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="main-content">
          {/* Top bar */}
          <header className="top-bar">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <h1>{title}</h1>
            <div className="top-bar-actions">
              <Link href="/">
                <button className="view-site-btn">
                  🌐 View Site
                </button>
              </Link>
            </div>
          </header>

          {/* Page content */}
          <main className="page-content">
            {children}
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
          width: 250px;
          background: #2c3e50;
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 1000;
        }

        .sidebar-open {
          transform: translateX(0);
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #34495e;
          display: flex;
          justify-content: space-between;
          align-items: center;
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
          padding: 1rem 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          color: #bdc3c7;
          text-decoration: none;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: #34495e;
          color: white;
        }

        .nav-item.active {
          background: #3498db;
          color: white;
        }

        .nav-icon {
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
        }

        .nav-label {
          font-weight: 500;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid #34495e;
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
          margin-left: 0;
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
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          color: #2c3e50;
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
            position: static;
            transform: none;
          }

          .sidebar-close {
            display: none;
          }

          .sidebar-overlay {
            display: none !important;
          }

          .main-content {
            margin-left: 0;
          }
        }

        @media (max-width: 767px) {
          .sidebar-overlay {
            display: block;
          }

          .sidebar-close {
            display: block;
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
