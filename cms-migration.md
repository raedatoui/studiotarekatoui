**Studio Tarek Atoui — CMS, Hosting, monorepo, and publishing migration plan**

Prepared September 21, 2026. This document defines the proposed implementation. Writing this plan does not execute migrations, change DNS, create GitHub repositories, deploy applications, or authorize deletion of cloud resources.

**Phase 1 execution — September 21, 2026**

The replacement Hosting sites are created and their live releases have been cloned successfully. Domain transfer is deliberately pending: Raed will perform the Firebase custom-domain/DNS cutover. No local build or browser verification was run.

| Destination | Source version copied | URL |
| --- | --- | --- |
| `studio-tarekatoui-web` | `studiotarekatoui@3f222b9fa2ad239f` | https://studio-tarekatoui-web.web.app |
| `studio-tarekatoui-staging` | `tarekatoui-dev@6c9a0fe0abeb73b0` | https://studio-tarekatoui-staging.web.app |

The source production configuration has `cleanUrls: true` and no staging noindex header. The source staging configuration has `X-Robots-Tag: noindex`, clean URLs, and trailing-slash removal. Firebase cloned the deployed content and Hosting configuration without rebuilding from the local development branch.

`website/.firebaserc` now defaults to `studio-tarekatoui-cms` and maps `prod` and `staging` to the new sites. The old project’s target mappings remain available for recovery. Both `deploy:prod` and `deploy:staging` scripts explicitly pass `--project=studio-tarekatoui-cms`. These edits are in the current working tree; they have not been committed or propagated to other branch versions of these files. Carry the configuration changes to `main` before making a future production code deployment.

Rollback records and pre-change configuration are saved in `/Users/raed/tmp/tarek-hosting-migration-20260921-142235/`. The old sites and their releases remain intact. The domain inventory found `tarekatoui.com` on `studiotarekatoui`, with active HTTPS and expected IPv4 address `199.36.158.100`; staging has no custom domains. This address records the existing state and is not an instruction to change DNS.

**Owner’s cutover:** open Firebase Hosting for project `studio-tarekatoui-cms`, select `studio-tarekatoui-web`, and follow Add custom domain / the transfer workflow for `tarekatoui.com`. Follow Firebase’s exact removal, ownership, and DNS instructions, including removing the old association when prompted. DNS changes alone do not move the Firebase site association. Leave the old site resource and release history available for rollback. Do not attach the production domain to the staging site or to the default `studio-tarekatoui-cms` Hosting site.

Phase 1 remains pending the custom-domain transfer and the owner’s review of the destination sites. The old project’s unrelated sites, media CDN, OAuth client, CMS App Hosting, and database were not changed.

**Phase 3 implementation — September 21, 2026**

Navigation correction: the fixed menu had omitted Editions. Navigation is now a CMS global with the original Editions link in its defaults, draft/publish support, export/import integration, and live preview. This bumps the JSON contract to schema version 2. Publish the new Navigation global and re-export before using the website; no content was written or published by this correction.

Implementation is in `/Users/raed/play/tarek/studiotarekatoui`, on its `dev` branch. The original sibling `cms/` and `website/` directories are unchanged. Git history integration commits preserve both applications' original commits and authors, retain `main`/`dev`, and keep original branch tips under `archive/website/*` and `archive/cms/*`. Git bundles and private working-tree backups are under `~/tmp/tarek-monorepo-20260921-125556/`. No remote is configured.

The local workspace, root lockfile/catalog/toolchain, shared Zod contract, CMS published-content export/import commands, authenticated Export JSON action, website CMS data integration/cleanup, metadata/sitemap, and client-side live previews are implemented. Dependencies were installed with pnpm 11.27.1. Root Firebase configuration carries the existing targets and includes the workspace for CMS source uploads. Cloud publishing infrastructure and workflows were not added.

Phase 3 is complete based on the owner's confirmation: local JSON export and the CMS Export JSON download work, the website builds from that snapshot saved at `website/src/data/generated/content.json`, staging website deployment and the CMS App Hosting rollout succeeded, and hosted Live Preview works. The general JSON importer is implemented but has not been exercised end to end; the targeted News recovery below was applied. No additional verification was run when recording this status. Phase 2's cloud website build pipeline and Phase 4's editor-facing publishing controls remain pending.

**News recovery — September 21, 2026**

News was restored at the owner's request. The CMS News global and `/news` route now retain the original exhibition/group-exhibition structure, including nested shows, with export/import and live-preview support. The snapshot contract is version 3. Six entries (three exhibitions and three group exhibitions, including two nested IMMA shows) were recovered from the original `website/src/data/site-content.json` and saved to the CMS as a draft. The missing `/news` navigation link was added to the existing navigation draft. Other content and links were preserved. The pre-change backup is `~/tmp/tarek-news-recovery-2026-09-21T18-28-19-496Z/`.

Review and publish News and Navigation, then export a schema-v3 snapshot before building. Payload types were regenerated. No build, test, lint, browser check, publication, or deployment was performed for this change.

**Agreed outcome**

