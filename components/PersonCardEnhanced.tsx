import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface PersonCardEnhancedProps {
  person: any
  showStats?: boolean
  showSocial?: boolean
  showControversy?: boolean
  showInfluence?: boolean
}

export function PersonCardEnhanced({
  person,
  showStats = true,
  showSocial = true,
  showControversy = true,
  showInfluence = true
}: PersonCardEnhancedProps) {

  // Helper functions for styling
  const getInfluenceColor = () => {
    const colors: Record<string, string> = {
      GLOBAL: 'text-purple-600 bg-purple-50',
      INTERNATIONAL: 'text-blue-600 bg-blue-50',
      NATIONAL: 'text-green-600 bg-green-50',
      REGIONAL: 'text-yellow-600 bg-yellow-50',
      LOCAL: 'text-gray-600 bg-gray-50',
      NICHE: 'text-gray-500 bg-gray-50'
    }
    return colors[person.influenceLevel] || 'text-gray-500 bg-gray-50'
  }

  const getReputationBadge = () => {
    if (!person.reputationStatus) return null
    const badges: Record<string, { bg: string; text: string; icon: string }> = {
      EXCELLENT: { bg: 'bg-green-100', text: 'text-green-800', icon: '⭐' },
      GOOD: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '👍' },
      MIXED: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🤔' },
      DAMAGED: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '⚠️' },
      SEVERELY_DAMAGED: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
      REHABILITATING: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🔄' }
    }
    return badges[person.reputationStatus]
  }

  const getPoliticalLeaningColor = () => {
    const colors: Record<string, string> = {
      FAR_LEFT: 'bg-red-600',
      LEFT: 'bg-red-500',
      CENTER_LEFT: 'bg-blue-400',
      CENTER: 'bg-gray-400',
      CENTER_RIGHT: 'bg-blue-600',
      RIGHT: 'bg-blue-700',
      FAR_RIGHT: 'bg-blue-900',
      LIBERTARIAN: 'bg-yellow-500',
      PROGRESSIVE: 'bg-green-500',
      CONSERVATIVE: 'bg-indigo-600'
    }
    return colors[person.politicalLeaning] || 'bg-gray-400'
  }

  const formatTitle = () => {
    const parts = []
    if (person.namePrefix) parts.push(person.namePrefix)
    parts.push(person.name)
    if (person.nameSuffix) parts.push(person.nameSuffix)
    return parts.join(' ')
  }

  const formatFollowers = (count: number) => {
    if (!count) return '0'
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
    return count.toString()
  }

  return (
    <div className="person-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header with gradient background */}
      <div className={`h-2 bg-gradient-to-r from-blue-500 to-purple-500`}></div>

      <div className="p-6">
        {/* Name and Basic Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link href={`/people/${person.slug}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                {formatTitle()}
              </h3>
            </Link>

            {person.aliases && person.aliases.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Also known as: {person.aliases.slice(0, 2).join(', ')}
              </p>
            )}

            {person.currentTitle && (
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <span className="font-medium">{person.currentTitle}</span>
                {person.currentOrganization && (
                  <span className="text-gray-600"> at {person.currentOrganization}</span>
                )}
              </p>
            )}
          </div>

          {/* Verification and Influence badges */}
          <div className="flex flex-col items-end gap-2">
            {person.isVerified && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                ✓ Verified
              </span>
            )}
            {showInfluence && person.influenceLevel && (
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getInfluenceColor()}`}>
                {person.influenceLevel}
              </span>
            )}
          </div>
        </div>

        {/* Professions and Nationality */}
        <div className="flex flex-wrap gap-2 mb-4">
          {person.primaryProfession && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {person.primaryProfession.replace(/_/g, ' ')}
            </span>
          )}
          {/* Nationality - Use new structured data from API */}
          {person.nationalities && person.nationalities.length > 0 && (
            <>
              {person.nationalities.slice(0, 2).map((nat: any) => (
                <span key={nat.code} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1">
                  <span>{nat.flagEmoji}</span>
                  <span>{nat.name}</span>
                  {nat.isPrimary && <span className="text-blue-600">★</span>}
                </span>
              ))}
              {person.nationalities.length > 2 && (
                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                  +{person.nationalities.length - 2} more
                </span>
              )}
            </>
          )}
          {person.industry && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
              {person.industry.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Bio */}
        {person.shortBio && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {person.shortBio}
          </p>
        )}

        {/* Political Affiliation and Leaning */}
        {(person.politicalAffiliation || person.politicalLeaning) && (
          <div className="mb-4 flex items-center gap-2">
            {person.politicalAffiliation && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                {person.politicalAffiliation.replace(/_/g, ' ')}
              </span>
            )}
            {person.politicalLeaning && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Leaning:</span>
                <div className={`w-3 h-3 rounded-full ${getPoliticalLeaningColor()}`}></div>
                <span className="text-xs text-gray-600">{person.politicalLeaning.replace(/_/g, ' ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Social Media Presence */}
        {showSocial && (person.hasTwitter || person.hasLinkedIn || person.hasInstagram) && (
          <div className="border-t pt-3 mb-3">
            <div className="flex items-center gap-4 text-sm">
              {person.hasTwitter && person.twitterHandle && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-400">𝕏</span>
                  <span className="text-gray-600">@{person.twitterHandle}</span>
                  {person.twitterFollowers && (
                    <span className="text-gray-500 text-xs">
                      ({formatFollowers(person.twitterFollowers)})
                    </span>
                  )}
                </div>
              )}
              {person.hasLinkedIn && (
                <span className="text-blue-600">
                  <span className="font-bold">in</span> LinkedIn ✓
                </span>
              )}
              {person.hasInstagram && person.instagramFollowers && (
                <div className="flex items-center gap-1">
                  <span className="text-pink-600">📷</span>
                  <span className="text-gray-600">
                    {formatFollowers(person.instagramFollowers)}
                  </span>
                </div>
              )}
            </div>
            {person.totalSocialReach && (
              <p className="text-xs text-gray-500 mt-1">
                Total reach: {formatFollowers(person.totalSocialReach)}
              </p>
            )}
          </div>
        )}

        {/* Statistics Grid */}
        {showStats && (
          <div className="grid grid-cols-4 gap-2 pt-3 border-t text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {person.statementCount || 0}
              </div>
              <div className="text-xs text-gray-500">Statements</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {person.responseCount || 0}
              </div>
              <div className="text-xs text-gray-500">Responses</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {person.supportGiven || 0}
              </div>
              <div className="text-xs text-gray-500">Support</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {person.criticismsMade || 0}
              </div>
              <div className="text-xs text-gray-500">Criticisms</div>
            </div>
          </div>
        )}

        {/* Controversy and Reputation */}
        {showControversy && (person.hasControversies || person.reputationStatus) && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between">
              {person.reputationStatus && (
                <div className="flex items-center gap-2">
                  {(() => {
                    const badge = getReputationBadge()
                    return badge ? (
                      <span className={`px-2 py-1 rounded text-xs ${badge.bg} ${badge.text}`}>
                        {badge.icon} {person.reputationStatus.replace(/_/g, ' ')}
                      </span>
                    ) : null
                  })()}
                </div>
              )}

              {person.controversyScore !== null && person.controversyScore !== undefined && (
                <div className="text-sm">
                  <span className="text-gray-500">Controversy:</span>
                  <span className={`ml-2 font-semibold ${
                    person.controversyScore > 70 ? 'text-red-600' :
                    person.controversyScore > 40 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {person.controversyScore.toFixed(0)}/100
                  </span>
                </div>
              )}
            </div>

            {person.hasBeenCancelled && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                ⚠️ Has been cancelled
                {person.cancelledDate && (
                  <span className="ml-2">
                    ({format(new Date(person.cancelledDate), 'MMM yyyy')})
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Status Flags */}
        <div className="flex flex-wrap gap-1 mt-4">
          {person.isPolitician && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
              Politician
            </span>
          )}
          {person.isActivist && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              Activist
            </span>
          )}
          {person.publicFigure && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Public Figure
            </span>
          )}
          {person.isPEP && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
              PEP
            </span>
          )}
          {person.isHighProfile && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
              High Profile
            </span>
          )}
          {person.isDeceased && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              Deceased
            </span>
          )}
        </div>

        {/* Influence Score Bar */}
        {showInfluence && person.influenceScore !== null && person.influenceScore !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Influence Score</span>
              <span>{person.influenceScore.toFixed(0)}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${person.influenceScore}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}