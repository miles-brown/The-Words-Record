import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { useState } from 'react'

export default function MethodologyPageRedesigned() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📖' },
    { id: 'principles', label: 'Core Principles', icon: '⚖️' },
    { id: 'verification', label: 'Verification Process', icon: '✓' },
    { id: 'sources', label: 'Source Evaluation', icon: '🔍' },
    { id: 'documentation', label: 'Documentation', icon: '📝' },
    { id: 'preservation', label: 'Preservation', icon: '🗄️' },
    { id: 'transparency', label: 'Transparency', icon: '🔓' },
    { id: 'limitations', label: 'Limitations', icon: '⚠️' },
    { id: 'corrections', label: 'Corrections', icon: '✏️' }
  ]

  return (
    <Layout>
      <Head>
        <title>Methodology - The Words Record</title>
        <meta name="description" content="Our comprehensive methodology for documenting, verifying, and preserving public statements with academic rigor and journalistic integrity." />
      </Head>

      <div className="methodology-container">
        {/* Hero Section */}
        <header className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Our Methodology</h1>
            <p className="hero-subtitle">
              A comprehensive framework for documenting truth in the digital age
            </p>
            <div className="hero-description">
              <p>
                In an era where information travels at the speed of light and misinformation spreads even faster,
                The Words Record serves as a bastion of verified truth. Our methodology combines the rigor of
                academic scholarship with the immediacy of modern journalism, creating a permanent, searchable
                record of public discourse.
              </p>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="section-nav">
          <div className="nav-inner">
            {sections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(section.id)
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <div className="content-wrapper">
          <main className="main-content">
            {/* Overview Section */}
            <section id="overview" className="content-section">
              <h2 className="section-title">Overview</h2>
              <div className="section-content">
                <p className="lead-text">
                  The Words Record employs a sophisticated, multi-layered approach to documenting public statements,
                  ensuring that every entry in our database meets the highest standards of accuracy, verifiability,
                  and contextual completeness.
                </p>

                <div className="highlight-box">
                  <h3>Our Mission</h3>
                  <p>
                    To create an authoritative, permanent record of public discourse that serves researchers,
                    journalists, historians, and citizens seeking verified information about what was said,
                    when it was said, and in what context.
                  </p>
                </div>

                <p>
                  Our methodology has been developed through extensive consultation with academic historians,
                  investigative journalists, information scientists, and digital preservation experts. It represents
                  a synthesis of best practices from multiple disciplines, adapted for the unique challenges of
                  documenting statements in the digital age.
                </p>

                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-number">476+</span>
                    <span className="stat-label">Verified Statements</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">263+</span>
                    <span className="stat-label">Documented Cases</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">95%</span>
                    <span className="stat-label">Primary Source Rate</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">100%</span>
                    <span className="stat-label">Citation Coverage</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Principles Section */}
            <section id="principles" className="content-section">
              <h2 className="section-title">Core Principles</h2>
              <div className="section-content">
                <p className="lead-text">
                  Our work is guided by five fundamental principles that ensure the integrity and
                  reliability of our documentation process.
                </p>

                <div className="principles-grid">
                  <div className="principle-card">
                    <div className="principle-icon">🎯</div>
                    <h3>Accuracy Above All</h3>
                    <p>
                      Every statement is verified against primary sources. We never rely solely on
                      secondary reporting or hearsay. When primary sources are unavailable, this
                      limitation is clearly noted.
                    </p>
                  </div>

                  <div className="principle-card">
                    <div className="principle-icon">⚖️</div>
                    <h3>Contextual Completeness</h3>
                    <p>
                      Statements are never presented in isolation. We document the full context,
                      including what prompted the statement, the venue or medium, and any immediate
                      clarifications or corrections.
                    </p>
                  </div>

                  <div className="principle-card">
                    <div className="principle-icon">🔓</div>
                    <h3>Radical Transparency</h3>
                    <p>
                      Our verification process, source materials, and any limitations are fully disclosed.
                      Users can see exactly how we arrived at our conclusions and make their own assessments.
                    </p>
                  </div>

                  <div className="principle-card">
                    <div className="principle-icon">🛡️</div>
                    <h3>Preservation Priority</h3>
                    <p>
                      Digital content is ephemeral. We archive everything, creating multiple redundant
                      copies to ensure statements remain verifiable even if original sources disappear.
                    </p>
                  </div>

                  <div className="principle-card">
                    <div className="principle-icon">🔄</div>
                    <h3>Continuous Verification</h3>
                    <p>
                      Documentation is not a one-time event. We continuously monitor our sources,
                      update entries when new information emerges, and clearly track all changes.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Verification Process Section */}
            <section id="verification" className="content-section">
              <h2 className="section-title">Verification Process</h2>
              <div className="section-content">
                <p className="lead-text">
                  Our verification process consists of seven rigorous stages, each designed to ensure
                  the highest level of accuracy and completeness in our documentation.
                </p>

                <div className="process-timeline">
                  <div className="process-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h3>Initial Discovery</h3>
                      <p>
                        Statements are identified through systematic monitoring of news sources, official
                        channels, social media, and user submissions. Our team employs both automated tools
                        and manual review to identify significant public statements.
                      </p>
                      <div className="step-details">
                        <h4>Sources monitored include:</h4>
                        <ul>
                          <li>Major news outlets and wire services (Reuters, AP, AFP)</li>
                          <li>Government press offices and official websites</li>
                          <li>Verified social media accounts of public figures</li>
                          <li>Parliamentary and congressional records</li>
                          <li>Court proceedings and legal documents</li>
                          <li>Academic publications and think tank reports</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="process-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>Source Authentication</h3>
                      <p>
                        Once identified, we verify the authenticity of the source. This includes confirming
                        the identity of the speaker, the date and location of the statement, and the
                        legitimacy of the publication or platform.
                      </p>
                      <div className="step-details">
                        <h4>Authentication methods:</h4>
                        <ul>
                          <li>Cross-referencing multiple independent sources</li>
                          <li>Verifying official account ownership</li>
                          <li>Checking publication timestamps and metadata</li>
                          <li>Confirming venue and event details</li>
                          <li>Validating video/audio through technical analysis</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="process-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h3>Content Verification</h3>
                      <p>
                        The actual content of the statement is carefully verified. We ensure quotes are
                        accurate, complete, and not taken out of context. Translation accuracy is verified
                        for non-English statements.
                      </p>
                      <div className="step-details">
                        <h4>Verification includes:</h4>
                        <ul>
                          <li>Word-for-word transcription from primary sources</li>
                          <li>Professional translation with native speaker review</li>
                          <li>Identification of any edits or omissions</li>
                          <li>Documentation of non-verbal context (tone, gestures)</li>
                          <li>Notation of audience reactions or interruptions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="process-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h3>Context Documentation</h3>
                      <p>
                        Understanding a statement requires understanding its context. We document what
                        prompted the statement, the broader conversation, and any relevant background
                        information.
                      </p>
                      <div className="step-details">
                        <h4>Contextual elements documented:</h4>
                        <ul>
                          <li>Questions or prompts that elicited the statement</li>
                          <li>Previous statements on the same topic</li>
                          <li>Ongoing events or controversies</li>
                          <li>Institutional or cultural context</li>
                          <li>Subsequent clarifications or corrections</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="process-step">
                    <div className="step-number">5</div>
                    <div className="step-content">
                      <h3>Impact Assessment</h3>
                      <p>
                        We document the real-world impact of statements, including responses, policy changes,
                        and consequences for individuals or organizations mentioned or affected.
                      </p>
                      <div className="step-details">
                        <h4>Impact metrics tracked:</h4>
                        <ul>
                          <li>Official responses and rebuttals</li>
                          <li>Policy or legislative changes</li>
                          <li>Employment or contract consequences</li>
                          <li>Legal proceedings initiated</li>
                          <li>Public discourse and media coverage</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="process-step">
                    <div className="step-number">6</div>
                    <div className="step-content">
                      <h3>Peer Review</h3>
                      <p>
                        Before publication, entries undergo internal peer review. Complex or sensitive
                        cases may be reviewed by external experts in relevant fields.
                      </p>
                      <div className="step-details">
                        <h4>Review process includes:</h4>
                        <ul>
                          <li>Fact-checking by independent researcher</li>
                          <li>Source verification by documentation specialist</li>
                          <li>Context review by subject matter expert</li>
                          <li>Legal review for sensitive content</li>
                          <li>Editorial review for clarity and completeness</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="process-step">
                    <div className="step-number">7</div>
                    <div className="step-content">
                      <h3>Publication & Monitoring</h3>
                      <p>
                        Once published, entries are continuously monitored. We track new developments,
                        update entries as needed, and respond to corrections or additional information.
                      </p>
                      <div className="step-details">
                        <h4>Ongoing activities:</h4>
                        <ul>
                          <li>Automated monitoring for source changes</li>
                          <li>Regular review cycles for high-impact entries</li>
                          <li>Integration of user-submitted corrections</li>
                          <li>Documentation of all updates and changes</li>
                          <li>Periodic comprehensive audits</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Source Evaluation Section */}
            <section id="sources" className="content-section">
              <h2 className="section-title">Source Evaluation Framework</h2>
              <div className="section-content">
                <p className="lead-text">
                  Not all sources are created equal. Our sophisticated evaluation framework helps users
                  understand the reliability and limitations of the information presented.
                </p>

                <div className="source-matrix">
                  <div className="matrix-header">
                    <h3>Source Credibility Matrix</h3>
                    <p>Every source is evaluated across multiple dimensions</p>
                  </div>

                  <div className="credibility-levels">
                    <div className="level primary">
                      <div className="level-header">
                        <span className="level-badge">PRIMARY</span>
                        <span className="level-score">95-100%</span>
                      </div>
                      <h4>Unmediated Sources</h4>
                      <p>
                        Direct, unedited access to the original statement with complete context.
                      </p>
                      <ul>
                        <li>Official transcripts and recordings</li>
                        <li>Live broadcasts and streams</li>
                        <li>Court records and legal filings</li>
                        <li>Original documents and press releases</li>
                        <li>Verified firsthand accounts</li>
                      </ul>
                    </div>

                    <div className="level verified">
                      <div className="level-header">
                        <span className="level-badge">VERIFIED</span>
                        <span className="level-score">80-94%</span>
                      </div>
                      <h4>Confirmed Secondary Sources</h4>
                      <p>
                        Reliable reporting from established outlets with editorial oversight.
                      </p>
                      <ul>
                        <li>Major news organizations with fact-checking</li>
                        <li>Peer-reviewed academic publications</li>
                        <li>Government and institutional reports</li>
                        <li>Verified journalist accounts</li>
                        <li>Multiple corroborating sources</li>
                      </ul>
                    </div>

                    <div className="level standard">
                      <div className="level-header">
                        <span className="level-badge">STANDARD</span>
                        <span className="level-score">60-79%</span>
                      </div>
                      <h4>Regular Media Sources</h4>
                      <p>
                        Generally reliable but may have limitations or potential biases.
                      </p>
                      <ul>
                        <li>Regional news outlets</li>
                        <li>Trade publications</li>
                        <li>Advocacy organization reports</li>
                        <li>Blog posts by recognized experts</li>
                        <li>Conference proceedings</li>
                      </ul>
                    </div>

                    <div className="level limited">
                      <div className="level-header">
                        <span className="level-badge">LIMITED</span>
                        <span className="level-score">40-59%</span>
                      </div>
                      <h4>Requiring Corroboration</h4>
                      <p>
                        Sources with known limitations that require additional verification.
                      </p>
                      <ul>
                        <li>Social media posts without verification</li>
                        <li>Opinion pieces and editorials</li>
                        <li>Partisan media outlets</li>
                        <li>Anonymous sources</li>
                        <li>Machine translations</li>
                      </ul>
                    </div>

                    <div className="level contested">
                      <div className="level-header">
                        <span className="level-badge">CONTESTED</span>
                        <span className="level-score">&lt;40%</span>
                      </div>
                      <h4>Disputed or Problematic</h4>
                      <p>
                        Sources with significant credibility issues, included only with clear warnings.
                      </p>
                      <ul>
                        <li>Known disinformation sources</li>
                        <li>Retracted reports</li>
                        <li>Disputed accounts</li>
                        <li>Unverifiable claims</li>
                        <li>Sources with history of fabrication</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="evaluation-factors">
                  <h3>Evaluation Criteria</h3>
                  <p>Each source is assessed across eight key dimensions:</p>

                  <div className="factors-grid">
                    <div className="factor">
                      <span className="factor-icon">🎯</span>
                      <h4>Accuracy History</h4>
                      <p>Track record of factual reporting</p>
                    </div>
                    <div className="factor">
                      <span className="factor-icon">🔍</span>
                      <h4>Transparency</h4>
                      <p>Disclosure of sources and methods</p>
                    </div>
                    <div className="factor">
                      <span className="factor-icon">⚖️</span>
                      <h4>Independence</h4>
                      <p>Freedom from conflicts of interest</p>
                    </div>
                    <div className="factor">
                      <span className="factor-icon">📊</span>
                      <h4>Expertise</h4>
                      <p>Subject matter knowledge</p>
                    </div>
                    <div className="factor">
                      <span className="factor-icon">🔄</span>
                      <h4>Corroboration</h4>
                      <p>Confirmation from other sources</p>
                    </div>
                    <div className="factor">
                      <span className="factor-icon">📅</span>
                      <h4>Timeliness</h4>
                      <p>Proximity to events described</p>
                    </div>
                    <div className="factor">
                      <span className="factor-icon">📝</span>
                      <h4>Documentation</h4>
                      <p>Quality of evidence provided</p>
                    </div>
                    <div className="factor">
                      <span className="factor-icon">✏️</span>
                      <h4>Corrections</h4>
                      <p>Willingness to acknowledge errors</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Documentation Standards Section */}
            <section id="documentation" className="content-section">
              <h2 className="section-title">Documentation Standards</h2>
              <div className="section-content">
                <p className="lead-text">
                  Our documentation standards ensure that every statement can be independently verified
                  and properly cited for academic, journalistic, or legal purposes.
                </p>

                <div className="documentation-framework">
                  <h3>Harvard Referencing System</h3>
                  <p>
                    We employ the Harvard referencing style, adapted for digital sources, ensuring
                    compatibility with academic standards worldwide.
                  </p>

                  <div className="citation-examples">
                    <h4>Citation Examples</h4>

                    <div className="example-card">
                      <h5>News Article</h5>
                      <code className="citation">
                        Johnson, M. (2024) 'Prime Minister addresses climate concerns', The Guardian,
                        15 March. Available at: https://theguardian.com/article-url
                        [Archived: https://web.archive.org/web/20240315/article-url]
                        (Accessed: 16 March 2024).
                      </code>
                    </div>

                    <div className="example-card">
                      <h5>Social Media</h5>
                      <code className="citation">
                        @username (2024) 'Full text of tweet here...', Twitter, 10 March, 14:30 UTC.
                        Available at: https://twitter.com/username/status/id
                        [Screenshot archived: TWR-2024-03-10-001]
                        (Accessed: 10 March 2024).
                      </code>
                    </div>

                    <div className="example-card">
                      <h5>Video/Broadcast</h5>
                      <code className="citation">
                        BBC News (2024) 'Interview with Foreign Secretary', BBC News at Ten
                        [Television broadcast], 20 March, 22:00 GMT. Transcript available at:
                        TWR Database, Reference: TWR-VID-2024-03-20-BBC-001.
                      </code>
                    </div>

                    <div className="example-card">
                      <h5>Official Document</h5>
                      <code className="citation">
                        UK Parliament (2024) House of Commons Debate, 18 March, vol. 747, cols. 234-245.
                        Available at: https://hansard.parliament.uk/commons/2024-03-18
                        (Accessed: 19 March 2024).
                      </code>
                    </div>
                  </div>
                </div>

                <div className="metadata-standards">
                  <h3>Required Metadata</h3>
                  <p>Every documented statement includes comprehensive metadata:</p>

                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <h4>Core Information</h4>
                      <ul>
                        <li>Speaker name and role</li>
                        <li>Date and time (with timezone)</li>
                        <li>Location or platform</li>
                        <li>Language of original statement</li>
                        <li>Full verbatim text</li>
                      </ul>
                    </div>
                    <div className="metadata-item">
                      <h4>Context Data</h4>
                      <ul>
                        <li>Event or occasion</li>
                        <li>Question or prompt</li>
                        <li>Audience description</li>
                        <li>Related statements</li>
                        <li>Follow-up responses</li>
                      </ul>
                    </div>
                    <div className="metadata-item">
                      <h4>Verification Data</h4>
                      <ul>
                        <li>Primary source links</li>
                        <li>Secondary sources</li>
                        <li>Verification status</li>
                        <li>Fact-check results</li>
                        <li>Reviewer notes</li>
                      </ul>
                    </div>
                    <div className="metadata-item">
                      <h4>Technical Data</h4>
                      <ul>
                        <li>Archive snapshots</li>
                        <li>File checksums</li>
                        <li>Entry creation date</li>
                        <li>Last update timestamp</li>
                        <li>Version history</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Digital Preservation Section */}
            <section id="preservation" className="content-section">
              <h2 className="section-title">Digital Preservation Strategy</h2>
              <div className="section-content">
                <p className="lead-text">
                  Digital content is inherently fragile. Our multi-layered preservation strategy ensures
                  that documented statements remain accessible and verifiable for decades to come.
                </p>

                <div className="preservation-layers">
                  <div className="layer">
                    <div className="layer-icon">🌐</div>
                    <h3>Web Archiving</h3>
                    <p>
                      Every web source is automatically submitted to multiple archive services including
                      the Internet Archive, Archive.today, and regional national archives. We maintain
                      links to all archived versions.
                    </p>
                  </div>

                  <div className="layer">
                    <div className="layer-icon">📸</div>
                    <h3>Screenshot Preservation</h3>
                    <p>
                      High-resolution screenshots are captured for all web content, social media posts,
                      and digital documents. These are stored with cryptographic hashes to ensure
                      authenticity.
                    </p>
                  </div>

                  <div className="layer">
                    <div className="layer-icon">🎥</div>
                    <h3>Media Archival</h3>
                    <p>
                      Video and audio content is downloaded, transcribed, and stored in multiple formats.
                      Original files are preserved alongside compressed versions for accessibility.
                    </p>
                  </div>

                  <div className="layer">
                    <div className="layer-icon">☁️</div>
                    <h3>Distributed Storage</h3>
                    <p>
                      Our database and archives are replicated across multiple geographic locations and
                      storage providers, ensuring resilience against data loss.
                    </p>
                  </div>

                  <div className="layer">
                    <div className="layer-icon">🔐</div>
                    <h3>Blockchain Verification</h3>
                    <p>
                      Critical entries are timestamped on public blockchains, providing immutable proof
                      of when documentation occurred and preventing retroactive tampering.
                    </p>
                  </div>
                </div>

                <div className="preservation-stats">
                  <h3>Preservation Metrics</h3>
                  <div className="stats-row">
                    <div className="preservation-stat">
                      <span className="stat-value">3+</span>
                      <span className="stat-label">Archive Services Used</span>
                    </div>
                    <div className="preservation-stat">
                      <span className="stat-value">99.9%</span>
                      <span className="stat-label">Source Availability</span>
                    </div>
                    <div className="preservation-stat">
                      <span className="stat-value">5</span>
                      <span className="stat-label">Redundant Copies</span>
                    </div>
                    <div className="preservation-stat">
                      <span className="stat-value">∞</span>
                      <span className="stat-label">Intended Lifespan</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Transparency Section */}
            <section id="transparency" className="content-section">
              <h2 className="section-title">Transparency Commitments</h2>
              <div className="section-content">
                <p className="lead-text">
                  Transparency is not just a principle—it's a practice embedded in every aspect of our work.
                  Users deserve to know exactly how we operate and make decisions.
                </p>

                <div className="transparency-grid">
                  <div className="commitment">
                    <h3>Open Methodology</h3>
                    <p>
                      This complete methodology is public. We hide nothing about our processes,
                      standards, or decision-making criteria. Suggestions for improvement are welcomed.
                    </p>
                  </div>

                  <div className="commitment">
                    <h3>Source Disclosure</h3>
                    <p>
                      Every source used is listed and linked. Users can examine the same evidence
                      we used and draw their own conclusions about accuracy and context.
                    </p>
                  </div>

                  <div className="commitment">
                    <h3>Change Tracking</h3>
                    <p>
                      All edits and updates are logged with timestamps, reasons, and attribution.
                      Users can view the complete history of any entry.
                    </p>
                  </div>

                  <div className="commitment">
                    <h3>Limitation Acknowledgment</h3>
                    <p>
                      When we cannot verify something, or when sources conflict, we clearly state
                      these limitations rather than making unfounded claims.
                    </p>
                  </div>

                  <div className="commitment">
                    <h3>Conflict Disclosure</h3>
                    <p>
                      Any potential conflicts of interest, funding sources, or institutional
                      affiliations that might affect our work are fully disclosed.
                    </p>
                  </div>

                  <div className="commitment">
                    <h3>Public Corrections</h3>
                    <p>
                      Errors are corrected promptly and publicly. We maintain a public log of all
                      corrections, what was wrong, and how it was fixed.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Limitations Section */}
            <section id="limitations" className="content-section">
              <h2 className="section-title">Limitations & Challenges</h2>
              <div className="section-content">
                <p className="lead-text">
                  No methodology is perfect. We acknowledge the inherent limitations in our work and
                  continuously strive to minimize their impact.
                </p>

                <div className="limitations-list">
                  <div className="limitation">
                    <h3>Language Barriers</h3>
                    <p>
                      While we strive for multilingual coverage, our team's language capabilities are
                      limited. Translations may not capture nuance, idiom, or cultural context perfectly.
                      We note when statements have been translated and provide the original text when possible.
                    </p>
                  </div>

                  <div className="limitation">
                    <h3>Selection Bias</h3>
                    <p>
                      Not every public statement can be documented. Our selection process, while systematic,
                      inevitably involves editorial judgment about significance and relevance. We may miss
                      important statements or over-represent certain speakers or topics.
                    </p>
                  </div>

                  <div className="limitation">
                    <h3>Temporal Constraints</h3>
                    <p>
                      There is often a delay between when a statement is made and when it appears in our
                      database. Breaking news situations may evolve faster than our verification process
                      allows. We prioritize accuracy over speed.
                    </p>
                  </div>

                  <div className="limitation">
                    <h3>Lost Context</h3>
                    <p>
                      Written documentation cannot fully capture tone of voice, body language, or other
                      non-verbal communication. Video and audio help, but even these miss the full
                      experience of being present.
                    </p>
                  </div>

                  <div className="limitation">
                    <h3>Source Disappearance</h3>
                    <p>
                      Despite our preservation efforts, some sources may become unavailable before we
                      can archive them. Deleted tweets, removed videos, and updated web pages can
                      compromise verification.
                    </p>
                  </div>

                  <div className="limitation">
                    <h3>Geographic Coverage</h3>
                    <p>
                      Our coverage is stronger in some regions than others, influenced by language
                      capabilities, source accessibility, and resource constraints. We acknowledge
                      these gaps and work to address them.
                    </p>
                  </div>
                </div>

                <div className="mitigation-box">
                  <h3>How We Mitigate Limitations</h3>
                  <ul>
                    <li>Partner with native speakers for translation verification</li>
                    <li>Maintain transparent selection criteria</li>
                    <li>Implement rapid archiving for time-sensitive content</li>
                    <li>Document non-verbal context when significant</li>
                    <li>Use multiple archive services for redundancy</li>
                    <li>Actively seek to diversify our coverage</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Corrections Section */}
            <section id="corrections" className="content-section">
              <h2 className="section-title">Corrections & Feedback</h2>
              <div className="section-content">
                <p className="lead-text">
                  We welcome corrections, additional sources, and feedback from our users. Every
                  submission is carefully reviewed and helps improve the accuracy and completeness
                  of our documentation.
                </p>

                <div className="corrections-process">
                  <h3>How to Submit a Correction</h3>

                  <div className="process-steps">
                    <div className="correction-step">
                      <span className="step-num">1</span>
                      <div>
                        <h4>Identify the Issue</h4>
                        <p>Specify the exact statement or entry with the error or omission.</p>
                      </div>
                    </div>

                    <div className="correction-step">
                      <span className="step-num">2</span>
                      <div>
                        <h4>Provide Evidence</h4>
                        <p>Include verifiable sources that support your correction.</p>
                      </div>
                    </div>

                    <div className="correction-step">
                      <span className="step-num">3</span>
                      <div>
                        <h4>Submit Details</h4>
                        <p>Use our correction form or email with all relevant information.</p>
                      </div>
                    </div>

                    <div className="correction-step">
                      <span className="step-num">4</span>
                      <div>
                        <h4>Verification Review</h4>
                        <p>Our team will verify the information and assess the correction.</p>
                      </div>
                    </div>

                    <div className="correction-step">
                      <span className="step-num">5</span>
                      <div>
                        <h4>Implementation</h4>
                        <p>Valid corrections are implemented with full attribution and transparency.</p>
                      </div>
                    </div>

                    <div className="correction-step">
                      <span className="step-num">6</span>
                      <div>
                        <h4>Notification</h4>
                        <p>You'll be notified of the outcome and any changes made.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="feedback-channels">
                  <h3>Contact Channels</h3>
                  <div className="channels-grid">
                    <div className="channel">
                      <h4>Corrections Form</h4>
                      <p>Our preferred method for detailed corrections with supporting documents.</p>
                      <Link href="/corrections">
                        <a className="channel-link">Submit Correction →</a>
                      </Link>
                    </div>
                    <div className="channel">
                      <h4>Email</h4>
                      <p>For complex issues or multiple corrections.</p>
                      <a href="mailto:corrections@thewordsrecord.com" className="channel-link">
                        corrections@thewordsrecord.com
                      </a>
                    </div>
                    <div className="channel">
                      <h4>Public GitHub</h4>
                      <p>For technical issues or methodology suggestions.</p>
                      <a href="https://github.com/thewordsrecord" className="channel-link">
                        GitHub Repository →
                      </a>
                    </div>
                  </div>
                </div>

                <div className="correction-stats">
                  <h3>Corrections Metrics</h3>
                  <div className="stats-row">
                    <div className="correction-stat">
                      <span className="stat-value">48hrs</span>
                      <span className="stat-label">Average Response Time</span>
                    </div>
                    <div className="correction-stat">
                      <span className="stat-value">87%</span>
                      <span className="stat-label">Corrections Accepted</span>
                    </div>
                    <div className="correction-stat">
                      <span className="stat-value">100%</span>
                      <span className="stat-label">Transparency Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-card">
              <h3>Quick Links</h3>
              <ul className="quick-links">
                <li><Link href="/sources"><a>Browse Sources</a></Link></li>
                <li><Link href="/cases"><a>View Cases</a></Link></li>
                <li><Link href="/statements"><a>All Statements</a></Link></li>
                <li><Link href="/corrections"><a>Submit Correction</a></Link></li>
              </ul>
            </div>

            <div className="sidebar-card">
              <h3>Download</h3>
              <p>Our complete methodology is available as a PDF for academic reference.</p>
              <button className="download-btn">
                📄 Download PDF (2.3 MB)
              </button>
            </div>

            <div className="sidebar-card">
              <h3>Last Updated</h3>
              <p className="update-date">November 1, 2024</p>
              <p className="update-note">
                Added blockchain verification section and updated source evaluation criteria.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .methodology-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
          padding: 4rem 3rem;
          margin-bottom: 3rem;
          text-align: center;
        }

        .hero-title {
          font-family: 'Cinzel', serif;
          font-size: 3.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-style: italic;
        }

        .hero-description {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-description p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--text-primary);
        }

        /* Navigation */
        .section-nav {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 3rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: sticky;
          top: 1rem;
          z-index: 100;
        }

        .nav-inner {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: var(--bg-secondary);
        }

        .nav-item.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .nav-label {
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Content Layout */
        .content-wrapper {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 3rem;
        }

        .main-content {
          min-width: 0;
        }

        /* Content Sections */
        .content-section {
          background: white;
          border-radius: 12px;
          padding: 3rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .section-title {
          font-family: 'Cinzel', serif;
          font-size: 2.2rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border-light);
        }

        .section-content {
          color: var(--text-secondary);
        }

        .lead-text {
          font-size: 1.2rem;
          line-height: 1.8;
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        /* Highlight Box */
        .highlight-box {
          background: var(--bg-secondary);
          border-left: 4px solid var(--accent);
          padding: 1.5rem;
          margin: 2rem 0;
          border-radius: 6px;
        }

        .highlight-box h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .highlight-box p {
          margin: 0;
          line-height: 1.6;
        }

        /* Statistics Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .stat-card {
          text-align: center;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        /* Principles Grid */
        .principles-grid {
          display: grid;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .principle-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .principle-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          transform: translate(30px, -30px);
        }

        .principle-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .principle-card h3 {
          color: white;
          margin-bottom: 0.75rem;
          font-size: 1.4rem;
        }

        .principle-card p {
          color: rgba(255,255,255,0.95);
          line-height: 1.6;
          margin: 0;
        }

        /* Process Timeline */
        .process-timeline {
          margin-top: 2rem;
        }

        .process-step {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-light);
        }

        .process-step:last-child {
          border-bottom: none;
        }

        .step-number {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .step-content {
          flex: 1;
        }

        .step-content h3 {
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          font-size: 1.4rem;
        }

        .step-content p {
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .step-details {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: 6px;
          margin-top: 1rem;
        }

        .step-details h4 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .step-details ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .step-details li {
          margin-bottom: 0.25rem;
        }

        /* Source Matrix */
        .source-matrix {
          margin-top: 2rem;
        }

        .matrix-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .matrix-header h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .credibility-levels {
          display: grid;
          gap: 1.5rem;
        }

        .level {
          border-radius: 8px;
          padding: 1.5rem;
          border: 2px solid;
        }

        .level.primary {
          background: rgba(34, 197, 94, 0.05);
          border-color: #22c55e;
        }

        .level.verified {
          background: rgba(59, 130, 246, 0.05);
          border-color: #3b82f6;
        }

        .level.standard {
          background: rgba(234, 179, 8, 0.05);
          border-color: #eab308;
        }

        .level.limited {
          background: rgba(251, 146, 60, 0.05);
          border-color: #fb923c;
        }

        .level.contested {
          background: rgba(239, 68, 68, 0.05);
          border-color: #ef4444;
        }

        .level-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .level-badge {
          font-weight: 600;
          font-size: 0.85rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          background: white;
        }

        .level.primary .level-badge { color: #22c55e; }
        .level.verified .level-badge { color: #3b82f6; }
        .level.standard .level-badge { color: #eab308; }
        .level.limited .level-badge { color: #fb923c; }
        .level.contested .level-badge { color: #ef4444; }

        .level-score {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .level h4 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .level p {
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .level ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .level li {
          margin-bottom: 0.25rem;
        }

        /* Evaluation Factors */
        .evaluation-factors {
          margin-top: 3rem;
        }

        .factors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .factor {
          text-align: center;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .factor-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .factor h4 {
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .factor p {
          font-size: 0.9rem;
          margin: 0;
        }

        /* Citation Examples */
        .citation-examples {
          margin-top: 1.5rem;
        }

        .example-card {
          background: var(--bg-secondary);
          border-radius: 6px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .example-card h5 {
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .citation {
          display: block;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
          background: white;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }

        /* Metadata Grid */
        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .metadata-item {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 6px;
        }

        .metadata-item h4 {
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .metadata-item ul {
          margin: 0;
          padding-left: 1.25rem;
        }

        .metadata-item li {
          margin-bottom: 0.25rem;
        }

        /* Preservation Layers */
        .preservation-layers {
          display: grid;
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .layer {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .layer-icon {
          font-size: 2.5rem;
        }

        .layer h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .layer p {
          line-height: 1.6;
          margin: 0;
        }

        /* Preservation Stats */
        .preservation-stats {
          margin-top: 2rem;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .preservation-stat {
          text-align: center;
          padding: 1.5rem;
          background: white;
          border: 2px solid var(--border-light);
          border-radius: 8px;
        }

        .preservation-stat .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 0.25rem;
        }

        .preservation-stat .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Transparency Grid */
        .transparency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .commitment {
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .commitment h3 {
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .commitment p {
          line-height: 1.6;
          margin: 0;
        }

        /* Limitations List */
        .limitations-list {
          margin: 2rem 0;
        }

        .limitation {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(239, 68, 68, 0.03);
          border-left: 4px solid #ef4444;
          border-radius: 6px;
        }

        .limitation h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .limitation p {
          line-height: 1.6;
          margin: 0;
        }

        .mitigation-box {
          background: rgba(34, 197, 94, 0.05);
          border: 2px solid #22c55e;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .mitigation-box h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .mitigation-box ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .mitigation-box li {
          margin-bottom: 0.5rem;
        }

        /* Corrections Process */
        .corrections-process {
          margin: 2rem 0;
        }

        .process-steps {
          display: grid;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .correction-step {
          display: flex;
          gap: 1.5rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        .step-num {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .correction-step h4 {
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .correction-step p {
          margin: 0;
          font-size: 0.95rem;
        }

        /* Feedback Channels */
        .channels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .channel {
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          text-align: center;
        }

        .channel h4 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .channel p {
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .channel-link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }

        .channel-link:hover {
          text-decoration: underline;
        }

        /* Correction Stats */
        .correction-stats {
          margin-top: 2rem;
        }

        .correction-stat {
          text-align: center;
          padding: 1rem;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 6px;
        }

        .correction-stat .stat-value {
          display: block;
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 0.25rem;
        }

        .correction-stat .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Sidebar */
        .sidebar {
          position: sticky;
          top: 6rem;
          height: fit-content;
        }

        .sidebar-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .sidebar-card h3 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .quick-links {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .quick-links li {
          margin-bottom: 0.75rem;
        }

        .quick-links a {
          color: var(--accent);
          text-decoration: none;
        }

        .quick-links a:hover {
          text-decoration: underline;
        }

        .download-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .download-btn:hover {
          opacity: 0.9;
        }

        .update-date {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .update-note {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Variables */
        :root {
          --text-primary: #2f3538;
          --text-secondary: #5f6f7a;
          --bg-primary: #f9f8f6;
          --bg-secondary: #f2f1ef;
          --accent: #4a5f71;
          --border-light: #e8e6e3;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .content-wrapper {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: none;
          }

          .nav-inner {
            justify-content: flex-start;
          }

          .stats-grid, .principles-grid, .factors-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .methodology-container {
            padding: 1rem;
          }

          .hero-section {
            padding: 2rem 1.5rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .content-section {
            padding: 2rem 1.5rem;
          }

          .section-title {
            font-size: 1.8rem;
          }

          .process-step {
            flex-direction: column;
            gap: 1rem;
          }

          .stats-grid, .principles-grid, .factors-grid,
          .metadata-grid, .transparency-grid, .channels-grid {
            grid-template-columns: 1fr;
          }

          .preservation-layers .layer {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </Layout>
  )
}