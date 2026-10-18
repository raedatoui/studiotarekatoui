import { z } from 'zod';
import { GALLERY_TYPES, INSTANCE_KINDS, INSTANCE_STATUSES, NEWS_SECTIONS, PRESS_TYPES, PROJECT_MEDIA_TYPES, SCHEMA_VERSION } from './constants';
import { videoEmbedURL } from './media';

const text = z.string().trim().min(1, 'Required');
const year = z.number().int().min(1).max(9999);
export const linkSchema = z.url({ protocol: /^https?$/ });
export const navigationLinkSchema = z.union([linkSchema, z.string().regex(/^\/(?![\/\\])[^\s\\]*$/, 'Use a website path or an HTTP(S) URL')]);
export const navigationItemSchema = z.strictObject({ label: text, href: navigationLinkSchema, external: z.boolean() });
export const navigationSchema = z.strictObject({ items: z.array(navigationItemSchema).min(1, 'Add at least one menu item') });
export const mediaURLSchema = z.union([linkSchema, z.string().regex(/^\/(?!\/)[^\s\\]+$/, 'Use an HTTP(S) URL or a root-relative media path')]);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and single hyphens');

export const instanceSchema = z.strictObject({
    id: text,
    slug: slug.optional(),
    title: text.optional(),
    kind: z.enum(INSTANCE_KINDS),
    year,
    organization: text,
    city: text.optional(),
    country: text.optional(),
    dateStart: z.iso.datetime({ offset: true }).optional(),
    dateDisplay: text,
    status: z.enum(INSTANCE_STATUSES).optional(),
    url: linkSchema.optional(),
});

export const gallerySchema = z.strictObject({
    type: z.enum(GALLERY_TYPES),
    url: mediaURLSchema,
    caption: z.string(),
}).superRefine((item, ctx) => {
    if (item.type === 'embed' && !videoEmbedURL(item.url)) {
        ctx.addIssue({ code: 'custom', path: ['url'], message: 'Use a supported YouTube or Vimeo video URL' });
    }
});

export const pressSchema = z.strictObject({
    title: text,
    url: linkSchema,
    publisher: text.optional(),
    type: z.enum(PRESS_TYPES),
});

export const researchSchema = z.strictObject({
    id: text,
    slug,
    title: text,
    subtitle: text.optional(),
    summary: text,
    description: z.array(text),
    yearStart: year,
    yearEnd: year.optional(),
    ongoing: z.boolean(),
    yearsDisplay: text,
    sortOrder: z.number().finite(),
    heroImageURL: mediaURLSchema.optional(),
    collaborators: z.array(text),
    organizations: z.array(text),
    materials: z.array(text),
    instances: z.array(instanceSchema),
    gallery: z.array(gallerySchema),
    press: z.array(pressSchema),
}).superRefine((research, ctx) => {
    if (research.yearEnd !== undefined && research.yearEnd < research.yearStart) {
        ctx.addIssue({ code: 'custom', path: ['yearEnd'], message: 'Must not precede yearStart' });
    }
    for (const key of ['id', 'slug'] as const) {
        const seen = new Set<string>();
        research.instances.forEach((instance, index) => {
            const value = instance[key];
            if (!value) return;
            if (seen.has(value)) ctx.addIssue({ code: 'custom', path: ['instances', index, key], message: `Duplicate ${key}: ${value}` });
            seen.add(value);
        });
    }
});

export const researchPageSchema = z.strictObject({ eyebrow: z.string(), heading: text, introduction: text });
export const aboutSchema = z.strictObject({
    text,
    exhibitions: z.string(),
    performances: z.string(),
    groupExhibitions: z.string(),
    collections: z.string(),
    portraitURL: mediaURLSchema.optional(),
    portraitAlt: z.string(),
    portraitCredit: z.string(),
});
export const contactSchema = z.strictObject({ heading: text, text: z.string(), email: z.email() });

const exhibitionDate = z.union([z.iso.date(), z.iso.datetime({ offset: true })]);
export const subExhibitionSchema = z.strictObject({ title: text, dateDisplay: text, location: text });
export const exhibitionSchema = z.strictObject({
    venue: text,
    title: text.optional(),
    dateDisplay: text.optional(),
    dateStart: exhibitionDate.optional(),
    dateEnd: exhibitionDate.optional(),
    organization: text.optional(),
    location: text.optional(),
    work: text.optional(),
    url: linkSchema.optional(),
    status: z.enum(INSTANCE_STATUSES).optional(),
    subExhibitions: z.array(subExhibitionSchema),
});
export const newsSectionOrderSchema = z.array(z.strictObject({ section: z.enum(NEWS_SECTIONS) }))
    .length(NEWS_SECTIONS.length)
    .refine((rows) => new Set(rows.map((row) => row.section)).size === NEWS_SECTIONS.length, 'Include each news section exactly once');
