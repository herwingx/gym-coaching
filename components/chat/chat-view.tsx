'use client'

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, markMessagesAsRead } from '@/app/actions/messages'
import { CHAT_THREAD_MESSAGE_LIMIT } from '@/lib/performance-limits'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  MessageCircle,
  ChevronLeft,
  Send,
  Smile,
  Check,
  CheckCheck,
  Search,
  UsersRound,
  CalendarDays,
  Trophy,
  Dumbbell,
  Sparkles,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const EMOJI_PICKER = ['💪', '🔥', '⭐', '🎯', '👍', '❤️', '👏', '✨']

const QUICK_REPLIES = [
  { text: '¡Excelente sesión!', icon: Trophy },
  { text: '¿Cómo te fue el entreno?', icon: Dumbbell },
  { text: 'Recuerda hidratarte.', icon: Sparkles },
  { text: 'Avísame si algo duele al hacer el movimiento.', icon: MessageCircle },
] as const

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Message {
  id: string
  from_user_id: string
  to_user_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface ChatViewProps {
  currentUserId: string
  role: string
  otherUser: { id: string; name: string; avatarUrl?: string | null } | null
  conversations: {
    id: string
    name: string
    avatarUrl?: string | null
    lastMessage?: string
    lastAt?: string
    unread: number
  }[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (now.toDateString() === d.toDateString()) {
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }
  return (
    d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  )
}

function dayKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function formatDaySeparator(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (now.toDateString() === d.toDateString()) return 'Hoy'
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  if (y.toDateString() === d.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

type MessageRow =
  | { kind: 'sep'; key: string; label: string }
  | { kind: 'msg'; m: Message }

function buildMessageRows(messages: Message[]): MessageRow[] {
  const rows: MessageRow[] = []
  let lastKey = ''
  for (const m of messages) {
    const k = dayKey(m.created_at)
    if (k !== lastKey) {
      lastKey = k
      rows.push({ kind: 'sep', key: `sep-${k}`, label: formatDaySeparator(m.created_at) })
    }
    rows.push({ kind: 'msg', m })
  }
  return rows
}

/* ------------------------------------------------------------------ */
/*  Shared header fragment — logo or sidebar trigger                   */
/*  Matches AdminPageHeader / ClientStackPageHeader top-level pattern  */
/* ------------------------------------------------------------------ */

function PageHeaderLeadingIcon() {
  return (
    <div className="flex items-center md:hidden">
      <div className="size-11 rounded-xl overflow-hidden ring-1 ring-border/50 shadow-md shrink-0 bg-primary/10 flex items-center justify-center p-1.5">
        <img src="/android-chrome-192x192.png" alt="Logo" className="size-full object-contain" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Conversation row — sidebar item for admin inbox                    */
/* ------------------------------------------------------------------ */

const ConversationRow = memo(function ConversationRow({
  c,
  selected,
  onSelect,
}: {
  c: ChatViewProps['conversations'][number]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'flex w-full min-h-14 items-center gap-3 px-4 py-3 text-left transition-colors',
          'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          selected && 'bg-primary/10 border-l-[3px] border-l-primary',
          !selected && 'border-l-[3px] border-l-transparent',
        )}
      >
        <Avatar className="size-11 shrink-0">
          <AvatarImage src={c.avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-muted text-sm font-medium">
            {c.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{c.name}</span>
            {c.lastAt ? (
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                {formatTime(c.lastAt)}
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {c.lastMessage || 'Sin mensajes todavía'}
          </p>
        </div>
        {c.unread > 0 ? (
          <Badge className="shrink-0 tabular-nums" variant="default">
            {c.unread > 99 ? '99+' : c.unread}
          </Badge>
        ) : null}
      </button>
    </li>
  )
})

/* ------------------------------------------------------------------ */
/*  Message bubble                                                     */
/* ------------------------------------------------------------------ */

const MessageBubble = memo(function MessageBubble({
  message: m,
  isMe,
}: {
  message: Message
  isMe: boolean
}) {
  return (
    <div className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[min(85vw,28rem)] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[75%]',
          isMe
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md border border-border/80 bg-card text-card-foreground',
        )}
      >
        <p className="wrap-break-word whitespace-pre-wrap text-[15px] leading-relaxed sm:text-sm">
          {m.content}
        </p>
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1',
            isMe ? 'text-primary-foreground/80' : 'text-muted-foreground',
          )}
        >
          <time className="text-[10px] tabular-nums" dateTime={m.created_at}>
            {formatTime(m.created_at)}
          </time>
          {isMe ? (
            m.is_read ? (
              <CheckCheck className="size-3.5 shrink-0 opacity-90" aria-label="Leído" />
            ) : (
              <Check className="size-3.5 shrink-0 opacity-90" aria-label="Enviado" />
            )
          ) : null}
        </div>
      </div>
    </div>
  )
})

/* ------------------------------------------------------------------ */
/*  Empty‑chat inline hint                                             */
/* ------------------------------------------------------------------ */

function EmptyInlineHint({ role }: { role: string }) {
  const isClient = role === 'client'
  return (
    <>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Sparkles />
        </EmptyMedia>
        <EmptyTitle className="text-base">{isClient ? 'Primer mensaje' : 'Inicia el chat'}</EmptyTitle>
        <EmptyDescription>
          {isClient
            ? 'Escribe abajo o usa una respuesta rápida. Tu coach verá el mensaje al instante.'
            : 'Saluda a tu asesorado o envía un recordatorio desde las sugerencias.'}
        </EmptyDescription>
      </EmptyHeader>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Thread pane — messages + input (used by both admin and client)     */
/* ------------------------------------------------------------------ */

function ThreadPane({
  peer,
  currentUserId,
  role,
  isAdmin,
  messages,
  messagesLoading,
  messageRows,
  input,
  setInput,
  sending,
  handleSend,
  textareaRef,
  messagesEndRef,
  emojiOpen,
  setEmojiOpen,
  onBack,
}: {
  peer: { id: string; name: string; avatarUrl?: string | null }
  currentUserId: string
  role: string
  isAdmin: boolean
  messages: Message[]
  messagesLoading: boolean
  messageRows: MessageRow[]
  input: string
  setInput: (v: string | ((prev: string) => string)) => void
  sending: boolean
  handleSend: () => Promise<void>
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  emojiOpen: boolean
  setEmojiOpen: (v: boolean) => void
  onBack?: () => void
}) {
  return (
    <div className="flex w-full min-h-0 flex-1 flex-col relative overflow-hidden">
      {/* ─── Thread header ─── */}
      {/* Matches AdminPageHeader / ClientStackPageHeader structure:
          border-b + bg-background/80 + backdrop-blur + safe-area-header-pt
          Leading icon: back chevron (nested) or logo (top-level)
          Then avatar + peer info */}
      <header className="shrink-0 flex items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-xl safe-area-header-pt min-h-[76px] sm:min-h-[112px]">
        <div className="flex items-center gap-4 py-4 sm:py-0 px-4 sm:px-6 md:px-8 h-full w-full">
          {/* Leading icon */}
          <div className="shrink-0 flex items-center h-full">
            {isAdmin && onBack && (
              /* Admin mobile: back to inbox */
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-ml-3 size-10 sm:size-11 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300 md:hidden"
                onClick={onBack}
                aria-label="Volver a la lista de conversaciones"
              >
                <ChevronLeft className="size-6 sm:size-7" strokeWidth={2.5} />
              </Button>
            )}
          </div>

          {/* Peer info */}
          <Avatar className="size-10 shrink-0 ring-2 ring-primary/15 sm:size-11">
            <AvatarImage src={peer.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="text-sm font-medium">
              {peer.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h1 className="truncate text-base font-black tracking-tight sm:text-lg lg:text-xl">{peer.name}</h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 leading-none mt-1">
              {role === 'client' ? 'Tu coach' : 'Asesorado'}
            </p>
          </div>
        </div>
      </header>

      {/* ─── Messages area ─── */}
      <div
        className={cn(
          "flex-1 overflow-y-auto overscroll-contain bg-linear-to-b from-muted/15 to-background px-3 py-4 sm:px-4",
          (messagesLoading || messageRows.length === 0) && "flex flex-col justify-end"
        )}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messagesLoading ? (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className={cn(
                  'h-14 rounded-2xl',
                  i % 2 === 0 ? 'ms-8 w-[85%] sm:w-[70%]' : 'me-8 w-[80%] sm:w-[60%]',
                )}
              />
            ))}
          </div>
        ) : messageRows.length === 0 ? (
          <Empty className="flex-none border-0 bg-transparent py-8">
            <EmptyInlineHint role={role} />
          </Empty>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {messageRows.map((row) =>
              row.kind === 'sep' ? (
                <div key={row.key} className="flex items-center gap-3 py-2">
                  <Separator className="flex-1" />
                  <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <CalendarDays className="size-3.5" aria-hidden />
                    {row.label}
                  </span>
                  <Separator className="flex-1" />
                </div>
              ) : (
                <MessageBubble
                  key={row.m.id}
                  message={row.m}
                  isMe={row.m.from_user_id === currentUserId}
                />
              ),
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ─── Composer footer ─── */}
      <footer className="shrink-0 border-t border-border bg-background safe-area-pb">
        <div className="container">
          <div className="mx-auto flex max-w-2xl flex-col gap-3 py-3">
            {/* Quick replies */}
            <div
              className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5"
              aria-label="Respuestas rápidas"
            >
              {QUICK_REPLIES.map((qr) => (
                <Button
                  key={qr.text}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 rounded-full px-3 text-xs font-normal"
                  onClick={() => {
                    setInput(qr.text)
                    textareaRef.current?.focus()
                  }}
                >
                  <qr.icon data-icon="inline-start" />
                  {qr.text}
                </Button>
              ))}
            </div>

            {/* Text area + send */}
            <div className="flex items-end gap-2 pb-0.5">
              <div className="relative flex-1 min-w-0">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void handleSend()
                    }
                  }}
                  placeholder="Escribe un mensaje…"
                  rows={1}
                  className="max-h-[120px] min-h-11 w-full resize-none overflow-y-auto rounded-2xl pr-12 text-base scrollbar-hide sm:text-sm"
                  aria-label="Mensaje"
                />
                <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-1.5 right-1.5 size-9 rounded-xl"
                      aria-label="Insertar emoji"
                    >
                      <Smile />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="end" side="top">
                    <div className="grid max-w-[240px] grid-cols-5 gap-1">
                      {EMOJI_PICKER.map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          className="rounded-md p-2 text-lg leading-none transition-colors hover:bg-muted"
                          onClick={() => {
                            setInput((prev: string) => prev + emo)
                            setEmojiOpen(false)
                            textareaRef.current?.focus()
                          }}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                type="button"
                size="icon"
                className="mb-0.5 size-11 shrink-0 rounded-2xl shadow-sm active:scale-95 transition-all"
                onClick={() => void handleSend()}
                disabled={!input.trim() || sending}
                aria-label="Enviar"
              >
                {sending ? <Spinner className="size-5" /> : <Send />}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main ChatView component                                            */
/* ------------------------------------------------------------------ */

export function ChatView({
  currentUserId,
  role,
  otherUser,
  conversations,
}: ChatViewProps) {
  const supabase = useRef(createClient()).current
  const isAdmin = role === 'admin'
  const [selectedUserId, setSelectedUserId] = useState<string | null>(() =>
    role === 'client' ? otherUser?.id ?? null : null,
  )
  const [adminMobilePane, setAdminMobilePane] = useState<'inbox' | 'thread'>('inbox')
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [inboxQuery, setInboxQuery] = useState('')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isAdmin || conversations.length === 0) return
    setSelectedUserId((prev) => prev ?? conversations[0].id)
  }, [isAdmin, conversations])

  useEffect(() => {
    if (role === 'client' && otherUser) {
      setSelectedUserId(otherUser.id)
    }
  }, [role, otherUser?.id])

  const filteredConversations = useMemo(() => {
    const q = inboxQuery.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.lastMessage ?? '').toLowerCase().includes(q),
    )
  }, [conversations, inboxQuery])

  const peer =
    role === 'client'
      ? otherUser
      : selectedUserId
        ? {
            id: selectedUserId,
            name: conversations.find((c) => c.id === selectedUserId)?.name ?? 'Cliente',
            avatarUrl: conversations.find((c) => c.id === selectedUserId)?.avatarUrl,
          }
        : null

  const scrollToEnd = useCallback(() => {
    const el = messagesEndRef.current
    if (!el) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  useEffect(() => {
    if (!selectedUserId) return

    let cancelled = false
    setMessagesLoading(true)
    setMessages([])

    const load = async () => {
      const pairFilter = `and(from_user_id.eq.${currentUserId},to_user_id.eq.${selectedUserId}),and(from_user_id.eq.${selectedUserId},to_user_id.eq.${currentUserId})`
      const { data: rows } = await supabase
        .from('messages')
        .select('id, from_user_id, to_user_id, content, is_read, created_at')
        .or(pairFilter)
        .order('created_at', { ascending: false })
        .limit(CHAT_THREAD_MESSAGE_LIMIT)

      if (cancelled) return

      const chronological = [...(rows ?? [])].reverse()
      setMessages(chronological)
      setMessagesLoading(false)
      markMessagesAsRead(selectedUserId)
    }

    void load()

    const chanId = `messages:${currentUserId}:${selectedUserId}`
    const channel = supabase
      .channel(chanId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as Message
          if (
            (m.from_user_id === currentUserId && m.to_user_id === selectedUserId) ||
            (m.from_user_id === selectedUserId && m.to_user_id === currentUserId)
          ) {
            setMessages((prev) => {
              if (prev.some((x) => x.id === m.id)) return prev
              const next = [...prev, m]
              return next.length > CHAT_THREAD_MESSAGE_LIMIT
                ? next.slice(-CHAT_THREAD_MESSAGE_LIMIT)
                : next
            })
            if (m.to_user_id === currentUserId) void markMessagesAsRead(selectedUserId)
          }
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [selectedUserId, currentUserId])

  useEffect(() => {
    if (messagesLoading) return
    const id = requestAnimationFrame(() => scrollToEnd())
    return () => cancelAnimationFrame(id)
  }, [messages.length, messagesLoading, scrollToEnd])

  const handleSelectConversation = useCallback((id: string) => {
    setSelectedUserId(id)
    setAdminMobilePane('thread')
  }, [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || !selectedUserId || sending) return
    setSending(true)
    setInput('')
    try {
      await sendMessage(selectedUserId, text)
    } catch {
      setInput(text)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }, [input, selectedUserId, sending])

  const messageRows = useMemo(() => buildMessageRows(messages), [messages])

  /* ── Client with no coach ── */
  if (role === 'client' && !otherUser) return null

  /* ── Admin with zero conversations ── */
  if (isAdmin && conversations.length === 0) {
    return (
      <div className="flex h-full w-full min-h-0 flex-1 flex-col relative overflow-hidden">
        {/* Consistent AdminPageHeader-style header */}
        <header className="shrink-0 border-b border-border bg-background/80 backdrop-blur-md safe-area-header-pt">
          <div className="container flex items-center gap-3 py-3 sm:py-4">
            <div className="shrink-0">
              <PageHeaderLeadingIcon />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-xl font-black tracking-tight text-pretty sm:text-2xl text-foreground leading-tight">Mensajes</h1>
            </div>
          </div>
        </header>
        <Empty className="flex-1 border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersRound />
            </EmptyMedia>
            <EmptyTitle>Aún no hay conversaciones</EmptyTitle>
            <EmptyDescription>
              Cuando tus asesorados tengan cuenta vinculada aparecerán aquí para chatear en vivo.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant="secondary">
              <Link href="/admin/clients">Gestionar asesorados</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  /* ── Client chat (single thread — no inbox) ── */
  if (!isAdmin && peer) {
    return (
      <div className="flex h-full w-full min-h-0 flex-1 flex-col bg-background">
        <ThreadPane
          peer={peer}
          currentUserId={currentUserId}
          role={role}
          isAdmin={false}
          messages={messages}
          messagesLoading={messagesLoading}
          messageRows={messageRows}
          input={input}
          setInput={setInput}
          sending={sending}
          handleSend={handleSend}
          textareaRef={textareaRef}
          messagesEndRef={messagesEndRef}
          emojiOpen={emojiOpen}
          setEmojiOpen={setEmojiOpen}
        />
      </div>
    )
  }

  /* ── Admin layout: inbox sidebar + thread pane ── */
  return (
    <div className="flex h-full w-full min-h-0 flex-1 bg-background">
      {/* ─── Inbox sidebar ─── */}
      <aside
        className={cn(
          'flex min-h-0 w-full flex-col border-r border-border bg-muted/20 md:w-[min(100%,20rem)] md:shrink-0',
          adminMobilePane === 'thread' && 'hidden md:flex',
        )}
        aria-label="Lista de conversaciones"
      >
        {/* Inbox header — matches AdminPageHeader structure */}
        <header className="shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-xl safe-area-header-pt min-h-[76px] sm:min-h-[112px] flex flex-col justify-center">
          <div className="flex flex-col gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <PageHeaderLeadingIcon />
              </div>
              <h1 className="text-xl font-black tracking-tight text-pretty sm:text-2xl text-foreground leading-tight">
                Mensajes
              </h1>
            </div>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={inboxQuery}
                onChange={(e) => setInboxQuery(e.target.value)}
                placeholder="Buscar asesorado…"
                className="h-10 pl-9"
                aria-label="Buscar conversación"
              />
            </div>
          </div>
        </header>
        <ul className="flex-1 overflow-y-auto overscroll-contain" role="list">
          {filteredConversations.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No coincide con tu búsqueda.
            </li>
          ) : (
            filteredConversations.map((c) => (
              <ConversationRow
                key={c.id}
                c={c}
                selected={selectedUserId === c.id}
                onSelect={() => handleSelectConversation(c.id)}
              />
            ))
          )}
        </ul>
      </aside>

      {/* ─── Thread pane ─── */}
      <section
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col',
          isAdmin && adminMobilePane === 'inbox' && 'hidden md:flex',
        )}
        aria-label={peer ? `Chat con ${peer.name}` : 'Selecciona conversación'}
      >
        {peer ? (
          <ThreadPane
            peer={peer}
            currentUserId={currentUserId}
            role={role}
            isAdmin={true}
            messages={messages}
            messagesLoading={messagesLoading}
            messageRows={messageRows}
            input={input}
            setInput={setInput}
            sending={sending}
            handleSend={handleSend}
            textareaRef={textareaRef}
            messagesEndRef={messagesEndRef}
            emojiOpen={emojiOpen}
            setEmojiOpen={setEmojiOpen}
            onBack={() => setAdminMobilePane('inbox')}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {isAdmin ? 'Selecciona un asesorado para ver el chat.' : null}
          </div>
        )}
      </section>
    </div>
  )
}
