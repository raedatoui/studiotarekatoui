# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Artist portfolio website for Tarek Atoui (electroacoustic composer/artist). Static site deployed to Firebase Hosting at `studiotarekatoui`.

## Commands

- `pnpm dev` — start Next.js dev server
- `pnpm build` — static export to `out/` directory
- `pnpm lint` — lint with Biome
- `pnpm format` — format with Biome (auto-fix)
- `pnpm check` — Biome lint + format combined (auto-fix)

## Tech Stack

- **Next.js 16** with static export (`output: 'export'` in next.config.ts)
- **React 19**, TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Biome** for linting/formatting (not ESLint/Prettier)
- **pnpm** as package manager
- **Firebase Hosting** for deployment (static files from `out/`)

## Architecture

Two pages, both server-rendered and statically exported:
- `/` (home) — Bio, Exhibitions, Contact sections composed from components
- `/portfolio` — renders works from `src/data/portfolio.ts`

All exhibition/portfolio content lives in typed data files under `src/data/`, not in a CMS or API.

### Theming

Dark/light mode uses CSS custom variables defined in `globals.css` (`:root` / `:root.dark`). A blocking inline script in `layout.tsx` reads `localStorage('theme')` to avoid flash. The `ThemeToggle` component is the only client component (`'use client'`).

### Styling Conventions

- Tailwind utility classes with CSS custom properties for colors (e.g., `var(--color-text)`)
- Responsive values use `clamp()` functions, not Tailwind breakpoints for sizing
- Mobile nav breakpoint uses `max-md:` prefix
- Path alias: `@/*` maps to `./src/*`

## Biome Configuration

- Indent: 4 spaces
- Line width: 150
- Single quotes, semicolons always, ES5 trailing commas
- `noImgElement` rule is disabled (site uses `<img>` since images are unoptimized for static export)
