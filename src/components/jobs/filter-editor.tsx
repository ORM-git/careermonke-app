"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronDown, CircleHelp, Lock, Trash2, Zap } from "lucide-react";
import { Confirm, Drawer } from "../ui";
import { CheckGroup, ExpRange, RadioGroup, Switch, SuggestList, TagPicker } from "./filter-controls";
import { countries, jobFunctions } from "@/mocks/onboarding";
import {
  COMPANIES, DATE_POSTED, EXP_MAX, INDUSTRIES, JOB_TYPES, LEVELS, SALARY_MAX, SKILLS, STAGES, WORK_MODELS,
  countMatches, filterChips, type Filter,
} from "@/mocks/filters";

const NAV = [
  { id: "basic", label: "Basic Job Criteria", sub: "Job Function / Job Type / Work Model…" },
  { id: "comp", label: "Compensation & Sponsorship", sub: "Annual Salary / H1B Sponsorship" },
  { id: "interests", label: "Areas of Interests", sub: "Industry / Skill / Role (IC/Manager)…" },
  { id: "company", label: "Company Insights", sub: "Company Search / Exclude Staffing Agency…" },
  { id: "pro", label: "Pro Exclusive", sub: "Start Time / Graduation Time / Hidden Jobs" },
];
const PRO_TIP = "This filter is for Pro members. Upgrade to Pro to set it.";

function Card({ title, required, hint, onClear, children }: { title: string; required?: boolean; hint?: string; onClear?: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-sm font-semibold">{required && <span className="text-red-500">*</span>}{title}{hint && <span title={hint} aria-label={hint}><CircleHelp className="h-3.5 w-3.5 text-neutral-500" /></span>}</p>
        {onClear && <button type="button" onClick={onClear} className="text-xs font-medium text-neutral-600 hover:text-ink">Clear All</button>}
      </div>
      {children}
    </div>
  );
}

function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-semibold">{title}<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

