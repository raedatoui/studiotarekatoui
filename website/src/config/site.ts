export const site = {
    title: 'Studio Tarek Atoui',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    copyright: 'Studio Tarek Atoui',
};

export const isStaging = process.env.NEXT_PUBLIC_SITE_ENV === 'staging';
export const showChronology = isStaging || process.env.NODE_ENV === 'development';
export const showPublications = isStaging || process.env.NODE_ENV === 'development';
export const showResearchLab = isStaging || process.env.NODE_ENV === 'development';
