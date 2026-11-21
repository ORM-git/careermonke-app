"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Lock, X } from "lucide-react";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Keeps Tab inside an open dialog and returns focus to the opener on close.
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const opener = document.activeElement as HTMLElement | null;
    const items = () => [...el.querySelectorAll<HTMLElement>(FOCUSABLE)];
    (items()[0] ?? el).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const f = items();
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    el.addEventListener("keydown", onKey);
    return () => { el.removeEventListener("keydown", onKey); opener?.focus?.(); };
  }, [active]);
  return ref;
}

/** Right-side drawer. When `dirty`, closing asks before discarding. */
export function Drawer({ open, onClose, label, title, action, header, dirty = false, width = "max-w-3xl", children }: {
  open: boolean; onClose: () => void; label: string; title?: React.ReactNode; action?: React.ReactNode; header?: React.ReactNode;
  dirty?: boolean; width?: string; children: React.ReactNode;
}) {
  const [asking, setAsking] = useState(false);
  const ref = useFocusTrap<HTMLElement>(open);
  const tryClose = () => (dirty ? setAsking(true) : onClose());
  useEffect(() => {
    if (!open) { setAsking(false); return; }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && tryClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={tryClose}>
      <aside ref={ref} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()} className={`animate-pop absolute inset-y-0 right-0 flex w-full ${width} flex-col bg-white shadow-xl`}>
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <button onClick={tryClose} aria-label="Close" className="rounded-lg border border-line p-1.5 hover:bg-neutral-50"><ChevronRight className="h-4 w-4" /></button>
          <div className="min-w-0 flex-1 text-lg font-semibold">{title ?? label}</div>
          {action}
        </div>
        {asking && (
          <div role="alertdialog" aria-label="Unsaved changes" className="flex flex-wrap items-center gap-2 bg-amber-50 px-4 py-2.5 text-sm">
            <span className="flex-1">You have unsaved changes. Discard them?</span>
            <button onClick={() => setAsking(false)} className="pill-ghost py-1">Keep editing</button>
            <button onClick={() => { setAsking(false); onClose(); }} className="pill bg-red-500 py-1 text-white hover:bg-red-600">Discard</button>
          </div>
        )}
        {header}
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </aside>
    </div>
  );
}

export function Confirm({ open, title, body, confirmLabel, danger, onConfirm, onCancel }: {
  open: boolean; title: string; body: React.ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="p-6">
        <h2 className="pr-8 text-lg font-semibold">{title}</h2>
        <div className="mt-2 text-sm text-neutral-600">{body}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="pill-ghost">Cancel</button>
          <button onClick={onConfirm} className={danger ? "pill bg-red-500 text-white hover:bg-red-600" : "pill-accent"}>{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  );
}

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <path d="M16 2 28 6v9c0 7.5-5 12.5-12 15C9 27.5 4 22.5 4 15V6z" fill="#8B5A2B" />
        <circle cx="12" cy="14" r="3.4" fill="#fff" /><circle cx="20" cy="14" r="3.4" fill="#fff" />
        <circle cx="12" cy="14" r="1.5" fill="#2B1A0C" /><circle cx="20" cy="14" r="1.5" fill="#2B1A0C" />
        <path d="M14.5 19h3L16 21.5z" fill="#F59E0B" />
      </svg>
      {withText && <span className="text-[19px] font-bold tracking-tight">CareerMonke</span>}
    </span>
  );
}

export function MonkeAvatar({ size = 44 }: { size?: number }) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center rounded-full border-2 border-ink bg-accent-tint" style={{ width: size, height: size }} aria-hidden="true">
      <span style={{ transform: `scale(${size / 48})` }}><Logo withText={false} /></span>
      <span className="absolute -right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
    </span>
  );
}

export function CompanyLogo({ initials, color, size = 48 }: { initials: string; color: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl font-bold text-white"
      style={{ background: color, width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function MatchRing({ value, size = 72, stroke = 4, dark = false, label }: { value: number; size?: number; stroke?: number; dark?: boolean; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="inline-flex items-center gap-3">
      <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "rgba(255,255,255,.12)" : "#E5E7EB"} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#3B82F6" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
        </svg>
        <span className={`absolute font-semibold ${dark ? "text-white" : "text-ink"}`} style={{ fontSize: size * 0.3 }}>
          {value}<small style={{ fontSize: size * 0.15 }}>%</small>
        </span>
      </span>
      {label && <span className={`text-[13px] font-medium leading-tight ${dark ? "text-white" : "text-ink"}`}>{label}</span>}
    </span>
  );
}

export const matchLabel = (v: number) => (v >= 90 ? "STRONG MATCH" : v >= 70 ? "GOOD MATCH" : v >= 40 ? "FAIR MATCH" : "WEAK MATCH");

export function UpgradePill({ children = "Upgrade", className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <Link href="/pricing" className={`pill-accent px-3 py-1.5 text-xs ${className}`}>
      <Lock className="h-3.5 w-3.5" aria-hidden="true" /> {children}
    </Link>
  );
}

export function EmptyState({ text, cta, href }: { text: string; cta?: string; href?: string }) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-4 px-8 py-10 text-center">
      <span className="opacity-90"><Logo withText={false} /></span>
      <p className="text-sm text-neutral-600">{text}</p>
      {cta && href && <Link href={href} className="pill-accent">{cta}</Link>}
    </div>
  );
}

export function Modal({ open, onClose, children, wide = false, title }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  const trap = useFocusTrap<HTMLDivElement>(open);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        ref={trap}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`animate-pop relative max-h-[90vh] w-full overflow-auto rounded-2xl bg-white shadow-xl ${wide ? "max-w-4xl" : "max-w-[480px]"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 rounded-full p-1.5 hover:bg-neutral-100">
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, counts }: { tabs: readonly T[]; value: T; onChange: (t: T) => void; counts?: Partial<Record<T, number>> }) {
  return (
    <div className="flex min-w-0 gap-6 overflow-x-auto" role="tablist">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={value === t}
          onClick={() => onChange(t)}
          className={`flex items-center gap-1.5 border-b-2 pb-1 text-[15px] transition-colors ${value === t ? "border-ink font-semibold" : "border-transparent text-neutral-600 hover:text-ink"}`}
        >
          {t}
          {counts?.[t] !== undefined && <span className="rounded-full bg-ink px-1.5 text-[11px] font-semibold text-white">{counts[t]}</span>}
        </button>
      ))}
    </div>
  );
}