export const newsSchema = z.strictObject({
    sectionOrder: newsSectionOrderSchema.default(NEWS_SECTIONS.map((section) => ({ section }))),
    soloHeading: text,
    solo: z.array(exhibitionSchema),
    groupHeading: text,
    group: z.array(exhibitionSchema),
    installationsHeading: text.default('Permanent installations'),
    installations: z.array(exhibitionSchema).default([]),
    performancesHeading: text.default('Performances'),
    performances: z.array(exhibitionSchema).default([]),
});
export type Exhibition = z.infer<typeof exhibitionSchema>;

// The former projects.json contract, now owned by the CMS chronology.
export const projectSchema = z.strictObject({
    id: slug,
    themeIds: z.array(slug).default([]),
    kind: z.enum(INSTANCE_KINDS),
    title: text.optional(),
    year,
    dateStart: exhibitionDate.optional(),
    dateEnd: exhibitionDate.optional(),
    dateDisplay: text.optional(),
    status: z.enum(INSTANCE_STATUSES).optional(),
    venue: text,
    city: text.optional(),
    country: text.optional(),
    organization: text.optional(),
    collaborators: z.array(text).default([]),
    note: text.optional(),
    url: linkSchema.optional(),
    media: z.array(z.strictObject({
        type: z.enum(PROJECT_MEDIA_TYPES), url: mediaURLSchema, label: text.optional(), publisher: text.optional(),
    })).default([]),
    needsReview: z.boolean().default(false),
}).superRefine((project, ctx) => {
    if (project.dateStart && project.dateEnd && Date.parse(project.dateEnd) < Date.parse(project.dateStart)) {
        ctx.addIssue({ code: 'custom', path: ['dateEnd'], message: 'Must not precede dateStart' });
    }
});
export const chronologySchema = z.strictObject({
    heading: text,
    introduction: z.string(),
    projects: z.array(projectSchema),
}).superRefine((chronology, ctx) => {
    const seen = new Set<string>();
    chronology.projects.forEach((project, index) => {
        if (seen.has(project.id)) ctx.addIssue({ code: 'custom', path: ['projects', index, 'id'], message: `Duplicate project ID: ${project.id}` });
        seen.add(project.id);
    });
});
export type Project = z.infer<typeof projectSchema>;
export type Chronology = z.infer<typeof chronologySchema>;

export const publicationSchema = z.strictObject({
    id: text,
    title: text,
    year,
    price: z.number().finite().nonnegative().optional(),
    availability: z.enum(['available', 'out-of-print']),
    imageURL: mediaURLSchema,
    imageCredit: z.string(),
    body: text,
});
export type Publication = z.infer<typeof publicationSchema>;

export const contentSnapshotSchema = z.strictObject({
    schemaVersion: z.literal(SCHEMA_VERSION),
    exportedAt: z.iso.datetime(),
    navigation: navigationSchema,
    news: newsSchema,
    // Optional while the hosted CMS still exports the pre-chronology version.
    chronology: chronologySchema.optional(),
    // Older hosted CMS exports do not contain the publications collection yet.
    publications: z.array(publicationSchema).default([]),
    researchPage: researchPageSchema,
    research: z.array(researchSchema),
    about: aboutSchema,
    contact: contactSchema,
}).superRefine((snapshot, ctx) => {
    for (const key of ['id', 'slug'] as const) {
        const seen = new Set<string>();
        snapshot.research.forEach((research, index) => {
            if (seen.has(research[key])) ctx.addIssue({ code: 'custom', path: ['research', index, key], message: `Duplicate ${key}: ${research[key]}` });
            seen.add(research[key]);
        });
    }
});

export type Research = z.infer<typeof researchSchema>;
export type ResearchInstance = z.infer<typeof instanceSchema>;
export type GalleryItem = z.infer<typeof gallerySchema>;
export type ContentSnapshot = z.infer<typeof contentSnapshotSchema>;

export function parseContentSnapshot(value: unknown): ContentSnapshot {
    const result = contentSnapshotSchema.safeParse(value);
    if (result.success) return result.data;
    const research = value && typeof value === 'object' && 'research' in value && Array.isArray(value.research) ? value.research : [];
    const errors = result.error.issues.map((issue) => {
        const [section, index, ...fields] = issue.path;
        const title = section === 'research' && typeof index === 'number' ? research[index]?.title : undefined;
        const location = title ? `Research “${title}”: ${fields.join('.')}` : issue.path.join('.');
        return `${location || 'Snapshot'}: ${issue.message}`;
    });
    throw new Error(`Invalid content snapshot:\n${errors.join('\n')}`);
}
