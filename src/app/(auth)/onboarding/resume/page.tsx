"use client";

import { useEffect, useRef, useState } from "react";
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
  // On short phones the error renders below the fixed action bar; bring it into view (measured at 320x568).
  useEffect(() => { if (err) document.getElementById("resume-err")?.scrollIntoView({ block: "center" }); }, [err]);

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
      step={{ current: 2, total: 2 }}
      onBack={() => router.push("/onboarding/role")}
      footer={<button onClick={start} className="pill-accent w-40 py-2.5 text-base">Start Matching</button>}
    >
      <div className="flex flex-col items-center gap-6 pt-2 text-center md:gap-8 md:pt-10">
        <span className="relative flex h-28 w-28 items-center justify-center rounded-full bg-neutral-100 md:h-40 md:w-40">
          <FileText className="h-12 w-12 stroke-[1.25] md:h-16 md:w-16" aria-hidden="true" />
          <span className={`absolute bottom-7 right-7 flex h-6 w-6 items-center justify-center rounded md:bottom-11 md:right-11 ${file ? "bg-accent" : "bg-ink"} text-white`}>
            {file ? <Check className="h-4 w-4" strokeWidth={3} /> : <Upload className="h-3.5 w-3.5" />}
          </span>
        </span>
        <input ref={input} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        {file ? (
          <div className="relative w-full max-w-sm rounded-full border border-line py-2.5 pl-6 pr-12">
            <span className="block truncate">1-{file}</span>
            <button onClick={() => setFile("")} aria-label="Remove file" className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full md:right-2 md:h-7 md:w-7"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-tint text-ink"><X className="h-4 w-4" /></span></button>
          </div>
        ) : (
          <button onClick={() => input.current?.click()} aria-describedby={err ? "resume-err" : undefined} className={`w-full max-w-sm rounded-full border py-3 hover:bg-neutral-50 md:py-2.5 ${err ? "border-red-300 md:border-line" : "border-line"}`}>Upload Your Resume</button>
        )}
        {!file && <button onClick={() => { setErr(""); setFile("Sample resume - Aarav Mehta.pdf"); }} className="-mt-3 min-h-11 text-sm font-semibold text-accent underline md:-mt-4 md:min-h-0">Use a sample resume instead</button>}
        <p className="-mt-3 text-xs text-neutral-500 md:-mt-4">Uploads stay in your browser for this demo; nothing is sent anywhere.</p>
        {err && <p id="resume-err" role="alert" className="-mt-3 text-sm text-red-500 md:-mt-5">{err}</p>}
        <p className="text-sm">Files should be in <b>PDF</b> or <b>Word</b> format and must not exceed 10MB in size.</p>
        <p className="max-w-md rounded-lg bg-accent-tint px-4 py-3 text-sm text-neutral-500">
          Data privacy is the top priority at CareerMonke. Your resume will only be used for job matching and will never be shared with third parties. For details, please see our <b className="text-neutral-700">Privacy Policy</b>.
        </p>
      </div>
    </OnboardingShell>
  );
}
