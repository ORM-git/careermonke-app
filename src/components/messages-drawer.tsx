"use client";

import Link from "next/link";
import { Inbox, X } from "lucide-react";
import { useApp } from "./app-state";

export function MessagesDrawer() {
  const { messagesOpen, setMessagesOpen } = useApp();
  if (!messagesOpen) return null;
  const close = () => setMessagesOpen(false);
  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={close}>
      <aside role="dialog" aria-modal="true" aria-label="Messages" onClick={(e) => e.stopPropagation()} className="animate-pop absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <button onClick={close} aria-label="Close" className="rounded-full p-1.5 hover:bg-neutral-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-tint text-accent"><Inbox className="h-8 w-8" /></span>
          <p className="font-medium">No messages yet</p>
          <p className="text-sm text-neutral-500">Recruiter replies and important updates will show up here.</p>
          <Link href="/jobs" onClick={close} className="pill-accent mt-2">Browse Jobs</Link>
        </div>
      </aside>
    </div>
  );
}