**Revised execution order — September 21, 2026:** proceed with Phase 3 before Phase 2. The immediate milestone is a local monorepo with cleaned-up website data, a published-content JSON export from the CMS, and a local static website build using that exact exported file. No GitHub Actions workflow is wanted. GitHub repository setup, Cloud Build, snapshot storage, and cloud website deployment are deferred until this local path works. Keep the phase numbers below as references to the original plan; their numeric order no longer defines execution order. Phase 1's pending domain cutover remains a separate owner action and does not block local work.

Keep the public website as a Next.js static export on Firebase Hosting. Editors use Payload to build staging and then publish the approved content to production. Google Cloud Build checks out the website source from GitHub, downloads a fixed JSON export, validates it, builds Next.js, and deploys the generated files. Public pages do not fetch editorial JSON at runtime.

The CMS remains on Firebase App Hosting with Firestore Enterprise using MongoDB compatibility. The website and CMS become a pnpm monorepo with a shared Zod content contract, TypeScript 7, pnpm 11, and Biome. Research rendering follows the CMS hierarchy. Live previews remain browser-driven and do not require builds.

```text
Google-authenticated editor in Payload
    → export published CMS content
    → validate and store immutable JSON in private GCS
    → run GitHub-connected staging build
    → download that JSON and validate it again
    → Next.js static export
    → deploy staging Firebase Hosting site
    → editor reviews staging and clicks Publish production
    → build the same Git commit and JSON snapshot for production
    → deploy production Firebase Hosting site
```

**Current state and constraints**

| Resource | Current state |
| --- | --- |
| Destination Firebase project | `studio-tarekatoui-cms`, project number `408237054470` |
| CMS | App Hosting backend `cms`, region `us-east4` |
| CMS URL | `https://cms--studio-tarekatoui-cms.us-east4.hosted.app` |
| Content database | Firestore database `cms-content`, region `us-east1`, MongoDB compatibility |
| Website Hosting project | `api-project-992432653598` |
| Production Hosting site | `studiotarekatoui` |
| Staging Hosting site | `tarekatoui-dev` |
| Production domain | `tarekatoui.com`; additional domain mappings must be inventoried before cutover |
| Existing media | `gs://typedef/tarekatoui.com`, served through `https://cdn.typedefinc.com/tarekatoui.com` |
| Website Git | Independent repository; current checkout is `dev`, with `main` also present |
| CMS Git | Independent repository; latest observed commit `9253b65` |
| GitHub remotes | Neither local repository currently has a remote configured |
| Destination Hosting inventory | Only the default `studio-tarekatoui-cms` Hosting site currently exists |
| JSON import tooling | Only `cms/scripts/deploy.sh` remains; the previous conversion scripts were removed |
| External migration backup | `~/tmp/tarek-cms-firestore-20260921-030412/` |

The old Firebase project hosts unrelated websites and contains the existing Google OAuth client. Do not delete that project. Moving the two Hosting sites does not move the OAuth client, CDN bucket, database, or CMS App Hosting backend.

