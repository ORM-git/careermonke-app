"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { Question, Status } from "@/mocks/interview";

export function QuestionCard({ q, active, status, onOpen, href, dark = false }: { q: Question; active: boolean; status?: Status; onOpen?: (e: React.MouseEvent) => void; href?: string; dark?: boolean }) {
  const chip = dark ? "bg-white/10" : "bg-neutral-100 text-neutral-700";
  const body = (
    <>
      <div className="flex items-center gap-1.5 text-xs">
        <span className={`rounded px-1.5 py-0.5 ${dark ? "bg-white/10" : "bg-accent-tint text-accent"}`}>{q.topic}</span>
        <span className={`rounded px-1.5 py-0.5 ${dark ? "bg-white/10" : "bg-accent-tint text-accent"}`}>{q.type}</span>
        {q.locked
          ? <Lock className={`ml-auto h-5 w-5 rounded-full p-1 ${dark ? "bg-blue-200 text-ink" : "bg-accent-tint text-accent"}`} aria-label="Locked" />
          : status && <span className="ml-auto italic opacity-80">{status}</span>}
      </div>
      <p className={`mt-1.5 font-semibold ${q.locked ? "select-none blur-[5px]" : ""}`} aria-hidden={q.locked}>{q.title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
        {!q.locked && <span className={`rounded px-1.5 py-0.5 font-semibold ${q.difficulty === "Easy" ? "bg-sky-400 text-ink" : "bg-amber-400 text-ink"}`}>{q.difficulty}</span>}
        {[q.seniority, q.role, q.round].map((t) => <span key={t} className={`rounded px-1.5 py-0.5 ${chip}`}>{t}</span>)}
      </div>
      {q.locked && <p className="mt-2 text-xs opacity-60">Updated {q.updated}</p>}
    </>
  );
  const cls = `block w-full border-b px-4 py-3 text-left transition-colors ${dark ? "border-white/10" : "border-line"} ${active ? (dark ? "border-l-4 border-l-blue-400 bg-blue-500/15" : "border-l-4 border-l-accent bg-accent-tint/60") : dark ? "hover:bg-white/5" : "hover:bg-neutral-50"}`;
  if (q.locked) return <Link href="/pricing" className={cls} aria-label={`Locked ${q.type} question. Upgrade to unlock`}>{body}</Link>;
  return href
    ? <Link href={href} onClick={onOpen} className={cls} aria-current={active || undefined}>{body}</Link>
    : <button onClick={onOpen} className={cls} aria-current={active || undefined}>{body}</button>;
}
