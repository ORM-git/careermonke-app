"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CircleCheck, CircleX, CircleAlert, ChevronDown, Lightbulb, Linkedin, Pencil, Plus, Sparkles, ThumbsUp, X, Zap } from "lucide-react";
import { Confirm, Drawer, Modal, MonkeAvatar } from "../ui";
import { PlanBadge } from "../shell";
import { toast } from "../toast";
import { CompanyLogo } from "../ui";
import { readProfile } from "@/mocks/profile";
import { KEYS } from "@/mocks/onboarding";
import type { Job } from "@/mocks/jobs";
import type { SavedFilter } from "@/mocks/filters";
import { demoStore, subscribeDemo } from "@/lib/demo";

/* ---------- Resume comparison (step 1 only; later steps were not observed and are not built) ---------- */
export const CREDITS_TODAY = 2;

export function ResumeCompare({ job, onClose }: { job: Job; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const skills = readProfile().skills.map((s) => s.toLowerCase());
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1500); return () => clearTimeout(t); }, []);
  const matched = job.skills.filter((s) => skills.includes(s.toLowerCase()));
  const score = Math.round((2 + (8 * matched.length) / job.skills.length) * 10) / 10;
  const rating = score < 6 ? "Poor" : score < 8 ? "Fair" : "Good";
  const resumeTitle = readProfile().work[0]?.title ?? "—";
  const titleOk = job.title.toLowerCase().includes(resumeTitle.toLowerCase());
  const Mark = ({ ok, warn }: { ok: boolean; warn?: boolean }) => ok ? <CircleCheck className="h-6 w-6 fill-green-500 text-white" aria-label="Match" /> : warn ? <CircleAlert className="h-6 w-6 fill-amber-400 text-white" aria-label="Partial" /> : <CircleX className="h-6 w-6 fill-red-500 text-white" aria-label="Gap" />;
  const steps = ["See Your Difference", "Align Your Resume", "Review Your New Resume"];

  return (
    <Drawer open label="Generate your custom resume" onClose={onClose} width="max-w-[1100px]"
      title={<span className="flex items-center gap-2">Generate Your Custom Resume <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-white">{CREDITS_TODAY} credits available today</span></span>}
      header={(
        <ol className="flex items-center justify-center gap-3 py-3 text-sm" aria-label="Steps">
          {steps.map((s, i) => (
            <li key={s} aria-current={i === stage ? "step" : undefined} className={`flex items-center gap-2 ${i <= stage ? "font-medium" : "text-neutral-400"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${i <= stage ? "bg-accent" : "bg-neutral-400"}`}>{i + 1}</span>{s}{i < 2 && <span className="ml-1 h-px w-10 bg-neutral-200" />}
            </li>
          ))}
        </ol>
      )}>
      {loading ? (
        <div className="mx-auto mt-16 max-w-md rounded-2xl border border-line p-10 text-center" role="status">
          <Sparkles className="mx-auto h-8 w-8 text-accent" />
          <div className="mx-auto mt-6 h-0.5 w-48 overflow-hidden bg-neutral-100"><div className="h-0.5 w-1/2 animate-pulse bg-ink" /></div>
          <p className="mt-6 font-semibold">Analyzing Your Resume...</p>
          <p className="mt-3 text-sm text-neutral-600">Please keep this window open. This usually takes a few seconds.</p>
        </div>
      ) : stage > 0 ? (
        <SimulatedTailor job={job} stage={stage} missing={job.skills.filter((x) => !matched.includes(x))} picked={picked} setPicked={setPicked}
          onBack={() => setStage(stage - 1)} onNext={() => { setStage(2); demoStore.setItem(RESUME_DEMO_KEY, "1"); }} onClose={onClose} />
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="card overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 p-6">
                <div>
                  <h2 className="text-2xl font-semibold">Your Resume is a {rating === "Good" ? "Strong" : rating === "Fair" ? "Fair" : "Low"} Match for This Job</h2>
                  {score < 6 && <p className="mt-2 inline-block rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700">Resumes under 6.0 often get filtered out by applicant tracking systems. We can help fix that.</p>}
                </div>
                <div className="text-center"><p className="text-4xl font-semibold">{score.toFixed(1)}</p><p className="rounded bg-neutral-100 px-3 text-sm font-medium">{rating}</p></div>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-line border-t border-line">
                  <tr><th className="w-48 p-4 text-left font-medium">Overview</th><td className="p-4"><span className="flex items-center gap-2"><CompanyLogo initials={job.initials} color={job.color} size={28} /><span><small className="block text-neutral-500">{job.company}</small><b>{job.title}</b></span></span></td><td className="p-4"><small className="block text-neutral-500">Your resume</small><b>Primary resume</b> <Link href="/resume" className="ml-2 text-xs text-accent underline">Switch resume</Link></td></tr>
                  <tr><th className="p-4 text-left font-medium"><span className="flex items-center justify-between">Job Title<Mark ok={titleOk} /></span></th><td className="p-4">{job.title}</td><td className="p-4">{resumeTitle}</td></tr>
                  <tr><th className="p-4 text-left font-medium"><span className="flex items-center justify-between">Years of Experience<Mark ok={false} warn /></span></th><td className="p-4">{job.exp}</td><td className="p-4">From your work history</td></tr>
                  <tr><th className="p-4 text-left font-medium"><span className="flex items-center justify-between">Industry Experience<Mark ok={false} warn /></span></th><td className="p-4" colSpan={2}><span className="rounded bg-neutral-100 px-2 py-1">{job.industryName}</span></td></tr>
                  <tr><th className="p-4 text-left font-medium"><span className="flex items-center justify-between">Job Keywords ({matched.length}/{job.skills.length})<Mark ok={matched.length / job.skills.length >= 0.6} /></span></th>
                    <td className="p-4" colSpan={2}><span className="flex flex-wrap gap-1.5">{job.skills.map((s) => matched.includes(s) ? <span key={s} className="flex items-center gap-1 rounded bg-accent-tint px-2 py-1 text-accent"><ThumbsUp className="h-3.5 w-3.5" />{s}</span> : <span key={s} className="rounded bg-neutral-100 px-2 py-1">{s}</span>)}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-center border-t border-line p-4"><button onClick={() => setStage(1)} className="pill-accent px-8 py-3">Improve My Resume for This Job</button></div>
        </div>
      )}
    </Drawer>
  );
}

