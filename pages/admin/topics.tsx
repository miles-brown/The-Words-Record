/**
 * Admin Topics Page - Modern Card-Based Design
 * Manage hierarchical topics with parent-child relationships
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/AdminTopics.module.css'

interface Topic {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  parentId: string | null
  parent?: {
    id: string
    name: string
    slug: string
  }
  children?: Topic[]
  caseCount: number
  statementCount: number
  trending: boolean
  visibility: 'public' | 'private' | 'archived'
  createdAt: string
  updatedAt: string
}

export default function AdminTopicsPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'trending' | 'parent' | 'child'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      setLoading(true)
      // Simulated hierarchical data - replace with actual API call
      setTimeout(() => {
        const mockTopics: Topic[] = [
          {
            id: '1',
            name: 'Climate & Environment',
            slug: 'climate-environment',
            description: 'Environmental policies, climate change, and sustainability',
            icon: '🌍',
            color: '#10b981',
            parentId: null,
            caseCount: 45,
            statementCount: 234,
            trending: true,
            visibility: 'public',
            createdAt: '2024-01-15',
            updatedAt: '2024-10-14',
            children: [
              {
                id: '1a',
                name: 'Carbon Emissions',
                slug: 'carbon-emissions',
                description: 'Policies and statements on carbon reduction',
                icon: '💨',
                color: '#10b981',
                parentId: '1',
                caseCount: 12,
                statementCount: 67,
                trending: false,
                visibility: 'public',
                createdAt: '2024-01-16',
                updatedAt: '2024-10-13'
              },
              {
                id: '1b',
                name: 'Renewable Energy',
                slug: 'renewable-energy',
                description: 'Solar, wind, and alternative energy sources',
                icon: '⚡',
                color: '#10b981',
                parentId: '1',
                caseCount: 18,
                statementCount: 89,
                trending: true,
                visibility: 'public',
                createdAt: '2024-01-17',
                updatedAt: '2024-10-14'
              }
            ]
          },
          {
            id: '2',
            name: 'Healthcare',
            slug: 'healthcare',
            description: 'Healthcare policies, medical statements, and public health',
            icon: '🏥',
            color: '#ef4444',
            parentId: null,
            caseCount: 38,
            statementCount: 189,
            trending: false,
            visibility: 'public',
            createdAt: '2024-01-20',
            updatedAt: '2024-10-13',
            children: [
              {
                id: '2a',
                name: 'Pandemic Response',
                slug: 'pandemic-response',
                description: 'COVID-19 and pandemic preparedness',
                icon: '😷',
                color: '#ef4444',
                parentId: '2',
                caseCount: 15,
                statementCount: 78,
                trending: false,
                visibility: 'public',
                createdAt: '2024-01-21',
                updatedAt: '2024-10-12'
              }
            ]
          },
          {
            id: '3',
            name: 'Technology & AI',
            slug: 'technology-ai',
            description: 'Tech industry, artificial intelligence, and digital transformation',
            icon: '🤖',
            color: '#3b82f6',
            parentId: null,
            caseCount: 52,
            statementCount: 301,
            trending: true,
            visibility: 'public',
            createdAt: '2024-02-01',
            updatedAt: '2024-10-15',
            children: [
              {
                id: '3a',
                name: 'AI Ethics',
                slug: 'ai-ethics',
                description: 'Ethical considerations in artificial intelligence',
                icon: '🧠',
                color: '#3b82f6',
                parentId: '3',
                caseCount: 8,
                statementCount: 45,
                trending: true,
                visibility: 'public',
                createdAt: '2024-02-02',
                updatedAt: '2024-10-15'
              },
              {
                id: '3b',
                name: 'Data Privacy',
                slug: 'data-privacy',
                description: 'Personal data protection and privacy laws',
                icon: '🔒',
                color: '#3b82f6',
                parentId: '3',
                caseCount: 14,
                statementCount: 92,
                trending: false,
                visibility: 'public',
                createdAt: '2024-02-03',
                updatedAt: '2024-10-14'
              },
              {
                id: '3c',
                name: 'Cybersecurity',
                slug: 'cybersecurity',
                description: 'Digital security and cyber threats',
                icon: '🛡️',
                color: '#3b82f6',
                parentId: '3',
                caseCount: 11,
                statementCount: 58,
                trending: false,
                visibility: 'public',
                createdAt: '2024-02-04',
                updatedAt: '2024-10-13'
              }
            ]
          },
          {
            id: '4',
            name: 'Economy & Finance',
            slug: 'economy-finance',
            description: 'Economic policies, financial markets, and monetary policy',
            icon: '💰',
            color: '#eab308',
            parentId: null,
            caseCount: 41,
            statementCount: 198,
            trending: false,
            visibility: 'public',
            createdAt: '2024-02-10',
            updatedAt: '2024-10-12',
            children: []
          },
          {
            id: '5',
            name: 'Education',
            slug: 'education',
            description: 'Education policies, academic statements, and research',
            icon: '🎓',
            color: '#a855f7',
            parentId: null,
            caseCount: 28,
            statementCount: 145,
            trending: false,
            visibility: 'public',
            createdAt: '2024-02-15',
            updatedAt: '2024-10-10',
            children: []
          },
          {
            id: '6',
            name: 'Defense & Security',
            slug: 'defense-security',
            description: 'Military, defense, and national security topics',
            icon: '🎖️',
            color: '#64748b',
            parentId: null,
            caseCount: 19,
            statementCount: 87,
            trending: false,
            visibility: 'private',
            createdAt: '2024-03-01',
            updatedAt: '2024-10-08',
            children: []
          }
        ]
        setTopics(mockTopics)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Failed to fetch topics:', error)
      setLoading(false)
    }
  }

  const filteredTopics = topics.filter(topic => {
    const matchesSearch =
      topic.name.toLowerCase().includes(search.toLowerCase()) ||
      (topic.description?.toLowerCase().includes(search.toLowerCase()) ?? false)

    let matchesFilter = true
    if (filter === 'trending') {
      matchesFilter = topic.trending || (topic.children?.some(c => c.trending) ?? false)
    } else if (filter === 'parent') {
      matchesFilter = !topic.parentId && (topic.children?.length ?? 0) > 0
    } else if (filter === 'child') {
      matchesFilter = !!topic.parentId
    }

    return matchesSearch && matchesFilter
  })

  const deleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      return
    }

    try {
      // API call would go here
      setTopics(topics.filter(t => t.id !== topicId))
    } catch (error) {
      console.error('Failed to delete topic:', error)
      alert('Failed to delete topic')
    }
  }

  // Calculate statistics
  const totalTopics = topics.length + topics.reduce((sum, t) => sum + (t.children?.length || 0), 0)
  const trendingCount = topics.filter(t => t.trending).length +
    topics.reduce((sum, t) => sum + (t.children?.filter(c => c.trending).length || 0), 0)
  const parentCount = topics.filter(t => !t.parentId && (t.children?.length ?? 0) > 0).length
  const totalCases = topics.reduce((sum, t) => sum + t.caseCount + (t.children?.reduce((s, c) => s + c.caseCount, 0) || 0), 0)
  const totalStatements = topics.reduce((sum, t) => sum + t.statementCount + (t.children?.reduce((s, c) => s + c.statementCount, 0) || 0), 0)

  return (
    <>
      <Head>
        <title>Topics Management - TWR Admin</title>
      </Head>

      <AdminLayout title="Topics Management">
        <main className={styles.page}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>Topics Management</h1>
              <p className={styles.subtitle}>Organize, link, and manage hierarchical topics and categories</p>
            </div>
            <div className={styles.headerActions}>
              <button
                onClick={() => router.push('/admin/topics/new')}
                className={styles.newBtn}
              >
                <span>+</span> Create Topic
              </button>
              <button
                onClick={() => router.push('/')}
                className={styles.viewSiteBtn}
              >
                View Site
              </button>
            </div>
          </header>

          {/* Filters */}
          <section className={styles.filters}>
            <div className={styles.tabs}>
              <button
                className={filter === 'all' ? styles.active : ''}
                onClick={() => setFilter('all')}
              >
                All Topics
              </button>
              <button
                className={filter === 'trending' ? styles.active : ''}
                onClick={() => setFilter('trending')}
              >
                Trending
              </button>
              <button
                className={filter === 'parent' ? styles.active : ''}
                onClick={() => setFilter('parent')}
              >
                Parent Topics
              </button>
              <button
                className={filter === 'child' ? styles.active : ''}
                onClick={() => setFilter('child')}
              >
                Child Topics
              </button>
            </div>

            <input
              type="text"
              placeholder="Search topics..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </section>

          {/* Statistics Bar */}
          <div className={styles.statsBar}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Topics</p>
                <p className={styles.statValue}>{totalTopics}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔥</div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Trending</p>
                <p className={styles.statValue}>{trendingCount}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📁</div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Parent Topics</p>
                <p className={styles.statValue}>{parentCount}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📄</div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Cases</p>
                <p className={styles.statValue}>{totalCases}</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💬</div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Statements</p>
                <p className={styles.statValue}>{totalStatements}</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
            </div>
          ) : (
            /* Topics Grid */
            <section className={styles.cardsGrid}>
              {filteredTopics.map(topic => (
                <div
                  key={topic.id}
                  className={`${styles.topicCard} ${
                    !topic.parentId && (topic.children?.length ?? 0) > 0
                      ? styles.parentCard
                      : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <h2 className={styles.topicName}>
                        <span className={styles.topicIcon}>{topic.icon || '📌'}</span>
                        {topic.name}
                      </h2>
                      <div className={styles.badges}>
                        {topic.trending && (
                          <span className={styles.trending}>
                            🔥 Trending
                          </span>
                        )}
                        <span className={`${styles.visibilityBadge} ${styles[topic.visibility]}`}>
                          {topic.visibility}
                        </span>
                      </div>
                    </div>
                    <p className={styles.topicSlug}>/{topic.slug}</p>
                  </div>

                  {/* Parent Reference */}
                  {topic.parent && (
                    <p className={styles.parentRef}>
                      Parent: <Link href={`/admin/topics/${topic.parent.slug}`}>{topic.parent.name}</Link>
                    </p>
                  )}

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <p className={styles.topicDesc}>
                      {topic.description || 'No description provided.'}
                    </p>

                    {/* Statistics */}
                    <div className={styles.topicStats}>
                      <div className={styles.statItem}>
                        <span>📁</span>
                        <span>{topic.caseCount} Cases</span>
                      </div>
                      <div className={styles.statItem}>
                        <span>💬</span>
                        <span>{topic.statementCount} Statements</span>
                      </div>
                    </div>

                    {/* Child Topics */}
                    {topic.children && topic.children.length > 0 && (
                      <details className={styles.childContainer}>
                        <summary>Subtopics ({topic.children.length})</summary>
                        <ul className={styles.childList}>
                          {topic.children.map(child => (
                            <li key={child.id} className={styles.childItem}>
                              <Link href={`/admin/topics/${child.slug}`}>
                                {child.icon || '📎'} {child.name}
                                {child.trending && ' 🔥'}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className={styles.cardActions}>
                    <Link href={`/admin/topics/${topic.slug}`} className={styles.editBtn}>
                      Edit
                    </Link>
                    <Link href={`/topics/${topic.slug}`} className={styles.viewBtn}>
                      View
                    </Link>
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className={styles.deleteBtn}
                      aria-label="Delete topic"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {filteredTopics.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <h3 className={styles.emptyTitle}>No topics found</h3>
                  <p className={styles.emptyDesc}>
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={() => {
                      setSearch('')
                      setFilter('all')
                    }}
                    className={styles.clearFiltersBtn}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </section>
          )}
        </main>
      </AdminLayout>
    </>
  )
}