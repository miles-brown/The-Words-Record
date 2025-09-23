import Head from 'next/head'
import Link from 'next/link'
import { format } from 'date-fns'
import { getCaseBySlug, getAllCaseSlugs } from '../../lib/cases'
import Layout from '../../components/Layout'
import { remark } from 'remark'
import html from 'remark-html'

export default function CasePage({ caseData, content }) {
  if (!caseData) {
    return (
      <Layout>
        <div className="error-page">
          <h1>Case Not Found</h1>
          <p>The requested case study could not be found.</p>
          <Link href="/cases">← Back to Cases</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{caseData.title} - Who Said What</title>
        <meta name="description" content={caseData.summary || caseData.excerpt} />
      </Head>

      <article className="case-article">
        <div className="case-header">
          <Link href="/cases" className="back-link">
            ← Back to Cases
          </Link>
          
          <div className="case-meta">
            <h1>{caseData.title}</h1>
            <div className="meta-info">
              <span className="person">Person: {caseData.person}</span>
              {caseData.incident_date && (
                <span className="incident-date">
                  Incident: {format(new Date(caseData.incident_date), 'MMMM d, yyyy')}
                </span>
              )}
              <span className="published-date">
                Published: {format(new Date(caseData.date), 'MMMM d, yyyy')}
              </span>
              <span className={`status status-${caseData.status}`}>
                Status: {caseData.status}
              </span>
            </div>
            
            {caseData.tags && caseData.tags.length > 0 && (
              <div className="tags">
                {caseData.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {caseData.summary && (
          <div className="case-summary">
            <h2>Summary</h2>
            <p>{caseData.summary}</p>
          </div>
        )}

        <div className="case-content" dangerouslySetInnerHTML={{ __html: content }} />

        {caseData.sources && caseData.sources.length > 0 && (
          <div className="sources-section">
            <h2>Sources</h2>
            <ol className="sources-list">
              {caseData.sources.map((source, index) => (
                <li key={index}>{source}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="case-footer">
          <div className="disclaimer">
            <h3>Disclaimer</h3>
            <p>
              This case study is compiled from publicly available information and documented sources. 
              We strive for accuracy and neutrality. If you have corrections or additional verified 
              sources, please contact us.
            </p>
          </div>
        </div>
      </article>

      <style jsx>{`
        .case-article {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .back-link {
          color: #3498db;
          text-decoration: none;
          margin-bottom: 2rem;
          display: inline-block;
        }
        
        .back-link:hover {
          text-decoration: underline;
        }
        
        .case-header {
          margin-bottom: 3rem;
        }
        
        .case-meta h1 {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        
        .meta-info {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
          color: #7f8c8d;
        }
        
        .meta-info span {
          background: #ecf0f1;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        
        .status-documented {
          background: #d5f4e6 !important;
          color: #27ae60 !important;
        }
        
        .status-ongoing {
          background: #ffeaa7 !important;
          color: #d63031 !important;
        }
        
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .tag {
          background: #3498db;
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
        .case-summary {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 3rem;
          border-left: 4px solid #3498db;
        }
        
        .case-summary h2 {
          margin-bottom: 1rem;
          color: #2c3e50;
        }
        
        .case-content {
          line-height: 1.8;
          color: #2c3e50;
        }
        
        .case-content :global(h2) {
          color: #2c3e50;
          margin: 2rem 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #ecf0f1;
        }
        
        .case-content :global(h3) {
          color: #34495e;
          margin: 1.5rem 0 0.8rem 0;
        }
        
        .case-content :global(ul), .case-content :global(ol) {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        .case-content :global(li) {
          margin-bottom: 0.5rem;
        }
        
        .case-content :global(blockquote) {
          border-left: 4px solid #95a5a6;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #7f8c8d;
        }
        
        .sources-section {
          margin: 3rem 0;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .sources-section h2 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }
        
        .sources-list {
          color: #5a6c7d;
        }
        
        .sources-list li {
          margin-bottom: 0.8rem;
          line-height: 1.6;
        }
        
        .case-footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #ecf0f1;
        }
        
        .disclaimer {
          background: #fff3cd;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #ffeaa7;
        }
        
        .disclaimer h3 {
          color: #856404;
          margin-bottom: 0.8rem;
        }
        
        .disclaimer p {
          color: #856404;
          margin: 0;
          line-height: 1.6;
        }
        
        .error-page {
          text-align: center;
          padding: 4rem 0;
        }
        
        .error-page h1 {
          color: #e74c3c;
          margin-bottom: 1rem;
        }
        
        .error-page a {
          color: #3498db;
          text-decoration: none;
        }
        
        @media (max-width: 768px) {
          .case-meta h1 {
            font-size: 2rem;
          }
          
          .meta-info {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .case-summary, .sources-section {
            padding: 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}

export async function getStaticPaths() {
  const paths = getAllCaseSlugs()
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const caseData = getCaseBySlug(params.slug)
  
  if (!caseData) {
    return {
      notFound: true
    }
  }

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(caseData.content)
  const content = processedContent.toString()

  return {
    props: {
      caseData: {
        ...caseData,
        content: undefined // Remove content from caseData since we're passing it separately
      },
      content
    }
  }
}
