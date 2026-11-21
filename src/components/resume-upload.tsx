"use client";

import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Modal } from "./ui";

const MAX = 10 * 1024 * 1024;
export const resumeFileError = (f: File) =>
  !/\.(pdf|docx?)$/i.test(f.name) ? "Please choose a PDF or Word file." : f.size > MAX ? "This file is over 10MB." : "";

export function UploadModal({ open, onClose, onFile }: { open: boolean; onClose: () => void; onFile: (f: File) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  const close = () => { setErr(""); onClose(); };
  return (
    <Modal open={open} onClose={close} title="Upload Resume to Get Started">
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <h2 className="text-2xl font-bold">Upload Resume to Get Started</h2>
        <span className="relative"><FileText className="h-20 w-20 stroke-[1.1]" aria-hidden="true" /><Upload className="absolute -bottom-1 -right-1 h-7 w-7 rounded-md bg-ink p-1 text-white" aria-hidden="true" /></span>
        <p className="text-xs text-neutral-500">Files should be in PDF or Word format and must not exceed 10MB in size.</p>
        {err && <p role="alert" className="-mt-3 text-sm text-red-500">{err}</p>}
        <label className="sr-only" htmlFor="resume-file">Resume file</label>
        <input id="resume-file" ref={input} type="file" accept=".pdf,.doc,.docx" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; const m = resumeFileError(f); if (m) setErr(m); else { setErr(""); onFile(f); } }} />
        <button onClick={() => input.current?.click()} className="pill-dark w-60 py-3 text-base">Upload</button>
      </div>
    </Modal>
  );
}
