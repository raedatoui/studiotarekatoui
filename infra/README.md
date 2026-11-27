# Cloud Build publishing

Builds and deploys the static website in Cloud Build instead of on a developer machine. The build is the same one `pnpm deploy:web:*` runs
locally: `scripts/deploy.mjs` runs `next build` and deploys one Firebase Hosting target.

```text
pnpm publish:web:staging
  → uploads website/src/data/generated/content.json to PUBLISH_BUCKET/snapshots/<timestamp>.json
  → runs the website-staging trigger with that snapshot
  → Cloud Build checks out main from GitHub, copies the snapshot in, writes .env from Secret Manager,
    installs dependencies, and runs node scripts/deploy.mjs staging
```

`pnpm publish:web:prod` does the same with the `website-prod` trigger. Pass a different snapshot file as an argument if needed:
`pnpm publish:web:staging ~/tmp/content.json`.

Cloud Build builds the pushed head of `main`, never the local checkout. The snapshot is whatever file you upload; run
`pnpm content:export --output website/src/data/generated/content.json` first for fresh published content.

## What setup creates

| Resource | Purpose |
| --- | --- |
| Bucket `PUBLISH_BUCKET` | Private snapshots, uniform access, public access prevention |
| Service account `website-build` | Runs both builds and deploys Hosting; no keys or tokens |
| Secret `website-build-env` | Build settings as env-file text |
| Connection `github` and its repository link | Lets Cloud Build read the GitHub repository |
| Triggers `website-staging`, `website-prod` | Manual triggers on `main` using `infra/cloudbuild/website.yaml` |

`website-build` receives Firebase Hosting Admin and Logs Writer on the project, object read on the bucket, and secret access to
`website-build-env` and the CMS email-list secret.

The CMS publishes as its App Hosting runtime identity, `firebase-app-hosting-compute`. It receives Cloud Build Editor on the project
(to start the triggers and read build history; this role can start any build in the project), Service Account User on `website-build`
only, and object create and read on the bucket.

## One-time setup

Prerequisites:

- `gcloud` signed in with an account that can administer the Firebase project, and the Cloud Build and Secret Manager APIs enabled.
- Admin access to the GitHub repository.
- Root `.env` with `FIREBASE_PROJECT_ID`, `FIREBASE_HOSTING_SITE_STAGING`, `FIREBASE_HOSTING_SITE_PROD`, `CMS_AUTH_URL`,
  `CMS_ALLOWED_EMAILS_REF`, `PUBLISH_BUCKET`, and `PUBLISH_REGION`.
- `website/.env` with `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MEDIA_BASE_URL`, and the four `NEXT_PUBLIC_FIREBASE_*` values.
- The build configuration pushed to `main`.

Then, from the workspace root:

```sh
bash infra/setup.sh
```

The script is safe to re-run and creates only what is missing. It stops at the GitHub connection and prints a link. There are two browser
steps: authorize Cloud Build on GitHub, then install the Cloud Build GitHub App on this repository. Run the script again after each one until
it prints `Ready`.

## Build settings

Cloud Build never reads local `.env` files. `website-build-env` holds:

```text
FIREBASE_HOSTING_SITE_STAGING, FIREBASE_HOSTING_SITE_PROD, CMS_AUTH_URL,
NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_MEDIA_BASE_URL,
NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID
```

Setup seeds it once from the local files and never overwrites it. To change a value, add a version; the next build uses it:

```sh
gcloud secrets versions access latest --secret website-build-env --project <project> > ~/tmp/website-build.env
# edit ~/tmp/website-build.env
gcloud secrets versions add website-build-env --data-file ~/tmp/website-build.env --project <project>
```

`FIREBASE_PROJECT_ID` is the project running the build. Staging reads the sign-in email list from the latest version of the secret named in
`CMS_ALLOWED_EMAILS_REF`; production builds do not receive it.

## Troubleshooting

- **A grant fails right after the service account is created.** New accounts take a moment to become visible. Run the script again.
- **`connections create` fails with a Secret Manager permission error.** Create the connection in the Cloud Build console (Repositories →
  2nd gen → Create host connection, named `github`, in `PUBLISH_REGION`), or grant the Cloud Build service agent
  (`service-<project-number>@gcp-sa-cloudbuild.iam.gserviceaccount.com`) `roles/secretmanager.admin`, then re-run.
- **"Cannot run builds in this region" quota error.** Change `PUBLISH_REGION` (`us-central1` is always available) and re-run setup. The
  connection is regional, so the GitHub steps repeat.
- **The build cannot fetch the source.** Grant `website-build` `roles/cloudbuild.readTokenAccessor` on the project.
- **Docker Hub pull limit on the Node image.** Change the step image in `infra/cloudbuild/website.yaml` to
  `mirror.gcr.io/library/node:24`.
- **Changing the email-list secret name or the triggers.** Setup does not update existing triggers. Delete the trigger
  (`gcloud builds triggers delete website-staging --region <region>`) and re-run, or edit it in the console.

Roll back a release from the Firebase Hosting console's release history.

## Publishing from the CMS

The CMS **Publish website** page uses the same bucket and triggers. It compares the currently published CMS content with the snapshot
staging was last built from and lists the differences field by field, with when each changed page or document was last published and
by whom. **Publish to staging** exports a new snapshot and runs
`website-staging`. **Publish to production** is available only when staging is up to date with the published content; it runs
`website-prod` with the staged snapshot at the staged commit, so production gets exactly what was reviewed. A sidebar flag shows when
published content is not on staging. Saved drafts are listed but never built.

The CMS needs `PUBLISH_PROJECT`, `PUBLISH_REGION`, and `PUBLISH_BUCKET`: in `cms/.env` locally, and rendered from the root `.env` into
`cms/apphosting.yaml` when deployed. After pulling this feature, re-run `bash infra/setup.sh` for the CMS grants, then `pnpm deploy:cms`.

Build history is the release log, so command-line publishes appear on the page too. The command-line commands still build the current
`main` with the snapshot you upload and are not pinned to staging.
