# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Artist portfolio website for Tarek Atoui (electroacoustic composer/artist). Static site deployed to Firebase Hosting (site `studiotarekatoui`), production domain tarekatoui.com.

## Commands

- `pnpm dev` — start Next.js dev server
- `pnpm build` — static export to `out/` directory
- `pnpm media:upload` — sync `public/images`, `public/portfolio`, and `public/media` to the GCS bucket and prefix configured in `.env`
- `pnpm lint` — lint with Biome
- `pnpm format` — format with Biome (auto-fix)
- `pnpm check` — Biome lint + format combined (auto-fix)
- `pnpm verify` — validate `src/data/site-content.json` (`verify:zod` runs the full zod schema; `verify:data` independently checks research theme structure and IDs)

No test framework.

## Branches & Deployment

- `main` — trimmed production site (`/`, `/about`, `/contact`, `/news`) served at tarekatoui.com
- `dev` — preparing `/research` and `/research/[slug]` for production; `/portfolio` and `/chronology` are excluded from routing and static exports via private folders (`src/app/_portfolio`, `src/app/_chronology`)

When deploying production: run `pnpm deploy:prod` from `main`. Upload new media with `pnpm media:upload` before deploying. Media is configured to use the shared Google Cloud CDN at `https://cdn.typedefinc.com/tarekatoui.com` via `NEXT_PUBLIC_MEDIA_BASE_URL` in `.env`; copy `.env.example` for a fresh checkout. Uploads continue to `gs://typedef/tarekatoui.com`. A rebuild and deployment are required for media URL changes to reach the live site. The corresponding GCS objects must be publicly readable. Firebase Hosting excludes `images/**`, `portfolio/**`, and `media/**` for both targets. Local files remain in `public/` for imports and uploads; `out/portfolio` contains shared media, not an exported portfolio page. Production builds require the media base URL. Shared CDN resources and rollback are recorded in `cdn-plan.md`.

## Tech Stack

- **Next.js 16** with static export (`output: 'export'` in next.config.ts)
- **React 19**, TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **zod v4** for data validation
- **Biome** for linting/formatting (not ESLint/Prettier)
- **pnpm** as package manager
- **Firebase Hosting** for deployment (static files from `out/`)

## Architecture

Routes (all statically exported; server pages compose `'use client'` components):

- `/` — Bio, Exhibitions, Contact sections
- `/about`, `/contact`, `/news` — single-purpose pages
- `/portfolio`, `/chronology` — disabled; page source is retained in private folders and excluded from static exports
- `/research` — hub for long-term research themes (`ProjectsHub`)
- `/research/[slug]` — one page per theme (`ResearchThread`), slugs from `generateStaticParams` over theme ids

### Data layer

All content lives in JSON under `src/data/`, validated with zod **strictObject** schemas at module load — adding a key to the JSON fails the build until the schema is updated (and `scripts/verify.mjs`, which duplicates the key lists independently).

- `site-content.json` ↔ `schema.ts`, parsed once by `siteContent.ts` — all active editorial content: site meta, navigation, bio, portrait, news, contact, research `themes` with descriptions, gallery images/captions and media, and `researchEvents` linked by `themeIds` for timeline marks, hover details, place counts, thread instance lists, and presentation media/URLs included in research galleries and reference links.
- Client components share the single `useSiteData()` context (`SiteDataProvider` wraps the app in `layout.tsx`). Server pages use `siteContent` and `getTheme` from `siteContent.ts` for research routes and metadata.
- `media-assets.json` — generated media download lookup, separate from editorial content.
- `src/data/old/` — shelved dated `projects`, `openQuestions`, and the original `portfolio` records (including every description and image caption). Only the disabled portfolio and chronology pages consume this archive; active research pages do not import it. See `src/data/old/README.md` for text provenance.

### Theming

Dark/light mode uses CSS custom variables defined in `globals.css` (`:root` / `:root.dark`). A blocking inline script in `layout.tsx` reads `localStorage('theme')` to avoid flash; `ThemeToggle` switches it. Fonts are Google-hosted with CSS variables: Inter (body), Instrument Serif (`--font-display`, headings), IBM Plex Mono (`--font-mono`, micro-labels).

## Styling Conventions

- Tailwind utility classes with CSS custom properties for colors (e.g., `var(--color-text)`)
- Responsive values use `clamp()` functions, not Tailwind breakpoints for sizing
- Mobile nav breakpoint uses `max-md:` prefix
- Recurring label idiom: uppercase mono micro-labels (`font-mono text-[10-11px] uppercase tracking-[0.2em+]`)
- Path alias: `@/*` maps to `./src/*`

## Biome Configuration

- Indent: 4 spaces
- Line width: 150
- Single quotes, semicolons always, ES5 trailing commas
- `noImgElement` rule is disabled (site uses `<img>` since images are unoptimized for static export)
