import React, { useState } from 'react'
import { FIELD_CATEGORIES, getAllFieldsByCategory, FieldSchema } from '@/lib/admin/personFieldSchema'
import { DynamicFormField } from './DynamicFormField'

interface TabbedFormSectionProps {
  formData: any
  onChange: (name: string, value: any) => void
  errors?: Record<string, string>
}

export function TabbedFormSection({ formData, onChange, errors = {} }: TabbedFormSectionProps) {
  const [activeTab, setActiveTab] = useState('basicInfo')
  const fieldsByCategory = getAllFieldsByCategory()

  // Filter out categories with no fields or only disabled fields
  const availableCategories = Object.entries(FIELD_CATEGORIES).filter(([key]) => {
    const fields = fieldsByCategory[key] || []
    return fields.length > 0 && fields.some(f => !f.disabled || formData[f.name] != null)
  })

  // Group categories into logical sections
  const categoryGroups = {
    'Core Information': ['basicInfo', 'biographical', 'demographics', 'nationality'],
    'Professional': ['professional', 'currentPosition', 'education'],
    'Public Presence': ['publicProfile', 'influence', 'socialMedia', 'mediaPresence'],
    'Affiliations': ['political', 'relationships', 'religion'],
    'Issues & Status': ['controversy', 'legal', 'flags'],
    'Tracking': ['statistics', 'activityTracking', 'verification'],
    'Details': ['location', 'contact', 'notes', 'metadata']
  }

  return (
    <div className="tabbed-form-section">
      {/* Category Group Tabs */}
      <div className="tab-groups">
        {Object.entries(categoryGroups).map(([groupName, categories]) => (
          <div key={groupName} className="tab-group">
            <div className="group-label">{groupName}</div>
            <div className="group-tabs">
              {categories.map((catKey) => {
                const category = availableCategories.find(([key]) => key === catKey)
                if (!category) return null
                const [key, label] = category
                const fields = fieldsByCategory[key] || []
                const hasError = fields.some(f => errors[f.name])

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`tab-btn ${activeTab === key ? 'active' : ''} ${hasError ? 'has-error' : ''}`}
                  >
                    {label}
                    {hasError && <span className="error-indicator">!</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="tab-content">
        {availableCategories.map(([key, label]) => (
          <div
            key={key}
            className={`tab-panel ${activeTab === key ? 'active' : ''}`}
          >
            {activeTab === key && (
              <>
                <h3 className="section-title">{label}</h3>
                <div className="form-grid">
                  {(fieldsByCategory[key] || []).map((field: FieldSchema) => (
                    <div key={field.name} className={`grid-item ${field.type === 'textarea' ? 'full-width' : ''}`}>
                      <DynamicFormField
                        field={field}
                        value={formData[field.name]}
                        onChange={onChange}
                        error={errors[field.name]}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .tabbed-form-section {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 1px solid #f3f4f6;
        }

        .tab-groups {
          background: #f8fafc;
          border-bottom: 2px solid #e5e7eb;
          padding: 1rem 1.5rem 0.5rem;
        }

        .tab-group {
          margin-bottom: 1rem;
        }

        .tab-group:last-child {
          margin-bottom: 0;
        }

        .group-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .group-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tab-btn {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .tab-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-color: #3b82f6;
          font-weight: 600;
        }

        .tab-btn.has-error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .tab-btn.has-error.active {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-color: #ef4444;
        }

        .error-indicator {
          display: inline-block;
          margin-left: 0.25rem;
          width: 1.125rem;
          height: 1.125rem;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          line-height: 1.125rem;
          text-align: center;
          font-weight: bold;
        }

        .tab-btn.active .error-indicator {
          background: white;
          color: #ef4444;
        }

        .tab-content {
          padding: 2rem;
        }

        .tab-panel {
          display: none;
        }

        .tab-panel.active {
          display: block;
        }

        .section-title {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .grid-item.full-width {
          grid-column: 1 / -1;
        }

        @media (max-width: 768px) {
          .tab-groups {
            padding: 0.75rem 1rem 0.25rem;
          }

          .tab-btn {
            padding: 0.375rem 0.75rem;
            font-size: 0.8125rem;
          }

          .tab-content {
            padding: 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
