/**
 * TabsNavigation Component
 * Horizontal scrollable tab navigation for Apps & Integrations module
 * Redesigned to match admin design system
 */

import React, { useRef, useEffect, useState } from 'react'
import { useTabNavigation, type AppTab } from '@/lib/apps/store'

export default function TabsNavigation() {
  const { activeTab, setActiveTab, getAllTabs, isActive } = useTabNavigation()
  const tabsRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)

  const tabs = getAllTabs()

  // Handle tab click
  const handleTabClick = (tabId: AppTab, path: string) => {
    setActiveTab(tabId)
    // No router push - we're staying on the same page
  }

  // Check scroll position to show/hide scroll buttons
  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current
      setShowLeftScroll(scrollLeft > 0)
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  // Scroll tabs left
  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  // Scroll tabs right
  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, tabId: AppTab, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTabClick(tabId, path)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const currentIndex = tabs.findIndex(tab => tab.id === tabId)
      if (currentIndex > 0) {
        const prevTab = tabs[currentIndex - 1]
        handleTabClick(prevTab.id, prevTab.path)
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      const currentIndex = tabs.findIndex(tab => tab.id === tabId)
      if (currentIndex < tabs.length - 1) {
        const nextTab = tabs[currentIndex + 1]
        handleTabClick(nextTab.id, nextTab.path)
      }
    }
  }

  // Check scroll on mount and resize
  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  // Scroll active tab into view
  useEffect(() => {
    const activeElement = tabsRef.current?.querySelector(`[data-tab="${activeTab}"]`)
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeTab])

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'var(--admin-card-bg)',
        borderBottom: '1px solid var(--admin-border)',
        backdropFilter: 'blur(8px)',
        boxShadow: 'var(--admin-shadow-light)'
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* Left scroll button */}
        {showLeftScroll && (
          <button
            type="button"
            onClick={scrollLeft}
            style={{
              position: 'absolute',
              left: 0,
              zIndex: 10,
              height: '100%',
              padding: '0 0.5rem',
              background: 'linear-gradient(to right, var(--admin-card-bg) 60%, transparent)',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            aria-label="Scroll tabs left"
          >
            <svg
              style={{
                width: '1.25rem',
                height: '1.25rem',
                color: 'var(--admin-text-secondary)'
              }}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Tabs container */}
        <div
          ref={tabsRef}
          onScroll={checkScroll}
          role="tablist"
          aria-label="Apps navigation"
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
          className="scrollbar-hide"
        >
          {tabs.map((tab) => {
            const active = isActive(tab.id)
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`tabpanel-${tab.id}`}
                data-tab={tab.id}
                onClick={() => handleTabClick(tab.id, tab.path)}
                onKeyDown={(e) => handleKeyDown(e, tab.id, tab.path)}
                tabIndex={active ? 0 : -1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.25rem',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap',
                  border: 'none',
                  borderBottom: active ? '3px solid var(--admin-accent)' : '3px solid transparent',
                  backgroundColor: active ? 'var(--admin-bg)' : 'transparent',
                  color: active ? 'var(--admin-accent)' : 'var(--admin-text-secondary)',
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--admin-bg)'
                    e.currentTarget.style.color = 'var(--admin-text-primary)'
                    e.currentTarget.style.borderBottomColor = 'var(--admin-border)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--admin-text-secondary)'
                    e.currentTarget.style.borderBottomColor = 'transparent'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--admin-accent)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ fontSize: '1.125rem', lineHeight: 1 }} aria-hidden="true">
                  {tab.emoji}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 'inherit' }}>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right scroll button */}
        {showRightScroll && (
          <button
            type="button"
            onClick={scrollRight}
            style={{
              position: 'absolute',
              right: 0,
              zIndex: 10,
              height: '100%',
              padding: '0 0.5rem',
              background: 'linear-gradient(to left, var(--admin-card-bg) 60%, transparent)',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            aria-label="Scroll tabs right"
          >
            <svg
              style={{
                width: '1.25rem',
                height: '1.25rem',
                color: 'var(--admin-text-secondary)'
              }}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile dropdown fallback */}
      <div
        style={{
          display: 'none',
          padding: '0.5rem 1rem'
        }}
        className="mobile-tab-select"
      >
        <select
          value={activeTab}
          onChange={(e) => {
            const selectedTab = tabs.find(tab => tab.id === e.target.value)
            if (selectedTab) {
              handleTabClick(selectedTab.id, selectedTab.path)
            }
          }}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'var(--admin-card-bg)',
            border: '2px solid var(--admin-border)',
            borderRadius: '0.5rem',
            color: 'var(--admin-text-primary)',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
          aria-label="Select app section"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.emoji} {tab.label}
            </option>
          ))}
        </select>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 640px) {
          .scrollbar-hide {
            display: none !important;
          }
          .mobile-tab-select {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
