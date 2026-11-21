"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppStateProvider } from "@/components/app-state";
import { Sidebar } from "@/components/shell";
import { SettingsModal } from "@/components/settings-modal";
import { MessagesDrawer } from "@/components/messages-drawer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  // shortcut: mock session flag in localStorage, swap for real auth middleware when wired to Supabase
  useEffect(() => {
    if (localStorage.getItem("cm-session")) setOk(true);
    else router.replace("/signin");
  }, [router]);
  if (!ok) return null;
  return (
    <AppStateProvider>
      <Sidebar />
      <div className="min-h-screen bg-neutral-50 pb-16 md:ml-56 md:pb-0">{children}</div>
      <SettingsModal />
      <MessagesDrawer />
    </AppStateProvider>
  );
}
