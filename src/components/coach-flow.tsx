"use client";

import { useState } from "react";
import { CalendarCheck, CircleCheck, FileText, Star } from "lucide-react";
import { Drawer } from "./ui";
import { demoStore } from "@/lib/demo";
import { resumes, situations } from "@/mocks/misc";

export const COACH_GOAL_KEY = "cm-coach-goal";
const COACH = { name: "Meera Iyer (sample coach)", title: "Senior Technical Recruiter, 9 years", rating: "4.9", focus: ["Resume reviews", "Interview prep", "Career switches"] };
const SLOTS = ["Mon 10:00", "Mon 16:30", "Tue 11:00", "Wed 18:00", "Thu 09:30", "Fri 14:00"];
const STEPS = ["Your coach", "Goal", "Resume", "Time", "Confirm"];

/** Demo-only coaching flow: nothing is booked, emailed or charged. The chosen goal is kept for this visit. */
export function CoachFlow({ initialGoal, onClose }: { initialGoal: number; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(initialGoal);
  const [resume, setResume] = useState(resumes[0]?.id ?? "");
  const [slot, setSlot] = useState("");
  const [booked, setBooked] = useState(false);
  const canNext = step !== 3 || !!slot;
  const pickGoal = (i: number) => { setGoal(i); demoStore.setItem(COACH_GOAL_KEY, String(i)); };
  const radio = (on: boolean) => `flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${on ? "border-accent bg-accent-tint" : "border-line hover:bg-neutral-50"}`;

  return (
    <Drawer open label="Meet your coach" onClose={onClose} width="max-w-xl"
      header={!booked && (
        <ol className="flex gap-1 overflow-x-auto border-b border-line px-4 py-2 text-xs" aria-label="Steps">
          {STEPS.map((s, i) => <li key={s} aria-current={i === step ? "step" : undefined} className={`shrink-0 rounded-full px-2.5 py-1 ${i === step ? "bg-accent text-white" : i < step ? "bg-accent-tint text-accent" : "bg-neutral-100 text-neutral-500"}`}>{i + 1}. {s}</li>)}
        </ol>
      )}>
      <div className="space-y-4 p-6">
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Demo only: no session is booked, no invite or email is sent and nothing is charged.</p>
        {booked ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center" role="status">
            <CircleCheck className="h-12 w-12 fill-green-500 text-white" />
            <p className="text-lg font-semibold">Demo session confirmed</p>
            <p className="text-sm text-neutral-600">{slot} with {COACH.name} about &quot;{situations[goal].title}&quot;. This is a sample confirmation; nothing was scheduled.</p>
            <button onClick={onClose} className="pill-accent mt-2">Back to Coaching</button>
          </div>
        ) : (
          <>
            {step === 0 && (
              <div className="card flex gap-4 p-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">MI</span>
                <div>
                  <p className="font-semibold">{COACH.name}</p><p className="text-sm text-neutral-600">{COACH.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{COACH.rating} sample rating</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{COACH.focus.map((f) => <span key={f} className="tag">{f}</span>)}</div>
                </div>
              </div>
            )}
            {step === 1 && (
              <fieldset className="space-y-2"><legend className="mb-2 font-semibold">What do you want help with?</legend>
                {situations.map((s, i) => <label key={s.title} className={radio(goal === i)}><input type="radio" name="goal" checked={goal === i} onChange={() => pickGoal(i)} className="accent-[#2563EB]" /><span><b className="block">{s.title}</b>{s.text}</span></label>)}
              </fieldset>
            )}
            {step === 2 && (
              <fieldset className="space-y-2"><legend className="mb-2 font-semibold">Which resume should your coach review?</legend>
                {resumes.map((r) => <label key={r.id} className={radio(resume === r.id)}><input type="radio" name="resume" checked={resume === r.id} onChange={() => setResume(r.id)} className="accent-[#2563EB]" /><FileText className="h-4 w-4" />{r.name}{r.primary && <span className="tag">PRIMARY</span>}</label>)}
              </fieldset>
            )}
            {step === 3 && (
              <fieldset><legend className="mb-2 font-semibold">Pick a sample time slot (this week)</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SLOTS.map((t) => <label key={t} className={radio(slot === t)}><input type="radio" name="slot" checked={slot === t} onChange={() => setSlot(t)} className="accent-[#2563EB]" />{t}</label>)}
                </div>
              </fieldset>
            )}
            {step === 4 && (
              <dl className="card grid grid-cols-[110px_1fr] gap-2 p-5 text-sm">
                <dt className="text-neutral-500">Coach</dt><dd>{COACH.name}</dd>
                <dt className="text-neutral-500">Goal</dt><dd>{situations[goal].title}</dd>
                <dt className="text-neutral-500">Resume</dt><dd>{resumes.find((r) => r.id === resume)?.name}</dd>
                <dt className="text-neutral-500">Time</dt><dd>{slot}</dd>
              </dl>
            )}
            <div className="flex justify-between pt-2">
              <button onClick={() => (step === 0 ? onClose() : setStep(step - 1))} className="pill-ghost">{step === 0 ? "Cancel" : "Back"}</button>
              {step < 4
                ? <button onClick={() => setStep(step + 1)} disabled={!canNext} className="pill-accent disabled:opacity-40">Next</button>
                : <button onClick={() => setBooked(true)} className="pill-accent"><CalendarCheck className="h-4 w-4" />Confirm demo session</button>}
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
