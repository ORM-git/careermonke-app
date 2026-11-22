"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, ChevronDown, Mic, Sparkles } from "lucide-react";
import { Logo, Modal, MonkeAvatar } from "./ui";
import { CheckCard } from "./onboarding-shell";
import { toast } from "./toast";
import { additionalFunctions, chatSuggestions, defaultLevels, experienceLevels, KEYS, tourSteps } from "@/mocks/onboarding";
import type { Job } from "@/mocks/jobs";
import { readProfile } from "@/mocks/profile";
import { demoStore } from "@/lib/demo";
import { countMatches, type Filter } from "@/mocks/filters";
import { startGuide } from "./guide";
import { SimulatedApplication } from "./jobs/simulated-application";
import { AUTOFILL_DEMO_KEY } from "./jobs/rail";

/* ---------- Found-roles popup ---------- */
/** The count comes from the same filter and fixtures as the feed, including the boxes ticked here. */
export function WelcomePopup({ open, base, onConfirm }: { open: boolean; base: Filter; onConfirm: (levels: string[], extraFunctions: string[]) => void }) {
  const suggested = additionalFunctions.filter((x) => !base.jobFunctions.includes(x));
  const [levels, setLevels] = useState(defaultLevels);
  const [fns, setFns] = useState(suggested);
  const count = countMatches({ ...base, levels, jobFunctions: [...base.jobFunctions, ...fns] });
  const flip = (list: string[], set: (v: string[]) => void, v: string, on: boolean) => set(on ? [...list, v] : list.filter((x) => x !== v));
  return (
    <Modal open={open} onClose={() => onConfirm(levels, fns)} wide title="We found roles that fit you">
      <div className="bg-gradient-to-b from-accent-tint to-white px-4 pb-6 pt-8 sm:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow"><Logo withText={false} /></span>
          <h2 className="text-2xl sm:text-[26px]">{count ? <>👏 Welcome! We found <b>{count} sample {count === 1 ? "role" : "roles"}</b> that fit you best.</> : <>No sample roles match all of these yet. Untick a level to widen it.</>}</h2>
          <p className="text-xs text-neutral-500">Demo data: counted from this demo&apos;s sample jobs.</p>
        </div>
        <div className="mt-6 space-y-4 rounded-3xl bg-white p-4 shadow-sm">
          <p className="text-center text-[15px]">Take a moment to review, just making sure everything looks right for you.</p>
          <fieldset className="rounded-xl border border-line p-3">
            <legend className="px-1 font-semibold">Recommended Experience Levels</legend>
            <div className="grid gap-1 sm:grid-cols-2">
              {experienceLevels.map(({ label, sub }) => (
                <div key={label} className="relative">
                  <CheckCard label={label} checked={levels.includes(label)} onChange={(v) => flip(levels, setLevels, label, v)} />
                  {sub && <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 text-xs text-neutral-500 lg:block">{sub}</span>}
                </div>
              ))}
            </div>
          </fieldset>
          <fieldset className="rounded-xl border border-line p-3">
            <legend className="px-1 font-semibold">Additional Job Functions Matching Your Background</legend>
            <div className="grid gap-1 sm:grid-cols-2">
              {suggested.map((f) => <CheckCard key={f} label={f} checked={fns.includes(f)} onChange={(v) => flip(fns, setFns, f, v)} />)}
            </div>
          </fieldset>
        </div>
        <div className="mt-6 flex justify-center"><button onClick={() => onConfirm(levels, fns)} className="pill-dark w-full max-w-xs py-3 text-base">Confirm &amp; See Jobs</button></div>
      </div>
    </Modal>
  );
}

/* ---------- Tour ---------- */
type Rect = { top: number; left: number; width: number; height: number };

export function Tour({ step, onNext, onExit, onTry, steps = tourSteps }: { step: number; onNext: () => void; onExit: () => void; onTry: () => void; steps?: { anchor: string; title: string; text: string }[] }) {
  const s = steps[step];
  const [rect, setRect] = useState<Rect | null>(null);
  const [mobile, setMobile] = useState(false);

  const measure = useCallback(() => {
    setMobile(window.innerWidth < 768);
    const el = document.querySelector<HTMLElement>(`[data-tour="${s.anchor}"]`);
    const r = el?.getBoundingClientRect();
    setRect(r && r.width ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
  }, [s.anchor]);

  useLayoutEffect(() => {
    document.querySelector(`[data-tour="${s.anchor}"]`)?.scrollIntoView({ block: "center" });
    measure();
    // Re-measure once layout settles (sticky headers, late content) so the spotlight lands on the anchor.
    const settle = setTimeout(measure, 350);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => { clearTimeout(settle); ro.disconnect(); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true); };
  }, [measure, s.anchor]);

  const last = step === steps.length - 1;
  const card = (
    <div className="space-y-1">
      <p className="mb-2 flex items-center gap-2 font-semibold"><MonkeAvatar size={32} />Monke</p>
      <p className="text-lg font-semibold">{s.title}</p>
      <p className="text-sm text-neutral-700">{s.text}</p>
      <div className="flex justify-end gap-2 pt-3">
        <button onClick={onExit} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-400 hover:text-ink">EXIT</button>
        <button onClick={last ? onTry : onNext} className="pill-accent rounded-lg px-5 py-1.5">{last ? "TRY IT NOW" : "NEXT"}</button>
      </div>
    </div>
  );

  const pad = 6;
  const below = rect ? rect.top + rect.height + 220 < window.innerHeight : true;
  const tipW = 320;
  const tipLeft = rect ? Math.max(12, Math.min(window.innerWidth - tipW - 12, rect.left + rect.width / 2 - tipW / 2)) : 0;
  const arrowLeft = rect ? rect.left + rect.width / 2 - tipLeft - 8 : 0;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={s.title}>
      {rect ? (
        <div className="pointer-events-none absolute rounded-xl transition-all duration-200" style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: "0 0 0 9999px rgba(0,0,0,.55)" }} />
      ) : <div className="absolute inset-0 bg-black/55" />}
      {mobile || !rect ? (
        <div key={step} className="animate-pop absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">{card}</div>
      ) : (
        <div key={step} className="animate-pop absolute rounded-2xl bg-white p-5 shadow-2xl" style={{ width: tipW, left: tipLeft, ...(below ? { top: rect.top + rect.height + pad + 14 } : { bottom: window.innerHeight - rect.top + pad + 14 }) }}>
          <span className={`absolute h-4 w-4 rotate-45 bg-white ${below ? "-top-2" : "-bottom-2"}`} style={{ left: arrowLeft }} aria-hidden="true" />
          {card}
        </div>
      )}
    </div>
  );
}

