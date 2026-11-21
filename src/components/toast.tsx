"use client";

import { useEffect, useState } from "react";

export const toast = (text: string) => window.dispatchEvent(new CustomEvent("cm-toast", { detail: text }));

export function Toaster() {
  const [msgs, setMsgs] = useState<{ id: number; text: string }[]>([]);
  useEffect(() => {
    const on = (e: Event) => {
      const id = Date.now() + Math.random();
      setMsgs((m) => [...m, { id, text: (e as CustomEvent<string>).detail }]);
      setTimeout(() => setMsgs((m) => m.filter((x) => x.id !== id)), 2500);
    };
    window.addEventListener("cm-toast", on);
    return () => window.removeEventListener("cm-toast", on);
  }, []);
  return (
    <div aria-live="polite" className="fixed bottom-20 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-6">
      {msgs.map((m) => <p key={m.id} className="animate-pop rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">{m.text}</p>)}
    </div>
  );
}
