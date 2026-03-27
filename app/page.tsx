'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      // Get user role and redirect to appropriate dashboard
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const role = data?.role || 'client'

      if (role === 'admin') {
        router.replace('/admin/dashboard')
      } else if (role === 'receptionist') {
        router.replace('/receptionist/dashboard')
      } else {
        router.replace('/client/dashboard')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div id="main-content" className="min-h-dvh flex items-center justify-center bg-background" tabIndex={-1}>
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="size-16 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <img 
              src="/android-chrome-512x512.png" 
              alt="GymCoach Logo" 
              className="size-full object-cover"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">GymCoach</h1>
          <p className="text-muted-foreground">Cargando tu dashboard...</p>
        </div>
        <div className="flex justify-center gap-2" aria-hidden="true">
          <div className="size-2 rounded-full bg-primary animate-bounce motion-reduce:animate-none" style={{ animationDelay: '0ms' }} aria-hidden />
          <div className="size-2 rounded-full bg-primary animate-bounce motion-reduce:animate-none" style={{ animationDelay: '150ms' }} aria-hidden />
          <div className="size-2 rounded-full bg-primary animate-bounce motion-reduce:animate-none" style={{ animationDelay: '300ms' }} aria-hidden />
        </div>
      </div>
    </div>
  )
}