/* ---------- Assistant chat panel ---------- */
function FitReport({ j }: { j: Job }) {
  const mine = readProfile().skills.map((s) => s.toLowerCase());
  const have = j.skills.filter((s) => mine.includes(s.toLowerCase()));
  const miss = j.skills.filter((s) => !mine.includes(s.toLowerCase()));
  const Row = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => <li className="flex gap-1.5"><span aria-hidden="true">{ok ? "✅" : "❌"}</span><span>{children}</span></li>;
  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">Demo analysis from your profile and the job's listed skills.</p>
      <div><p className="font-semibold">Relevant Experience</p><ul className="mt-1"><Row ok={j.breakdown.experience >= 60}>Your recent role overlaps with the day-to-day work described here.</Row></ul></div>
      <div className="border-t border-line pt-3"><p className="font-semibold">Seniority</p><ul className="mt-1"><Row ok={j.expMin <= 2}>The role asks for {j.exp}; check your years in similar work.</Row></ul></div>
      <div className="border-t border-line pt-3"><p className="font-semibold">Education</p><ul className="mt-1"><Row ok>No specific education requirement is stated.</Row></ul></div>
      <div className="border-t border-line pt-3"><p className="font-semibold">Core Skills</p><ul className="mt-1 space-y-1">
        {have.length > 0 && <Row ok>Aligned: {have.join(", ")}.</Row>}
        {miss.length > 0 && <Row ok={false}>Not shown in your profile: {miss.join(", ")}.</Row>}
      </ul></div>
    </div>
  );
}

