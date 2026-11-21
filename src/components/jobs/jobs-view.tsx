"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, CircleHelp, Plus, Search, Sparkles } from "lucide-react";
import { PageHeader } from "../shell";
import { EmptyState, Tabs } from "../ui";
import { JobCard, JobCardSkeleton } from "../job-card";
import { useApp, type AppStatus } from "../app-state";
import { AutofillModal, ChatPanel, Tour, WelcomePopup, useWelcomeFlow } from "../welcome-flow";
import { QuickFilters } from "./quick-filters";
import { FilterEditor } from "./filter-editor";
import { JobsRail, ResumeCompare } from "./rail";
import { useGuideAction } from "../guide";
import { jobs, type Job } from "@/mocks/jobs";
import { blankFilter, matches, readSaved, relatedJobs, writeSaved, type Filter, type SavedFilter } from "@/mocks/filters";

const TABS = ["Recommended", "Liked", "Applied", "External"] as const;
type Tab = (typeof TABS)[number];
const SORTS = ["Recommended", "Top Matched", "Most Recent"] as const;
type Sort = (typeof SORTS)[number];
const STATUSES: AppStatus[] = ["Applied", "Interviewing", "Offer Received", "Rejected", "Archived"];

export const isJobUrl = (s: string) => {
  try { const u = new URL(s.trim()); return /^https?:$/.test(u.protocol) && u.hostname.includes("."); } catch { return false; }
};

const sorters: Record<Sort, (a: Job, b: Job) => number> = {
  Recommended: () => 0,
  "Top Matched": (a, b) => b.match - a.match,
  "Most Recent": (a, b) => a.postedHours - b.postedHours,
};

// Tab, sort and search live in the URL so a reload or shared link keeps them.
const readUrl = () => {
  const p = new URLSearchParams(location.search);
  const tab = TABS.find((t) => t.toLowerCase() === p.get("tab")) ?? "Recommended";
  const sort = SORTS.find((s) => s === p.get("sort")) ?? "Recommended";
  return { tab, sort, q: p.get("q") ?? "" };
};
const writeUrl = (tab: Tab, sort: Sort, q: string) => {
  const p = new URLSearchParams(location.search);
  p.delete("welcome");
  tab === "Recommended" ? p.delete("tab") : p.set("tab", tab.toLowerCase());
  sort === "Recommended" ? p.delete("sort") : p.set("sort", sort);
  q ? p.set("q", q) : p.delete("q");
  history.replaceState(null, "", `${location.pathname}${p.size ? `?${p}` : ""}`);
};

function SortMenu({ value, onChange }: { value: Sort; onChange: (s: Sort) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)} className="chip">{value}<ChevronDown className="h-3.5 w-3.5" /></button>
      {open && (
        <ul role="listbox" aria-label="Sort jobs" className="animate-pop absolute right-0 top-10 z-20 w-40 rounded-xl border border-line bg-white py-1 shadow-lg">
          {SORTS.map((s) => <li key={s} role="option" aria-selected={s === value}><button onClick={() => { onChange(s); setOpen(false); }} className={`w-full px-3 py-2 text-left text-sm ${s === value ? "bg-accent-tint font-semibold text-accent" : "hover:bg-neutral-50"}`}>{s}</button></li>)}
        </ul>
      )}
    </div>
  );
}

const Empty = ({ text, onCta }: { text: string; onCta?: () => void }) => (
  <div className="pt-16 text-center"><EmptyState text={text} />{onCta && <button onClick={onCta} className="pill-dark mt-4 px-10">View Recommended Jobs</button>}</div>
);

/** Honest empty state: no fake exact matches. One-click reset plus clearly labelled related sample jobs. */
function NoExactMatches({ f, onReset, onEdit, onAsk }: { f: Filter; onReset: () => void; onEdit: () => void; onAsk: (j: Job) => void }) {
  const related = relatedJobs(f);
  return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <p className="font-semibold">No sample jobs match every filter you set.</p>
        <p className="mt-1 text-sm text-neutral-600">This demo has a limited set of sample jobs. Reset to keep just your job function, or edit the filters.</p>
        <div className="mt-4 flex justify-center gap-2"><button onClick={onReset} className="pill-accent">Reset filters</button><button onClick={onEdit} className="pill-ghost">Edit filters</button></div>
      </div>
      <p className="text-sm font-semibold text-neutral-600">Related sample jobs <span className="font-normal">(not exact matches for your filters)</span></p>
      {related.map((j) => <JobCard key={j.id} job={j} onAsk={onAsk} />)}
    </div>
  );
}

