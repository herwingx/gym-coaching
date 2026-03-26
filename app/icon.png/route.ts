import { renderGymCoachIcon } from '@/app/icons/_render'

export const runtime = 'edge'

export function GET() {
  return renderGymCoachIcon({ size: 32 })
}

