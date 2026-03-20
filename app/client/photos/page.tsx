import { getAuthUser } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotosContent } from './photos-content'

export default async function ClientPhotosPage() {
  const user = await getAuthUser()
  if (!user) redirect('/auth/login')

  const supabase = await createClient()

  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) redirect('/client/dashboard')

  const { data: photos } = await supabase
    .from('progress_photos')
    .select('id, photo_url, view_type, weight_kg, notes, taken_at, created_at')
    .eq('client_id', clientRecord.id)
    .order('taken_at', { ascending: false })

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild aria-label="Volver al dashboard">
            <Link href="/client/dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Fotos de progreso
            </h1>
            <p className="text-sm text-muted-foreground">
              Sube fotos, compáralas y visualiza tu evolución
            </p>
          </div>
        </div>
      </header>

      <main id="main-content" className="container py-8" tabIndex={-1}>
        <PhotosContent
          clientId={clientRecord.id as string}
          initialPhotos={photos || []}
        />
      </main>
    </div>
  )
}
