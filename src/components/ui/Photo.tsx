import type { CSSProperties } from 'react'
import photoData from '../../content/photo-data.json'

export type PhotoSlug = keyof typeof photoData

type PhotoProps = {
  slug: PhotoSlug
  /** The `sizes` attribute: how wide the photo renders at each breakpoint. */
  sizes: string
  className?: string
  /** Only for a photo visible on first paint. */
  priority?: boolean
  /** Overrides the focal point stored in photos.json. */
  position?: string
  style?: CSSProperties
  /** Empty alt text, for a photo that only decorates something already named. */
  decorative?: boolean
}

const srcset = (slug: string, widths: number[], ext: 'avif' | 'webp') =>
  widths.map((w) => `/photos/${slug}-${w}.${ext} ${w}w`).join(', ')

/**
 * A responsive photo: AVIF with a WebP fallback at several widths, intrinsic
 * width/height so the layout never shifts, and a blurred placeholder painted
 * behind it while it loads. It fills its container (object-fit: cover).
 */
export function Photo({ slug, sizes, className = '', priority = false, position, style, decorative = false }: PhotoProps) {
  const photo = photoData[slug]
  const largest = photo.widths[photo.widths.length - 1]
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={srcset(slug, photo.widths, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(slug, photo.widths, 'webp')} sizes={sizes} />
      <img
        src={`/photos/${slug}-${Math.min(largest, 1200)}.webp`}
        alt={decorative ? '' : photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        className={`h-full w-full object-cover ${className}`}
        style={{
          objectPosition: position ?? photo.position,
          backgroundImage: `url(${photo.placeholder})`,
          backgroundSize: 'cover',
          backgroundPosition: position ?? photo.position,
          ...style,
        }}
      />
    </picture>
  )
}

export const photoCredits = Object.entries(photoData).map(([slug, p]) => ({ slug, ...p.credit }))
