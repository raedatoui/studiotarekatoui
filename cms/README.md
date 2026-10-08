# Studio Tarek Atoui CMS

Payload 3 on Next.js and React, deployed through Firebase App Hosting. Content lives in Firestore Enterprise with MongoDB compatibility. Editors sign in with Google through Auth.js; media stays on the existing GCS-backed CDN.

- [Hosted CMS](https://cms.tarekatoui.com/admin)
- [Firebase App Hosting dashboard](https://console.firebase.google.com/project/studio-tarekatoui-cms/apphosting)

The CMS custom-domain certificate is still provisioning as of September 21, 2026. Wait for App Hosting to report the domain as connected before using the custom-domain login.

Local and hosted instances share the same content. Publishing saves to Firestore; it does not deploy or update tarekatoui.com, which now consumes an explicitly exported and validated snapshot. See the [workspace README](../README.md) for export, import, and live previews.

## Local development

Use Node.js 22 (at least 22.13) and pnpm 11.27.1. Install dependencies at the workspace root; keep its single lockfile.

```sh
cd ..
pnpm install
# On a fresh checkout only: copy cms/.env.example to cms/.env and configure it.
pnpm dev:cms
```

On a fresh checkout, fill in `.env` before starting. Keep an existing configured `.env` rather than replacing it.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Firestore MongoDB connection string from Secret Manager secret `cms-firestore-database-url` |
| `PAYLOAD_SECRET` | Local Payload secret |
| `AUTH_SECRET` | Separate local session secret |
| `AUTH_URL` | `http://localhost:3001` |
| `AUTH_GOOGLE_ID` | CMS project's Google OAuth web client ID (`cms-google-client-id`, version `2`) |
| `AUTH_GOOGLE_SECRET` | CMS project's Google OAuth client secret (`cms-google-client-secret`, version `2`) |
| `CMS_ALLOWED_EMAILS` | Comma-separated exact editor email addresses |

Generate distinct local secrets with `openssl rand -hex 32`. Never commit credentials. Restart the server after environment changes.

Open http://localhost:3001/admin. The local server binds to localhost and can run alongside the website on port 3000.

## Google-only login

Auth.js handles Google OAuth and encrypted HTTP-only session cookies; Firebase Auth and the Firebase client SDK are not required. Only exact, verified Google email addresses in `CMS_ALLOWED_EMAILS` can sign in. An empty allowlist denies everyone.

The first successful sign-in creates the corresponding Payload user. Approved users have editorial access to all content; user records cannot be edited through the CMS/API. To remove access, update the allowlist and restart locally or redeploy the hosted app. The allowlist is checked on each authenticated request. Sessions expire after eight hours, and Sign out clears the Auth.js session.

Google OAuth is configured with a dedicated web client in [Google Auth Platform for `studio-tarekatoui-cms`](https://console.cloud.google.com/auth/clients?project=studio-tarekatoui-cms). Its credentials are installed in local `.env` and Secret Manager version `2`; `apphosting.yaml` references those versions and sets `AUTH_URL=https://cms.tarekatoui.com`. This configuration was deployed successfully on September 21, 2026 in revision `cms-build-2026-09-21-003`. The user confirmed local sign-in with the new credentials; hosted sign-in has not been tested. The personal project's previous client and secret versions remain available for rollback. Firebase Authentication email templates are not used by this CMS.

The CMS only needs the standard `openid`, `email`, and `profile` scopes. The new **Web application** OAuth client includes these origins and redirect URIs:

| Environment | Authorized JavaScript origin | Authorized redirect URI |
| --- | --- | --- |
| Local | `http://localhost:3001` | `http://localhost:3001/api/auth/callback/google` |
| Production | `https://cms.tarekatoui.com` | `https://cms.tarekatoui.com/api/auth/callback/google` |
| Hosted | `https://cms--studio-tarekatoui-cms.us-east4.hosted.app` | `https://cms--studio-tarekatoui-cms.us-east4.hosted.app/api/auth/callback/google` |

If the OAuth consent screen is in testing mode, add the intended Google accounts as test users, starting with `raed.atoui@gmail.com`. The independent `CMS_ALLOWED_EMAILS` restriction still applies.

For future rotations, keep the downloaded client JSON outside this repository. Store its client ID and secret as new versions of `cms-google-client-id` and `cms-google-client-secret` in Secret Manager, then update their pinned versions in `apphosting.yaml`. Update local `.env` credentials while retaining `AUTH_URL=http://localhost:3001`. Deploy the CMS to activate hosted changes. Never commit the downloaded JSON or credential values. The private backup of the settings before this rotation is `~/tmp/tarek-cms-oauth-20260921-151514/`.

## Content

- **Research themes:** complete research pages with descriptions, cover images, collaborators, organizations, materials, nested instances, galleries, and press/reference links.
- **Research page:** section title, heading, and introduction.
- **About:** biography and portrait.
- **Contact:** heading, introductory text, and email.
- **News:** original exhibition and group-exhibition lists, display dates, links, and nested shows. The targeted `content:import:news` command recovers content from the old website into drafts; see the workspace README.
- **Navigation** (under Website): ordered menu labels, URLs, and new-tab settings for desktop and mobile. Initial defaults include Research, About, Editions linking to Galerie Chantal Crousel, and Contact. Publish this global before exporting schema-v3 content.

Content supports drafts and up to 30 revisions. Content APIs require a signed-in editor. Text fields use plain text; media and press links use dedicated URL and caption fields. There is no separate media library or local upload storage.

Drag the handles in the **Research themes** collection list to change the website order. The list must be sorted by **Order**. When ordering existing themes for the first time, Payload initializes their order and asks you to refresh and drag again. Reordered drafts must be published before export. Export fresh JSON and rebuild the website to apply the saved order; dragging does not deploy the site.

### Research image uploads

Research cover images and image gallery items include an **Upload image** picker. It accepts JPEG, PNG, WebP, and GIF files up to 20 MB, sends multipart form data to the authenticated CMS endpoint, and uploads the image and metadata to `gs://typedef/tarekatoui.com/`. Each file has a unique name to avoid overwriting existing media. The returned `https://cdn.typedefinc.com/tarekatoui.com/…` URL fills the existing URL field; save the research entry to persist it. Uploads happen immediately and remain in storage if the editor discards the entry.

Storage uses Google Application Default Credentials. For local development, run `gcloud auth application-default login` with an account permitted to create objects in the destination. Hosted uploads use `firebase-app-hosting-compute@studio-tarekatoui-cms.iam.gserviceaccount.com`; this identity needs `storage.objects.create` on the `typedef` bucket, scoped to `tarekatoui.com/` where possible (for example, a conditional Storage Object Creator role). The existing CDN must be able to read the uploaded objects. No browser credentials or bucket CORS changes are needed because the CMS uploads server-side.

## Firestore

Project `studio-tarekatoui-cms` contains database `cms-content` in `us-east1`, with deletion protection enabled. Payload uses its MongoDB adapter and Firestore compatibility preset. Its declared indexes were provisioned separately; automatic index creation and transactions are disabled by the compatibility setup.

The local and hosted CMS have been confirmed working by the user. Payload provides Firestore compatibility settings but does not officially support alternative MongoDB implementations.

The original migration snapshot, export, credentials backup, and ID mapping remain outside the repository at `~/tmp/tarek-cms-firestore-20260921-030412/`. Keep that directory private.

## Deployment

```sh
pnpm deploy:cms # from the workspace root
```

This deploys the local checkout with `firebase deploy --only apphosting:cms --project=studio-tarekatoui-cms`. Temporary source archives are written under `~/tmp`. GitHub auto-deployment is not configured.

Firebase App Hosting builds the full Next.js/Payload container and manages Cloud Run in `us-east4` (Virginia). `apphosting.yaml` sets 1 CPU, 1 GiB RAM, concurrency 20, zero minimum instances, and a one-instance maximum. The root `firebase.json` includes workspace manifests and the shared package, sets the application root to `cms`, and excludes nested credentials, dependencies, caches, local media, snapshots, and build output from source uploads. Root `turbo.json` enables App Hosting's monorepo detection: dependencies use the root lockfile, and the build filters to `@tarek/cms`. Without it, App Hosting looks for a separate lockfile inside `cms/`. The owner confirmed a successful monorepo rollout and hosted Live Preview using staging.tarekatoui.com.

The backend service account is `firebase-app-hosting-compute@studio-tarekatoui-cms.iam.gserviceaccount.com`. Secret references are pinned in `apphosting.yaml`; Google client credentials use version `2`, and the remaining secrets use version `1`:

| Environment variable | Secret |
| --- | --- |
| `DATABASE_URL` | `cms-firestore-database-url` |
| `PAYLOAD_SECRET` | `cms-payload-secret` |
| `AUTH_SECRET` | `cms-auth-secret` |
| `AUTH_GOOGLE_ID` | `cms-google-client-id` |
| `AUTH_GOOGLE_SECRET` | `cms-google-client-secret` |
| `CMS_ALLOWED_EMAILS` | `cms-allowed-emails` |

Only the Payload secret is also available during the build to initialize its configuration. Database and Google authentication credentials are runtime-only. `AUTH_URL` points to the hosted origin, and `AUTH_TRUST_HOST=true` supports the hosting proxy. Update pinned secret versions and redeploy when rotating credentials.

## Commands

- `pnpm dev` — local CMS on port 3001.
- `pnpm generate:types` — regenerate Payload types after schema changes.
- `pnpm generate:importmap` — regenerate the admin map after component registration changes.
- `pnpm build` / `pnpm start` — production build and local production server.
- `pnpm lint` — ESLint.
- `pnpm deploy:cms # from the workspace root` — deploy to Firebase App Hosting.

Run verification and deployments only when requested, as described in `AGENTS.md`.
