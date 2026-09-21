import { z } from 'zod';
import { GALLERY_TYPES, INSTANCE_KINDS, INSTANCE_STATUSES, PRESS_TYPES, SCHEMA_VERSION } from './constants';
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

export const contentSnapshotSchema = z.strictObject({
    schemaVersion: z.literal(SCHEMA_VERSION),
    exportedAt: z.iso.datetime(),
    navigation: navigationSchema,
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
