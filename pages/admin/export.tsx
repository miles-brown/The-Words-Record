/**
 * Admin Export Page - Rebuilt to match Admin Design System
 * Export data in various formats with filtering options
 */

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

export default function ExportPage() {
  const [selectedType, setSelectedType] = useState('cases')
  const [selectedFormat, setSelectedFormat] = useState('json')
  const [includeRelations, setIncludeRelations] = useState(true)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        type: selectedType,
        format: selectedFormat,
        includeRelations: includeRelations.toString(),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      })

      const response = await fetch(`/api/admin/export?${params}`, {
        credentials: 'include',
        method: 'GET'
      })

      if (response.ok) {
        // Trigger download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedType}-export-${Date.now()}.${selectedFormat}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to export data')
      }
    } catch (err) {
      setError('An error occurred while exporting data')
    } finally {
      setExporting(false)
    }
  }

  const dataTypes = [
    { value: 'cases', label: 'Cases', icon: '📁', description: 'Export all cases with their metadata' },
    { value: 'statements', label: 'Statements', icon: '💬', description: 'Export all statements' },
    { value: 'people', label: 'People', icon: '👤', description: 'Export all person profiles' },
    { value: 'organizations', label: 'Organizations', icon: '🏢', description: 'Export all organizations' },
    { value: 'sources', label: 'Sources', icon: '📰', description: 'Export all source references' },
    { value: 'all', label: 'Complete Database', icon: '💾', description: 'Export everything (large file)' }
  ]

  const exportFormats = [
    { value: 'json', label: 'JSON', icon: '{ }', description: 'JavaScript Object Notation - structured data' },
    { value: 'csv', label: 'CSV', icon: '📊', description: 'Comma Separated Values - for spreadsheets' },
    { value: 'xlsx', label: 'Excel', icon: '📗', description: 'Microsoft Excel workbook' }
  ]

  return (
    <>
      <Head>
        <title>Export Data - TWR Admin</title>
      </Head>

      <AdminLayout title="Export Data">
        <div className="export-page">
          {/* Page Header */}
          <div style={{
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--admin-text-primary)',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              📥 Export Data
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--admin-text-secondary)',
              margin: 0
            }}>
              Download your data in various formats for backup, analysis, or migration
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {/* Export Configuration Card */}
          <div style={{
            backgroundColor: 'var(--admin-card-bg)',
            border: '1px solid var(--admin-border)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: 'var(--admin-shadow-light)'
          }}>
            {/* Step 1: Select Data Type */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--admin-text-primary)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--admin-accent)',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>1</span>
                Select Data Type
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1rem'
              }}>
                {dataTypes.map((type) => (
                  <label
                    key={type.value}
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: '0.75rem',
                      padding: '1rem',
                      border: `2px solid ${selectedType === type.value ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: selectedType === type.value ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                    }}
                  >
                    <input
                      type="radio"
                      name="dataType"
                      value={type.value}
                      checked={selectedType === type.value}
                      onChange={(e) => setSelectedType(e.target.value)}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 600,
                        color: 'var(--admin-text-primary)',
                        marginBottom: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>{type.icon}</span>
                        {type.label}
                      </div>
                      <div style={{
                        fontSize: '0.813rem',
                        color: 'var(--admin-text-secondary)',
                        lineHeight: '1.4'
                      }}>
                        {type.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Select Format */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--admin-text-primary)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--admin-accent)',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>2</span>
                Select Export Format
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {exportFormats.map((format) => (
                  <label
                    key={format.value}
                    style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: '0.75rem',
                      padding: '1rem',
                      border: `2px solid ${selectedFormat === format.value ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: selectedFormat === format.value ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                    }}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.value}
                      checked={selectedFormat === format.value}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 600,
                        color: 'var(--admin-text-primary)',
                        marginBottom: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.125rem' }}>{format.icon}</span>
                        {format.label}
                      </div>
                      <div style={{
                        fontSize: '0.813rem',
                        color: 'var(--admin-text-secondary)',
                        lineHeight: '1.4'
                      }}>
                        {format.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 3: Export Options */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: 'var(--admin-text-primary)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: '50%',
                  backgroundColor: 'var(--admin-accent)',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>3</span>
                Export Options
              </h3>

              {/* Include Relations Checkbox */}
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--admin-bg)',
                borderRadius: '0.75rem',
                marginBottom: '1rem'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={includeRelations}
                    onChange={(e) => setIncludeRelations(e.target.checked)}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{
                      fontWeight: 500,
                      color: 'var(--admin-text-primary)'
                    }}>
                      Include related data
                    </span>
                    <p style={{
                      fontSize: '0.813rem',
                      color: 'var(--admin-text-secondary)',
                      margin: '0.25rem 0 0 0'
                    }}>
                      Include relationships (e.g., statements with their people and organizations)
                    </p>
                  </div>
                </label>
              </div>

              {/* Date Range Filter */}
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--admin-bg)',
                borderRadius: '0.75rem'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--admin-text-primary)',
                  fontSize: '0.875rem'
                }}>
                  Filter by Date Range (Optional)
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '0.75rem',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }}
                  />
                  <span style={{ color: 'var(--admin-text-secondary)', fontWeight: 500 }}>to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '0.75rem',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div style={{
              paddingTop: '2rem',
              borderTop: '1px solid var(--admin-border)',
              textAlign: 'center'
            }}>
              <button
                onClick={handleExport}
                disabled={exporting}
                style={{
                  padding: '1rem 2.5rem',
                  background: exporting ? '#9CA3AF' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: exporting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: exporting ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {exporting ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff40',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }}></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '1.25rem' }}>⬇️</span>
                    Export {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} as {selectedFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Information Card */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderLeft: '4px solid var(--admin-accent)',
            borderRadius: '0.75rem'
          }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--admin-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
              Export Information
            </h4>
            <ul style={{
              margin: '0 0 1rem 1.5rem',
              padding: 0,
              color: 'var(--admin-text-primary)'
            }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <strong>JSON:</strong> Best for developers and data migration. Preserves all data types and structures.
              </li>
              <li style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <strong>CSV:</strong> Best for spreadsheets and data analysis. Each data type exports as a separate file.
              </li>
              <li style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <strong>Excel:</strong> Best for non-technical users. Each data type appears as a separate sheet.
              </li>
            </ul>
            <p style={{
              margin: 0,
              color: 'var(--admin-text-secondary)',
              fontSize: '0.813rem',
              fontStyle: 'italic'
            }}>
              <strong>Note:</strong> Large exports may take several minutes to complete. The file will download automatically when ready.
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .export-page input[type="radio"]:focus {
            outline: 2px solid var(--admin-accent);
            outline-offset: 2px;
          }

          .export-page input[type="checkbox"]:focus {
            outline: 2px solid var(--admin-accent);
            outline-offset: 2px;
          }

          .export-page input[type="date"]:focus {
            outline: none;
            border-color: var(--admin-accent);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          @media (max-width: 768px) {
            .export-page > div:first-child {
              margin-bottom: 1.5rem;
            }

            .export-page > div:first-child h2 {
              font-size: 1.25rem;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
