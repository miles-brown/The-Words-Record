import { useEffect, useState } from 'react'

interface SiteStats {
  cases: number
  people: number
  organizations: number
  sources: number
  statements: number
  responses: number
}

interface MetricProps {
  label: string
  value: number
  suffix?: string
  delay?: number
}

function AnimatedMetric({ label, value, suffix = '', delay = 0 }: MetricProps) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    // Start animation after delay
    const startTimer = setTimeout(() => {
      setHasStarted(true)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [delay])

  useEffect(() => {
    if (!hasStarted) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = value / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(increment * currentStep))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, hasStarted])

  return (
    <div className="metric-item">
      <div className="metric-value">
        {count.toLocaleString()}
        {suffix && <span className="metric-suffix">{suffix}</span>}
      </div>
      <div className="metric-label">{label}</div>
    </div>
  )
}

export default function SiteMetrics() {
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data.counts)
      } catch (err) {
        setError('Failed to load statistics')
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <section className="site-metrics-section">
        <div className="metrics-container">
          <div className="metrics-loading">
            <div className="spinner"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error || !stats) {
    return null // Silently fail - don't show metrics section if data fails to load
  }

  return (
    <section className="site-metrics-section" aria-label="Site statistics">
      <div className="metrics-container">
        <div className="metrics-header">
          <h2>Our Impact</h2>
          <p>Documenting public discourse with verified sources</p>
        </div>

        <div className="metrics-grid" role="list">
          <AnimatedMetric
            label="Cases Documented"
            value={stats.cases}
            delay={0}
          />
          <AnimatedMetric
            label="Verified Sources"
            value={stats.sources}
            delay={100}
          />
          <AnimatedMetric
            label="People Covered"
            value={stats.people}
            delay={200}
          />
          <AnimatedMetric
            label="Organizations Tracked"
            value={stats.organizations}
            delay={300}
          />
        </div>
      </div>

      <style jsx>{`
        .site-metrics-section {
          background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
          color: var(--background-primary);
          padding: 4rem 2rem;
          margin: 3rem -2rem;
        }

        .metrics-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .metrics-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .metrics-header h2 {
          font-size: 2.5rem;
          color: var(--background-primary);
          margin-bottom: 0.5rem;
        }

        .metrics-header p {
          font-size: 1.1rem;
          color: var(--accent-secondary);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 3rem;
          padding: 2rem 0;
        }

        .metric-item {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .metric-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .metric-value {
          font-size: 3rem;
          font-weight: 700;
          color: var(--background-primary);
          font-family: 'Merriweather', Georgia, serif;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .metric-suffix {
          font-size: 1.5rem;
          color: var(--accent-secondary);
          margin-left: 0.25rem;
        }

        .metric-label {
          font-size: 1rem;
          color: var(--accent-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
        }

        .metrics-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }

        @media (max-width: 768px) {
          .site-metrics-section {
            padding: 3rem 1rem;
            margin: 2rem -1rem;
          }

          .metrics-header h2 {
            font-size: 2rem;
          }

          .metrics-header p {
            font-size: 1rem;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .metric-value {
            font-size: 2.5rem;
          }

          .metric-label {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  )
}
