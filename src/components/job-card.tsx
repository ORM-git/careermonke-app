"use client";

import Link from "next/link";
import { useState } from "react";
import { Ban, BriefcaseBusiness, CalendarDays, Clock, Heart, House, Banknote, MapPin, Sparkles } from "lucide-react";
import { CompanyLogo, MatchRing, matchLabel } from "./ui";
import { useApp } from "./app-state";
import { ApplyButton, CardMenu } from "./jobs/job-actions";
import type { Job } from "@/mocks/jobs";

export function JobCard({ job, status, onAsk, extra }: { job: Job; status?: string; onAsk?: (job: Job) => void; extra?: React.ReactNode }) {
  const { liked, toggleLike, hide } = useApp();
  const [expanded, setExpanded] = useState(false);
  const isLiked = liked.includes(job.id);
  const facts: Array<[typeof MapPin, string | undefined]> = [
    [MapPin, job.location], [Clock, job.type], [Banknote, job.salary],
    [House, job.mode], [BriefcaseBusiness, job.level], [CalendarDays, job.exp],
  ];

  return (
    <article className="flex overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-neutral-300">
      <div className="min-w-0 flex-1 p-4">
        {expanded ? (
          <div className="flex gap-3">
            <Sparkles className="h-7 w-7 shrink-0 text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold">Why This Job Is A Match</p>
              <p className="mt-1 line-clamp-2 text-[15px] text-neutral-700">{job.summary}</p>
              <div className="mt-4 flex flex-wrap gap-6">
                <MatchRing value={job.breakdown.experience} size={48} stroke={3} label="Experience Level" />
                <MatchRing value={job.breakdown.skills} size={48} stroke={3} label="Skills" />
                <MatchRing value={job.breakdown.industry} size={48} stroke={3} label="Industry Experience" />
              </div>
              <ul className="mt-3 list-disc space-y-0.5 pl-5 text-sm text-neutral-600">{job.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-4">
              <CompanyLogo initials={job.initials} color={job.color} size={64} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-1.5">
                  <span className="tag bg-neutral-100 text-neutral-700">{job.posted}</span>
                  {job.badges.map((b) => <span key={b} className="tag bg-neutral-100 text-neutral-700">{b}</span>)}
                  {status && <span className="tag">{status}</span>}
                </div>
                <Link href={`/jobs/${job.id}`} className="mt-1 block truncate text-xl font-semibold hover:underline">{job.title}</Link>
                <p className="truncate text-[13px] text-neutral-700">{job.company} <span className="text-neutral-400">/ {job.industry}</span></p>
              </div>
              <CardMenu job={job} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-line pt-3 text-[13px] sm:grid-cols-3">
              {facts.map(([Icon, text], i) => text ? <span key={i} className="flex items-center gap-1.5 truncate"><Icon className="h-4 w-4 shrink-0 text-neutral-500" />{text}</span> : <span key={i} />)}
            </div>
          </>
        )}
        <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
          <span className="mr-auto text-xs text-neutral-400">{job.applicants}</span>
          {extra}
          <button aria-label="Not interested" title="Not interested" onClick={() => hide(job.id)} className="rounded-full border border-line p-2 hover:bg-neutral-50"><Ban className="h-4 w-4" /></button>
          <button aria-label={isLiked ? "Unlike job" : "Like job"} aria-pressed={isLiked} onClick={() => toggleLike(job.id)} className="rounded-full border border-line p-2 hover:bg-neutral-50">
            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </button>
          {onAsk
            ? <button onClick={() => onAsk(job)} data-tour="ask" className="pill-ghost hidden sm:inline-flex"><Sparkles className="h-4 w-4" />ASK MONKE</button>
            : <Link href={`/jobs/${job.id}`} data-tour="ask" className="pill-ghost hidden sm:inline-flex"><Sparkles className="h-4 w-4" />ASK MONKE</Link>}
          <ApplyButton job={job} />
        </div>
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        data-tour="match"
        aria-label={`${job.match}% match, ${expanded ? "hide" : "show"} breakdown`}
        className="hidden w-40 shrink-0 flex-col items-center justify-center gap-2 bg-gradient-to-b from-neutral-900 to-slate-700 text-white sm:flex"
      >
        <MatchRing value={job.match} dark />
        <span className="font-semibold">{matchLabel(job.match)}</span>
        <span className="w-28 border-t border-white/15 pt-2 text-[11px] text-white/80">{job.mode === "Remote" ? "• Remote friendly" : "✓ Visa support likely"}</span>
      </button>
    </article>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl border border-line bg-white p-4">
      <div className="skel h-16 w-16" />
      <div className="flex-1 space-y-2"><div className="skel h-4 w-1/3" /><div className="skel h-5 w-2/3" /><div className="skel h-4 w-1/2" /><div className="skel mt-4 h-10 w-full" /></div>
    </div>
  );
}
