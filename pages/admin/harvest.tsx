import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface HarvestJob {
  id: string
  type: string
  status: string
  config: any
  results: any
  error: string | null
  retryCount: number
  priority: number
  scheduledAt: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export default function HarvestPage() {
  const [jobs, setJobs] = useState<HarvestJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedType, setSelectedType] = useState('STATEMENT_DISCOVERY')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/harvest')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      } else {
        setError('Failed to load harvest jobs')
      }
    } catch (err) {
      setError('Failed to load harvest jobs')
    } finally {
      setLoading(false)
    }
  }

  const createJob = async () => {
    try {
      const response = await fetch('/api/admin/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          config: {}
        })
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchJobs()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create harvest job')
      }
    } catch (err) {
      setError('Failed to create harvest job')
    }
  }

  const cancelJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this job?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/harvest/${jobId}/cancel`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchJobs()
      }
    } catch (err) {
      console.error('Failed to cancel job:', err)
    }
  }

  const harvestTypes = [
    { value: 'PERSON_ENRICHMENT', label: 'Person Enrichment', description: 'Enrich person profiles with additional data' },
    { value: 'STATEMENT_DISCOVERY', label: 'Statement Discovery', description: 'Discover new statements from sources' },
    { value: 'SOURCE_ARCHIVING', label: 'Source Archiving', description: 'Archive sources to prevent link rot' },
    { value: 'MEDIA_MONITORING', label: 'Media Monitoring', description: 'Monitor media outlets for new content' },
    { value: 'SOCIAL_MEDIA_SCAN', label: 'Social Media Scan', description: 'Scan social media for relevant content' },
    { value: 'FACT_CHECK', label: 'Fact Check', description: 'Verify statements against fact-checking sources' },
    { value: 'CITATION_VERIFY', label: 'Citation Verify', description: 'Verify citations and sources' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'status-completed'
      case 'RUNNING': return 'status-running'
      case 'FAILED': return 'status-failed'
      case 'CANCELLED': return 'status-cancelled'
      default: return 'status-pending'
    }
  }

  return (
    <>
      <Head>
        <title>Harvest Automation - Admin - The Words Record</title>
      </Head>

      <AdminLayout title="Harvest Automation">
        <div className="admin-page">
          <div className="page-header">
            <div>
              <h1>Harvest Automation</h1>
              <p className="page-subtitle">Automated data collection and enrichment jobs</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <span>➕</span> New Harvest Job
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading harvest jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌾</div>
              <h3>No harvest jobs yet</h3>
              <p>Create your first automated harvest job to start collecting data.</p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Create Harvest Job
              </button>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <div className="job-type">
                      {harvestTypes.find(t => t.value === job.type)?.label || job.type}
                    </div>
                    <span className={`status-badge ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="job-body">
                    <div className="job-info">
                      <div className="info-item">
                        <strong>Created:</strong> {new Date(job.createdAt).toLocaleString()}
                      </div>
                      {job.startedAt && (
                        <div className="info-item">
                          <strong>Started:</strong> {new Date(job.startedAt).toLocaleString()}
                        </div>
                      )}
                      {job.completedAt && (
                        <div className="info-item">
                          <strong>Completed:</strong> {new Date(job.completedAt).toLocaleString()}
                        </div>
                      )}
                      {job.error && (
                        <div className="info-item error-text">
                          <strong>Error:</strong> {job.error}
                        </div>
                      )}
                    </div>

                    {job.status === 'RUNNING' || job.status === 'QUEUED' ? (
                      <button onClick={() => cancelJob(job.id)} className="btn-sm btn-danger">
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showCreateModal && (
            <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Create Harvest Job</h3>
                  <button onClick={() => setShowCreateModal(false)} className="close-btn">✕</button>
                </div>

                <div className="modal-body">
                  <p>Select the type of harvest job you want to run:</p>

                  <div className="harvest-types">
                    {harvestTypes.map((type) => (
                      <label key={type.value} className="harvest-type-option">
                        <input
                          type="radio"
                          name="harvestType"
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

                <div className="modal-actions">
                  <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button onClick={createJob} className="btn-primary">
                    Create Job
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .admin-page {
            max-width: 1200px;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
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

          .btn-primary {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .btn-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

          .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }

          .btn-danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }

          .btn-danger:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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

          .loading {
            text-align: center;
            padding: 3rem;
            color: #64748b;
          }

          .empty-state {
            background: white;
            border-radius: 12px;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .empty-state h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: #0f172a;
          }

          .empty-state p {
            margin: 0 0 2rem 0;
            color: #64748b;
            font-size: 1rem;
          }

          .jobs-grid {
            display: grid;
            gap: 1.5rem;
          }

          .job-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #f3f4f6;
          }

          .job-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }

          .job-type {
            font-size: 1.125rem;
            font-weight: 700;
            color: #0f172a;
          }

          .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .status-completed { background: #d1fae5; color: #065f46; }
          .status-running { background: #dbeafe; color: #1e40af; }
          .status-failed { background: #fee2e2; color: #991b1b; }
          .status-cancelled { background: #f3f4f6; color: #475569; }
          .status-pending { background: #fef3c7; color: #92400e; }

          .job-body {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .job-info {
            flex: 1;
          }

          .info-item {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            color: #64748b;
          }

          .info-item strong {
            color: #0f172a;
          }

          .error-text {
            color: #dc2626;
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
          }

          .modal {
            background: white;
            border-radius: 12px;
            padding: 0;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
          }

          .modal-header h3 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #64748b;
            padding: 0;
            width: 30px;
            height: 30px;
            border-radius: 4px;
          }

          .close-btn:hover {
            background: #f1f5f9;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .modal-body p {
            margin: 0 0 1.5rem 0;
            color: #64748b;
          }

          .harvest-types {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .harvest-type-option {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .harvest-type-option:hover {
            border-color: #3b82f6;
            background: #f8fafc;
          }

          .harvest-type-option input[type="radio"] {
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

          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
          }

          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              gap: 1rem;
            }
          }
        `}</style>
      </AdminLayout>
    </>
  )
}
