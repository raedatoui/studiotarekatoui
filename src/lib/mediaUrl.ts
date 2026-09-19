const mediaBaseUrl = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '').replace(/\/+$/, '');

/** Resolve local media against the bucket while preserving external media URLs. */
export function mediaUrl(src: string): string {
    if (!mediaBaseUrl || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src)) return src;
    return `${mediaBaseUrl}/${src.replace(/^\/+/, '')}`;
}
