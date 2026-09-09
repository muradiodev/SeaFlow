# SeaFlow

A maritime safety management application built with React, TypeScript, Express, Drizzle ORM, and Neon PostgreSQL. Includes ship management, documents, certificates, logs, KPI dashboards, and user accounts.

## Local setup

1. Install Node.js 20.19+ and run `npm ci`.
2. Copy `.env.example` to `.env` and set your Neon `DATABASE_URL` and a unique `SESSION_SECRET`.
3. Apply the database schema with `node --env-file=.env ./node_modules/drizzle-kit/bin.cjs push`. Review the proposed database changes before accepting.
4. Run `npm run dev` and open `http://127.0.0.1:5000`.

## Commands

- `npm run dev` — start the development server.
- `npm run check` — check TypeScript types.
- `npm run build` — build the client and server.
- `npm start` — run the production build.

For production, supply environment variables through your hosting platform, use a strong session secret, and serve the application over HTTPS. Set `HOST=0.0.0.0` if your hosting platform requires it.

## Repository hygiene

Keep real credentials in `.env` or your hosting platform's secret store. `.env` files, dependencies, build output, and local IDE settings are ignored; `.env.example` contains placeholders only. Seed scripts contain demonstration accounts and should only be used with development databases.
