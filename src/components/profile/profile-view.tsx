"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, CircleHelp, FileText, Linkedin, Mail, MapPin, Pencil, ShieldCheck } from "lucide-react";
import { PageHeader } from "../shell";
import { Drawer, Modal } from "../ui";
import { toast } from "../toast";
import { SectionForm, sectionValid } from "./forms";
import { EEO_COUNTRIES, readProfile, saveProfile, sectionDone, SECTIONS, type Profile, type Section } from "@/mocks/profile";

const anchor = (s: Section) => `pf-${s.replace(/\W+/g, "-").toLowerCase()}`;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const ym = (s: string) => s || "—";

function Timeline({ items }: { items: { when: string; title: string; sub: string; bullets?: string[] }[] }) {
  if (!items.length) return <p className="text-sm text-neutral-500">Nothing added yet.</p>;
  return (
    <ol className="space-y-5">
      {items.map((x, i) => (
        <li key={i} className="relative border-l-2 border-blue-200 pb-1 pl-6">
          <span className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full border-2 border-ink bg-white" />
          <p className="text-sm text-neutral-500">{x.when}</p>
          <p className="mt-1 font-semibold">{x.title}</p>
          <p className="text-sm text-neutral-700">{x.sub}</p>
          {x.bullets?.filter(Boolean).length ? <ul className="mt-1 list-disc pl-5 text-sm text-neutral-700">{x.bullets.filter(Boolean).map((b) => <li key={b}>{b}</li>)}</ul> : null}
        </li>
      ))}
    </ol>
  );
}

