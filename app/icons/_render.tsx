import { ImageResponse } from 'next/og'

export type GymCoachIconVariant = 'default' | 'maskable'

export function renderGymCoachIcon(args: {
  size: number
  variant?: GymCoachIconVariant
}) {
  const size = args.size
  const variant = args.variant ?? 'default'
  const pad = variant === 'maskable' ? Math.round(size * 0.14) : Math.round(size * 0.08)
  const inner = size - pad * 2

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            borderRadius: Math.round(inner * 0.22),
            background: 'linear-gradient(135deg, #111 0%, #0A0A0A 45%, #111 100%)',
            border: '1px solid rgba(229,168,77,0.25)',
            boxShadow:
              '0 18px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: Math.round(inner * 0.22),
              background:
                'radial-gradient(circle at 30% 20%, rgba(229,168,77,0.20), transparent 55%), radial-gradient(circle at 70% 78%, rgba(229,168,77,0.12), transparent 60%)',
            }}
          />
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: Math.max(6, Math.round(inner * 0.04)),
              padding: Math.round(inner * 0.08),
            }}
          >
            <div
              style={{
                fontSize: Math.round(inner * 0.34),
                fontWeight: 800,
                letterSpacing: -Math.round(inner * 0.02),
                color: '#E5A84D',
                lineHeight: 1,
              }}
            >
              GC
            </div>
            <div
              style={{
                fontSize: Math.round(inner * 0.09),
                fontWeight: 700,
                letterSpacing: Math.round(inner * 0.02),
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.78)',
              }}
            >
              GymCoach
            </div>
          </div>
        </div>
      </div>
    ),
    { width: size, height: size },
  )
}

