import { useState, useEffect } from 'react'

const TEXT_SIZES = [75, 85, 100, 110, 125]
const DEFAULT_SIZE = 100
const STORAGE_KEY = 'admin-text-size'

export default function ZoomControl() {
  const [textSize, setTextSize] = useState(DEFAULT_SIZE)

  // Load saved text size on mount
  useEffect(() => {
    const savedSize = localStorage.getItem(STORAGE_KEY)
    if (savedSize) {
      const sizeValue = parseInt(savedSize, 10)
      if (TEXT_SIZES.includes(sizeValue)) {
        setTextSize(sizeValue)
        applyTextSize(sizeValue)
      }
    }
  }, [])

  const applyTextSize = (size: number) => {
    // Apply text size ONLY to the main content area, not the sidebar
    const contentWrapper = document.querySelector('.admin-content-wrapper') as HTMLElement
    if (contentWrapper) {
      contentWrapper.style.fontSize = `${size}%`
    }
  }

  const handleSizeClick = (size: number) => {
    setTextSize(size)
    applyTextSize(size)
    localStorage.setItem(STORAGE_KEY, size.toString())
  }

  return (
    <div className="text-size-control">
      <h3 className="text-size-heading">Text Size</h3>

      <div className="text-size-buttons">
        {TEXT_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            className={`size-button ${textSize === size ? 'active' : ''}`}
            onClick={() => handleSizeClick(size)}
            aria-label={`Set text size to ${size}%`}
            aria-pressed={textSize === size}
          >
            {size}%
          </button>
        ))}
      </div>

      <style jsx>{`
        .text-size-control {
          padding: 1rem 0;
          border-top: 1px solid rgba(108, 117, 125, 0.15);
        }

        .text-size-heading {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.75rem 0;
        }

        .text-size-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .size-button {
          flex: 1;
          min-width: 0;
          padding: 0.4rem 0.5rem;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6c757d;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .size-button:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
          color: #495057;
          transform: translateY(-1px);
        }

        .size-button.active {
          background: #007bff;
          border-color: #007bff;
          color: white;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 123, 255, 0.25);
        }

        .size-button:active {
          transform: translateY(0);
        }

        .size-button:focus-visible {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .size-button {
            font-size: 0.7rem;
            padding: 0.35rem 0.45rem;
          }
        }
      `}</style>
    </div>
  )
}
