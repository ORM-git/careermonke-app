"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCard, OnboardingShell, Req } from "@/components/onboarding-shell";
import { countries, jobFunctions, jobTypes, readPrefs, savePrefs } from "@/mocks/onboarding";
import { startSession } from "@/lib/demo";

export default function RolePage() {
  const router = useRouter();
  const [fn, setFn] = useState("");
  const [types, setTypes] = useState(["Full-time"]);
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(true);
  const [h1b, setH1b] = useState(false);
  const [tried, setTried] = useState(false);
  // Reaching onboarding starts this visit's demo session; earlier answers in the same visit are kept.
  useEffect(() => { startSession(); const p = readPrefs(); if (p) { setFn(p.jobFunction ?? ""); setTypes(p.jobTypes ?? ["Full-time"]); setLocation(p.location ?? ""); setRemote(p.openToRemote ?? true); setH1b(!!p.h1b); } }, []);
  const preset = () => { setFn("Software Engineer"); setLocation("India"); };
  const errors = { fn: !fn.trim(), types: types.length === 0, location: !countries.includes(location) };
  const toggle = (t: string, on: boolean) => setTypes((ts) => (on ? [...ts, t] : ts.filter((x) => x !== t)));

  const next = () => {
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    savePrefs({ jobFunction: fn.trim(), jobTypes: types, location, openToRemote: remote, h1b });
    router.push("/onboarding/resume");
  };
  const Err = ({ show, children }: { show: boolean; children: string }) => (tried && show ? <p role="alert" className="mt-1.5 text-xs text-red-500">{children}</p> : null);

  return (
    <OnboardingShell
      headline={<>To get started, <b>what type of role</b> are you looking for?</>}
      footer={<button onClick={next} className="pill-dark w-40 py-2.5 text-base">Next</button>}
    >
      <div className="space-y-8 pt-8">
        <p className="flex flex-wrap items-center gap-2 rounded-lg bg-accent-tint px-3 py-2 text-sm">Just exploring? <button type="button" onClick={preset} className="font-semibold text-accent underline">Use the sample answers</button> (Software Engineer in India).</p>
        <div>
          <Req><label htmlFor="fn">Job Function</label></Req>
          <input id="fn" list="fn-list" value={fn} onChange={(e) => setFn(e.target.value)} placeholder="Please select/enter your expected job function" className="input border-transparent" />
          <datalist id="fn-list">{jobFunctions.map((f) => <option key={f} value={f} />)}</datalist>
          <Err show={errors.fn}>Enter the job function you want.</Err>
        </div>
        <div>
          <Req>Job Type</Req>
          <div className="grid grid-cols-2 gap-1">{jobTypes.map((t) => <CheckCard key={t} label={t} checked={types.includes(t)} onChange={(v) => toggle(t, v)} />)}</div>
          <Err show={errors.types}>Pick at least one job type.</Err>
        </div>
        <div>
          <Req><label htmlFor="loc">Location</label></Req>
          <div className="grid grid-cols-2 gap-1">
            <input id="loc" list="loc-list" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Select location" className="input border-transparent" />
            <datalist id="loc-list">{countries.map((c) => <option key={c} value={c} />)}</datalist>
            <CheckCard label="Open to Remote" checked={remote} onChange={setRemote} hint="Also show remote roles you can do from your location." />
          </div>
          <Err show={errors.location}>Choose a location from the list.</Err>
        </div>
        <div>
          <Req hint="Show roles at companies likely to sponsor a work visa.">Work Authorization</Req>
          <div className="grid grid-cols-2 gap-1"><CheckCard label="H1B sponsorship" checked={h1b} onChange={setH1b} /></div>
        </div>
      </div>
    </OnboardingShell>
  );
}
