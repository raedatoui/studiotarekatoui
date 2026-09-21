import { type GalleryItem, videoEmbedURL } from '@tarek/content';

export interface GallerySlide {
    type: 'image' | 'embed' | 'video';
    src: string;
    caption: string;
}

/** Explicit CMS media types and editor ordering determine the gallery. */
export function gallerySlides(items: GalleryItem[]): GallerySlide[] {
    return items.flatMap((item) => {
        const src = item.type === 'embed' ? videoEmbedURL(item.url) : item.url;
        return src ? [{ type: item.type, src, caption: item.caption }] : [];
    });
}
