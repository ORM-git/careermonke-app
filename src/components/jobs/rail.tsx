"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleCheck, CircleX, CircleAlert, ChevronDown, Lightbulb, Linkedin, Pencil, Plus, Sparkles, ThumbsUp, X, Zap } from "lucide-react";
import { Confirm, Drawer, Modal, MonkeAvatar } from "../ui";
import { PlanBadge } from "../shell";
import { toast } from "../toast";
import { CompanyLogo } from "../ui";
import { readProfile } from "@/mocks/profile";
import { KEYS } from "@/mocks/onboarding";
import type { Job } from "@/mocks/jobs";
import type { SavedFilter } from "@/mocks/filters";

export function UpgradeModal({ open, onClose, title, body, cta, children }: { open: boolean; onClose: () => void; title: string; body: React.ReactNode; cta: string; children?: React.ReactNode }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-sky-400"><Zap className="h-8 w-8 fill-white text-white" /></span>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-neutral-600">{body}</p>
        {children && <div className="w-full rounded-2xl bg-gradient-to-br from-accent-tint to-sky-50 p-5">{children}</div>}
        <Link href="/pricing" className="pill-accent mt-2 w-full rounded-lg py-3">{cta}</Link>
      </div>
    </Modal>
  );
}

/* ---------- Resume comparison (step 1 only; later steps were not observed and are not built) ---------- */
export const CREDITS_TODAY = 2;

export function ResumeCompare({ job, onClose }: { job: Job; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
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
            <li key={s} aria-current={i === 0 ? "step" : undefined} className={`flex items-center gap-2 ${i === 0 ? "font-medium" : "text-neutral-400"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${i === 0 ? "bg-accent" : "bg-neutral-400"}`}>{i + 1}</span>{s}{i < 2 && <span className="ml-1 h-px w-10 bg-neutral-200" />}
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
          <div className="flex justify-center border-t border-line p-4"><button onClick={() => setAsking(true)} className="pill-accent px-8 py-3">Improve My Resume for This Job</button></div>
        </div>
      )}
      <Confirm open={asking} title="Use 1 resume credit?" confirmLabel="Use 1 credit" onCancel={() => setAsking(false)}
        body={<>Generating a tailored resume uses 1 of your {CREDITS_TODAY} credits today.</>}
        onConfirm={() => { setAsking(false); toast("Resume generation isn't connected in this demo yet, so no credit was used."); }} />
    </Drawer>
  );
}

/* ---------- Right rail ---------- */
export const INSTALLED_KEY = "cm_autofill_installed";

export function JobsRail({ saved, onEdit, onAutofill, onCustomize }: { saved: SavedFilter[]; onEdit: (id: string) => void; onAutofill: () => void; onCustomize: () => void }) {
  const [linkedin, setLinkedin] = useState(false);
  const [vote, setVote] = useState(false);
  const [gate, setGate] = useState(false);
  const [installed, setInstalled] = useState(false);
  useEffect(() => { setLinkedin(!localStorage.getItem(KEYS.linkedin)); setInstalled(!!localStorage.getItem(INSTALLED_KEY)); }, []);
  // Progress only counts real signals: item 1 needs a generated resume (not available yet); item 2 is the user's own "I've installed".
  const done = [false, installed];
  const pct = Math.round((done.filter(Boolean).length / done.length) * 100);
  const answer = (msg: string) => { setVote(true); toast(msg); };

  return (
    <aside className="space-y-5 lg:sticky lg:top-20">
      <PlanBadge />
      {linkedin && (
        <p className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-[13px]">
          <Linkedin className="h-4 w-4 shrink-0 rounded-sm bg-ink p-0.5 text-white" />
          <Link href="/profile" className="flex-1 truncate hover:underline">Add LinkedIn for smarter job matches</Link>
          <button aria-label="Dismiss" onClick={() => { localStorage.setItem(KEYS.linkedin, "1"); setLinkedin(false); }}><X className="h-4 w-4 text-neutral-500" /></button>
        </p>
      )}
      <div className="border-t border-line pt-4">
        <div className="flex items-center justify-between"><p className="font-semibold">Your Saved Filters</p><button aria-label="Add saved filter" onClick={() => setGate(true)}><Plus className="h-5 w-5 rounded-full bg-ink p-0.5 text-white" /></button></div>
        {saved.length ? saved.map((s) => (
          <p key={s.id} className="mt-3 flex items-center justify-between border-l-2 border-ink pl-3 text-sm">{s.filter.title}<button aria-label={`Edit ${s.filter.title}`} onClick={() => onEdit(s.id)} className="rounded p-1 hover:bg-neutral-100"><Pencil className="h-4 w-4 text-neutral-500" /></button></p>
        )) : <p className="mt-3 text-sm text-neutral-500">No saved filters.</p>}
      </div>
      <div className="rounded-2xl border-2 border-blue-200 bg-accent-tint p-1">
        <p className="flex items-center justify-center gap-2 py-2 text-sm font-semibold"><Lightbulb className="h-4 w-4" />Complete to Win 1v1 Private Coaching</p>
        <div className="space-y-2 rounded-xl bg-white p-3 text-sm">
          <div className="flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-neutral-100" role="progressbar" aria-label="Checklist progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-2 rounded-full bg-accent" style={{ width: `${pct}%` }} /></div><b className="text-lg">{pct}%</b></div>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2"><span className={`h-4 w-4 rounded-full border ${done[0] ? "border-accent bg-accent" : "border-line"}`} /><span className="flex-1">1. Customize Your Resume</span><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
            <div className="ml-6 mt-1 space-y-2"><p className="text-xs text-neutral-600">Tailor your resume to any job and stand out to recruiters.</p><button onClick={onCustomize} className="pill-ghost w-full rounded-lg py-1.5">Try It Now</button></div>
          </details>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2"><span className={`flex h-4 w-4 items-center justify-center rounded-full border ${installed ? "border-accent bg-accent text-[10px] text-white" : "border-line"}`}>{installed && "✓"}</span><span className="flex-1">2. Enable Autofill Extension</span><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
            <div className="ml-6 mt-1 space-y-2">
              <p className="text-xs text-neutral-600">Fill out job applications in one click.</p>
              <button onClick={onAutofill} className="pill-ghost w-full rounded-lg py-1.5">Enable Now</button>
              {!installed && <button onClick={() => { localStorage.setItem(INSTALLED_KEY, "1"); setInstalled(true); }} className="mx-auto block text-xs underline">I&apos;ve installed</button>}
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
      <UpgradeModal open={gate} onClose={() => setGate(false)} title="Track multiple job searches at once" cta="Upgrade to Pro Now"
        body={<>Save <b>up to 5 filters</b> for different roles, cities or salary ranges, with no re-entering your criteria.</>}>
        <p className="mx-auto mb-3 w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">Available on Pro</p>
        <div className="space-y-2 rounded-xl bg-white p-3 text-left text-sm">{["Product Manager, Remote", "Marketing Lead, Bengaluru", "Data Analyst + 2 roles, Pune"].map((t, i) => <p key={t} className={`border-l-2 pl-2 ${i ? "border-neutral-200 text-neutral-500" : "border-accent"}`}>{t}</p>)}</div>
      </UpgradeModal>
    </aside>
  );
}
