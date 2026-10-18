import { z } from 'zod';
import { NEWS_SECTIONS, PROJECT_MEDIA_TYPES } from './constants';
import { normalizeAbout, normalizeChronology, normalizeContact, normalizeNavigation, normalizeNews, normalizeResearch, normalizeResearchPage } from './normalize';
import { aboutSchema, contactSchema, exhibitionSchema, gallerySchema, instanceSchema, mediaURLSchema, navigationItemSchema, newsSectionOrderSchema, pressSchema, projectSchema, researchPageSchema, researchSchema } from './schema';

// Invalid or unfinished fields are cleared for rendering, never accepted by the publication schema.
const string = z.string().catch('');
const optionalString = z.string().nullish().catch(undefined);
const list = z.array(string).nullish().catch([]);
const instance = z.object({
    id: optionalString, slug: optionalString, title: optionalString,
    kind: instanceSchema.shape.kind.catch('solo'),
    year: instanceSchema.shape.year.nullish().catch(undefined),
    organization: string, city: optionalString, country: optionalString,
    dateStart: instanceSchema.shape.dateStart.nullish().catch(undefined),
    dateDisplay: optionalString,
    status: instanceSchema.shape.status.nullish().catch(undefined),
    url: instanceSchema.shape.url.nullish().catch(undefined),
});
const researchInput = z.object({
    id: optionalString, slug: string, title: string, subtitle: optionalString, summary: string,
    description: z.array(z.object({ text: string })).nullish().catch([]),
    yearStart: researchSchema.shape.yearStart.nullish().catch(undefined),
    yearEnd: researchSchema.shape.yearEnd.nullish().catch(undefined),
    ongoing: researchSchema.shape.ongoing.nullish().catch(true),
    yearsDisplay: optionalString,
    sortOrder: researchSchema.shape.sortOrder.nullish().catch(0),
    heroImageURL: researchSchema.shape.heroImageURL.nullish().catch(undefined),
    collaborators: list, organizations: list, materials: list,
    instances: z.array(instance).nullish().catch([]),
    gallery: z.array(z.object({
        type: gallerySchema.shape.type.catch('image'),
        url: gallerySchema.shape.url.catch(''), caption: string,
    })).nullish().catch([]),
    press: z.array(z.object({
        type: pressSchema.shape.type.catch('press'), title: string,
        url: pressSchema.shape.url.catch(''), publisher: optionalString,
    })).nullish().catch([]),
});

const researchPageInput = z.object({
    eyebrow: string, heading: researchPageSchema.shape.heading.catch(''), introduction: string,
});
const aboutInput = z.object({
    text: aboutSchema.shape.text.catch(''), exhibitions: string, performances: string, groupExhibitions: string, collections: string,
    portraitURL: aboutSchema.shape.portraitURL.nullish().catch(undefined), portraitAlt: string, portraitCredit: string,
});
const contactInput = z.object({ heading: contactSchema.shape.heading.catch(''), text: string, email: contactSchema.shape.email.catch('') });
const navigationInput = z.object({
    items: z.array(z.object({
        label: string,
        href: navigationItemSchema.shape.href.catch(''),
        external: navigationItemSchema.shape.external.catch(false),
    })).nullish().catch([]),
});

const exhibitionInput = z.object({
    venue: string, title: optionalString, dateDisplay: optionalString,
    dateStart: exhibitionSchema.shape.dateStart.nullish().catch(undefined),
    dateEnd: exhibitionSchema.shape.dateEnd.nullish().catch(undefined),
    organization: optionalString, location: optionalString, work: optionalString,
    url: exhibitionSchema.shape.url.nullish().catch(undefined),
    status: exhibitionSchema.shape.status.nullish().catch(undefined),
    subExhibitions: z.array(z.object({ title: string, dateDisplay: string, location: string })).nullish().catch([]),
});
const newsInput = z.object({
    sectionOrder: z.array(z.object({ section: z.enum(NEWS_SECTIONS) })).pipe(newsSectionOrderSchema).nullish().catch(undefined),
    soloHeading: string, groupHeading: string,
    solo: z.array(exhibitionInput).nullish().catch([]), group: z.array(exhibitionInput).nullish().catch([]),
    installationsHeading: optionalString, performancesHeading: optionalString,
    installations: z.array(exhibitionInput).nullish().catch([]),
    performances: z.array(exhibitionInput).nullish().catch([]),
});

const chronologyInput = z.object({
    heading: string, introduction: string,
    projects: z.array(z.object({
        id: optionalString, projectId: optionalString, title: optionalString,
        kind: projectSchema.shape.kind.catch('solo'), year: projectSchema.shape.year.catch(0),
        dateStart: projectSchema.shape.dateStart.nullish().catch(undefined),
        dateEnd: projectSchema.shape.dateEnd.nullish().catch(undefined),
        dateDisplay: optionalString, status: projectSchema.shape.status.nullish().catch(undefined),
        venue: string, city: optionalString, country: optionalString, organization: optionalString,
        themeIds: list, collaborators: list, note: optionalString,
        url: projectSchema.shape.url.nullish().catch(undefined),
        needsReview: z.boolean().catch(false),
        media: z.array(z.object({
            type: z.enum(PROJECT_MEDIA_TYPES).catch('external'), url: mediaURLSchema.catch(''),
            label: optionalString, publisher: optionalString,
        })).nullish().catch([]),
    })).nullish().catch([]),
});

export function previewResearch(value: unknown) {
    const research = normalizeResearch(researchInput.parse(value));
    return {
        ...research,
        gallery: research.gallery.filter((item) => gallerySchema.safeParse(item).success),
        press: research.press.filter((item) => pressSchema.shape.url.safeParse(item.url).success),
    };
}
export const previewResearchPage = (value: unknown) => normalizeResearchPage(researchPageInput.parse(value));
export const previewAbout = (value: unknown) => normalizeAbout(aboutInput.parse(value));
export const previewContact = (value: unknown) => normalizeContact(contactInput.parse(value));
export const previewNavigation = (value: unknown) => normalizeNavigation(navigationInput.parse(value));
export const previewNews = (value: unknown) => normalizeNews(newsInput.parse(value));
export function previewChronology(value: unknown) {
    const input = chronologyInput.parse(value);
    const chronology = normalizeChronology(input);
    const ids = new Set<string>();
    return {
        ...chronology,
        projects: chronology.projects.map((project, index) => {
            // New rows and temporarily duplicated IDs must still render while an editor is typing.
            let id = project.id || input.projects?.[index].id || `preview-project-${index}`;
            while (ids.has(id)) id = `${id}-preview-${index}`;
            ids.add(id);
            return { ...project, id, media: project.media.filter((item) => mediaURLSchema.safeParse(item.url).success) };
        }),
    };
}
