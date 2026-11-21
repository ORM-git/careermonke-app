"use client";

import { useRouter } from "next/navigation";
import { Check, CircleHelp } from "lucide-react";
import { MonkeAvatar } from "./ui";
import { demoStore } from "@/lib/demo";

export function OnboardingShell({ headline, children, footer }: { headline: React.ReactNode; children: React.ReactNode; footer: React.ReactNode }) {
  const router = useRouter();
  const logout = () => { demoStore.removeItem("cm-session"); router.push("/signin"); };
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <section className="flex items-center bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#E0F2FE] px-6 py-10 md:w-1/2 md:px-24">
        <div>
          <div className="flex items-center gap-2.5">
            <MonkeAvatar />
            <p className="leading-tight"><b className="text-lg font-semibold">Monke</b><br /><span className="text-[13px]">Your CareerMonke AI Copilot</span></p>
          </div>
          <h1 className="mt-8 max-w-md text-[28px] leading-snug md:text-[34px]">{headline}</h1>
        </div>
      </section>
      <section className="relative flex flex-1 flex-col px-6 pb-8 pt-16 md:px-12">
        <button onClick={logout} className="absolute right-4 top-4 rounded-full border border-line px-3 py-1.5 text-sm hover:bg-neutral-50">Logout</button>
        <div className="mx-auto w-full max-w-xl flex-1">{children}</div>
        <div className="mx-auto mt-10 flex w-full max-w-xl justify-center">{footer}</div>
      </section>
    </main>
  );
}

export function CheckCard({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors duration-150 ${checked ? "border-accent bg-accent-tint" : "border-transparent bg-neutral-50 hover:bg-neutral-100"}`}>
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
