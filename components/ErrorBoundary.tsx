import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-boundary">
            <div className="error-content">
              <h2>Something went wrong</h2>
              <p>We apologize for the inconvenience. The error has been logged.</p>
              <details>
                <summary>Error details</summary>
                <pre>{this.state.error?.toString()}</pre>
              </details>
              <button onClick={() => window.location.reload()}>
                Reload page
              </button>
            </div>
            
            <style jsx>{`
              .error-boundary {
                min-height: 50vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
              }
              
              .error-content {
                max-width: 600px;
                text-align: center;
              }
              
              .error-content h2 {
                color: var(--text-primary);
                margin-bottom: 1rem;
              }
              
              .error-content p {
                color: var(--text-secondary);
                margin-bottom: 2rem;
              }
              
              details {
                background: var(--background-secondary);
                padding: 1rem;
                border-radius: 8px;
                margin: 2rem 0;
                text-align: left;
              }
              
              summary {
                cursor: pointer;
                font-weight: 500;
                color: var(--text-primary);
              }
              
              pre {
                margin-top: 1rem;
                overflow-x: auto;
                white-space: pre-wrap;
                color: #e74c3c;
                font-size: 0.875rem;
              }
              
              button {
                background: var(--accent-primary);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                font-size: 1rem;
                cursor: pointer;
                transition: background 0.2s;
              }
              
              button:hover {
                background: #2980b9;
              }
            `}</style>
          </div>
        )
      )
    }

    return this.props.children
  }
}