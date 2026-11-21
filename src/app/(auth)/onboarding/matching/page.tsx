"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Sparkles } from "lucide-react";
import { featureHighlights, statusSentences } from "@/mocks/onboarding";
import { demoStore } from "@/lib/demo";

const DURATION = 8000;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2); // easeInOutQuad

// Simple product mocks made of divs: one per feature highlight.
function Illustration({ i }: { i: number }) {
  const bar = (w: string, c = "bg-neutral-200") => <div className={`h-2 rounded ${c}`} style={{ width: w }} />;
  if (i === 0) return (
    <div className="w-60 space-y-2 rounded-xl bg-white p-4 shadow-md">
      <p className="flex items-center gap-1 text-xs font-semibold"><Sparkles className="h-3.5 w-3.5 text-accent" />Tailored resume</p>
      {bar("90%")}{bar("70%")}{bar("80%", "bg-blue-200")}{bar("60%")}
      <div className="flex gap-1 pt-1">{["Summary", "Skills", "Experience"].map((t) => <span key={t} className="rounded bg-accent-tint px-1.5 py-0.5 text-[9px] text-accent">{t} enhanced</span>)}</div>
    </div>
  );
  if (i === 1) return (
    <div className="w-60 space-y-2 rounded-xl bg-white p-4 shadow-md">
      <p className="text-xs font-semibold">Application form</p>
      {["Name", "Email", "Resume", "Phone"].map((f, k) => (
        <p key={f} className="flex items-center gap-2 text-[10px]"><span className={`h-3 w-3 rounded-full ${k < 3 ? "bg-accent" : "border border-neutral-300"}`} />{f}</p>
      ))}
      <div className="rounded-md bg-accent py-1.5 text-center text-[11px] font-semibold text-white">Autofilling…</div>
    </div>
  );
  return (
    <div className="w-60 space-y-2">
      <p className="w-fit rounded-xl bg-white px-3 py-1.5 text-xs shadow">Found 3 contacts for you</p>
      {["From your previous company", "Hiring manager"].map((t, k) => (
        <div key={t} className="rounded-xl bg-white p-3 shadow-md">
          <p className="flex items-center gap-2 text-[11px] font-semibold"><span className={`h-6 w-6 rounded-full ${k ? "bg-pink-300" : "bg-amber-300"}`} />{k ? "Hiring manager" : "2 former colleagues"}</p>
          <p className="mt-1 text-[9px] text-neutral-500">{t}</p>
          <div className="mt-2 rounded bg-accent-tint py-1 text-center text-[9px] font-semibold text-accent">CONNECT</div>
        </div>
      ))}
    </div>
  );
}

export default function MatchingPage() {
  const router = useRouter();
  const [p, setP] = useState(0);
  const [line, setLine] = useState(0);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION);
      setP(ease(t));
      if (t < 1) raf = requestAnimationFrame(step);
      else { demoStore.removeItem("cm-saved-filters"); router.push("/jobs?welcome=1"); } // fresh saved filter from these answers
    };
    raf = requestAnimationFrame(step);
    const a = setInterval(() => setLine((l) => Math.min(l + 1, statusSentences.length - 1)), 2500);
    const b = setInterval(() => setSlide((s) => (s + 1) % featureHighlights.length), 2800);
    return () => { cancelAnimationFrame(raf); clearInterval(a); clearInterval(b); };
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-4 pt-16">
      <FileText className="h-16 w-16 stroke-[1.25]" aria-hidden="true" />
      <div className="mt-6 h-1 w-full max-w-md rounded-full bg-neutral-100" role="progressbar" aria-valuenow={Math.round(p * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Matching progress">
        <div className="h-1 rounded-full bg-accent" style={{ width: `${p * 100}%` }} />
      </div>
      <p key={line} aria-live="polite" className="animate-pop mt-8 text-center text-lg">{statusSentences[line]}</p>

      <div className="mt-24 flex w-full max-w-2xl flex-col items-center gap-8 rounded-3xl bg-accent-tint px-6 py-10 sm:flex-row sm:justify-around">
        <div key={slide} className="animate-pop flex flex-col items-center gap-3 text-center">
          <span className="rounded-full bg-ink px-3 py-1 text-sm text-white">Feature Highlights</span>
          <p className="max-w-[240px] text-xl">{featureHighlights[slide]}</p>
        </div>
        <div key={`i${slide}`} className="animate-pop"><Illustration i={slide} /></div>
      </div>
      <div className="mt-4 flex gap-1.5" aria-hidden="true">{featureHighlights.map((_, i) => <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === slide ? "bg-ink" : "bg-neutral-300"}`} />)}</div>
    </main>
  );
}
