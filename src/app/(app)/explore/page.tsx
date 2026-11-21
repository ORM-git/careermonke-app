"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUp, ChevronDown, Mic, Search, Sparkles, Zap } from "lucide-react";
import { PageHeader } from "@/components/shell";
import { CompanyLogo } from "@/components/ui";
import { jobs } from "@/mocks/jobs";
import { exploreSearch } from "@/mocks/explore";
import { useGuideAction } from "@/components/guide";
import { user } from "@/mocks/user";

const SUGGESTIONS = ["Data analyst roles posted in the last 24 hours", "Remote product jobs in fintech", "Entry-level analyst roles above ₹12L"];
type Msg = { role: "user" | "bot"; text: string; jobs?: typeof jobs };

export default function ExplorePage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [left, setLeft] = useState(user.exploreMessages);

  // The free-message counter is informational in this demo; searches keep working after it reaches 0.
  const send = (t: string) => {
    if (!t.trim() || thinking) return;
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setText(""); setThinking(true); setLeft((n) => Math.max(0, n - 1));
    setTimeout(() => {
      const r = exploreSearch(t);
      const about = r.understood.length ? ` for ${r.understood.join(", ")}` : "";
      setMsgs((m) => [...m, r.jobs.length
        ? { role: "bot", text: `Found ${r.jobs.length} sample ${r.jobs.length === 1 ? "role" : "roles"}${about}, ranked by match:`, jobs: r.jobs }
        : { role: "bot", text: `No sample roles match${about} exactly. Try fewer conditions.` }]);
      setThinking(false);
    }, 1000);
  };
  useGuideAction("explore-example", () => send(SUGGESTIONS[0]));

  const box = (
    <div className="w-full overflow-hidden rounded-2xl border-2 border-blue-200 bg-accent-tint">
      <div className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold">
        <span className="flex items-center gap-2"><Zap className="h-4 w-4 fill-accent text-accent" />Try AI Search for free · {left} free messages left today <span className="font-normal text-neutral-500">(unlimited in this demo)</span></span>
        <Link href="/pricing" className="rounded-lg bg-ink px-2.5 py-1 text-xs text-white">Upgrade →</Link>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="rounded-2xl bg-white p-4">
        <label htmlFor="ask" className="sr-only">Describe the job you want</label>
        <textarea id="ask" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
          rows={msgs.length ? 1 : 3} placeholder="Search by role, industry, skills, location, or requirements"
          className="w-full resize-none text-[15px] outline-none" />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {["India", "Onsite (+2)", "Entry Level (+2)"].map((c) => <span key={c} className="chip bg-accent-tint/60">{c}<ChevronDown className="h-3.5 w-3.5" /></span>)}
          <span className="chip">··· All Filters</span>
          <button type="button" aria-label="Voice input" className="ml-auto rounded-full bg-neutral-100 p-2"><Mic className="h-4 w-4" /></button>
          <button aria-label="Send" disabled={!text.trim()} className="rounded-full bg-accent p-2 text-white disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHeader title="EXPLORE" right={<button className="pill-ghost py-1.5 text-[13px]">History <ChevronDown className="h-4 w-4" /></button>} />
      {msgs.length === 0 ? (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 pb-24">
          <Sparkles className="h-12 w-12 text-accent" aria-hidden="true" />
          <h2 className="text-center text-3xl font-medium">Tell me about the job you want, {user.name.split(" ")[0]}.</h2>
          {box}
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="chip text-neutral-500"><Search className="h-3.5 w-3.5" />{s}</button>)}
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
          <div className="flex-1 space-y-4 py-6">
            {msgs.map((m, i) => m.role === "user" ? (
              <p key={i} className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-white">{m.text}</p>
            ) : (
              <div key={i} className="card animate-pop max-w-[90%] space-y-3 p-4">
                <p className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4 text-accent" />{m.text}</p>
                {m.jobs?.map((j) => (
                  <Link key={j.id} href={`/jobs/${j.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-neutral-300">
                    <CompanyLogo initials={j.initials} color={j.color} size={40} />
                    <span className="min-w-0 flex-1"><b className="block truncate font-semibold">{j.title}</b><span className="text-xs text-neutral-500">{j.company} · {j.location} · {j.mode}</span></span>
                    <span className="rounded-full bg-accent-tint px-2 py-1 text-xs font-semibold text-accent">{j.match}%</span>
                  </Link>
                ))}
              </div>
            ))}
            {thinking && <p className="card w-fit px-4 py-3 text-xl text-neutral-400"><span className="dot">•</span><span className="dot [animation-delay:.2s]">•</span><span className="dot [animation-delay:.4s]">•</span></p>}
          </div>
          <div className="sticky bottom-16 pb-4 md:bottom-0">{box}</div>
        </div>
      )}
    </div>
  );
}
