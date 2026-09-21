export function videoEmbedURL(src: string): string | undefined {
  const url = new URL(src, 'https://tarekatoui.com')
  const host = url.hostname.replace(/^www\./, '')
  if (['youtu.be', 'youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
    const id = host === 'youtu.be'
      ? url.pathname.slice(1)
      : (url.searchParams.get('v') ?? url.pathname.split('/')[2])
    if (id && /^[\w-]{11}$/.test(id)) {
      return `https://www.youtube.com/embed/${id}?playsinline=1`
    }
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = url.pathname.match(/^\/(?:video\/)?(\d+)/)?.[1]
    if (id) return `https://player.vimeo.com/video/${id}`
  }
}
