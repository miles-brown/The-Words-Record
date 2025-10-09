import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
  // People analytics
  peopleByProfession: Array<{ profession: string; count: number }>
  peopleByNationality: Array<{ nationality: string; count: number }>
  peopleByInfluence: Array<{ level: string; count: number }>
  controversyDistribution: Array<{ range: string; count: number }>
  socialMediaReach: Array<{ platform: string; totalReach: number }>

  // Organization analytics
  orgsByType: Array<{ type: string; count: number }>
  orgsByPoliticalLeaning: Array<{ leaning: string; count: number }>
  orgsByStanceOnIsrael: Array<{ stance: string; count: number }>
  fundingSourceDistribution: Array<{ source: string; count: number }>

  // Temporal analytics
  activityTimeline: Array<{ month: string; statements: number; cases: number }>

  // Top rankings
  mostInfluential: Array<{ name: string; score: number; type: string }>
  mostControversial: Array<{ name: string; score: number; type: string }>
  mostActive: Array<{ name: string; count: number; type: string }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'people' | 'organizations' | 'trends'>('people')

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Color schemes for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
  const POLITICAL_COLORS = {
    FAR_LEFT: '#DC2626',
    LEFT: '#EF4444',
    CENTER_LEFT: '#3B82F6',
    CENTER: '#6B7280',
    CENTER_RIGHT: '#1D4ED8',
    RIGHT: '#1E40AF',
    FAR_RIGHT: '#1E3A8A',
    UNKNOWN: '#9CA3AF'
  }
  const STANCE_COLORS = {
    STRONGLY_SUPPORTIVE: '#1E40AF',
    SUPPORTIVE: '#3B82F6',
    CONDITIONALLY_SUPPORTIVE: '#60A5FA',
    NEUTRAL: '#6B7280',
    CONDITIONALLY_CRITICAL: '#FB923C',
    CRITICAL: '#F97316',
    STRONGLY_CRITICAL: '#DC2626',
    BDS_SUPPORTER: '#991B1B'
  }

  if (loading) {
    return (
      <Layout title="Analytics">
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </Layout>
    )
  }

  if (!data) {
    return (
      <Layout title="Analytics">
        <div className="error-message">
          Failed to load analytics data. Please try again later.
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Analytics Dashboard">
      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
          <p>Comprehensive insights from The Words Record database</p>
        </div>

        {/* View Selector */}
        <div className="view-selector">
          <button
            className={selectedView === 'people' ? 'active' : ''}
            onClick={() => setSelectedView('people')}
          >
            People Analytics
          </button>
          <button
            className={selectedView === 'organizations' ? 'active' : ''}
            onClick={() => setSelectedView('organizations')}
          >
            Organization Analytics
          </button>
          <button
            className={selectedView === 'trends' ? 'active' : ''}
            onClick={() => setSelectedView('trends')}
          >
            Trends & Rankings
          </button>
        </div>

        {/* People Analytics View */}
        {selectedView === 'people' && (
          <div className="analytics-grid">
            <div className="chart-container">
              <h3>People by Profession</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.peopleByProfession}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="profession" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>People by Nationality</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.peopleByNationality}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.peopleByNationality.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Influence Level Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.peopleByInfluence} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="level" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Controversy Score Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.controversyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container wide">
              <h3>Social Media Reach by Platform</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.socialMediaReach}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`} />
                  <Bar dataKey="totalReach" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Organizations Analytics View */}
        {selectedView === 'organizations' && (
          <div className="analytics-grid">
            <div className="chart-container">
              <h3>Organizations by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.orgsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.orgsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Political Leaning Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.orgsByPoliticalLeaning}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="leaning" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {data.orgsByPoliticalLeaning.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={POLITICAL_COLORS[entry.leaning as keyof typeof POLITICAL_COLORS] || '#9CA3AF'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container wide">
              <h3>Stance on Israel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.orgsByStanceOnIsrael}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stance" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {data.orgsByStanceOnIsrael.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STANCE_COLORS[entry.stance as keyof typeof STANCE_COLORS] || '#9CA3AF'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Funding Sources</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.fundingSourceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.fundingSourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Trends & Rankings View */}
        {selectedView === 'trends' && (
          <div className="analytics-grid">
            <div className="chart-container wide">
              <h3>Activity Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.activityTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="statements" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="cases" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="ranking-container">
              <h3>Most Influential</h3>
              <div className="ranking-list">
                {data.mostInfluential.map((item, index) => (
                  <div key={index} className="ranking-item">
                    <span className="rank">#{index + 1}</span>
                    <div className="ranking-info">
                      <span className="name">{item.name}</span>
                      <span className="type">{item.type}</span>
                    </div>
                    <span className="score">{item.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ranking-container">
              <h3>Most Controversial</h3>
              <div className="ranking-list">
                {data.mostControversial.map((item, index) => (
                  <div key={index} className="ranking-item">
                    <span className="rank">#{index + 1}</span>
                    <div className="ranking-info">
                      <span className="name">{item.name}</span>
                      <span className="type">{item.type}</span>
                    </div>
                    <span className="score controversy">{item.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ranking-container">
              <h3>Most Active</h3>
              <div className="ranking-list">
                {data.mostActive.map((item, index) => (
                  <div key={index} className="ranking-item">
                    <span className="rank">#{index + 1}</span>
                    <div className="ranking-info">
                      <span className="name">{item.name}</span>
                      <span className="type">{item.type}</span>
                    </div>
                    <span className="count">{item.count} statements</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .analytics-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .analytics-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .analytics-header h1 {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .analytics-header p {
          color: #6B7280;
          font-size: 1.1rem;
        }

        .view-selector {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .view-selector button {
          padding: 0.75rem 2rem;
          border: 2px solid #E5E7EB;
          background: white;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-selector button:hover {
          border-color: #3B82F6;
          color: #3B82F6;
        }

        .view-selector button.active {
          background: #3B82F6;
          color: white;
          border-color: #3B82F6;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
        }

        .chart-container {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-container.wide {
          grid-column: span 2;
        }

        .chart-container h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .ranking-container {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .ranking-container h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ranking-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          background: #F9FAFB;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }

        .ranking-item:hover {
          background: #F3F4F6;
        }

        .rank {
          font-weight: bold;
          color: #6B7280;
          margin-right: 1rem;
          min-width: 30px;
        }

        .ranking-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .ranking-info .name {
          font-weight: 500;
          color: #111827;
        }

        .ranking-info .type {
          font-size: 0.875rem;
          color: #6B7280;
        }

        .score, .count {
          font-weight: 600;
          color: #3B82F6;
        }

        .score.controversy {
          color: #EF4444;
        }

        .analytics-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid #E5E7EB;
          border-top-color: #3B82F6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          text-align: center;
          padding: 3rem;
          color: #EF4444;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .chart-container.wide {
            grid-column: span 1;
          }
        }
      `}</style>
    </Layout>
  )
}