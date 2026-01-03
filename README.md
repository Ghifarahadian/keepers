# KEEPERS

A minimal, elegant landing page for a custom photobook service.

![KEEPERS Landing Page](mockup/mockup.jpeg)

## Features

- Clean, minimal design
- Responsive layout
- Serif typography
- Simple navigation
- Toggleable "Coming Soon" mode
- Environment-based configuration

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm start
```

## Project Structure

```
keepers/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Configuration & utilities
├── mockup/          # Design mockup
├── public/          # Static assets
└── CLAUDE.md        # Detailed documentation
```

## Coming Soon Mode

Toggle between full landing page and "coming soon" mode using environment variables.

### Quick Start

1. Copy `.env.local.example` to `.env.local`
2. Set `NEXT_PUBLIC_COMING_SOON_MODE=true`
3. Restart dev server

### Vercel Deployment

Add environment variable in Vercel Dashboard:
- **Key**: `NEXT_PUBLIC_COMING_SOON_MODE`
- **Value**: `true`
- **Environment**: Production

See [CLAUDE.md](CLAUDE.md) for detailed documentation.

## License

Private project.