export function FilterEditor({ initial, editingSaved, onConfirm, onDelete, onClose }: {
  initial: Filter; editingSaved: boolean; onConfirm: (f: Filter) => void; onDelete?: () => void; onClose: () => void;
}) {
  const [d, setD] = useState<Filter>(() => structuredClone(initial));
  const [section, setSection] = useState("basic");
  const [deleting, setDeleting] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const set = (p: Partial<Filter>) => setD((x) => ({ ...x, ...p }));
  const dirty = JSON.stringify(d) !== JSON.stringify(initial);
  const valid = d.jobFunctions.length > 0 && d.jobTypes.length > 0 && d.workModels.length > 0;
  const count = countMatches(d);
  const chips = filterChips(d);
  const intern = d.levels.includes("Intern/New Grad");
  const go = (id: string) => { setSection(id); document.getElementById(`fe-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const remote = `Remote anywhere${d.country ? ` in ${d.country === "United States" ? "the US" : d.country}` : ""}`;

  return (
    <>
      <Drawer open label="All filters" onClose={onClose} dirty={dirty} width="max-w-[880px]"
        title={editingSaved
          ? <><label htmlFor="fe-title" className="sr-only">Filter name</label><input id="fe-title" value={d.title} onChange={(e) => set({ title: e.target.value })} className="w-full max-w-sm rounded-lg bg-neutral-100 px-3 py-1 text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-200" /></>
          : <span className="rounded-lg bg-neutral-100 px-3 py-1">{d.title}</span>}
        action={<button onClick={() => valid && onConfirm(d)} disabled={!valid} className="pill-accent disabled:opacity-40">Confirm{dirty ? ` (${count.toLocaleString()})` : ""}</button>}
        header={(
          <div className="flex flex-wrap gap-1.5 border-b border-line px-4 py-2.5" aria-label="Selected filters">
            {chips.slice(0, 8).map((c, i) => <span key={`${c}${i}`} className="rounded-md bg-neutral-100 px-2 py-1 text-xs">{c}</span>)}
            {chips.length > 8 && <span className="rounded-md bg-accent-tint px-2 py-1 text-xs font-semibold text-accent">+{chips.length - 8} Filters</span>}
            {!valid && <span className="text-xs text-red-500">Job function, job type and work model are required.</span>}
          </div>
        )}>
        <div className="grid h-full md:grid-cols-[260px_1fr]">
          <nav aria-label="Filter sections" className="hidden flex-col gap-1 border-r border-line p-3 md:flex">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} aria-current={section === n.id || undefined} className={`rounded-xl px-3 py-2.5 text-left ${section === n.id ? "bg-neutral-100" : "hover:bg-neutral-50"}`}>
                <b className="flex items-center gap-1 text-sm font-semibold">{n.id === "pro" && <Zap className="h-3.5 w-3.5 fill-accent text-accent" />}{n.label}</b>
                <span className="block truncate text-xs text-neutral-500">{n.sub}</span>
              </button>
            ))}
            <p className="mt-2 rounded-xl bg-accent-tint p-3 text-xs">💡 <b>Applying for Intern/New Grad?</b> Filter by start time and graduation time in the Pro Exclusive section.</p>
            {editingSaved && onDelete && <button onClick={() => setDeleting(true)} className="mt-auto flex items-center gap-1 px-3 py-2 text-sm underline"><Trash2 className="h-4 w-4" />Delete</button>}
          </nav>

          <div ref={body} className="space-y-3 overflow-auto bg-neutral-50 p-4">
            <h3 id="fe-basic" className="scroll-mt-2 pt-1 text-lg font-semibold">Basic Job Criteria</h3>
            <Card title="Job Function" required><TagPicker label="Job function" value={d.jobFunctions} onChange={(v) => set({ jobFunctions: v })} options={jobFunctions} placeholder="Please select/enter your expected job function" free /></Card>
            <Fold title="Excluded Title"><TagPicker label="Excluded title" value={d.excludedTitles} onChange={(v) => set({ excludedTitles: v })} options={[]} placeholder="e.g. Manager" free /></Fold>
            <Card title="Job Type" required><CheckGroup label="Job Type" cols={2} options={JOB_TYPES} value={d.jobTypes} onChange={(v) => set({ jobTypes: v })} /></Card>
            <Card title="Work Model" required><CheckGroup label="Work Model" cols={2} options={WORK_MODELS} value={d.workModels} display={(o) => (o === "Remote" ? remote : o)} onChange={(v) => set({ workModels: v })} /></Card>
            <Card title="Location">
              <label className="sr-only" htmlFor="fe-country">Country</label>
              <select id="fe-country" value={d.country} onChange={(e) => set({ country: e.target.value, locations: [] })} className="input border-transparent">
                <option value="">Any country</option>{countries.filter((c) => c !== "Remote (anywhere)").map((c) => <option key={c}>{c}</option>)}
              </select>
              <TagPicker label="City" value={d.locations} onChange={(v) => set({ locations: v })} options={[]} placeholder="Add a city (optional)" free />
            </Card>
            <Card title="Experience Level" onClear={() => set({ levels: [] })}><CheckGroup label="Experience Level" cols={2} options={LEVELS} value={d.levels} onChange={(v) => set({ levels: v })} /></Card>
            <Card title="Years of experience"><ExpRange open={d.expOpen} range={d.exp} max={EXP_MAX} onChange={(o, r) => set({ expOpen: o, exp: r })} /></Card>
            <Card title="Date Posted" onClear={() => set({ datePosted: "" })}><RadioGroup label="Date Posted" cols={2} options={DATE_POSTED} value={d.datePosted} onChange={(v) => set({ datePosted: v })} /></Card>

            <h3 id="fe-comp" className="scroll-mt-2 pt-4 text-lg font-semibold">Compensation &amp; Sponsorship</h3>
            <Card title="Minimum Annual Salary" hint="Compared in USD; INR salaries are converted at an approximate rate.">
              <div className="flex items-center justify-between text-sm"><span>{d.salaryOpen ? "Any salary" : `$${d.minSalaryK}K+ / year`}</span><span className="flex items-center gap-2">Open to all<Switch label="Open to all salaries" on={d.salaryOpen} onChange={(v) => set({ salaryOpen: v })} /></span></div>
              <label className="block text-xs text-neutral-500">Minimum salary (USD thousands)
                <input type="range" min={0} max={SALARY_MAX} step={10} value={d.minSalaryK} disabled={d.salaryOpen} onChange={(e) => set({ minSalaryK: +e.target.value })} className="w-full accent-[#2563EB]" />
              </label>
            </Card>
            <Card title="Work Authorization"><CheckGroup label="Work Authorization" options={["H1B sponsorship"]} value={d.h1b ? ["H1B sponsorship"] : []} onChange={(v) => set({ h1b: v.length > 0 })} /></Card>
            <Card title="Exclude Jobs with Limitations">
              <CheckGroup label="Exclude jobs with limitations" cols={2} options={["Security Clearance Required", "US Citizen Only"]}
                value={[...(d.excludeClearance ? ["Security Clearance Required"] : []), ...(d.excludeCitizen ? ["US Citizen Only"] : [])]}
                onChange={(v) => set({ excludeClearance: v.includes("Security Clearance Required"), excludeCitizen: v.includes("US Citizen Only") })} />
            </Card>

            <h3 id="fe-interests" className="scroll-mt-2 pt-4 text-lg font-semibold">Areas of Interests</h3>
            <div className="rounded-xl bg-white p-4"><SuggestList label="Industry" options={d.industryOptions} setOptions={(v) => set({ industryOptions: v })} value={d.industries} onChange={(v) => set({ industries: v })} all={INDUSTRIES} /></div>
            <Fold title="Excluded Industry"><TagPicker label="Excluded industry" value={d.excludedIndustries} onChange={(v) => set({ excludedIndustries: v })} options={INDUSTRIES} placeholder="Search industries" /></Fold>
            <div className="rounded-xl bg-white p-4"><SuggestList label="Skill" options={d.skillOptions} setOptions={(v) => set({ skillOptions: v })} value={d.skills} onChange={(v) => set({ skills: v })} all={SKILLS} /></div>
            <Fold title="Excluded Skill"><TagPicker label="Excluded skill" value={d.excludedSkills} onChange={(v) => set({ excludedSkills: v })} options={SKILLS} placeholder="Search skills" free /></Fold>
            <Card title="Role Type" onClear={() => set({ role: "" })}><RadioGroup label="Role Type" cols={2} options={[{ v: "IC", label: "IC" }, { v: "Manager", label: "Manager" }]} value={d.role} onChange={(v) => set({ role: v as Filter["role"] })} /></Card>

            <h3 id="fe-company" className="scroll-mt-2 pt-4 text-lg font-semibold">Company Insights</h3>
            <Card title="Company" hint="Only show jobs at these companies." onClear={() => set({ companies: [] })}><TagPicker label="Company" value={d.companies} onChange={(v) => set({ companies: v })} options={COMPANIES} placeholder="Search companies" /></Card>
            <Card title="Company Stage" onClear={() => set({ stages: [] })}><CheckGroup label="Company Stage" cols={2} options={STAGES} value={d.stages} onChange={(v) => set({ stages: v })} /></Card>
            <Card title="Job Source" hint="Hide roles posted by recruiting agencies."><CheckGroup label="Job source" options={["Exclude Staffing Agency"]} value={d.excludeStaffing ? ["Exclude Staffing Agency"] : []} onChange={(v) => set({ excludeStaffing: v.length > 0 })} /></Card>
            <Card title="Exclude Company" hint="Never show jobs at these companies." onClear={() => set({ excludedCompanies: [] })}><TagPicker label="Exclude company" value={d.excludedCompanies} onChange={(v) => set({ excludedCompanies: v })} options={COMPANIES} placeholder="Search companies" /></Card>

            <div id="fe-pro" className="flex scroll-mt-2 items-center justify-between pt-4">
              <h3 className="text-lg font-semibold">Pro Exclusive</h3>
              <Link href="/pricing" className="flex items-center gap-1 text-sm underline"><Zap className="h-4 w-4 fill-accent text-accent" />Upgrade to Pro</Link>
            </div>
            {intern && (
              <>
                <Card title="Internship Start Time" required hint="When you can start an internship.">
                  <div className="grid grid-cols-2 gap-2" title={PRO_TIP}>
                    <select aria-label="Internship start year" disabled className="input cursor-not-allowed border-transparent"><option>Any Year</option></select>
                    <select aria-label="Internship start month" disabled className="input cursor-not-allowed border-transparent"><option>Any Month</option></select>
                  </div>
                </Card>
                <Card title="Graduation Time" required hint="When you graduate.">
                  <div className="grid grid-cols-2 gap-2" title={PRO_TIP}>
                    <select aria-label="Graduation year" disabled className="input cursor-not-allowed border-transparent"><option>Any Year</option></select>
                    <select aria-label="Graduation season" disabled className="input cursor-not-allowed border-transparent"><option>Any Season</option></select>
                  </div>
                </Card>
              </>
            )}
            <Card title="Hidden Jobs">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-neutral-500">Show only fresh roles that aren&apos;t posted on the big job boards.</p>
                <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-neutral-400" /><Switch label="Hidden jobs" on={false} onChange={() => undefined} disabled title={PRO_TIP} /></span>
              </div>
            </Card>
            {editingSaved && onDelete && <button onClick={() => setDeleting(true)} className="flex items-center gap-1 py-2 text-sm underline md:hidden"><Trash2 className="h-4 w-4" />Delete filter</button>}
          </div>
        </div>
      </Drawer>
      <Confirm open={deleting} title="Delete this saved filter?" body={<>&quot;{initial.title}&quot; will be removed. Free plans can&apos;t add a new saved filter afterwards.</>} confirmLabel="Delete" danger
        onCancel={() => setDeleting(false)} onConfirm={() => { setDeleting(false); onDelete?.(); }} />
    </>
  );
}
