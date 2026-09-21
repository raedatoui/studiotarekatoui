'use client'

import { useFormFields } from '@payloadcms/ui'
import type { UIFieldClientProps } from 'payload'
import { videoEmbedURL } from '../lib/media'

type Props = UIFieldClientProps & {
  urlField?: string
  labelField?: string
  linkOnly?: boolean
}

export function MediaPreview({ path, urlField, labelField, linkOnly }: Props) {
  const rowPath = path.slice(0, path.lastIndexOf('.'))
  const url = useFormFields(([fields]) => fields[urlField ?? `${rowPath}.url`]?.value)
  const caption = useFormFields(([fields]) => fields[labelField ?? `${rowPath}.caption`]?.value)
  const type = useFormFields(([fields]) => fields[`${rowPath}.type`]?.value)

  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return null
  const label = typeof caption === 'string' && caption ? caption : 'Media preview'
  const embedURL = type === 'embed' ? videoEmbedURL(url) : undefined

  return (
    <div className="studio-media-preview">
      {!linkOnly && (urlField || type === 'image') && (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} loading="lazy" />
        </a>
      )}
      {!linkOnly && type === 'video' && (
        <video src={url} aria-label={label} controls playsInline preload="none" />
      )}
      {!linkOnly && embedURL && (
        <iframe src={embedURL} title={label} loading="lazy" allowFullScreen />
      )}
      <a href={url} target="_blank" rel="noopener noreferrer">Open in a new tab</a>
    </div>
  )
}
