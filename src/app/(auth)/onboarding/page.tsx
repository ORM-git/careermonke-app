"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload } from "lucide-react";
import { Logo } from "@/components/ui";

const ROLES = ["Business Analyst", "Data Analyst", "Product Manager", "Software Engineer", "Designer", "Marketing"];
const LEVELS = ["Intern / New Grad", "Entry Level", "Mid Level", "Senior Level", "Lead / Staff"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [loc, setLoc] = useState("");
  const [level, setLevel] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const canNext = [true, roles.length > 0, !!level, true][step];
  const toggle = (r: string) => setRoles((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]));

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F0F6FF] px-4 py-8">
      <Logo />
      <div className="mt-6 h-1.5 w-full max-w-xl rounded-full bg-white"><div className="h-1.5 rounded-full bg-accent transition-all duration-300" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <div key={step} className="card animate-pop mt-8 w-full max-w-xl p-8">
        {step === 0 && (
          <>
            <h1 className="text-2xl font-semibold">Upload your resume</h1>
            <p className="mt-1 text-sm text-neutral-600">We use it to match you with jobs and autofill applications.</p>
            <input ref={input} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} />
            <button onClick={() => input.current?.click()} className="mt-6 flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 bg-accent-tint p-8 text-sm">
              <Upload className="h-6 w-6 text-accent" />{file || "Click to choose a PDF or Word file"}
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-semibold">What roles and where?</h1>
            <div className="mt-6 flex flex-wrap gap-2">{ROLES.map((r) => <button key={r} onClick={() => toggle(r)} className={`chip ${roles.includes(r) ? "chip-on" : ""}`}>{r}</button>)}</div>
            <label className="mt-6 block text-sm font-medium">Preferred location<input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="e.g. Bengaluru or Remote" className="input mt-1.5 font-normal" /></label>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-semibold">Your experience level</h1>
            <div className="mt-6 space-y-2">{LEVELS.map((l) => <button key={l} onClick={() => setLevel(l)} className={`block w-full rounded-xl border px-4 py-3 text-left text-sm ${level === l ? "border-accent bg-accent-tint font-medium" : "border-line hover:bg-neutral-50"}`}>{l}</button>)}</div>
          </>
        )}
        {step === 3 && (
          <div className="py-6 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-accent" />
            <h1 className="mt-4 text-2xl font-semibold">Your matches are ready</h1>
            <p className="mt-1 text-sm text-neutral-600">We found 12 {roles[0] ?? "matching"} roles for you{loc && ` in ${loc}`}.</p>
          </div>
        )}
        <div className="mt-8 flex justify-between">
          <button onClick={() => setStep(step - 1)} disabled={step === 0} className="pill-ghost disabled:invisible">Back</button>
          <button
            onClick={() => (step === 3 ? (localStorage.setItem("cm-session", "demo"), router.push("/jobs")) : setStep(step + 1))}
            disabled={!canNext}
            className="pill-accent disabled:opacity-40"
          >
            {step === 0 && !file ? "Skip" : step === 3 ? "See my matches" : "Continue"}
          </button>
        </div>
      </div>
    </main>
  );
}
