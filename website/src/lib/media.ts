import mediaAssets from '@/data/media-assets.json';
import type { Media, ResearchEvent } from '@/data/schema';

export interface GallerySlide {
    type?: 'image' | 'embed' | 'video';
    src: string;
    caption: string;
}

const localAssets: Record<string, { src: string; name: string }[]> = mediaAssets;

export function isDropboxUrl(src: string): boolean {
    const host = new URL(src, 'https://tarekatoui.com').hostname;
    return /(^|\.)(dropbox\.com|dropboxusercontent\.com|db\.tt)$/.test(host);
}

/** Dropbox is an import source; only its downloaded assets are public media. */
export function publicMedia(items: Media[]): Media[] {
    return items.flatMap((item) => {
        if (!isDropboxUrl(item.url)) return [item];
        const assets = localAssets[item.url] ?? [];
        return assets.map((asset) => ({
            type: item.type,
            url: asset.src,
            label: [item.label?.replace(/\s*\(Dropbox\)/g, ''), assets.length > 1 ? asset.name.replace(/_/g, ' ') : ''].filter(Boolean).join(' — '),
        }));
    });
}

function referenceKey(src: string): string {
    const url = new URL(src, 'https://tarekatoui.com');
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
        if (key.startsWith('utm_') || key === 'fbclid' || key === 'gclid') url.searchParams.delete(key);
    }
    url.searchParams.sort();
    return `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/+$/, '')}${url.search}`;
}

function videoSlide(media: Media, caption: string): GallerySlide | undefined {
    const url = new URL(media.url, 'https://tarekatoui.com');
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
        const id = host === 'youtu.be' ? url.pathname.slice(1) : (url.searchParams.get('v') ?? url.pathname.split('/')[2]);
        if (id && /^[\w-]{11}$/.test(id)) {
            return { type: 'embed', src: `https://www.youtube.com/embed/${id}?playsinline=1`, caption };
        }
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
        const id = url.pathname.match(/^\/(?:video\/)?(\d+)/)?.[1];
        if (id) return { type: 'embed', src: `https://player.vimeo.com/video/${id}`, caption };
    }
    if (/\.(mp4|webm|ogv)$/i.test(url.pathname)) {
        return { type: 'video', src: media.url, caption };
    }
}

/** Resolve and deduplicate portfolio, presentation, and theme media for the shared gallery. */
export function collectGalleryMedia(images: GallerySlide[], projects: ResearchEvent[], themeMedia: Media[] = []) {
    const slides: GallerySlide[] = [...images];
    const references: { src: string; caption: string; publisher: string; type: Media['type'] }[] = [];
    const sources = [
        { media: themeMedia, context: '' },
        ...projects.map((project) => ({
            media: [
                ...(project.media ?? []),
                ...(project.url
                    ? [{ type: 'external' as const, url: project.url, label: project.title ?? project.venue, publisher: project.venue }]
                    : []),
            ],
            context: `${project.venue}, ${project.year}`,
        })),
    ];

    for (const source of sources) {
        for (const media of publicMedia(source.media)) {
            const label = media.label?.replace(/\s*\(Dropbox\)/g, '');
            const caption = [label, source.context].filter(Boolean).join(' — ');
            if (media.type === 'image') {
                const assets = media.url.startsWith('/') ? [{ src: media.url, name: '' }] : localAssets[media.url];
                if (assets?.length) {
                    slides.push(
                        ...assets.map((asset) => ({
                            type: 'image' as const,
                            src: asset.src,
                            caption: assets.length > 1 ? `${caption} — ${asset.name.replace(/_/g, ' ')}` : caption,
                        }))
                    );
                    continue;
                }
            }
            if (media.type === 'video') {
                const slide = videoSlide(media, caption);
                if (slide) {
                    slides.push(slide);
                    continue;
                }
            }
            references.push({
                src: media.url,
                caption,
                publisher: media.publisher ?? new URL(media.url, 'https://tarekatoui.com').hostname.replace(/^www\./, ''),
                type: media.type,
            });
        }
    }

    const seen = new Set<string>();
    return {
        slides: slides.filter((slide) => {
            if (seen.has(slide.src)) return false;
            seen.add(slide.src);
            return true;
        }),
        references: references.filter((reference) => {
            const key = referenceKey(reference.src);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }),
    };
}
