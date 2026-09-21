# Shared Google Cloud CDN plan

Date: 2026-09-20  
Status: Google Cloud CDN and HTTPS resources provisioned. Certificate ACTIVE as reported by the user. Local application configuration updated; staging and production deployments pending.

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

The selected shared hostname is `cdn.typedefinc.com`, with DNS managed in Squarespace. Its A record points to `35.201.78.246` with a 300-second TTL. Google manages the HTTPS certificate on the load balancer.

## Shared architecture

```text
https://cdn.typedefinc.com/<project-prefix>/<object-path>
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

Before migration, the repository used:

```dotenv
MEDIA_BUCKET=gs://typedef
MEDIA_PREFIX=tarekatoui.com
NEXT_PUBLIC_MEDIA_BASE_URL=https://storage.googleapis.com/typedef/tarekatoui.com
```

The local `.env` and tracked `.env.example` now contain the following. Only the public base URL changed; deployed sites still require a rebuild and deployment:

```dotenv
MEDIA_BUCKET=gs://typedef
MEDIA_PREFIX=tarekatoui.com
NEXT_PUBLIC_MEDIA_BASE_URL=https://cdn.typedefinc.com/tarekatoui.com
```

The current upload workflow continues to put `public/images`, `public/portfolio`, and `public/media` under `gs://typedef/tarekatoui.com/`. The media URL helper continues to resolve local media paths against the configured base URL, and Firebase Hosting continues to exclude those media directories.

The portrait was successfully retrieved through the HTTP CDN frontend during setup. The user subsequently confirmed the HTTPS certificate is ACTIVE. HTTPS media delivery, complete upload coverage, and site behavior after cutover have not been verified.

## Implementation sequence

### 1. Shared endpoint details

- Google Cloud project: `api-project-992432653598`.
- Shared hostname: `cdn.typedefinc.com`; Squarespace DNS A record: `cdn` → `35.201.78.246`, TTL 300 seconds.
- The existing bucket access configuration was not changed.
- Estimate shared monthly cost from expected traffic. Include CDN delivery, cache lookups, cache fills, applicable load-balancer charges, and existing Storage costs. One shared endpoint shares the infrastructure costs across projects; it is not free. [Google CDN pricing](https://cloud.google.com/cdn/pricing)

### 2. Provisioned Google CDN resources

| Resource | Name or value |
| --- | --- |
| Existing storage bucket | `typedef` |
| CDN-enabled backend bucket | `typedef-cdn` |
| URL map, preserving request paths | `typedef-cdn-lb` |
| Reserved global IPv4 address | `typedef-cdn-ipv4` → `35.201.78.246` |
| Google-managed certificate | `typedef-cdn-cert`, for `cdn.typedefinc.com` |
| HTTPS proxy | `typedef-cdn-https-proxy` |
| HTTPS forwarding rule | `typedef-cdn-https-ipv4`, port 443 |

The existing HTTP frontends remain in place. Applications continue using their current deployed media URLs until individually rebuilt and deployed with the CDN base URL.

### 3. Use the existing object cache policy

- The existing backend bucket uses `CACHE_ALL_STATIC`, which honors valid origin cache directives and can also cache eligible static content without explicit directives. Its default and client TTLs are 3600 seconds, and its maximum TTL is 86400 seconds. These settings were left unchanged.
- Retain the existing one-hour cache lifetime for Tarek uploads; do not rewrite metadata across the shared bucket.
- Keep backend-bucket cache-key defaults initially. Arbitrary query parameters such as `?v=2` are not necessarily part of that key, so use changed object paths or explicit CDN invalidation for replacements.
- Document invalidation scoped to the affected object or project prefix, avoiding purges for unrelated projects.
- Negative caching remains disabled. Preserve content types and byte-range delivery for videos.

Google describes origin-header caching, backend-bucket cache keys, and range support in its [caching documentation](https://docs.cloud.google.com/cdn/docs/caching).

### 4. Migrate tarekatoui.com

- Completed locally: changed `NEXT_PUBLIC_MEDIA_BASE_URL` in `.env` and `.env.example` to `https://cdn.typedefinc.com/tarekatoui.com`.
- Completed: updated the media delivery note in `AGENTS.md`.
- Rebuild and deploy staging, then production through the existing branch workflow. The public environment value is embedded in the static build, so changing the environment alone does not update deployed pages.
- Keep uploads going to the same bucket and prefix.

Builds, deployments, uploads, and further validation remain pending and are not authorized by this document.

### 5. Migrate later applications as needed

For each application, point its media base URL to `https://cdn.typedefinc.com/<existing-prefix>` and follow that application's deployment process. Reuse the shared bucket, backend bucket, certificate, and CDN frontend. Applications migrate on their own schedules.

## Proposed validation — only when requested

- Existing direct-GCS URLs still work.
- CDN URLs serve representative images and videos under `tarekatoui.com/` with valid HTTPS and correct content types.
- Repeated requests show cache reuse; video playback and seeking work.
- Replacements become visible through the documented TTL/invalidation process.
- Staging and production request media through the CDN after their respective deployments.
- Bucket configuration and unrelated applications retain their existing behavior.

No additional validation was performed with the local configuration update.

## Rollback

Restore `NEXT_PUBLIC_MEDIA_BASE_URL=https://storage.googleapis.com/typedef/tarekatoui.com`, then rebuild and redeploy the affected site.

Retain the shared CDN while other applications, cached site assets, or open pages still reference it. Rolling back one application must not dismantle infrastructure used by another.

## Completion criteria

- One shared Google Cloud CDN endpoint serves existing public media from `gs://typedef` over HTTPS.
- The bucket configuration and object paths remain intact.
- Tarek's site uses the CDN under `/tarekatoui.com/`; other applications can migrate later.
- The shared resources and per-application cutover, invalidation, and rollback procedures are documented.
- Any requested validation results are recorded; untested behavior is identified as unverified.
