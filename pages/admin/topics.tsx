/**
 * Admin Topics Page
 * Manage topics, categories, and content organization
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface Topic {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  caseCount: number
  statementCount: number
  trending: boolean
  visibility: 'public' | 'private' | 'archived'
  createdAt: string
  updatedAt: string
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private' | 'archived'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      setLoading(true)
      // Simulated data - replace with actual API call
      setTimeout(() => {
        setTopics([
          {
            id: '1',
            name: 'Climate Change',
            slug: 'climate-change',
            description: 'Environmental and climate-related statements and policies',
            icon: '🌍',
            color: '#10b981',
            caseCount: 45,
            statementCount: 234,
            trending: true,
            visibility: 'public',
            createdAt: '2024-01-15',
            updatedAt: '2024-10-14'
          },
          {
            id: '2',
            name: 'Healthcare',
            slug: 'healthcare',
            description: 'Healthcare policies, medical statements, and public health',
            icon: '🏥',
            color: '#ef4444',
            caseCount: 38,
            statementCount: 189,
            trending: false,
            visibility: 'public',
            createdAt: '2024-01-20',
            updatedAt: '2024-10-13'
          },
          {
            id: '3',
            name: 'Technology',
            slug: 'technology',
            description: 'Tech industry, AI, cybersecurity, and digital transformation',
            icon: '💻',
            color: '#3b82f6',
            caseCount: 52,
            statementCount: 301,
            trending: true,
            visibility: 'public',
            createdAt: '2024-02-01',
            updatedAt: '2024-10-15'
          },
          {
            id: '4',
            name: 'Economy',
            slug: 'economy',
            description: 'Economic policies, financial markets, and business',
            icon: '💰',
            color: '#eab308',
            caseCount: 41,
            statementCount: 198,
            trending: false,
            visibility: 'public',
            createdAt: '2024-02-10',
            updatedAt: '2024-10-12'
          },
          {
            id: '5',
            name: 'Education',
            slug: 'education',
            description: 'Education policies, academic statements, and research',
            icon: '🎓',
            color: '#a855f7',
            caseCount: 28,
            statementCount: 145,
            trending: false,
            visibility: 'public',
            createdAt: '2024-02-15',
            updatedAt: '2024-10-10'
          },
          {
            id: '6',
            name: 'Defense',
            slug: 'defense',
            description: 'Military, defense, and national security topics',
            icon: '🛡️',
            color: '#64748b',
            caseCount: 19,
            statementCount: 87,
            trending: false,
            visibility: 'private',
            createdAt: '2024-03-01',
            updatedAt: '2024-10-08'
          }
        ])
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Failed to fetch topics:', error)
      setLoading(false)
    }
  }

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          topic.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesVisibility = filterVisibility === 'all' || topic.visibility === filterVisibility
    return matchesSearch && matchesVisibility
  })

  const deleteTopic = (topicId: string) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      setTopics(topics.filter(t => t.id !== topicId))
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Topics">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Topics - TWR Admin</title>
      </Head>

      <AdminLayout title="Topics">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Topics Management</h1>
                <p className="text-gray-500 mt-1">Organize content with topics and categories</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Create Topic
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Topics</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Topics</p>
                  <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
                </div>
                <span className="text-2xl">🧩</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Trending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {topics.filter(t => t.trending).length}
                  </p>
                </div>
                <span className="text-2xl">🔥</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Cases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {topics.reduce((sum, t) => sum + t.caseCount, 0)}
                  </p>
                </div>
                <span className="text-2xl">📁</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Statements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {topics.reduce((sum, t) => sum + t.statementCount, 0)}
                  </p>
                </div>
                <span className="text-2xl">💬</span>
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <div key={topic.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div
                  className="h-2 rounded-t-lg"
                  style={{ backgroundColor: topic.color }}
                ></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{topic.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {topic.name}
                          {topic.trending && (
                            <span className="ml-2 text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                              Trending
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">/{topic.slug}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      topic.visibility === 'public'
                        ? 'bg-green-100 text-green-700'
                        : topic.visibility === 'private'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {topic.visibility}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{topic.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Cases</p>
                      <p className="font-semibold text-gray-900">{topic.caseCount}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Statements</p>
                      <p className="font-semibold text-gray-900">{topic.statementCount}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    <p>Created: {new Date(topic.createdAt).toLocaleDateString()}</p>
                    <p>Updated: {new Date(topic.updatedAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/topics/${topic.slug}`)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/topics/${topic.slug}`)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTopics.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No topics found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterVisibility('all')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Create Topic Tip */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Pro Tip: Organize Content Better</h3>
                <p className="text-gray-600 mt-1">
                  Topics help users discover related content. Keep them focused and well-defined for the best user experience.
                </p>
              </div>
              <span className="text-4xl">💡</span>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}