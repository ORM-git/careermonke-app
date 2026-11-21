"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { PageHeader } from "../shell";
import { CompanyLogo } from "../ui";
import { companies, groups, snapshot, ticker, type Company } from "@/mocks/interview";
import { toast } from "../toast";

const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);

function Card({ c }: { c: Company }) {
  return (
    <Link href={`/interview/${c.slug}`} className="card block p-4 transition-colors hover:border-neutral-300">
      <span className="flex items-center gap-3"><CompanyLogo initials={initials(c.name)} color={c.color} size={40} /><span><b className="block font-semibold">{c.name}</b><span className="text-xs text-neutral-500">Updated {c.updated}</span></span></span>
      <span className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm"><span><b>{c.questions}</b> Questions</span><ChevronRight className="h-4 w-4 text-neutral-400" /></span>
    </Link>
  );
}

function Featured({ c }: { c: Company }) {
  return (
    <Link href={`/interview/${c.slug}`} className="flex flex-col rounded-2xl bg-gradient-to-br from-accent-tint via-blue-100 to-sky-200 p-5 transition-shadow hover:shadow-md lg:row-span-2">
      <span className="flex items-center gap-3"><CompanyLogo initials={initials(c.name)} color={c.color} size={52} /><b className="text-xl font-semibold">{c.name}</b><span className="ml-auto text-xs text-neutral-500">Updated {c.updated}</span></span>
      <p className="mt-5 flex-1 border-t border-white/60 pt-4 text-[15px]">{c.blurb}</p>
      <span className="mt-6 flex gap-10"><span><b className="block text-2xl">{c.questions}</b><span className="text-sm">Total Questions</span></span></span>
    </Link>
  );
}

export function InterviewDirectory() {
  const [q, setQ] = useState("");
  const results = q.trim() ? companies.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())) : [];

  return (
    <>
      <PageHeader title="INTERVIEW" right={<span className="rounded-full bg-accent-tint px-3 py-1 text-xs font-semibold text-accent">Pro feature · unlocked in this demo</span>} />
      <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-2xl font-semibold">Real Interview Questions</h2><p className="text-sm text-neutral-500">Technical and behavioral questions reported by candidates. Counts as of {snapshot.date}.</p></div>
          <div className="flex gap-3">
            {([[snapshot.companies, "Companies"], [snapshot.questions.toLocaleString("en-IN"), "Total Questions"], [`+${snapshot.last30}`, "Last 30 Days"]] as const).map(([n, l]) => (
              <div key={l} className="card px-5 py-3 text-center"><p className="text-xl font-semibold">{n}</p><p className="text-xs text-neutral-500">{l}</p></div>
            ))}
          </div>
        </div>

        <div className="relative">
          <label className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5">
            <Search className="h-4 w-4 text-neutral-500" /><span className="sr-only">Search companies</span>
            <input role="combobox" aria-expanded={!!q.trim()} aria-controls="company-results" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${snapshot.companies}+ companies`} className="w-full bg-transparent outline-none" />
          </label>
          {q.trim() && (
            <ul id="company-results" role="listbox" className="animate-pop absolute inset-x-0 top-12 z-20 max-h-72 overflow-auto rounded-xl border border-line bg-white py-1 shadow-lg">
              {results.length ? results.map((c) => (
                <li key={c.slug} role="option" aria-selected="false">
                  <Link href={`/interview/${c.slug}`} className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50"><CompanyLogo initials={initials(c.name)} color={c.color} size={28} /><span className="flex-1">{c.name}</span><span className="text-xs text-neutral-500">{c.questions} questions</span></Link>
                </li>
              )) : <li className="px-4 py-3 text-sm text-neutral-500">No companies match &quot;{q}&quot;.</li>}
            </ul>
          )}
        </div>

        <div className="overflow-hidden border-b border-line pb-3" aria-label="Recently added questions">
          <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-3 motion-reduce:animate-none">
            {[...ticker, ...ticker].map((t, i) => <span key={i} className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600" aria-hidden={i >= ticker.length}>{t}</span>)}
          </div>
        </div>

        {groups.map((g) => {
          const list = companies.filter((c) => c.group === g);
          const feat = list.find((c) => c.featured);
          return (
            <section key={g}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-semibold">{g}</h3>
                {g === "High-Growth" && <button onClick={() => toast("Demo: question contributions aren’t sent anywhere.")} className="flex items-center gap-1 text-sm underline"><Plus className="h-4 w-4" />Contribute a question</button>}
              </div>
              <div className={`grid gap-4 sm:grid-cols-2 ${feat ? "lg:grid-cols-[2fr_1fr_1fr]" : "lg:grid-cols-4"}`}>
                {feat && <Featured c={feat} />}
                {list.filter((c) => c !== feat).map((c) => <Card key={c.slug} c={c} />)}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
