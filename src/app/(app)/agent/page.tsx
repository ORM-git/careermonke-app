"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Zap } from "lucide-react";
import { PageHeader } from "@/components/shell";
import { CompanyLogo } from "@/components/ui";
import { useGuideAction } from "@/components/guide";
import { demoStore } from "@/lib/demo";
import { jobs } from "@/mocks/jobs";
import { matches, readSaved } from "@/mocks/filters";

type Status = "Queued" | "Applying" | "Applied" | "Failed";
const chip: Record<Status, string> = { Queued: "bg-neutral-100 text-neutral-700", Applying: "bg-amber-50 text-amber-700", Applied: "bg-green-50 text-green-700", Failed: "bg-red-50 text-red-600" };
const QUOTA = 20;
const TICK_MS = 1200;
const KEY = "cm-agent-sim";

// Queue built from the visitor's own feed. Every outcome is simulated; no application is ever sent.
const initialQueue = () => {
  const f = readSaved()[0]?.filter;
  const mine = f ? jobs.filter((j) => matches(j, f)) : [];
  return [...mine, ...jobs.filter((j) => !mine.includes(j))].slice(0, 8).map((j) => ({ id: j.id, status: "Queued" as Status }));
};
// The 4th job always "fails" so the failed state can be inspected.
const outcome = (i: number): Status => (i === 3 ? "Failed" : "Applied");

export default function AgentPage() {
  const [queue, setQueue] = useState<{ id: string; status: Status }[]>(() => JSON.parse(demoStore.getItem(KEY) || "null") ?? initialQueue());
  const [running, setRunning] = useState(false);
  const used = queue.filter((q) => q.status === "Applied" || q.status === "Failed").length;
  useEffect(() => demoStore.setItem(KEY, JSON.stringify(queue)), [queue]);
  useGuideAction("agent-start", () => setRunning(true));

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setQueue((q) => {
      const i = q.findIndex((x) => x.status === "Applying");
      if (i >= 0) return q.map((x, k) => (k === i ? { ...x, status: outcome(i) } : x));
      const next = q.findIndex((x) => x.status === "Queued");
      if (next < 0) { setRunning(false); return q; }
      return q.map((x, k) => (k === next ? { ...x, status: "Applying" } : x));
    }), TICK_MS);
    return () => clearInterval(t); // stops when paused or when the visitor leaves the page
  }, [running]);

  return (
    <>
      <PageHeader title="AGENT" />
      <div className="space-y-4 p-4 md:p-6">
        <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800"><Zap className="h-4 w-4" />Simulation: the agent is a Pro feature, unlocked here as a demo. It never submits real applications.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card flex items-center justify-between p-6">
            <div><p className="text-sm text-neutral-500">Agent status</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-semibold" role="status"><span className={`h-2.5 w-2.5 rounded-full ${running ? "animate-pulse bg-green-500" : "bg-neutral-400"}`} />{running ? "Running (simulated)" : used === queue.length ? "Finished" : "Paused"}</p></div>
            <div className="flex gap-2">
              {used === queue.length
                ? <button onClick={() => setQueue(initialQueue())} className="pill-ghost"><RotateCcw className="h-4 w-4" />Reset simulation</button>
                : <button onClick={() => setRunning(!running)} className="pill-accent px-6 py-3 text-base">{running ? <><Pause className="h-5 w-5" />Pause Agent</> : <><Play className="h-5 w-5" />Start Agent</>}</button>}
            </div>
          </div>
          <div className="card p-6">
            <p className="text-sm text-neutral-500">Today&apos;s simulated applications</p>
            <p className="mt-1 text-2xl font-semibold">{used} / {QUOTA}</p>
            <div className="mt-3 h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${(used / QUOTA) * 100}%` }} /></div>
          </div>
        </div>
        <div className="card divide-y divide-line">
          <p className="p-4 font-semibold">Application queue</p>
          {queue.map((q) => {
            const job = jobs.find((j) => j.id === q.id)!;
            return (
              <div key={q.id} className="flex items-center gap-3 p-4">
                <CompanyLogo initials={job.initials} color={job.color} size={36} />
                <span className="min-w-0 flex-1"><b className="block truncate text-sm font-semibold">{job.title}</b><span className="text-xs text-neutral-500">{job.company} · {job.location}</span>
                  {q.status === "Failed" && <span className="block text-xs text-red-600">Sample failure: the employer form needed a custom question the agent couldn&apos;t answer.</span>}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${chip[q.status]}`}>{q.status}{q.status === "Applied" ? " (simulated)" : ""}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
