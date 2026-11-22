"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban, BriefcaseBusiness, Building2, CalendarDays, ChevronRight, CircleHelp, Clock, ExternalLink, FileText, Flag, Gift, Globe,
  GraduationCap, Heart, House, Banknote, ListChecks, Mail, MapPin, Network, Search, Share2, Sparkles, ThumbsUp, Users, X,
} from "lucide-react";
import { PageHeader } from "../shell";
import { CompanyLogo, Confirm, Modal, matchLabel } from "../ui";
import { toast } from "../toast";
import { useApp } from "../app-state";
import { ChatPanel, FIT_PROMPT, Tour } from "../welcome-flow";
import { ApplyButton, ReportModal, shareJob } from "./job-actions";
import { CREDITS_TODAY } from "./rail";
import { ResumeCompare } from "./resume-customize";
import { readProfile, saveProfile } from "@/mocks/profile";
import type { Job } from "@/mocks/jobs";
import { user } from "@/mocks/user";
import { demoStore } from "@/lib/demo";

const COVER_TOUR_KEY = "cm_cover_tour_done";
const coverTour = [{ anchor: "cover", title: "Stand Out Among Applicants", text: "New! Get a personalised cover letter for every job you apply to." }];
const H = ({ icon: Icon, children, id }: { icon: typeof MapPin; children: React.ReactNode; id?: string }) => (
  <h2 id={id} className="flex scroll-mt-40 items-center gap-2 text-xl font-semibold"><Icon className="h-6 w-6 text-accent" aria-hidden="true" />{children}</h2>
);

function coverLetter(j: Job) {
  return `Dear ${j.company} Hiring Team,\n\nI'm excited to apply for the ${j.title} role. In my recent work I built tools and reports that helped teams make faster decisions, which is the kind of impact your posting describes.\n\nI'd love to bring that bias for action to ${j.company}.\n\nThank you for your time,\n${user.name}`;
}

