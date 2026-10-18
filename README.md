# Studio Tarek Atoui

Local pnpm monorepo: Payload CMS in `cms/`, Next.js static website in `website/`, and the browser-safe JSON contract in `packages/content/`.

Use Node 24 (at least 24.15) and pnpm 12.14.0. From this directory, run `nvm install && nvm use` to select the version pinned in `.nvmrc`, then `corepack enable` and `pnpm install`. Shared versions live in `pnpm-workspace.yaml`; there is one lockfile and one Biome configuration. TypeScript remains on 7.0.2; GraphQL stays on 16.x to match Payload's peer requirement, and Auth.js remains on the current v5 beta.

## Local content → website

Keep configured `cms/.env` and `website/.env` files. On a fresh checkout, copy each app's `.env.example` to `.env` and configure your own CMS credentials, media destination, and public website URL. Copy the workspace `.env.example` to `.env` separately when configuring deployments. `DATABASE_URL` points to the existing Firestore MongoDB-compatible database; no local database is required. These files and exported snapshots are ignored by Git.

From this directory:

```sh
pnpm content:export --output website/src/data/generated/content.json
pnpm build:web
```

To use the CMS download instead, save **Export JSON** as `website/src/data/generated/content.json`, replacing the previous snapshot, then run `pnpm build:web` or a website deployment command. This is the monorepo input path; `../website/src/data/site-content.json` belongs to the standalone checkout.

Before the first export, open **Website → Navigation** in the CMS and publish its initial menu. Defaults include Research, News, About, Publications (`/publications`), and Contact. Edit labels, links, new-tab behavior, and drag rows to reorder. The menu is shared by desktop and mobile. Existing menus retain their saved values; change the original Galerie Chantal Crousel link to `/publications`, disable opening in a new tab, and publish before the next export.

The first command reads published CMS documents and globals, including Navigation, validates them, and writes JSON atomically. It does not publish drafts or modify editorial content. The second command consumes that exact file and writes the static website to `website/out`. Neither command deploys. The owner confirmed this export-to-build flow, including a downloaded CMS Export JSON snapshot saved at the same generated input path.

The website fails with a setup error if the snapshot is missing. Invalid snapshots fail shared validation; there is no bundled legacy fallback, database connection, or runtime editorial fetch. A new research slug becomes a public page on the next build. Metadata, canonicals, and sitemap entries come from the same snapshot; preview pages are noindex and excluded from the sitemap. Unknown research URLs use the static 404.

Public routes are `/`, `/research`, `/research/[slug]`, `/news`, `/about`, `/publications`, and `/contact`. Both `/` and `/news` render News, matching the old homepage. `/research` renders the Research hub. Staging builds use `NEXT_PUBLIC_SITE_ENV=staging` to emit noindex metadata and robots rules; all public canonicals point to the production domain.

## Development and previews

```sh
pnpm dev       # website :3000 and CMS :3001
pnpm dev:web
pnpm dev:cms
```

Export a published baseline before starting the website. In local CMS configuration, `WEBSITE_PREVIEW_URL=http://localhost:3000`; in website configuration, `NEXT_PUBLIC_CMS_ORIGIN=http://localhost:3001`. These defaults support local development. For hosted previews, deployment reads `CMS_WEBSITE_PREVIEW_URL` and `CMS_AUTH_URL` from the workspace `.env`. It generates the CMS environment configuration and sets the website's trusted `NEXT_PUBLIC_CMS_ORIGIN` for both Hosting environments. Deploy both apps to activate these settings.

Payload Live Preview opens `/preview/research`, `/preview/research-page`, `/preview/about`, `/preview/contact`, `/preview/navigation`, or `/preview/news`. Initial form state and unsaved edits arrive through Payload's [client-side preview messaging](https://payloadcms.com/docs/live-preview/client). The preview overlays only the active document on the published baseline and uses the public renderers. It also handles new research documents with no public route. Messages must match the configured CMS origin and the parent/opener window. Drafts stay in browser memory; preview links are disabled to keep the editor in the frame.

