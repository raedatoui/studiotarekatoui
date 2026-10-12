export const SCHEMA_VERSION = 3;
export const INSTANCE_KINDS = ['solo', 'group', 'performance', 'commission', 'curation', 'collaboration', 'residency', 'workshop'] as const;
export const INSTANCE_STATUSES = ['current', 'upcoming', 'past'] as const;
export const NEWS_SECTIONS = ['solo', 'group', 'installations', 'performances'] as const;
export const NEWS_SECTION_LABELS = {
    solo: 'Exhibitions',
    group: 'Group exhibitions',
    installations: 'Permanent installations',
    performances: 'Performances',
} as const;
export const GALLERY_TYPES = ['image', 'video', 'embed'] as const;
export const PRESS_TYPES = ['press', 'interview', 'external', 'audio', 'video', 'image'] as const;
