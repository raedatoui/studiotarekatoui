'use client'

import { useFormFields } from '@payloadcms/ui'
import type { UIFieldClientProps } from 'payload'
import { videoEmbedURL } from '../lib/media'
import { ImageUpload } from './ImageUpload'

type Props = UIFieldClientProps & {
  urlField?: string
  labelField?: string
  linkOnly?: boolean
  allowUpload?: boolean
}

export function MediaPreview({ path, urlField, labelField, linkOnly, allowUpload }: Props) {
  const rowPath = path.slice(0, path.lastIndexOf('.'))
  const url = useFormFields(([fields]) => fields[urlField ?? `${rowPath}.url`]?.value)
  const caption = useFormFields(([fields]) => fields[labelField ?? `${rowPath}.caption`]?.value)
  const type = useFormFields(([fields]) => fields[`${rowPath}.type`]?.value)

  const hasURL = typeof url === 'string' && /^https?:\/\//i.test(url)
  const canUpload = allowUpload && !linkOnly && (urlField || type === 'image')
  if (!hasURL && !canUpload) return null
  const label = typeof caption === 'string' && caption ? caption : 'Media preview'
  const embedURL = type === 'embed' && hasURL ? videoEmbedURL(url) : undefined

  return (
    <>
      {canUpload && <ImageUpload path={urlField ?? `${rowPath}.url`} />}
      {hasURL && (
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
      )}
    </>
  )
}
