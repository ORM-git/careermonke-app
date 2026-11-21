"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Compass, X } from "lucide-react";
import { demoStore, requestedPath, subscribeDemo } from "@/lib/demo";
import { jobs } from "@/mocks/jobs";
import { matches, readSaved } from "@/mocks/filters";
import { questionsFor } from "@/mocks/interview";
import { useRestartDemo } from "./demo-gate";

const STEP = "cm-guide-step";
const PENDING = "cm-guide-pending";

/** First job in the visitor's own feed, so the walkthrough shows a relevant sample. */
export const guideJobId = () => {
  const f = readSaved()[0]?.filter;
  return (f ? jobs.find((j) => matches(j, f)) : undefined)?.id ?? jobs[0].id;
};

type Step = { title: string; text: string; path: () => string; action?: string };
export const GUIDE_STEPS: Step[] = [
  { title: "Filters & saved filters", text: "Your saved filter came from onboarding. Change anything here; Confirm applies it to the feed.", path: () => "/jobs", action: "filters" },
  { title: "Job detail", text: "Match breakdown, insider connections, qualifications and company facts for one sample job.", path: () => `/jobs/${guideJobId()}` },
  { title: "Apply (simulated)", text: "A local sample employer form fills from your sample profile. Nothing is sent anywhere.", path: () => `/jobs/${guideJobId()}`, action: "apply" },
  { title: "Application tracker", text: "Move applications between stages. A sample application is already here to try.", path: () => "/jobs", action: "tracker" },
  { title: "Resume list", text: "Your resumes, grade and analysis status. Uploads stay in your browser.", path: () => "/resume" },
  { title: "Resume customization", text: "See how your resume compares with a job, then a simulated tailored version.", path: () => "/resume", action: "resume-compare" },
  { title: "Profile", text: "Complete your profile step by step. Edits stay drafts until you save.", path: () => "/profile", action: "profile-wizard" },
  { title: "Explore (AI search)", text: "A sample search for data-analyst roles, ranked by match.", path: () => "/explore", action: "explore-example" },
  { title: "Agent (simulated)", text: "Start and pause a local auto-apply simulation. No real applications are sent.", path: () => "/agent", action: "agent-start" },
  { title: "Coaching", text: "Pick a goal, a sample coach and a time. Demo only: nothing is booked.", path: () => "/coaching", action: "coach-flow" },
  { title: "Interview questions", text: "Browse sample questions for a company; filters work in this demo.", path: () => "/interview/flipkart" },
  { title: "Practice mode", text: "Edit code and run sample results. Your code isn't executed in this demo.", path: () => `/practice/flipkart/${questionsFor("flipkart")[0].id}` },
  { title: "Checklist & Autofill", text: "Watch a sample application form autofill, then edit it. This ticks the checklist for this visit.", path: () => "/jobs", action: "autofill" },
];

const useStep = () => {
  const v = useSyncExternalStore(subscribeDemo, () => demoStore.getItem(STEP), () => null);
  return v === null ? null : Number(v);
};

export const startGuide = () => demoStore.setItem(STEP, "-1");

/** Runs `fn` once when the walkthrough arrives at a step asking for `name` on this screen. */
export function useGuideAction(name: string, fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    // Deferred so it runs after the screen's own mount effects (e.g. reading tab/sort from the URL) and is not overwritten.
    const check = () => { if (demoStore.getItem(PENDING) === name) { demoStore.removeItem(PENDING); setTimeout(() => ref.current(), 0); } };
    check();
    return subscribeDemo(check);
  }, [name]);
}

export function GuideBar({ dark = false }: { dark?: boolean }) {
  const step = useStep();
  const router = useRouter();
  const path = usePathname();
  const restart = useRestartDemo();
  if (step === null) return null;

  const go = (i: number) => {
    if (i >= GUIDE_STEPS.length) { demoStore.removeItem(STEP); return; }
    const s = GUIDE_STEPS[i];
    const target = s.path();
    demoStore.setItem(STEP, String(i));
    if (target !== path) router.push(target);
    if (s.action) demoStore.setItem(PENDING, s.action); // the target screen consumes it once mounted
  };
  const next = requestedPath();
  const s = step >= 0 ? GUIDE_STEPS[step] : null;
  const btn = `flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${dark ? "hover:bg-white/10" : "hover:bg-neutral-100"}`;

  return (
    <div role="region" aria-label="Guided demo" className={`fixed bottom-16 left-1/2 z-[60] w-[min(680px,calc(100%-1rem))] -translate-x-1/2 rounded-2xl p-3 shadow-2xl ring-1 md:bottom-4 ${dark ? "bg-[#262626] text-white ring-white/10" : "bg-white ring-black/5"}`}>
      <div className="flex items-start gap-3">
        <Compass className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {s ? (
            <>
              <p className="text-xs font-medium text-accent">Guided demo · step {step + 1} of {GUIDE_STEPS.length}</p>
              <p className="font-semibold">{s.title}</p>
              <p className={`text-sm ${dark ? "text-white/70" : "text-neutral-600"}`}>{s.text}</p>
            </>
          ) : (
            <>
              <p className="font-semibold">Take the guided demo</p>
              <p className={`text-sm ${dark ? "text-white/70" : "text-neutral-600"}`}>Walk through every screen with sample data. The sidebar still works any time.</p>
              {next && next !== "/jobs" && <button onClick={() => router.push(next)} className="mt-1 text-sm font-semibold text-accent underline">Or open the page you came for ({next})</button>}
            </>
          )}
        </div>
        <button onClick={() => demoStore.removeItem(STEP)} aria-label="Skip guided demo" className="rounded-full p-1 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-end gap-1">
        <button onClick={restart} className={`${btn} mr-auto font-normal`}>Restart demo</button>
        <button onClick={() => demoStore.removeItem(STEP)} className={`${btn} font-normal`}>Skip</button>
        {step > 0 && <button onClick={() => go(step - 1)} className={btn}><ArrowLeft className="h-4 w-4" />Back</button>}
        <button onClick={() => go(step + 1)} className="pill-accent py-1.5">{step < 0 ? "Start" : step === GUIDE_STEPS.length - 1 ? "Finish" : "Next"}<ArrowRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