export const RESUME_DEMO_KEY = "cm_checklist_resume";
export const AUTOFILL_DEMO_KEY = "cm_checklist_autofill";

function SimulatedTailor({ job, stage, missing, picked, setPicked, onBack, onNext, onClose }: {
  job: Job; stage: number; missing: string[]; picked: string[]; setPicked: (v: string[]) => void; onBack: () => void; onNext: () => void; onClose: () => void;
}) {
  const p = readProfile();
  const banner = <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Simulated demo output. No credits were used and nothing was generated by AI.</p>;
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {banner}
        {stage === 1 ? (
          <div className="card space-y-3 p-6">
            <h2 className="text-xl font-semibold">Align your resume with {job.title}</h2>
            <p className="text-sm text-neutral-600">Pick the job keywords you can honestly back up. Only those are added.</p>
            {missing.length ? missing.map((k) => (
              <label key={k} className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                <input type="checkbox" checked={picked.includes(k)} onChange={(e) => setPicked(e.target.checked ? [...picked, k] : picked.filter((x) => x !== k))} className="h-4 w-4 accent-[#2563EB]" />I have experience with {k}
              </label>
            )) : <p className="text-sm">Your profile already covers every keyword for this job.</p>}
          </div>
        ) : (
          <div className="card space-y-3 p-6 font-mono text-sm">
            <p className="font-sans text-xl font-semibold">Sample tailored resume</p>
            <p><b>{p.personal.first} {p.personal.last}</b> · {p.personal.city}</p>
            <p><b>SUMMARY</b><br />{p.work[0]?.title ?? "Professional"} focused on {job.industryName.toLowerCase()} work, applying for {job.title} at {job.company}.</p>
            <p><b>SKILLS</b><br />{[...new Set([...p.skills, ...picked])].join(" · ")}</p>
            <p><b>EXPERIENCE</b><br />{p.work.map((w) => `${w.title}, ${w.company}`).join("\n")}</p>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-2 border-t border-line p-4">
        <button onClick={onBack} className="pill-ghost">Back</button>
        {stage === 1 ? <button onClick={onNext} className="pill-accent px-8">Review My New Resume</button> : <button onClick={onClose} className="pill-accent px-8">Done</button>}
      </div>
    </div>
  );
}

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
