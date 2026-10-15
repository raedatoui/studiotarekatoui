# Studio Tarek Atoui CMS

Payload 3 on Next.js and React, deployed through Firebase App Hosting. Content lives in Firestore Enterprise with MongoDB compatibility. Editors sign in with Google through Auth.js. The website consumes an explicit published-content export; publishing in the CMS does not deploy the website.

## Local development

Use Node.js 22 (at least 22.13) and pnpm 11.27.1. Install dependencies from the workspace root. Copy `cms/.env.example` to `cms/.env` on a fresh checkout and configure your own resources. Preserve existing configured environment files.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Firestore MongoDB connection string |
| `PAYLOAD_SECRET` | Payload encryption secret |
| `AUTH_SECRET` | Separate session encryption secret |
| `AUTH_URL` | Exact CMS origin; locally `http://localhost:3001` |
| `AUTH_GOOGLE_ID` | Google OAuth web client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `CMS_ALLOWED_EMAILS` | Comma-separated exact editor email addresses |
| `WEBSITE_PREVIEW_URL` | Website receiving Live Preview; locally `http://localhost:3000` |
| `MEDIA_BUCKET` | Upload bucket, with an optional `gs://` prefix |
| `MEDIA_PREFIX` | Object prefix inside the bucket |
| `MEDIA_BASE_URL` | Public URL for that same object prefix |

Generate distinct secrets with `openssl rand -hex 32`. Never commit credentials or editor email addresses. Run `pnpm dev:cms` from the workspace root and open http://localhost:3001/admin.

## Authentication

Auth.js handles Google OAuth and encrypted HTTP-only session cookies. Only exact, verified Google email addresses in `CMS_ALLOWED_EMAILS` can sign in; an empty allowlist denies everyone. Approved users have editorial access, while user records cannot be edited through the CMS/API. The allowlist is checked on each authenticated request. Sessions expire after eight hours.

Configure a Google OAuth web client with the CMS origin and `${AUTH_URL}/api/auth/callback/google` as its redirect URI. Use only the standard `openid`, `email`, and `profile` scopes. If the OAuth consent screen is in testing mode, add intended editors as test users. The application allowlist still applies.

Keep OAuth client downloads outside the repository. Rotate hosted credentials through Secret Manager, update their version references in the private workspace `.env`, and deploy the CMS to activate them. Local credential values belong only in `cms/.env`.

## Content and media

Research themes, Research page, About, Contact, News, Navigation, and the staging-only Chronology are edited in the CMS. Documents support drafts and revision history. Content APIs and Export JSON require a signed-in editor. Export includes published content only; see the [workspace README](../README.md) for export, import, ordering, and preview behavior.

Image uploads accept JPEG, PNG, WebP, and GIF files up to 20 MB. The authenticated endpoint writes unique object names under `MEDIA_BUCKET` / `MEDIA_PREFIX` and returns a URL under `MEDIA_BASE_URL`. Uploads happen immediately; save the entry to persist the returned URL. Discarding an entry does not delete its uploaded object.

Storage uses Google Application Default Credentials. Locally, use `gcloud auth application-default login` with a permitted account. The hosted backend service account needs `storage.objects.create` on the destination, preferably scoped to the prefix. The CDN must be able to read the objects. No cloud credentials are sent to the browser.

Payload uses its MongoDB adapter and Firestore compatibility preset. Automatic index creation and transactions are disabled; provision the required indexes separately. Keep database backups, exports, migration mappings, and credentials outside Git.

## Deployment

Copy the workspace `.env.example` to `.env` and fill in your Firebase resource IDs, hosted URLs, media settings, and Secret Manager references. The hosted settings are separate from the local development credentials in `cms/.env`.

Run `pnpm deploy:cms` from the workspace root. `scripts/deploy.mjs` renders `cms/apphosting.template.yaml` into the ignored `cms/apphosting.yaml`, then deploys only `FIREBASE_APPHOSTING_BACKEND_ID` in `FIREBASE_PROJECT_ID`. Do not pass the template directly to Firebase: the deployment script resolves its placeholders. Temporary source archives use `~/tmp`.

The root Firebase configuration excludes credentials, snapshots, local media, caches, browser artifacts, and private operational records. App Hosting builds the full workspace with the root lockfile and targets `@tarek/cms` through Turborepo. Its runtime limits remain in the template.

Database, Google authentication, session credentials, editor allowlists, and upload settings are runtime-only. The Payload secret is also available at build time to initialize its configuration. `AUTH_TRUST_HOST=true` supports the hosting proxy. Keep sensitive values in Secret Manager; template substitutions accept references, not secret values.

Run verification and deployments only when requested, as described in `AGENTS.md`.
