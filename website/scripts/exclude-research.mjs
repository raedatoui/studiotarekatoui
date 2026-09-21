import { rm } from 'node:fs/promises';

if (process.env.NEXT_PUBLIC_SITE_ENV === 'production') {
    // Remove the research HTML, route data, and nested pages from the static export.
    for (const pathname of ['research.html', 'research.txt', 'research']) {
        await rm(new URL(`../out/${pathname}`, import.meta.url), { recursive: true, force: true });
    }
}
