"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, Upload, X } from "lucide-react";
import { OnboardingShell } from "@/components/onboarding-shell";
import { savePrefs } from "@/mocks/onboarding";

const MAX = 10 * 1024 * 1024;
const OK = /\.(pdf|docx?)$/i;

export default function ResumeStepPage() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState("");
  const [err, setErr] = useState("");

  const pick = (f?: File) => {
    if (!f) return;
    if (!OK.test(f.name)) return setErr("Please choose a PDF or Word file.");
    if (f.size > MAX) return setErr("This file is over 10MB.");
    setErr(""); setFile(f.name);
  };
  const start = () => { savePrefs({ resume: file || undefined }); router.push("/onboarding/matching"); };

  return (
    <OnboardingShell
      headline={<>One last step, let&apos;s level up your search by uploading your resume.</>}
      footer={<button onClick={start} className="pill-accent w-40 py-2.5 text-base">Start Matching</button>}
    >
      <div className="flex flex-col items-center gap-8 pt-10 text-center">
        <span className="relative flex h-40 w-40 items-center justify-center rounded-full bg-neutral-100">
          <FileText className="h-16 w-16 stroke-[1.25]" aria-hidden="true" />
          <span className={`absolute bottom-11 right-11 flex h-6 w-6 items-center justify-center rounded ${file ? "bg-accent" : "bg-ink"} text-white`}>
            {file ? <Check className="h-4 w-4" strokeWidth={3} /> : <Upload className="h-3.5 w-3.5" />}
          </span>
        </span>
        <input ref={input} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        {file ? (
          <div className="relative w-full max-w-sm rounded-full border border-line py-2.5 pl-6 pr-12">
            <span className="block truncate">1-{file}</span>
            <button onClick={() => setFile("")} aria-label="Remove file" className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-accent-tint text-ink"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <button onClick={() => input.current?.click()} className="w-full max-w-sm rounded-full border border-line py-2.5 hover:bg-neutral-50">Upload Your Resume</button>
        )}
        {!file && <button onClick={() => { setErr(""); setFile("Sample resume - Aarav Mehta.pdf"); }} className="-mt-4 text-sm font-semibold text-accent underline">Use a sample resume instead</button>}
        <p className="-mt-4 text-xs text-neutral-500">Uploads stay in your browser for this demo; nothing is sent anywhere.</p>
        {err && <p role="alert" className="-mt-5 text-sm text-red-500">{err}</p>}
        <p className="text-sm">Files should be in <b>PDF</b> or <b>Word</b> format and must not exceed 10MB in size.</p>
        <p className="max-w-md rounded-lg bg-accent-tint px-4 py-3 text-sm text-neutral-500">
          Data privacy is the top priority at CareerMonke. Your resume will only be used for job matching and will never be shared with third parties. For details, please see our <b className="text-neutral-700">Privacy Policy</b>.
        </p>
      </div>
    </OnboardingShell>
  );
}
