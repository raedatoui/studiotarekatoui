import { z } from 'zod';

/** Active long-term research themes. Shelved events and source text live in ./old. */
const mediaTypeSchema = z.enum(['image', 'video', 'audio', 'press', 'interview', 'external']);

export const mediaSchema = z.strictObject({
    type: mediaTypeSchema,
    url: z.string(),
    label: z.string().optional(),
    publisher: z.string().optional(),
});

export const themeSchema = z.strictObject({
    /** Research page slug. */
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
    /** Gallery images and captions carried over from the portfolio. */
    images: z.array(z.strictObject({ src: z.string(), caption: z.string() })).optional(),
    /** Media about the research as a whole, independent of a specific presentation. */
    media: z.array(mediaSchema).optional(),
});

const exhibitionStatusSchema = z.enum(['current', 'upcoming', 'past']);

export const subExhibitionSchema = z.strictObject({
    title: z.string(),
    dateDisplay: z.string(),
    location: z.string(),
});

export const exhibitionSchema = z.strictObject({
    venue: z.string(),
    title: z.string().optional(),
    dateDisplay: z.string().optional(),
    dateStart: z.string().optional(),
    dateEnd: z.string().optional(),
    organization: z.string().optional(),
    location: z.string().optional(),
    work: z.string().optional(),
    url: z.string().optional(),
    status: exhibitionStatusSchema.optional(),
    subExhibitions: z.array(subExhibitionSchema).optional(),
});

const metaSchema = z.strictObject({
    siteTitle: z.string(),
    domain: z.string(),
    copyright: z.string(),
});

const navItemSchema = z.strictObject({
    label: z.string(),
    href: z.string(),
    external: z.boolean().optional(),
});

const bioSchema = z.strictObject({
    text: z.string(),
    exhibitions: z.string(),
    performances: z.string(),
    groupExhibitions: z.string(),
    collections: z.string(),
});

const portraitSchema = z.strictObject({
    src: z.string(),
    alt: z.string(),
    credit: z.string(),
});

const contactSchema = z.strictObject({
    email: z.string(),
    text: z.string(),
});

export const siteContentSchema = z.strictObject({
    meta: metaSchema,
    navigation: z.array(navItemSchema),
    bio: bioSchema,
    portrait: portraitSchema,
    news: z.strictObject({
        solo: z.array(exhibitionSchema),
        group: z.array(exhibitionSchema),
    }),
    contact: contactSchema,
    themes: z.array(themeSchema),
});

export type NavItem = z.infer<typeof navItemSchema>;
export type SubExhibition = z.infer<typeof subExhibitionSchema>;
export type Exhibition = z.infer<typeof exhibitionSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;

export type Media = z.infer<typeof mediaSchema>;
export type Theme = z.infer<typeof themeSchema>;
