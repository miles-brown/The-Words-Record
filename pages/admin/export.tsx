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
    { value: 'cases', label: 'Cases', description: 'Export all cases with their metadata' },
    { value: 'statements', label: 'Statements', description: 'Export all statements' },
    { value: 'people', label: 'People', description: 'Export all person profiles' },
    { value: 'organizations', label: 'Organizations', description: 'Export all organizations' },
    { value: 'sources', label: 'Sources', description: 'Export all source references' },
    { value: 'all', label: 'Complete Database', description: 'Export everything (large file)' }
  ]

  const exportFormats = [
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation - structured data' },
    { value: 'csv', label: 'CSV', description: 'Comma Separated Values - for spreadsheets' },
    { value: 'xlsx', label: 'Excel (XLSX)', description: 'Microsoft Excel workbook' }
  ]

  return (
    <>
      <Head>
        <title>Export Data - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Export Data">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>Export Data</h1>
              <p className="page-subtitle">Download your data in various formats</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="export-container">
            <div className="export-section">
              <h3>1. Select Data Type</h3>
              <div className="options-grid">
                {dataTypes.map((type) => (
                  <label key={type.value} className={`option-card ${selectedType === type.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="dataType"
                      value={type.value}
                      checked={selectedType === type.value}
                      onChange={(e) => setSelectedType(e.target.value)}
                    />
                    <div className="option-content">
                      <div className="option-title">{type.label}</div>
                      <div className="option-description">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="export-section">
              <h3>2. Select Export Format</h3>
              <div className="options-grid">
                {exportFormats.map((format) => (
                  <label key={format.value} className={`option-card ${selectedFormat === format.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.value}
                      checked={selectedFormat === format.value}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                    />
                    <div className="option-content">
                      <div className="option-title">{format.label}</div>
                      <div className="option-description">{format.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="export-section">
              <h3>3. Export Options</h3>

              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={includeRelations}
                    onChange={(e) => setIncludeRelations(e.target.checked)}
                  />
                  <span>Include related data</span>
                </label>
                <small>Include relationships (e.g., statements with their people and organizations)</small>
              </div>

              <div className="date-range-group">
                <label>Filter by Date Range (Optional)</label>
                <div className="date-inputs">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    placeholder="Start date"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>

            <div className="export-actions">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="btn-export"
              >
                {exporting ? (
                  <>
                    <span className="spinner"></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <span>⬇</span>
                    Export {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} as {selectedFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>

            <div className="export-info">
              <h4>ℹ️ Export Information</h4>
              <ul>
                <li><strong>JSON:</strong> Best for developers and data migration. Preserves all data types and structures.</li>
                <li><strong>CSV:</strong> Best for spreadsheets and data analysis. Each data type exports as a separate file.</li>
                <li><strong>Excel:</strong> Best for non-technical users. Each data type appears as a separate sheet.</li>
              </ul>
              <p><strong>Note:</strong> Large exports may take several minutes to complete.</p>
            </div>
          </div>
        </div>

        <style jsx>{`
          .admin-page {
            max-width: 900px;
          }

          .page-header {
            margin-bottom: 2rem;
          }

          .page-header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 1.875rem;
            font-weight: 700;
            color: #0f172a;
          }

          .page-subtitle {
            margin: 0;
            font-size: 0.9375rem;
            color: #64748b;
          }

          .error-message {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 1rem 1.25rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-weight: 500;
          }

          .export-container {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
          }

          .export-section {
            margin-bottom: 2.5rem;
          }

          .export-section:last-of-type {
            margin-bottom: 0;
          }

          .export-section h3 {
            margin: 0 0 1.5rem 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: #0f172a;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #e5e7eb;
          }

          .options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
          }

          .option-card {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.25rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .option-card:hover {
            border-color: #3b82f6;
            background: #f8fafc;
          }

          .option-card.selected {
            border-color: #3b82f6;
            background: #eff6ff;
          }

          .option-card input[type="radio"] {
            margin-top: 0.25rem;
          }

          .option-content {
            flex: 1;
          }

          .option-title {
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 0.25rem;
          }

          .option-description {
            font-size: 0.875rem;
            color: #64748b;
          }

          .checkbox-group {
            margin-bottom: 1.5rem;
          }

          .checkbox-group label {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            font-weight: 500;
          }

          .checkbox-group input[type="checkbox"] {
            width: auto;
          }

          .checkbox-group small {
            display: block;
            margin-top: 0.5rem;
            margin-left: 1.75rem;
            color: #64748b;
            font-size: 0.875rem;
          }

          .date-range-group label {
            display: block;
            margin-bottom: 0.75rem;
            font-weight: 600;
            color: #0f172a;
          }

          .date-inputs {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .date-inputs input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.9375rem;
          }

          .date-inputs input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .export-actions {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 2px solid #e5e7eb;
            text-align: center;
          }

          .btn-export {
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
          }

          .btn-export:hover:not(:disabled) {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
          }

          .btn-export:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #ffffff40;
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .export-info {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }

          .export-info h4 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #0f172a;
          }

          .export-info ul {
            margin: 0 0 1rem 1.5rem;
            padding: 0;
          }

          .export-info li {
            margin-bottom: 0.5rem;
            color: #475569;
            font-size: 0.9375rem;
          }

          .export-info p {
            margin: 0;
            color: #64748b;
            font-size: 0.875rem;
            font-style: italic;
          }

          @media (max-width: 768px) {
            .export-container {
              padding: 1.5rem;
            }

            .options-grid {
              grid-template-columns: 1fr;
            }

            .date-inputs {
              flex-direction: column;
              align-items: stretch;
            }

            .btn-export {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