The CMS navigation's **Export JSON** action downloads the same published snapshot through an authenticated endpoint. Validation errors identify the research document and field. Exporting does not deploy.

## Content contract and recovery

`@tarek/content` owns schema version 3 and inferred website types. Version 2 added required published navigation; version 3 restores the News page. The staging-only Chronology is optional so exports from the hosted CMS before its deployment remain compatible. Publish News and Navigation, then re-export older snapshots to use the current contract. There is no hardcoded website menu fallback. CMS documents retain Payload-generated types; typed serializers use an explicit allowlist. The package includes no Payload, database, or authentication code.

- Research themes can be dragged into order in the CMS collection list while sorted by **Order**. Export converts Payload's saved order into numeric `sortOrder` positions for the website; existing numeric ordering is retained for themes without a drag order yet. Publish any reordered drafts, then export and rebuild the website to update both the timeline and reading panels. Nested instances, gallery, and press retain editor order. The timeline is derived from nested instances, not a second stored dataset.
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

## News recovery

The CMS **Pages → News** global owns four ordered lists: Exhibitions, Group exhibitions, Permanent installations, and Performances. Each has an editable heading and entries with venue/title, display and start/end dates, organizations, locations, featured works, links, statuses, and nested shows. Drag the **Section order** rows to reorder all four sections on `/` and `/news`; each section must appear exactly once. Publish News and export fresh JSON before rebuilding the website to apply the saved order. Existing content defaults to the order listed above, with empty installation and performance lists. `/news` reuses the original website layout and is included in the sitemap. Navigation and News support drafts, published exports, imports, and live previews.

The targeted recovery command reads only the old website's News content:

```sh
pnpm content:import:news ../website/src/data/site-content.json --apply
```

Without `--apply` it reports the recovered content without opening a database connection. With `--apply`, it saves private backups under `~/tmp/tarek-news-recovery-*/`, imports the six original exhibition entries as a News draft, and adds a missing `/news` link to the navigation draft. It preserves existing News content and other navigation links on reruns, and decodes the old file's literal Unicode escapes. It does not publish or deploy. Review and publish both globals, then export a new snapshot before building the website. The website never reads the legacy source file.

## Publications

**Content → Publications** stores publication titles, years, euro prices, availability, cover image URLs and credits, body copy, source links, and private editorial notes. `/publications` displays published entries from the snapshot, newest year first, with cover images alongside their descriptions. Out-of-print entries retain their status, and missing prices are omitted. Checkout is not configured.

Publish the entries and the `/publications` Navigation link in the CMS, then export a new snapshot to update local website content. Drafts, source links, and editorial notes are excluded from the public export. Older snapshots without publications remain compatible and show an empty publications page. The hosted CMS requires a separate deployment before it can edit or export this collection.

## Staging chronology

**Pages → Chronology** owns the full project timeline using the former `projects.json` fields: stable ID, research slugs, kind, title, year, dates/status, venue/location, organization, collaborators, public note, URL, media, and review flag. Private editorial notes never enter the website snapshot. The website shares the research page's vertical timeline and preserves CMS ordering within each year, newest year first, with year/kind filters and expandable documentation links.

`/chronology` and its menu entry are available in local development (`pnpm dev` / `pnpm dev:web`) and with `NEXT_PUBLIC_SITE_ENV=staging`. Production returns the static 404, excludes chronology content from the client provider, and never lists it in the sitemap. The Chronology heading supplies the temporary menu label; the shared Navigation global is unchanged.

```sh
pnpm content:import:chronology ~/tmp/chronology-source/chronology.json --apply --publish
pnpm content:export --output website/src/data/generated/content.json
```

The targeted importer validates input as part of importing, backs up the current global under `~/tmp/tarek-chronology-import-*/`, and writes only Chronology through Payload to Firestore. Omit `--publish` to save a draft; omit `--apply` for a dry run. Keep source JSON, paragraph mappings, and editorial review notes outside the repository. Media remains linked; importing does not upload or deploy anything.

Until the CMS is deployed with this schema, edit Chronology in the local CMS and export using the local command. The existing hosted CMS cannot edit or export the new global yet. Staging website deployment remains a separate `pnpm deploy:web:staging` action.

