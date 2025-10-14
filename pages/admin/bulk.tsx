/**
 * Bulk Operations Management Page
 * Visual interface for batch operations on data
 */

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

type OperationType = 'import' | 'update' | 'delete' | 'export'
type EntityType = 'cases' | 'people' | 'organizations' | 'statements' | 'sources'

interface BulkOperation {
  type: OperationType
  entity: EntityType
  status: 'idle' | 'processing' | 'completed' | 'error'
  progress: number
  total: number
  processed: number
  errors: string[]
  results?: any[]
}

export default function BulkOperationsPage() {
  const [selectedOperation, setSelectedOperation] = useState<OperationType>('import')
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('cases')
  const [operation, setOperation] = useState<BulkOperation | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [updateData, setUpdateData] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Parse file to get preview
      if (file.type === 'application/json' || file.type === 'text/csv') {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            // Preview first few lines
            console.log('File content preview:', content.substring(0, 500))
          } catch (error) {
            console.error('Error reading file:', error)
          }
        }
        reader.readAsText(file)
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Please select a file to import')
      return
    }

    setIsProcessing(true)
    setOperation({
      type: 'import',
      entity: selectedEntity,
      status: 'processing',
      progress: 0,
      total: 0,
      processed: 0,
      errors: []
    })

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('entity', selectedEntity)

    try {
      const response = await fetch('/api/admin/bulk/import', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok) {
        setOperation(prev => prev ? {
          ...prev,
          status: 'completed',
          progress: 100,
          total: result.total,
          processed: result.processed,
          results: result.results
        } : null)
      } else {
        setOperation(prev => prev ? {
          ...prev,
          status: 'error',
          errors: [result.error || 'Import failed']
        } : null)
      }
    } catch (error) {
      setOperation(prev => prev ? {
        ...prev,
        status: 'error',
        errors: ['Network error: ' + (error instanceof Error ? error.message : 'Unknown error')]
      } : null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) {
      alert('Please select items to update')
      return
    }

    setIsProcessing(true)
    setOperation({
      type: 'update',
      entity: selectedEntity,
      status: 'processing',
      progress: 0,
      total: selectedIds.length,
      processed: 0,
      errors: []
    })

    try {
      const response = await fetch('/api/admin/bulk/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: selectedEntity,
          ids: selectedIds,
          updates: updateData
        }),
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok) {
        setOperation(prev => prev ? {
          ...prev,
          status: 'completed',
          progress: 100,
          processed: result.updated,
          results: result.results
        } : null)
      } else {
        setOperation(prev => prev ? {
          ...prev,
          status: 'error',
          errors: [result.error || 'Update failed']
        } : null)
      }
    } catch (error) {
      setOperation(prev => prev ? {
        ...prev,
        status: 'error',
        errors: ['Network error: ' + (error instanceof Error ? error.message : 'Unknown error')]
      } : null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Please select items to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} items? This action cannot be undone.`)) {
      return
    }

    setIsProcessing(true)
    setOperation({
      type: 'delete',
      entity: selectedEntity,
      status: 'processing',
      progress: 0,
      total: selectedIds.length,
      processed: 0,
      errors: []
    })

    try {
      const response = await fetch('/api/admin/bulk/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: selectedEntity,
          ids: selectedIds
        }),
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok) {
        setOperation(prev => prev ? {
          ...prev,
          status: 'completed',
          progress: 100,
          processed: result.deleted
        } : null)
        setSelectedIds([]) // Clear selection after delete
      } else {
        setOperation(prev => prev ? {
          ...prev,
          status: 'error',
          errors: [result.error || 'Delete failed']
        } : null)
      }
    } catch (error) {
      setOperation(prev => prev ? {
        ...prev,
        status: 'error',
        errors: ['Network error: ' + (error instanceof Error ? error.message : 'Unknown error')]
      } : null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    setIsProcessing(true)
    setOperation({
      type: 'export',
      entity: selectedEntity,
      status: 'processing',
      progress: 0,
      total: 0,
      processed: 0,
      errors: []
    })

    try {
      const response = await fetch(`/api/admin/export?entity=${selectedEntity}&format=json`, {
        credentials: 'include'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedEntity}-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setOperation(prev => prev ? {
          ...prev,
          status: 'completed',
          progress: 100
        } : null)
      } else {
        const error = await response.text()
        setOperation(prev => prev ? {
          ...prev,
          status: 'error',
          errors: [error || 'Export failed']
        } : null)
      }
    } catch (error) {
      setOperation(prev => prev ? {
        ...prev,
        status: 'error',
        errors: ['Network error: ' + (error instanceof Error ? error.message : 'Unknown error')]
      } : null)
    } finally {
      setIsProcessing(false)
    }
  }

  const executeOperation = () => {
    switch (selectedOperation) {
      case 'import':
        handleImport()
        break
      case 'update':
        handleBulkUpdate()
        break
      case 'delete':
        handleBulkDelete()
        break
      case 'export':
        handleExport()
        break
    }
  }

  return (
    <>
      <Head>
        <title>Bulk Operations - Admin Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <AdminLayout title="Bulk Operations">
        <div className="bulk-operations">
          {/* Operation Selector */}
          <div className="operation-selector">
            <h2>Select Operation</h2>
            <div className="operation-tabs">
              <button
                className={`tab ${selectedOperation === 'import' ? 'active' : ''}`}
                onClick={() => setSelectedOperation('import')}
              >
                <span className="tab-icon">📤</span>
                <span className="tab-label">Import</span>
                <span className="tab-description">Bulk import from CSV/JSON</span>
              </button>
              <button
                className={`tab ${selectedOperation === 'update' ? 'active' : ''}`}
                onClick={() => setSelectedOperation('update')}
              >
                <span className="tab-icon">✏️</span>
                <span className="tab-label">Update</span>
                <span className="tab-description">Bulk update multiple records</span>
              </button>
              <button
                className={`tab ${selectedOperation === 'delete' ? 'active' : ''}`}
                onClick={() => setSelectedOperation('delete')}
              >
                <span className="tab-icon">🗑️</span>
                <span className="tab-label">Delete</span>
                <span className="tab-description">Bulk delete selected items</span>
              </button>
              <button
                className={`tab ${selectedOperation === 'export' ? 'active' : ''}`}
                onClick={() => setSelectedOperation('export')}
              >
                <span className="tab-icon">📥</span>
                <span className="tab-label">Export</span>
                <span className="tab-description">Export data to file</span>
              </button>
            </div>
          </div>

          {/* Entity Selector */}
          <div className="entity-selector">
            <h2>Select Entity Type</h2>
            <div className="entity-options">
              {(['cases', 'people', 'organizations', 'statements', 'sources'] as EntityType[]).map(entity => (
                <label key={entity} className="entity-option">
                  <input
                    type="radio"
                    name="entity"
                    value={entity}
                    checked={selectedEntity === entity}
                    onChange={(e) => setSelectedEntity(e.target.value as EntityType)}
                  />
                  <div className="option-content">
                    <span className="option-icon">
                      {entity === 'cases' ? '📁' :
                       entity === 'people' ? '👤' :
                       entity === 'organizations' ? '🏢' :
                       entity === 'statements' ? '💬' : '📰'}
                    </span>
                    <span className="option-label">{entity.charAt(0).toUpperCase() + entity.slice(1)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Operation Configuration */}
          <div className="operation-config">
            <h2>Configure {selectedOperation.charAt(0).toUpperCase() + selectedOperation.slice(1)}</h2>

            {selectedOperation === 'import' && (
              <div className="import-config">
                <div className="file-upload">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="upload-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="upload-icon">📁</span>
                    <span>Choose File</span>
                  </button>
                  {selectedFile && (
                    <div className="file-info">
                      <span className="file-name">{selectedFile.name}</span>
                      <span className="file-size">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                      <button className="remove-file" onClick={() => setSelectedFile(null)}>✕</button>
                    </div>
                  )}
                </div>

                <div className="import-instructions">
                  <h3>Import Instructions</h3>
                  <ul>
                    <li>Supported formats: CSV, JSON</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Ensure column headers match database fields</li>
                    <li>Date fields should be in ISO 8601 format</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedOperation === 'update' && (
              <div className="update-config">
                <div className="id-input">
                  <label>Enter IDs (comma-separated)</label>
                  <textarea
                    placeholder="id1, id2, id3..."
                    value={selectedIds.join(', ')}
                    onChange={(e) => setSelectedIds(e.target.value.split(',').map(id => id.trim()).filter(Boolean))}
                  />
                  <span className="id-count">{selectedIds.length} items selected</span>
                </div>

                <div className="update-fields">
                  <h3>Update Fields</h3>
                  <div className="field-inputs">
                    <input
                      type="text"
                      placeholder="Field name"
                      onBlur={(e) => {
                        if (e.target.value) {
                          setUpdateData(prev => ({ ...prev, [e.target.value]: '' }))
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="New value"
                      onChange={(e) => {
                        const fieldName = Object.keys(updateData)[0]
                        if (fieldName) {
                          setUpdateData(prev => ({ ...prev, [fieldName]: e.target.value }))
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedOperation === 'delete' && (
              <div className="delete-config">
                <div className="id-input">
                  <label>Enter IDs to Delete (comma-separated)</label>
                  <textarea
                    placeholder="id1, id2, id3..."
                    value={selectedIds.join(', ')}
                    onChange={(e) => setSelectedIds(e.target.value.split(',').map(id => id.trim()).filter(Boolean))}
                  />
                  <span className="id-count">{selectedIds.length} items will be deleted</span>
                </div>

                <div className="delete-warning">
                  <span className="warning-icon">⚠️</span>
                  <div>
                    <h4>Warning</h4>
                    <p>This action is irreversible. All selected items and their associated data will be permanently deleted.</p>
                  </div>
                </div>
              </div>
            )}

            {selectedOperation === 'export' && (
              <div className="export-config">
                <div className="export-options">
                  <label>
                    <input type="radio" name="format" value="json" defaultChecked />
                    <span>JSON Format</span>
                  </label>
                  <label>
                    <input type="radio" name="format" value="csv" />
                    <span>CSV Format</span>
                  </label>
                  <label>
                    <input type="radio" name="format" value="xml" />
                    <span>XML Format</span>
                  </label>
                </div>

                <div className="export-filters">
                  <h3>Export Filters (Optional)</h3>
                  <input type="date" placeholder="Start Date" />
                  <input type="date" placeholder="End Date" />
                  <input type="text" placeholder="Status filter" />
                </div>
              </div>
            )}
          </div>

          {/* Execute Button */}
          <div className="execute-section">
            <button
              className="execute-button"
              onClick={executeOperation}
              disabled={isProcessing || (selectedOperation === 'import' && !selectedFile) ||
                       ((selectedOperation === 'update' || selectedOperation === 'delete') && selectedIds.length === 0)}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span>Execute {selectedOperation.charAt(0).toUpperCase() + selectedOperation.slice(1)}</span>
                  <span className="arrow">→</span>
                </>
              )}
            </button>
          </div>

          {/* Progress & Results */}
          {operation && (
            <div className="operation-progress">
              <h2>Operation Progress</h2>

              <div className={`status-indicator ${operation.status}`}>
                <span className="status-icon">
                  {operation.status === 'processing' ? '⏳' :
                   operation.status === 'completed' ? '✅' :
                   operation.status === 'error' ? '❌' : '⏸️'}
                </span>
                <span className="status-text">
                  {operation.status === 'processing' ? 'Processing...' :
                   operation.status === 'completed' ? 'Completed Successfully' :
                   operation.status === 'error' ? 'Operation Failed' : 'Idle'}
                </span>
              </div>

              {operation.status === 'processing' && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${operation.progress}%` }} />
                </div>
              )}

              {operation.total > 0 && (
                <div className="progress-stats">
                  <span>Processed: {operation.processed} / {operation.total}</span>
                  <span>Success Rate: {((operation.processed / operation.total) * 100).toFixed(1)}%</span>
                </div>
              )}

              {operation.errors.length > 0 && (
                <div className="error-list">
                  <h3>Errors</h3>
                  {operation.errors.map((error, idx) => (
                    <div key={idx} className="error-item">{error}</div>
                  ))}
                </div>
              )}

              {operation.results && operation.results.length > 0 && (
                <div className="results-preview">
                  <h3>Results Preview</h3>
                  <div className="results-table">
                    {/* Table would go here */}
                    <p>{operation.results.length} items processed</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Operations History */}
          <div className="operations-history">
            <h2>Recent Operations</h2>
            <div className="history-list">
              <div className="history-item">
                <span className="history-type">Import</span>
                <span className="history-entity">Cases</span>
                <span className="history-count">245 items</span>
                <span className="history-date">2 hours ago</span>
                <span className="history-status success">Success</span>
              </div>
              <div className="history-item">
                <span className="history-type">Update</span>
                <span className="history-entity">People</span>
                <span className="history-count">18 items</span>
                <span className="history-date">Yesterday</span>
                <span className="history-status success">Success</span>
              </div>
              <div className="history-item">
                <span className="history-type">Export</span>
                <span className="history-entity">Statements</span>
                <span className="history-count">1,523 items</span>
                <span className="history-date">3 days ago</span>
                <span className="history-status success">Success</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .bulk-operations {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
          }

          /* Operation Selector */
          .operation-selector {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 2rem;
          }

          .operation-selector h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
          }

          .operation-tabs {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
          }

          .tab {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1.5rem;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .tab:hover {
            background: white;
            border-color: #3b82f6;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          }

          .tab.active {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border-color: #3b82f6;
            color: white;
          }

          .tab-icon {
            font-size: 2rem;
          }

          .tab-label {
            font-size: 1rem;
            font-weight: 600;
          }

          .tab-description {
            font-size: 0.75rem;
            opacity: 0.8;
            text-align: center;
          }

          .tab.active .tab-description {
            opacity: 0.9;
          }

          /* Entity Selector */
          .entity-selector {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 2rem;
          }

          .entity-selector h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
          }

          .entity-options {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .entity-option {
            cursor: pointer;
          }

          .entity-option input {
            display: none;
          }

          .option-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1.25rem;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .entity-option input:checked + .option-content {
            background: #eff6ff;
            border-color: #3b82f6;
            color: #3b82f6;
          }

          .option-content:hover {
            background: white;
            border-color: #cbd5e1;
          }

          .option-icon {
            font-size: 1.25rem;
          }

          .option-label {
            font-weight: 600;
          }

          /* Operation Config */
          .operation-config {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 2rem;
          }

          .operation-config h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
          }

          /* Import Config */
          .import-config {
            display: grid;
            gap: 2rem;
          }

          .file-upload {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .upload-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .upload-button:hover {
            background: white;
            border-color: #3b82f6;
            border-style: solid;
          }

          .upload-icon {
            font-size: 1.5rem;
          }

          .file-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 6px;
          }

          .file-name {
            font-weight: 600;
            color: #15803d;
          }

          .file-size {
            font-size: 0.875rem;
            color: #16a34a;
          }

          .remove-file {
            margin-left: auto;
            background: none;
            border: none;
            color: #dc2626;
            cursor: pointer;
            font-size: 1.25rem;
          }

          .import-instructions {
            background: #f8fafc;
            border-radius: 8px;
            padding: 1.5rem;
          }

          .import-instructions h3 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #475569;
          }

          .import-instructions ul {
            margin: 0;
            padding-left: 1.5rem;
            color: #64748b;
          }

          .import-instructions li {
            margin: 0.5rem 0;
          }

          /* Update/Delete Config */
          .update-config, .delete-config {
            display: grid;
            gap: 2rem;
          }

          .id-input {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .id-input label {
            font-weight: 600;
            color: #475569;
          }

          .id-input textarea {
            min-height: 100px;
            padding: 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-family: inherit;
            resize: vertical;
          }

          .id-count {
            font-size: 0.875rem;
            color: #64748b;
          }

          .update-fields h3 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #475569;
          }

          .field-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .field-inputs input {
            padding: 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-family: inherit;
          }

          .delete-warning {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
          }

          .warning-icon {
            font-size: 1.5rem;
          }

          .delete-warning h4 {
            margin: 0 0 0.25rem 0;
            color: #dc2626;
            font-weight: 600;
          }

          .delete-warning p {
            margin: 0;
            color: #7f1d1d;
            font-size: 0.875rem;
          }

          /* Export Config */
          .export-config {
            display: grid;
            gap: 2rem;
          }

          .export-options {
            display: flex;
            gap: 2rem;
          }

          .export-options label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
          }

          .export-filters h3 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #475569;
          }

          .export-filters {
            display: grid;
            gap: 1rem;
          }

          .export-filters input {
            padding: 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-family: inherit;
          }

          /* Execute Section */
          .execute-section {
            display: flex;
            justify-content: center;
            margin-bottom: 2rem;
          }

          .execute-button {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
          }

          .execute-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
          }

          .execute-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .arrow {
            font-size: 1.25rem;
          }

          /* Operation Progress */
          .operation-progress {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 2rem;
          }

          .operation-progress h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
          }

          .status-indicator {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
          }

          .status-indicator.processing {
            background: #fef3c7;
            color: #92400e;
          }

          .status-indicator.completed {
            background: #d1fae5;
            color: #065f46;
          }

          .status-indicator.error {
            background: #fee2e2;
            color: #991b1b;
          }

          .status-icon {
            font-size: 1.5rem;
          }

          .status-text {
            font-weight: 600;
          }

          .progress-bar {
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 1rem;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            transition: width 0.3s ease;
          }

          .progress-stats {
            display: flex;
            justify-content: space-between;
            font-size: 0.875rem;
            color: #64748b;
          }

          .error-list {
            margin-top: 1.5rem;
            padding: 1rem;
            background: #fef2f2;
            border-radius: 8px;
          }

          .error-list h3 {
            margin: 0 0 0.75rem 0;
            color: #dc2626;
            font-size: 1rem;
            font-weight: 600;
          }

          .error-item {
            padding: 0.5rem 0;
            color: #7f1d1d;
            font-size: 0.875rem;
          }

          /* Operations History */
          .operations-history {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .operations-history h2 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
          }

          .history-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .history-item {
            display: grid;
            grid-template-columns: 100px 150px 100px 120px 100px;
            align-items: center;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .history-item:hover {
            background: #f1f5f9;
            transform: translateX(4px);
          }

          .history-type {
            font-weight: 600;
            color: #475569;
          }

          .history-entity {
            color: #64748b;
          }

          .history-count {
            font-weight: 500;
            color: #0f172a;
          }

          .history-date {
            font-size: 0.875rem;
            color: #94a3b8;
          }

          .history-status {
            padding: 0.25rem 0.625rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            text-align: center;
          }

          .history-status.success {
            background: #d1fae5;
            color: #065f46;
          }

          .history-status.failed {
            background: #fee2e2;
            color: #991b1b;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .operation-tabs {
              grid-template-columns: repeat(2, 1fr);
            }

            .entity-options {
              flex-direction: column;
            }

            .field-inputs {
              grid-template-columns: 1fr;
            }

            .history-item {
              grid-template-columns: 1fr;
              gap: 0.5rem;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}