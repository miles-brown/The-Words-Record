import { useState, useEffect } from 'react'

const ZOOM_LEVELS = [
  { value: 75, label: '75%' },
  { value: 85, label: '85%' },
  { value: 100, label: '100%' },
  { value: 110, label: '110%' },
  { value: 125, label: '125%' },
]

const DEFAULT_ZOOM = 100

export default function ZoomControl() {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  // Load saved zoom level on mount
  useEffect(() => {
    const savedZoom = localStorage.getItem('admin-zoom-level')
    if (savedZoom) {
      const zoomValue = parseInt(savedZoom, 10)
      setZoom(zoomValue)
      applyZoom(zoomValue)
    }
  }, [])

  const applyZoom = (zoomLevel: number) => {
    // Apply zoom to the admin content area
    const adminContent = document.querySelector('.admin-content-wrapper') as HTMLElement
    if (adminContent) {
      adminContent.style.fontSize = `${zoomLevel}%`
    }
  }

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseInt(e.target.value, 10)
    setZoom(newZoom)
    applyZoom(newZoom)
    localStorage.setItem('admin-zoom-level', newZoom.toString())
  }

  const handlePresetClick = (value: number) => {
    setZoom(value)
    applyZoom(value)
    localStorage.setItem('admin-zoom-level', value.toString())
  }

  return (
    <div className="zoom-control">
      <div className="zoom-header">
        <span className="zoom-icon">🔍</span>
        <span className="zoom-title">Text Size</span>
      </div>

      <div className="zoom-slider-container">
        <button
          type="button"
          className="zoom-button"
          onClick={() => handlePresetClick(Math.max(75, zoom - 10))}
          aria-label="Zoom out"
        >
          −
        </button>

        <input
          type="range"
          min="75"
          max="125"
          step="5"
          value={zoom}
          onChange={handleZoomChange}
          className="zoom-slider"
          aria-label="Text size slider"
        />

        <button
          type="button"
          className="zoom-button"
          onClick={() => handlePresetClick(Math.min(125, zoom + 10))}
          aria-label="Zoom in"
        >
          +
        </button>
      </div>

      <div className="zoom-value">{zoom}%</div>

      <div className="zoom-presets">
        {ZOOM_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            className={`preset-button ${zoom === level.value ? 'active' : ''}`}
            onClick={() => handlePresetClick(level.value)}
          >
            {level.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        .zoom-control {
          padding: 1rem;
          border-radius: 8px;
          background: rgba(108, 117, 125, 0.05);
          border: 1px solid rgba(108, 117, 125, 0.1);
          margin-top: 1rem;
        }

        .zoom-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .zoom-icon {
          font-size: 1.1rem;
        }

        .zoom-title {
          font-weight: 600;
          font-size: 0.875rem;
          color: #495057;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .zoom-slider-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .zoom-button {
          width: 32px;
          height: 32px;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 6px;
          font-size: 1.25rem;
          font-weight: 600;
          color: #495057;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .zoom-button:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
          color: #212529;
        }

        .zoom-button:active {
          transform: scale(0.95);
        }

        .zoom-slider {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(to right, #dee2e6, #dee2e6);
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
        }

        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #007bff;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .zoom-slider::-webkit-slider-thumb:hover {
          background: #0056b3;
          transform: scale(1.1);
        }

        .zoom-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #007bff;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .zoom-slider::-moz-range-thumb:hover {
          background: #0056b3;
          transform: scale(1.1);
        }

        .zoom-value {
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: #007bff;
          margin-bottom: 0.75rem;
        }

        .zoom-presets {
          display: flex;
          gap: 0.375rem;
          justify-content: space-between;
        }

        .preset-button {
          flex: 1;
          padding: 0.375rem 0.5rem;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6c757d;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-button:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
          color: #495057;
        }

        .preset-button.active {
          background: #007bff;
          border-color: #007bff;
          color: white;
        }

        .preset-button:active {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .zoom-control {
            padding: 0.875rem;
          }

          .preset-button {
            font-size: 0.7rem;
            padding: 0.35rem 0.4rem;
          }
        }
      `}</style>
    </div>
  )
}
