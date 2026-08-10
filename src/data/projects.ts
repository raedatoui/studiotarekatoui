import rawProjects from './projects.json';
import { type Project, type ProjectsData, projectsDataSchema, type Theme } from './projects-schema';

/** Parsed + validated at module load, exactly like siteContent.ts. */
export const projectsData: ProjectsData = projectsDataSchema.parse(rawProjects);

export const themes: Theme[] = projectsData.themes;
export const projects: Project[] = projectsData.projects;

const themesById = new Map(themes.map((theme) => [theme.id, theme]));

export function getTheme(id: string): Theme | undefined {
    return themesById.get(id);
}

/** All projects linked to a theme, most recent first. */
export function projectsForTheme(themeId: string): Project[] {
    return projects.filter((p) => p.themeIds?.includes(themeId)).sort((a, b) => b.year - a.year);
}

/** Count of projects per theme — handy for hub cards. */
export function projectCount(themeId: string): number {
    return projects.reduce((n, p) => (p.themeIds?.includes(themeId) ? n + 1 : n), 0);
}

/** Span of a theme across time, derived from its projects. */
export function themeYearRange(themeId: string): { first: number; last: number } | null {
    const years = projectsForTheme(themeId).map((p) => p.year);
    if (years.length === 0) {
        return null;
    }
    return { first: Math.min(...years), last: Math.max(...years) };
}

/** Distinct places a theme has travelled to — the "space" axis of the hub. */
export function themePlaces(themeId: string): string[] {
    const places = new Set<string>();
    for (const p of projectsForTheme(themeId)) {
        if (p.city) {
            places.add(p.country ? `${p.city}, ${p.country}` : p.city);
        }
    }
    return Array.from(places);
}
