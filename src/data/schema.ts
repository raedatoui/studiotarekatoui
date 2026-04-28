import { z } from 'zod';

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

export const portfolioImageSchema = z.strictObject({
    src: z.string(),
    caption: z.string(),
});

export const portfolioWorkSchema = z.strictObject({
    id: z.string(),
    title: z.string(),
    year: z.string(),
    description: z.array(z.string()),
    images: z.array(portfolioImageSchema),
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
    exhibitions: z.strictObject({
        solo: z.array(exhibitionSchema),
        group: z.array(exhibitionSchema),
    }),
    contact: contactSchema,
    portfolio: z.array(portfolioWorkSchema),
});

export type NavItem = z.infer<typeof navItemSchema>;
export type SubExhibition = z.infer<typeof subExhibitionSchema>;
export type Exhibition = z.infer<typeof exhibitionSchema>;
export type PortfolioImage = z.infer<typeof portfolioImageSchema>;
export type PortfolioWork = z.infer<typeof portfolioWorkSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
