import Link from 'next/link'
import Head from 'next/head'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="container">
        <header>
          <nav>
            <div className="nav-brand">
              <Link href="/">
                <h1>Who Said What</h1>
              </Link>
            </div>
            <div className="nav-links">
              <Link href="/cases">Cases</Link>
              <Link href="/about">About</Link>
              <Link href="/methodology">Methodology</Link>
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer>
          <div className="footer-content">
            <div className="footer-section">
              <h4>About This Site</h4>
              <p>
                Neutral documentation of public statements and responses. 
                All content is factual and sourced.
              </p>
            </div>
            <div className="footer-section">
              <h4>Disclaimer</h4>
              <p>
                This site presents factual information from public sources. 
                We maintain strict neutrality and do not endorse any viewpoints.
              </p>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>
                For corrections or additional sources: 
                <br />contact@whosaidwhat.com
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Who Said What. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fafbfc;
        }
        
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        header {
          background: white;
          border-bottom: 1px solid #e0e6ed;
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        nav {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .nav-brand h1 {
          color: #2c3e50;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        
        .nav-links a {
          color: #5a6c7d;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .nav-links a:hover {
          color: #3498db;
        }
        
        main {
          flex: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          width: 100%;
        }
        
        footer {
          background: #2c3e50;
          color: white;
          margin-top: 4rem;
        }
        
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }
        
        .footer-section h4 {
          margin-bottom: 1rem;
          color: #ecf0f1;
        }
        
        .footer-section p {
          color: #bdc3c7;
          line-height: 1.6;
        }
        
        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          border-top: 1px solid #34495e;
          text-align: center;
          color: #95a5a6;
        }
        
        @media (max-width: 768px) {
          nav {
            flex-direction: column;
            gap: 1rem;
            padding: 0 1rem;
          }
          
          .nav-links {
            gap: 1rem;
          }
          
          main {
            padding: 1rem;
          }
          
          .footer-content {
            padding: 2rem 1rem 1rem;
          }
        }
      `}</style>
    </>
  )
}
