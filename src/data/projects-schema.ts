import { z } from 'zod';

/**
 * Combined data model for the Projects hub.
 *
 * Two linked collections:
 *   - `themes`         — the long-term research projects (the "thematical" list).
 *   - `manifestations` — the dated exhibitions / performances where a theme was shown.
 *
 * They are joined relationally: every manifestation lists the `themeIds` it belongs
 * to (a single event can belong to several themes, e.g. a group show running
 * Waters' Witness + The Rain + WITHIN at once). Each manifestation carries its own
 * TIME (year / dateStart / dateEnd) and SPACE (venue / city / country) so the hub can
 * plot the spread of a theme across time and geography.
 *
 * Sources combined here:
 *   - "WEBSITE texts STA" sheet → LONG TERM RESEARCH PROJECTS (thematical) = `themes`.
 *   - "PROJECTS Tarek Atoui" doc → ALL PROJECTS (chronological) = `manifestations`.
 */

const mediaTypeSchema = z.enum(['image', 'video', 'audio', 'press', 'interview', 'external']);

export const mediaSchema = z.strictObject({
    type: mediaTypeSchema,
    url: z.string(),
    label: z.string().optional(),
});

/** How a theme appeared at a given time and place. */
const manifestationKindSchema = z.enum([
    'solo', // solo exhibition
    'group', // group exhibition
    'performance', // solo or collective performance / concert
    'commission',
    'residency',
    'workshop',
]);

const statusSchema = z.enum(['current', 'upcoming', 'past']);

export const themeSchema = z.strictObject({
    /** Slug. Joins to `manifestation.themeIds`. */
    id: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    /** First year of the research. */
    yearStart: z.number().int(),
    /** Last year; omit when the project is still active. */
    yearEnd: z.number().int().optional(),
    ongoing: z.boolean(),
    /** Human label, e.g. "2020 — ongoing". */
    yearsDisplay: z.string(),
    /** One-line hook for the hub cards. */
    summary: z.string(),
    /** Full thematic text, paragraph per entry (from the website-texts sheet). */
    description: z.array(z.string()),
    heroImage: z.string().optional(),
    collaborators: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
    /** Links to the matching work in site-content.json `portfolio`, when one exists. */
    portfolioId: z.string().optional(),
});

export const manifestationSchema = z.strictObject({
    id: z.string(),
    /** Themes this event belongs to. 0 = not yet assigned (see `needsReview`). */
    themeIds: z.array(z.string()),
    kind: manifestationKindSchema,
    /** Title shown for this specific showing, e.g. "I/E Elefsina". */
    title: z.string().optional(),

    // TIME
    year: z.number().int(),
    dateStart: z.string().optional(), // ISO yyyy-mm-dd
    dateEnd: z.string().optional(),
    dateDisplay: z.string().optional(),
    status: statusSchema.optional(),

    // SPACE
    venue: z.string(),
    city: z.string().optional(),
    country: z.string().optional(),

    // CONTEXT
    organization: z.string().optional(),
    collaborators: z.array(z.string()).optional(),
    note: z.string().optional(),
    url: z.string().optional(),
    media: z.array(mediaSchema).optional(),

    /** True when the theme link is a best guess the studio still needs to confirm. */
    needsReview: z.boolean().optional(),
});

/** Open mapping questions carried over from the doc's "QUESTIONS TAREK" section. */
const openQuestionSchema = z.strictObject({
    question: z.string(),
    relatedThemeIds: z.array(z.string()).optional(),
    relatedManifestationIds: z.array(z.string()).optional(),
});

export const projectsDataSchema = z.strictObject({
    themes: z.array(themeSchema),
    manifestations: z.array(manifestationSchema),
    openQuestions: z.array(openQuestionSchema).optional(),
});

export type Media = z.infer<typeof mediaSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type Manifestation = z.infer<typeof manifestationSchema>;
export type OpenQuestion = z.infer<typeof openQuestionSchema>;
export type ProjectsData = z.infer<typeof projectsDataSchema>;
