"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Bot, BriefcaseBusiness, ChevronRight, FileText, Gift, HelpCircle, MessagesSquare, Search, Settings, Target, User, Zap } from "lucide-react";
import { Logo } from "./ui";
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
      {/* Mobile: bottom tab bar replaces the sidebar under 768px */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-line bg-white py-1.5 md:hidden">
        {nav.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-2 text-[10px] ${path.startsWith(href) ? "text-accent" : "text-neutral-500"}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />{label}
          </Link>
        ))}
        <button onClick={() => setSettingsOpen(true)} className="flex flex-col items-center gap-0.5 px-2 text-[10px] text-neutral-500"><Settings className="h-5 w-5" />More</button>
      </nav>
    </>
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
