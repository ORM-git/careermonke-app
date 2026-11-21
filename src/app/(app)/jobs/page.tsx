"use client";

import { useEffect, useState } from "react";
import { ChevronDown, CircleHelp, Linkedin, Lock, Pencil, Plus, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { PageHeader, PlanBadge } from "@/components/shell";
import { Tabs, EmptyState, MonkeAvatar } from "@/components/ui";
import { toast } from "@/components/toast";
import { AutofillModal, ChatPanel, Tour, WelcomePopup, useWelcomeFlow } from "@/components/welcome-flow";
import { KEYS, readPrefs } from "@/mocks/onboarding";
import { JobCard, JobCardSkeleton } from "@/components/job-card";
import { useApp, type AppStatus } from "@/components/app-state";
import { jobs } from "@/mocks/jobs";

const TABS = ["Recommended", "Liked", "Applied", "External"] as const;
type Tab = (typeof TABS)[number];
const STATUSES: AppStatus[] = ["Applied", "Interviewing", "Offer Received", "Rejected", "Archived"];

function SelectChip({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <label className={`chip relative cursor-pointer pr-2 ${value ? "chip-on" : "bg-accent-tint/60"}`}>
      {value || label} <ChevronDown className="h-3.5 w-3.5" />
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
        <option value="">{label}: Any</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function RightRail({ onAutofill }: { onAutofill: () => void }) {
  const [filter, setFilter] = useState("Business Analyst, India");
  const [linkedin, setLinkedin] = useState(false);
  const [vote, setVote] = useState(false);
  useEffect(() => {
    const p = readPrefs();
    if (p?.jobFunction) setFilter(`${p.jobFunction}, ${p.location === "United States" ? "US" : p.location}`);
    setLinkedin(!localStorage.getItem(KEYS.linkedin));
  }, []);
  const answer = (msg: string) => { setVote(true); toast(msg); };
  return (
    <aside className="space-y-5 lg:sticky lg:top-20">
      <PlanBadge />
      {linkedin && (
        <p className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-[13px]">
          <Linkedin className="h-4 w-4 shrink-0 rounded-sm bg-ink p-0.5 text-white" />
          <a href="/profile" className="flex-1 truncate hover:underline">Add LinkedIn for smarter job matches</a>
          <button aria-label="Dismiss" onClick={() => { localStorage.setItem(KEYS.linkedin, "1"); setLinkedin(false); }}><X className="h-4 w-4 text-neutral-500" /></button>
        </p>
      )}
      <div className="border-t border-line pt-4">
        <div className="flex items-center justify-between"><p className="font-semibold">Your Saved Filters</p><button aria-label="Add saved filter"><Plus className="h-5 w-5 rounded-full bg-ink p-0.5 text-white" /></button></div>
        <p className="mt-3 flex items-center justify-between border-l-2 border-ink pl-3 text-sm">{filter} <Pencil className="h-4 w-4 text-neutral-500" /></p>
      </div>
      <div className="rounded-2xl border-2 border-blue-200 bg-accent-tint p-1">
        <p className="flex items-center justify-center gap-2 py-2 text-sm font-semibold"><Sparkles className="h-4 w-4" />Complete to Win 1v1 Private Coaching</p>
        <div className="space-y-2 rounded-xl bg-white p-3 text-sm">
          <div className="flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-neutral-100" /><b className="text-lg">0%</b></div>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2"><span className="h-4 w-4 rounded-full border border-line" /><span className="flex-1">1. Customize Your Resume</span><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
            <p className="ml-6 mt-1 text-xs text-neutral-500">Open any job and use &quot;Customize Your Resume&quot; once. <a href="/jobs/1" className="text-accent">Try it</a></p>
          </details>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2"><span className="h-4 w-4 rounded-full border border-line" /><span className="flex-1">2. Enable Autofill Extension</span><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
            <p className="ml-6 mt-1 text-xs text-neutral-500">Fill applications in one click. <button onClick={onAutofill} className="text-accent">Enable</button></p>
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

export default function JobsPage() {
  const { liked, applied, external, addExternal } = useApp();
  const [tab, setTab] = useState<Tab>("Recommended");
  const [status, setStatus] = useState<AppStatus>("Applied");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("");
  const [level, setLevel] = useState("");
  const [posted, setPosted] = useState("");
  const [url, setUrl] = useState("");
  const flow = useWelcomeFlow();

  useEffect(() => { const t = setTimeout(() => setLoading(false), 300); return () => clearTimeout(t); }, []);

  const shown = jobs.filter((j) =>
    (!q || `${j.title} ${j.company}`.toLowerCase().includes(q.toLowerCase())) &&
    (!mode || j.mode === mode) && (!level || j.level === level) &&
    (!posted || (posted === "Past 24 hours" ? /hour/.test(j.posted) : !/week/.test(j.posted))));
  const appliedHere = applied.filter((a) => a.status === status);

  return (
    <>
      <PageHeader title="JOBS">
        <Tabs tabs={TABS} value={tab} onChange={setTab} counts={{ Liked: liked.length, Applied: applied.length, External: external.length }} />
        <label className="ml-auto hidden w-64 items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-sm xl:flex">
          <Search className="h-4 w-4 text-neutral-500" /><span className="sr-only">Search jobs</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or company" className="w-full bg-transparent outline-none" />
        </label>
      </PageHeader>

      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0 space-y-4">
          {tab === "Recommended" && (
            <>
              <div data-tour="filters" className="flex flex-wrap items-center gap-2">
                <span className="chip bg-accent-tint/60">India <ChevronDown className="h-3.5 w-3.5" /></span>
                <span className="chip bg-accent-tint/60">Business Analyst <ChevronDown className="h-3.5 w-3.5" /></span>
                <SelectChip label="Experience" options={["Entry Level", "Mid Level", "Senior Level"]} value={level} onChange={setLevel} />
                <span className="chip bg-accent-tint/60">Full-time <ChevronDown className="h-3.5 w-3.5" /></span>
                <SelectChip label="Work mode" options={["Remote", "Onsite", "Hybrid"]} value={mode} onChange={setMode} />
                <SelectChip label="Date Posted" options={["Past 24 hours", "Past week"]} value={posted} onChange={setPosted} />
                <span className="chip">Industry <ChevronDown className="h-3.5 w-3.5" /></span>
                <CircleHelp className="ml-auto hidden h-5 w-5 text-neutral-500 lg:block" aria-hidden="true" />
              </div>
              <div className="flex gap-2">
                <a href="/pricing" className="chip border-blue-200 bg-accent-tint"><Lock className="h-3.5 w-3.5" />Hidden Jobs</a>
                <button className="chip border-accent bg-accent text-white hover:border-accent"><SlidersHorizontal className="h-3.5 w-3.5" />All Filters</button>
              </div>
              {loading ? [0, 1, 2].map((i) => <JobCardSkeleton key={i} />) :
                shown.length ? shown.map((j) => <JobCard key={j.id} job={j} />) :
                <EmptyState text="No jobs match these filters. Try widening them." />}
            </>
          )}

          {tab === "Liked" && (liked.length
            ? jobs.filter((j) => liked.includes(j.id)).map((j) => <JobCard key={j.id} job={j} />)
            : <div className="pt-20"><EmptyState text="Jobs you like show up here. Tap the heart on any job to save it." /></div>)}

          {tab === "Applied" && (
            <>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => <button key={s} onClick={() => setStatus(s)} className={`chip ${status === s ? "chip-on" : ""}`}>{s}</button>)}
              </div>
              {appliedHere.length
                ? appliedHere.map((a) => { const j = jobs.find((x) => x.id === a.id)!; return <JobCard key={a.id} job={j} status={`${a.status} · ${a.date}`} />; })
                : <div className="pt-16 text-center"><EmptyState text={`No jobs in "${status}" yet.`} /><button onClick={() => setTab("Recommended")} className="pill-accent mt-4">View Recommended Jobs</button></div>}
            </>
          )}

          {tab === "External" && (
            <>
              <p className="rounded-xl bg-accent-tint px-4 py-3 text-sm text-accent">Track jobs you found or applied to elsewhere, and get resume tailoring and match analysis for them.</p>
              <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); if (url.trim()) { addExternal(url.trim()); setUrl(""); } }}>
                <label className="sr-only" htmlFor="ext-url">Job URL</label>
                <input id="ext-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a job URL here to add this job" className="input bg-white" />
                <button className="pill-accent shrink-0 rounded-lg"><Plus className="h-4 w-4" />Add Job</button>
              </form>
              {external.length ? external.map((x, i) => (
                <div key={i} className="card flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0"><p className="truncate font-semibold capitalize">{x.title}</p><a href={x.url} target="_blank" rel="noreferrer" className="truncate text-xs text-accent">{x.url}</a></div>
                  <span className="shrink-0 text-xs text-neutral-500">Added {x.date}</span>
                </div>
              )) : <div className="pt-24"><EmptyState text="Import job postings from other sources to tailor your resume and get a match analysis." /></div>}
            </>
          )}
        </main>
        <RightRail onAutofill={() => flow.setAutofill(true)} />
      </div>
      <WelcomePopup open={flow.popup} onConfirm={flow.confirmPopup} />
      {flow.tour !== null && !loading && <Tour step={flow.tour} onNext={flow.nextTour} onExit={flow.exitTour} onTry={flow.tryIt} />}
      {flow.chat && <ChatPanel job={shown[0] ?? jobs[0]} onClose={() => flow.setChat(false)} />}
      <AutofillModal open={flow.autofill} onClose={() => flow.setAutofill(false)} />
    </>
  );
}
