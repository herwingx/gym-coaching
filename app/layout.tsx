import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { PWASetup } from '@/components/pwa-setup'
import { PWAInstallCTA } from '@/components/pwa-install-cta'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans'
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: 'GymCoach | Gestiona tus asesorados y su progreso',
  manifest: '/manifest.json',
  keywords: ['coach', 'fitness', 'coaching', 'entrenamiento', 'rutinas', 'asesorados', 'progresion'],
  authors: [{ name: 'GymCoach' }],
  openGraph: {
    title: 'GymCoach - Gestiona tus asesorados y su progreso',
    description: 'La plataforma revolucionaria para seguimiento de fitness con IA',
    type: 'website',
    url: 'https://gymcoach.app',
    siteName: 'GymCoach',
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GymCoach',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GymCoach" />
        <meta name="msapplication-TileColor" content="#e5a84d" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#e5a84d" />
        <link rel="alternate" href="https://gymcoach.app" hrefLang="es" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-dvh`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <a
            href="#main-content"
            className="fixed left-4 z-100 -translate-y-[150%] px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium outline-none ring-2 ring-ring transition-transform duration-200 focus:translate-y-0 focus-visible:translate-y-0 top-[max(1rem,env(safe-area-inset-top))]"
          >
            Saltar al contenido principal
          </a>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              },
            }}
          />
          <PWASetup />
          <PWAInstallCTA />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
