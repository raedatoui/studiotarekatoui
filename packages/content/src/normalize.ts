import type { ContentSnapshot, Research, ResearchInstance } from './schema';

type NullableFields<T> = { [K in keyof T]?: T[K] | null };
export type ResearchInput = NullableFields<Omit<Research, 'description' | 'instances' | 'gallery' | 'press'>> & {
    description?: { text?: string | null }[] | null;
    instances?: NullableFields<ResearchInstance>[] | null;
    gallery?: NullableFields<Research['gallery'][number]>[] | null;
    press?: NullableFields<Research['press'][number]>[] | null;
};

const optional = (value: string | null | undefined) => value?.trim() || undefined;

export function normalizeNavigation(doc: { items?: NullableFields<ContentSnapshot['navigation']['items'][number]>[] | null }): ContentSnapshot['navigation'] {
    return {
        items: (doc.items ?? []).map((item) => ({
            label: item.label?.trim() ?? '',
            href: item.href?.trim() ?? '',
            external: item.external ?? false,
        })),
    };
}

/** Allowlist shared by typed CMS export and tolerant browser preview. No database fields escape. */
export function normalizeResearch(doc: ResearchInput): Research {
    const yearStart = doc.yearStart ?? new Date().getFullYear();
    const yearEnd = doc.yearEnd ?? undefined;
    const ongoing = doc.ongoing ?? true;
    const id = doc.id || 'preview';
    return {
        id,
        slug: doc.slug?.trim() ?? '',
        title: doc.title?.trim() ?? '',
        subtitle: optional(doc.subtitle),
        summary: doc.summary?.trim() ?? '',
        description: (doc.description ?? []).map((paragraph) => paragraph.text?.trim() ?? ''),
        yearStart,
        yearEnd,
        ongoing,
        yearsDisplay: optional(doc.yearsDisplay) ?? `${yearStart}${ongoing ? ' — ongoing' : yearEnd && yearEnd !== yearStart ? ` — ${yearEnd}` : ''}`,
        sortOrder: doc.sortOrder ?? 0,
        heroImageURL: optional(doc.heroImageURL),
        collaborators: doc.collaborators ?? [],
        organizations: doc.organizations ?? [],
        materials: doc.materials ?? [],
        instances: (doc.instances ?? []).map((instance, index) => ({
            id: instance.id || instance.slug || `${id}-instance-${index + 1}`,
            slug: optional(instance.slug),
            title: optional(instance.title),
            kind: instance.kind ?? 'solo',
            year: instance.year ?? yearStart,
            organization: instance.organization?.trim() ?? '',
            city: optional(instance.city),
            country: optional(instance.country),
            dateStart: optional(instance.dateStart),
            dateDisplay: optional(instance.dateDisplay) ?? optional(instance.dateStart)?.slice(0, 10) ?? String(instance.year ?? yearStart),
            status: instance.status ?? undefined,
            url: optional(instance.url),
        })),
        gallery: (doc.gallery ?? []).map((item) => ({ type: item.type ?? 'image', url: item.url?.trim() ?? '', caption: item.caption ?? '' })),
        press: (doc.press ?? []).map((item) => ({
            title: item.title?.trim() ?? '',
            url: item.url?.trim() ?? '',
            publisher: optional(item.publisher),
            type: item.type ?? 'press',
        })),
    };
}

export function normalizeResearchPage(doc: NullableFields<ContentSnapshot['researchPage']>): ContentSnapshot['researchPage'] {
    return { eyebrow: doc.eyebrow ?? '', heading: doc.heading ?? '', introduction: doc.introduction ?? '' };
}

export function normalizeAbout(doc: NullableFields<ContentSnapshot['about']>): ContentSnapshot['about'] {
    return {
        text: doc.text ?? '', exhibitions: doc.exhibitions ?? '', performances: doc.performances ?? '',
        groupExhibitions: doc.groupExhibitions ?? '', collections: doc.collections ?? '',
        portraitURL: optional(doc.portraitURL), portraitAlt: doc.portraitAlt ?? '', portraitCredit: doc.portraitCredit ?? '',
    };
}

export function normalizeContact(doc: NullableFields<ContentSnapshot['contact']>): ContentSnapshot['contact'] {
    return { heading: doc.heading ?? '', text: doc.text ?? '', email: doc.email?.trim() ?? '' };
}
