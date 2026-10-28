import { useId } from 'react'

// Small, friendly worker robot drawn in SVG. The three intro workers and the
// chatbot avatar are all this component with a different variant.
export const ROBOT_VARIANTS = {
  structure: { accent: '#3b82f6', glow: '#93c5fd', name: 'Structure' },
  content: { accent: '#7c3aed', glow: '#c4b5fd', name: 'Content' },
  polish: { accent: '#0891b2', glow: '#67e8f9', name: 'Polish' },
}

function AntennaTip({ variant, color }) {
  if (variant === 'structure') return <rect x="29" y="3" width="6" height="6" rx="1.5" fill={color} />
  if (variant === 'polish')
    return <path d="M32 1.5 L33.6 4.4 L36.5 6 L33.6 7.6 L32 10.5 L30.4 7.6 L27.5 6 L30.4 4.4 Z" fill={color} />
  return <circle cx="32" cy="6" r="3.2" fill={color} />
}

export default function Robot({
  variant = 'polish',
  size = 48,
  beam = false,
  carrying = false,
  hovering = true,
  className = '',
  title,
}) {
  const id = useId().replace(/:/g, '')
  const { accent, glow } = ROBOT_VARIANTS[variant] ?? ROBOT_VARIANTS.polish

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`overflow-visible ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`head-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8eef7" />
        </linearGradient>
        <radialGradient id={`thrust-${id}`} cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor={glow} stopOpacity="0.95" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`beam-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={glow} stopOpacity="0.75" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </linearGradient>
      </defs>

      {beam && (
        <path d="M26 54 L38 54 L54 104 L10 104 Z" fill={`url(#beam-${id})`} className="animate-pulse" />
      )}

      <g className={hovering ? 'animate-hover' : undefined}>
        {/* thruster glow */}
        <ellipse cx="32" cy="58" rx="9" ry="5" fill={`url(#thrust-${id})`} className="animate-pulse" />

        {/* torso + arms */}
        <path d="M21 46 Q15 49 14 54" stroke="#0f2240" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M43 46 Q49 49 50 54" stroke="#0f2240" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <rect x="21" y="40" width="22" height="14" rx="6" fill={`url(#head-${id})`} stroke="#c6d6ea" strokeWidth="1.2" />
        <rect x="27" y="45" width="10" height="3" rx="1.5" fill={accent} />

        {carrying && (
          <g>
            <rect x="12" y="53" width="40" height="22" rx="4" fill="#ffffff" stroke={accent} strokeWidth="1.6" />
            <rect x="16" y="57" width="14" height="10" rx="2" fill={glow} opacity="0.7" />
            <rect x="33" y="58" width="15" height="2.4" rx="1.2" fill="#c6d6ea" />
            <rect x="33" y="62.5" width="11" height="2.4" rx="1.2" fill="#c6d6ea" />
            <rect x="16" y="69.5" width="32" height="2.4" rx="1.2" fill="#e3ebf5" />
          </g>
        )}

        {/* antenna */}
        <line x1="32" y1="9" x2="32" y2="15" stroke="#0f2240" strokeWidth="2.4" strokeLinecap="round" />
        <AntennaTip variant={variant} color={accent} />

        {/* ears */}
        <rect x="6.5" y="23" width="5" height="11" rx="2.5" fill={accent} />
        <rect x="52.5" y="23" width="5" height="11" rx="2.5" fill={accent} />

        {/* head */}
        <rect x="10" y="14" width="44" height="28" rx="12" fill={`url(#head-${id})`} stroke="#c6d6ea" strokeWidth="1.2" />
        <rect x="15.5" y="19.5" width="33" height="17" rx="8.5" fill="#0f2240" />
        <g className="animate-blink" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <rect x="22" y="24.5" width="6" height="7" rx="3" fill={glow} />
          <rect x="36" y="24.5" width="6" height="7" rx="3" fill={glow} />
        </g>
        <path d="M17.5 22 Q22 20.5 26 21" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  )
}
