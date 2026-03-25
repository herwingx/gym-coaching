'use client'

import dynamic from 'next/dynamic'
import { Spinner } from '@/components/ui/spinner'
import type { ChatViewProps } from '@/components/chat/chat-view'

const ChatViewDynamic = dynamic(
  () => import('@/components/chat/chat-view').then((m) => ({ default: m.ChatView })),
  {
    ssr: true,
    loading: () => (
      <div
        className="flex min-h-[50dvh] flex-1 flex-col items-center justify-center gap-3 bg-background text-muted-foreground"
        aria-busy="true"
        aria-label="Cargando chat"
      >
        <Spinner className="size-8" />
        <span className="text-sm">Cargando mensajes…</span>
      </div>
    ),
  },
)

export function ChatViewLazy(props: ChatViewProps) {
  return <ChatViewDynamic {...props} />
}
