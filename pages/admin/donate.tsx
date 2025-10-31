import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

interface DonationMethod {
  id: string
  name: string
  url: string
  icon: string
  description: string
  isActive: boolean
  displayOrder: number
}

export default function AdminDonatePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [donationMethods, setDonationMethods] = useState<DonationMethod[]>([
    {
      id: 'buymeacoffee',
      name: 'Buy Me a Coffee',
      url: 'https://buymeacoffee.com/thewordsrecord',
      icon: '☕',
      description: 'Quick and easy one-time support',
      isActive: true,
      displayOrder: 1
    },
    {
      id: 'stripe',
      name: 'Stripe',
      url: '#stripe',
      icon: '💳',
      description: 'Secure recurring or one-time donations',
      isActive: true,
      displayOrder: 2
    },
    {
      id: 'paypal',
      name: 'PayPal',
      url: '#paypal',
      icon: '💰',
      description: 'Trusted worldwide payment platform',
      isActive: true,
      displayOrder: 3
    },
    {
      id: 'patreon',
      name: 'Patreon',
      url: '#patreon',
      icon: '🎨',
      description: 'Monthly membership support',
      isActive: false,
      displayOrder: 4
    },
    {
      id: 'github',
      name: 'GitHub Sponsors',
      url: '#github',
      icon: '💻',
      description: 'Support through GitHub',
      isActive: false,
      displayOrder: 5
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      url: '#crypto',
      icon: '₿',
      description: 'Bitcoin and other cryptocurrencies',
      isActive: false,
      displayOrder: 6
    }
  ])

  useEffect(() => {
    checkAuth()
    loadDonationMethods()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/verify', {
        credentials: 'include'
      })
      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const loadDonationMethods = async () => {
    try {
      const res = await fetch('/api/admin/donation-methods', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          setDonationMethods(data)
        }
      }
    } catch (error) {
      console.error('Failed to load donation methods:', error)
    }
  }

  const handleMethodChange = (id: string, field: keyof DonationMethod, value: any) => {
    setDonationMethods(prev => prev.map(method =>
      method.id === id ? { ...method, [field]: value } : method
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/donation-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ methods: donationMethods })
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Donation methods saved successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save donation methods. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddMethod = () => {
    const newMethod: DonationMethod = {
      id: `custom_${Date.now()}`,
      name: 'New Method',
      url: '#',
      icon: '💝',
      description: 'New donation method',
      isActive: false,
      displayOrder: donationMethods.length + 1
    }
    setDonationMethods([...donationMethods, newMethod])
  }

  const handleDeleteMethod = (id: string) => {
    if (confirm('Are you sure you want to delete this donation method?')) {
      setDonationMethods(prev => prev.filter(method => method.id !== id))
    }
  }

  const moveMethod = (index: number, direction: 'up' | 'down') => {
    const newMethods = [...donationMethods]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= newMethods.length) return

    // Swap positions
    [newMethods[index], newMethods[newIndex]] = [newMethods[newIndex], newMethods[index]]

    // Update display order
    newMethods.forEach((method, i) => {
      method.displayOrder = i + 1
    })

    setDonationMethods(newMethods)
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Head>
        <title>Manage Donation Methods - Admin</title>
      </Head>

      <div className="admin-container">
        <div className="admin-header">
          <h1>Manage Donation Methods</h1>
          <div className="header-actions">
            <Link href="/donate-redesigned" target="_blank">
              <button className="btn-preview">Preview Page</button>
            </Link>
            <Link href="/admin/dashboard">
              <button className="btn-back">Back to Dashboard</button>
            </Link>
          </div>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="methods-list">
          {donationMethods.map((method, index) => (
            <div key={method.id} className={`method-card ${!method.isActive ? 'inactive' : ''}`}>
              <div className="method-header">
                <div className="method-order">
                  <button
                    onClick={() => moveMethod(index, 'up')}
                    disabled={index === 0}
                    className="btn-move"
                  >
                    ↑
                  </button>
                  <span>{index + 1}</span>
                  <button
                    onClick={() => moveMethod(index, 'down')}
                    disabled={index === donationMethods.length - 1}
                    className="btn-move"
                  >
                    ↓
                  </button>
                </div>
                <div className="method-status">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={method.isActive}
                      onChange={(e) => handleMethodChange(method.id, 'isActive', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="method-content">
                <div className="form-row">
                  <div className="form-group small">
                    <label>Icon</label>
                    <input
                      type="text"
                      value={method.icon}
                      onChange={(e) => handleMethodChange(method.id, 'icon', e.target.value)}
                      placeholder="Emoji or text"
                    />
                  </div>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={method.name}
                      onChange={(e) => handleMethodChange(method.id, 'name', e.target.value)}
                      placeholder="Service name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="text"
                    value={method.url}
                    onChange={(e) => handleMethodChange(method.id, 'url', e.target.value)}
                    placeholder="https://example.com/donate or #coming-soon"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={method.description}
                    onChange={(e) => handleMethodChange(method.id, 'description', e.target.value)}
                    placeholder="Brief description of this donation method"
                  />
                </div>

                <button
                  onClick={() => handleDeleteMethod(method.id)}
                  className="btn-delete"
                >
                  Delete Method
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="actions">
          <button onClick={handleAddMethod} className="btn-add">
            + Add New Method
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-save"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        <div className="help-section">
          <h3>Quick Tips</h3>
          <ul>
            <li>Drag methods up/down to reorder them on the donation page</li>
            <li>Toggle methods on/off without deleting them</li>
            <li>Use # for placeholder URLs (e.g., #coming-soon)</li>
            <li>Emojis work great as icons! Try: 💖 🎁 💵 🙏 ⭐</li>
            <li>Changes are saved to the database and will persist</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .loading {
          text-align: center;
          padding: 4rem;
          font-size: 1.2rem;
          color: #666;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e5e5;
        }

        .admin-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-preview,
        .btn-back {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-preview:hover,
        .btn-back:hover {
          background: #f5f5f5;
          border-color: #999;
        }

        .message {
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .methods-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .method-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.2s;
        }

        .method-card.inactive {
          opacity: 0.6;
          background: #f9f9f9;
        }

        .method-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .method-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .method-order {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-move {
          width: 28px;
          height: 28px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-move:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #999;
        }

        .btn-move:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .method-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .form-group {
          flex: 1;
        }

        .form-group.small {
          flex: 0 0 100px;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #555;
          margin-bottom: 0.25rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4a5f71;
        }

        .toggle {
          position: relative;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
        }

        .toggle input {
          display: none;
        }

        .toggle-slider {
          width: 44px;
          height: 24px;
          background: #ccc;
          border-radius: 24px;
          position: relative;
          transition: background 0.3s;
          margin-right: 0.75rem;
        }

        .toggle-slider::after {
          content: '';
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: transform 0.3s;
        }

        .toggle input:checked + .toggle-slider {
          background: #4caf50;
        }

        .toggle input:checked + .toggle-slider::after {
          transform: translateX(20px);
        }

        .toggle-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #555;
        }

        .btn-delete {
          align-self: flex-start;
          padding: 0.4rem 0.8rem;
          background: #fff;
          color: #dc3545;
          border: 1px solid #dc3545;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-delete:hover {
          background: #dc3545;
          color: white;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .btn-add,
        .btn-save {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add {
          background: white;
          color: #4a5f71;
          border: 2px solid #4a5f71;
        }

        .btn-add:hover {
          background: #4a5f71;
          color: white;
        }

        .btn-save {
          background: #4a5f71;
          color: white;
          border: none;
          flex: 1;
          max-width: 300px;
        }

        .btn-save:hover:not(:disabled) {
          background: #3a4f61;
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .help-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .help-section h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: #333;
        }

        .help-section ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #666;
        }

        .help-section li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .admin-container {
            padding: 1rem;
          }

          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-actions {
            width: 100%;
          }

          .btn-preview,
          .btn-back {
            flex: 1;
          }

          .form-row {
            flex-direction: column;
          }

          .form-group.small {
            flex: 1;
          }

          .actions {
            flex-direction: column;
          }

          .btn-save {
            max-width: none;
          }
        }
      `}</style>
    </>
  )
}