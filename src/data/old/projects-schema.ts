import { z } from 'zod';
import { mediaSchema } from '../schema';

/** How a project appeared at a given time and place. */
const projectKindSchema = z.enum([
    'solo', // solo exhibition
    'group', // group exhibition
    'performance', // solo or collective performance / concert
    'commission',
    'curation',
    'collaboration', // e.g. Organon with Noé Soulier
    'residency',
    'workshop',
]);

const statusSchema = z.enum(['current', 'upcoming', 'past']);

export const projectSchema = z.strictObject({
    id: z.string(),
    /** Themes this project belongs to. Omit for standalone projects outside the long-term themes. */
    themeIds: z.array(z.string()).optional(),
    kind: projectKindSchema,
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

export type Project = z.infer<typeof projectSchema>;
