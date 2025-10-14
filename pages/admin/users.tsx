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
      <div className="users-page">
        <div className="page-header">
          <div>
            <h2>Users</h2>
            <p>Manage admin users and their permissions</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create User
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Sessions</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={!user.isActive ? 'inactive' : ''}>
                    <td>
                      <div className="user-cell">
                        <strong>{user.username}</strong>
                        {(user.firstName || user.lastName) && (
                          <small>{user.firstName} {user.lastName}</small>
                        )}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span className={`status-dot ${user.isActive ? 'active' : 'inactive'}`}></span>
                        {user.isActive ? 'Active' : 'Inactive'}
                        {user.mfaEnabled && <span className="mfa-badge">MFA</span>}
                        {!user.emailVerified && <span className="unverified-badge">Unverified</span>}
                      </div>
                    </td>
                    <td>
                      {user.lastLogin
                        ? format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm')
                        : 'Never'
                      }
                    </td>
                    <td className="center">{user._count.sessions}</td>
                    <td>{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn-sm btn-secondary"
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-danger"
                          onClick={() => deleteUser(user.id, user.username)}
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
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create New User</h3>
                <button type="button" onClick={() => setShowCreateModal(false)}>✕</button>
              </div>

              <form onSubmit={handleCreateUser}>
                {formError && (
                  <div className="form-error">{formError}</div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      minLength={8}
                    />
                    <small>Minimum 8 characters</small>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .users-page {
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .page-header h2 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
          font-size: 1.75rem;
        }

        .page-header p {
          margin: 0;
          color: #6c757d;
        }

        .btn-primary {
          background: #3498db;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-danger {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }

        .btn-danger:hover {
          background: #c0392b;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.813rem;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }

        .users-table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          background: #f8f9fa;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #2c3e50;
          border-bottom: 2px solid #e0e6ed;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .users-table td {
          padding: 1rem;
          border-bottom: 1px solid #e0e6ed;
        }

        .users-table tr.inactive {
          opacity: 0.6;
        }

        .users-table tr:hover {
          background: #f8f9fa;
        }

        .user-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .user-cell strong {
          color: #2c3e50;
        }

        .user-cell small {
          color: #6c757d;
          font-size: 0.813rem;
        }

        .role-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-admin {
          background: #e3f2fd;
          color: #1976d2;
        }

        .role-editor {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .role-viewer {
          background: #e8f5e9;
          color: #388e3c;
        }

        .status-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.active {
          background: #27ae60;
        }

        .status-dot.inactive {
          background: #95a5a6;
        }

        .mfa-badge {
          background: #2ecc71;
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 10px;
          font-size: 0.688rem;
          font-weight: 600;
        }

        .unverified-badge {
          background: #f39c12;
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 10px;
          font-size: 0.688rem;
          font-weight: 600;
        }

        .center {
          text-align: center;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .modal-header button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6c757d;
          padding: 0;
          width: 30px;
          height: 30px;
          border-radius: 4px;
        }

        .modal-header button:hover {
          background: #f8f9fa;
        }

        .form-error {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2c3e50;
          font-size: 0.875rem;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e0e6ed;
          border-radius: 4px;
          font-size: 0.938rem;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3498db;
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #6c757d;
          font-size: 0.813rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .users-table {
            font-size: 0.875rem;
          }

          .users-table th,
          .users-table td {
            padding: 0.75rem 0.5rem;
          }

          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </AdminLayout>
  )
}