Consolidating the CMS, website Hosting, build identities, snapshots, and build history in one project simplifies administration and removes several cross-project permission requirements. It is not required technically. Staging and production will share a project deliberately; they are separate Hosting deployments, not isolated cloud security environments. Staging receives published content only. Firebase generally recommends separate projects for stronger environment isolation, but the agreed design here favors one project for this small editorial workflow. [Firebase multisite guidance](https://firebase.google.com/docs/hosting/multisites)

**Phase 1 — Recreate production and staging Hosting in the CMS project**

The migration is a recreation and domain cutover, not an in-place reassignment of existing site resources. Hosting site IDs are globally unique. Deleting an existing site does not free its ID for reuse; Firebase documents that a deleted ID cannot be reactivated. Do not delete the old sites in an attempt to reuse their names. [Hosting site IDs and deletion](https://firebase.google.com/docs/hosting/multisites)

Proposed destination IDs, subject to availability when created:

| Logical target | Existing site | New site | Resulting default URL |
| --- | --- | --- | --- |
| `prod` | `studiotarekatoui` | `studio-tarekatoui-web` | `https://studio-tarekatoui-web.web.app` |
| `staging` | `tarekatoui-dev` | `studio-tarekatoui-staging` | `https://studio-tarekatoui-staging.web.app` |

The public custom domain remains `tarekatoui.com`. The old `web.app` and `firebaseapp.com` URLs cannot follow the sites into a new project. The default Hosting site named `studio-tarekatoui-cms` can remain unused; it is distinct from the CMS App Hosting URL.

1. Inventory the two current sites, live release/version IDs, custom domains, redirect behavior, headers, and DNS ownership records. Record the current production and staging source revisions if known. Do not assume the local `dev` checkout represents the live production website.
2. Save the current Hosting configuration and release identifiers. Preserve a rollback deployment in the old project. Private working files and backups belong under `~/tmp`.
3. Create the two new sites in `studio-tarekatoui-cms` and configure logical targets `prod` and `staging`.
4. Clone the current live production release to the new production site, and the current staging release to the new staging site. This avoids mixing a content/code change into the infrastructure migration. Firebase supports cloning across sites and projects, including the deployed Hosting configuration. [Hosting version cloning](https://firebase.google.com/docs/hosting/manage-hosting-resources)
5. Preserve staging's `X-Robots-Tag: noindex` behavior. Confirm production has not inherited staging's indexing restrictions before transferring the domain.
6. Transfer the custom domain to the new production site through Firebase's domain connection workflow. Follow the exact ownership and DNS records supplied by Firebase; do not invent A records or assume changing an IP address transfers the domain's site association. Firebase documents Quick Setup for transfer from another Hosting site. Allow for ownership/certificate propagation; do not promise zero downtime. [Custom domain migration](https://firebase.google.com/docs/hosting/custom-domain)
7. Update the website's Firebase target mapping to the new project. Keep media URLs and the Google OAuth client unchanged.
8. Keep the old sites and deployment history during the agreed rollback window. Optionally add redirects from their default URLs after cutover, if desired. Retiring those resources is a later explicit action.

Illustrative commands for implementation, not commands executed by this plan:

```sh
firebase hosting:sites:create studio-tarekatoui-web --project=studio-tarekatoui-cms
firebase hosting:sites:create studio-tarekatoui-staging --project=studio-tarekatoui-cms

firebase hosting:clone studiotarekatoui:live studio-tarekatoui-web:live
firebase hosting:clone tarekatoui-dev:live studio-tarekatoui-staging:live

firebase target:apply hosting prod studio-tarekatoui-web --project=studio-tarekatoui-cms
firebase target:apply hosting staging studio-tarekatoui-staging --project=studio-tarekatoui-cms
```

Clone operations deploy to their destination. Capture source version IDs first and use a fixed version if concurrent deployments could change the live source during migration. Keep the domain on the old production site until the new destination is ready for cutover.

Phase 1 completion criteria: both replacement sites serve their intended releases; the production domain is connected with HTTPS; staging is not indexable; new deploy commands target the new project; unrelated old-project resources remain intact. Domain rollback uses the saved association/DNS settings and may also take time to propagate.

**Phase 2 — Deferred: establish GitHub-connected Cloud Build and Firebase deployment after the local milestone**

This phase establishes the build infrastructure and command-level publishing flow before adding the Payload buttons, after Phase 3 has established the monorepo, shared schema, Payload exporter, and local website build. Reuse that working export/build path in the cloud. Do not create a temporary legacy-JSON proof build or a GitHub Actions workflow. GitHub serves as the source repository for Cloud Build when this deferred phase is implemented.

**GitHub source and connection.** Choose the GitHub owner and create one private repository, provisionally `<owner>/tarek`. Because neither app currently has a remote, this is an explicit dependency for this cloud phase only. Push the already-consolidated monorepo with `website/`, `cms/`, and `packages/content/`, preserving both apps' histories and the website branches. Do not create an interim website repository or discard either app's history.

Connect the repository using Cloud Build's regional GitHub connection and GitHub App authorization. Use `us-east1` for the connection, manual triggers, build artifacts, and publishing bucket. The owner must have sufficient GitHub permissions to authorize the connection. Cloud Build fetches the source; the CMS does not need a GitHub personal access token or SSH key. [GitHub connection setup](https://docs.cloud.google.com/build/docs/automating-builds/github/connect-repo-github?generation=2nd-gen)

Use trusted code only. Initial staging can target the current development branch, but final editorial releases should use an approved publishing branch. Once the monorepo changes are ready, default that branch to `main`. A staging build resolves its source revision once, records the actual commit SHA from Cloud Build, and makes that SHA part of the release record. Production uses the recorded SHA, never a newly resolved branch head.

Create two manually invoked triggers:

| Trigger | Destination | Behavior |
| --- | --- | --- |
| `website-staging` | `hosting:staging` | Build a selected content snapshot and trusted code revision |
| `website-prod` | `hosting:prod` | Build an explicitly approved staging candidate's exact snapshot and Git SHA |

Do not enable automatic production deployment on every push. A CMS-only commit must not deploy the website, and a website content publish must not redeploy Payload. GitHub changes and editorial publishing are separate events.

**Private JSON source.** Create a dedicated private GCS bucket, provisionally `studio-tarekatoui-cms-publishing`, in `us-east1`. This bucket is separate from the public media bucket. Use uniform access control and public access prevention. It contains published editorial snapshots and release metadata, not database credentials, users, or drafts.

```text
gs://studio-tarekatoui-cms-publishing/
├── snapshots/<release-id>/content.json
├── manifests/<release-id>/candidate.json
└── artifacts/<release-id>/<environment>/<build-id>/...
```

Write snapshots with create-only generation preconditions. Never overwrite a snapshot already associated with a release. Record its object generation, SHA-256 digest, schema version, export timestamp, and source content revision information. Retain snapshots needed by active or rollback releases. Apply retention/lifecycle rules only after establishing the rollback policy.

Cloud Build downloads JSON directly from GCS using its service account. No public JSON endpoint, signed URL lifetime dependency, browser fetch, or embedded credentials are required. A build never reads a mutable `latest.json` pointer.

**Build input contract.** Each request supplies a server-controlled release ID, snapshot location/generation/digest, schema version, and source revision. The environment, Firebase project, target site, and service account are fixed by the selected trigger. Do not accept arbitrary build commands, site IDs, bucket URLs, or GitHub refs from an editor's browser. Validate identifiers before passing them as arguments or substitutions.

**Pipeline steps.** Store the final build configuration under `infra/cloudbuild/`. Use small staging and production entry configurations with a shared script where behavior overlaps. Pin the Node/pnpm/Firebase CLI toolchain; record selected container image digests when implementing.

| Step | Action | Failure behavior |
| --- | --- | --- |
| Source | Cloud Build checks out the requested GitHub revision and records its SHA | Stop if unavailable or disallowed |
| Install | Install the pinned pnpm version and run `pnpm install --frozen-lockfile` | Stop; never rewrite the lockfile in CI |
| Snapshot | Download the exact private GCS object generation and check its digest | Stop on missing, changed, or mismatched input |
| Validate | Parse the snapshot with the shared Zod schema from this code revision | Stop with document/field errors |
| Materialize | Write the validated snapshot to the website's generated, Git-ignored input file | No fallback to old bundled content |
| Build | Run `pnpm --filter @tarek/website build` with Next.js `output: 'export'` | Leave the deployed site unchanged |
| Record | Save candidate/build metadata and optionally the static output archive | Preserve reproducibility and rollback inputs |
| Deploy | Run Firebase CLI for exactly one logical Hosting target | Report deployment result accurately |
| Finish | Record build ID, Hosting release/version, URLs, revision, and snapshot digest | Make status available to the CMS |

Firebase Hosting deployment is executed inside Cloud Build with application default credentials from the build service account. Do not use `firebase login:ci` tokens, downloaded service-account keys, or developer credentials in the pipeline. [Cloud Build to Firebase Hosting](https://docs.cloud.google.com/build/docs/deploying-builds/deploy-firebase)

Final deployment commands inside the corresponding jobs:

```sh
firebase deploy --only hosting:staging --project=studio-tarekatoui-cms --non-interactive
firebase deploy --only hosting:prod --project=studio-tarekatoui-cms --non-interactive
```

Each job runs only its own command. There is no bare `firebase deploy` that could deploy both sites or the CMS.

**Staging and production output.** Rebuild production from the staged snapshot and SHA instead of blindly cloning staging's output/configuration. Staging and production differ in indexability and potentially canonical/absolute URLs. Staging must emit noindex controls; production must contain production canonicals, sitemap URLs, and crawlable metadata. The content and source revision stay fixed while environment-specific settings differ.

Use the production domain for production canonicals. Decide staging canonical behavior explicitly in code; staging must never become the canonical public destination. Do not copy a staging `robots.txt` or Hosting noindex header into production.

**Service identities and IAM.** Use dedicated identities, not Owner or broad Firebase Admin by default:

| Identity | Intended permissions |
| --- | --- |
| Cloud Build service agent | Managed GitHub source connection access and its connection secrets |
| `website-build-staging` | Read snapshots, write its artifacts/logs, deploy Hosting |
| `website-build-prod` | Read approved snapshots, write its artifacts/logs, deploy Hosting |
| CMS App Hosting runtime identity | Create immutable snapshots, initiate/read website builds, and record release status |

Start with scoped Cloud Storage object permissions, Logs Writer, Hosting deployment permissions, and only the project/API discovery permissions required by the Firebase CLI. Validate the exact required permissions during implementation. The build accounts do not need the Firestore database connection string, Google OAuth secrets, or Payload session secrets. Configure Cloud Logging explicitly for custom build service accounts.

Cloud Build invocation requires suitable build-create/read permissions and service-account delegation where required. Scope delegation to the website build identities. Trigger allowlisting in the CMS is application policy; do not claim that IAM automatically limits build creation to those two trigger IDs. Likewise, separate build accounts improve auditability, but project-scoped Hosting permissions do not establish hard site-by-site isolation.

**Concurrency and release integrity.** Permit one deployment operation at a time for each environment. Queue or reject a second request rather than allowing builds to finish out of order. All publishing entry points, including CLI wrappers, must use the same release controller once Phase 4 exists. Restrict direct manual deployment to recovery/maintenance and coordinate it with active jobs. Use a GCS generation-based lock/control object to acquire environment ownership atomically; do not implement locks using a read-then-write sequence in the Mongo-compatible database. Record the build ID in the lock and release/reconcile it after terminal build status. Do not expire a lock solely because a build is slow. [Cloud Storage request preconditions](https://docs.cloud.google.com/storage/docs/request-preconditions)

Do not claim a database-wide atomic export: the compatibility setup disables transactions. The exporter should capture record identities/revisions, detect content changes across the export window, and retry or report that the content changed instead of silently claiming a coherent revision. Once captured, the JSON is immutable and shared by every step of that candidate's builds.

Phase 2 completion criteria: a developer can trigger staging from the monorepo's GitHub revision plus a fixed private CMS JSON export in the shared format, then build production from the same candidate; service accounts authenticate without keys; build failures retain the last live site; deployment target and noindex settings are explicit.

**Phase 3 — Complete: monorepo, website data cleanup, and local CMS export-to-build**

Implement the local path first:

1. Consolidate the repositories and shared toolchain while preserving both histories and working changes. Establish `@tarek/content` as the shared content contract.
2. Replace the website's legacy data model with CMS-shaped research documents and globals. Remove the obsolete editorial data, routes, and exclusive components described below.
3. Implement the published-content serializer and local CMS export command. The command runs locally against the configured CMS database; this does not require moving the database locally or deploying the CMS.
4. Export a validated snapshot directly to the website's ignored generated input, then run the website static build locally using that file. The build must neither re-export content nor substitute legacy JSON.

This export-to-build proof is the immediate milestone. Import recovery, authenticated Export JSON UI, and live previews remain planned Phase 3 work, but do not block proving the local path. Cloud infrastructure and editorial publishing controls belong to the later phases.

**Repository structure and history.** Preserve the website and CMS histories in a single root repository, retaining author and commit information. Save Git bundles and working-tree backups before path rewriting. Do not delete nested Git metadata until the root history has been established and the backups are available. Path rewriting can change commit hashes. This consolidation is local and does not require a GitHub remote.

The tree below shows the eventual structure. Defer `infra/cloudbuild/` and `cms/src/content/publish.ts` to the cloud/publishing phases; they are not required scaffolding for the local milestone.

```text
studiotarekatoui/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
├── biome.json
├── firebase.json
├── .firebaserc
├── AGENTS.md
├── cms-migration.md
├── infra/
│   └── cloudbuild/
│       ├── website-staging.yaml
│       ├── website-prod.yaml
│       └── build-website.sh
├── packages/
│   └── content/
│       ├── package.json
│       └── src/
│           ├── schema.ts
│           ├── preview.ts
│           ├── constants.ts
│           └── index.ts
├── cms/
│   ├── package.json
│   ├── apphosting.yaml
│   ├── scripts/
│   │   ├── deploy.sh
│   │   ├── export-content.ts
│   │   └── import-content.ts
│   └── src/
│       ├── collections/
│       ├── globals/
│       └── content/
│           ├── serialize.ts
│           ├── export.ts
│           └── publish.ts
└── website/
    ├── package.json
    ├── scripts/
    └── src/
        ├── app/
        ├── components/
        └── data/
            ├── generated/content.json  # ignored, supplied before build
            ├── siteContent.ts
            └── SiteDataProvider.tsx
```

Use packages `@tarek/cms`, `@tarek/website`, and `@tarek/content`; link the shared package with `workspace:*`. Keep database clients and Payload server code out of the browser-safe content package. Configure Next.js workspace transpilation as required. Do not create a dependency cycle between the CMS and website.

Move Firebase configuration to the root with explicit `prod`, `staging`, and `cms` targets. Website Hosting serves `website/out`. App Hosting's application root becomes `cms`, but source upload must include the workspace manifests, root lockfile, and shared package. Exclude nested environment files, databases, artifacts, logs, reference documents, local caches, and credentials from both Git and cloud source uploads. Preserve the existing App Hosting backend, URL, Google OAuth settings, and secrets. [App Hosting monorepos](https://firebase.google.com/docs/app-hosting/monorepos)

**Toolchain.** Target Node 22 at least 22.13, pnpm `11.27.1`, TypeScript `7.0.2`, Biome `2.4.11`, and one pinned Zod 4 version. The website already has TypeScript 7.0.2 and Biome 2.4.11 installed. Align both apps' compiler and relevant React type versions; keep Payload packages on a matching version. Align Next.js on a version supported by Payload, initially the website's 16.3.5 if compatibility checks pass.

Maintain a single lockfile and central dependency version definitions. Migrate pnpm build-script permissions to the supported pnpm 11 format. Remove CMS ESLint/Prettier dependencies/configuration and use one Biome configuration, adopting the existing website style: four spaces, single quotes, semicolons, ES5 trailing commas, and 150-character lines. Keep formatting changes separate from behavior changes and exclude generated files. Preserve SCSS support where Biome cannot handle the syntax; do not force unsupported files through the formatter. [Biome migration](https://biomejs.dev/guides/migrate-eslint-prettier/)

TypeScript 7 integration with Payload tooling, Next.js, and App Hosting is a checkpoint, not an untested promise. Document any concrete blocker before changing the agreed compiler target; do not silently leave the apps on different TypeScript versions.

**Shared content contract.** Define strict Zod schemas in `@tarek/content`. Infer website types from Zod. Keep Payload-generated types for CMS documents and write explicit typed serializers between the two. Reuse shared enum values in Payload field definitions where useful; do not introduce an automatic schema-generation framework.

```text
ContentSnapshot
├── schemaVersion
├── exportedAt
├── researchPage: { eyebrow, heading, introduction }
├── research[]
│   ├── id, slug, title, subtitle, summary, description[]
│   ├── yearStart, yearEnd, ongoing, yearsDisplay, sortOrder
│   ├── heroImageURL
│   ├── collaborators[], organizations[], materials[]
│   ├── instances[]
│   │   └── id/slug, title, kind, year, organization, city, country,
│   │       dateStart, dateDisplay, status, url
│   ├── gallery[]: { type, url, caption }
│   └── press[]: { title, url, publisher, type }
├── about
│   └── biography sections, portraitURL, portraitAlt, portraitCredit
├── news: { soloHeading, groupHeading, solo[], group[] }
├── contact: { heading, text, email }
└── navigation: { items[]: { label, href, external } }
```

Export stable content identifiers where needed; never expose authentication identifiers. Normalize optional values consistently, preserve editor order in nested arrays, sort research by `sortOrder` with a stable tie-breaker, and document display-date fallbacks. Validate duplicate slugs, required values, supported media types, URL schemes, and nested data. An empty research list must not crash a timeline calculation.

`schemaVersion` describes the JSON contract, not a Git revision or database schema. Each build uses the validator from its recorded Git SHA. Breaking schema changes require coordinated CMS/website deployment and a version bump; an incompatible snapshot fails the build with a clear error.

**Payload export.** Create a server-side export function that reads all published research records and published Research-page/About/Contact/Navigation/News globals through the Payload API, handling pagination. Explicitly request published content rather than latest draft versions. Fail when required globals have no published content. Construct output from an allowlist; exclude users, preferences, document locks, versions, hidden auth data, and internal database metadata. Validate the complete export before persisting a snapshot. [Payload Local API](https://payloadcms.com/docs/local-api/overview)

Provide an authenticated Export JSON action and a local export command. Exporting alone does not deploy. Show actionable field errors such as `Research “The Ground”: gallery[3].url is invalid`. Use the same serializer for CLI export, staging publication, and preview normalization, without allowing draft flags on public publishing requests.

**JSON-to-Firestore importer.** Restore the removed capability as `cms/scripts/import-content.ts`; do not reintroduce SQLite or `cms.db`. Input is the shared content JSON, validated before writes. Apply changes through Payload create/update operations so schema validation and hooks are retained. Default to a dry-run report; require `--apply` to write; import as drafts by default. Match stable identities and controlled slug fallbacks, report conflicts, preserve nested ordering, and never delete absent documents or import users implicitly.

Save a private pre-import backup to `~/tmp`. Report partial progress and allow safe reruns because the current compatibility preset disables transactions. A content import/export does not restore users, revision history, index definitions, or credentials. The historical backup directory remains private and untouched; its old raw `content.json` is not automatically the new public snapshot format. Any recovery from that raw backup requires an explicit one-time converter.

**Website data integration.** Keep static generation. A build-preparation step writes the chosen snapshot to `website/src/data/generated/content.json`, which is Git-ignored. `siteContent.ts` parses it with the shared Zod schema and exports typed content for both server pages and client providers. No page fetches editorial JSON from the network at runtime. No Firebase client SDK or Firestore connection is added to the website.

Preserve `output: 'export'` and `/research/[slug]` with `generateStaticParams()` derived from the snapshot. Generate each research page's metadata, canonical URL, and sitemap entry from the same data. A new research document gets its URL in the next publishing build. Unknown URLs use the static 404 behavior; no SPA research fallback is needed. [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)

Supply content during local development through an explicit export/download command. Do not silently connect public pages to the live database or bundle stale legacy JSON when the generated file is missing. Missing input should give a clear setup error. A real production snapshot used for local work stays ignored by Git.

**Research hierarchy and rendering.** Replace the old `themes`/`researchEvents` storage model with complete research documents containing their own instances, gallery, and press lists. Pass a research document to `ResearchThread` directly. Derive a flattened timeline only as a rendering calculation where a hub needs it; do not store a second independent event dataset.

Use the Research-page global for its eyebrow, heading, and introduction. Preserve CMS research ordering and gallery/press ordering. Render explicit gallery types and links instead of rediscovering them from Dropbox mappings and instance URLs. Render organizations, collaborators, materials, dates, optional images, and empty arrays intentionally. About uses its CMS biography and portrait fields, including absolute CDN URLs without adding a leading slash. Contact uses its CMS heading, text, and email.

**Website cleanup.** Remove the legacy editorial JSON and schemas, `src/data/old/`, flat events/themes sources, disabled portfolio/chronology routes and their exclusive components, and duplicate handwritten JSON validation. Keep News as the default homepage, matching the old site; retain `/research`, `/research/[slug]`, `/news`, `/about`, and `/contact`. News is CMS-owned, recovered from the old website with its exhibition/group-exhibition lists and nested shows; preserve the original rendering. Keep styling, theme switching, useful media sliders, and presentation components still used by CMS-owned content.

Remove Dropbox/media lookup files and one-time import scripts after identifying all active consumers. Keep working media-upload tooling if it remains the route for placing new media on the CDN. Do not delete public GCS media objects as part of repository cleanup. Navigation is a CMS global with ordered menu labels, URLs, and new-tab settings. Preserve the original Editions link to https://www.crousel.com/artiste/tarek-atoui-r90lmw/#items in its initial defaults alongside Research/About/Contact. Include published navigation in the JSON snapshot and render it in desktop and mobile menus. Site name, domain, and technical metadata remain application configuration. Do not add new editorial collections merely to preserve abandoned website content.

**Payload previews.** Add static preview routes in the website for Research, Research page, About, Contact, Navigation, and News, and configure Payload `admin.livePreview` URLs. Reuse the actual website components and shared data definitions. The preview iframe receives initial form state and subsequent unsaved edits through Payload's live-preview messaging; it does not need a website rebuild. [Payload client-side Live Preview](https://payloadcms.com/docs/live-preview/client)

Use a preview-specific content provider that overlays the active document on the bundled published baseline. Allow new research records to preview before they have generated public routes. Derive tolerant preview validation from shared field definitions so a temporarily blank field while typing does not crash rendering. Strict publication validation remains unchanged. Restrict message origins and window sources, mark preview routes noindex, and never embed drafts or reusable secrets in query strings or static output. Preview data remains in memory. Avoid navigation that accidentally leaves the preview frame.

**Commands.** Use explicit root scripts, with app-level `deploy` scripts invoked through `pnpm run deploy` to avoid pnpm's separate built-in deploy command.

| Root command | Behavior |
| --- | --- |
| `pnpm dev` | Start website on 3000 and CMS on 3001 |
| `pnpm dev:web` / `pnpm dev:cms` | Start one app |
| `pnpm build:web` / `pnpm build:cms` | Explicit local build of one app |
| `pnpm deploy:web:staging` | Build the local checkout with the existing snapshot and staging settings, then deploy only staging Hosting |
| `pnpm deploy:web:prod` | Build the local checkout with the existing snapshot and production settings, then deploy only production Hosting |
| `pnpm deploy:cms` | Deploy only the CMS through Firebase App Hosting |
| `pnpm content:export --output <file>` | Export published content to validated JSON |
| `pnpm content:validate <file>` | Validate a snapshot |
| `pnpm content:import <file>` | Dry-run JSON import |
| `pnpm content:import <file> --apply` | Apply the import through Payload |
| `pnpm lint` | Biome lint without rewriting files |
| `pnpm format` | Apply Biome formatting |
| `pnpm check` | Biome checks without rewriting files |
| `pnpm typecheck` | Explicit workspace type checking |
| `pnpm media:upload` | Retained media upload workflow, if still needed |

The website deployment commands now run locally at the owner’s request. They use the existing generated snapshot without re-exporting, explicitly set the build environment, and stop before deployment if the build fails. Cloud release orchestration remains deferred to Phase 2; no workflow is added.

**Local export-to-build milestone.** From the monorepo root, the intended sequence is:

```sh
pnpm content:export --output website/src/data/generated/content.json
pnpm build:web
```

The exporter validates before writing and reports the output path and exported research count. The website consumes that exact generated file through `@tarek/content`; missing or invalid input stops the build with an actionable error. Keep database credentials in the CMS's private local environment, and keep the exported content ignored by Git. A successful local export followed by a successful Next.js static export to `website/out` proves this milestone. These commands do not deploy or write editorial content to the database. They are planned commands, not results of this document update.

The current `deploy:web:staging` and `deploy:web:prod` commands deploy the local checkout, including uncommitted changes. When Phase 2 introduces cloud release commands, distinguish them explicitly: those commands will deploy GitHub source at a recorded revision and share release-request logic with later CMS controls. CMS deploys still include the whole workspace build context while targeting only the CMS backend. No command deploys all Firebase products by default.

Phase 3 local milestone criteria: one local repository and lockfile; shared toolchain/schema; obsolete website content is removed; public content derives from the CMS hierarchy; the local CMS command emits validated published-content JSON; the local website static build consumes that exact file successfully. Full Phase 3 completion additionally includes strict JSON import without SQLite and previews using the same renderers. Cloud build configuration is deferred to Phase 2 and will use the established monorepo paths and JSON format.

**Phase 4 — Add staging and production publishing controls to Payload**

Provide a Website publishing view in Payload, restricted to the existing authenticated editor allowlist. The view contains Build staging, Open staging, Publish production, and build/release history. It displays queued/building/deploying/succeeded/failed/canceled states, actionable errors, and links to Cloud Build logs. Ordinary editors should not need Google Cloud, GitHub, pnpm, or a local checkout.

Keep the meanings distinct:

| Action | Meaning |
| --- | --- |
| Save draft | Save unfinished CMS work |
| Publish document | Mark a document's content published in Payload |
| Export JSON | Download the currently published content snapshot |
| Build staging | Freeze published content and build/deploy a staging candidate |
| Publish production | Build/deploy the selected successful staging candidate to production |

Staging Hosting is publicly reachable, and noindex is not access control. Therefore staging builds use published content only. Unpublished drafts are visible through the authenticated CMS live-preview flow, not through a public staging export. Private full-site draft staging would require a separate access-control design and is outside this plan.

**Build staging request.** The CMS authenticates the editor, rejects invalid cross-origin requests, acquires the staging publishing slot, exports and validates content, creates an immutable snapshot, and starts the allowlisted staging trigger. Return a release/build ID promptly rather than keeping an HTTP request open for the entire build. Cloud Build resolves the approved source branch once and the CMS records the resulting SHA. Capture the deployed schema version so a mismatched code/snapshot combination fails clearly.

**Release records.** Persist minimal publishing records with editor identity, timestamps, snapshot URI/generation/digest, schema version, resolved Git SHA, build IDs, environment, terminal statuses, Hosting release/version identifiers, and public URLs. This operational data is never included in the website export. Retain a pointer to the active production release and the most recent successful staging candidate.

The CMS can poll Cloud Build status from its server while the publishing view is open. On reopening, reconcile unfinished records against Cloud Build; do not depend on a background timer in a scale-to-zero App Hosting process. After a successful build, read the recorded deployment manifest and confirm the deployment step completed. A job that merely started or compiled successfully is not a published release. If Hosting succeeded but status recording failed, reconcile the actual Hosting version before retrying deployment.

**Production request.** Enable Publish production only for a successful staging candidate. Show its content timestamp, code SHA, staging URL, and whether newer CMS edits exist. The action creates a production build using that candidate's exact snapshot generation/digest and Git SHA, with production environment settings. Do not re-export current content or resolve `main` again. If editors want newer content, they must build staging again.

The production job rebuilds Next.js, generates production metadata and indexing settings, then deploys `hosting:prod`. A failure retains the previous live release. Record the new Hosting version only after deployment succeeds. The production environment slot prevents overlapping production deployments; use idempotency keys so a double-click or retried request does not create duplicate release jobs.

**Status, cancellation, and rollback.** Show failures at the stage that failed: export validation, source checkout, dependency installation, snapshot retrieval, Next.js build, or Hosting deployment. Provide a retry that preserves the candidate's inputs. If a build is canceled, reconcile whether deployment had already completed; cancellation is not rollback. An explicit rollback uses a previously recorded production Hosting version and updates release state. Restrict it to approved editors/maintainers and serialize it with other production publishing operations.

The staging live URL shows the latest deployed staging candidate, not every historical candidate. Only offer normal production promotion for the currently reviewed successful candidate; older candidates must be restaged or use a recorded immutable preview deployment. Preserve candidate metadata and previous production releases for recovery.

Phase 4 completion criteria: an allowed editor can build staging, review it, and publish the identical content/code candidate to production without local tools; failures leave production intact; repeated clicks do not duplicate jobs; newer CMS edits cannot silently enter an approved production build; another editor sees accurate shared status; no credentials or drafts reach the public website.

**Execution sequence, verification, and rollout gates**

Execute Phase 3's local milestone next, before Phase 2: consolidate repositories, clean up the website data, export published CMS JSON locally, and build the website locally from that exact file. Complete the remaining Phase 3 import/preview work separately from this initial proof. Phase 2 later moves the established export/build path into Cloud Build; Phase 4 connects that pipeline to editor-facing Payload controls. Phase 1's pending owner-led domain cutover proceeds separately while preserving the current deployed pages. No temporary legacy-format cloud build or GitHub Actions workflow is part of this sequence.

Prepare each phase as reviewable changes. Run builds/tests/browser checks only when explicitly authorized under the repository instructions. The criteria below are the proposed checks for implementation; they were not executed while writing this plan. A deployment's required remote build is part of that requested deployment, not an invitation to run unrelated verification.

| Gate | Required evidence before advancing |
| --- | --- |
| Hosting cutover | Intended content on both new sites, correct custom-domain HTTPS, staging noindex, rollback information saved |
| Monorepo/toolchain | Both apps use agreed versions and shared package, no nested independent lockfiles or tracked credentials |
| Content contract | Nested research/gallery/press order preserved; no drafts/auth data in published JSON; all relevant CMS fields rendered |
| Local export-to-build | Local CMS export writes validated JSON; local website build consumes that exact file and generates `website/out`, without deployment |
| Import recovery | Dry run is non-mutating, explicit apply works, repeated import is safe, partial failures are reported |
| Static website | New research slug exported, page-specific HTML/meta/canonicals/sitemap generated, no runtime editorial JSON dependency |
| Live preview | Unsaved changes and new documents render safely; draft data is not exported or cached publicly |
| Cloud pipeline (later) | Exact Git SHA and snapshot consumed, schema failure stops deploy, service-account authentication works, destinations are correct |
| Editor publishing | Staging success gates production, production uses the same inputs, failures and concurrent requests are handled correctly |

First establish the local export-to-build milestone. When cloud rollout begins later, deploy the schema/export support and staging website integration before switching production content. Only cut the production website over to CMS-derived snapshots after reviewing the generated staging result. Retain the previous Hosting production version. For later breaking schema changes, deploy compatible code before changing the exporter contract, and keep release IDs tied to both schema and source revision.

**Inputs required when implementation reaches them**

- For deferred Phase 2 only: GitHub owner/repository name and installation authorization for the Cloud Build GitHub App. No remote is currently configured; this does not block Phase 3's local milestone.
- Availability of the proposed new Hosting site IDs and private bucket name.
- DNS provider access and the complete production custom-domain list, including any `www` or redirect aliases.
- Agreement on the approved publishing branch after preserving the existing `main` and `dev` histories.
- A staging review and production domain cutover window, with acceptable DNS/certificate propagation risk.
- The desired artifact/release retention period before automated deletion is configured.

**Outside this migration**

Do not move or delete unrelated sites in `api-project-992432653598`, migrate the existing media CDN, rotate the working OAuth client, or change Firestore regions as a side effect. The previously provisioned Cloud SQL instance is unused and has been reported as billable; its retirement is a separate explicit cleanup action. No SQLite/PostgreSQL adapters are restored. No public runtime JSON loader or research SPA rewrite is added. No automatic website deploy is attached to ordinary Payload saves.