export const FIT_PROMPT = "Analyze how well I fit this job.";
const reply = (q: string, j: Job): React.ReactNode =>
  q === FIT_PROMPT ? <FitReport j={j} />
  : q.includes("good fit") ? `Your analytics work lines up with ${j.company}'s needs, and your SQL skills match ${j.breakdown.skills}% of the listing.`
  : q.includes("tips") ? "Lead with one quantified result, mirror 3 keywords from the job post, and keep it to one page."
  : q.includes("custom resume") ? `Done! I drafted a resume tailored to ${j.title}. Open the job and use "Customize Your Resume" to review it.`
  : q.includes("Connections") ? `I found 5 people at ${j.company}, including 1 former colleague. Open the job to see them.`
  : "Good question! This is a demo, so I can only answer the suggested questions for now.";

export function ChatPanel({ job, onClose, initialAsk }: { job: Job; onClose: () => void; initialAsk?: string }) {
  const [msgs, setMsgs] = useState<{ me: boolean; text: React.ReactNode }[]>([]);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const ask = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { me: true, text: q }]);
    setText("");
    setThinking(true);
    setTimeout(() => { setMsgs((m) => [...m, { me: false, text: reply(q, job) }]); setThinking(false); }, 900);
  };
  const asked = useRef(false);
  useEffect(() => { if (initialAsk && !asked.current) { asked.current = true; ask(initialAsk); } });
  return (
    <aside aria-label="Monke assistant" className="animate-pop fixed inset-x-2 bottom-16 top-20 z-40 flex flex-col rounded-2xl border border-line bg-white shadow-2xl md:inset-x-auto md:bottom-4 md:right-4 md:w-[380px]">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="flex items-center gap-2 text-lg font-medium"><Sparkles className="h-5 w-5 text-accent" />Monke</p>
        <button onClick={onClose} aria-label="Close assistant" className="rounded-full p-1 hover:bg-neutral-100"><ChevronDown className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-auto px-4">
        <p className="rounded-2xl bg-neutral-100 px-4 py-3 text-sm">I see that you&apos;re asking about this <b>{job.title}</b> role at <b>{job.company}</b>. What would you like to know?</p>
        {msgs.length === 0 && <div className="flex flex-col items-end gap-2">{chatSuggestions.map((s) => <button key={s} onClick={() => ask(s)} className="flex items-center gap-1 rounded-full bg-accent-tint px-3 py-1 text-xs hover:bg-blue-100">{s}<ArrowUp className="h-3 w-3" /></button>)}</div>}
        {msgs.map((m, i) => <div key={i} className={`animate-pop max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.me ? "ml-auto w-fit bg-accent text-white" : "bg-neutral-100"}`}>{m.text}</div>)}
        {thinking && <p role="status" className="flex items-center gap-1 text-sm text-neutral-500">Thinking<span className="dot">.</span><span className="dot [animation-delay:.2s]">.</span><span className="dot [animation-delay:.4s]">.</span></p>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="m-2 rounded-2xl border-2 border-blue-200 p-3">
        <label htmlFor="monke-ask" className="sr-only">Ask Monke</label>
        <textarea id="monke-ask" rows={2} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(text); } }} placeholder="Ask me anything..." className="w-full resize-none text-sm outline-none" />
        <div className="flex justify-end gap-2">
          <button type="button" aria-label="Voice input" onClick={() => toast("Voice input is coming soon")} className="rounded-full border border-line p-1.5"><Mic className="h-4 w-4" /></button>
          <button aria-label="Send" disabled={!text.trim()} className="rounded-full bg-accent p-1.5 text-white disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
        </div>
      </form>
    </aside>
  );
}

