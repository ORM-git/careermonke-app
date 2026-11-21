"use client";

import { useState } from "react";
import { ChevronRight, Lock, Search, X } from "lucide-react";
import { PageHeader } from "@/components/shell";
import { CompanyLogo, UpgradePill } from "@/components/ui";
import { categories, companies, sampleQuestions } from "@/mocks/misc";

const colors = ["#2563EB", "#F97316", "#DC2626", "#0EA5E9", "#7C3AED", "#16A34A", "#DB2777", "#0F172A", "#A16207", "#4F46E5"];
const total = companies.reduce((s, c) => s + c.questions, 0);

export default function InterviewPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const list = companies.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const groups = [...new Set(list.map((c) => c.group))];
  const questions = sampleQuestions.filter((x) => cat === "All" || x.cat === cat);

  return (
    <>
      <PageHeader title="INTERVIEW" right={<UpgradePill>Upgrade to Unlock Interview Questions</UpgradePill>} />
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-2xl font-semibold">Real Interview Questions</h2><p className="text-sm text-neutral-500">Technical and behavioral questions reported by candidates, updated every week.</p></div>
          <div className="flex gap-3">{[[companies.length, "Companies"], [total.toLocaleString("en-IN"), "Total Questions"], ["+184", "Last 30 Days"]].map(([n, l]) => <div key={l} className="card px-5 py-3 text-center"><p className="text-xl font-semibold">{n}</p><p className="text-xs text-neutral-500">{l}</p></div>)}</div>
        </div>
        <label className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5"><Search className="h-4 w-4 text-neutral-500" /><span className="sr-only">Search companies</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${companies.length}+ companies`} className="w-full bg-transparent outline-none" /></label>
        <div className="flex flex-wrap gap-2">{categories.map((c) => <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? "chip-on" : ""}`}>{c}</button>)}</div>

        {groups.map((g) => (
          <section key={g}>
            <h3 className="mb-3 text-xl font-semibold">{g}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.filter((c) => c.group === g).map((c) => (
                <button key={c.name} onClick={() => setOpen(c.name)} className="card relative overflow-hidden p-4 text-left transition-colors hover:border-neutral-300">
                  <span className="flex items-center gap-3"><CompanyLogo initials={c.name.slice(0, 2)} color={colors[companies.indexOf(c) % colors.length]} size={40} /><span><b className="block font-semibold">{c.name}</b><span className="text-xs text-neutral-500">Updated {c.updated}</span></span></span>
                  <span className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm"><span><b>{c.questions}</b> Questions</span><ChevronRight className="h-4 w-4 text-neutral-400" /></span>
                  {c.locked && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white"><Lock className="h-3 w-3" />Upgrade to Unlock</span>}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(null)}>
          <aside role="dialog" aria-modal="true" aria-label={`${open} questions`} onClick={(e) => e.stopPropagation()} className="animate-pop absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white">
            <div className="flex items-center justify-between border-b border-line px-6 py-4"><h2 className="text-lg font-semibold">{open} · Interview Questions</h2><button aria-label="Close" onClick={() => setOpen(null)} className="rounded-full p-1.5 hover:bg-neutral-100"><X className="h-5 w-5" /></button></div>
            <div className="relative flex-1 space-y-3 overflow-hidden p-6">
              {questions.map((x, i) => (
                <div key={x.q} className={`card p-4 ${i >= 3 ? "select-none blur-sm" : ""}`} aria-hidden={i >= 3}>
                  <span className="tag">{x.cat}</span><p className="mt-2 text-sm font-medium">{x.q}</p>
                </div>
              ))}
              <div className="absolute inset-x-0 bottom-0 flex h-1/2 flex-col items-center justify-end gap-3 bg-gradient-to-t from-white via-white/90 to-transparent pb-10">
                <p className="text-sm font-medium">Free plan shows 3 questions per company</p>
                <UpgradePill>Upgrade to see all questions</UpgradePill>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
