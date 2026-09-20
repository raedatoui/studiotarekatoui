# Shelved source data

This directory is outside the active site data. It preserves content for future work.

- `projects.json`: all 130 dated events previously in the `projects` collection of the former `../projects.json`, with their original IDs, theme links, media, and review flags.
- `openQuestions.json`: all five original mapping questions, with references to the archived events and active themes.
- `portfolio.json`: all 11 original portfolio works from `../site-content.json`, preserving titles, year labels, descriptions, image paths, and captions verbatim.
- `projects-schema.ts` and `projects.ts`: archived event schema and loader used by the disabled chronology page. The disabled portfolio page reads `portfolio.json` directly.

The active research themes now live in `../site-content.json`, alongside all other editorial content, with one schema, loader, and shared provider. Each matching theme owns its former portfolio gallery images and captions; the `portfolioId` join is gone. Active research pages use theme descriptions and media without importing these archives.

## Portfolio text provenance

The existing research descriptions remain the canonical published text. Most portfolio descriptions already match them; original wording is retained here rather than appended as repetitive paragraphs.

- At-Tāriq has alternate wording in the portfolio, including a different introduction.
- WITHIN has a distinct older description and lists 11 instruments, whereas the current research text describes nine. Both versions are preserved without silently reconciling that difference.
- The Ground and On and From Tarab contain punctuation variants.
- The Wind Harvesters and The Metastable Circuit 1 have no matching research theme. Their complete records remain here; they have not been promoted to long-term research themes.

The event image import script explicitly reads this archive when manually invoked. Media files remain in their existing public paths.