/** Insider connections: the free card shows one sample contact; revealing an email always asks before using a credit. */
function Connections({ job }: { job: Job }) {
  const [view, setView] = useState(false);
  const [credit, setCredit] = useState<string | null>(null);
  const [li, setLi] = useState("");
  const [liErr, setLiErr] = useState("");
  const find = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i.test(li.trim())) { setLiErr("Paste a LinkedIn profile URL like https://www.linkedin.com/in/name"); return; }
    setLiErr(""); setCredit("this LinkedIn profile");
  };
  // Pro connection cards are unlocked in this demo and show fictional sample contacts only.
  const [open, setOpen] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<string | null>(null);
  const sample = (label: string) => label === "From Your School"
    ? [{ n: "Rohit S. (sample)", t: "Engineer · same university" }, { n: "Ananya K. (sample)", t: "Product Manager · same university" }]
    : [{ n: "Kavya R. (sample)", t: "Senior Engineer · ex-colleague" }, { n: "Arjun M. (sample)", t: "Engineering Manager · ex-colleague" }];
  const blurred = (tone: string, label: string) => (
    <div className={`relative rounded-xl border p-3 ${tone}`}>
      <p className="text-sm font-semibold">{label}</p>
      {open.includes(label) ? (
        <ul className="mt-2 space-y-1 text-xs text-ink">{sample(label).map((p) => <li key={p.n}><b>{p.n}</b> · {p.t}</li>)}</ul>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between"><span aria-hidden="true" className="flex -space-x-2 blur-[3px]">{[0, 1, 2].map((k) => <span key={k} className="h-7 w-7 rounded-full border-2 border-white bg-current opacity-50" />)}</span>
            <button onClick={() => setOpen([...open, label])} className="rounded-full border border-ink bg-white px-4 py-1 text-sm font-medium" title="Pro feature, unlocked in this demo">Unlock</button></div>
          <p aria-hidden="true" className="mt-2 text-xs blur-[3px]">2 connections · sample contacts</p>
        </>
      )}
    </div>
  );
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <H icon={Network}>Insider Connection @{job.company}</H>
        <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white" title="Each email lookup uses 1 credit. Credits reset daily.">{CREDITS_TODAY} email credits available today <CircleHelp className="h-3.5 w-3.5" /></span>
      </div>
      <p className="text-[15px]">Find people at the company who could share insights or refer you. <b className="underline">Reaching out by email tends to get more replies than LinkedIn messages.</b></p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
        <div className="relative rounded-xl border border-blue-200 bg-accent-tint p-3">
          <p className="text-sm font-semibold text-accent">Beyond Your Network</p>
          <div className="mt-3 flex items-center justify-between"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">P</span><button onClick={() => setView(true)} className="rounded-full border border-ink bg-white px-4 py-1 text-sm font-medium">View</button></div>
          {view && (
            <div role="dialog" aria-label="Beyond your network" className="animate-pop absolute inset-x-0 top-0 z-20 space-y-3 rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5">
              <div className="flex items-center justify-between"><p className="text-sm font-semibold text-accent">Beyond Your Network</p><button aria-label="Close" onClick={() => setView(false)}><X className="h-4 w-4" /></button></div>
              <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(job.company)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 rounded-lg bg-accent-tint py-2 text-sm font-semibold">Find More Connections <ExternalLink className="h-3.5 w-3.5" /></a>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">P</span>
                <span className="flex-1 text-sm"><b className="block">Priya N. (sample)</b>Talent Partner</span>
                <button aria-label="Reveal email" onClick={() => setCredit("Priya N.")} className="rounded-full border border-line p-1.5"><Mail className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
        {blurred("border-blue-100 bg-blue-50/50 text-blue-500", "From Your Previous Company")}
        {blurred("border-violet-100 bg-violet-50/50 text-violet-500", "From Your School")}
      </div>
      <form onSubmit={find} className="flex overflow-hidden rounded-full border border-accent" noValidate>
        <label htmlFor="find-email" className="sr-only">LinkedIn profile URL</label>
        <input id="find-email" value={li} onChange={(e) => { setLi(e.target.value); setLiErr(""); }} placeholder="Paste any LinkedIn profile URL (https://www.linkedin.com/in/…) to find a work email" className="min-w-0 flex-1 px-4 py-2.5 text-sm outline-none" />
        <button aria-label="Find any email" className="bg-accent px-5 text-white"><Search className="h-5 w-5" /></button>
      </form>
      {liErr && <p role="alert" className="text-sm text-red-500">{liErr}</p>}
      <Confirm open={!!credit} title="Use 1 email credit?" confirmLabel="Use 1 credit" onCancel={() => setCredit(null)}
        body={<>In the real app, finding the email for {credit} uses 1 of your {CREDITS_TODAY} credits today. In this demo nothing is charged and a fictional sample is shown.</>}
        onConfirm={() => { setRevealed(credit); setCredit(null); }} />
      {revealed && <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Sample result for {revealed}: <b>sample.contact@{job.company.toLowerCase().replace(/\W+/g, "")}.example</b> (fictional; no lookup was made and no credit was used).</p>}
    </section>
  );
}