export function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [edit, setEdit] = useState<Section | null>(null);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [tried, setTried] = useState(false);
  const [intro, setIntro] = useState(false);
  const [wizard, setWizard] = useState<number | null>(null);
  const [tab, setTab] = useState<Section>("Personal");

  useEffect(() => {
    setProfile(readProfile());
    if (!localStorage.getItem("cm-profile-intro")) { setIntro(true); localStorage.setItem("cm-profile-intro", "1"); }
  }, []);
  if (!profile) return null;

  const done = sectionDone(profile);
  const doneCount = Object.values(done).filter(Boolean).length;
  const open = (s: Section) => { setDraft(structuredClone(profile)); setTried(false); setEdit(s); };
  const close = () => { setEdit(null); setWizard(null); setDraft(null); };
  const commit = (next: Profile, msg: string) => { saveProfile(next); setProfile(next); close(); toast(msg); };
  const update = () => {
    if (!draft || !edit) return;
    setTried(true);
    if (!sectionValid(edit, draft)) return;
    commit(draft, `${edit} updated`);
  };
  const startWizard = () => { setIntro(false); setDraft(structuredClone(profile)); setTried(false); setWizard(0); };
  const wizSection = wizard === null ? null : SECTIONS[wizard];
  const wizNext = () => {
    if (!draft || wizSection === null || wizard === null) return;
    setTried(true);
    if (!sectionValid(wizSection, draft)) return;
    setTried(false);
    if (wizard === SECTIONS.length - 1) commit(draft, "Profile saved");
    else setWizard(wizard + 1);
  };
  const go = (s: Section) => { setTab(s); document.getElementById(anchor(s))?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const p = profile.personal;
  const eeoAnswered = Object.values(profile.eeo.answers).filter((a) => (Array.isArray(a) ? a.length : a)).length;
  const head = (s: Section) => (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-2xl font-semibold">{s === "Personal" ? `${p.first} ${p.last}`.trim() || "Your name" : s}</h2>
      <button onClick={() => open(s)} aria-label={`Edit ${s}`} className="rounded-lg p-1.5 hover:bg-neutral-100"><Pencil className="h-5 w-5" /></button>
    </div>
  );

  return (
    <>
      <PageHeader title="PROFILE" />
      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[1fr_300px]">
        <main className="min-w-0 space-y-4">
          <p className="flex items-center gap-2 text-[15px]"><ShieldCheck className="h-5 w-5 text-accent" />Your profile data is kept private and secure. <span title="Only you can see this profile. It is used for matching and autofill."><CircleHelp className="h-4 w-4" /></span></p>
          <div className="card">
            <nav aria-label="Profile sections" className="sticky top-16 z-10 flex gap-6 overflow-x-auto rounded-t-2xl border-b border-line bg-white px-6 pt-4">
              {SECTIONS.map((s) => <button key={s} onClick={() => go(s)} aria-current={tab === s || undefined} className={`shrink-0 border-b-2 pb-3 text-[15px] ${tab === s ? "border-ink font-semibold" : "border-transparent text-neutral-400 hover:text-ink"}`}>{s}</button>)}
            </nav>
            <div className="divide-y divide-line px-6">
              <section id={anchor("Personal")} className="scroll-mt-32 py-8">
                {head("Personal")}
                <div className="flex flex-wrap gap-2 text-xs">
                  {(p.city || p.state) && <span className="chip"><MapPin className="h-3.5 w-3.5" />{[p.city, p.state].filter(Boolean).join(", ")}</span>}
                  {p.email && <span className="chip"><Mail className="h-3.5 w-3.5" />{p.email}</span>}
                  {p.linkedin && <span className="chip"><Linkedin className="h-3.5 w-3.5" />{p.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>}
                </div>
                {!done.Personal && <p className="mt-3 text-sm text-red-500">Missing required details: add your phone, address and postal code.</p>}
              </section>
              <section id={anchor("Education")} className="scroll-mt-32 py-8">
                {head("Education")}
                <Timeline items={profile.education.map((e) => ({ when: `${ym(e.start)} → ${e.current ? "Present" : ym(e.end)}`, title: e.school, sub: [e.degree, e.major].filter(Boolean).join(" in ") }))} />
              </section>
              <section id={anchor("Work Experience")} className="scroll-mt-32 py-8">
                {head("Work Experience")}
                <Timeline items={profile.work.map((w) => ({ when: `${ym(w.start)} → ${w.current ? "Present" : ym(w.end)}`, title: w.company, sub: w.title, bullets: w.bullets }))} />
              </section>
              <section id={anchor("Skills")} className="scroll-mt-32 py-8">
                {head("Skills")}
                <div className="flex flex-wrap gap-2">{profile.skills.length ? profile.skills.map((s) => <span key={s} className="chip">{s}</span>) : <p className="text-sm text-neutral-500">No skills yet.</p>}</div>
              </section>
              <section id={anchor("Equal Employment")} className="scroll-mt-32 py-8">
                {head("Equal Employment")}
                <p className="text-sm text-neutral-600">
                  {profile.eeo.country ? `${profile.eeo.country} · ${eeoAnswered} of ${EEO_COUNTRIES[profile.eeo.country].length} optional questions answered` : "Not provided. These questions are optional."}
                </p>
              </section>
            </div>
          </div>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {doneCount < SECTIONS.length ? (
            <div className="rounded-2xl bg-red-50 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 font-bold text-white">!</span>
              <p className="mt-3 text-sm font-medium">Complete your profile to boost job matching accuracy and let autofill fill in your applications.</p>
              <p className="mt-2 text-xs text-neutral-600">{doneCount} of {SECTIONS.length} sections complete</p>
              <button onClick={startWizard} className="pill-dark mt-4 w-full rounded-lg">Complete Profile</button>
            </div>
          ) : <div className="rounded-2xl bg-green-50 p-5 text-sm font-medium text-green-800">Your profile is complete.</div>}
          <div className="card divide-y divide-line">
            <Link href="/resume" className="flex items-center gap-2 p-4 text-sm font-medium hover:bg-neutral-50"><FileText className="h-4 w-4" /><span className="flex-1">Manage My Resume</span><ChevronRight className="h-4 w-4" /></Link>
            <div className="p-4">
              <button onClick={() => open("Personal")} className="flex w-full items-center gap-2 text-sm font-medium"><Linkedin className="h-4 w-4" /><span className="flex-1 text-left">Update LinkedIn URL</span><ChevronRight className="h-4 w-4" /></button>
              <p className="mt-2 text-xs text-neutral-500">We use your LinkedIn URL to suggest people who could refer you. Changed it recently? Update it in your personal details.</p>
            </div>
          </div>
        </aside>
      </div>

      {edit && draft && (
        <Drawer open label={edit} onClose={close} dirty={!same(draft, profile)} action={<button onClick={update} className="pill-accent">UPDATE</button>}
          header={edit === "Personal" ? <p className="bg-neutral-50 px-4 py-2 text-center text-xs text-neutral-600">Updates to your profile are also used for autofill on future applications.</p> : undefined}>
          <div className="p-6"><SectionForm section={edit} draft={draft} setDraft={setDraft} show={tried} /></div>
        </Drawer>
      )}

      {wizSection && draft && wizard !== null && (
        <Drawer open label="Complete your profile" title={`Complete your profile · ${wizSection}`} onClose={close} dirty={!same(draft, profile)}
          header={(
            <ol className="flex gap-1 overflow-x-auto border-b border-line px-4 py-2 text-xs" aria-label="Steps">
              {SECTIONS.map((s, i) => <li key={s} aria-current={i === wizard ? "step" : undefined} className={`shrink-0 rounded-full px-2.5 py-1 ${i === wizard ? "bg-accent text-white" : i < wizard ? "bg-accent-tint text-accent" : "bg-neutral-100 text-neutral-500"}`}>{i + 1}. {s === "Skills" ? "Skill" : s}</li>)}
            </ol>
          )}>
          <div className="p-6">
            <SectionForm section={wizSection} draft={draft} setDraft={setDraft} show={tried} />
            <div className="mt-8 flex justify-between">
              <button onClick={() => { setTried(false); setWizard(wizard - 1); }} disabled={wizard === 0} className="pill-ghost disabled:invisible">Back</button>
              <button onClick={wizNext} className="pill-accent">{wizard === SECTIONS.length - 1 ? "Save" : "Next"}</button>
            </div>
          </div>
        </Drawer>
      )}

      <Modal open={intro} onClose={() => setIntro(false)} title="Complete your profile">
        <div className="p-8 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 px-6 py-8">
            <h2 className="text-2xl font-bold">Complete Your Profile for Perfect Matches &amp; AutoFill</h2>
            <p className="mt-2 text-sm text-neutral-600">Confirm a few details for better matches and one-click autofill.</p>
          </div>
          <div className="mt-6 flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-accent" style={{ width: `${(doneCount / SECTIONS.length) * 100}%` }} /></div><b>{doneCount}/{SECTIONS.length}</b></div>
          <ul className="mt-4 space-y-2 text-left text-sm">
            {SECTIONS.map((s) => <li key={s} className="flex items-center gap-2"><span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${done[s] ? "bg-accent text-white" : "border border-line"}`}>{done[s] && "✓"}</span>{s}</li>)}
          </ul>
          <button onClick={startWizard} className="pill-accent mt-6 w-full max-w-xs">Start Now</button>
        </div>
      </Modal>
    </>
  );
}
