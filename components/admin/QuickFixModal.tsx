import { useState } from 'react'
import { DynamicFormField } from './forms/DynamicFormField'
import { PERSON_FIELDS } from '@/lib/admin/personFieldSchema'

interface QuickFixModalProps {
  personSlug: string
  personName: string
  missingFields: string[]
  onClose: () => void
  onSave: () => void
}

export function QuickFixModal({ personSlug, personName, missingFields, onClose, onSave }: QuickFixModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(missingFields.slice(0, 5)))

  // Get field schemas for missing fields
  const fieldSchemas = PERSON_FIELDS.filter(f => missingFields.includes(f.name))

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleField = (fieldName: string) => {
    setSelectedFields(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fieldName)) {
        newSet.delete(fieldName)
      } else {
        newSet.add(fieldName)
      }
      return newSet
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Only submit values for selected fields
      const submitData: Record<string, any> = {}
      Array.from(selectedFields).forEach(field => {
        if (formData[field] !== undefined) {
          submitData[field] = formData[field]
        }
      })

      const response = await fetch(`/api/admin/people/${personSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update person')
      }
    } catch (err) {
      setError('An error occurred while updating')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quick Fix: {personName}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {error && (
          <div className="alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="helper-text">
              Fill in the missing fields below. Check the boxes next to fields you want to update.
            </p>

            <div className="fields-list">
              {fieldSchemas.map(field => (
                <div key={field.name} className={`field-row ${selectedFields.has(field.name) ? 'selected' : ''}`}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedFields.has(field.name)}
                      onChange={() => toggleField(field.name)}
                    />
                    <span className="field-label">{field.label}</span>
                  </label>

                  {selectedFields.has(field.name) && (
                    <div className="field-input">
                      <DynamicFormField
                        field={field}
                        value={formData[field.name]}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {fieldSchemas.length === 0 && (
              <div className="empty-state">
                <p>No missing fields found for this person.</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving || selectedFields.size === 0}>
              {saving ? 'Saving...' : `Update ${selectedFields.size} Field${selectedFields.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
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
          max-width: 800px;
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

        .alert-error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 1rem;
          margin: 1rem 1.5rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .helper-text {
          margin: 0 0 1.5rem 0;
          color: #64748b;
          font-size: 0.9375rem;
        }

        .fields-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .field-row {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.2s;
        }

        .field-row.selected {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-label input[type="checkbox"] {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
        }

        .field-label {
          font-weight: 600;
          color: #0f172a;
          font-size: 0.9375rem;
        }

        .field-input {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .empty-state p {
          margin: 0;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1.5rem;
          border-top: 2px solid #e5e7eb;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #475569;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .modal-content {
            max-height: 95vh;
            margin: 0.5rem;
          }

          .modal-header h2 {
            font-size: 1.25rem;
          }

          .modal-footer {
            flex-direction: column-reverse;
          }

          .modal-footer button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
