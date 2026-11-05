/**
 * Project image honouring the optional display hints in projects.json:
 * `fit: "contain"` + `background` for logos/figures, `position` for photo crops.
 */
export default function ProjectImage({ image, className = '', imgClassName = '', eager = false, sizes }) {
  const contain = image.fit === 'contain'
  return (
    <div className={`overflow-hidden ${className}`} style={{ background: image.background ?? undefined }}>
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        sizes={sizes}
        className={`h-full w-full ${contain ? 'object-contain p-6' : 'object-cover'} ${imgClassName}`}
        style={{ objectPosition: image.position ?? 'center' }}
      />
    </div>
  )
}
