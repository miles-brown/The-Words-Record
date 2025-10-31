import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface FeaturedCase {
  slug: string
  title: string
  summary?: string
  excerpt?: string
  date?: string
  caseDate?: string
  _count?: {
    sources?: number
    statements?: number
  }
  tags?: Array<{
    name: string
    slug: string
  }>
}

interface FeaturedCaseCarouselProps {
  featuredCases: FeaturedCase[]
}

export default function FeaturedCaseCarousel({ featuredCases }: FeaturedCaseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    if (!isAutoPlaying || featuredCases.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredCases.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, featuredCases.length, currentIndex])

  if (!featuredCases || featuredCases.length === 0) {
    return null
  }

  const currentCase = featuredCases[currentIndex]
  const displaySummary = currentCase.summary || currentCase.excerpt || 'No summary available'
  const displayDate = currentCase.caseDate || currentCase.date || new Date().toISOString()

  // Create a preview version of the text that's more enticing
  const createPreviewText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text

    // Find the last complete sentence within maxLength
    const truncated = text.substring(0, maxLength)
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    )

    if (lastSentenceEnd > 0) {
      return truncated.substring(0, lastSentenceEnd + 1) + '..'
    }

    // If no sentence end found, truncate at last word
    const lastSpace = truncated.lastIndexOf(' ')
    return truncated.substring(0, lastSpace) + '...'
  }

  const previewText = createPreviewText(displaySummary, 180)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredCases.length) % featuredCases.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredCases.length)
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  return (
    <section className="featured-carousel" aria-label="Featured cases">
      <div className="carousel-container">
        <div className="carousel-content">
          <div className="carousel-main">
            <div className="case-badge">Featured Case</div>

            <h2 className="case-title">{currentCase.title}</h2>

            <p className="case-date">
              {format(new Date(displayDate), 'MMMM d, yyyy')}
            </p>

            <p className="case-summary">
              {previewText}
              {displaySummary.length > 180 && (
                <span className="read-more"> Read more →</span>
              )}
            </p>

            <div className="case-meta">
              <span className="meta-item">
                <svg className="meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {currentCase._count?.statements || 0} statements
              </span>
              <span className="meta-item">
                <svg className="meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                {currentCase._count?.sources || 0} sources
              </span>
            </div>

            {currentCase.tags && currentCase.tags.length > 0 && (
              <div className="case-tags">
                {currentCase.tags.slice(0, 3).map((tag, idx) => (
                  <span key={tag.slug || idx} className="tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <Link href={`/statements/${currentCase.slug}`}>
              <button type="button" className="btn-explore">
                Explore Case
                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </Link>
          </div>

          {featuredCases.length > 1 && (
            <>
              <button
                type="button"
                className="carousel-button carousel-prev"
                onClick={handlePrevious}
                aria-label="Previous featured case"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                type="button"
                className="carousel-button carousel-next"
                onClick={handleNext}
                aria-label="Next featured case"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="carousel-controls">
                <button
                  type="button"
                  className="play-pause-button"
                  onClick={toggleAutoPlay}
                  aria-label={isAutoPlaying ? 'Pause carousel' : 'Play carousel'}
                >
                  {isAutoPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <div className="carousel-dots" role="group">
                  {featuredCases.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`View case ${index + 1}`}
                      aria-current={index === currentIndex ? 'true' : 'false'}
                      className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => handleDotClick(index)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .featured-carousel {
          background: var(--background-primary);
          border-bottom: 1px solid var(--border-primary);
          color: var(--text-primary);
          padding: 3rem 2rem 4rem;
          margin: 0;
          position: relative;
          overflow: hidden;
          /* Fixed height to prevent layout shift */
          min-height: 420px;
        }

        .featured-carousel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, transparent 100%);
          pointer-events: none;
        }

        .carousel-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          height: 100%;
        }

        .carousel-content {
          position: relative;
          min-height: 340px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 0 80px; /* Space for arrows on sides */
        }

        .carousel-main {
          text-align: left;
          max-width: 800px;
          width: 100%;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .case-badge {
          display: inline-block;
          background: transparent;
          border: 1px solid var(--border-primary);
          padding: 0.35rem 0.85rem;
          border-radius: 2px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
          color: var(--text-secondary);
        }

        .case-title {
          font-size: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          /* Limit title to 2 lines to maintain consistent height */
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          min-height: 2.6em;
        }

        .case-date {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        .case-summary {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          color: var(--text-secondary);
          max-width: 700px;
          /* Limit summary to 3 lines to maintain consistent height */
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          min-height: 4.8em;
        }

        .read-more {
          color: var(--accent-primary, #4a708b);
          font-weight: 500;
          font-style: italic;
          opacity: 0.9;
          transition: opacity 0.2s;
          cursor: pointer;
        }

        .read-more:hover {
          opacity: 1;
        }

        .case-meta {
          display: flex;
          justify-content: flex-start;
          gap: 1.5rem;
          margin-bottom: 1.25rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .meta-icon {
          width: 16px;
          height: 16px;
          opacity: 0.7;
        }

        .case-tags {
          display: flex;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.75rem;
        }

        .tag {
          background: transparent;
          border: 1px solid var(--border-primary);
          padding: 0.3rem 0.7rem;
          border-radius: 2px;
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .btn-explore {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid rgba(0, 0, 0, 0.12);
          padding: 0.65rem 1.4rem;
          border-radius: 2px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.025em;
          position: relative;
          overflow: hidden;
        }

        .dark-mode .btn-explore {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .btn-explore::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.03), transparent);
          transition: left 0.5s ease;
        }

        .dark-mode .btn-explore::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
        }

        .btn-explore:hover::before {
          left: 100%;
        }

        .btn-explore:hover {
          border-color: rgba(0, 0, 0, 0.25);
          background: rgba(0, 0, 0, 0.02);
          transform: translateY(-1px);
        }

        .dark-mode .btn-explore:hover {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.03);
        }

        .btn-icon {
          width: 20px;
          height: 20px;
        }

        .carousel-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid var(--border-primary);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-secondary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          z-index: 10;
          opacity: 0.8;
        }

        .carousel-button:hover {
          background: var(--text-primary);
          color: white;
          transform: translateY(-50%) scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          opacity: 1;
          border-color: var(--text-primary);
        }

        .dark-mode .carousel-button {
          background: rgba(30, 30, 30, 0.95);
          border-color: var(--border-primary);
          color: var(--text-secondary);
        }

        .dark-mode .carousel-button:hover {
          background: var(--text-primary);
          color: white;
        }

        .carousel-button svg {
          width: 20px;
          height: 20px;
        }

        .carousel-prev {
          left: 15px;
        }

        .carousel-prev:hover {
          transform: translateY(-50%) translateX(-2px) scale(1.05);
        }

        .carousel-next {
          right: 15px;
        }

        .carousel-next:hover {
          transform: translateY(-50%) translateX(2px) scale(1.05);
        }

        .carousel-controls {
          position: absolute;
          bottom: -2rem;
          left: 0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .play-pause-button {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          opacity: 0.6;
          padding: 0;
        }

        .play-pause-button:hover {
          opacity: 1;
          transform: scale(1.1);
          color: var(--accent-primary, #4a708b);
        }

        .play-pause-button svg {
          width: 24px;
          height: 24px;
        }

        .carousel-dots {
          display: flex;
          gap: 0.5rem;
        }

        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid var(--border-primary);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }

        .carousel-dot.active {
          background: var(--text-primary);
          border-color: var(--text-primary);
          width: 24px;
          border-radius: 4px;
        }

        .carousel-dot:hover {
          border-color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .featured-carousel {
            padding: 2.5rem 1.5rem 3.5rem;
            min-height: 380px;
          }

          .carousel-content {
            min-height: 300px;
            padding: 0 60px; /* Less space needed for smaller arrows */
          }

          .carousel-main {
            text-align: left;
          }

          .case-title {
            font-size: 1.5rem;
            min-height: 2.4em;
          }

          .case-summary {
            font-size: 0.95rem;
            min-height: 4.5em;
          }

          .case-meta {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .carousel-button {
            width: 42px;
            height: 42px;
          }

          .carousel-button svg {
            width: 20px;
            height: 20px;
          }

          .carousel-prev {
            left: 10px;
          }

          .carousel-next {
            right: 10px;
          }

          .carousel-controls {
            bottom: -1.5rem;
          }

          .play-pause-button {
            width: 28px;
            height: 28px;
          }

          .play-pause-button svg {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 480px) {
          .featured-carousel {
            padding: 2rem 1rem 3rem;
            min-height: 360px;
          }

          .carousel-content {
            padding: 0 50px; /* Even less space on small screens */
            min-height: 280px;
          }

          .case-title {
            font-size: 1.3rem;
            min-height: 2.2em;
          }

          .case-summary {
            font-size: 0.9rem;
            min-height: 4.3em;
          }

          .btn-explore {
            padding: 0.6rem 1.2rem;
            font-size: 0.9rem;
          }

          .carousel-button {
            width: 38px;
            height: 38px;
          }

          .carousel-button svg {
            width: 18px;
            height: 18px;
          }

          .carousel-prev {
            left: 5px;
          }

          .carousel-next {
            right: 5px;
          }
        }
      `}</style>
    </section>
  )
}
