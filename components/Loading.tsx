interface LoadingProps {
  fullPage?: boolean
  message?: string
  size?: 'small' | 'medium' | 'large'
}

export default function Loading({ fullPage = false, message, size = 'medium' }: LoadingProps) {
  const spinnerSizes = {
    small: '24px',
    medium: '40px',
    large: '60px'
  }

  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <div className="spinner" style={{ width: spinnerSizes[size], height: spinnerSizes[size] }}></div>
        {message && <p className="loading-message">{message}</p>}

        <style jsx>{`
          .loading-fullpage {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            gap: 1rem;
          }

          .loading-message {
            color: var(--text-secondary);
            font-size: 0.95rem;
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="loading-inline">
      <div className="spinner" style={{ width: spinnerSizes[size], height: spinnerSizes[size] }}></div>
      {message && <span className="loading-message">{message}</span>}

      <style jsx>{`
        .loading-inline {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .loading-message {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  )
}

// Skeleton loader for content
export function SkeletonLoader({
  lines = 3,
  width = '100%',
  height = '1rem',
  gap = '0.75rem'
}: {
  lines?: number
  width?: string
  height?: string
  gap?: string
}) {
  return (
    <div className="skeleton-container">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width: i === lines - 1 ? '70%' : width,
            height
          }}
        />
      ))}

      <style jsx>{`
        .skeleton-container {
          display: flex;
          flex-direction: column;
          gap: ${gap};
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            var(--background-secondary) 25%,
            var(--background-primary) 50%,
            var(--background-secondary) 75%
          );
          background-size: 2000px 100%;
          animation: shimmer 2s infinite;
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>
    </div>
  )
}
