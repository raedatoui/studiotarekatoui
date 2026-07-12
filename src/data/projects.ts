import rawProjects from './projects.json';
import { type Manifestation, type ProjectsData, type Theme, projectsDataSchema } from './projects-schema';

/** Parsed + validated at module load, exactly like siteContent.ts. */
export const projectsData: ProjectsData = projectsDataSchema.parse(rawProjects);

export const themes: Theme[] = projectsData.themes;
export const manifestations: Manifestation[] = projectsData.manifestations;

const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export function getTheme(id: string): Theme | undefined {
    return themesById.get(id);
}

/** All manifestations linked to a theme, most recent first. */
export function manifestationsForTheme(themeId: string): Manifestation[] {
    return manifestations.filter((m) => m.themeIds.includes(themeId)).sort((a, b) => b.year - a.year);
}

/** Count of manifestations per theme — handy for hub cards. */
export function manifestationCount(themeId: string): number {
    return manifestations.reduce((n, m) => (m.themeIds.includes(themeId) ? n + 1 : n), 0);
}

/** Span of a theme across time, derived from its manifestations. */
export function themeYearRange(themeId: string): { first: number; last: number } | null {
    const years = manifestationsForTheme(themeId).map((m) => m.year);
    if (years.length === 0) {
        return null;
    }
    return { first: Math.min(...years), last: Math.max(...years) };
}

/** Distinct places a theme has travelled to — the "space" axis of the hub. */
export function themePlaces(themeId: string): string[] {
    const places = new Set<string>();
    for (const m of manifestationsForTheme(themeId)) {
        if (m.city) {
            places.add(m.country ? `${m.city}, ${m.country}` : m.city);
        }
    }
    return Array.from(places);
}
