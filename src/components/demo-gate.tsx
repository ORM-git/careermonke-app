"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { demoStore, hasSession, rememberNext } from "@/lib/demo";

/**
 * Fresh entry to any app page starts the demo onboarding and remembers the requested page.
 * Once onboarding has started in this visit, internal navigation never restarts it.
 */
export function useDemoGate() {
  const router = useRouter();
  const path = usePathname();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (hasSession()) { setOk(true); return; }
    const search = typeof location !== "undefined" ? location.search.replace(/[?&]welcome=1/, "") : "";
    rememberNext(`${path}${search}`);
    router.replace("/onboarding/role");
  }, [router, path]);
  return ok;
}

/** Clears only this demo's visit state and replays onboarding. */
export function useRestartDemo() {
  const router = useRouter();
  return () => { demoStore.clear(); router.push("/onboarding/role"); };
}

export function RestartDemoButton({ className = "" }: { className?: string }) {
  const restart = useRestartDemo();
  return (
    <button onClick={restart} className={`flex items-center gap-2 ${className}`} title="Start the guided demo again from onboarding">
      <RotateCcw className="h-[18px] w-[18px]" aria-hidden="true" />Restart Demo
    </button>
  );
}
