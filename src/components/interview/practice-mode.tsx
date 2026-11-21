"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Flag, List, Search, X } from "lucide-react";
import { Logo } from "../ui";
import { toast } from "../toast";
import { QuestionArticle, SECTIONS, Tags } from "./question-article";
import { QuestionCard } from "./question-card";
import { LimitedPill, QuestionFilters, applyQFilter, initials, type QFilter } from "./company-browser";
import { langLabel, questionsFor, readStatus, setStatus, type Company, type Lang, type Question, type Status } from "@/mocks/interview";

// Sample walkthrough results. The visitor's code is never executed; runs alternate an example failure and an example success.
type Result = { kind: "fail" | "pass"; cases: { output: string; pass: boolean }[] };
export const sampleResult = (cases: { expected: string }[], attempt: number): Result => {
  const fail = attempt % 2 === 0;
  return { kind: fail ? "fail" : "pass", cases: cases.map((c, i) => (fail && i === cases.length - 1 ? { output: "(sample wrong answer)", pass: false } : { output: c.expected, pass: true })) };
};

function QuestionDrawer({ company, all, currentId, status, onClose }: { company: Company; all: Question[]; currentId: string; status: Record<string, Status>; onClose: () => void }) {
  const [q, setQ] = useState("");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const [qf, setQf] = useState<QFilter>({ topic: "", seniority: "" });
  const list = applyQFilter(all, qf, q);
  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label="Question list" onClick={(e) => e.stopPropagation()} className="animate-pop absolute inset-y-0 left-0 flex w-full max-w-[560px] flex-col bg-[#1f1f1f] text-white">
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <span className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold" style={{ background: company.color }}>{initials(company.name)}</span>
          <h2 className="text-xl font-semibold">{company.name}</h2><LimitedPill dark />
          <button onClick={onClose} aria-label="Close question list" className="ml-auto rounded-lg border border-white/15 p-1.5 hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex items-center gap-2 border-b border-white/10 p-3">
          <QuestionFilters f={qf} set={setQf} dark />
          <label className="ml-auto flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm">
            <Search className="h-4 w-4" /><span className="sr-only">Search questions</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-28 bg-transparent outline-none placeholder:text-white/40" />
          </label>
        </div>
        <nav className="flex-1 overflow-auto">
          {list.map((x) => (
            <QuestionCard key={x.id} q={x} dark active={x.id === currentId} status={status[x.id] ?? "Not Started"}
              href={`/practice/${company.slug}/${x.id}`} onOpen={(e) => { if (x.id === currentId) { e.preventDefault(); onClose(); } }} />
          ))}
        </nav>
      </aside>
    </div>
  );
}

function Editor({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split("\n").length;
  return (
    <div className="flex min-h-0 flex-1 font-mono text-[13px] leading-6">
      <div ref={gutter} aria-hidden="true" className="select-none overflow-hidden py-3 pl-4 pr-3 text-right text-white/35">
        {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <textarea
        aria-label={label}
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop; }}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          e.preventDefault();
          const t = e.currentTarget, s = t.selectionStart;
          onChange(value.slice(0, s) + "    " + value.slice(t.selectionEnd));
          requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 4; });
        }}
        className="min-h-[240px] flex-1 resize-none whitespace-pre bg-transparent py-3 pr-4 text-white/90 caret-blue-400 outline-none"
      />
    </div>
  );
}

