"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, CircleAlert, CircleCheck, CircleX, Download, FileText, Info, Pencil, Sparkles, ThumbsUp, Wand2, X, Zap } from "lucide-react";
import { CompanyLogo, Modal, useFocusTrap } from "../ui";
import { toast } from "../toast";
import { useApp } from "../app-state";
import { Switch } from "./filter-controls";
import { RESUME_DEMO_KEY } from "./rail";
import { demoStore } from "@/lib/demo";
import { LOW_SCORE, SAMPLE_PERSON, SAMPLE_RESUMES, rating, resumeFit, type Keyword } from "@/mocks/resume-fit";
import type { Job } from "@/mocks/jobs";

const DEMO_NOTE = "Demo: sample result, nothing is generated or sent.";
const NO_CHANGE = "Demo: no changes are made";
const STEPS = ["See Your Difference", "Align Your Resume", "Review Your New Resume"];

/** Semicircle score gauge on a 0-10 scale. */
function Gauge({ score, size = 140 }: { score: number; size?: number }) {
  const r = 50, len = Math.PI * r, pct = Math.min(1, score / 10);
  const color = score < LOW_SCORE ? "#EF4444" : score < 8 ? "#F59E0B" : "#16A34A";
  const a = Math.PI * (1 - pct), dot = [60 + r * Math.cos(a), 60 - r * Math.sin(a)];
  return (
    <div className="flex flex-col items-center" style={{ width: size }} role="img" aria-label={`Sample score ${score.toFixed(1)} out of 10, ${rating(score)}`}>
      <svg viewBox="0 0 120 66" width={size} aria-hidden="true">
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#E5E7EB" strokeWidth="9" strokeLinecap="round" />
        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${len * pct} ${len}`} />
        <circle cx={dot[0]} cy={dot[1]} r="5" fill="white" stroke="#111827" strokeWidth="2" />
        <text x="60" y="58" textAnchor="middle" fontSize="26" fontWeight="600" fill="#111827">{score.toFixed(1)}</text>
      </svg>
      <span className="mt-1 rounded bg-neutral-100 px-4 py-0.5 text-sm font-medium">{rating(score)}</span>
    </div>
  );
}

const Mark = ({ kind }: { kind: "ok" | "warn" | "bad" }) => kind === "ok"
  ? <CircleCheck className="h-6 w-6 shrink-0 fill-green-500 text-white" aria-label="Match" />
  : kind === "warn" ? <CircleAlert className="h-6 w-6 shrink-0 fill-amber-400 text-white" aria-label="Partial" />
  : <CircleX className="h-6 w-6 shrink-0 fill-red-500 text-white" aria-label="Gap" />;

/** "Customize Your Resume in 10 seconds": shown before Apply on a low-score sample job. */
export function CustomizePrompt({ job, onFix, onSkip, onClose }: { job: Job; onFix: () => void; onSkip: () => void; onClose: () => void }) {
  const { noRemind, setNoRemind } = useApp();
  const { score, keywords } = resumeFit(job);
  const missing = keywords.filter((k) => !k.has);
  return (
    <Modal open onClose={onClose} title="Customize Your Resume in 10 seconds">
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <h2 className="pr-6 text-xl font-semibold">Customize Your Resume in 10 seconds</h2>
        <Gauge score={score} size={120} />
        <p className="font-medium">Low match for {job.title} at {job.company}</p>
        <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700"><Info className="h-4 w-4 shrink-0" />In this demo, scores under 6.0 count as low.</p>
        <div className="w-full text-left">
          <p className="mb-2 text-sm font-medium">Missing skills</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.slice(0, 6).map((k) => <span key={k.name} className="rounded bg-neutral-100 px-2 py-1 text-sm">{k.name}</span>)}
            {missing.length > 6 && <span className="rounded bg-neutral-100 px-2 py-1 text-sm text-neutral-500">+{missing.length - 6} more</span>}
          </div>
        </div>
        <button onClick={onFix} className="pill-accent mt-2 w-full rounded-lg py-3">Fix My Resume Now</button>
        <button onClick={onSkip} className="text-sm text-neutral-600 underline">Apply Without Customizing</button>
        <label className="flex items-center gap-2 text-xs text-neutral-500">
          <input type="checkbox" checked={noRemind} onChange={(e) => setNoRemind(e.target.checked)} className="h-3.5 w-3.5 accent-[#2563EB]" />Don&apos;t remind me again (until you reload)
        </label>
        <p className="text-xs text-neutral-400">{DEMO_NOTE}</p>
      </div>
    </Modal>
  );
}

/**
 * Full-screen 3-step demo flow: see the difference, pick sections and keywords, review a sample rewrite.
 * Every result is pre-written from the job's mock data. `onApply` (optional) continues to the simulated Apply form.
 */
export function ResumeCompare({ job, onClose, onApply }: { job: Job; onClose: () => void; onApply?: () => void }) {
  const { credits, spendCredit, markCustomized } = useApp();
  const fit = resumeFit(job);
  const [stage, setStage] = useState(0);
  const [resumeId, setResumeId] = useState(SAMPLE_RESUMES[0].id);
  const [sections, setSections] = useState(["Summary", "Skills", "Work Experience"]);
  const [full, setFull] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState<Keyword[]>([]);
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState(false);
  const ref = useFocusTrap<HTMLDivElement>(true);
  const resume = SAMPLE_RESUMES.find((r) => r.id === resumeId)!;
  const missing = [...fit.keywords.filter((k) => !k.has), ...custom];
  const nothing = !sections.length && !picked.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => {
    if (!busy) return;
    const t = setTimeout(() => {
      setBusy(false); setStage(2);
      if (!used) { spendCredit(); setUsed(true); }
      markCustomized(job.id, fit.after); demoStore.setItem(RESUME_DEMO_KEY, "1");
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  const chip = "rounded-full px-2.5 py-0.5 text-xs font-medium";
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Generate Your Custom Resume" className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
        <button onClick={onClose} aria-label="Close" className="rounded-lg border border-line p-1.5 hover:bg-neutral-50"><X className="h-5 w-5" /></button>
        <h2 className="text-lg font-semibold">Generate Your Custom Resume</h2>
        {used && <span className={`${chip} bg-neutral-100`}>1 credit consumed</span>}
        <span className={`${chip} bg-accent text-white`} title="Demo credits, free">{credits} credit{credits === 1 ? "" : "s"} available today · Demo credits, free</span>
        <span className={`${chip} ml-auto bg-amber-50 text-amber-800`}>{DEMO_NOTE}</span>
      </div>
      {stage < 2 && (
        <ol className="flex flex-wrap items-center justify-center gap-3 py-3 text-sm" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === stage ? "step" : undefined} className={`flex items-center gap-2 ${i <= stage ? "font-medium" : "text-neutral-400"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${i <= stage ? "bg-accent" : "bg-neutral-400"}`}>{i + 1}</span>{s}
              {i < 2 && <span className={`ml-1 h-px w-10 ${i < stage ? "bg-accent" : "bg-neutral-200"}`} />}
            </li>
          ))}
        </ol>
      )}

      {busy ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md rounded-2xl border border-line p-10 text-center" role="status">
            <Sparkles className="mx-auto h-8 w-8 text-accent" />
            <div className="mx-auto mt-6 h-0.5 w-48 overflow-hidden bg-neutral-100"><div className="h-0.5 w-1/2 animate-pulse bg-accent" /></div>
            <p className="mt-6 font-semibold">Rewriting sample resume (demo)...</p>
            <p className="mt-2 text-sm text-neutral-600">Pre-written sample text; nothing is generated.</p>
          </div>
        </div>
      ) : stage === 0 ? (
        <Step1 job={job} score={fit.score} keywords={fit.keywords} resumeId={resumeId} setResumeId={setResumeId} />
      ) : stage === 1 ? (
        <Step2 missing={missing} sections={sections} setSections={setSections} full={full} setFull={setFull} picked={picked} setPicked={setPicked}
          addCustom={(name, group) => { if (!missing.some((k) => k.name.toLowerCase() === name.toLowerCase())) setCustom([...custom, { name, group, has: false }]); setPicked([...new Set([...picked, name])]); }} />
      ) : (
        <Step3 job={job} before={fit.score} after={fit.after} resume={resume} has={fit.keywords.filter((k) => k.has).map((k) => k.name)} added={sections.includes("Skills") ? picked : []}
          summary={sections.includes("Summary")} work={sections.includes("Work Experience") ? (full ? "all" : 2) : 0} />
      )}

      {!busy && (
        <div className="flex flex-wrap justify-center gap-3 border-t border-line p-4 [body:has([aria-label='Guided_demo'])_&]:pb-32">
          {/* pb-32 keeps the buttons clear of the guided-demo bar when it is showing. */}
          {stage > 0 && <button onClick={() => setStage(stage - 1)} aria-label="Back" className="rounded-full bg-accent-tint p-3 text-accent hover:bg-blue-100"><ArrowLeft className="h-5 w-5" /></button>}
          {stage === 0 && <button onClick={() => setStage(1)} className="pill-accent px-8 py-3">Improve My Resume for This Job</button>}
          {stage === 1 && <button onClick={() => setBusy(true)} disabled={nothing} className="pill-accent px-8 py-3 disabled:opacity-40">Generate My New Resume</button>}
          {stage === 2 && (
            <>
              <button onClick={() => download(job, resume.title)} className="pill-ghost px-6 py-3"><Download className="h-4 w-4" />Download Resume</button>
              {onApply
                ? <button onClick={onApply} className="pill bg-ink px-8 py-3 text-white hover:bg-neutral-800"><Zap className="h-4 w-4" />Apply Now</button>
                : <button onClick={onClose} className="pill-accent px-8 py-3">Done</button>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function download(job: Job, title: string) {
  try {
    const text = `${SAMPLE_PERSON.name} - ${title}\nSample resume for ${job.title} at ${job.company} (demo).\nThis file is a static sample: nothing was generated.\n`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = "sample-resume-demo.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  } catch { toast("Demo: download is simulated"); }
}

function Step1({ job, score, keywords, resumeId, setResumeId }: { job: Job; score: number; keywords: Keyword[]; resumeId: string; setResumeId: (id: string) => void }) {
  const resume = SAMPLE_RESUMES.find((r) => r.id === resumeId)!;
  const titleOk = job.title.toLowerCase().includes(resume.title.toLowerCase());
  const has = keywords.filter((k) => k.has).length;
  const th = "w-56 p-4 text-left font-medium";
  return (
    <div className="flex-1 overflow-auto p-4 md:px-10">
      <div className="card mx-auto max-w-6xl overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div>
            <h3 className="text-2xl font-semibold">Your Resume is a {score < LOW_SCORE ? "Low" : score < 8 ? "Fair" : "Strong"} Match for This Job</h3>
            {score < LOW_SCORE && <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1 text-sm text-red-700"><Info className="h-4 w-4" />In this demo, scores under 6.0 count as low. The next steps show a sample fix.</p>}
          </div>
          <Gauge score={score} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <tbody className="divide-y divide-line border-t border-line">
              <tr>
                <th className={th}>Overview</th>
                <td className="p-4"><span className="flex items-center gap-2"><CompanyLogo initials={job.initials} color={job.color} size={36} /><span className="min-w-0"><small className="block text-neutral-500">{job.company}</small><b className="block truncate text-base">{job.title}</b></span></span></td>
                <td className="p-4">
                  <span className="flex items-center gap-2"><FileText className="h-6 w-6 text-neutral-500" /><span className="flex-1"><small className="block text-neutral-500">Your resume (sample)</small><b className="text-base">{resume.file}</b></span>
                    <label className="relative"><span className="sr-only">Select resume</span>
                      <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className="appearance-none rounded-full bg-accent-tint py-1 pl-3 pr-7 text-xs font-medium text-accent">
                        {SAMPLE_RESUMES.map((r) => <option key={r.id} value={r.id}>{r.file}</option>)}
                      </select><ChevronDown className="pointer-events-none absolute right-2 top-1.5 h-3.5 w-3.5 text-accent" />
                    </label>
                  </span>
                </td>
              </tr>
              <tr className="bg-neutral-50/60"><th className={th}><span className="flex items-center justify-between gap-2">Job Title<Mark kind={titleOk ? "ok" : "bad"} /></span></th><td className="p-4">{job.title}</td><td className="p-4">{resume.title}</td></tr>
              <tr><th className={th}><span className="flex items-center justify-between gap-2">Years of Experience<Mark kind={resume.years >= job.expMin ? "ok" : "bad"} /></span></th><td className="p-4">{job.exp}</td><td className="p-4">{resume.years}+ years exp</td></tr>
              <tr className="bg-neutral-50/60"><th className={th}><span className="flex items-center justify-between gap-2">Industry Experience<Mark kind="warn" /></span></th>
                <td className="p-4" colSpan={2}><span className="flex flex-wrap gap-1.5">{[job.industryName, ...job.tags.slice(1), job.stage].filter((x, i, a) => x && a.indexOf(x) === i).map((t) => <span key={t} className="rounded bg-neutral-100 px-2 py-1">{t}</span>)}</span></td></tr>
              <tr><th className={th}><span className="flex items-center justify-between gap-2">ATS Job Keywords ({has}/{keywords.length})<Mark kind={has / keywords.length >= 0.6 ? "ok" : "bad"} /></span></th>
                <td className="p-4" colSpan={2}><span className="flex flex-wrap gap-1.5">{keywords.map((k) => k.has
                  ? <span key={k.name} className="flex items-center gap-1 rounded bg-accent-tint px-2 py-1 text-accent"><ThumbsUp className="h-3.5 w-3.5" aria-label="On your resume" />{k.name}</span>
                  : <span key={k.name} className="rounded bg-neutral-100 px-2 py-1">{k.name}</span>)}</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Step2({ missing, sections, setSections, full, setFull, picked, setPicked, addCustom }: {
  missing: Keyword[]; sections: string[]; setSections: (v: string[]) => void; full: boolean; setFull: (v: boolean) => void;
  picked: string[]; setPicked: (v: string[]) => void; addCustom: (name: string, group: Keyword["group"]) => void;
}) {
  const all = picked.length === missing.length && missing.length > 0;
  const toggle = (list: string[], v: string, on: boolean) => (on ? [...list, v] : list.filter((x) => x !== v));
  const box = "flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm";
  return (
    <div className="grid flex-1 content-start gap-4 overflow-auto p-4 md:grid-cols-2 md:px-10">
      <section className="card space-y-2 p-5">
        <h3 className="mb-3 text-lg font-semibold">1. Choose sections to enhance</h3>
        {["Summary", "Skills", "Work Experience"].map((s) => (
          <div key={s} className="rounded-lg bg-neutral-50">
            <label className={box}><input type="checkbox" checked={sections.includes(s)} onChange={(e) => setSections(toggle(sections, s, e.target.checked))} className="h-4 w-4 accent-[#2563EB]" />{s}</label>
            {s === "Work Experience" && sections.includes(s) && (
              <fieldset className="space-y-1 px-9 pb-3 text-sm"><legend className="sr-only">Work experience edit depth</legend>
                <label className="flex items-center gap-2"><input type="radio" name="depth" checked={!full} onChange={() => setFull(false)} className="accent-[#2563EB]" />Quick Edit (First 2 key experiences)</label>
                <label className="flex items-center gap-2"><input type="radio" name="depth" checked={full} onChange={() => setFull(true)} className="accent-[#2563EB]" />Full Edit (All experiences, longer processing time)</label>
              </fieldset>
            )}
          </div>
        ))}
      </section>
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">2. Add missing ATS job keywords ({picked.length}/{missing.length})</h3>
          <button onClick={() => setPicked(all ? [] : missing.map((k) => k.name))} className="text-sm underline">{all ? "Unselect all" : "Select all"}</button>
        </div>
        {(["Functional Skills", "Tools"] as const).map((g) => (
          <div key={g} className="mb-4">
            <p className="mb-2 text-sm font-medium">{g}</p>
            <div className="flex flex-wrap gap-2">
              {missing.filter((k) => k.group === g).map((k) => (
                <label key={k.name} className={box}><input type="checkbox" checked={picked.includes(k.name)} onChange={(e) => setPicked(toggle(picked, k.name, e.target.checked))} className="h-4 w-4 accent-[#2563EB]" />{k.name}</label>
              ))}
              <form onSubmit={(e) => { e.preventDefault(); const i = e.currentTarget.elements.namedItem("kw") as HTMLInputElement; const v = i.value.trim(); if (v) addCustom(v, g); i.value = ""; }}>
                <input name="kw" aria-label={`Add ${g.toLowerCase()} keyword`} placeholder="Add Keywords" className="w-40 rounded-lg bg-neutral-50 px-3 py-2 text-sm" />
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Step3({ job, before, after, resume, has, added, summary, work }: {
  job: Job; before: number; after: number; resume: { title: string; years: number }; has: string[]; added: string[]; summary: boolean; work: 0 | 2 | "all";
}) {
  const [tab, setTab] = useState<"Rewrite" | "Editor" | "Style">("Rewrite");
  const [serif, setSerif] = useState(false);
  const [compact, setCompact] = useState(false);
  const [fit, setFit] = useState(true);
  const hl = (on: boolean) => (on ? "bg-accent-tint" : "");
  const bullets: [string, string][] = [
    ["Brightapps Inc", `Led delivery of ${has[0] ?? "core"} work used by 2M monthly visitors (sample)`],
    ["Brightapps Inc", `Partnered with product and design on ${job.industryName.toLowerCase()} features (sample)`],
    ["Maple Studio", "Maintained internal tools and wrote team documentation (sample)"],
  ];
  const changed = [
    summary && "Summary updated to better align the role",
    work && `Enhanced ${work === "all" ? "all" : "2"} work experience bullets`,
    added.length > 0 && `Add ${added.length} missing skill${added.length === 1 ? "" : "s"}`,
  ].filter(Boolean) as string[];
  const tabBtn = (t: typeof tab, Icon: typeof Wand2) => (
    <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm ${tab === t ? "bg-accent-tint font-medium text-accent" : "hover:bg-neutral-50"}`}><Icon className="h-4 w-4" />{t}</button>
  );
  return (
    <div className="grid min-h-0 flex-1 overflow-auto md:grid-cols-[380px_1fr] md:overflow-hidden">
      <div className="space-y-3 overflow-auto border-line p-4 md:border-r">
        <div className="flex gap-1" role="tablist">{tabBtn("Rewrite", Wand2)}{tabBtn("Editor", Pencil)}{tabBtn("Style", Sparkles)}</div>
        {tab === "Rewrite" && (
          <>
            <div className="rounded-2xl bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm">Your sample score jumped from <b>{before.toFixed(1)} to {after.toFixed(1)}</b></p>
                <Gauge score={after} size={120} />
              </div>
              <p className="mt-3 font-semibold">See What&apos;s Changed</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{changed.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div className="flex flex-col items-end gap-2">
              {["Use stronger action verbs for my latest experience", "Shorten my summary to remove filler words", "Remove skills not related to this job"].map((s) => (
                <button key={s} onClick={() => toast(NO_CHANGE)} className="rounded-full bg-accent-tint px-3 py-1 text-xs text-accent">{s}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); toast(NO_CHANGE); }} className="rounded-2xl border border-line p-3">
              <textarea aria-label="Tell me how you'd like to tweak your resume" placeholder="Tell me how you'd like to tweak your resume..." rows={3} className="w-full resize-none bg-transparent text-sm text-neutral-500 outline-none" />
              <div className="flex justify-end"><button className="pill-ghost py-1 text-xs">Send</button></div>
            </form>
          </>
        )}
        {tab === "Editor" && (
          <div className="space-y-2 text-sm">
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">Demo: section editing is not available. The preview shows the sample text.</p>
            {["Summary", "Experience", "Education", "Skills"].map((s) => <p key={s} className="rounded-lg border border-line px-3 py-2">{s}</p>)}
          </div>
        )}
        {tab === "Style" && (
          <div className="space-y-4 text-sm">
            <fieldset><legend className="mb-2 font-medium">Font</legend>
              {[["Sans", false], ["Serif", true]].map(([l, v]) => <label key={String(l)} className="mr-4 inline-flex items-center gap-2"><input type="radio" name="font" checked={serif === v} onChange={() => setSerif(v as boolean)} className="accent-[#2563EB]" />{l}</label>)}
            </fieldset>
            <fieldset><legend className="mb-2 font-medium">Spacing</legend>
              {[["Comfortable", false], ["Compact", true]].map(([l, v]) => <label key={String(l)} className="mr-4 inline-flex items-center gap-2"><input type="radio" name="spacing" checked={compact === v} onChange={() => setCompact(v as boolean)} className="accent-[#2563EB]" />{l}</label>)}
            </fieldset>
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-col bg-neutral-50">
        <div className="flex flex-wrap items-center gap-4 border-b border-line bg-white px-4 py-2 text-sm">
          <span className="min-w-0 flex-1 truncate font-medium">{SAMPLE_PERSON.name}_{job.title}</span>
          <span className="flex items-center gap-2">Edit on resume<Switch label="Edit on resume" on={false} onChange={() => toast("Demo: editing on the resume is not available")} /></span>
          <span className="flex items-center gap-2">Fit to one page<Switch label="Fit to one page" on={fit} onChange={setFit} /></span>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <article aria-label="Sample resume preview" className={`mx-auto max-w-3xl bg-white p-8 text-[13px] shadow-sm ${serif ? "font-serif" : ""} ${compact || fit ? "space-y-2 leading-snug" : "space-y-4 leading-relaxed"}`}>
            <header className="text-center"><p className="text-3xl">{SAMPLE_PERSON.name}</p><p>{resume.title}</p><p className="text-xs">{SAMPLE_PERSON.city} | {SAMPLE_PERSON.email}</p></header>
            <section><p className="border-b border-ink font-bold">SUMMARY</p>
              <p className={hl(summary)}>{summary
                ? `${resume.title} with ${resume.years} years of experience, now focused on ${job.title.toLowerCase()} work in ${job.industryName.toLowerCase()}. Skilled in ${[...has, ...added].slice(0, 4).join(", ")}.`
                : `${resume.title} with ${resume.years} years of experience building products for web teams.`}</p></section>
            <section><p className="border-b border-ink font-bold">EXPERIENCE</p>
              {["Brightapps Inc", "Maple Studio"].map((co, c) => (
                <div key={co} className="mt-1">
                  <p className="flex justify-between font-semibold"><span>{co}</span><span>{c === 0 ? "2022 - Present" : "2019 - 2022"}</span></p>
                  <p className="italic">{c === 0 ? resume.title : "Junior Developer"}</p>
                  <ul>{bullets.map(([b, t], i) => b === co && <li key={t} className={hl(work === "all" || (work === 2 && i < 2))}>• {t}</li>)}</ul>
                </div>
              ))}
            </section>
            <section><p className="border-b border-ink font-bold">EDUCATION</p><p className="flex justify-between"><b>State University (sample)</b><span>2019</span></p><p className="italic">B.S., Computer Science</p></section>
            <section><p className="border-b border-ink font-bold">SKILLS</p>
              <p>• {[...has, "Git", "Agile"].join(", ")}{added.map((k) => <span key={k}>, <span className="bg-accent-tint">{k}</span></span>)}</p></section>
          </article>
          <p className="mt-3 text-center text-xs text-neutral-500">Sample resume for a fictional person. Highlighted text shows what the demo changed.</p>
        </div>
      </div>
    </div>
  );
}
