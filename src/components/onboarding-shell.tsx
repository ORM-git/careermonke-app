"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CircleHelp } from "lucide-react";
import { MonkeAvatar } from "./ui";
import { demoStore } from "@/lib/demo";

// Phone layout (< md): copilot header, the question as a chat bubble, answers in a scrollable card and a fixed,
// safe-area-aware action bar. Every phone-only class is reset at md, so the desktop split layout is unchanged.
export function OnboardingShell({ headline, children, footer, onBack, step }: {
  headline: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  onBack?: () => void;
  step?: { current: number; total: number };
}) {
  const router = useRouter();
  const logout = () => { demoStore.removeItem("cm-session"); router.push("/signin"); };
  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#F1F5FB] md:min-h-screen md:flex-row md:bg-transparent">
      <section className="flex items-center px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] md:w-1/2 md:bg-gradient-to-br md:from-[#EFF6FF] md:via-[#DBEAFE] md:to-[#E0F2FE] md:px-24 md:py-10">
        <div className="w-full">
          <div className="flex items-center gap-2.5">
            <MonkeAvatar />
            <p className="leading-tight"><b className="text-lg font-semibold">Monke</b><br /><span className="text-[13px]">Your CareerMonke AI Copilot</span></p>
            <button onClick={logout} className="ml-auto min-h-11 rounded-full border border-line bg-white px-3 text-sm md:hidden">Logout</button>
          </div>
          <h1 className="mt-3 max-w-md rounded-2xl bg-white px-4 py-3 text-[17px] leading-snug shadow-sm md:mt-8 md:rounded-none md:bg-transparent md:p-0 md:text-[34px] md:shadow-none">{headline}</h1>
        </div>
      </section>
      <section className="relative flex flex-1 flex-col px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:px-12 md:pb-8 md:pt-16">
        <button onClick={logout} className="absolute right-4 top-4 hidden rounded-full border border-line px-3 py-1.5 text-sm hover:bg-neutral-50 md:block">Logout</button>
        <div className="mx-auto w-full max-w-xl flex-1 rounded-2xl bg-white p-4 md:rounded-none md:bg-transparent md:p-0">{children}</div>
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] md:static md:mx-auto md:mt-10 md:w-full md:max-w-xl md:border-0 md:bg-transparent md:pb-0">
          {step && (
            <div className="h-1 bg-neutral-100 md:hidden" aria-hidden="true">
              <div className="h-1 bg-accent" style={{ width: `${(step.current / step.total) * 100}%` }} />
            </div>
          )}
          <div className="relative flex items-center justify-center px-4 pt-3 md:p-0">
            {onBack && (
              <button onClick={onBack} aria-label="Back" className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-neutral-100 md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            {footer}
          </div>
        </div>
      </section>
    </main>
  );
}

export function CheckCard({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors duration-150 md:min-h-0 ${checked ? "border-accent bg-accent-tint" : "border-transparent bg-neutral-50 hover:bg-neutral-100"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300 ${checked ? "border-accent bg-accent" : "border-neutral-300 bg-white"}`}>
        {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </span>
      {label}
      {hint && <span title={hint} aria-label={hint} className="text-neutral-500"><CircleHelp className="h-4 w-4" /></span>}
    </label>
  );
}

export function Req({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <p className="mb-2 flex items-center gap-1 font-semibold">
      {!hint && <span className="text-red-500">*</span>}{children}
      {hint && <span title={hint} aria-label={hint} className="font-normal text-neutral-500"><CircleHelp className="h-4 w-4" /></span>}
    </p>
  );
}
