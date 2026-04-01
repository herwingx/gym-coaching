"use client";

import dynamic from "next/dynamic";
import { ChatShellSkeleton } from "@/components/skeletons/chat-shell-skeleton";
import type { ChatViewProps } from "@/components/chat/chat-view";

const ChatViewDynamic = dynamic(
  () =>
    import("@/components/chat/chat-view").then((m) => ({ default: m.ChatView })),
  {
    ssr: true,
    loading: () => <ChatShellSkeleton role="admin" />,
  },
);

/**
 * Lazy loaded chat view with a specific skeleton for Admin/Client.
 * Provides a high-fidelity placeholder that matches the "UI/UX Pro Max" tokens.
 */
export function ChatViewLazy(props: ChatViewProps) {
  return (
    <div className="flex h-full w-full min-h-0 flex-1 flex-col overflow-hidden animate-in fade-in duration-500">
      <ChatViewDynamic {...props} />
    </div>
  );
}

