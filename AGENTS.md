# Repository instructions

Studio Tarek Atoui is a pnpm monorepo: `cms/` (Payload), `website/` (static Next.js), and `packages/content/` (shared Zod contract). See README.md and cms-migration.md.

- Make surgical changes, state assumptions, and avoid speculative features or unrelated cleanup.
- Never run verification unless explicitly requested for the current turn: no builds, lint, type checks, tests, browser tools, or smoke checks. Implementation permission alone is not verification permission.
- Do not deploy, import with `--apply`, publish documents, or upload media unless the user asks for that action.
- Use Node 22 >=22.13, pnpm 11.27.1, the root lockfile, and catalog versions in pnpm-workspace.yaml.
- Use the root Biome style: four spaces, single quotes, semicolons, ES5 trailing commas, 150 columns. Keep formatting-only changes separate. Generated files and SCSS are excluded.
- Public content comes only from a validated CMS snapshot at website/src/data/generated/content.json. No runtime content fetch, legacy fallback, or website database client.
- Credentials, snapshots, public media working files, build output, and caches stay ignored. Backups and scratch output go under ~/tmp, never /tmp.
- Keep CMS authentication and the existing CDN/database/cloud resources intact. Cloud website publishing is deferred.
- Preserve author information in history. Never add agent attribution to commits.
