import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface FeaturedCase {
  slug: string
  title: string
  summary?: string
  excerpt?: string
  caseDate: string
  _count: {
    sources: number
    statements: number
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
  }, [isAutoPlaying, featuredCases.length])

  if (!featuredCases || featuredCases.length === 0) {
    return null
  }

  const currentCase = featuredCases[currentIndex]
  const displaySummary = currentCase.summary || currentCase.excerpt || 'No summary available'

  const handlePrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + featuredCases.length) % featuredCases.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % featuredCases.length)
  }

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  return (
    <section className="featured-carousel" aria-label="Featured cases">
      <div className="carousel-container">
        <div className="carousel-content">
          <div className="carousel-main">
            <div className="case-badge">Featured Case</div>

            <h2 className="case-title">{currentCase.title}</h2>

            <p className="case-date">
              {format(new Date(currentCase.caseDate), 'MMMM d, yyyy')}
            </p>

            <p className="case-summary">{displaySummary}</p>

            <div className="case-meta">
              <span className="meta-item">
                <svg className="meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {currentCase._count.statements} statements
              </span>
              <span className="meta-item">
                <svg className="meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                {currentCase._count.sources} sources
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

              <div className="carousel-dots" role="tablist">
                {featuredCases.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    aria-label={`View case ${index + 1}`}
                    aria-selected={index === currentIndex}
                    className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => handleDotClick(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .featured-carousel {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 5rem 2rem;
          margin: -2rem -2rem 3rem -2rem;
          position: relative;
          overflow: hidden;
        }

        .featured-carousel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .carousel-container {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .carousel-content {
          position: relative;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-main {
          text-align: center;
          max-width: 800px;
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
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
        }

        .case-title {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }

        .case-date {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }

        .case-summary {
          font-size: 1.2rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          opacity: 0.95;
        }

        .case-meta {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .meta-icon {
          width: 20px;
          height: 20px;
        }

        .case-tags {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .tag {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .btn-explore {
          background: white;
          color: #667eea;
          border: none;
          padding: 1rem 2rem;
          border-radius: 30px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-explore:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .btn-icon {
          width: 20px;
          height: 20px;
        }

        .carousel-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: none;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }

        .carousel-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-button svg {
          width: 24px;
          height: 24px;
        }

        .carousel-prev {
          left: 0;
        }

        .carousel-next {
          right: 0;
        }

        .carousel-dots {
          position: absolute;
          bottom: -2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.75rem;
        }

        .carousel-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.5);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }

        .carousel-dot.active {
          background: white;
          border-color: white;
        }

        .carousel-dot:hover {
          border-color: white;
        }

        @media (max-width: 768px) {
          .featured-carousel {
            padding: 3rem 1.5rem;
            margin: -1rem -1rem 2rem -1rem;
          }

          .carousel-content {
            min-height: 300px;
          }

          .case-title {
            font-size: 1.75rem;
          }

          .case-summary {
            font-size: 1rem;
          }

          .case-meta {
            flex-direction: column;
            gap: 0.75rem;
          }

          .carousel-button {
            width: 40px;
            height: 40px;
          }

          .carousel-button svg {
            width: 20px;
            height: 20px;
          }

          .carousel-prev {
            left: -10px;
          }

          .carousel-next {
            right: -10px;
          }
        }

        @media (max-width: 480px) {
          .case-title {
            font-size: 1.5rem;
          }

          .btn-explore {
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  )
}
