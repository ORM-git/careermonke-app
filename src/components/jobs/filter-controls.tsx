"use client";

import { useId, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";

export function CheckGroup({ label, options, value, onChange, cols = 1, display }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; cols?: 1 | 2; display?: (o: string) => string }) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className={`grid gap-1 ${cols === 2 ? "sm:grid-cols-2" : ""}`}>
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-neutral-50 px-3 py-2 text-sm hover:bg-neutral-100">
              <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked ? [...value, o] : value.filter((x) => x !== o))} className="peer sr-only" />
              <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300 ${on ? "border-accent bg-accent" : "border-neutral-300 bg-white"}`}>{on && <Check className="h-3 w-3 text-white" strokeWidth={3} />}</span>
              {display ? display(o) : o}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function RadioGroup({ label, options, value, onChange, cols = 1 }: { label: string; options: { v: string; label: string }[]; value: string; onChange: (v: string) => void; cols?: 1 | 2 }) {
  const name = useId();
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className={`grid gap-1 ${cols === 2 ? "sm:grid-cols-2" : ""}`}>
        {options.map((o) => (
          <label key={o.v} className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-neutral-50 px-3 py-2 text-sm hover:bg-neutral-100">
            <input type="radio" name={name} checked={value === o.v} onChange={() => onChange(o.v)} className="h-4 w-4 accent-[#2563EB]" />{o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Switch({ label, on, onChange, disabled, title }: { label: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean; title?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} title={title} disabled={disabled} onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${on ? "bg-accent" : "bg-neutral-300"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

/** Removable chips plus a searchable input that adds from `options` (or free text when `free`). */
export function TagPicker({ label, value, onChange, options, placeholder, free = false }: { label: string; value: string[]; onChange: (v: string[]) => void; options: string[]; placeholder: string; free?: boolean }) {
  const [text, setText] = useState("");
  const id = useId();
  const hits = text.trim() ? options.filter((o) => o.toLowerCase().includes(text.trim().toLowerCase()) && !value.includes(o)).slice(0, 6) : [];
  const add = (v: string) => { if (v && !value.includes(v)) onChange([...value, v]); setText(""); };
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => <span key={v} className="chip chip-on py-1">{v}<button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(value.filter((x) => x !== v))}><X className="h-3.5 w-3.5" /></button></span>)}
        </div>
      )}
      <div className="relative">
        <label htmlFor={id} className="sr-only">{label}</label>
        <span className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3"><Search className="h-4 w-4 text-neutral-400" />
          <input id={id} role="combobox" aria-expanded={hits.length > 0} aria-controls={`${id}-list`} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const exact = options.find((o) => o.toLowerCase() === text.trim().toLowerCase()); if (exact) add(exact); else if (hits[0]) add(hits[0]); else if (free) add(text.trim()); } }}
            className="w-full bg-transparent py-2 text-sm outline-none" />
        </span>
        {(hits.length > 0 || (free && text.trim())) && (
          <ul id={`${id}-list`} role="listbox" className="absolute inset-x-0 top-10 z-10 max-h-48 overflow-auto rounded-lg border border-line bg-white py-1 shadow-lg">
            {hits.map((h) => <li key={h} role="option" aria-selected="false"><button type="button" onClick={() => add(h)} className="w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-50">{h}</button></li>)}
            {free && text.trim() && !hits.some((h) => h.toLowerCase() === text.trim().toLowerCase()) && (
              <li role="option" aria-selected="false"><button type="button" onClick={() => add(text.trim())} className="flex w-full items-center gap-1 px-3 py-1.5 text-left text-sm hover:bg-neutral-50"><Plus className="h-3.5 w-3.5" />Add &quot;{text.trim()}&quot;</button></li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Suggested items with checkboxes, a remove x per item, Add and Clear All (industry and skill lists). */
export function SuggestList({ label, options, setOptions, value, onChange, all }: { label: string; options: string[]; setOptions: (v: string[]) => void; value: string[]; onChange: (v: string[]) => void; all: string[] }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold">{label}</p><button type="button" onClick={() => onChange([])} className="text-xs font-medium text-neutral-600 hover:text-ink">Clear All</button></div>
      {options.map((o) => (
        <div key={o} className="flex items-center gap-1">
          <div className="flex-1"><CheckGroup label={label} options={[o]} value={value} onChange={(v) => onChange(v.includes(o) ? [...new Set([...value, o])] : value.filter((x) => x !== o))} /></div>
          <button type="button" aria-label={`Remove ${o} from suggestions`} onClick={() => { setOptions(options.filter((x) => x !== o)); onChange(value.filter((x) => x !== o)); }} className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      {adding
        ? <TagPicker label={`Add ${label.toLowerCase()}`} value={[]} options={all.filter((a) => !options.includes(a))} placeholder={`Search ${label.toLowerCase()}`} free onChange={(v) => { setOptions([...options, ...v]); onChange([...value, ...v]); setAdding(false); }} />
        : <button type="button" onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-1 rounded-lg border border-line py-2 text-sm hover:bg-neutral-50"><Plus className="h-4 w-4" />Add</button>}
    </div>
  );
}

/** Years of required experience: an "Open to all" switch, or a min/max range. */
export function ExpRange({ open, range, max, onChange }: { open: boolean; range: [number, number]; max: number; onChange: (open: boolean, range: [number, number]) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm"><span className="font-semibold">Required Experience</span><span className="flex items-center gap-2">Open to all<Switch label="Open to all experience levels" on={open} onChange={(v) => onChange(v, range)} /></span></div>
      <p className="text-sm text-neutral-500">{open ? "Any requirements" : `${range[0]} – ${range[1]}${range[1] === max ? "+" : ""} years`}</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-neutral-500">Min years
          <input type="range" min={0} max={max} value={range[0]} disabled={open} onChange={(e) => onChange(false, [Math.min(+e.target.value, range[1]), range[1]])} className="w-full accent-[#2563EB]" />
        </label>
        <label className="text-xs text-neutral-500">Max years
          <input type="range" min={0} max={max} value={range[1]} disabled={open} onChange={(e) => onChange(false, [range[0], Math.max(+e.target.value, range[0])])} className="w-full accent-[#2563EB]" />
        </label>
      </div>
    </div>
  );
}
