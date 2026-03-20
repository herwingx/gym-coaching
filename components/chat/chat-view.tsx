'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, markMessagesAsRead } from '@/app/actions/messages'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  MessageCircle,
  ArrowLeft,
  Send,
  Smile,
  Sparkles,
  Check,
  CheckCheck,
} from 'lucide-react'

const QUICK_MESSAGES = [
  { text: '¡Excelente sesión! 💪', emoji: '💪' },
  { text: 'Recuerda entrenar hoy 📅', emoji: '📅' },
  { text: '¡Buen progreso! 🔥', emoji: '🔥' },
  { text: '¡Vamos con todo! ⚡', emoji: '⚡' },
]

const EMOJI_PICKER = ['💪', '🔥', '⭐', '🎯', '👍', '❤️', '👏', '🙌', '💯', '✨']

interface Message {
  id: string
  from_user_id: string
  to_user_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface ChatViewProps {
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

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const today = now.toDateString() === d.toDateString()
  if (today) return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (yesterday.toDateString() === d.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export function ChatView({
  currentUserId,
  role,
  otherUser,
  conversations,
}: ChatViewProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    role === 'client' ? otherUser?.id ?? null : null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const peer = role === 'client'
    ? otherUser
    : conversations.find((c) => c.id === selectedUserId)
      ? {
          id: selectedUserId!,
          name: conversations.find((c) => c.id === selectedUserId)!.name,
          avatarUrl: conversations.find((c) => c.id === selectedUserId)?.avatarUrl,
        }
      : null

  useEffect(() => {
    if (role === 'admin' && conversations.length > 0 && !selectedUserId) {
      setSelectedUserId(conversations[0].id)
    } else if (role === 'client' && otherUser) {
      setSelectedUserId(otherUser.id)
    }
  }, [role, conversations, otherUser, selectedUserId])

  useEffect(() => {
    if (!selectedUserId) return

    const load = async () => {
      const { data: all } = await supabase
        .from('messages')
        .select('id, from_user_id, to_user_id, content, is_read, created_at')
        .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`)
        .order('created_at', { ascending: true })

      const filtered = (all || []).filter(
        (m: Message) =>
          (m.from_user_id === currentUserId && m.to_user_id === selectedUserId) ||
          (m.from_user_id === selectedUserId && m.to_user_id === currentUserId)
      )
      setMessages(filtered)
      markMessagesAsRead(selectedUserId)
    }

    load()

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as Message
          if (
            (m.from_user_id === currentUserId && m.to_user_id === selectedUserId) ||
            (m.from_user_id === selectedUserId && m.to_user_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, m])
            if (m.to_user_id === currentUserId) markMessagesAsRead(selectedUserId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedUserId, currentUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
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
    }
  }

  const handleQuickMessage = (text: string) => {
    setInput(text)
    setShowEmoji(false)
  }

  const addEmoji = (emo: string) => {
    setInput((prev) => prev + emo)
  }

  if (role === 'client' && !otherUser) return null

  return (
    <div className="flex flex-1 min-h-0">
      {role === 'admin' && conversations.length > 0 && (
        <aside
          className={cn(
            'w-full md:w-80 border-r flex flex-col bg-muted/30',
            selectedUserId && 'hidden md:flex'
          )}
        >
          <div className="p-4 border-b bg-background">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Mensajes
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedUserId(c.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left',
                  selectedUserId === c.id && 'bg-primary/10 border-l-2 border-primary'
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={c.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary-foreground">
                    {c.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {c.lastMessage || 'Sin mensajes'}
                  </div>
                </div>
                {c.unread > 0 && (
                  <span className="flex-shrink-0 size-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {peer ? (
          <>
            <header className="flex items-center gap-3 p-4 border-b bg-background shrink-0">
              {role === 'admin' && (
                <Button variant="ghost" size="icon" className="md:hidden" asChild>
                  <Link href="/admin/dashboard">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
              )}
              <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                <AvatarImage src={peer.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary/20 text-primary-foreground">
                  {peer.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold truncate">{peer.name}</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-success animate-pulse" aria-hidden />
                  En línea
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gradient-to-b from-background to-muted/20">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Inicia la conversación con tu coach
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Usa los mensajes rápidos para empezar
                  </p>
                </div>
              )}
              {messages.map((m) => {
                const isMe = m.from_user_id === currentUserId
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'flex',
                      isMe ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm',
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-card border rounded-bl-md'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {m.content}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-70">
                          {formatTime(m.created_at)}
                        </span>
                        {isMe && (
                          m.is_read ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-background flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Escribe un mensaje..."
                    className="pr-10 rounded-full border-2 focus-visible:ring-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-8 rounded-full"
                    onClick={() => setShowEmoji(!showEmoji)}
                  >
                    <Smile className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  className="rounded-full size-10 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {showEmoji && (
                <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-muted/50">
                  {EMOJI_PICKER.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => addEmoji(emo)}
                      className="text-xl hover:scale-125 transition-transform p-1"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {QUICK_MESSAGES.map((qm) => (
                  <Button
                    key={qm.text}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs h-8"
                    onClick={() => handleQuickMessage(qm.text)}
                  >
                    {qm.emoji} {qm.text.replace(qm.emoji, '').trim()}
                  </Button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">
              {role === 'admin' && conversations.length === 0
                ? 'No hay conversaciones aún'
                : 'Selecciona una conversación'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