/* ---------- Autofill modal ---------- */
/** "Enable" opens a sample application that autofills locally. No extension is installed; the checklist ticks only after the fill ran. */
export function AutofillModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [demo, setDemo] = useState(false);
  if (demo) return <SimulatedApplication title="Product Manager, Analytics (sample)" onReturn={({ filled }) => { if (filled) demoStore.setItem(AUTOFILL_DEMO_KEY, "1"); setDemo(false); onClose(); }} />;
  return (
    <Modal open={open} onClose={onClose} title="Apply 5x Faster with Autofill">
      <div className="p-6">
        <h2 className="border-b border-line pb-4 pr-8 text-lg font-semibold">Apply 5x Faster with Autofill</h2>
        <p className="mt-4 text-[15px] text-neutral-700">Save time with one click - autofill job applications across all major ATS platforms instantly and accurately.</p>
        <div className="mt-4 flex gap-3 rounded-xl bg-gradient-to-br from-neutral-100 to-accent-tint p-4">
          <div className="flex-1 space-y-2 rounded-lg bg-white p-3">
            {["Name", "Email", "City"].map((f) => <div key={f}><p className="text-[10px] text-neutral-500">{f}</p><div className="h-3 rounded bg-neutral-100" /></div>)}
          </div>
          <div className="flex-[1.3] space-y-2 rounded-lg bg-white p-3 shadow">
            <p className="flex items-center gap-1 text-xs font-semibold"><Logo withText={false} /> CareerMonke</p>
            <p className="text-xs font-semibold">Product Manager, Analytics</p>
            <div className="rounded-md bg-accent py-1.5 text-center text-xs font-semibold text-white">Autofilling...</div>
            <div className="h-1.5 rounded bg-neutral-100"><div className="h-1.5 w-2/3 rounded bg-accent" /></div>
          </div>
        </div>
        <p className="mt-4 flex flex-wrap items-center justify-between gap-2 text-lg text-neutral-600">
          <span className="font-semibold">workday</span><span>greenhouse</span><span className="font-serif font-bold">Ashby</span><span className="tracking-widest">LEVER</span><span className="font-semibold">icims</span>
        </p>
        <button onClick={() => setDemo(true)} className="pill-dark mt-4 w-full rounded-lg py-3">Yes, Show Me Autofill</button>
        <p className="mt-2 text-center text-xs text-neutral-500">Demo: runs on a sample form here. No browser extension is installed.</p>
      </div>
    </Modal>
  );
}

/* ---------- Orchestration for /jobs ---------- */
export function useWelcomeFlow() {
  const [popup, setPopup] = useState(false);
  const [tour, setTour] = useState<number | null>(null);
  const [chat, setChat] = useState(false);
  const [autofill, setAutofill] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(location.search).has("welcome") && !demoStore.getItem(KEYS.welcome)) setPopup(true);
  }, []);

  // Visit-scoped: the tour hands over to the guided walkthrough instead of popping more modals on a timer.
  const endTour = () => {
    demoStore.setItem(KEYS.tour, "1");
    setTour(null);
    startGuide();
  };

  return {
    popup, tour, chat, autofill,
    confirmPopup: () => {
      demoStore.setItem(KEYS.welcome, "1");
      setPopup(false);
      // Keep the deploy base path (e.g. /careermonke-app) and any other query params; only drop welcome.
      const p = new URLSearchParams(location.search); p.delete("welcome");
      history.replaceState(null, "", `${location.pathname}${p.size ? `?${p}` : ""}`);
      if (!demoStore.getItem(KEYS.tour)) setTour(0);
    },
    nextTour: () => setTour((t) => (t === null ? null : t + 1)),
    exitTour: endTour,
    tryIt: () => { endTour(); setChat(true); },
    setChat, setAutofill,
  };
}
