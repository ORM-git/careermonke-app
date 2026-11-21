"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MoreHorizontal, X } from "lucide-react";
import { CheckGroup, ExpRange, RadioGroup, TagPicker } from "./filter-controls";
import { countries, jobFunctions } from "@/mocks/onboarding";
import { DATE_POSTED, EXP_MAX, INDUSTRIES, JOB_TYPES, LEVELS, WORK_MODELS, type Filter } from "@/mocks/filters";

const more = (list: string[], empty: string) => (list.length ? `${list[0]}${list.length > 1 ? ` (+${list.length - 1})` : ""}` : empty);

function Pop({ label, active, children }: { label: string; active: boolean; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down);
    window.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); window.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(!open)} className={`chip ${active ? "chip-on" : ""}`}>{label}<ChevronDown className="h-3.5 w-3.5" /></button>
      {/* The body mounts fresh on every open, so each popover edits a new draft; closing without Confirm discards it. */}
      {/* Phones: a bottom sheet (fixed, so the scrolling chip row cannot clip it); from sm the original popover. */}
      {open && <div className="fixed inset-0 z-40 bg-black/30 sm:hidden" aria-hidden="true" onClick={() => setOpen(false)} />}
      {open && (
        <div role="dialog" aria-label={`${label} filter`} className="animate-pop fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] flex-col gap-3 overflow-y-auto rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl ring-1 ring-black/5 sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-11 sm:z-30 sm:max-h-none sm:w-[300px] sm:overflow-visible sm:rounded-2xl sm:p-3">
          <div className="flex items-center justify-between sm:hidden">
            <p className="font-semibold">{label}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close filter" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-neutral-100"><X className="h-5 w-5" /></button>
          </div>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

const Title = ({ children, required }: { children: string; required?: boolean }) => <p className="text-sm font-semibold">{required && <span className="text-red-500">*</span>}{children}</p>;
const ConfirmBtn = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => <button type="button" onClick={onClick} disabled={disabled} className="pill-accent w-full rounded-lg disabled:opacity-40">Confirm</button>;
const Footer = ({ onReset, onConfirm }: { onReset: () => void; onConfirm: () => void }) => (
  <div className="grid grid-cols-2 gap-2"><button type="button" onClick={onReset} className="pill-ghost rounded-lg">Reset</button><button type="button" onClick={onConfirm} className="pill-accent rounded-lg">Confirm</button></div>
);

function ListPop({ title, options, initial, required, display, apply, close }: { title: string; options: string[]; initial: string[]; required?: boolean; display?: (o: string) => string; apply: (v: string[]) => void; close: () => void }) {
  const [v, setV] = useState(initial);
  return (
    <>
      <Title required={required}>{title}</Title>
      <CheckGroup label={title} options={options} value={v} onChange={setV} display={display} />
      {required && !v.length && <p className="text-xs text-red-500">Pick at least one.</p>}
      <ConfirmBtn disabled={required && !v.length} onClick={() => { apply(v); close(); }} />
    </>
  );
}

function LocationPop({ f, apply, close }: { f: Filter; apply: (p: Partial<Filter>) => void; close: () => void }) {
  const [country, setCountry] = useState(f.country);
  const [locs, setLocs] = useState(f.locations);
  const anywhere = `Anywhere in ${country === "United States" ? "the US" : country || "any country"}`;
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <Title required>Location</Title>
        <label className="sr-only" htmlFor="qf-country">Country</label>
        <select id="qf-country" value={country} onChange={(e) => { setCountry(e.target.value); setLocs([]); }} className="rounded-md bg-neutral-50 px-2 py-1 text-sm">
          <option value="">Any country</option>
          {countries.filter((c) => c !== "Remote (anywhere)").map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {!locs.length && <p className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm">{anywhere}</p>}
      <TagPicker label="Add city" value={locs} onChange={setLocs} options={[]} placeholder="Add a city, e.g. Pune" free />
      <ConfirmBtn onClick={() => { apply({ country, locations: locs }); close(); }} />
    </>
  );
}

function FunctionPop({ f, apply, close }: { f: Filter; apply: (p: Partial<Filter>) => void; close: () => void }) {
  const [v, setV] = useState(f.jobFunctions);
  return (
    <>
      <Title required>Job Function</Title>
      <TagPicker label="Job function" value={v} onChange={setV} options={jobFunctions} placeholder="Please select/enter your expected job function" free />
      {!v.length && <p className="text-xs text-red-500">Add at least one job function.</p>}
      <ConfirmBtn disabled={!v.length} onClick={() => { apply({ jobFunctions: v }); close(); }} />
    </>
  );
}

function DatePop({ f, apply, close }: { f: Filter; apply: (p: Partial<Filter>) => void; close: () => void }) {
  const [v, setV] = useState(f.datePosted);
  return (
    <>
      <Title>Date Posted</Title>
      <RadioGroup label="Date Posted" options={DATE_POSTED} value={v} onChange={setV} />
      <Footer onReset={() => setV("")} onConfirm={() => { apply({ datePosted: v }); close(); }} />
    </>
  );
}

function IndustryPop({ f, apply, close }: { f: Filter; apply: (p: Partial<Filter>) => void; close: () => void }) {
  const [v, setV] = useState(f.industries);
  return (
    <>
      <Title>Industry</Title>
      <TagPicker label="Add industry" value={v} onChange={setV} options={INDUSTRIES} placeholder="Add Industry" />
      <Footer onReset={() => setV([])} onConfirm={() => { apply({ industries: v, industryOptions: [...new Set([...f.industryOptions, ...v])] }); close(); }} />
    </>
  );
}

function ExpPop({ f, apply, close }: { f: Filter; apply: (p: Partial<Filter>) => void; close: () => void }) {
  const [open, setOpen] = useState(f.expOpen);
  const [range, setRange] = useState(f.exp);
  return (
    <>
      <ExpRange open={open} range={range} max={EXP_MAX} onChange={(o, r) => { setOpen(o); setRange(r); }} />
      <ConfirmBtn onClick={() => { apply({ expOpen: open, exp: range }); close(); }} />
    </>
  );
}

export function QuickFilters({ f, apply, onAllFilters, onHidden }: { f: Filter; apply: (p: Partial<Filter>) => void; onAllFilters: () => void; onHidden: () => void }) {
  const remoteLabel = (o: string) => (o === "Remote" ? `Remote anywhere${f.country ? ` in ${f.country === "United States" ? "the US" : f.country}` : ""}` : o);
  return (
    <div data-tour="filters" className="flex flex-wrap items-center gap-2 max-sm:-mx-4 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:px-4 max-sm:pb-1 max-sm:[&>*]:shrink-0">
      <Pop label={f.country || (f.locations[0] ?? "Any location")} active={!!f.country || !!f.locations.length}>{(c) => <LocationPop f={f} apply={apply} close={c} />}</Pop>
      <Pop label={more(f.jobFunctions, "Job Function")} active={!!f.jobFunctions.length}>{(c) => <FunctionPop f={f} apply={apply} close={c} />}</Pop>
      <Pop label={more(f.levels, "Experience Level")} active={!!f.levels.length}>{(c) => <ListPop title="Experience Level" options={LEVELS} initial={f.levels} apply={(levels) => apply({ levels })} close={c} />}</Pop>
      <Pop label={more(f.jobTypes, "Job Type")} active={!!f.jobTypes.length}>{(c) => <ListPop title="Job Type" required options={JOB_TYPES} initial={f.jobTypes} apply={(jobTypes) => apply({ jobTypes })} close={c} />}</Pop>
      <Pop label={more(f.workModels, "Work Model")} active={f.workModels.length > 0}>{(c) => <ListPop title="Work Model" required options={WORK_MODELS} initial={f.workModels} display={remoteLabel} apply={(workModels) => apply({ workModels })} close={c} />}</Pop>
      <Pop label={DATE_POSTED.find((d) => d.v === f.datePosted)?.label ?? "Date Posted"} active={!!f.datePosted}>{(c) => <DatePop f={f} apply={apply} close={c} />}</Pop>
      <Pop label={more(f.industries, "Industry")} active={!!f.industries.length}>{(c) => <IndustryPop f={f} apply={apply} close={c} />}</Pop>
      <Pop label={f.expOpen ? "Years of Experience" : `${f.exp[0]}-${f.exp[1]} yrs`} active={!f.expOpen}>{(c) => <ExpPop f={f} apply={apply} close={c} />}</Pop>
      <button type="button" onClick={onHidden} aria-pressed={f.hiddenJobs} title="Fresh roles not on the big job boards. Pro feature, unlocked in this demo." className={`chip ${f.hiddenJobs ? "chip-on" : "border-blue-200 bg-accent-tint"}`}>Hidden Jobs<span className="rounded bg-accent px-1 text-[10px] font-bold text-white">PRO</span></button>
      <button type="button" onClick={onAllFilters} className="chip border-accent bg-accent text-white hover:border-accent"><MoreHorizontal className="h-3.5 w-3.5" />All Filters</button>
      {f.datePosted && <button type="button" onClick={() => apply({ datePosted: "" })} aria-label="Clear date posted" className="text-neutral-500"><X className="h-4 w-4" /></button>}
    </div>
  );
}
