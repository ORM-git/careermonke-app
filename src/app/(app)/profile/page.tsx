"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleHelp, Linkedin, MapPin, Plus, ShieldCheck, X } from "lucide-react";
import { PageHeader } from "@/components/shell";
import { Modal } from "@/components/ui";
import { user } from "@/mocks/user";

const TABS = ["Personal", "Education", "Work Experience", "Skills", "Equal Employment"] as const;
type Tab = (typeof TABS)[number];

function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-sm font-medium">{label}<input {...p} className="input mt-1.5 font-normal" /></label>;
}

function Repeat({ kind, fields }: { kind: string; fields: string[] }) {
  const [rows, setRows] = useState(1);
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="relative grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-2">
          {rows > 1 && <button aria-label={`Remove ${kind}`} onClick={() => setRows(rows - 1)} className="absolute right-2 top-2 rounded-full p-1 hover:bg-neutral-100"><X className="h-4 w-4" /></button>}
          {fields.map((f) => <Field key={f} label={f} defaultValue={i === 0 ? sample[f] : ""} />)}
        </div>
      ))}
      <button onClick={() => setRows(rows + 1)} className="pill-ghost"><Plus className="h-4 w-4" />Add {kind}</button>
    </div>
  );
}

const sample: Record<string, string> = {
  School: "Silicon University", Degree: "B.Tech, Computer Science", Start: "2022-08", End: "2026-05",
  Title: "Analyst Intern", Company: "Ledgerline", From: "2025-07", To: "Present",
};

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("Personal");
  const [skills, setSkills] = useState(["SQL", "Excel", "Power BI", "Stakeholder management"]);
  const [skill, setSkill] = useState("");
  const [intro, setIntro] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!localStorage.getItem("cm-profile-intro")) { setIntro(true); localStorage.setItem("cm-profile-intro", "1"); } }, []);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 1500); };
  const done = [true, true, true, skills.length > 0, false];

  return (
    <>
      <PageHeader title="PROFILE" />
      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[1fr_340px]">
        <main className="min-w-0 space-y-4">
          <p className="flex items-center gap-2 text-[15px]"><ShieldCheck className="h-5 w-5 text-accent" />Your profile data is kept private and secure. <CircleHelp className="h-4 w-4" /></p>
          <div className="card p-6">
            <div className="flex gap-6 overflow-x-auto border-b border-line">
              {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`shrink-0 border-b-2 pb-3 text-[15px] ${tab === t ? "border-ink font-semibold" : "border-transparent text-neutral-400"}`}>{t}</button>)}
            </div>
            <div className="pt-6">
              {tab === "Personal" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">{user.name.toUpperCase()}</h2>
                  <div className="flex flex-wrap gap-2 text-xs"><span className="chip"><MapPin className="h-3.5 w-3.5" />{user.location}</span><span className="chip"><Linkedin className="h-3.5 w-3.5" />linkedin.com/in/aarav-demo</span></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" defaultValue={user.name} /><Field label="Email" type="email" defaultValue={user.email} />
                    <Field label="Phone" type="tel" placeholder="+91" /><Field label="Location" defaultValue={user.location} />
                    <Field label="LinkedIn" defaultValue="https://linkedin.com/in/aarav-demo" /><Field label="Portfolio / GitHub" placeholder="https://" />
                  </div>
                </div>
              )}
              {tab === "Education" && <Repeat kind="education" fields={["School", "Degree", "Start", "End"]} />}
              {tab === "Work Experience" && <Repeat kind="experience" fields={["Title", "Company", "From", "To"]} />}
              {tab === "Skills" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">{skills.map((s) => <span key={s} className="chip chip-on">{s}<button aria-label={`Remove ${s}`} onClick={() => setSkills(skills.filter((x) => x !== s))}><X className="h-3.5 w-3.5" /></button></span>)}</div>
                  <form onSubmit={(e) => { e.preventDefault(); const v = skill.trim(); if (v && !skills.includes(v)) setSkills([...skills, v]); setSkill(""); }}>
                    <label className="sr-only" htmlFor="skill">Add a skill</label>
                    <input id="skill" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="Type a skill and press Enter" className="input max-w-sm" />
                  </form>
                </div>
              )}
              {tab === "Equal Employment" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[["Gender", ["Female", "Male", "Non-binary"]], ["Disability", ["Yes", "No"]], ["Veteran status", ["Yes", "No"]], ["Ethnicity", ["Asian", "Black", "Hispanic", "White", "Other"]]].map(([l, opts]) => (
                    <label key={l as string} className="block text-sm font-medium">{l as string}
                      <select className="input mt-1.5 font-normal" defaultValue="Prefer not to say">{["Prefer not to say", ...(opts as string[])].map((o) => <option key={o}>{o}</option>)}</select>
                    </label>
                  ))}
                </div>
              )}
              <button onClick={save} className="pill-accent mt-6">{saved ? "Saved" : "Save"}</button>
            </div>
          </div>
        </main>
        <aside className="space-y-4">
          <div className="rounded-2xl bg-red-50 p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 font-bold text-white">!</span>
            <p className="mt-3 text-sm font-medium">Complete your profile to boost job matching accuracy and enable autofill on your applications.</p>
            <button onClick={() => setIntro(true)} className="pill-dark mt-4 w-full rounded-lg">Complete Profile</button>
          </div>
          <Link href="/resume" className="card block p-4 text-sm font-medium hover:bg-neutral-50">Manage My Resume →</Link>
        </aside>
      </div>

      <Modal open={intro} onClose={() => setIntro(false)} title="Complete your profile">
        <div className="p-8 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 px-6 py-8">
            <h2 className="text-2xl font-bold">Complete Your Profile for Perfect Matches &amp; AutoFill</h2>
            <p className="mt-2 text-sm text-neutral-600">You&apos;re nearly done. Confirm a few details for better matches and one-click autofill.</p>
          </div>
          <div className="mt-6 flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-accent" style={{ width: `${(done.filter(Boolean).length / 5) * 100}%` }} /></div><b>{done.filter(Boolean).length}/5</b></div>
          <ul className="mt-4 space-y-2 text-left text-sm">
            {TABS.map((t, i) => <li key={t} className="flex items-center gap-2"><span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${done[i] ? "bg-accent text-white" : "border border-line"}`}>{done[i] && "✓"}</span>{t}</li>)}
          </ul>
          <button onClick={() => { setIntro(false); setTab(TABS[done.indexOf(false)] ?? "Personal"); }} className="pill-accent mt-6 w-full max-w-xs">Complete Now</button>
        </div>
      </Modal>
    </>
  );
}