function Qualification({ job }: { job: Job }) {
  const initial = readProfile().skills;
  const [mine, setMine] = useState(initial);
  const has = (s: string) => mine.some((m) => m.toLowerCase() === s.toLowerCase());
  const changed = JSON.stringify(mine) !== JSON.stringify(initial);
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><H icon={ListChecks}>Qualification</H><span className="flex items-center gap-1 text-xs"><span className="h-3 w-3 rounded bg-accent-tint ring-1 ring-blue-200" />Skills you have</span></div>
      <p className="text-sm text-neutral-600">Tap a skill to mark whether you have it. This sharpens your match.</p>
      <div className="flex flex-wrap gap-1.5">
        {job.skills.map((s) => (
          <button key={s} aria-pressed={has(s)} onClick={() => setMine(has(s) ? mine.filter((m) => m.toLowerCase() !== s.toLowerCase()) : [...mine, s])}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm ${has(s) ? "bg-accent-tint text-accent" : "bg-neutral-100"}`}>{has(s) && <ThumbsUp className="h-3.5 w-3.5" />}{s}</button>
        ))}
      </div>
      {changed && <button onClick={() => { saveProfile({ ...readProfile(), skills: mine }); toast("Skills saved to your profile"); }} className="pill-accent py-1.5 text-xs">Save skills to profile</button>}
      <p className="pt-2 font-semibold">Required</p><ul className="list-disc space-y-1 pl-5 text-[15px] text-neutral-700">{job.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
      <p className="pt-2 font-semibold">Preferred</p><ul className="list-disc space-y-1 pl-5 text-[15px] text-neutral-700">{job.preferred.map((r) => <li key={r}>{r}</li>)}</ul>
    </section>
  );
}

function CompanySection({ job }: { job: Job }) {
  const box = "rounded-xl bg-neutral-50 p-4";
  return (
    <section className="space-y-4">
      <H icon={Building2} id="jd-company">Company</H>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[2fr_1fr]">
        <div className={box}>
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xl font-semibold">{job.company}</p>
</div>
            <CompanyLogo initials={job.initials} color={job.color} size={56} />
          </div>
          <p className="mt-3 text-[15px]">{job.companyAbout}</p>
        </div>
        <ul className={`${box} space-y-2 text-sm`}>
          <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Founded in {job.founded}</li>
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />{job.hq}</li>
          <li className="flex items-center gap-2"><Users className="h-4 w-4" />{job.size} employees</li>
          <li className="flex items-center gap-2"><Globe className="h-4 w-4" /><span className="truncate">{job.website}</span></li>
        </ul>
      </div>
      <p className="pt-2 text-lg font-semibold">Funding</p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
        <div className={box}><p className="font-semibold">Current Stage</p><p>{job.funding.stage}</p><p className="mt-2 font-semibold">Total Funding</p><p>{job.funding.total}</p></div>
        <div className={box}><p className="font-semibold">Key Investors</p>{job.funding.investors.map((i) => <p key={i}>{i}</p>)}</div>
        <div className={`${box} space-y-2`}>{job.funding.events.map((e) => <p key={e.date}><b className="block">{e.date}</b>{e.label}</p>)}</div>
      </div>
      <p className="pt-2 text-lg font-semibold">Leadership Team</p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
        {job.leaders.map((l) => (
          <div key={l.name} className={box}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300 text-sm font-semibold">{l.name.split(" ").map((w) => w[0]).join("")}</span>
            <p className="mt-2 font-semibold">{l.name}</p><p className="text-sm">{l.title}</p>
          </div>
        ))}
      </div>
      <p className="pt-2 text-lg font-semibold">Recent News</p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">{job.news.map((n) => <div key={n.title} className={box}><p className="font-semibold">{n.source}</p><p className="line-clamp-2 text-[15px]">{n.title}</p><p className="mt-2 text-xs text-neutral-500">{n.date}</p></div>)}</div>
      <p className="text-xs italic text-neutral-500">Company details are sample data for this demo.</p>
    </section>
  );
}

export function JobDetail({ job }: { job: Job }) {
  const router = useRouter();
  const { liked, toggleLike, hide } = useApp();
  const [tab, setTab] = useState<"Overview" | "Company">("Overview");
  const [scrolled, setScrolled] = useState(false);
  const [report, setReport] = useState(false);
  const [compare, setCompare] = useState(false);
  const [coverAsk, setCoverAsk] = useState(false);
  const [cover, setCover] = useState(false);
  const [chat, setChat] = useState<string | null>(null);
  const [tour, setTour] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!demoStore.getItem(COVER_TOUR_KEY)) setTour(true);
    const onScroll = () => {
      setScrolled(window.scrollY > 180);
      const company = document.getElementById("jd-company")?.getBoundingClientRect().top ?? Infinity;
      setTab(company < 220 ? "Company" : "Overview");
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const endTour = () => { demoStore.setItem(COVER_TOUR_KEY, "1"); setTour(false); };
  const go = (t: "Overview" | "Company") => {
    setTab(t);
    (t === "Company" ? document.getElementById("jd-company") : top.current)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const facts: Array<[typeof MapPin, string | undefined]> = [[MapPin, job.location], [Clock, job.type], [House, job.mode], [BriefcaseBusiness, job.level], [Banknote, job.salary], [CalendarDays, job.exp]];
  const isLiked = liked.includes(job.id);
  const tools = [
    { key: "resume", title: "Customize Your Resume", sub: "Maximize your interview chances", icon: Sparkles, run: () => setCompare(true) },
    { key: "cover", title: "Build Cover Letter", sub: "Make your application stand out", icon: Mail, run: () => setCoverAsk(true) },
    { key: "fit", title: "Analyze How Well You Fit", sub: "Understand your strengths & gaps", icon: ThumbsUp, run: () => setChat(FIT_PROMPT) },
  ];

  return (
    <>
      <PageHeader title="JOBS"><Link href="/jobs" className="border-b-2 border-ink text-[15px] font-semibold">Recommended</Link></PageHeader>
      <div className="grid gap-6 px-4 pb-28 pt-4 md:p-6 lg:grid-cols-[1fr_300px]">
        <main className="min-w-0">
          <div className="sticky top-16 z-10 -mx-1 mb-3 flex items-center gap-2 bg-neutral-50 px-1 py-2">
            <Link href="/jobs" aria-label="Back to jobs" className="rounded-lg bg-white p-2 shadow-sm hover:bg-neutral-100"><X className="h-5 w-5" /></Link>
            {scrolled
              ? <span className="flex min-w-0 items-center gap-2 rounded-lg bg-white px-2 py-1.5 text-sm shadow-sm"><CompanyLogo initials={job.initials} color={job.color} size={22} /><span className="truncate">{job.title}</span></span>
              : [...job.badges, job.applicants].map((b) => <span key={b} className="hidden rounded-lg bg-accent-tint px-3 py-1.5 text-sm sm:inline">{b}</span>)}
            <div className="ml-auto flex items-center gap-1">
              <button aria-label="Not interested" title="Not interested" onClick={() => { hide(job.id); toast("We'll show fewer jobs like this"); router.push("/jobs"); }} className="rounded-full p-2 hover:bg-neutral-100"><Ban className="h-5 w-5" /></button>
              <button aria-label={isLiked ? "Unlike job" : "Like job"} aria-pressed={isLiked} onClick={() => toggleLike(job.id)} className="rounded-full p-2 hover:bg-neutral-100"><Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} /></button>
              <ApplyButton job={job} guided withCustomize />
            </div>
          </div>

          <div ref={top} className="card scroll-mt-40">
            <div className="sticky top-[124px] z-[5] flex items-center gap-5 rounded-t-2xl border-b border-line bg-white px-4 pt-4 sm:gap-6 sm:px-6">
              {(["Overview", "Company"] as const).map((t) => <button key={t} onClick={() => go(t)} aria-current={tab === t || undefined} className={`border-b-2 pb-3 text-[17px] ${tab === t ? "border-ink font-semibold" : "border-transparent text-neutral-400"}`}>{t}</button>)}
              {/* Phones keep Share / Report reachable as icon buttons; text labels stay for screen readers. */}
              <div className="ml-auto flex gap-1 pb-2 text-xs sm:gap-4 sm:pb-3">
                <button onClick={() => shareJob(job.id)} className="flex items-center gap-1 max-sm:h-10 max-sm:w-10 max-sm:justify-center"><Share2 className="h-4 w-4" /><span className="max-sm:sr-only">Share</span></button>
                <button onClick={() => setReport(true)} className="flex items-center gap-1 max-sm:h-10 max-sm:w-10 max-sm:justify-center"><Flag className="h-4 w-4" /><span className="max-sm:sr-only">Report Issue</span></button>
                <span title="Sample job: there is no real posting" className="flex items-center gap-1 text-neutral-400 max-sm:hidden"><FileText className="h-4 w-4" />Sample posting</span>
              </div>
            </div>

            <div className="space-y-8 p-4 sm:space-y-10 sm:p-6">
              <section className="flex flex-wrap justify-between gap-6 border-b border-line pb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3"><CompanyLogo initials={job.initials} color={job.color} size={44} /><p className="text-[15px]"><b className="font-medium">{job.company}</b> · {job.posted}</p></div>
                  <h1 className="text-xl font-semibold sm:text-2xl">{job.title}</h1>
                  <div className="grid grid-cols-1 gap-x-10 gap-y-1.5 text-sm sm:grid-cols-2">{facts.map(([Icon, t], i) => t && <span key={i} className="flex items-center gap-2"><Icon className="h-4 w-4 text-neutral-500" />{t}</span>)}</div>
                </div>
                <div className="w-full self-start rounded-2xl bg-gradient-to-br from-accent-tint to-sky-50 p-1 ring-1 ring-blue-200 sm:w-64" aria-label={`Match score ${job.match}%`}>
                  <div className="flex items-center justify-between px-3 py-2"><p className="text-4xl font-semibold">{job.match}<small className="text-lg">%</small></p><p className="text-sm font-semibold">{matchLabel(job.match)}</p></div>
                  <div className="space-y-2 rounded-xl bg-white p-3 text-sm">
                    {([["Experience Level", job.breakdown.experience], ["Skill", job.breakdown.skills], ["Industry Exp.", job.breakdown.industry]] as const).map(([l, v]) => <p key={l} className="flex justify-between"><span>{l}</span><b>{v}%</b></p>)}
                  </div>
                </div>
              </section>

              <section className="space-y-3 border-b border-line pb-8">
                <p className="text-[15px]"><b>{job.company}</b> is hiring a <b>{job.title}</b>. {job.summary.replace(`${job.company} is hiring a ${job.title} to `, "The role will ")}</p>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((t) => <span key={t} className="tag py-1 text-[13px]">{t}</span>)}
                  {job.growth && <span className="tag py-1 text-[13px]" title="Company is growing headcount">✓ Growth Opportunities</span>}
                  <span className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[13px]" title="Based on past visa filings for this company">{job.h1b ? "H1B Sponsor Likely" : "No H1B"}<CircleHelp className="h-3.5 w-3.5" /></span>
                  {job.citizenOnly && <span className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[13px]" title="The posting asks for citizenship">U.S. Citizen Only<CircleHelp className="h-3.5 w-3.5" /></span>}
                </div>
              </section>

              <Connections job={job} />
              <section className="space-y-3"><H icon={BriefcaseBusiness}>Responsibilities</H><ul className="list-disc space-y-1 pl-5 text-[15px] text-neutral-700">{job.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul></section>
              <Qualification job={job} />
              <section className="space-y-3"><H icon={Gift}>Benefits</H><ul className="list-disc space-y-1 pl-5 text-[15px] text-neutral-700">{job.benefits.map((r) => <li key={r}>{r}</li>)}</ul></section>
              <CompanySection job={job} />
            </div>
          </div>
        </main>

        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <p className="font-semibold">AI Tools</p>
          {tools.map(({ key, title, sub, icon: Icon, run }, i) => (
            <button key={key} data-tour={key} onClick={run} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${i === 0 ? "border-blue-200 bg-gradient-to-br from-blue-100 to-accent-tint hover:from-blue-200" : "border-line bg-white hover:bg-neutral-50"}`}>
              <span className="flex-1"><Icon className="mb-2 h-5 w-5" /><b className="block text-[15px] font-semibold">{title}</b><span className="text-xs text-neutral-500">{sub}</span></span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
          <p className="flex items-center gap-1 text-xs text-neutral-500"><GraduationCap className="h-3.5 w-3.5" />Resume and cover-letter tools use credits; you&apos;ll always be asked first.</p>
        </aside>
      </div>

      <button onClick={() => setChat("")} aria-label="Ask Monke" className="fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 md:bottom-6"><Sparkles className="h-6 w-6 text-accent" /></button>

      <ReportModal open={report} onClose={() => setReport(false)} />
      {compare && <ResumeCompare job={job} onClose={() => setCompare(false)} />}
      <Confirm open={coverAsk} title="Use 1 credit for a cover letter?" confirmLabel="Use 1 credit" onCancel={() => setCoverAsk(false)}
        body={<>Writing a cover letter for {job.title} uses 1 of your {CREDITS_TODAY} credits today.</>}
        onConfirm={() => { setCoverAsk(false); setCover(true); }} />
      <Modal open={cover} onClose={() => setCover(false)} title="Cover letter">
        <div className="p-6">
          <h2 className="pr-8 text-lg font-semibold">Cover letter draft</h2>
          <p className="text-sm text-neutral-500">Sample draft for this demo. Generation isn&apos;t connected yet, so no credit was used.</p>
          <pre className="mt-4 max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-xl bg-neutral-50 p-4 font-sans text-sm">{coverLetter(job)}</pre>
          <div className="mt-4 flex justify-end gap-2"><button onClick={() => setCover(false)} className="pill-ghost">Close</button><button onClick={() => { navigator.clipboard?.writeText(coverLetter(job)); toast("Copied"); }} className="pill-accent">Copy</button></div>
        </div>
      </Modal>
      {chat !== null && <ChatPanel job={job} initialAsk={chat || undefined} onClose={() => setChat(null)} />}
      {tour && <Tour step={0} steps={coverTour} onNext={endTour} onExit={endTour} onTry={() => { endTour(); setCoverAsk(true); }} />}
    </>
  );
}
