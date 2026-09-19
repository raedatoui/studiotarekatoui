# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Artist portfolio website for Tarek Atoui (electroacoustic composer/artist). Static site deployed to Firebase Hosting (site `studiotarekatoui`), production domain tarekatoui.com.

## Commands

- `pnpm dev` — start Next.js dev server
- `pnpm build` — static export to `out/` directory
- `pnpm lint` — lint with Biome
- `pnpm format` — format with Biome (auto-fix)
- `pnpm check` — Biome lint + format combined (auto-fix)
- `pnpm verify` — validate `src/data/projects.json` (`verify:zod` runs the real zod schema; `verify:data` is an independent zero-dependency re-check of the same rules)

No test framework.

## Branches & Deployment

- `main` — trimmed production site (`/`, `/about`, `/contact`, `/news`) served at tarekatoui.com
- `dev` — preparing `/research` and `/research/[slug]` for production; `/portfolio` and `/chronology` are excluded from routing and static exports via private folders (`src/app/_portfolio`, `src/app/_chronology`)

When deploying production: run `pnpm deploy:prod` from `main`. Keep `out/portfolio`: it contains shared images used by research pages, not an exported portfolio page.

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

- `site-content.json` ↔ `schema.ts`, parsed in `siteContent.ts` — site meta, navigation, bio, exhibitions, contact, and the `portfolio` works. Client components read it via the `useSiteData()` context hook (`SiteDataProvider` wraps the app in `layout.tsx`).
- `projects.json` ↔ `projects-schema.ts`, parsed in `projects.ts` — two relationally linked collections: `themes` (long-term research projects) and `manifestations` (dated showings: exhibitions, performances, residencies…). A manifestation lists the `themeIds` it belongs to; one event can belong to several themes. `projects.ts` exports query helpers (`getTheme`, `manifestationsForTheme`, `themePlaces`…). `theme.portfolioId` joins a theme to its matching work in `site-content.json`'s portfolio.

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
