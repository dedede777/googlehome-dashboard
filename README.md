# GoogleHome Dashboard

A customizable personal command center built with Next.js, React, and TypeScript.

The app started as a Google Home-style dashboard and has grown into a modular workspace for daily information, productivity, language learning, lightweight AI assistance, and Google Calendar management.

## Features

- Drag-and-drop widget dashboard with persistent local layout
- Weather, clock, tasks, memo, bookmarks, RSS, Pomodoro, quotes, habit, water, plant, expense, crypto, exchange, media, and embed widgets
- English learning widgets for flashcards, diary practice, conversation practice, shadowing, learning stats, and achievements
- Google Calendar integration through NextAuth and Google OAuth
- Natural-language calendar event creation with Gemini or Groq
- AI chat and RSS summarization endpoints
- Local-first customization using `localStorage`

## Demo

- Live app: https://googlehome-dashboard.vercel.app/
- Repository: https://github.com/dedede777/googlehome-dashboard

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- react-grid-layout
- NextAuth
- Google Calendar API
- Gemini API
- Groq API

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill in the values you need. The dashboard can render without AI or Google Calendar credentials, but those integrations require API keys and OAuth credentials.

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXTAUTH_URL` | Google sign-in | Use `http://localhost:3000` locally |
| `NEXTAUTH_SECRET` | Google sign-in | Generate a random secret |
| `GOOGLE_CLIENT_ID` | Google Calendar | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google Calendar | OAuth client secret |
| `GEMINI_API_KEY` | Gemini AI features | Used for chat and calendar parsing fallback |
| `GROQ_API_KEY` | Groq AI features | Used for summarization and calendar parsing |

For Google Calendar, configure the OAuth consent screen and add this redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

## Useful Scripts

```bash
npm run dev
npm run lint
npm run build
```

## Project Structure

```text
src/app/                 Next.js routes and API endpoints
src/components/          Dashboard shell, modals, layout, and shared UI
src/components/widgets/  Dashboard widgets
src/contexts/            Client-side settings and gamification state
src/lib/                 Auth and shared helpers
```

## Roadmap

- Add import/export for custom learning data
- Improve widget-level accessibility and keyboard support
- Add clearer empty states for API-backed widgets
- Add tests around calendar parsing and widget persistence
- Make theme presets easier to share

## Contributing

Small improvements are welcome. Good first areas are documentation, widget polish, accessibility fixes, and lightweight tests.

Please avoid committing local `.env*` files, generated data, or personal dashboard content.

## License

MIT
