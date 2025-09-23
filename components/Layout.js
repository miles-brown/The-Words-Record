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
              <Link href="/contact">Contact</Link>
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

      
    </>
  )
}
