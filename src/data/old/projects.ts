import { z } from 'zod';
import rawProjects from './projects.json';
import { projectSchema } from './projects-schema';

/** Shelved data used only by the disabled chronology page. */
export const projects = z.array(projectSchema).parse(rawProjects);
