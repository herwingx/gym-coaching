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
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <div className="size-20 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 p-0.5 bg-gradient-to-br from-primary/20 to-transparent">
            <img 
              src="/android-chrome-512x512.png" 
              alt="RU Coach Logo" 
              className="size-full object-cover rounded-[22px]"
            />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col items-center">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent uppercase">
              RU Coach
            </h1>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.3em] mt-1">Rodrigo Urbina</span>
          </div>
          <p className="text-sm text-muted-foreground/80 font-medium italic">Cargando tu experiencia premium...</p>
        </div>
        <div className="flex justify-center gap-2.5" aria-hidden="true">
          <div className="size-1.5 rounded-full bg-primary/80 animate-bounce motion-reduce:animate-none" style={{ animationDelay: '0ms' }} aria-hidden />
          <div className="size-1.5 rounded-full bg-primary/80 animate-bounce motion-reduce:animate-none" style={{ animationDelay: '150ms' }} aria-hidden />
          <div className="size-1.5 rounded-full bg-primary/80 animate-bounce motion-reduce:animate-none" style={{ animationDelay: '300ms' }} aria-hidden />
        </div>
      </div>
    </div>
  )
}