export function PracticeMode({ company, questionId }: { company: Company; questionId: string }) {
  const all = useMemo(() => questionsFor(company.slug), [company.slug]);
  const readable = all.filter((x) => !x.locked);
  const idx = readable.findIndex((x) => x.id === questionId);
  const q = readable[idx];
  const [lang, setLang] = useState<Lang>("python");
  const [codes, setCodes] = useState<Record<Lang, string>>(() => ({ ...(q?.starter ?? { python: "", javascript: "", java: "" }) }));
  const [bottom, setBottom] = useState<"Testcase" | "Test Result">("Testcase");
  const [activeCase, setActiveCase] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [section, setSection] = useState<string>(SECTIONS[0].id);
  const [drawer, setDrawer] = useState(false);
  const [status, setStatusMap] = useState<Record<string, Status>>({});
  const article = useRef<HTMLDivElement>(null);
  useEffect(() => setStatusMap(readStatus()), []);

  if (!q) return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#181818] text-white">
      <p>This question isn&apos;t available.</p><Link href={`/interview/${company.slug}`} className="pill-accent">Back to {company.name}</Link>
    </main>
  );

  const go = (id: string) => { setSection(id); document.getElementById(`p-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const run = () => {
    setRunning(true); setBottom("Test Result"); setResult(null);
    setStatus(q.id, "In Progress"); setStatusMap(readStatus());
    // shortcut: no sandboxed runner is wired up, so the visitor's code is never executed; results are a labelled sample walkthrough
    setTimeout(() => { setResult(sampleResult(q.cases ?? [], attempt)); setAttempt((a) => a + 1); setRunning(false); }, 1200);
  };
  const complete = () => { setStatus(q.id, "Completed"); setStatusMap(readStatus()); };
  const prev = readable[idx - 1], next = readable[idx + 1];
  const navBtn = "flex h-9 w-9 items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent";
  const panel = "flex min-h-0 flex-col rounded-2xl border border-white/10 bg-[#262626]";
  const c = q.cases?.[activeCase];
  const st = status[q.id] ?? "Not Started";

  return (
    <div className="flex h-screen flex-col bg-[#181818] text-white">
      <header className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/jobs" aria-label="CareerMonke home"><Logo withText={false} /></Link>
        <button onClick={() => setDrawer(true)} className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 font-semibold hover:bg-white/10"><List className="h-4 w-4" />Question List</button>
        <div className="flex overflow-hidden rounded-lg border border-white/15">
          {prev ? <Link href={`/practice/${company.slug}/${prev.id}`} aria-label="Previous question" className={navBtn}><ChevronLeft className="h-4 w-4" /></Link>
            : <button disabled aria-label="Previous question" className={navBtn}><ChevronLeft className="h-4 w-4" /></button>}
          {next ? <Link href={`/practice/${company.slug}/${next.id}`} aria-label="Next question" className={`${navBtn} border-l border-white/15`}><ChevronRight className="h-4 w-4" /></Link>
            : <button disabled aria-label="Next question" className={`${navBtn} border-l border-white/15`}><ChevronRight className="h-4 w-4" /></button>}
        </div>
        <span className="hidden font-semibold sm:inline">{company.name}</span><span className="hidden md:inline"><LimitedPill dark /></span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => toast("Thanks, we'll review this question")} className="hidden items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10 sm:flex"><Flag className="h-4 w-4" />Report Issue</button>
          <Link href={`/interview/${company.slug}`} className="rounded-lg border border-blue-400/40 bg-blue-500/20 px-3 py-1.5 text-sm font-semibold hover:bg-blue-500/30">Exit Practice Mode</Link>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 gap-4 overflow-auto px-4 pb-4 lg:grid-cols-2 lg:overflow-hidden">
        <section className={`${panel} min-h-[60vh] min-w-0 lg:min-h-0`}>
          <nav aria-label="Question sections" className="flex items-center gap-1 overflow-x-auto border-b border-white/10 px-3">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => go(s.id)} aria-current={section === s.id || undefined} className={`shrink-0 border-b-2 px-2 py-3 text-sm ${section === s.id ? "border-white font-semibold" : "border-transparent text-white/70 hover:text-white"}`}>{s.label}</button>
            ))}
            <span className="ml-auto shrink-0 pl-2 text-sm italic text-white/80" data-testid="status">{st}</span>
          </nav>
          <div ref={article} className="min-h-0 flex-1 overflow-auto p-5">
            <div className="mb-6 space-y-3 border-b border-white/10 pb-6">
              <div className="flex gap-1.5 text-xs"><span className="rounded bg-white/10 px-1.5 py-0.5">{q.topic}</span><span className="rounded bg-white/10 px-1.5 py-0.5">{q.type}</span></div>
              <h1 className="text-2xl font-semibold">{q.title}</h1>
              <Tags q={q} dark />
            </div>
            <QuestionArticle q={q} dark idPrefix="p-" />
          </div>
        </section>

        <div className="flex min-h-0 min-w-0 flex-col gap-4">
          <section className={`${panel} min-h-[320px] flex-[3] lg:min-h-0`}>
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
              <p className="font-semibold">Code</p>
              <label className="sr-only" htmlFor="code-lang">Programming language</label>
              <select id="code-lang" value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="ml-auto rounded-md border border-white/15 bg-[#1f1f1f] px-2 py-1.5 text-sm">
                {(Object.keys(langLabel) as Lang[]).map((l) => <option key={l} value={l}>{langLabel[l]}</option>)}
              </select>
              <button onClick={run} disabled={running} className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500 disabled:bg-white/10">{running ? "Running..." : "Run"}</button>
            </div>
            <Editor label={`${langLabel[lang]} code editor`} value={codes[lang]} onChange={(v) => setCodes((cs) => ({ ...cs, [lang]: v }))} />
          </section>

          <section className={`${panel} min-h-[280px] flex-[2] lg:min-h-0`}>
            <div role="tablist" className="flex gap-6 border-b border-white/10 px-4">
              {(["Testcase", "Test Result"] as const).map((t) => (
                <button key={t} role="tab" aria-selected={bottom === t} onClick={() => setBottom(t)} className={`border-b-2 py-3 text-sm ${bottom === t ? "border-white font-semibold" : "border-transparent text-white/70"}`}>{t}</button>
              ))}
            </div>
            {bottom === "Test Result" && running ? (
              <p className="flex flex-1 items-center justify-center p-6 text-sm text-white/70">Running sample cases...</p>
            ) : bottom === "Test Result" && !result ? (
              <p className="flex flex-1 items-center justify-center p-6 text-sm text-white/60">Run your code to see results here.</p>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                {bottom === "Test Result" && result && (
                  <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2">
                    <p className={`font-semibold ${result.kind === "pass" ? "text-green-400" : "text-red-400"}`}>{result.kind === "pass" ? "Sample result: all cases passed" : "Sample result: 1 case failed"}</p>
                    <span className="text-xs text-white/60">· Demo only: your code was not executed{result.kind === "fail" ? ". Run again to see a passing example." : "."}</span>
                    {result.kind === "pass" && (st === "Completed"
                      ? <span className="ml-auto rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs text-green-300">Marked complete (demo)</span>
                      : <button onClick={complete} className="ml-auto rounded-md bg-green-600 px-3 py-1 text-xs font-semibold hover:bg-green-500">Mark question complete</button>)}
                  </div>
                )}
                <div className="flex min-h-0 flex-1">
                  <div role="tablist" aria-label="Test cases" className="flex w-28 shrink-0 flex-col gap-1 border-r border-white/10 p-2">
                    {q.cases?.map((_, i) => (
                      <button key={i} role="tab" aria-selected={activeCase === i} onClick={() => setActiveCase(i)} className={`rounded-lg px-3 py-1.5 text-left text-sm ${activeCase === i ? "bg-white/10" : "text-white/70 hover:bg-white/5"}`}>Case {i + 1}{bottom === "Test Result" && result && <span className={result.cases[i]?.pass ? "text-green-400" : "text-red-400"}> {result.cases[i]?.pass ? "✓" : "✗"}</span>}</button>
                    ))}
                  </div>
                  {c && (
                    <div className="min-w-0 flex-1 space-y-3 overflow-auto p-4 text-sm">
                      {bottom === "Testcase" ? (
                        <>
                          <p className="font-semibold">Input</p>
                          {Object.entries(c.input).map(([k, v]) => <div key={k}><p className="mb-1 text-white/70">{k}</p><p className="rounded-md bg-black/30 px-3 py-2 font-mono">{v}</p></div>)}
                          <p className="font-semibold">Expected</p><p className="rounded-md bg-black/30 px-3 py-2 font-mono">{c.expected}</p>
                          <p className="font-semibold">Explanation</p><p className="text-white/80">{c.explanation}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold">Sample output <span className="font-normal text-white/50">(illustrative, not from your code)</span></p><p className="rounded-md bg-black/30 px-3 py-2 font-mono text-white/80">{result?.cases[activeCase]?.output}</p>
                          <p className="font-semibold">Expected</p><p className="rounded-md bg-black/30 px-3 py-2 font-mono">{c.expected}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      {drawer && <QuestionDrawer company={company} all={all} currentId={q.id} status={status} onClose={() => setDrawer(false)} />}
    </div>
  );
}
