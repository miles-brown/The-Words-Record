import Head from 'next/head'
import Link from 'next/link'
import { getAllCases } from '../lib/cases'
import Layout from '../components/Layout'

export default function Home({ allCases }) {
  return (
    <Layout>
      <Head>
        <title>Who Said What - Documentation of Public Statements</title>
        <meta name="description" content="Neutral documentation of public statements and responses regarding antisemitism allegations" />
      </Head>

      <div className="hero-section">
        <h1>Who Said What</h1>
        <p className="subtitle">
          Factual documentation of public statements and their responses
        </p>
        <p className="description">
          A neutral resource documenting public statements, allegations, and responses 
          related to antisemitism claims. All information is sourced and verified.
        </p>
      </div>

      <section className="cases-preview">
        <h2>Recent Case Studies</h2>
        <div className="cases-grid">
          {allCases.slice(0, 6).map((caseStudy) => (
            <Link href={`/cases/${caseStudy.slug}`} key={caseStudy.slug}>
              <div className="case-card">
                <h3>{caseStudy.title}</h3>
                <p className="case-date">{caseStudy.date}</p>
                <p className="case-excerpt">{caseStudy.excerpt}</p>
                <div className="case-tags">
                  {caseStudy.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="view-all">
          <Link href="/cases">
            <button className="btn-primary">View All Cases</button>
          </Link>
        </div>
      </section>

      <style jsx>{`
        .hero-section {
          text-align: center;
          padding: 4rem 0;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          margin: -2rem -2rem 3rem -2rem;
        }
        
        .hero-section h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #2c3e50;
        }
        
        .subtitle {
          font-size: 1.4rem;
          color: #34495e;
          margin-bottom: 1rem;
        }
        
        .description {
          max-width: 600px;
          margin: 0 auto;
          color: #7f8c8d;
          line-height: 1.6;
        }
        
        .cases-preview h2 {
          margin-bottom: 2rem;
          color: #2c3e50;
        }
        
        .cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .case-card {
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          padding: 1.5rem;
          background: white;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .case-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .case-card h3 {
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }
        
        .case-date {
          color: #7f8c8d;
