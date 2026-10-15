export const site = {
    title: 'Studio Tarek Atoui',
    url: 'https://tarekatoui.com',
    copyright: 'Studio Tarek Atoui',
};

export const isStaging = process.env.NEXT_PUBLIC_SITE_ENV === 'staging';
export const showChronology = isStaging || process.env.NODE_ENV === 'development';
