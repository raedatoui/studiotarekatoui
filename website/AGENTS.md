# Website guidelines

See ../AGENTS.md and ../README.md for workspace commands and constraints.

## Architecture

Next.js 16.3.5 / React 19.2.6 with static export to `website/out`. Active public routes: `/` (News), `/research`, `/research/[slug]`, `/news`, `/about`, `/contact`. Fixed preview routes under `/preview/[kind]` are noindex and use the same renderers.

`src/data/siteContent.ts` parses the ignored generated snapshot with `@tarek/content`. The server layout passes it into `SiteDataProvider`; client components use `useSiteData`. Research documents contain their own instances/gallery/press. `ResearchThread` receives a document directly. A flattened timeline is only a rendering calculation. CMS sortOrder and nested editor ordering are preserved.

Site identity and production domain are application configuration in `src/config/site.ts`. Navigation is CMS-owned: the published Navigation global supplies ordered labels, links, and new-tab behavior through the snapshot, including Editions. Both desktop and mobile use the same menu. Page metadata and sitemap use the same snapshot as rendering. `generateStaticParams` creates research routes; missing slugs use the static 404. News is restored at `/news` using the published News global and the original exhibition-card layout. There are no portfolio or chronology routes, legacy website data files, Dropbox mappings, or runtime content APIs.

## Local work

Run workspace commands from the root:

- `pnpm content:export --output website/src/data/generated/content.json`
- `pnpm dev:web` (port 3000), `pnpm build:web` (static export)
- `pnpm media:upload` (only when requested)

Export requires configured `cms/.env`; website media and preview origins are configured in `website/.env`. Preserve configured local environment files. A missing snapshot fails with a setup error. Do not run export/build/verification just to check a change unless requested in the current turn.

## Styling and media

Retain existing theme switching, typography, CSS variables, responsive clamp sizing, and useful presentation components. `@/*` maps to `src/*`. MediaSlider follows explicit CMS media types and order. Absolute CDN URLs are preserved; root-relative media resolves through NEXT_PUBLIC_MEDIA_BASE_URL.

Local media working files remain in ignored `public/`. Hosting excludes images, portfolio media, and media directories from upload. The CDN is https://cdn.typedefinc.com/tarekatoui.com; uploads retain gs://typedef/tarekatoui.com. Do not delete cloud media during cleanup.

## Deployment

Root Firebase configuration maps production and staging to studio-tarekatoui-web and studio-tarekatoui-staging in studio-tarekatoui-cms. From the workspace root, `pnpm deploy:web:staging` and `pnpm deploy:web:prod` build the local checkout with its existing generated snapshot, then deploy only the named Hosting target. They explicitly set NEXT_PUBLIC_SITE_ENV to staging or production and stop if the build fails. Export fresh CMS content separately when needed. Cloud Build publishing remains deferred; there is no GitHub workflow. Production canonicals always use tarekatoui.com. Never deploy without the user's request.
