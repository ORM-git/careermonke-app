"use client";

import { useId, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { countries, jobFunctions } from "@/mocks/onboarding";
import {
  EEO_COUNTRIES, educationErrors, emptyEducation, emptyWork, personalErrors, workErrors,
  type Education, type Eeo, type Personal, type Profile, type Section, type Work,
} from "@/mocks/profile";

type FieldProps = { label: string; value: string; onChange: (v: string) => void; required?: boolean; error?: string; type?: string; placeholder?: string; list?: string; className?: string };
export function Field({ label, value, onChange, required, error, type = "text", placeholder, list, className = "" }: FieldProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{required && <span className="text-red-500">* </span>}{label}</label>
      <input id={id} type={type} value={value} list={list} placeholder={placeholder ?? `Enter ${label.toLowerCase()}`} onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={`input ${error ? "border-red-400" : "border-transparent"}`} />
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#2563EB]" />{label}</label>;
}

export function PersonalForm({ v, set, show }: { v: Personal; set: (v: Personal) => void; show: boolean }) {
  const e = show ? personalErrors(v) : {};
  const f = (k: keyof Personal) => ({ value: v[k], onChange: (x: string) => set({ ...v, [k]: x }), error: e[k] });
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3"><Field label="First Name" required {...f("first")} /><Field label="Middle Name" {...f("middle")} /><Field label="Last Name" required {...f("last")} /></div>
      <Field label="Email" type="email" required {...f("email")} />
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <div>
          <label className="mb-1.5 block text-sm font-semibold" htmlFor="phone-type">Phone Type</label>
          <select id="phone-type" value={v.phoneType} onChange={(x) => set({ ...v, phoneType: x.target.value })} className="input border-transparent"><option value="">Select phone type</option>{["Mobile", "Home", "Work"].map((o) => <option key={o}>{o}</option>)}</select>
        </div>
        <div className="grid grid-cols-[90px_1fr] gap-2">
          <Field label="Code" {...f("phoneCode")} placeholder="+91" />
          <Field label="Phone" type="tel" required {...f("phone")} />
        </div>
      </div>
      <Field label="Address Line" required {...f("address")} placeholder="Enter your current address" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Country/Region" required {...f("country")} list="pf-countries" />
        <Field label="State/Province" required {...f("state")} />
        <Field label="City" required {...f("city")} />
      </div>
      <datalist id="pf-countries">{countries.filter((c) => c !== "Remote (anywhere)").map((c) => <option key={c} value={c} />)}</datalist>
      <div className="grid gap-3 sm:grid-cols-3"><Field label="County" {...f("county")} /><Field label="Postal Code" required {...f("postal")} /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="LinkedIn URL" type="url" {...f("linkedin")} placeholder="https://linkedin.com/in/…" />
        <Field label="GitHub URL" type="url" {...f("github")} placeholder="https://github.com/…" />
        <Field label="Portfolio URL" type="url" {...f("portfolio")} placeholder="https://" />
      </div>
    </div>
  );
}

function Entry({ n, onDelete, children }: { n: number; onDelete: () => void; children: React.ReactNode }) {
  return (
    <fieldset className="relative space-y-3 rounded-xl border border-line p-4">
      <legend className="px-1 text-sm font-semibold">#{n}</legend>
      <button type="button" onClick={onDelete} aria-label={`Delete entry ${n}`} className="absolute right-2 top-2 rounded-full p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
      {children}
    </fieldset>
  );
}

