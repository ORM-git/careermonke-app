"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Ban, BriefcaseBusiness, CalendarDays, ChevronRight, Clock, Flag, Heart, House, IndianRupee, Mail, MapPin, Search, Share2, Sparkles, ThumbsUp, X } from "lucide-react";
import { PageHeader } from "@/components/shell";
import { CompanyLogo, Modal, matchLabel } from "@/components/ui";
import { useApp } from "@/components/app-state";
import { getJob, type Job } from "@/mocks/jobs";
import { user } from "@/mocks/user";

const TOOLS = [
  { key: "resume", title: "Customize Your Resume", sub: "Maximize your interview chances", icon: Sparkles },
  { key: "cover", title: "Build Cover Letter", sub: "Make your application stand out", icon: Mail },
  { key: "fit", title: "Analyze How Well You Fit", sub: "Understand your strengths & gaps", icon: ThumbsUp },
] as const;
type ToolKey = (typeof TOOLS)[number]["key"];

function toolOutput(key: ToolKey, j: Job) {
  if (key === "resume") return `SUMMARY\nAnalyst with hands-on SQL and reporting experience, ready to drive ${j.title.toLowerCase()} work at ${j.company}.\n\nEXPERIENCE (rewritten for this role)\n• Built weekly KPI dashboards used by 3 teams, cutting reporting time by 40%\n• Gathered requirements from stakeholders and turned them into clear specs\n• Ran process analysis that removed 2 manual hand-offs\n\nSKILLS ADDED FROM THE JOB\nStakeholder management · Process mapping · ${j.industry.split(" · ")[0]} domain`;
  if (key === "cover") return `Dear ${j.company} Hiring Team,\n\nI'm excited to apply for the ${j.title} role. In my recent work I built dashboards and ran process analyses that helped teams make faster decisions — the same kind of impact your posting describes.\n\nI'd love to bring that bias for action to ${j.company} and help your teams improve efficiency.\n\nThank you for your time,\n${user.name}`;
  return `VERDICT: ${matchLabel(j.match)} (${j.match}%)\n\nSTRENGTHS\n• SQL and reporting match the core of the role\n• Clear stakeholder communication in past projects\n• Relevant ${j.industry.split(" · ")[0].toLowerCase()} exposure\n\nGAPS\n• Role asks for ${j.exp}\n• No direct experience with process re-engineering\n• Add one quantified impact bullet for ${j.company}'s domain`;
}

