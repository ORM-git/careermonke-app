"use client";

import { useState } from "react";
import { CircleHelp, MoreHorizontal, Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/shell";
import { EmptyState } from "@/components/ui";
import { UploadModal } from "@/components/resume-upload";
import { resumes as seed, type Resume } from "@/mocks/misc";

const SLOTS = 5;
export default function ResumePage() {
  const [list, setList] = useState<Resume[]>(seed);
  const [menu, setMenu] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const full = list.length >= SLOTS;

  const add = (f: File) => {
    const id = crypto.randomUUID();
    setList((l) => [...l, { id, name: f.name.replace(/\.(pdf|docx?)$/i, ""), target: "—", modified: "just now", created: "just now", primary: l.length === 0 }]);
    setUploading(false);
    setAnalyzing((a) => [...a, id]);
    setTimeout(() => setAnalyzing((a) => a.filter((x) => x !== id)), 2500);
  };
  // These row actions predate the study, which could not open this menu; kept as the app's existing behaviour.
  const act = (id: string, action: string) => {
    setMenu(null);
    if (action === "Set Primary") setList((l) => l.map((r) => ({ ...r, primary: r.id === id })));
    if (action === "Rename") { const n = prompt("New name"); if (n) setList((l) => l.map((r) => (r.id === id ? { ...r, name: n } : r))); }
    if (action === "Delete" && confirm("Delete this resume?")) setList((l) => { const rest = l.filter((r) => r.id !== id); if (rest.length && !rest.some((r) => r.primary)) rest[0] = { ...rest[0], primary: true }; return rest; });
  };

  return (
    <>
      <PageHeader title="RESUME" />
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[15px]">You have {list.length} resume{list.length === 1 ? "" : "s"} saved out of {SLOTS} available slots. <span title="Delete a resume to free a slot."><CircleHelp className="h-4 w-4" /></span></p>
          <button onClick={() => setUploading(true)} disabled={full} title={full ? "All 5 slots are used. Delete one first." : undefined} className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold shadow-sm disabled:opacity-50">
            <Plus className="h-5 w-5 rounded bg-accent p-0.5 text-white" />Add Resume
          </button>
        </div>
        {list.length === 0 ? <div className="pt-16 text-center"><EmptyState text="Upload your first resume to get matched with jobs." /><button onClick={() => setUploading(true)} className="pill-accent mt-4">Upload your first resume</button></div> : (
          <div className="card overflow-x-auto p-6">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead><tr className="border-b border-line">{["Resume", "Target Job Title", "Last Modified", "Created", ""].map((h) => <th key={h} className="pb-4 font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="border-b border-line">
                    <td className="py-5">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center bg-amber-200 text-xs font-bold [clip-path:polygon(25%_5%,75%_5%,100%_50%,75%_95%,25%_95%,0_50%)]" title="Resume grade">{analyzing.includes(r.id) ? "…" : "B"}</span>
                        <b className="font-medium">{r.name}</b>
                        {r.primary && <span className="tag"><Star className="h-3 w-3 fill-current" />PRIMARY</span>}
                        {analyzing.includes(r.id)
                          ? <span className="tag animate-pulse bg-amber-50 text-amber-700">Analyzing…</span>
                          : <span className="tag bg-green-50 text-green-700">Analysis Complete</span>}
                      </span>
                    </td>
                    <td className="text-neutral-500">{r.target}</td><td className="text-neutral-500">{r.modified}</td><td className="text-neutral-500">{r.created}</td>
                    <td className="relative text-right">
                      <button aria-label="Resume actions" aria-expanded={menu === r.id} onClick={() => setMenu(menu === r.id ? null : r.id)} className="rounded-lg bg-neutral-100 p-1.5 hover:bg-neutral-200"><MoreHorizontal className="h-4 w-4" /></button>
                      {menu === r.id && (
                        <div className="animate-pop absolute right-0 top-11 z-10 w-40 rounded-xl border border-line bg-white py-1 text-left shadow-lg">
                          {["Set Primary", "Rename", "Delete"].map((a) => <button key={a} onClick={() => act(r.id, a)} className={`block w-full px-4 py-2 text-left hover:bg-neutral-50 ${a === "Delete" ? "text-red-500" : ""}`}>{a}</button>)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <UploadModal open={uploading} onClose={() => setUploading(false)} onFile={add} />
    </>
  );
}
