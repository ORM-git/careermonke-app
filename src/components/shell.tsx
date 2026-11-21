"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Bot, BriefcaseBusiness, ChevronRight, FileText, Gift, HelpCircle, MessagesSquare, MoreHorizontal, Search, Settings, Target, User, X, Zap } from "lucide-react";
import { Logo, useFocusTrap } from "./ui";
import { useApp } from "./app-state";
import { RestartDemoButton } from "./demo-gate";
import { toast } from "./toast";
import { user } from "@/mocks/user";

const nav = [
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/explore", label: "Explore", icon: Search, beta: true },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/agent", label: "Agent", icon: Bot },
  { href: "/coaching", label: "Coaching", icon: Target },
  { href: "/interview", label: "Interview", icon: MessagesSquare },
];

export function Sidebar() {
  const path = usePathname();
  const { setMessagesOpen, setSettingsOpen } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreOn = nav.slice(5).some(({ href }) => path.startsWith(href));
  useEffect(() => setMoreOpen(false), [path]);
  const item = "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[14px] transition-colors";
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-line bg-white px-4 py-4 md:flex">
        <Link href="/jobs" className="mb-6 px-1"><Logo /></Link>
        <nav className="flex flex-col gap-1">
          {nav.map(({ href, label, icon: Icon, beta }) => {
            const on = path.startsWith(href);
            return (
              <Link key={href} href={href} className={`${item} ${on ? "bg-accent-tint font-medium text-accent" : "hover:bg-neutral-50"}`}>
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" /> {label}
                {beta && <span className="rounded bg-ink px-1 text-[9px] font-bold text-white">Beta</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <div className="mb-3 rounded-xl bg-accent-tint p-3">
            <p className="flex items-center justify-between border-b border-blue-100 pb-2 text-[13px] font-semibold"><span className="flex items-center gap-2"><Gift className="h-4 w-4" />Refer &amp; Earn</span><ChevronRight className="h-4 w-4" /></p>
            <p className="pt-2 text-xs text-neutral-700">Invite friends to CareerMonke and get <b>1 week of Pro</b> free.</p>
          </div>
          <button onClick={() => setMessagesOpen(true)} className={`${item} hover:bg-neutral-50`}><Bell className="h-[18px] w-[18px]" />Messages</button>
          <button onClick={() => toast("Demo: feedback isn't sent anywhere.")} className={`${item} hover:bg-neutral-50`}><HelpCircle className="h-[18px] w-[18px]" />Feedback</button>
          <button onClick={() => setSettingsOpen(true)} className={`${item} hover:bg-neutral-50`}><Settings className="h-[18px] w-[18px]" />Settings</button>
          <RestartDemoButton className={`${item} text-accent hover:bg-accent-tint`} />
        </div>
      </aside>
      {/* Mobile: bottom tab bar replaces the sidebar under 768px; More opens every remaining destination. */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {nav.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const on = path.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 text-[11px] ${on ? "font-semibold text-accent" : "text-neutral-500"}`}>
              <Icon className="h-5 w-5" aria-hidden="true" /><span className="max-w-full truncate px-0.5">{label}</span>
            </Link>
          );
        })}
        <button onClick={() => setMoreOpen(true)} aria-haspopup="dialog" aria-expanded={moreOpen}
          className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] ${moreOn ? "font-semibold text-accent" : "text-neutral-500"}`}>
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />More
        </button>
      </nav>
      {moreOpen && <MoreSheet path={path} onClose={() => setMoreOpen(false)} onMessages={() => setMessagesOpen(true)} onSettings={() => setSettingsOpen(true)} />}
    </>
  );
}

function MoreSheet({ path, onClose, onMessages, onSettings }: { path: string; onClose: () => void; onMessages: () => void; onSettings: () => void }) {
  const trap = useFocusTrap<HTMLDivElement>(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const row = "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-[15px]";
  const act = (fn: () => void) => () => { onClose(); fn(); };
  return (
    <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={onClose}>
      <div ref={trap} role="dialog" aria-modal="true" aria-label="More" onClick={(e) => e.stopPropagation()}
        className="animate-pop absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-center justify-between px-3 py-1">
          <p className="font-semibold">More</p>
          <button onClick={onClose} aria-label="Close menu" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-neutral-100"><X className="h-5 w-5" /></button>
        </div>
        <nav aria-label="More destinations" className="flex flex-col gap-1">
          {nav.slice(5).map(({ href, label, icon: Icon }) => {
            const on = path.startsWith(href);
            return (
              <Link key={href} href={href} onClick={onClose} aria-current={on ? "page" : undefined} className={`${row} ${on ? "bg-accent-tint font-semibold text-accent" : "hover:bg-neutral-50"}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-2 flex flex-col gap-1 border-t border-line pt-2">
          <button onClick={act(onMessages)} className={`${row} hover:bg-neutral-50`}><Bell className="h-5 w-5" />Messages</button>
          <button onClick={act(() => toast("Demo: feedback isn't sent anywhere."))} className={`${row} hover:bg-neutral-50`}><HelpCircle className="h-5 w-5" />Feedback</button>
          <button onClick={act(onSettings)} className={`${row} hover:bg-neutral-50`}><Settings className="h-5 w-5" />Settings</button>
          <RestartDemoButton className={`${row} text-accent hover:bg-accent-tint`} />
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, children, right }: { title: string; children?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-white px-4 md:px-6">
      <h1 className="text-[24px] font-extrabold tracking-tight">{title}</h1>
      {children && <><ChevronRight className="h-4 w-4 shrink-0" />{children}</>}
      <div className="ml-auto flex items-center gap-3">
        {right ?? (
          <Link href="/pricing" className="hidden items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-accent-hover sm:flex">
            <Zap className="h-4 w-4 fill-current" /> CareerMonke Pro for Students <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </header>
  );
}

export function PlanBadge() {
  return (
    <div className="flex items-center justify-between">
      <p className="flex items-center gap-2 font-semibold"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-xs">{user.name[0]}</span>Hi, {user.name.split(" ")[0]}</p>
      <Link href="/pricing" className="rounded-full bg-accent-tint px-2.5 py-1 text-xs font-semibold text-accent">{user.plan === "FREE" ? "Free Plan" : "Pro"}</Link>
    </div>
  );
}
