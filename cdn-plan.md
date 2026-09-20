# Shared Google Cloud CDN plan

Date: 2026-09-19  
Status: Planning only. Google Cloud CDN selected; HTTPS hostname remains to be chosen.

## Objective and agreed scope

Add one shared Google Cloud CDN endpoint in front of the existing `gs://typedef` bucket for personal projects. Migrate applications individually, beginning with the media under `tarekatoui.com/`.

- Keep the bucket's location, object paths, permissions, metadata, and existing upload configuration.
- Keep direct Cloud Storage URLs working for applications that have not migrated.
- Reuse the same CDN endpoint and bucket for later projects, retaining each project's existing prefix.
- Change only the migrating application's public media base URL at cutover.
- Use a simple shared hostname; there is no requirement for a separate media domain per project.

Google is the selected provider. Provider comparisons and a mainland-China-specific rollout are outside this iteration.

## HTTPS hostname constraint

Google Cloud CDN does not supply an HTTPS hostname such as `typedef-cdn.<google-domain>`. Its frontend is the external Application Load Balancer's IP address; Google's documented setup points a DNS A/AAAA record at that address. [Google CDN frontend documentation](https://docs.cloud.google.com/cdn/docs/http-https-over-same-domain)

The standard managed HTTPS setup therefore needs a hostname under a domain the user controls, plus a Google-managed certificate. A subdomain of an existing domain is sufficient; there is no need to buy a new domain or dedicate the hostname to Tarek's site. Google provisions and renews the certificate. [Google-managed certificates](https://docs.cloud.google.com/load-balancing/docs/ssl-certificates/google-managed-certs)

Throughout this plan, `<shared-cdn-host>` is a placeholder, not a provisioned endpoint. A possible naming pattern is `typedef-cdn.<existing-domain>`. The hostname must be chosen before creating the certificate and changing application URLs.

## Shared architecture

```text
https://<shared-cdn-host>/<project-prefix>/<object-path>
                         |
        Global external Application Load Balancer
                 with Google Cloud CDN
                         |
           One backend bucket referencing typedef
                         |
gs://typedef/<project-prefix>/<object-path>
```

The Google Cloud "backend bucket" is a load-balancer configuration resource pointing to the existing storage bucket; it does not create another storage bucket. Google documents this architecture for serving Cloud Storage through Cloud CDN. [Backend bucket setup](https://docs.cloud.google.com/cdn/docs/setting-up-cdn-with-bucket)

Use one URL map with the shared backend bucket as its default destination. Preserve request paths without rewriting them:

| Application | CDN request path | Existing GCS object |
| --- | --- | --- |
| First migration | `/tarekatoui.com/portfolio/the-rain/img-010.jpg` | `gs://typedef/tarekatoui.com/portfolio/the-rain/img-010.jpg` |
| Later project, illustrative | `/another-project/images/example.jpg` | `gs://typedef/another-project/images/example.jpg` |

The CDN can address already-public objects across the shared bucket. "First iteration: tarekatoui.com" describes which application switches URLs first, not a CDN path restriction. Future applications can adopt the endpoint independently.

Preserve existing access controls. This design assumes the media being migrated already supports public reads, as the current direct-GCS setup requires. If that assumption fails, resolve it separately before cutover; this plan does not call for granting bucket-wide access or moving objects.

## Current Tarek configuration

The existing repository setup is recorded as:

```dotenv
MEDIA_BUCKET=gs://typedef
MEDIA_PREFIX=tarekatoui.com
NEXT_PUBLIC_MEDIA_BASE_URL=https://storage.googleapis.com/typedef/tarekatoui.com
```

At cutover, only the public base URL changes:

```dotenv
MEDIA_BUCKET=gs://typedef
MEDIA_PREFIX=tarekatoui.com
NEXT_PUBLIC_MEDIA_BASE_URL=https://<shared-cdn-host>/tarekatoui.com
```

The current upload workflow continues to put `public/images`, `public/portfolio`, and `public/media` under `gs://typedef/tarekatoui.com/`. The media URL helper continues to resolve local media paths against the configured base URL, and Firebase Hosting continues to exclude those media directories.

This plan revision does not inspect the live bucket or establish upload completeness.

## Implementation sequence

### 1. Establish the shared endpoint details

- Choose the Google Cloud project that will own the shared CDN resources and billing.
- Choose the shared HTTPS hostname and identify where its DNS record will be added.
- Record the existing bucket access configuration without changing it.
- Estimate shared monthly cost from expected traffic. Include CDN delivery, cache lookups, cache fills, applicable load-balancer charges, and existing Storage costs. One shared endpoint shares the infrastructure costs across projects; it is not free. [Google CDN pricing](https://cloud.google.com/cdn/pricing)

### 2. Add the Google CDN resources

Create resources named consistently around `typedef-cdn`:

- A global static frontend IP.
- One CDN-enabled backend bucket referencing the existing `typedef` bucket.
- One URL map pointing to that backend bucket, with paths preserved.
- A Google-managed certificate for the selected hostname.
- A target HTTPS proxy and a global forwarding rule on port 443.
- A DNS A record pointing the hostname to the frontend IP.

Record the resource names, owning project, hostname, and IP in deployment documentation. Existing applications continue using their current GCS URLs throughout provisioning.

### 3. Use the existing object cache policy

- Set the backend bucket cache mode to `USE_ORIGIN_HEADERS` so existing object cache directives control successful-response caching.
- Retain the existing one-hour cache lifetime for Tarek uploads; do not rewrite metadata across the shared bucket.
- Keep backend-bucket cache-key defaults initially. Arbitrary query parameters such as `?v=2` are not necessarily part of that key, so use changed object paths or explicit CDN invalidation for replacements.
- Document invalidation scoped to the affected object or project prefix, avoiding purges for unrelated projects.
- Keep negative caching disabled initially and preserve content types and byte-range delivery for videos.

Google describes origin-header caching, backend-bucket cache keys, and range support in its [caching documentation](https://docs.cloud.google.com/cdn/docs/caching).

### 4. Migrate tarekatoui.com

- Once the endpoint is ready, change `NEXT_PUBLIC_MEDIA_BASE_URL` in the site's build environment and `.env.example`.
- Update the media delivery note in `AGENTS.md`.
- Rebuild and deploy staging, then production through the existing branch workflow. The public environment value is embedded in the static build, so changing the environment alone does not update deployed pages.
- Keep uploads going to the same bucket and prefix.

Builds, deployments, uploads, and validation are future implementation work, not actions authorized by this planning document.

### 5. Migrate later applications as needed

For each application, point its media base URL to `https://<shared-cdn-host>/<existing-prefix>` and follow that application's deployment process. Reuse the shared bucket, backend bucket, certificate, and CDN frontend. Applications migrate on their own schedules.

## Proposed validation — only when requested

- Existing direct-GCS URLs still work.
- CDN URLs serve representative images and videos under `tarekatoui.com/` with valid HTTPS and correct content types.
- Repeated requests show cache reuse; video playback and seeking work.
- Replacements become visible through the documented TTL/invalidation process.
- Staging and production request media through the CDN after their respective deployments.
- Bucket configuration and unrelated applications retain their existing behavior.

No validation is performed as part of this plan revision.

## Rollback

Restore `NEXT_PUBLIC_MEDIA_BASE_URL=https://storage.googleapis.com/typedef/tarekatoui.com`, then rebuild and redeploy the affected site.

Retain the shared CDN while other applications, cached site assets, or open pages still reference it. Rolling back one application must not dismantle infrastructure used by another.

## Completion criteria

- One shared Google Cloud CDN endpoint serves existing public media from `gs://typedef` over HTTPS.
- The bucket configuration and object paths remain intact.
- Tarek's site uses the CDN under `/tarekatoui.com/`; other applications can migrate later.
- The shared resources and per-application cutover, invalidation, and rollback procedures are documented.
- Any requested validation results are recorded; untested behavior is identified as unverified.
