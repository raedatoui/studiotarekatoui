# Studio Tarek Atoui

Local pnpm monorepo: Payload CMS in `cms/`, Next.js static website in `website/`, and the browser-safe JSON contract in `packages/content/`.

Use Node 22 (at least 22.13) and pnpm 11.27.1. Install from this directory with `pnpm install`. Shared versions live in `pnpm-workspace.yaml`; there is one lockfile and one Biome configuration. TypeScript 7 integration is implemented but has not yet been build-verified.

## Local content → website

Keep configured `cms/.env` and `website/.env` files. On a fresh checkout, copy each app's `.env.example` to `.env` and fill in the CMS credentials. `DATABASE_URL` points to the existing Firestore MongoDB-compatible database; no local database is required. These files and exported snapshots are ignored by Git.

From this directory:

```sh
pnpm content:export --output website/src/data/generated/content.json
pnpm build:web
```

Before the first export, open **Website → Navigation** in the CMS and publish its initial menu. Defaults include Research, About, Editions (the original Galerie Chantal Crousel link), and Contact. Edit labels, links, new-tab behavior, and drag rows to reorder. The menu is shared by desktop and mobile.

The first command reads published CMS documents and globals, including Navigation, validates them, and writes JSON atomically. It does not publish drafts or modify editorial content. The second command consumes that exact file and writes the static website to `website/out`. Neither command deploys. They have not been run as part of the implementation.

The website fails with a setup error if the snapshot is missing. Invalid snapshots fail shared validation; there is no bundled legacy fallback, database connection, or runtime editorial fetch. A new research slug becomes a public page on the next build. Metadata, canonicals, and sitemap entries come from the same snapshot; preview pages are noindex and excluded from the sitemap. Unknown research URLs use the static 404.

Public routes are `/`, `/research`, `/research/[slug]`, `/about`, and `/contact`. Both `/` and `/research` render the Research hub. Staging builds use `NEXT_PUBLIC_SITE_ENV=staging` to emit noindex metadata and robots rules; all public canonicals point to the production domain.

## Development and previews

```sh
pnpm dev       # website :3000 and CMS :3001
pnpm dev:web
pnpm dev:cms
```

Export a published baseline before starting the website. In local CMS configuration, `WEBSITE_PREVIEW_URL=http://localhost:3000`; in website configuration, `NEXT_PUBLIC_CMS_ORIGIN=http://localhost:3001`. These defaults support local development. Configure the actual trusted origins before any hosted preview rollout; hosted preview deployment is deferred.

Payload Live Preview opens `/preview/research`, `/preview/research-page`, `/preview/about`, `/preview/contact`, or `/preview/navigation`. Initial form state and unsaved edits arrive through Payload's [client-side preview messaging](https://payloadcms.com/docs/live-preview/client). The preview overlays only the active document on the published baseline and uses the public renderers. It also handles new research documents with no public route. Messages must match the configured CMS origin and the parent/opener window. Drafts stay in browser memory; preview links are disabled to keep the editor in the frame.

The CMS navigation's **Export JSON** action downloads the same published snapshot through an authenticated endpoint. Validation errors identify the research document and field. Exporting does not deploy.

## Content contract and recovery

`@tarek/content` owns schema version 2 and inferred website types. Version 2 adds required published navigation; re-export older snapshots after publishing Navigation. There is no hardcoded website menu fallback. CMS documents retain Payload-generated types; typed serializers use an explicit allowlist. The package includes no Payload, database, or authentication code.

- Research order is `sortOrder`, then slug as a stable tie-breaker. Nested instances, gallery, and press retain editor order. The timeline is derived from nested instances, not a second stored dataset.
- Empty optional strings become omitted values; optional arrays become empty arrays. Research dates fall back to start/end years or “ongoing”. Instance display dates fall back to the ISO date portion of `dateStart`, then the year.
- Instance IDs use the saved row ID, then slug, then a document/position fallback for older rows without either identifier. Saving those rows in Payload gives them persistent IDs.
- Publication validates required fields, unique research IDs/slugs and instance IDs/slugs, years, safe URL schemes, and media types. Embed media accepts supported YouTube/Vimeo URLs only.
- Export excludes drafts, users, preferences, locks, versions, and database metadata. Each required global must have a published version.

```sh
pnpm content:validate path/to/content.json
pnpm content:import path/to/content.json         # dry run
pnpm content:import path/to/content.json --apply # writes drafts
```

Import validates the whole input before any writes, matches existing research by ID or unique slug, reports conflicting matches, and retains absent documents. New research gets Payload-generated IDs and matches by slug on subsequent runs. Explicit `--apply` saves private current-record/latest-draft backups and progress under `~/tmp/tarek-content-import-*/`, then writes through Payload. Review and publish imported drafts in the CMS before exporting them.

Firestore compatibility disables transactions: partial import progress is retained, reported, and can be rerun after resolving the error. Imports do not restore users, revision history, indexes, or credentials. The private pre-import backup is recovery data, not a public snapshot or an automatic database restore. Historical migration backups remain untouched and require an explicit converter if reused.

## Commands and deployment

`pnpm build:cms` builds only the CMS. `pnpm typecheck`, `pnpm lint`, and `pnpm check` do not rewrite files; `pnpm format` does. Generated files and SCSS are excluded from Biome. Existing CMS formatting has not been bulk-rewritten with the behavior changes.

`pnpm media:upload` retains the existing CDN upload workflow; local media stays in ignored `website/public/`. No public GCS objects are deleted by this migration.

`pnpm deploy:cms` runs the app's deploy script through `pnpm run deploy`. Root `firebase.json` uploads the workspace context and builds only application root `cms` for the existing backend. Nested environment files, local media, generated content, credentials, caches, and build output are excluded. Website Hosting targets serve `website/out` from the same root configuration. No deployment was performed.

Cloud Build, GitHub setup, website publishing wrappers, and Payload staging/production controls remain deferred to Phases 2 and 4. There are no GitHub Actions workflows.

## Repository history

This repository was created in `/Users/raed/play/tarek/studiotarekatoui`, leaving the original sibling `cms/` and `website/` repositories intact. The active branch is `dev`. Integration commits place the original trees under their app directories and retain the original commits as parents, without rewriting their hashes or authors.

`main` retains the original website production baseline plus the CMS; `dev` includes the website development baseline and Phase 3 implementation. Original branch tips remain under `archive/website/main`, `archive/website/dev`, and `archive/cms/main`.

Git bundles and private working-tree backups were saved to `~/tmp/tarek-monorepo-20260921-125556/` before consolidation. No remote was configured.
