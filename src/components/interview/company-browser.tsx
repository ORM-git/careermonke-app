"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Flag, Lock, Play, Search, ShieldCheck, X } from "lucide-react";
import { PageHeader } from "../shell";
import { CompanyLogo, EmptyState, UpgradePill } from "../ui";
import { QuestionCard } from "./question-card";
import { QuestionArticle, Tags } from "./question-article";
import { toast } from "../toast";
import { questionsFor, readStatus, type Company, type Status } from "@/mocks/interview";

export const LimitedPill = ({ dark }: { dark?: boolean }) => (
  <Link href="/pricing" className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${dark ? "bg-blue-200 text-ink" : "bg-accent-tint text-accent"}`}>
    <Lock className="h-3 w-3" />Limited Access · <b>Unlock Full Access Now</b>
  </Link>
);

export function LockedFilters({ dark }: { dark?: boolean }) {
  return (
    <>
      {["Topic", "Seniority"].map((f) => (
        <Link key={f} href="/pricing" aria-label={`${f} filter, upgrade to unlock`} className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm ${dark ? "border-white/15" : "border-line"}`}>
          <Lock className="h-3.5 w-3.5" />{f}<ChevronDown className="h-3.5 w-3.5" />
        </Link>
      ))}
    </>
  );
}

export const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);

export function CompanyBrowser({ company }: { company: Company }) {
  const all = useMemo(() => questionsFor(company.slug), [company.slug]);
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState(all.find((x) => !x.locked)?.id ?? "");
  const [status, setStatusMap] = useState<Record<string, Status>>({});
  useEffect(() => setStatusMap(readStatus()), []);

  const list = all.filter((x) => !q.trim() || (!x.locked && `${x.title} ${x.type} ${x.topic}`.toLowerCase().includes(q.trim().toLowerCase())));
  const active = all.find((x) => x.id === activeId);

  return (
    <>
      <PageHeader title="INTERVIEW" right={<UpgradePill>Upgrade to Unlock Interview Questions</UpgradePill>}>
        <Link href="/interview" className="text-sm">Browse Companies</Link>
      </PageHeader>
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <Link href="/interview" aria-label="Back to companies" className="rounded-lg p-1.5 hover:bg-neutral-100"><X className="h-5 w-5" /></Link>
          <span className="flex items-center gap-1 text-sm text-neutral-600"><ShieldCheck className="h-4 w-4 text-green-600" />Candidate-reported questions</span>
        </div>
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <CompanyLogo initials={initials(company.name)} color={company.color} size={40} />
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            <LimitedPill />
            <p className="ml-auto text-sm"><b className="text-lg">{company.questions}</b> Questions · Updated {company.updated}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
            <LockedFilters />
            <label className="ml-auto flex w-full items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-sm sm:w-72">
              <Search className="h-4 w-4 text-neutral-500" /><span className="sr-only">Search questions</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by question keywords" className="w-full bg-transparent outline-none" />
            </label>
          </div>
          <div className="grid lg:grid-cols-[340px_1fr]">
            <nav aria-label="Questions" className="max-h-[70vh] overflow-auto border-line lg:border-r">
              {list.length ? list.map((x) => <QuestionCard key={x.id} q={x} active={x.id === activeId} status={status[x.id] ?? "Not Started"} onOpen={() => setActiveId(x.id)} />)
                : <p className="p-6 text-center text-sm text-neutral-500">No readable questions match &quot;{q}&quot;.</p>}
            </nav>
            <article className="min-w-0 p-5 md:p-8">
              {active && !active.locked ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex gap-1.5 text-xs"><span className="rounded bg-accent-tint px-1.5 py-0.5 text-accent">{active.topic}</span><span className="rounded bg-accent-tint px-1.5 py-0.5 text-accent">{active.type}</span></div>
                      <h2 className="text-2xl font-semibold">{active.title}</h2>
                      <Tags q={active} />
                    </div>
                    <button onClick={() => toast("Thanks, we'll review this question")} className="flex shrink-0 items-center gap-1 text-xs text-neutral-500 underline"><Flag className="h-3.5 w-3.5" />Report issue</button>
                  </div>
                  <Link href={`/practice/${company.slug}/${active.id}`} className="pill-accent mt-5"><Play className="h-4 w-4" />Start Practice</Link>
                  <div className="mt-8"><QuestionArticle key={active.id} q={active} /></div>
                </>
              ) : <div className="pt-10"><EmptyState text="Pick a question on the left to read it." /></div>}
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
