import Head from 'next/head'

interface OrganizationSchema {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo?: string
  sameAs?: string[]
  description?: string
}

interface WebsiteSchema {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  potentialAction?: {
    '@type': 'SearchAction'
    target: string
    'query-input': string
  }
}

interface ArticleSchema {
  '@context': 'https://schema.org'
  '@type': 'Article'
  headline: string
  description?: string
  datePublished?: string
  dateModified?: string
  author?: {
    '@type': 'Organization'
    name: string
  }
  publisher?: {
    '@type': 'Organization'
    name: string
    logo?: {
      '@type': 'ImageObject'
      url: string
    }
  }
}

interface PersonSchema {
  '@context': 'https://schema.org'
  '@type': 'Person'
  name: string
  description?: string
  image?: string
  url?: string
}

interface BreadcrumbSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item?: string
  }>
}

interface StructuredDataProps {
  type: 'organization' | 'website' | 'article' | 'person' | 'breadcrumb'
  data: OrganizationSchema | WebsiteSchema | ArticleSchema | PersonSchema | BreadcrumbSchema
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data)
        }}
      />
    </Head>
  )
}

// Helper functions to generate common schemas
export function generateOrganizationSchema(): OrganizationSchema {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Words Record',
    url: siteUrl,
    logo: `${siteUrl}/images/LOGO-HEADER.png`,
    description: 'Comprehensive documentation of public statements, allegations, and responses. Neutral, factual, and thoroughly sourced.',
    sameAs: [
      // Add social media links when available
      // 'https://twitter.com/TheWordsRecord',
      // 'https://linkedin.com/company/thewordsrecord'
    ]
  }
}

export function generateWebsiteSchema(): WebsiteSchema {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Words Record',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
}

export function generateArticleSchema(
  title: string,
  description?: string,
  publishedDate?: string,
  modifiedDate?: string
): ArticleSchema {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author: {
      '@type': 'Organization',
      name: 'The Words Record'
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Words Record',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/LOGO-HEADER.png`
      }
    }
  }
}

export function generatePersonSchema(
  name: string,
  description?: string,
  imageUrl?: string,
  profileUrl?: string
): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description,
    image: imageUrl,
    url: profileUrl
  }
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): BreadcrumbSchema {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thewordsrecord.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${siteUrl}${item.url}` : undefined
    }))
  }
}
