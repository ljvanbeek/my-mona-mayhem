# Project Instructions

## Overview

Mona Mayhem is an Astro app intended to compare GitHub contribution activity between users. It uses Astro 6 with the `@astrojs/node` standalone adapter and server output. The app is currently a scaffold; the contribution API route is not implemented yet.

Application code lives in `src/`, with file-based pages under `src/pages/` and API endpoints under `src/pages/api/`. Static assets belong in `public/`. The `docs/`, `localizations/`, and root README files support the published project; do not treat workshop materials as application implementation.

## Commands

- `npm install` installs dependencies.
- `npm run dev` starts the local development server.
- `npm run build` creates the production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npx astro` runs the Astro CLI; for example, `npx astro check` if the required check tooling is available.

There are currently no test, lint, or type-check scripts defined in `package.json`.

## Astro Guidelines

- Follow Astro's file-based routing: add pages and endpoints under `src/pages/`.
- Prefer `.astro` components and server-rendered output for page UI. Add client-side JavaScript only for interactions that need it.
- Keep server-only logic and secrets out of browser-facing code. Read secrets from environment variables, never hard-code them.
- Type API handlers with Astro's `APIRoute`; validate route parameters and handle upstream failures before returning responses.
- Keep API response status codes and content-type headers explicit, and avoid exposing upstream credentials or internal error details.
- Preserve the configured Node standalone adapter and server output unless a deployment change is explicitly requested.
- Use the existing strict TypeScript configuration and keep changes focused on the relevant application code.
