"use client";

import { useState } from "react";
import { BadgeCheck, ChevronDown, CircleHelp, Copy, Lightbulb } from "lucide-react";
import { langLabel, type Lang, type Question } from "@/mocks/interview";
import { toast } from "../toast";

export const SECTIONS = [
  { id: "statement", label: "Problem Statement" },
  { id: "tips", label: "Insider Tips" },
  { id: "approach", label: "The Approach" },
  { id: "solution", label: "Solution" },
] as const;

export function Tags({ q, dark }: { q: Question; dark?: boolean }) {
  const chip = dark ? "bg-white/10 text-white/90" : "bg-neutral-100 text-neutral-700";
  const diff = q.difficulty === "Easy" ? "bg-sky-400 text-ink" : q.difficulty === "Medium" ? "bg-amber-400 text-ink" : "bg-red-500 text-white";
  return (
    <div className="flex flex-wrap gap-1.5 text-[13px]">
      <span className={`rounded-md px-2 py-0.5 font-semibold ${diff}`}>{q.difficulty}</span>
      {[q.seniority, q.role, q.jobType, q.round].map((t) => <span key={t} className={`rounded-md px-2 py-0.5 ${chip}`}>{t}</span>)}
    </div>
  );
}

function CodeBlock({ code, dark }: { code: string; dark?: boolean }) {
  return (
    <pre className={`overflow-auto p-4 font-mono text-[13px] leading-6 ${dark ? "text-white/90" : "text-neutral-800"}`}>
      {code.trimEnd().split("\n").map((line, i) => (
        <div key={i} className="flex"><span className="mr-4 w-6 shrink-0 select-none text-right text-neutral-400">{i + 1}</span><code className="whitespace-pre">{line}</code></div>
      ))}
    </pre>
  );
}

// One continuous article; the sticky nav in practice mode scrolls to these section ids.
export function QuestionArticle({ q, dark = false, idPrefix = "" }: { q: Question; dark?: boolean; idPrefix?: string }) {
  const langs = Object.keys(q.solution ?? {}) as Lang[];
  const [lang, setLang] = useState<Lang>(langs[0] ?? "python");
  const [open, setOpen] = useState<number[]>([0]);
  const box = dark ? "rounded-lg border border-white/10 bg-white/[.04]" : "rounded-lg border border-line bg-neutral-50";
  const muted = dark ? "text-white/80" : "text-neutral-700";
  const h = "mb-3 flex items-center gap-2 text-lg font-semibold";
  const code = q.solution?.[lang] ?? "";

  return (
    <div className="space-y-8">
      <section id={`${idPrefix}statement`} className="scroll-mt-4">
        <h3 className={h}>Problem Statement</h3>
        <div className={`${box} space-y-5 p-4 font-mono text-[13px] leading-6 ${muted}`}>
          <p className="whitespace-pre-wrap">{q.statement}</p>
          <div><p className="mb-2 text-base font-bold">Constraints</p><ul className="list-disc space-y-1 pl-5">{q.constraints?.map((c) => <li key={c}>{c}</li>)}</ul></div>
          <div className="space-y-4"><p className="text-base font-bold">Examples</p>
            {q.examples?.map((e, i) => (
              <div key={i} className="space-y-1"><p><b>Input:</b> {e.input}</p><p><b>Output:</b> {e.output}</p><p><b>Explanation:</b> {e.explanation}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id={`${idPrefix}tips`} className="scroll-mt-4">
        <h3 className={h}>Insider Tips <span title="Patterns candidates reported for this question"><CircleHelp className="h-4 w-4" /></span></h3>
        <ul className={`${dark ? box : "rounded-lg border border-amber-200 bg-amber-50"} list-disc space-y-1 p-4 pl-8 font-mono text-[13px] leading-6 ${muted}`}>
          {q.tips?.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>

      <section id={`${idPrefix}approach`} className="scroll-mt-4">
        <h3 className={h}>The Approach <span title="A step-by-step way to reason about it"><CircleHelp className="h-4 w-4" /></span></h3>
        <div className={`${box} divide-y ${dark ? "divide-white/10" : "divide-line"}`}>
          {q.approach?.map((s, i) => {
            const isOpen = open.includes(i);
            return (
              <div key={s.title}>
                <button aria-expanded={isOpen} onClick={() => setOpen(isOpen ? open.filter((x) => x !== i) : [...open, i])} className="flex w-full items-center gap-3 px-4 py-3 text-left font-medium">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${dark ? "bg-white/10" : "bg-accent-tint text-accent"}`}>{i + 1}</span>
                  <span className="flex-1">{s.title}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <p className={`px-4 pb-4 pl-[52px] font-mono text-[13px] ${muted}`}>{s.body}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section id={`${idPrefix}solution`} className="scroll-mt-4">
        <h3 className={h}><Lightbulb className="h-5 w-5" />Solution <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${dark ? "bg-white/10" : "bg-green-50 text-green-700"}`}><BadgeCheck className="h-3.5 w-3.5" />Reviewed reference solution</span></h3>
        <div className={box}>
          <div className={`flex items-center justify-between border-b px-3 py-2 ${dark ? "border-white/10" : "border-line"}`}>
            <label className="sr-only" htmlFor={`${idPrefix}sol-lang`}>Solution language</label>
            <select id={`${idPrefix}sol-lang`} value={lang} onChange={(e) => setLang(e.target.value as Lang)} className={`rounded-md px-2 py-1 text-sm ${dark ? "bg-white/10" : "bg-white"}`}>
              {langs.map((l) => <option key={l} value={l} className="text-ink">{langLabel[l]}</option>)}
            </select>
            <button onClick={() => { navigator.clipboard?.writeText(code); toast("Solution copied"); }} className="flex items-center gap-1 text-sm"><Copy className="h-4 w-4" />Copy</button>
          </div>
          <CodeBlock code={code} dark={dark} />
        </div>
      </section>
    </div>
  );
}
