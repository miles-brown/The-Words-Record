import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const casesDirectory = path.join(process.cwd(), 'content/cases')

function formatCaseData(slug, data, content = '') {
  return {
    slug,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString(),
    person: data.person || '',
    tags: data.tags || [],
    sources: data.sources || [],
    status: data.status || 'documented',
    // For list view
    excerpt: data.excerpt || (content ? content.slice(0, 150) + '...' : ''),
    // For detail view
    case_date: data.case_date || '',
    summary: data.summary || '',
    ...data,
  };
}

export function getAllCases() {
  // Check if cases directory exists
  if (!fs.existsSync(casesDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(casesDirectory)
  const allCases = fileNames
    .filter(name => name.endsWith('.md'))
    .map((name) => {
      const slug = name.replace(/\.md$/, '')
      const fullPath = path.join(casesDirectory, name)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      return formatCaseData(slug, data, content);
    })

  // Sort by date, most recent first
  return allCases.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getCaseBySlug(slug) {
  const fullPath = path.join(casesDirectory, `${slug}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const formattedData = formatCaseData(slug, data);

  return {
    ...formattedData,
    content,
  }
}

export function getAllCaseSlugs() {
  if (!fs.existsSync(casesDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(casesDirectory)
  return fileNames
    .filter(name => name.endsWith('.md'))
    .map((name) => ({
      params: {
        slug: name.replace(/\.md$/, '')
      }
    }))
}
