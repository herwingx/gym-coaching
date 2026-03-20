import type { Metadata } from 'next'
import { getAuthUser, getUserRole } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getBodyMeasurements, getWorkoutSessions } from '@/lib/workouts'
import { getRoutineById } from '@/lib/routines'
import { ClientProfileHub } from './client-profile-hub'
import { AccessCodeBanner } from './access-code-banner'

interface Props {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ accessCode?: string; emailSent?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clientId } = await params
  const supabase = await createClient()
  const { data: client } = await supabase
    .from('clients')
    .select('full_name')
    .eq('id', clientId)
    .single()
  return {
    title: client?.full_name ? `${client.full_name} | GymCoach` : 'Cliente | GymCoach',
  }
}

export default async function ClientProfilePage({ params, searchParams }: Props) {
  const user = await getAuthUser()
  const role = await getUserRole()
  const { clientId } = await params
  const { accessCode, emailSent } = await searchParams

  if (!user) redirect('/auth/login')
  if (role !== 'admin') redirect('/auth/login')

  const supabase = await createClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('coach_id', user.id) // Seguridad: solo sus propios asesorados
    .single()

  if (error || !client) redirect('/admin/clients')

  // Resolver nombre del plan si existe
  let planName: string | null = null
  if (client.current_plan_id) {
    const { data: plan } = await supabase
      .from('membership_plans')
      .select('name')
      .eq('id', client.current_plan_id)
      .single()
    planName = plan?.name ?? null
  }

  const profile = client.user_id
    ? (
        await supabase
          .from('profiles')
          .select('role, streak_days, last_workout_at, xp_points, level, onboarding_completed')
          .eq('id', client.user_id)
          .single()
      ).data ?? null
    : null

  const workoutSessions = await getWorkoutSessions(clientId, 12)
  const bodyMeasurements = await getBodyMeasurements(clientId)

  const { data: progressPhotos } = await supabase
    .from('progress_photos')
    .select('id, photo_url, view_type, weight_kg, taken_at, notes')
    .eq('client_id', clientId)
    .order('taken_at', { ascending: false })
    .limit(30)

  const { data: activeClientRoutine } = await supabase
    .from('client_routines')
    .select('routine_id')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  const routine = activeClientRoutine?.routine_id
    ? await getRoutineById(activeClientRoutine.routine_id)
    : null

  const daysUntilExpiry = client.membership_end
    ? Math.ceil((new Date(client.membership_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const clientWithExtras = {
    ...client,
    plan_name: planName,
    days_until_expiry: daysUntilExpiry,
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-background">
        <div className="container flex items-center gap-4 py-4 sm:py-5">
          <Button variant="ghost" size="icon" asChild className="size-9 sm:size-10">
            <Link href="/admin/clients">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold truncate tracking-tight sm:text-2xl">{client.full_name}</h1>
            <p className="text-sm text-muted-foreground truncate">
              {planName ? `Plan de asesoría: ${planName}` : 'Sin plan de asesoría'}
              {profile?.streak_days != null ? ` · ${profile.streak_days} días racha` : ''}
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {accessCode && (
          <AccessCodeBanner
            code={accessCode}
            clientEmail={client.email}
            emailSent={emailSent === '1'}
            emailFailed={emailSent === '0'}
          />
        )}
        <ClientProfileHub
          client={clientWithExtras}
          profile={profile}
          routine={routine}
          workoutSessions={workoutSessions}
          bodyMeasurements={bodyMeasurements}
          progressPhotos={progressPhotos || []}
          clientId={clientId}
        />
      </main>
    </div>
  )
}
