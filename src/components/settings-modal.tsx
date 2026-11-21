"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CreditCard, FileText, LogOut, MessagesSquare, Pencil, User } from "lucide-react";
import { Modal, UpgradePill } from "./ui";
import { useApp } from "./app-state";
import { user } from "@/mocks/user";
import { demoStore } from "@/lib/demo";

const sections = [
  { key: "Login & Security", icon: User },
  { key: "Subscriptions", icon: CreditCard },
  { key: "Interview Passes", icon: MessagesSquare },
  { key: "Job Alerts Preference", icon: Bell },
] as const;
type Key = (typeof sections)[number]["key"];

function Row({ label, sub, action }: { label: string; sub?: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div><p className="text-sm font-semibold">{label}</p>{sub && <p className="text-sm text-neutral-500">{sub}</p>}</div>
      {action}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-accent" : "bg-neutral-300"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<Key>("Login & Security");
  const [instant, setInstant] = useState(true);
  const [digest, setDigest] = useState(true);
  const [freq, setFreq] = useState<"Daily" | "Weekly">("Daily");
  const [saved, setSaved] = useState(false);
  const close = () => setSettingsOpen(false);
  const logout = () => { demoStore.removeItem("cm-session"); close(); router.push("/signin"); };
  const navBtn = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-left transition-colors";

  return (
    <Modal open={settingsOpen} onClose={close} wide title="Settings">
      <div className="flex min-h-[560px] flex-col sm:flex-row">
        <nav className="flex shrink-0 flex-col gap-1 border-b border-line p-4 sm:w-60 sm:border-b-0 sm:border-r">
          {sections.map(({ key, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={`${navBtn} ${tab === key ? "bg-neutral-100 font-medium" : "hover:bg-neutral-50"}`}><Icon className="h-4 w-4" />{key}</button>
          ))}
          <div className="mt-auto pt-6">
            <Link href="/privacy-policy" onClick={close} className={`${navBtn} hover:bg-neutral-50`}><FileText className="h-4 w-4" />Privacy Policy</Link>
            <button onClick={logout} className={`${navBtn} hover:bg-neutral-50`}><LogOut className="h-4 w-4" />Log Out</button>
          </div>
        </nav>

        <section className="flex-1 bg-neutral-50/60 p-6 sm:p-8">
          <h2 className="border-b border-line pb-4 text-xl font-semibold">{tab}</h2>

          {tab === "Login & Security" && (
            <div className="divide-y divide-line">
              <Row label="Email" sub={user.email} action={null} />
              <Row label="Password" action={<button className="pill-ghost">Change password</button>} />
              <Row label="Connected accounts" sub="Google · connected" action={<span className="text-xs font-semibold text-green-600">Verified</span>} />
              <Row label="Delete my account" sub="Permanently delete your CareerMonke account and all its data" action={<button className="pill-ghost text-red-500">Delete my account</button>} />
            </div>
          )}

          {tab === "Subscriptions" && (
            <div className="mt-5 space-y-4">
              <p className="text-sm font-semibold">Current Plan</p>
              <div className="card p-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <p className="font-serif font-bold tracking-wide text-accent">CAREERMONKE FREE</p>
                  <Link href="/terms-and-conditions" onClick={close} className="text-sm underline">Terms and Conditions</Link>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-neutral-600">
                  <li>✓ AI job matching</li><li>✓ 2 email credits a day</li><li>✓ 1 job alert a day</li>
                </ul>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm">Unlock everything with CareerMonke Pro</p>
                  <Link href="/pricing" onClick={close} className="pill-accent">Upgrade Now</Link>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-line p-5 text-center">
                <p className="text-sm font-semibold">Not seeing your updated subscription?</p>
                <p className="mt-1 text-sm text-neutral-600">If you paid but don&apos;t see the new plan, refresh it or contact support.</p>
                <div className="mt-3 flex justify-center gap-2"><button className="pill-ghost">Refresh Status</button><a href="mailto:support@careermonke.com" className="pill-ghost">Contact Support</a></div>
              </div>
            </div>
          )}

          {tab === "Interview Passes" && (
            <div className="mt-5 card flex items-center justify-between p-5">
              <div><p className="font-semibold">0 interview passes</p><p className="text-sm text-neutral-500">Passes unlock full question sets for one company.</p></div>
              <UpgradePill>Get passes</UpgradePill>
            </div>
          )}

          {tab === "Job Alerts Preference" && (
            <div className="mt-5 space-y-6">
              <div className="flex flex-wrap gap-2">
                {["Business Analyst", "Full-time", "Onsite", "Remote", "Hybrid", "Entry Level", "Mid Level"].map((c) => <span key={c} className="chip chip-on">{c}</span>)}
                <button className="chip"><Pencil className="h-3.5 w-3.5" />Filters</button>
              </div>
              <div>
                <h3 className="border-b border-line pb-3 text-lg font-semibold">Instant Job Alerts</h3>
                <Row label="Enable Instant Job Alerts" sub="Get fresh, matching jobs within an hour of posting." action={<Toggle on={instant} onChange={setInstant} label="Instant job alerts" />} />
                <p className="text-sm text-neutral-500">Up to 1 alert/day on Free · Unlimited on Pro</p>
              </div>
              <div>
                <h3 className="border-b border-line pb-3 text-lg font-semibold">Digest Job Alerts</h3>
                <Row label="Enable Digest Job Alerts" sub="A curated list of matching jobs in one email." action={<Toggle on={digest} onChange={setDigest} label="Digest job alerts" />} />
                <div className="flex gap-4 text-sm">
                  {(["Daily", "Weekly"] as const).map((f) => (
                    <label key={f} className="flex items-center gap-2"><input type="radio" name="digest" checked={freq === f} onChange={() => setFreq(f)} disabled={!digest} className="accent-[#2563EB]" />{f}</label>
                  ))}
                </div>
              </div>
              <button className="pill-accent" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1500); }}>{saved ? "Saved" : "Save"}</button>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
