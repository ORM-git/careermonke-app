"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { demoStore } from "@/lib/demo";

export type AppStatus = "Applied" | "Interviewing" | "Offer Received" | "Rejected" | "Archived";
type Applied = { id: string; status: AppStatus; date: string; sample?: boolean };
type External = { url: string; title: string; date: string };

type State = {
  liked: string[]; applied: Applied[]; external: External[]; hidden: string[];
  toggleLike: (id: string) => void; apply: (id: string) => void; addExternal: (url: string) => void;
  hide: (id: string) => void; setStatus: (id: string, s: AppStatus) => void;
  settingsOpen: boolean; setSettingsOpen: (v: boolean) => void;
  messagesOpen: boolean; setMessagesOpen: (v: boolean) => void;
};

const Ctx = createContext<State | null>(null);
export const useApp = () => useContext(Ctx)!;

// Visit-scoped mock state (lib/demo.ts): a reload starts the walkthrough fresh.
const KEY = "cm-dummy-state";
// Each visit starts with one labelled sample application so tracker stages can be tried right away.
export const SEEDED_APPLICATION: Applied = { id: "2", status: "Interviewing", date: "18 Nov", sample: true };
const fresh = () => ({ liked: [] as string[], applied: [SEEDED_APPLICATION], external: [] as External[], hidden: [] as string[] });
const today = () => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<{ liked: string[]; applied: Applied[]; external: External[]; hidden: string[] }>(fresh);
  const [loaded, setLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);

  useEffect(() => {
    try { const s = demoStore.getItem(KEY); if (s) setData({ hidden: [], ...JSON.parse(s) }); } catch { /* corrupt mock state: start fresh */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) demoStore.setItem(KEY, JSON.stringify(data)); }, [data, loaded]);

  const value: State = {
    ...data,
    toggleLike: (id) => setData((d) => ({ ...d, liked: d.liked.includes(id) ? d.liked.filter((x) => x !== id) : [...d.liked, id] })),
    apply: (id) => setData((d) => (d.applied.some((a) => a.id === id) ? d : { ...d, applied: [...d.applied, { id, status: "Applied", date: today() }] })),
    hide: (id) => setData((d) => ({ ...d, hidden: [...new Set([...d.hidden, id])] })),
    setStatus: (id, status) => setData((d) => ({ ...d, applied: d.applied.map((a) => (a.id === id ? { ...a, status } : a)) })),
    addExternal: (url) => {
      let title = url;
      try { const u = new URL(url); title = `${u.hostname.replace(/^www\./, "")} · ${u.pathname.split("/").filter(Boolean).pop()?.replace(/[-_]/g, " ") || "Job posting"}`; } catch { /* keep raw text */ }
      setData((d) => ({ ...d, external: [{ url, title, date: today() }, ...d.external] }));
    },
    settingsOpen, setSettingsOpen, messagesOpen, setMessagesOpen,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
