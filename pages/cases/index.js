import Head from 'next/head'
import Link from 'next/link'
import { format } from 'date-fns'
import { getAllCases } from '../../lib/cases'
import Layout from '../../components/Layout'

export default function CasesPage({ allCases }) {
  return (
    <Layout>
      <Head>
        <title>All Cases - Who Said What</title>
        <meta name="description" content="Complete list of documented public statements and responses" />
      </Head>

      <div className="cases-page">
        <h1>Legacy Case Studies</h1>
        <p className="page-description">
          Note: This is the legacy cases page using markdown files. 
          Please visit <Link href="/incidents"><a style={{color: 'var(--accent-primary)'}}>the new incidents page</a></Link> for 
          the updated database-driven content with better search and filtering capabilities.
        </p>

        <div className="cases-list">
          {allCases.map((caseStudy) => (
            <Link href={`/cases/${caseStudy.slug}`} key={caseStudy.slug}>
              <article className="case-item">
                <div className="case-header">
                  <h2>{caseStudy.title}</h2>
                  <div className="case-meta">
                    <span className="person">Person: {caseStudy.person}</span>
                    <span className="date">
                      Published: {format(new Date(caseStudy.date), 'MMMM d, yyyy')}
                    </span>
                    <span className={`status status-${caseStudy.status}`}>
                      Status: {caseStudy.status}
                    </span>
                  </div>
                </div>
                
                <p className="case-excerpt">{caseStudy.excerpt}</p>
                
                {caseStudy.tags && caseStudy.tags.length > 0 && (
                  <div className="case-tags">
                    {caseStudy.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            </Link>
          ))}
        </div>

        {allCases.length === 0 && (
          <div className="no-cases">
            <h2>No Cases Available</h2>
            <p>Case studies will appear here as they are documented and published.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .cases-page {
          max-width: 900px;
          margin: 0 auto;
        }
        
        .cases-page h1 {
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
        
        .page-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 3rem;
        }
        
        .cases-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .case-item {
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 2rem;
          background: var(--background-primary);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
          color: inherit;
        }
        
        .case-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .case-header {
          margin-bottom: 1rem;
        }
        
        .case-header h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 0.8rem;
        }
        
        .case-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .case-meta span {
          background: var(--background-secondary);
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        
        .status-documented {
          background: #d5f4e6 !important;
          color: #27ae60 !important;
        }
        
        .status-ongoing {
          background: #ffeaa7 !important;
          color: #d63031 !important;
        }
        
        .case-excerpt {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .case-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .tag {
          background: var(--accent-primary);
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
        .no-cases {
          text-align: center;
          padding: 4rem 0;
        }
        
        .no-cases h2 {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        
        .no-cases p {
          color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
          .cases-page h1 {
            font-size: 2rem;
          }
          
          .case-item {
            padding: 1.5rem;
          }
          
          .case-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </Layout>
  )
}

export async function getStaticProps() {
  const allCases = getAllCases()
  return {
    props: {
      allCases
    }
  }
}
