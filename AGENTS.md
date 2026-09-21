# Repository Guidelines

## Project Structure & Module Organization

This repository contains Studio Tarek Atoui’s Payload 3 CMS, built with Next.js and React and deployed through Firebase App Hosting. Local and hosted instances share Firestore content. Publishing content does not update the studio website.

- `src/payload.config.ts` registers collections, globals, authentication components, and Firestore storage through Payload’s MongoDB adapter.
- `src/collections/` defines content schemas; `src/globals/` defines About, Contact, and the Research page.
- `src/components/` contains custom admin components; `src/lib/` contains media URL helpers.
- `src/auth.ts`, `src/auth/`, and `src/access.ts` handle authentication and permissions.
- `src/app/(payload)/` contains admin and API routes; `src/app/(frontend)/` contains frontend routes.
- `apphosting.yaml` configures hosting and secret references; `firebase.json` configures source deployment; `scripts/deploy.sh` deploys the CMS. Media stays on the existing GCS-backed CDN.

## Build, Test, and Development Commands

Use Node.js 22 and the pinned package manager, `pnpm@10.26.2`.

- `pnpm install` installs dependencies.
- `pnpm dev` starts the CMS at `http://localhost:3001/admin`.
- `pnpm build` creates a production build; `pnpm start` serves it locally on port 3001.
- `pnpm lint` runs ESLint with Next.js and TypeScript rules.
- `pnpm generate:types` regenerates `src/payload-types.ts` after schema changes.
- `pnpm generate:importmap` regenerates the admin component map after component registration changes.
- `bash scripts/deploy.sh` deploys to Firebase App Hosting and runs the required remote production build. Only deploy when requested.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, single quotes, no semicolons, trailing commas, and a 100-character print width, following `.prettierrc.json`. Match surrounding code. Use PascalCase for collection, global, and component files, and camelCase for fields and functions. Edit schema definitions rather than generated types. Keep changes scoped; avoid unrelated refactoring.

## Testing Guidelines

No test runner, test script, coverage threshold, or test naming convention is configured. Do not assume `pnpm test` exists. Run builds, linting, type checks, tests, or browser verification only when explicitly requested for the current turn. Report any verification performed or omitted.

## Commit & Pull Request Guidelines

The available history contains `feat: initial commit`; follow that conventional prefix style with concise, imperative subjects. Describe the change, affected schemas or authentication behavior, and verification status in pull requests. Link relevant issues and include screenshots for UI changes when available. Do not add agent attribution to commits.

## Security & Configuration

Copy `.env.example` to `.env` for setup; never commit credentials, uploads, or database files. Generate distinct `PAYLOAD_SECRET` and `AUTH_SECRET` values. Google login requires exact verified addresses in `CMS_ALLOWED_EMAILS`; an empty allowlist denies access. Preserve authenticated content access and restart the server after environment changes.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
