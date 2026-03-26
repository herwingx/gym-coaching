import { renderGymCoachIcon } from '@/app/icons/_render'

export const runtime = 'edge'

export function GET() {
  // iOS uses 180x180 for apple-touch-icon by convention.
  return renderGymCoachIcon({ size: 180 })
}

