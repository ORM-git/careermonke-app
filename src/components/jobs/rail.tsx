"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronDown, Lightbulb, Linkedin, Pencil, Plus, X } from "lucide-react";
import { MonkeAvatar } from "../ui";
import { PlanBadge } from "../shell";
import { toast } from "../toast";
import { KEYS } from "@/mocks/onboarding";
import type { SavedFilter } from "@/mocks/filters";
import { demoStore, subscribeDemo } from "@/lib/demo";

/* ---------- Checklist demo keys (the resume flow lives in resume-customize.tsx) ---------- */
export const CREDITS_TODAY = 2;
export const RESUME_DEMO_KEY = "cm_checklist_resume";
export const AUTOFILL_DEMO_KEY = "cm_checklist_autofill";

/* ---------- Right rail ---------- */

export function JobsRail({ saved, activeId, onSelect, onAdd, onEdit, onAutofill, onCustomize }: {
  saved: SavedFilter[]; activeId: string; onSelect: (id: string) => void; onAdd: () => void; onEdit: (id: string) => void; onAutofill: () => void; onCustomize: () => void;
}) {
  const [linkedin, setLinkedin] = useState(false);
  const [vote, setVote] = useState(false);
  useEffect(() => { setLinkedin(!demoStore.getItem(KEYS.linkedin)); }, []);
  // Each item completes only after its demo was actually run in this visit; Undo reverses it.
  const resumeDone = useSyncExternalStore(subscribeDemo, () => !!demoStore.getItem(RESUME_DEMO_KEY), () => false);
  const autofillDone = useSyncExternalStore(subscribeDemo, () => !!demoStore.getItem(AUTOFILL_DEMO_KEY), () => false);
  const done = [resumeDone, autofillDone];
  const pct = Math.round((done.filter(Boolean).length / done.length) * 100);
  const answer = (msg: string) => { setVote(true); toast(msg); };
  const Dot = ({ on }: { on: boolean }) => <span className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${on ? "border-accent bg-accent text-white" : "border-line"}`}>{on && "✓"}</span>;
  const Undo = ({ k }: { k: string }) => <button onClick={() => demoStore.removeItem(k)} className="mx-auto block text-xs underline">Mark as not done</button>;

  return (
    <aside className="space-y-5 lg:sticky lg:top-20">
      <PlanBadge />
      {linkedin && (
        <p className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-[13px]">
          <Linkedin className="h-4 w-4 shrink-0 rounded-sm bg-ink p-0.5 text-white" />
          <Link href="/profile" className="flex-1 truncate hover:underline">Add LinkedIn for smarter job matches</Link>
          <button aria-label="Dismiss" onClick={() => { demoStore.setItem(KEYS.linkedin, "1"); setLinkedin(false); }}><X className="h-4 w-4 text-neutral-500" /></button>
        </p>
      )}
      <div className="border-t border-line pt-4">
        <div className="flex items-center justify-between"><p className="font-semibold">Your Saved Filters</p><button aria-label="Add saved filter" title={saved.length >= 5 ? "Up to 5 saved filters" : undefined} disabled={saved.length >= 5} onClick={onAdd} className="disabled:opacity-40"><Plus className="h-5 w-5 rounded-full bg-ink p-0.5 text-white" /></button></div>
        <p className="mt-1 text-xs text-neutral-500">Multiple filters are a Pro feature, unlocked in this demo (up to 5).</p>
        {saved.length ? saved.map((s) => (
          <p key={s.id} className={`mt-3 flex items-center justify-between border-l-2 pl-3 text-sm ${s.id === activeId ? "border-ink font-medium" : "border-neutral-200 text-neutral-500"}`}>
            <button onClick={() => onSelect(s.id)} aria-pressed={s.id === activeId} className="truncate text-left">{s.filter.title}</button>
            <button aria-label={`Edit ${s.filter.title}`} onClick={() => onEdit(s.id)} className="rounded p-1 hover:bg-neutral-100"><Pencil className="h-4 w-4 text-neutral-500" /></button>
          </p>
        )) : <p className="mt-3 text-sm text-neutral-500">No saved filters.</p>}
      </div>
      <div className="rounded-2xl border-2 border-blue-200 bg-accent-tint p-1">
        <p className="flex items-center justify-center gap-2 py-2 text-sm font-semibold"><Lightbulb className="h-4 w-4" />Complete to Win 1v1 Private Coaching</p>
        <div className="space-y-2 rounded-xl bg-white p-3 text-sm">
          <div className="flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-neutral-100" role="progressbar" aria-label="Checklist progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-2 rounded-full bg-accent" style={{ width: `${pct}%` }} /></div><b className="text-lg">{pct}%</b></div>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2"><Dot on={resumeDone} /><span className="flex-1">1. Customize Your Resume</span><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
            <div className="ml-6 mt-1 space-y-2"><p className="text-xs text-neutral-600">Tailor your resume to any job and stand out to recruiters.</p><button onClick={onCustomize} className="pill-ghost w-full rounded-lg py-1.5">Try It Now</button>{resumeDone && <Undo k={RESUME_DEMO_KEY} />}</div>
          </details>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2"><Dot on={autofillDone} /><span className="flex-1">2. Enable Autofill Extension</span><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
            <div className="ml-6 mt-1 space-y-2">
              <p className="text-xs text-neutral-600">See a sample application autofill in one click (demo, no extension needed).</p>
              <button onClick={onAutofill} className="pill-ghost w-full rounded-lg py-1.5">Try the Autofill demo</button>
              {autofillDone && <Undo k={AUTOFILL_DEMO_KEY} />}
            </div>
          </details>
        </div>
      </div>
      {!vote && (
        <div className="card p-4">
          <p className="flex items-center gap-2 text-sm font-medium"><MonkeAvatar size={28} />Do you like the job matches so far?</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => answer("Thanks! We'll keep finding jobs like these.")} className="pill-accent py-1.5">Yes</button>
            <button onClick={() => answer("Got it. We'll tune your matches.")} className="pill-ghost py-1.5">No, not a good fit</button>
          </div>
        </div>
      )}
    </aside>
  );
}
