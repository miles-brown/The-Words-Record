/**
 * Admin Statements Management
 * Create, edit, and manage statements with response linking
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

interface Statement {
  id: string
  content: string
  statementDate: string
  statementType: string
  person: { name: string; slug: string } | null
  organization: { name: string } | null
  case: { title: string; slug: string } | null
  respondsTo: { content: string; person: { name: string } | null } | null
  _count: { responses: number }
}

interface Person {
  id: string
  name: string
  slug: string
  profession: string | null
}

interface StatementFormData {
  content: string
  context: string
  statementDate: string
  statementType: 'ORIGINAL' | 'RESPONSE'
  respondsToId: string
  personId: string
  caseId: string
}

export default function AdminStatements() {
  const [statements, setStatements] = useState<Statement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<StatementFormData>({
    content: '',
    context: '',
    statementDate: new Date().toISOString().split('T')[0],
    statementType: 'ORIGINAL',
    respondsToId: '',
    personId: '',
    caseId: ''
  })

  // For searchable dropdowns
  const [statementSearchTerm, setStatementSearchTerm] = useState('')
  const [availableStatements, setAvailableStatements] = useState<Statement[]>([])
  const [showStatementDropdown, setShowStatementDropdown] = useState(false)
  const [selectedParentStatement, setSelectedParentStatement] = useState<Statement | null>(null)

  const router = useRouter()

  useEffect(() => {
    fetchStatements()
  }, [])

  useEffect(() => {
    if (formData.statementType === 'RESPONSE' && statementSearchTerm.length > 2) {
      searchParentStatements(statementSearchTerm)
    }
  }, [statementSearchTerm, formData.statementType])

  const fetchStatements = async () => {
    try {
      const response = await fetch('/api/admin/statements', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Failed to fetch statements')
      }

      const data = await response.json()
      setStatements(data.statements || [])
    } catch (error) {
      console.error('Error fetching statements:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchParentStatements = async (query: string) => {
    try {
      const response = await fetch(`/api/admin/statements/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableStatements(data.statements || [])
      }
    } catch (error) {
      console.error('Error searching statements:', error)
    }
  }

  const handleSelectParentStatement = (statement: Statement) => {
    setSelectedParentStatement(statement)
    setFormData({ ...formData, respondsToId: statement.id })
    setShowStatementDropdown(false)
    setStatementSearchTerm('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingId
      ? `/api/admin/statements/${editingId}`
      : '/api/admin/statements'

    const method = editingId ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save statement')

      await fetchStatements()
      resetForm()
    } catch (error) {
      console.error('Error saving statement:', error)
      alert('Failed to save statement')
    }
  }

  const resetForm = () => {
    setFormData({
      content: '',
      context: '',
      statementDate: new Date().toISOString().split('T')[0],
      statementType: 'ORIGINAL',
      respondsToId: '',
      personId: '',
      caseId: ''
    })
    setSelectedParentStatement(null)
    setEditingId(null)
    setShowForm(false)
  }

  const filteredStatements = statements.filter(s =>
    s.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.person?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.case?.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout title="Statements">
      <div className="admin-statements">
        <div className="page-header">
          <h1>📰 Statements Management</h1>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Statement'}
          </button>
        </div>

        {showForm && (
          <div className="statement-form">
            <h2>{editingId ? 'Edit Statement' : 'Create New Statement'}</h2>

            <form onSubmit={handleSubmit}>
              {/* Statement Type Selector */}
              <div className="form-group">
                <label htmlFor="statementType">Statement Type *</label>
                <select
                  id="statementType"
                  value={formData.statementType}
                  onChange={(e) => setFormData({
                    ...formData,
                    statementType: e.target.value as 'ORIGINAL' | 'RESPONSE',
                    respondsToId: e.target.value === 'ORIGINAL' ? '' : formData.respondsToId
                  })}
                  required
                >
                  <option value="ORIGINAL">Original Statement</option>
                  <option value="RESPONSE">Response Statement</option>
                </select>
                <small>
                  {formData.statementType === 'ORIGINAL'
                    ? 'An original, standalone statement'
                    : 'A response to another statement'
                  }
                </small>
              </div>

              {/* Parent Statement Selector - Only show for RESPONSE type */}
              {formData.statementType === 'RESPONSE' && (
                <div className="form-group">
                  <label htmlFor="respondsTo">Responds To *</label>

                  {selectedParentStatement ? (
                    <div className="selected-statement">
                      <div className="selected-statement-content">
                        <strong>{selectedParentStatement.person?.name || 'Unknown'}</strong>
                        <p>"{selectedParentStatement.content.substring(0, 150)}..."</p>
                        <small>{new Date(selectedParentStatement.statementDate).toLocaleDateString()}</small>
                      </div>
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => {
                          setSelectedParentStatement(null)
                          setFormData({ ...formData, respondsToId: '' })
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div className="searchable-dropdown">
                      <input
                        type="text"
                        placeholder="Search for statement to respond to..."
                        value={statementSearchTerm}
                        onChange={(e) => {
                          setStatementSearchTerm(e.target.value)
                          setShowStatementDropdown(true)
                        }}
                        onFocus={() => setShowStatementDropdown(true)}
                      />

                      {showStatementDropdown && availableStatements.length > 0 && (
                        <div className="dropdown-results">
                          {availableStatements.map((stmt) => (
                            <div
                              key={stmt.id}
                              className="dropdown-item"
                              onClick={() => handleSelectParentStatement(stmt)}
                            >
                              <div className="dropdown-item-header">
                                <strong>{stmt.person?.name || stmt.organization?.name || 'Unknown'}</strong>
                                <span className="dropdown-item-date">
                                  {new Date(stmt.statementDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="dropdown-item-content">
                                "{stmt.content.substring(0, 100)}..."
                              </div>
                              <div className="dropdown-item-meta">
                                {stmt.case?.title && <span className="case-label">{stmt.case.title}</span>}
                                {stmt._count.responses > 0 && (
                                  <span className="response-count">{stmt._count.responses} responses</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedParentStatement && (
                    <small className="response-chain-preview">
                      ✓ This statement will be linked as a response and appear in the statement thread
                    </small>
                  )}
                </div>
              )}

              {/* Response Chain Preview */}
              {formData.statementType === 'RESPONSE' && selectedParentStatement && (
                <div className="response-chain-preview-box">
                  <h4>Response Chain Preview</h4>
                  <div className="chain-preview">
                    <div className="chain-item parent">
                      <div className="chain-marker">○</div>
                      <div className="chain-content">
                        <strong>{selectedParentStatement.person?.name || 'Unknown'}</strong>
                        <p>"{selectedParentStatement.content.substring(0, 80)}..."</p>
                        <small>Original Statement</small>
                      </div>
                    </div>
                    <div className="chain-connector">↓</div>
                    <div className="chain-item current">
                      <div className="chain-marker current">●</div>
                      <div className="chain-content">
                        <strong>New Response</strong>
                        <p>{formData.content ? `"${formData.content.substring(0, 80)}..."` : '(Your response will appear here)'}</p>
                        <small>Response Statement</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Statement Content */}
              <div className="form-group">
                <label htmlFor="content">Statement Content *</label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                  placeholder="Enter the statement content..."
                />
                <small>{formData.content.length} characters</small>
              </div>

              {/* Context */}
              <div className="form-group">
                <label htmlFor="context">Context</label>
                <textarea
                  id="context"
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  rows={3}
                  placeholder="Optional context or background..."
                />
              </div>

              {/* Statement Date */}
              <div className="form-group">
                <label htmlFor="statementDate">Statement Date *</label>
                <input
                  type="date"
                  id="statementDate"
                  value={formData.statementDate}
                  onChange={(e) => setFormData({ ...formData, statementDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Statement' : 'Create Statement'}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search statements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Statements List */}
        <div className="statements-list">
          {loading ? (
            <div className="loading">Loading statements...</div>
          ) : filteredStatements.length === 0 ? (
            <div className="empty-state">
              <p>No statements found</p>
            </div>
          ) : (
            filteredStatements.map((stmt) => (
              <div key={stmt.id} className="statement-card">
                <div className="statement-header">
                  <div className="statement-author">
                    {stmt.person?.name || stmt.organization?.name || 'Unknown'}
                  </div>
                  <div className="statement-badges">
                    {stmt.statementType === 'RESPONSE' && (
                      <span className="badge badge-response">Response</span>
                    )}
                    {stmt.respondsTo && (
                      <span className="badge badge-linked">Linked</span>
                    )}
                    {stmt._count.responses > 0 && (
                      <span className="badge badge-has-responses">
                        {stmt._count.responses} {stmt._count.responses === 1 ? 'response' : 'responses'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="statement-content">
                  "{stmt.content.substring(0, 200)}{stmt.content.length > 200 ? '...' : ''}"
                </div>

                {stmt.respondsTo && (
                  <div className="responds-to-info">
                    ↩️ Responds to: "{stmt.respondsTo.content.substring(0, 80)}..."
                    by {stmt.respondsTo.person?.name || 'Unknown'}
                  </div>
                )}

                <div className="statement-meta">
                  <span>{new Date(stmt.statementDate).toLocaleDateString()}</span>
                  {stmt.case && (
                    <span className="case-link">
                      Case: <Link href={`/statements/${stmt.case.slug}`}>{stmt.case.title}</Link>
                    </span>
                  )}
                </div>

                <div className="statement-actions">
                  <Link href={`/statements/${stmt.case?.slug}`}>
                    <button type="button" className="btn-view">View</button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-statements {
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin: 0;
          font-size: 2rem;
        }

        .btn-primary, .btn-secondary, .btn-view, .btn-remove {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
          margin-left: 1rem;
        }

        .btn-view {
          background: #f39c12;
          color: white;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .btn-remove {
          background: #e74c3c;
          color: white;
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .statement-form {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .statement-form h2 {
          margin-top: 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-group small {
          display: block;
          margin-top: 0.5rem;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .searchable-dropdown {
          position: relative;
        }

        .searchable-dropdown input {
          width: 100%;
        }

        .dropdown-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 400px;
          overflow-y: auto;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 10;
          margin-top: 0.25rem;
        }

        .dropdown-item {
          padding: 1rem;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdown-item:hover {
          background: #f8f9fa;
        }

        .dropdown-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .dropdown-item-header strong {
          color: #2c3e50;
        }

        .dropdown-item-date {
          font-size: 0.85rem;
          color: #7f8c8d;
        }

        .dropdown-item-content {
          color: #555;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }

        .dropdown-item-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
        }

        .case-label {
          color: #3498db;
        }

        .response-count {
          color: #9b59b6;
        }

        .selected-statement {
          background: #e8f5e9;
          border: 2px solid #4caf50;
          border-radius: 6px;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .selected-statement-content {
          flex: 1;
        }

        .selected-statement-content strong {
          display: block;
          color: #2e7d32;
          margin-bottom: 0.5rem;
        }

        .selected-statement-content p {
          margin: 0.5rem 0;
          color: #555;
        }

        .selected-statement-content small {
          color: #7f8c8d;
        }

        .response-chain-preview {
          color: #27ae60;
          font-weight: 500;
        }

        .response-chain-preview-box {
          background: #f0f8ff;
          border: 2px solid #3498db;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .response-chain-preview-box h4 {
          margin-top: 0;
          color: #2c3e50;
        }

        .chain-preview {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .chain-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .chain-marker {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #7f8c8d;
          background: white;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .chain-marker.current {
          background: #3498db;
          border-color: #3498db;
        }

        .chain-content {
          flex: 1;
        }

        .chain-content strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .chain-content p {
          margin: 0.25rem 0;
          color: #555;
          font-style: italic;
        }

        .chain-content small {
          color: #7f8c8d;
          font-size: 0.85rem;
        }

        .chain-connector {
          text-align: center;
          font-size: 1.5rem;
          color: #3498db;
          padding: 0.5rem 0;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .search-bar {
          margin-bottom: 1.5rem;
        }

        .search-bar input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .statements-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .statement-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .statement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .statement-author {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .statement-badges {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .badge-response {
          background: #e3f2fd;
          color: #1976d2;
        }

        .badge-linked {
          background: #e8f5e9;
          color: #388e3c;
        }

        .badge-has-responses {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .statement-content {
          font-size: 1.05rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          color: #2c3e50;
        }

        .responds-to-info {
          background: #f8f9fa;
          border-left: 3px solid #3498db;
          padding: 0.75rem;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          color: #555;
        }

        .statement-meta {
          display: flex;
          gap: 1.5rem;
          font-size: 0.9rem;
          color: #7f8c8d;
          margin-bottom: 1rem;
        }

        .case-link {
          color: #3498db;
        }

        .statement-actions {
          display: flex;
          gap: 0.5rem;
        }

        .loading, .empty-state {
          text-align: center;
          padding: 3rem;
          color: #7f8c8d;
        }

        @media (max-width: 768px) {
          .admin-statements {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .statement-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .statement-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </AdminLayout>
  )
}
