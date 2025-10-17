/**
 * Admin User Management Page - Rebuilt to match Admin Design System
 * Create, edit, and manage admin users with role-based permissions
 */

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { format } from 'date-fns'

interface User {
  id: string
  username: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  isActive: boolean
  mfaEnabled: boolean
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
  _count: {
    sessions: number
    apiKeys: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN',
    firstName: '',
    lastName: ''
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters')
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create user')
      }

      // Reset form and close modal
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'ADMIN',
        firstName: '',
        lastName: ''
      })
      setShowCreateModal(false)
      fetchUsers()
    } catch (err: any) {
      setFormError(err.message)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update user')

      fetchUsers()
    } catch (err) {
      alert('Failed to update user status')
      console.error(err)
    }
  }

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to DELETE user "${username}"? This action cannot be undone.`)) {
      return
    }

    const confirmDelete = prompt(`Type "${username}" to confirm deletion:`)
    if (confirmDelete !== username) {
      alert('Username did not match. Deletion cancelled.')
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to delete user')

      fetchUsers()
    } catch (err) {
      alert('Failed to delete user')
      console.error(err)
    }
  }

  return (
    <AdminLayout title="User Management">
      <div>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--admin-text-primary)',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              👥 User Management
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--admin-text-secondary)',
              margin: 0
            }}>
              Manage admin users and their permissions
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--admin-accent)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
          >
            + Create User
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            fontWeight: 500,
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: 'var(--admin-text-secondary)'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '4px solid var(--admin-border)',
              borderTopColor: 'var(--admin-accent)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            Loading users...
          </div>
        ) : (
          /* Users Table */
          <div style={{
            backgroundColor: 'var(--admin-card-bg)',
            border: '1px solid var(--admin-border)',
            borderRadius: '1rem',
            boxShadow: 'var(--admin-shadow-light)',
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--admin-border)' }}>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--admin-bg)'
                  }}>User</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--admin-bg)'
                  }}>Email</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--admin-bg)'
                  }}>Role</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--admin-bg)'
                  }}>Status</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--admin-bg)'
                  }}>Last Login</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--admin-bg)'
                  }}>Sessions</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--admin-bg)'
                  }}>Created</th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--admin-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--admin-bg)'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{
                    borderBottom: '1px solid var(--admin-border)',
                    opacity: user.isActive ? 1 : 0.6,
                    transition: 'background-color 0.2s'
                  }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{
                          fontWeight: 600,
                          color: 'var(--admin-text-primary)',
                          marginBottom: '0.25rem'
                        }}>
                          {user.username}
                        </div>
                        {(user.firstName || user.lastName) && (
                          <div style={{
                            fontSize: '0.813rem',
                            color: 'var(--admin-text-secondary)'
                          }}>
                            {user.firstName} {user.lastName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--admin-text-primary)'
                    }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        backgroundColor: user.role === 'ADMIN' ? '#DBEAFE' : user.role === 'EDITOR' ? '#F3E5F5' : '#E8F5E9',
                        color: user.role === 'ADMIN' ? '#1E40AF' : user.role === 'EDITOR' ? '#6B21A8' : '#15803D'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: user.isActive ? '#10B981' : '#9CA3AF'
                        }}></span>
                        <span style={{
                          fontSize: '0.875rem',
                          color: 'var(--admin-text-primary)'
                        }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.mfaEnabled && (
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.688rem',
                            fontWeight: 600,
                            backgroundColor: '#D1FAE5',
                            color: '#065F46'
                          }}>
                            MFA
                          </span>
                        )}
                        {!user.emailVerified && (
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.688rem',
                            fontWeight: 600,
                            backgroundColor: '#FEF3C7',
                            color: '#92400E'
                          }}>
                            Unverified
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--admin-text-secondary)'
                    }}>
                      {user.lastLogin
                        ? format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm')
                        : 'Never'
                      }
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--admin-text-primary)'
                    }}>
                      {user._count.sessions}
                    </td>
                    <td style={{
                      padding: '1rem',
                      fontSize: '0.875rem',
                      color: 'var(--admin-text-secondary)'
                    }}>
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        justifyContent: 'flex-end'
                      }}>
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.813rem',
                            fontWeight: 500,
                            border: '1px solid var(--admin-border)',
                            borderRadius: '0.5rem',
                            backgroundColor: 'white',
                            color: 'var(--admin-text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(user.id, user.username)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.813rem',
                            fontWeight: 500,
                            border: '1px solid #FCA5A5',
                            borderRadius: '0.5rem',
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div
            onClick={() => setShowCreateModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--admin-text-primary)'
                }}>
                  Create New User
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--admin-text-secondary)',
                    width: '30px',
                    height: '30px',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateUser}>
                {formError && (
                  <div style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.875rem'
                    }}>
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.875rem'
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.875rem'
                    }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.875rem'
                    }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: 'var(--admin-text-primary)',
                    fontSize: '0.875rem'
                  }}>
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.875rem'
                    }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      minLength={8}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    <small style={{
                      display: 'block',
                      marginTop: '0.25rem',
                      color: 'var(--admin-text-secondary)',
                      fontSize: '0.75rem'
                    }}>
                      Minimum 8 characters
                    </small>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.875rem'
                    }}>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.5rem'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.75rem',
                      backgroundColor: 'white',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.75rem',
                      backgroundColor: 'var(--admin-accent)',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          table tbody tr:hover {
            background-color: var(--admin-bg);
          }

          button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }

          button:active {
            transform: translateY(0);
          }

          input:focus,
          select:focus {
            outline: none;
            border-color: var(--admin-accent);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          @media (max-width: 768px) {
            table {
              font-size: 0.813rem;
            }

            th, td {
              padding: 0.75rem 0.5rem !important;
            }

            button {
              font-size: 0.75rem !important;
              padding: 0.25rem 0.5rem !important;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  )
}