function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let tick: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      tick = setInterval(() => setN((v) => Math.min(text.length, v + 4)), 12);
    }, 900);
    return () => { clearTimeout(start); clearInterval(tick); };
  }, [text]);
  if (n === 0) return <p className="flex items-center gap-1 py-8 text-neutral-500">Generating<span className="dot">.</span><span className="dot [animation-delay:.2s]">.</span><span className="dot [animation-delay:.4s]">.</span></p>;
  return <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-800">{text.slice(0, n)}</pre>;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const job = getJob(id);
  const { liked, toggleLike, apply, applied } = useApp();
  const [tab, setTab] = useState<"Overview" | "Company">("Overview");
  const [tool, setTool] = useState<ToolKey | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 300); return () => clearTimeout(t); }, []);
  if (!job) notFound();

  const isApplied = applied.some((a) => a.id === job.id);
  const facts: Array<[typeof MapPin, string | undefined]> = [[MapPin, job.location], [Clock, job.type], [House, job.mode], [BriefcaseBusiness, job.level], [IndianRupee, job.salary?.replace("₹", "")], [CalendarDays, job.exp]];
  const active = TOOLS.find((t) => t.key === tool);

  return (
    <>
      <PageHeader title="JOBS"><Link href="/jobs" className="border-b-2 border-ink text-[15px] font-semibold">Recommended</Link></PageHeader>
      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[1fr_360px]">
        <main className="min-w-0">
          <div className="mb-4 flex items-center gap-2">
            <Link href="/jobs" aria-label="Back to jobs" className="rounded-lg p-2 hover:bg-neutral-100"><X className="h-5 w-5" /></Link>
            {job.badges.slice(1).concat(job.applicants).map((b) => <span key={b} className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm">{b}</span>)}
            <div className="ml-auto flex items-center gap-2">
              <button aria-label="Hide job" className="rounded-full p-2 hover:bg-neutral-100"><Ban className="h-5 w-5" /></button>
              <button aria-label={liked.includes(job.id) ? "Unsave job" : "Save job"} onClick={() => toggleLike(job.id)} className="rounded-full p-2 hover:bg-neutral-100"><Heart className={`h-5 w-5 ${liked.includes(job.id) ? "fill-red-500 text-red-500" : ""}`} /></button>
              <button onClick={() => apply(job.id)} className={isApplied ? "pill-ghost" : "pill-accent"}>{isApplied ? "APPLIED" : <>APPLY NOW <ArrowUpRight className="h-4 w-4" /></>}</button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-6 border-b border-line">
              {(["Overview", "Company"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`border-b-2 pb-3 text-[17px] ${tab === t ? "border-ink font-semibold" : "border-transparent text-neutral-400"}`}>{t}</button>
              ))}
              <div className="ml-auto hidden gap-4 pb-3 text-xs sm:flex">
                <span className="flex items-center gap-1"><Share2 className="h-4 w-4" />Share</span>
                <span className="flex items-center gap-1"><Flag className="h-4 w-4" />Report Issue</span>
              </div>
            </div>

            {loading ? <div className="space-y-3 py-6"><div className="skel h-6 w-1/2" /><div className="skel h-4 w-3/4" /><div className="skel h-32 w-full" /></div> : tab === "Overview" ? (
              <div className="space-y-6 pt-6">
                <div className="flex items-center gap-3"><CompanyLogo initials={job.initials} color={job.color} size={44} /><p className="text-[15px]"><b className="font-medium">{job.company}</b> · {job.posted}</p></div>
                <h2 className="text-2xl font-semibold">{job.title}</h2>
                <div className="grid max-w-2xl grid-cols-1 gap-y-1.5 text-sm sm:grid-cols-2">
                  {facts.map(([Icon, t], i) => t && <span key={i} className="flex items-center gap-2"><Icon className="h-4 w-4 text-neutral-500" />{t}</span>)}
                </div>
                <p className="max-w-3xl border-t border-line pt-6 text-[15px]">{job.summary}</p>
                <div className="flex flex-wrap gap-2">{job.industry.split(" · ").map((t) => <span key={t} className="tag py-1 text-[13px]">{t}</span>)}</div>
                {([["Responsibilities", job.responsibilities], ["Qualifications", job.requirements], ["Benefits", job.benefits]] as const).map(([h, list]) => (
                  <section key={h}><h3 className="text-lg font-semibold">{h}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-neutral-700">{list.map((l) => <li key={l}>{l}</li>)}</ul></section>
                ))}
              </div>
            ) : (
              <div className="space-y-4 pt-6 text-[15px]">
                <div className="flex items-center gap-3"><CompanyLogo initials={job.initials} color={job.color} size={56} /><h2 className="text-xl font-semibold">{job.company}</h2></div>
                <p className="text-neutral-700">{job.companyAbout}</p>
                <dl className="grid max-w-md grid-cols-2 gap-2 text-sm">
                  <dt className="text-neutral-500">Industry</dt><dd>{job.industry.split(" · ")[0]}</dd>
                  <dt className="text-neutral-500">Stage</dt><dd>{job.industry.split(" · ")[1]}</dd>
                  <dt className="text-neutral-500">Company size</dt><dd>{job.size} employees</dd>
                  <dt className="text-neutral-500">Website</dt><dd className="text-accent">{job.company.toLowerCase().replace(/\s/g, "")}.example</dd>
                </dl>
              </div>
            )}
          </div>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl bg-gradient-to-b from-neutral-900 to-slate-700 p-5 text-white">
            <div className="flex items-center justify-between"><p className="text-4xl font-bold">{job.match}<small className="text-lg font-normal">%</small></p><p className="font-semibold">{matchLabel(job.match)}</p></div>
            <div className="mt-4 space-y-2 border-t border-white/15 pt-4 text-sm">
              {([["Experience Level", job.breakdown.experience], ["Skill", job.breakdown.skills], ["Industry Exp.", job.breakdown.industry]] as const).map(([l, v]) => <p key={l} className="flex justify-between"><span className="text-white/80">{l}</span><b>{v}%</b></p>)}
            </div>
            <p className="mt-4 border-t border-white/15 pt-4 text-sm font-semibold">Why this job is a match</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">{job.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between gap-2"><p className="font-semibold">Insider Connection</p><span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-white">{user.emailCredits} email credits available today</span></div>
            <p className="mt-1 text-sm text-neutral-600">People at {job.company} who might refer you.</p>
            <div className="mt-3 flex -space-x-2">{["R", "P", "S", "K", "A"].map((c, i) => <span key={c} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white" style={{ background: ["#2563EB", "#7C3AED", "#16A34A", "#DB2777", "#F59E0B"][i] }}>{c}</span>)}</div>
            <label className="mt-4 flex overflow-hidden rounded-full border border-accent">
              <span className="sr-only">LinkedIn profile URL</span>
              <input placeholder="Paste a LinkedIn profile URL" className="min-w-0 flex-1 px-4 py-2 text-sm outline-none" />
              <button className="flex items-center gap-1 bg-accent px-4 text-sm font-semibold text-white"><Search className="h-4 w-4" />Find Any Email</button>
            </label>
          </div>

          <div className="card p-5">
            <p className="mb-3 font-semibold">AI Tools</p>
            <div className="space-y-2">
              {TOOLS.map(({ key, title, sub, icon: Icon }, i) => (
                <button key={key} onClick={() => setTool(key)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${i === 0 ? "border-blue-200 bg-accent-tint hover:bg-blue-100" : "border-line hover:bg-neutral-50"}`}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1"><b className="block text-[15px] font-semibold">{title}</b><span className="text-xs text-neutral-500">{sub}</span></span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Modal open={!!tool} onClose={() => setTool(null)} title={active?.title}>
        {tool && active && (
          <div className="p-6">
            <h2 className="pr-8 text-lg font-semibold">{active.title}</h2>
            <p className="text-sm text-neutral-500">{job.title} · {job.company}</p>
            <div className="mt-4 max-h-[50vh] overflow-auto rounded-xl bg-neutral-50 p-4"><Typed text={toolOutput(tool, job)} /></div>
            <div className="mt-4 flex justify-end gap-2"><button onClick={() => setTool(null)} className="pill-ghost">Close</button><button onClick={() => navigator.clipboard?.writeText(toolOutput(tool, job))} className="pill-accent">Copy</button></div>
          </div>
        )}
      </Modal>
    </>
  );
}