export function JobsView() {
  const { liked, applied, external, hidden, addExternal, setStatus } = useApp();
  const [tab, setTab] = useState<Tab>("Recommended");
  const [sort, setSort] = useState<Sort>("Recommended");
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<SavedFilter[]>([]);
  const [draftFilter, setDraftFilter] = useState<Filter | null>(null);
  const [editor, setEditor] = useState<null | { savedId?: string }>(null);
  const [likedTab, setLikedTab] = useState<"Active" | "Closed">("Active");
  const [status, setStatusTab] = useState<AppStatus>("Applied");
  const [appliedSearch, setAppliedSearch] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [urlErr, setUrlErr] = useState("");
  const [activeId, setActiveId] = useState("");
  const [compare, setCompare] = useState<Job | null>(null);
  const [askJob, setAskJob] = useState<Job | null>(null);
  const flow = useWelcomeFlow();

  useEffect(() => {
    const u = readUrl(); setTab(u.tab); setSort(u.sort); setQ(u.q);
    const s = readSaved(); setSaved(s); setActiveId(s[0]?.id ?? ""); setDraftFilter(s[0]?.filter ?? null);
    setReady(true);
  }, []);
  useEffect(() => { if (ready) writeUrl(tab, sort, q); }, [tab, sort, q, ready]);

  const active = saved.find((x) => x.id === activeId) ?? saved[0];
  const filter = active?.filter ?? draftFilter;
  const filterKey = JSON.stringify(filter);
  // Brief skeleton whenever the feed's inputs change, like a real fetch would.
  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 300); return () => clearTimeout(t); }, [sort, filterKey]);

  const persist = (list: SavedFilter[]) => { setSaved(list); writeSaved(list); };
  const applyFilter = (f: Filter) => (active ? persist(saved.map((s) => (s.id === active.id ? { ...s, filter: f } : s))) : setDraftFilter(f));
  // Multiple saved filters are a Pro feature, unlocked in this demo (up to 5, as on Pro).
  const addFilter = () => {
    if (!filter || saved.length >= 5) return;
    const id = `f${Date.now()}`;
    persist([...saved, { id, filter: { ...structuredClone(filter), title: `${filter.title} (copy)` } }]);
    setActiveId(id); setEditor({ savedId: id });
  };
  const patch = (p: Partial<Filter>) => filter && applyFilter({ ...filter, ...p });

  const feed = useMemo(() => {
    if (!filter) return [];
    const needle = q.trim().toLowerCase();
    return jobs.filter((j) => !hidden.includes(j.id) && matches(j, filter) && (!needle || `${j.title} ${j.company}`.toLowerCase().includes(needle))).sort(sorters[sort]);
  }, [filter, q, sort, hidden]);
  const appliedHere = applied.filter((a) => a.status === status && (!appliedSearch || jobs.find((j) => j.id === a.id)?.title.toLowerCase().includes(appliedSearch.toLowerCase())));
  const addJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJobUrl(url)) { setUrlErr("Oops! Please enter a proper job posting URL."); return; }
    addExternal(url.trim()); setUrl(""); setUrlErr("");
  };
  const chatJob = askJob ?? feed[0] ?? jobs[0];
  useGuideAction("filters", () => setEditor({ savedId: active?.id }));
  useGuideAction("tracker", () => { setTab("Applied"); setStatusTab("Interviewing"); });
  useGuideAction("resume-compare", () => setCompare(feed[0] ?? jobs[0]));
  useGuideAction("autofill", () => flow.setAutofill(true));
  const editing = editor?.savedId ? saved.find((x) => x.id === editor.savedId)?.filter : undefined;

  if (!ready || !filter) return null;
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
              <div className="flex flex-col-reverse items-end gap-2 sm:flex-row sm:items-start">
                <div className="w-full sm:flex-1"><QuickFilters f={filter} apply={patch} onAllFilters={() => setEditor({})} onHidden={() => patch({ hiddenJobs: !filter.hiddenJobs })} /></div>
                <span title="Jobs are matched to your saved filter and profile" className="mt-2 hidden text-neutral-500 sm:block"><CircleHelp className="h-5 w-5" /></span>
                <SortMenu value={sort} onChange={setSort} />
              </div>
              <p className="sr-only" aria-live="polite">{loading ? "Loading jobs" : `${feed.length} jobs`}</p>
              {loading ? <div data-testid="feed-loading" className="space-y-4">{[0, 1, 2].map((i) => <JobCardSkeleton key={i} />)}</div>
                : feed.length ? feed.map((j) => <JobCard key={j.id} job={j} onAsk={setAskJob} />)
                : <NoExactMatches f={filter} onReset={() => applyFilter({ ...blankFilter(), title: filter.title, jobFunctions: filter.jobFunctions })} onEdit={() => setEditor({})} onAsk={setAskJob} />}
            </>
          )}

          {tab === "Liked" && (
            <>
              <div role="tablist" className="flex gap-6 text-[15px]">
                {(["Active", "Closed"] as const).map((t) => {
                  const n = t === "Active" ? liked.length : 0; // mock jobs never close
                  return <button key={t} role="tab" aria-selected={likedTab === t} onClick={() => setLikedTab(t)} className={likedTab === t ? "font-medium" : "text-neutral-400"}>{t}({n})</button>;
                })}
              </div>
              {likedTab === "Active" && liked.length
                ? jobs.filter((j) => liked.includes(j.id)).map((j) => <JobCard key={j.id} job={j} onAsk={setAskJob} />)
                : <Empty text={likedTab === "Active" ? "No liked jobs yet? Explore recommended ones to find some you'd like!" : "No closed jobs."} onCta={likedTab === "Active" ? () => setTab("Recommended") : undefined} />}
            </>
          )}

          {tab === "Applied" && (
            <>
              <div className="flex items-center gap-5">
                <div role="tablist" className="flex flex-1 flex-wrap gap-x-6 gap-y-2 text-[15px]">
                  {STATUSES.map((s) => <button key={s} role="tab" aria-selected={status === s} onClick={() => setStatusTab(s)} className={status === s ? "font-medium" : "text-neutral-400"}>{s}({applied.filter((a) => a.status === s).length})</button>)}
                </div>
                {appliedSearch === null
                  ? <button aria-label="Search applied jobs" onClick={() => setAppliedSearch("")} className="rounded-lg bg-white p-2 shadow-sm"><Search className="h-4 w-4" /></button>
                  : <input autoFocus aria-label="Search applied jobs" value={appliedSearch} onChange={(e) => setAppliedSearch(e.target.value)} onBlur={() => !appliedSearch && setAppliedSearch(null)} placeholder="Search" className="input w-44 bg-white py-1.5" />}
              </div>
              {appliedHere.length
                ? appliedHere.map((a) => {
                    const j = jobs.find((x) => x.id === a.id)!;
                    return (
                      <JobCard key={a.id} job={j} status={a.sample ? `Sample application · ${a.date}` : `Applied ${a.date}`} onAsk={setAskJob} extra={(
                        <label className="flex items-center gap-1 text-xs">Status
                          <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value as AppStatus)} className="rounded-md border border-line px-1.5 py-1">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                        </label>
                      )} />
                    );
                  })
                : <Empty text={applied.length ? `Nothing in ${status} yet.` : "No applied jobs yet? Explore recommended ones to find some you'd like!"} onCta={() => setTab("Recommended")} />}
            </>
          )}

          {tab === "External" && (
            <>
              <form className="flex gap-3" onSubmit={addJob} noValidate>
                <label className="sr-only" htmlFor="ext-url">Job URL</label>
                <input id="ext-url" value={url} onChange={(e) => { setUrl(e.target.value); setUrlErr(""); }} aria-invalid={!!urlErr} aria-describedby={urlErr ? "ext-err" : undefined} placeholder="Paste a job URL here to add this job" className="input bg-white" />
                <button className="pill-accent shrink-0 rounded-lg"><Plus className="h-4 w-4" />Add Job</button>
              </form>
              {urlErr && <p id="ext-err" role="alert" className="text-sm text-red-500">{urlErr}</p>}
              {external.length ? external.map((x, i) => (
                <div key={i} className="card flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0"><p className="truncate font-semibold capitalize">{x.title}</p><a href={x.url} target="_blank" rel="noreferrer noopener" className="block truncate text-xs text-accent">{x.url}</a></div>
                  <span className="shrink-0 text-xs text-neutral-500">Added {x.date}</span>
                </div>
              )) : <Empty text="Import job postings from other sources to customize your resume and get a job match analysis." />}
            </>
          )}
        </main>
        <JobsRail saved={saved} activeId={active?.id ?? ""} onSelect={setActiveId} onAdd={addFilter} onEdit={(id) => setEditor({ savedId: id })} onAutofill={() => flow.setAutofill(true)} onCustomize={() => setCompare(feed[0] ?? jobs[0])} />
      </div>

      <button onClick={() => setAskJob(chatJob)} aria-label="Ask Monke" className="fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 md:bottom-6"><Sparkles className="h-6 w-6 text-accent" /></button>

      {editor && (
        <FilterEditor initial={editing ?? filter} editingSaved={!!editor.savedId}
          onClose={() => setEditor(null)}
          onConfirm={(f) => {
            if (editor.savedId) { persist(saved.map((x) => (x.id === editor.savedId ? { ...x, filter: f } : x))); setActiveId(editor.savedId); }
            else applyFilter(f);
            setEditor(null);
          }}
          onDelete={() => { const rest = saved.filter((x) => x.id !== editor.savedId); persist(rest); setActiveId(rest[0]?.id ?? ""); setDraftFilter(filter); setEditor(null); }} />
      )}
      {compare && <ResumeCompare job={compare} onClose={() => setCompare(null)} />}
      {flow.popup && <WelcomePopup open base={filter} onConfirm={(levels, extra) => { applyFilter({ ...filter, levels, jobFunctions: [...new Set([...filter.jobFunctions, ...extra])] }); flow.confirmPopup(); }} />}
      {flow.tour !== null && !loading && <Tour step={flow.tour} onNext={flow.nextTour} onExit={flow.exitTour} onTry={flow.tryIt} />}
      {(flow.chat || askJob) && <ChatPanel key={chatJob.id} job={chatJob} onClose={() => { flow.setChat(false); setAskJob(null); }} />}
      <AutofillModal open={flow.autofill} onClose={() => flow.setAutofill(false)} />
    </>
  );
}
