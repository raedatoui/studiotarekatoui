# Studio Tarek Atoui CMS

Payload 3 on Next.js and React, deployed through Firebase App Hosting. Content lives in Firestore Enterprise with MongoDB compatibility. Editors sign in with Google through Auth.js; media stays on the existing GCS-backed CDN.

- [Hosted CMS](https://cms--studio-tarekatoui-cms.us-east4.hosted.app/admin)
- [Firebase App Hosting dashboard](https://console.firebase.google.com/project/studio-tarekatoui-cms/apphosting)

Local and hosted instances share the same content. Publishing saves to Firestore; it does not deploy or update tarekatoui.com, which still uses its own JSON.

## Local development

Use Node.js 22 and `pnpm@10.26.2`.

```sh
pnpm install
cp .env.example .env
pnpm dev
```

On a fresh checkout, fill in `.env` before starting. Keep an existing configured `.env` rather than replacing it.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Firestore MongoDB connection string from Secret Manager secret `cms-firestore-database-url` |
| `PAYLOAD_SECRET` | Local Payload secret |
| `AUTH_SECRET` | Separate local session secret |
| `AUTH_URL` | `http://localhost:3001` |
| `AUTH_GOOGLE_ID` | Existing Google OAuth web client ID |
| `AUTH_GOOGLE_SECRET` | Existing Google OAuth client secret |
| `CMS_ALLOWED_EMAILS` | Comma-separated exact editor email addresses |

Generate distinct local secrets with `openssl rand -hex 32`. Never commit credentials. Restart the server after environment changes.

Open http://localhost:3001/admin. The local server binds to localhost and can run alongside the website on port 3000.

## Google-only login

Auth.js handles Google OAuth and encrypted HTTP-only session cookies; Firebase Auth and the Firebase client SDK are not required. Only exact, verified Google email addresses in `CMS_ALLOWED_EMAILS` can sign in. An empty allowlist denies everyone.

The first successful sign-in creates the corresponding Payload user. Approved users have editorial access to all content; user records cannot be edited through the CMS/API. To remove access, update the allowlist and restart locally or redeploy the hosted app. The allowlist is checked on each authenticated request. Sessions expire after eight hours, and Sign out clears the Auth.js session.

The [existing Google OAuth web client](https://console.cloud.google.com/auth/clients?project=992432653598) uses these origins and redirect URIs:

| Environment | Authorized JavaScript origin | Authorized redirect URI |
| --- | --- | --- |
| Local | `http://localhost:3001` | `http://localhost:3001/api/auth/callback/google` |
| Hosted | `https://cms--studio-tarekatoui-cms.us-east4.hosted.app` | `https://cms--studio-tarekatoui-cms.us-east4.hosted.app/api/auth/callback/google` |

If the OAuth consent screen is in testing mode, the intended Google accounts must also be registered as test users.

## Content

- **Research themes:** complete research pages with descriptions, cover images, collaborators, organizations, materials, nested instances, galleries, and press/reference links.
- **Research page:** section title, heading, and introduction.
- **About:** biography and portrait.
- **Contact:** heading, introductory text, and email.

Content supports drafts and up to 30 revisions. Content APIs require a signed-in editor. Text fields use plain text; media and press links use dedicated URL and caption fields. There is no separate media library or local upload storage.

## Firestore

Project `studio-tarekatoui-cms` contains database `cms-content` in `us-east1`, with deletion protection enabled. Payload uses its MongoDB adapter and Firestore compatibility preset. Its declared indexes were provisioned separately; automatic index creation and transactions are disabled by the compatibility setup.

The local and hosted CMS have been confirmed working by the user. Payload provides Firestore compatibility settings but does not officially support alternative MongoDB implementations.

The original migration snapshot, export, credentials backup, and ID mapping remain outside the repository at `~/tmp/tarek-cms-firestore-20260921-030412/`. Keep that directory private.

## Deployment

```sh
bash scripts/deploy.sh
```

This deploys the local checkout with `firebase deploy --only apphosting:cms --project=studio-tarekatoui-cms`. Temporary source archives are written under `~/tmp`. GitHub auto-deployment is not configured.

Firebase App Hosting builds the full Next.js/Payload container and manages Cloud Run in `us-east4` (Virginia). `apphosting.yaml` sets 1 CPU, 1 GiB RAM, concurrency 20, zero minimum instances, and a one-instance maximum. `firebase.json` excludes local credentials, dependencies, build output, and deployment scripts from source uploads.

The backend service account is `firebase-app-hosting-compute@studio-tarekatoui-cms.iam.gserviceaccount.com`. Secret references are pinned to version `1` in `apphosting.yaml`:

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
- `bash scripts/deploy.sh` — deploy to Firebase App Hosting.

Run verification and deployments only when requested, as described in `AGENTS.md`.