export function EducationForm({ v, set, show }: { v: Education[]; set: (v: Education[]) => void; show: boolean }) {
  const errs = show ? educationErrors(v) : [];
  const up = (i: number, p: Partial<Education>) => set(v.map((x, k) => (k === i ? { ...x, ...p } : x)));
  return (
    <div className="space-y-4">
      {v.map((x, i) => {
        const e = errs[i] ?? {};
        return (
          <Entry key={i} n={i + 1} onDelete={() => set(v.filter((_, k) => k !== i))}>
            <Field label="School" required value={x.school} onChange={(s) => up(i, { school: s })} error={e.school} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Major" value={x.major} onChange={(s) => up(i, { major: s })} />
              <Field label="Degree" required value={x.degree} onChange={(s) => up(i, { degree: s })} error={e.degree} />
              <Field label="GPA" value={x.gpa} onChange={(s) => up(i, { gpa: s })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Start Date" type="month" required value={x.start} onChange={(s) => up(i, { start: s })} error={e.start} />
              {!x.current && <Field label="End Date" type="month" required value={x.end} onChange={(s) => up(i, { end: s })} error={e.end} />}
            </div>
            <Check label="I currently study here" checked={x.current} onChange={(c) => up(i, { current: c, end: c ? "" : x.end })} />
          </Entry>
        );
      })}
      <button type="button" onClick={() => set([...v, emptyEducation()])} className="pill-ghost w-full"><Plus className="h-4 w-4" />Add Education</button>
    </div>
  );
}

export function WorkForm({ v, set, show }: { v: Work[]; set: (v: Work[]) => void; show: boolean }) {
  const errs = show ? workErrors(v) : [];
  const up = (i: number, p: Partial<Work>) => set(v.map((x, k) => (k === i ? { ...x, ...p } : x)));
  return (
    <div className="space-y-4">
      {v.map((x, i) => {
        const e = errs[i] ?? {};
        return (
          <Entry key={i} n={i + 1} onDelete={() => set(v.filter((_, k) => k !== i))}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Job Title" required value={x.title} onChange={(s) => up(i, { title: s })} error={e.title} list="pf-titles" />
              <Field label="Company" required value={x.company} onChange={(s) => up(i, { company: s })} error={e.company} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold" htmlFor={`jt-${i}`}>Job Type</label>
                <select id={`jt-${i}`} value={x.jobType} onChange={(s) => up(i, { jobType: s.target.value })} className="input border-transparent"><option value="">Select job type</option>{["Full-time", "Part-time", "Contract", "Internship"].map((o) => <option key={o}>{o}</option>)}</select>
              </div>
              <Field label="Location" value={x.location} onChange={(s) => up(i, { location: s })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Start Date" type="month" required value={x.start} onChange={(s) => up(i, { start: s })} error={e.start} />
              {!x.current && <Field label="End Date" type="month" required value={x.end} onChange={(s) => up(i, { end: s })} error={e.end} />}
            </div>
            <Check label="I currently work here" checked={x.current} onChange={(c) => up(i, { current: c, end: c ? "" : x.end })} />
            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor={`sum-${i}`}>Experience Summary</label>
              <textarea id={`sum-${i}`} rows={2} value={x.summary} onChange={(s) => up(i, { summary: s.target.value })} className="input border-transparent" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Bullet points</p>
              {x.bullets.map((b, k) => (
                <div key={k} className="flex gap-2">
                  <input aria-label={`Bullet ${k + 1}`} value={b} onChange={(s) => up(i, { bullets: x.bullets.map((y, j) => (j === k ? s.target.value : y)) })} className="input border-transparent" />
                  <button type="button" aria-label={`Remove bullet ${k + 1}`} onClick={() => up(i, { bullets: x.bullets.filter((_, j) => j !== k) })} className="rounded-full p-2 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => up(i, { bullets: [...x.bullets, ""] })} className="text-sm font-medium text-accent">+ Add Bullet point</button>
            </div>
          </Entry>
        );
      })}
      <datalist id="pf-titles">{jobFunctions.map((t) => <option key={t} value={t} />)}</datalist>
      <button type="button" onClick={() => set([...v, emptyWork()])} className="pill-ghost w-full"><Plus className="h-4 w-4" />Add Work</button>
    </div>
  );
}

export function SkillsForm({ v, set }: { v: string[]; set: (v: string[]) => void }) {
  const [text, setText] = useState("");
  const add = () => { const s = text.trim(); if (s && !v.some((x) => x.toLowerCase() === s.toLowerCase())) set([...v, s]); setText(""); };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {v.map((s) => <span key={s} className="chip chip-on">{s}<button type="button" aria-label={`Remove ${s}`} onClick={() => set(v.filter((x) => x !== s))}><X className="h-3.5 w-3.5" /></button></span>)}
        {!v.length && <p className="text-sm text-neutral-500">No skills yet.</p>}
      </div>
      <div className="flex gap-2">
        <label htmlFor="add-skill" className="sr-only">Add skill</label>
        <input id="add-skill" role="combobox" aria-expanded="false" list="pf-skills" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Add skill" className="input border-transparent" />
        <button type="button" onClick={add} className="pill-ghost shrink-0">Add</button>
      </div>
      <datalist id="pf-skills">{["Python", "SQL", "Excel", "Tableau", "Power BI", "JavaScript", "TypeScript", "React", "Node.js", "AWS", "Figma", "Product strategy"].map((s) => <option key={s} value={s} />)}</datalist>
    </div>
  );
}

export function EeoForm({ v, set }: { v: Eeo; set: (v: Eeo) => void }) {
  const qs = EEO_COUNTRIES[v.country] ?? [];
  const answer = (k: string, a: string | string[]) => set({ ...v, answers: { ...v.answers, [k]: a } });
  return (
    <div className="space-y-5">
      <p className="rounded-lg bg-accent-tint px-3 py-2 text-sm text-neutral-700">Every question here is optional. Answers are only used to fill voluntary self-identification forms on applications.</p>
      <div>
        <label htmlFor="eeo-country" className="mb-1.5 block text-sm font-semibold">Country</label>
        <select id="eeo-country" value={v.country} onChange={(e) => set({ country: e.target.value, answers: {} })} className="input border-transparent">
          <option value="">Select a country</option>
          {Object.keys(EEO_COUNTRIES).map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {qs.map((q) => q.multi ? (
        <fieldset key={q.key}>
          <legend className="mb-1.5 text-sm font-semibold">{q.label}</legend>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {q.options.map((o) => {
              const cur = (v.answers[q.key] as string[] | undefined) ?? [];
              return <Check key={o} label={o} checked={cur.includes(o)} onChange={(c) => answer(q.key, c ? [...cur, o] : cur.filter((x) => x !== o))} />;
            })}
          </div>
        </fieldset>
      ) : (
        <div key={q.key}>
          <label htmlFor={`eeo-${q.key}`} className="mb-1.5 block text-sm font-semibold">{q.label}</label>
          <select id={`eeo-${q.key}`} value={(v.answers[q.key] as string) ?? ""} onChange={(e) => answer(q.key, e.target.value)} className="input border-transparent">
            <option value="">Select</option>
            {[...q.options, "Prefer not to say"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

/** Renders the form for one section against a draft profile. */
export function SectionForm({ section, draft, setDraft, show }: { section: Section; draft: Profile; setDraft: (p: Profile) => void; show: boolean }) {
  if (section === "Personal") return <PersonalForm v={draft.personal} set={(personal) => setDraft({ ...draft, personal })} show={show} />;
  if (section === "Education") return <EducationForm v={draft.education} set={(education) => setDraft({ ...draft, education })} show={show} />;
  if (section === "Work Experience") return <WorkForm v={draft.work} set={(work) => setDraft({ ...draft, work })} show={show} />;
  if (section === "Skills") return <SkillsForm v={draft.skills} set={(skills) => setDraft({ ...draft, skills })} />;
  return <EeoForm v={draft.eeo} set={(eeo) => setDraft({ ...draft, eeo })} />;
}

export const sectionValid = (section: Section, p: Profile) =>
  section === "Personal" ? !Object.keys(personalErrors(p.personal)).length
  : section === "Education" ? educationErrors(p.education).every((e) => !Object.keys(e).length)
  : section === "Work Experience" ? workErrors(p.work).every((e) => !Object.keys(e).length)
  : true;
