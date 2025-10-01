import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        <li>
          <Link href="/">Home</Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <span className="separator">›</span>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span className="current">{item.label}</span>
            )}
          </li>
        ))}
      </ol>

      <style jsx>{`
        .breadcrumbs {
          margin-bottom: 1.5rem;
        }

        ol {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.9rem;
        }

        li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .separator {
          color: var(--text-secondary);
          user-select: none;
        }

        a {
          color: var(--accent-primary);
          text-decoration: none;
          transition: color 0.2s;
        }

        a:hover {
          color: var(--text-primary);
          text-decoration: underline;
        }

        .current {
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          ol {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </nav>
  )
}
