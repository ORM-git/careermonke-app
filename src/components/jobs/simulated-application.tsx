"use client";

import { useEffect, useState } from "react";
import { CircleCheck, FileText, Sparkles } from "lucide-react";
import { CompanyLogo, Logo, Modal } from "../ui";
import { readProfile } from "@/mocks/profile";
import { resumes } from "@/mocks/misc";
import type { Job } from "@/mocks/jobs";

const FIELDS = ["Full name", "Email", "Phone", "City", "Resume"] as const;
type Field = (typeof FIELDS)[number];
const STEP_MS = 400;

function sampleValues(): Record<Field, string> {
  const p = readProfile().personal;
  return {
    "Full name": `${p.first} ${p.last}`.trim(),
    Email: p.email,
    Phone: p.phone ? `${p.phoneCode} ${p.phone}` : "+91 98765 43210 (sample)",
    City: p.city || "Bengaluru",
    Resume: resumes.find((r) => r.primary)?.name ?? "sample-resume.pdf",
  };
}

/**
 * A local, clearly simulated employer application. Fields autofill one by one from the sample profile,
 * stay editable, and "Submit" only shows a simulated confirmation. Nothing leaves the browser.
 */
export function SimulatedApplication({ job, title, onReturn }: { job?: Job; title?: string; onReturn: (r: { filled: boolean; submitted: boolean }) => void }) {
  const target = sampleValues();
  const [values, setValues] = useState<Record<Field, string>>({ "Full name": "", Email: "", Phone: "", City: "", Resume: "" });
  const [filled, setFilled] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const done = filled >= FIELDS.length;

  // Autofill sequence; the interval is cleared if the visitor leaves early.
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setFilled((n) => {
      const k = FIELDS[n];
      if (k) setValues((v) => ({ ...v, [k]: target[k] }));
      return n + 1;
    }), STEP_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const back = () => onReturn({ filled: done, submitted });
  return (
    <Modal open onClose={back} wide title="Sample employer application">
      <div className="p-6">
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 pr-10 text-sm text-amber-800">Simulated employer form for this demo. Nothing is sent to any employer.</p>
        <div className="flex items-center gap-3">
          {job ? <CompanyLogo initials={job.initials} color={job.color} size={44} /> : <Logo withText={false} />}
          <div><p className="text-sm text-neutral-500">{job ? `${job.company} careers (sample)` : "Sample careers site"}</p><h2 className="text-xl font-semibold">{title ?? job?.title ?? "Product Manager, Analytics"}</h2></div>
        </div>
        {submitted ? (
          <div className="mt-8 flex flex-col items-center gap-3 py-6 text-center" role="status">
            <CircleCheck className="h-12 w-12 fill-green-500 text-white" />
            <p className="text-lg font-semibold">Simulated submission complete</p>
            <p className="text-sm text-neutral-600">This was a demo. No application was sent to {job?.company ?? "any employer"}.</p>
            <button onClick={back} className="pill-accent mt-2">Return to CareerMonke</button>
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-accent-tint px-3 py-2 text-sm" role="status" aria-live="polite">
              <Sparkles className="h-4 w-4 text-accent" />{done ? "Autofill complete. Check and edit anything below." : `CareerMonke Autofill is filling ${FIELDS[filled] ?? ""}...`}
              <span className="ml-auto h-1.5 w-28 rounded-full bg-white"><span className="block h-1.5 rounded-full bg-accent transition-all" style={{ width: `${(Math.min(filled, FIELDS.length) / FIELDS.length) * 100}%` }} /></span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {FIELDS.map((k) => (
                <label key={k} className={`block text-sm font-medium ${k === "Resume" ? "sm:col-span-2" : ""}`}>{k}
                  <span className="relative mt-1 block">
                    {k === "Resume" && <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />}
                    <input value={values[k]} onChange={(e) => setValues({ ...values, [k]: e.target.value })} readOnly={k === "Resume"}
                      className={`input font-normal ${k === "Resume" ? "pl-9" : ""} ${values[k] ? "border-blue-200 bg-accent-tint/50" : ""}`} />
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button onClick={back} className="pill-ghost">Back to CareerMonke</button>
              <button onClick={() => setSubmitted(true)} disabled={!done} className="pill-accent disabled:opacity-40">Submit (simulated)</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
