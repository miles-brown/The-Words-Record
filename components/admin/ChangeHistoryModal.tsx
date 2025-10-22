import { useState, useEffect } from 'react'
import { PERSON_FIELDS } from '@/lib/admin/personFieldSchema'

interface ChangeHistoryModalProps {
  personSlug: string
  personName: string
  onClose: () => void
}

interface FieldChange {
  field: string
  oldValue: any
  newValue: any
  fieldType: string
}

interface HistoryEntry {
  id: string
  action: string
  timestamp: string
  changes: FieldChange[]
  userId?: string
}

export function ChangeHistoryModal({ personSlug, personName, onClose }: ChangeHistoryModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [personSlug])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/people/${personSlug}/history?limit=50`, { credentials: 'include' })

      if (response.ok) {
        const data = await response.json()
        setHistory(data.history)
        setHasMore(data.pagination.hasMore)
      } else {
        setError('Failed to load change history')
      }
    } catch (err) {
      setError('Failed to load change history')
    } finally {
      setLoading(false)
    }
  }

  const getFieldLabel = (fieldName: string): string => {
    const field = PERSON_FIELDS.find(f => f.name === fieldName)
    return field?.label || fieldName
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '(empty)'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'object') return JSON.stringify(value)
    if (typeof value === 'string' && value.length > 100) return value.substring(0, 100) + '...'
    return String(value)
  }

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Change History: {personName}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading change history...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <span>⚠️</span>
              <p>{error}</p>
              <button onClick={fetchHistory} className="btn-retry">Retry</button>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="empty-state">
              <p>No change history found for this person.</p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="history-timeline">
              {history.map((entry) => (
                <div key={entry.id} className="history-entry">
                  <div className="entry-header">
                    <span className="entry-date">{formatDate(entry.timestamp)}</span>
                    <span className="entry-action">{entry.action}</span>
                  </div>

                  {entry.changes.length > 0 && (
                    <div className="entry-changes">
                      <div className="changes-summary">
                        {entry.changes.length} field{entry.changes.length !== 1 ? 's' : ''} updated
                      </div>

                      <div className="changes-list">
                        {entry.changes.map((change, idx) => (
                          <div key={idx} className="change-item">
                            <div className="change-field">{getFieldLabel(change.field)}</div>
                            <div className="change-values">
                              <div className="old-value">
                                <span className="value-label">From:</span>
                                <span className="value-content">{formatValue(change.oldValue)}</span>
                              </div>
                              <div className="arrow">→</div>
                              <div className="new-value">
                                <span className="value-label">To:</span>
                                <span className="value-content">{formatValue(change.newValue)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {hasMore && (
                <div className="load-more">
                  <p>More history available</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-state span {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .btn-retry {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .history-timeline {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .history-entry {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          background: #fafbfc;
        }

        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .entry-date {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .entry-action {
          padding: 0.25rem 0.625rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .entry-changes {
          border-top: 1px solid #e5e7eb;
          padding-top: 0.75rem;
        }

        .changes-summary {
          font-size: 0.875rem;
          color: #475569;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .changes-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .change-item {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 0.75rem;
        }

        .change-field {
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .change-values {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0.75rem;
          align-items: center;
          font-size: 0.8125rem;
        }

        .old-value, .new-value {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .value-label {
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .value-content {
          color: #0f172a;
          word-break: break-word;
        }

        .old-value .value-content {
          color: #ef4444;
          text-decoration: line-through;
        }

        .new-value .value-content {
          color: #10b981;
          font-weight: 500;
        }

        .arrow {
          color: #94a3b8;
          font-weight: bold;
        }

        .load-more {
          text-align: center;
          padding: 1rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 2px solid #e5e7eb;
        }

        .btn-secondary {
          padding: 0.75rem 1.5rem;
          background: white;
          color: #475569;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        @media (max-width: 768px) {
          .modal-content {
            max-height: 95vh;
          }

          .change-values {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .arrow {
            transform: rotate(90deg);
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}
