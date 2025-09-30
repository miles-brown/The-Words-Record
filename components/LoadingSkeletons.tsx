import React from 'react'

export function PersonCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-avatar" />
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-subtitle" />
        <div className="skeleton-line skeleton-text" />
        <div className="skeleton-tags">
          <div className="skeleton-tag" />
          <div className="skeleton-tag" />
        </div>
      </div>

      <style jsx>{`
        .skeleton-card {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          background: var(--background-primary);
          display: flex;
          gap: 1rem;
        }

        .skeleton-avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .skeleton-content {
          flex: 1;
        }

        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .skeleton-title {
          width: 40%;
          height: 24px;
          margin-bottom: 0.75rem;
        }

        .skeleton-subtitle {
          width: 60%;
          height: 14px;
          margin-bottom: 0.75rem;
        }

        .skeleton-text {
          width: 80%;
        }

        .skeleton-tags {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .skeleton-tag {
          width: 60px;
          height: 24px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 12px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  )
}

export function IncidentCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-meta">
        <div className="skeleton-meta-item" />
        <div className="skeleton-meta-item" />
        <div className="skeleton-meta-item" />
      </div>
      <div className="skeleton-line skeleton-text" />
      <div className="skeleton-line skeleton-text" style={{ width: '90%' }} />
      <div className="skeleton-tags">
        <div className="skeleton-tag" />
        <div className="skeleton-tag" />
        <div className="skeleton-tag" />
      </div>

      <style jsx>{`
        .skeleton-card {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 2rem;
          background: var(--background-primary);
        }

        .skeleton-line {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .skeleton-title {
          width: 50%;
          height: 28px;
          margin-bottom: 1rem;
        }

        .skeleton-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .skeleton-meta-item {
          width: 100px;
          height: 28px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-text {
          height: 16px;
          width: 100%;
        }

        .skeleton-tags {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .skeleton-tag {
          width: 70px;
          height: 24px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 12px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  )
}

export function ContentSkeleton() {
  return (
    <div className="skeleton-content">
      <div className="skeleton-line skeleton-heading" />
      <div className="skeleton-paragraph">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" style={{ width: '80%' }} />
      </div>
      <div className="skeleton-paragraph">
        <div className="skeleton-line" />
        <div className="skeleton-line" style={{ width: '90%' }} />
        <div className="skeleton-line" />
        <div className="skeleton-line" style={{ width: '70%' }} />
      </div>

      <style jsx>{`
        .skeleton-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 0;
        }

        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          width: 100%;
        }

        .skeleton-heading {
          width: 60%;
          height: 32px;
          margin-bottom: 2rem;
        }

        .skeleton-paragraph {
          margin-bottom: 1.5rem;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  )
}