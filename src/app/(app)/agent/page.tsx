"use client";

import Link from "next/link";
import { Bot, Lock, Pause, Play } from "lucide-react";
import { PageHeader } from "@/components/shell";
import { CompanyLogo } from "@/components/ui";
import { jobs } from "@/mocks/jobs";

const queue = jobs.slice(0, 6).map((j, i) => ({ job: j, status: (["Applied", "Applied", "Failed", "Queued", "Queued", "Queued"] as const)[i] }));
const chip = { Queued: "bg-neutral-100 text-neutral-700", Applied: "bg-green-50 text-green-700", Failed: "bg-red-50 text-red-600" };

export default function AgentPage() {
  return (
    <>
      <PageHeader title="AGENT" />
      <div className="relative p-4 md:p-6">
        {/* Free plan sees the real dashboard behind a lock, never a blank page */}
        <div aria-hidden="true" className="pointer-events-none select-none space-y-4 opacity-60 blur-[2px]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card flex items-center justify-between p-6">
              <div><p className="text-sm text-neutral-500">Agent status</p><p className="mt-1 flex items-center gap-2 text-2xl font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-neutral-400" />Paused</p></div>
              <span className="pill-accent px-6 py-3 text-base"><Play className="h-5 w-5" />Start Agent</span>
            </div>
            <div className="card p-6">
              <p className="text-sm text-neutral-500">Today&apos;s applications</p>
              <p className="mt-1 text-2xl font-semibold">0 / 20</p>
              <div className="mt-3 h-2 rounded-full bg-neutral-100"><div className="h-2 w-0 rounded-full bg-accent" /></div>
            </div>
          </div>
          <div className="card divide-y divide-line">
            <p className="flex items-center justify-between p-4 font-semibold">Application queue <Pause className="h-4 w-4" /></p>
            {queue.map(({ job, status }) => (
              <div key={job.id} className="flex items-center gap-3 p-4">
                <CompanyLogo initials={job.initials} color={job.color} size={36} />
                <span className="min-w-0 flex-1"><b className="block truncate text-sm font-semibold">{job.title}</b><span className="text-xs text-neutral-500">{job.company}</span></span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${chip[status]}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="card animate-pop max-w-sm p-8 text-center shadow-xl">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-tint text-accent"><Bot className="h-7 w-7" /></span>
            <h2 className="mt-4 text-xl font-semibold">Let the agent apply for you</h2>
            <p className="mt-2 text-sm text-neutral-600">The auto-apply agent matches roles, tailors your resume and applies to up to 20 jobs a day.</p>
            <Link href="/pricing" className="pill-accent mt-5"><Lock className="h-4 w-4" />Upgrade to Pro</Link>
          </div>
        </div>
      </div>
    </>
  );
}
