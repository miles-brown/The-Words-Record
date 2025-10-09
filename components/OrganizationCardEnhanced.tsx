import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface OrganizationCardEnhancedProps {
  organization: any
  showFinancials?: boolean
  showPolitical?: boolean
  showInfluence?: boolean
  showStats?: boolean
}

export function OrganizationCardEnhanced({
  organization,
  showFinancials = true,
  showPolitical = true,
  showInfluence = true,
  showStats = true
}: OrganizationCardEnhancedProps) {

  // Helper functions
  const getOrgTypeColor = () => {
    const colors: Record<string, string> = {
      // Advocacy & NGO
      ADVOCACY_GROUP: 'bg-green-100 text-green-800',
      THINK_TANK: 'bg-blue-100 text-blue-800',
      NGO: 'bg-teal-100 text-teal-800',
      CHARITY: 'bg-pink-100 text-pink-800',
      FOUNDATION: 'bg-purple-100 text-purple-800',

      // Media
      NEWS_OUTLET: 'bg-red-100 text-red-800',
      SOCIAL_MEDIA_PLATFORM: 'bg-indigo-100 text-indigo-800',

      // Political
      POLITICAL_PARTY: 'bg-yellow-100 text-yellow-800',
      PAC: 'bg-orange-100 text-orange-800',
      LOBBY_GROUP: 'bg-amber-100 text-amber-800',

      // Government
      GOVERNMENT_AGENCY: 'bg-gray-100 text-gray-800',
      LEGISLATIVE_BODY: 'bg-slate-100 text-slate-800',

      // Educational
      UNIVERSITY: 'bg-cyan-100 text-cyan-800',
      RESEARCH_CENTER: 'bg-sky-100 text-sky-800',

      // Business
      CORPORATION: 'bg-zinc-100 text-zinc-800',
      TECH_COMPANY: 'bg-violet-100 text-violet-800'
    }
    return colors[organization.orgType] || 'bg-gray-100 text-gray-800'
  }

  const getStanceColor = (stance: string) => {
    const colors: Record<string, string> = {
      STRONGLY_SUPPORTIVE: 'bg-blue-600',
      SUPPORTIVE: 'bg-blue-400',
      CONDITIONALLY_SUPPORTIVE: 'bg-blue-300',
      NEUTRAL: 'bg-gray-400',
      CONDITIONALLY_CRITICAL: 'bg-orange-300',
      CRITICAL: 'bg-orange-400',
      STRONGLY_CRITICAL: 'bg-red-500',
      BDS_SUPPORTER: 'bg-red-600'
    }
    return colors[stance] || 'bg-gray-400'
  }

  const getOperationalStatusBadge = () => {
    const badges: Record<string, { bg: string; text: string }> = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800' },
      DISSOLVED: { bg: 'bg-red-100', text: 'text-red-800' },
      SUSPENDED: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      MERGED: { bg: 'bg-blue-100', text: 'text-blue-800' },
      ACQUIRED: { bg: 'bg-purple-100', text: 'text-purple-800' },
      BANKRUPTCY: { bg: 'bg-red-200', text: 'text-red-900' }
    }
    return badges[organization.operationalStatus] || { bg: 'bg-gray-100', text: 'text-gray-800' }
  }

  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A'
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount.toFixed(0)}`
  }

  const formatEmployeeCount = (count: number) => {
    if (!count) return 'N/A'
    if (count >= 10000) return `${(count / 1000).toFixed(0)}K+`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <div className="organization-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header with organization type color */}
      <div className={`h-3 ${getOrgTypeColor().split(' ')[0]}`}></div>

      <div className="p-6">
        {/* Name and Basic Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link href={`/organizations/${organization.slug}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                {organization.name}
              </h3>
            </Link>

            {organization.legalName && organization.legalName !== organization.name && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Legal: {organization.legalName}
              </p>
            )}

            {/* Organization Type and Legal Structure */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs ${getOrgTypeColor()}`}>
                {organization.orgType?.replace(/_/g, ' ') || organization.type}
              </span>
              {organization.legalStructure && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {organization.legalStructure.replace(/_/g, ' ')}
                </span>
              )}
              {organization.taxStatus && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {organization.taxStatus.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Operational Status and Verification */}
          <div className="flex flex-col items-end gap-2">
            {organization.operationalStatus && (
              <span className={`px-2 py-1 rounded text-xs ${getOperationalStatusBadge().bg} ${getOperationalStatusBadge().text}`}>
                {organization.operationalStatus.replace(/_/g, ' ')}
              </span>
            )}
            {organization.verificationLevel && organization.verificationLevel !== 'UNVERIFIED' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                ✓ {organization.verificationLevel}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {organization.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {organization.description}
          </p>
        )}

        {/* Location and Size */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          {organization.headquartersCity && (
            <span className="flex items-center gap-1">
              📍 {organization.headquartersCity}
              {organization.headquartersCountry && `, ${organization.headquartersCountry}`}
            </span>
          )}
          {organization.organizationSize && (
            <span className="flex items-center gap-1">
              👥 {organization.organizationSize} org
            </span>
          )}
          {organization.employeeCount && (
            <span className="flex items-center gap-1">
              {formatEmployeeCount(organization.employeeCount)} employees
              {organization.employeeCountYear && ` (${organization.employeeCountYear})`}
            </span>
          )}
        </div>

        {/* Political Stance Section */}
        {showPolitical && (organization.politicalLeaning || organization.stanceOnIsrael) && (
          <div className="border-t pt-3 mb-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Political Position</h4>
            <div className="flex items-center gap-3">
              {organization.politicalLeaning && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Leaning:</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {organization.politicalLeaning.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
              {organization.stanceOnIsrael && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Israel:</span>
                  <div className={`w-3 h-3 rounded-full ${getStanceColor(organization.stanceOnIsrael)}`}></div>
                  <span className="text-xs">{organization.stanceOnIsrael.replace(/_/g, ' ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Information */}
        {showFinancials && (organization.annualRevenue || organization.annualBudget || organization.fundingSources?.length) && (
          <div className="border-t pt-3 mb-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Financial Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {organization.annualRevenue && (
                <div>
                  <span className="text-gray-500 text-xs">Revenue:</span>
                  <span className="ml-2 font-semibold">{formatCurrency(organization.annualRevenue)}</span>
                  {organization.revenueYear && <span className="text-xs text-gray-400"> ({organization.revenueYear})</span>}
                </div>
              )}
              {organization.annualBudget && (
                <div>
                  <span className="text-gray-500 text-xs">Budget:</span>
                  <span className="ml-2 font-semibold">{formatCurrency(organization.annualBudget)}</span>
                </div>
              )}
            </div>
            {organization.fundingSources && organization.fundingSources.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">Funding:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {organization.fundingSources.slice(0, 3).map((source: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                      {source.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {organization.fundingSources.length > 3 && (
                    <span className="text-xs text-gray-500">+{organization.fundingSources.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
            {organization.transparencyLevel && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Transparency:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  organization.transparencyLevel === 'FULL_DISCLOSURE' ? 'bg-green-100 text-green-800' :
                  organization.transparencyLevel === 'PARTIAL_DISCLOSURE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {organization.transparencyLevel.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Influence and Reach */}
        {showInfluence && (organization.influenceLevel || organization.socialMediaReach) && (
          <div className="border-t pt-3 mb-3">
            <div className="flex items-center justify-between">
              {organization.influenceLevel && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Influence:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    organization.influenceLevel === 'GLOBAL' ? 'bg-purple-100 text-purple-800' :
                    organization.influenceLevel === 'INTERNATIONAL' ? 'bg-blue-100 text-blue-800' :
                    organization.influenceLevel === 'NATIONAL' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {organization.influenceLevel}
                  </span>
                </div>
              )}
              {organization.publicationReach && (
                <div>
                  <span className="text-xs text-gray-500">Reach:</span>
                  <span className="ml-2 text-sm font-semibold">
                    {formatEmployeeCount(organization.publicationReach)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        {showStats && (
          <div className="grid grid-cols-4 gap-2 pt-3 border-t text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {organization.statementCount || 0}
              </div>
              <div className="text-xs text-gray-500">Statements</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {organization.caseCount || 0}
              </div>
              <div className="text-xs text-gray-500">Cases</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {organization.responseCount || 0}
              </div>
              <div className="text-xs text-gray-500">Responses</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {organization.citationCount || 0}
              </div>
              <div className="text-xs text-gray-500">Citations</div>
            </div>
          </div>
        )}

        {/* Relationships and Networks */}
        {(organization.parentOrganization || organization.subsidiaries?.length > 0 || organization.coalitionMemberships?.length > 0) && (
          <div className="mt-4 pt-3 border-t">
            {organization.parentOrganization && (
              <p className="text-xs text-gray-600 mb-1">
                <span className="text-gray-500">Parent:</span> {organization.parentOrganization.name}
              </p>
            )}
            {organization.subsidiaries && organization.subsidiaries.length > 0 && (
              <p className="text-xs text-gray-600 mb-1">
                <span className="text-gray-500">Subsidiaries:</span> {organization.subsidiaries.length}
              </p>
            )}
            {organization.coalitionMemberships && organization.coalitionMemberships.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">Coalitions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {organization.coalitionMemberships.slice(0, 2).map((coalition: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                      {coalition}
                    </span>
                  ))}
                  {organization.coalitionMemberships.length > 2 && (
                    <span className="text-xs text-gray-500">+{organization.coalitionMemberships.length - 2}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compliance and Issues */}
        {(organization.complianceIssues?.length > 0 || organization.sanctionsStatus || organization.controversies?.length > 0) && (
          <div className="mt-3 p-2 bg-red-50 rounded">
            <p className="text-xs text-red-700 font-semibold mb-1">⚠️ Issues</p>
            {organization.complianceIssues && organization.complianceIssues.length > 0 && (
              <p className="text-xs text-red-600">Compliance: {organization.complianceIssues.length} issues</p>
            )}
            {organization.sanctionsStatus && (
              <p className="text-xs text-red-600">Sanctions: {organization.sanctionsStatus}</p>
            )}
            {organization.controversies && organization.controversies.length > 0 && (
              <p className="text-xs text-red-600">Controversies: {organization.controversies.length}</p>
            )}
          </div>
        )}

        {/* Flags */}
        <div className="flex flex-wrap gap-1 mt-4">
          {organization.isPersonalBrand && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
              Personal Brand
            </span>
          )}
          {organization.isPEP && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
              PEP-linked
            </span>
          )}
          {organization.mediaOutlet && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
              Media Outlet
            </span>
          )}
        </div>

        {/* Data Quality Score */}
        {organization.dataQualityScore !== null && organization.dataQualityScore !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Data Quality</span>
              <span>{organization.dataQualityScore.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  organization.dataQualityScore > 80 ? 'bg-green-500' :
                  organization.dataQualityScore > 60 ? 'bg-yellow-500' :
                  organization.dataQualityScore > 40 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${organization.dataQualityScore}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}