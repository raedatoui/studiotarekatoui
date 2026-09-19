import mediaAssets from '@/data/media-assets.json';
import type { Media, Project } from '@/data/projects-schema';
import type { PortfolioImage } from '@/data/schema';

export interface GallerySlide {
    type?: 'image' | 'embed' | 'video';
    src: string;
    caption: string;
}

const localAssets: Record<string, { src: string; name: string }[]> = mediaAssets;

function videoSlide(media: Media, caption: string): GallerySlide | undefined {
    const url = new URL(media.url, 'https://tarekatoui.com');
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
        const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') ?? url.pathname.split('/')[2];
        if (id && /^[\w-]{11}$/.test(id)) {
            return { type: 'embed', src: `https://www.youtube.com/embed/${id}?playsinline=1`, caption };
        }
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
        const id = url.pathname.match(/^\/(?:video\/)?(\d+)/)?.[1];
        if (id) return { type: 'embed', src: `https://player.vimeo.com/video/${id}`, caption };
    }
    if (/\.(mp4|webm|ogv)$/i.test(url.pathname)) {
        if (host === 'dropbox.com') {
            url.searchParams.delete('dl');
            url.searchParams.set('raw', '1');
        }
        return { type: 'video', src: url.href, caption };
    }
}

/** Resolve and deduplicate portfolio, presentation, and theme media for the shared gallery. */
export function collectGalleryMedia(images: PortfolioImage[], projects: Project[], themeMedia: Media[] = []) {
    const slides: GallerySlide[] = [...images];
    const references: { src: string; caption: string }[] = [];
    const sources = projects.map((project) => ({ media: project.media ?? [], context: `${project.venue}, ${project.year}` }));
    sources.push({ media: themeMedia, context: '' });

    for (const source of sources) {
        for (const media of source.media) {
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
            references.push({ src: media.url, caption });
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
            if (seen.has(reference.src)) return false;
            seen.add(reference.src);
            return true;
        }),
    };
}
