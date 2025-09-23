import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const casesDirectory = path.join(process.cwd(), 'content/cases')

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

      return {
        slug,
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || content.slice(0, 150) + '...',
        tags: data.tags || [],
        person: data.person || '',
        status: data.status || 'documented',
        sources: data.sources || [],
        ...data
      }
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

  return {
    slug,
    content,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString(),
    person: data.person || '',
    incident_date: data.incident_date || '',
    tags: data.tags || [],
    sources: data.sources || [],
    status: data.status || 'documented',
    summary: data.summary || '',
    ...data
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
