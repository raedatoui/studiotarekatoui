'use client'

import { useRowLabel } from '@payloadcms/ui'

export function InstanceRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    title?: string; organization?: string; year?: number; city?: string
  }>()
  return <span>{[data.year, data.title || data.organization, data.city].filter(Boolean).join(' · ') || `Instance ${(rowNumber ?? 0) + 1}`}</span>
}

export function GalleryRowLabel() {
  const { data, rowNumber } = useRowLabel<{ type?: string; url?: string; caption?: string }>()
  return (
    <span className="studio-gallery-row">
      {data.type === 'image' && data.url && /^https?:\/\//i.test(data.url) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.url} alt="" loading="lazy" />
      ) : <span className="studio-gallery-row__type">Video</span>}
      <span>{data.caption || `Media item ${(rowNumber ?? 0) + 1}`}</span>
    </span>
  )
}

export function PressRowLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string; publisher?: string }>()
  return <span>{[data.publisher, data.title].filter(Boolean).join(' · ') || `Link ${(rowNumber ?? 0) + 1}`}</span>
}
