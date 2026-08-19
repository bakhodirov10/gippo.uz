# Gippo

Gippo is a single Next.js application. The user interface lives in `src/app`, and
the server API lives in the same application at `src/app/api/v1`.

## Structure

```text
src/app/                 # Pages and UI
src/app/api/v1/          # Next.js Route Handlers — the /api/v1 backend contract
src/server/              # Prisma-backed business services
prisma/                  # Schema and migrations
public/                  # Static assets
scripts/diagnostics/     # Standalone Gemini/Groq diagnostic scripts
```

## Local development

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, JWT secrets, and
   `GEMINI_API_KEY`.
2. Generate Prisma Client with `npm run prisma:generate`.
3. Run `npm run dev` and open `http://localhost:3000`.

The browser client calls `/api/v1/*` locally. There is no separate frontend
server or NestJS server to start.

## Useful commands

```bash
npm run dev
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

The Dockerfile builds the same standalone Next.js application.
