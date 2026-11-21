"use client";

import { AppStateProvider } from "@/components/app-state";
import { Sidebar } from "@/components/shell";
import { SettingsModal } from "@/components/settings-modal";
import { MessagesDrawer } from "@/components/messages-drawer";
import { useDemoGate } from "@/components/demo-gate";
import { GuideBar } from "@/components/guide";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // shortcut: visit-scoped demo session (lib/demo.ts), swap for real auth middleware when wired to Supabase
  const ok = useDemoGate();
  if (!ok) return null;
  return (
    <AppStateProvider>
      <Sidebar />
      <div className="min-h-screen bg-neutral-50 pb-16 md:ml-56 md:pb-0">{children}</div>
      <SettingsModal />
      <MessagesDrawer />
      <GuideBar />
    </AppStateProvider>
  );
}