## Commands and deployment

Staging Google sign-in uses the existing Firebase web app, `GoogleAuthProvider`, and a browser-local Firebase session. Configure its public client settings in `website/.env`. The CMS retains its separate Auth.js login and cookies. Only the approved email list is shared: the staging deployment command reads the existing `CMS_ALLOWED_EMAILS_REF` secret into `STAGING_ALLOWED_EMAILS` at build time. Local staging runs use the same list copied into `website/.env`; list changes take effect on staging after rebuilding. Production and ordinary local development do not render the login gate.

Like the Leeft client gate, this checks the signed-in user's verified email before rendering the site. The allowlist is serialized into staging browser assets, and exported static files remain publicly retrievable. Staging has no CMS authentication endpoint, session bridge, server proxy, or website database client.

`pnpm build:cms` builds only the CMS. `pnpm typecheck`, `pnpm lint`, and `pnpm check` do not rewrite files; `pnpm format` does. Generated files and SCSS are excluded from Biome. Existing CMS formatting has not been bulk-rewritten with the behavior changes.

`pnpm media:upload` retains the existing CDN upload workflow; local media stays in ignored `website/public/`. No public GCS objects are deleted by this migration.

`pnpm deploy:cms` runs the app's deploy script through `pnpm run deploy`. All deployment commands use `scripts/deploy.mjs` and the ignored workspace `.env`. The script generates a temporary Firebase configuration for only the selected service; CMS deployment also renders ignored `cms/apphosting.yaml` from `cms/apphosting.template.yaml`. Secret bindings are references to existing Secret Manager versions, never credential values. Root `firebase.json` uploads the workspace context and builds only application root `cms` for the existing backend. The root `turbo.json` enables [App Hosting's Turborepo detection](https://firebase.blog/posts/2026/01/apphosting-turborepo), so dependency installation uses the workspace lockfile and the cloud build targets only `@tarek/cms`. Build caching is disabled; local pnpm commands remain unchanged. Nested environment files, local media, generated content, credentials, caches, and build output are excluded. Website Hosting targets serve `website/out` from the same root configuration. The owner confirmed successful CMS and staging website deployments.

The Firebase CLI is pinned in the workspace; deployment scripts use that version. Authenticate with `pnpm exec firebase login`, then deploy the website from the workspace root:

```sh
pnpm deploy:web:staging
pnpm deploy:web:prod
```

Each command builds the local checkout using the existing `website/src/data/generated/content.json`, then deploys only its configured Hosting site in `FIREBASE_PROJECT_ID`. Site IDs come from `FIREBASE_HOSTING_SITE_PROD` and `FIREBASE_HOSTING_SITE_STAGING`; the CMS backend comes from `FIREBASE_APPHOSTING_BACKEND_ID`. Staging sets `NEXT_PUBLIC_SITE_ENV=staging` for noindex output; production explicitly sets it to `production`. A failed build stops deployment. Run `content:export` first when you want fresh published CMS content; deploy commands do not re-export it.

Cloud Build, GitHub setup, and Payload staging/production controls remain deferred to Phases 2 and 4. These commands deploy local code, including uncommitted changes. There are no GitHub Actions workflows.

## Sharing source

The repository contains application code and configuration templates. Real environment files, generated CMS snapshots, media, browser captures, private migration notes, and generated deployment configuration stay outside Git. The site needs a published CMS snapshot before it can run; no studio content or credentials are bundled for a fresh checkout.

`NEXT_PUBLIC_*` values are included in browser assets. Use them for public URLs and Firebase client configuration only. The staging gate also serializes its shared email allowlist for the browser check described above. Database credentials, OAuth secrets, session secrets, and cloud credentials must stay server-side. Firebase resource identifiers are configuration, not an access-control mechanism.

The private development history includes former infrastructure identifiers and local artifacts. Publish a fresh source snapshot without the existing `.git` directory or archive branches. Removing files from the current tree does not remove old commits. Preserve the private repository and its author history separately.
