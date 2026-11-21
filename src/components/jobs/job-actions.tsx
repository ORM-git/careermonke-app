"use client";

import { useEffect, useRef, useState } from "react";
import { SimulatedApplication } from "./simulated-application";
import { useGuideAction } from "../guide";
import { ArrowUpRight, BriefcaseBusiness, CircleCheck, CircleX, Flag, MoreHorizontal, Share2 } from "lucide-react";
import { Modal } from "../ui";
import { toast } from "../toast";
import { useApp } from "../app-state";
import type { Job } from "@/mocks/jobs";

export const shareJob = async (id: string) => {
  const url = `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/jobs/${id}`;
  try { await navigator.clipboard.writeText(url); toast("Success! Link copied to clipboard."); }
  catch { toast(`Copy this link: ${url}`); }
};

/**
 * Opens a local simulated employer form (nothing leaves the demo). Returning from it always asks
 * "Did you apply?" once for that attempt. Only an explicit "Yes" records the application.
 */
export function ApplyButton({ job, className = "pill-accent", guided = false }: { job: Job; className?: string; guided?: boolean }) {
  const { apply, applied } = useApp();
  const [stage, setStage] = useState<"idle" | "form" | "ask">("idle");
  const ask = stage === "ask";
  const done = applied.some((a) => a.id === job.id);
  const setAsk = (v: boolean) => setStage(v ? "ask" : "idle");
  useGuideAction(guided ? "apply" : "-", () => setStage("form"));

  return (
    <>
      <button onClick={() => setStage("form")} title="Opens a simulated application inside this demo" className={done ? "pill-ghost" : className}>
        {done ? "APPLIED" : <>APPLY <ArrowUpRight className="h-4 w-4" /></>}
      </button>
      {stage === "form" && <SimulatedApplication job={job} onReturn={() => setStage("ask")} />}
      <Modal open={ask} onClose={() => setAsk(false)} title="Did you apply?">
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100"><BriefcaseBusiness className="h-7 w-7" /></span>
          <h2 className="text-2xl font-semibold">Did you apply?</h2>
          <p className="text-sm text-neutral-600">Tell us so we can track this application and improve your recommendations.</p>
          <button onClick={() => { apply(job.id); setAsk(false); toast(`Added ${job.title} to Applied`); }} className="pill-accent mt-2 w-full rounded-lg py-3">Yes, I applied!</button>
          <button onClick={() => setAsk(false)} className="pill-ghost w-full rounded-lg py-3">No, I didn&apos;t apply</button>
        </div>
      </Modal>
    </>
  );
}

export const REPORT_REASONS = [
  "I think it's a scam or a fake job",
  "I think it's discriminatory or offensive",
  "The company info or job details are wrong",
  "The posting date is wrong",
  "This job is no longer available",
  "This job is not actually remote",
  "This job is not in the listed country",
];

export function ReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const close = () => { setReason(""); onClose(); };
  return (
    <Modal open={open} onClose={close} title="Report this job">
      <form className="p-6" onSubmit={(e) => { e.preventDefault(); if (!reason) return; close(); toast("Thanks. Reports are saved for review once the backend is connected; nothing was sent."); }}>
        <h2 className="pr-8 text-lg font-semibold">Tell us a little more</h2>
        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Reason</legend>
          {REPORT_REASONS.map((r) => (
            <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${reason === r ? "bg-accent-tint" : "bg-neutral-50"}`}>
              <input type="radio" name="report" checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-[#2563EB]" />{r}
            </label>
          ))}
        </fieldset>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={close} className="pill-ghost rounded-lg">Cancel</button>
          <button disabled={!reason} className="pill-accent rounded-lg disabled:opacity-40">Submit</button>
        </div>
      </form>
    </Modal>
  );
}

export function CardMenu({ job }: { job: Job }) {
  const { hide, apply, applied } = useApp();
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down);
    window.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); window.removeEventListener("keydown", key); };
  }, [open]);
  const item = "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm hover:bg-neutral-50";
  const isApplied = applied.some((a) => a.id === job.id);
  return (
    <div ref={ref} className="relative self-start">
      <button aria-label="More options" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-full p-1 hover:bg-neutral-100"><MoreHorizontal className="h-5 w-5" /></button>
      {open && (
        <div role="menu" className="animate-pop absolute right-0 top-8 z-20 w-48 rounded-xl border border-line bg-white py-1 shadow-lg">
          <button role="menuitem" className={item} onClick={() => { setOpen(false); hide(job.id); toast(`Removed ${job.title} from your list`); }}><CircleX className="h-4 w-4" />Remove From List</button>
          {!isApplied && <button role="menuitem" className={item} onClick={() => { setOpen(false); apply(job.id); toast("Moved to Applied"); }}><CircleCheck className="h-4 w-4" />Already Applied</button>}
          <button role="menuitem" className={item} onClick={() => { setOpen(false); shareJob(job.id); }}><Share2 className="h-4 w-4" />Share</button>
          <button role="menuitem" className={item} onClick={() => { setOpen(false); setReport(true); }}><Flag className="h-4 w-4" />Report Issue</button>        </div>
      )}
      <ReportModal open={report} onClose={() => setReport(false)} />
    </div>
  );
}
