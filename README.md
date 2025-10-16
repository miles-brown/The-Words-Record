# Who Said What

> A comprehensive knowledge graph documenting public statements, cases, and responses with neutral, factual analysis.
>
> **Latest Update:** Unified visual design system implemented across admin dashboard.

## Features

- 📝 **Case Documentation** - Detailed records of public events and statements
- 👥 **Person Profiles** - Wikipedia-style profiles with biographical information and affiliations
- 🏢 **Organizations** - Track institutional responses and affiliations
- 🔗 **Knowledge Graph** - Relational structure connecting people, events, statements, and organizations
- 🔍 **Full-Text Search** - Fast autocomplete search across all content
- 📱 **Responsive Design** - Mobile-friendly interface with progressive web app support
- 📊 **Timeline Views** - Chronological presentation of related cases
- 🎨 **Elegant Typography** - Garamond quotes with curly quotation marks
- 📚 **Source Citations** - Comprehensive reference system with credibility tracking

## Tech Stack

- **Framework:** Next.js 14 (Pages Router)
- **Database:** SQLite (dev) / PostgreSQL (production)
- **ORM:** Prisma
- **Styling:** CSS-in-JS with styled-jsx
- **Fonts:** Inter, Merriweather, Garamond
- **Deployment:** Vercel (recommended)

## Quick Start

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/who-said-what.git
cd who-said-what
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

Visit http://localhost:3002

### Import Content

Import cases from markdown:
```bash
npx tsx scripts/import-markdown.ts data/example-cases.md
```

See [IMPORT-GUIDE.md](./data/IMPORT-GUIDE.md) for content formatting.

## Deployment

### Deploy to Vercel (Recommended)

**Quick Start:** See [VERCEL-QUICKSTART.md](./VERCEL-QUICKSTART.md)

**Full Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

1. Update `prisma/schema.prisma` to use PostgreSQL
2. Push to GitHub
3. Import to Vercel
4. Add Vercel Postgres database
5. Run migrations
6. Import data

## Project Structure

```
├── components/          # React components
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   ├── cases/         # Case pages
│   ├── persons/       # Person profiles
│   └── organizations/ # Organization pages
├── prisma/            # Database schema and migrations
├── scripts/           # Import and migration scripts
├── data/              # Content import files
├── styles/            # Global styles
└── public/            # Static assets
```

## Database Schema

### Core Models

- **Person** - Individuals with biographical data and affiliations
- **Organization** - Institutions with type classification
- **Case** - Specific events with media framing and outcomes
- **Event** - Wider contexts grouping multiple cases
- **Statement** - What was said, with context and verification
- **Response** - Reactions and responses to statements
- **Affiliation** - Person-organization relationships with roles
- **Source** - Citations with credibility tracking
- **Tag** - Categorization system

### Knowledge Graph Features

- Hierarchical event relationships (Event → Cases)
- Person-organization affiliations with roles and date ranges
- Media framing tracking
- Triggering events and outcomes
- Multi-level tagging system

## Content Import

### Markdown Format

```markdown
## Person Name
- **Profession:** Their role
- **Date:** Date of case
- **Exact Wording:** *"The exact quote"*
- **Context:** Background information
- **Platform:** Where it was said
- **Media Coverage / Framing:** How media reported it
- **Categories:** Tag1 / Tag2 / Tag3
- **Response / Outcome:** How they responded
- **Citations:** Source URLs
```

Import:
```bash
npx tsx scripts/import-markdown.ts data/your-file.md
```

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
```

## Environment Variables

```env
DATABASE_URL="file:./dev.db"                              # Development (SQLite)
# DATABASE_URL="postgresql://..."                         # Production (PostgreSQL)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"             # Site URL
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"                         # Google Analytics (optional)
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

- **Documentation:** See `/docs` folder
- **Import Guide:** [IMPORT-GUIDE.md](./data/IMPORT-GUIDE.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues:** https://github.com/yourusername/who-said-what/issues