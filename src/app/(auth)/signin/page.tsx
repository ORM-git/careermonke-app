"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [who, setWho] = useState<"Job Seekers" | "Employers">("Job Seekers");
  const [show, setShow] = useState(false);
  const signIn = (e?: React.FormEvent) => {
    e?.preventDefault();
    localStorage.setItem("cm-session", "demo");
    router.push("/jobs");
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F6FF] p-4">
      <form onSubmit={signIn} className="animate-pop relative w-full max-w-[480px] rounded-[28px] bg-white px-8 pb-6 pt-10 shadow-xl">
        <Link href="/" aria-label="Close" className="absolute right-6 top-6 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white"><X className="h-4 w-4" /></Link>
        <h1 className="px-6 text-center text-[26px]">Welcome back to <b>CareerMonke</b></h1>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-neutral-100 p-0">
          {(["Job Seekers", "Employers"] as const).map((w) => (
            <button type="button" key={w} onClick={() => setWho(w)} className={`rounded-xl py-2.5 text-sm transition-all ${who === w ? "border border-ink bg-white" : "text-neutral-700"}`}>{w}</button>
          ))}
        </div>
        <button type="button" onClick={() => signIn()} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-line py-3 text-[15px] font-medium hover:bg-neutral-50">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" /></svg>
          Sign in with Google
        </button>
        <p className="my-4 text-center text-xs text-neutral-500">OR</p>
        <label className="sr-only" htmlFor="email">Email</label>
        <input id="email" type="email" required placeholder="Email" className="input py-3.5" />
        <div className="relative mt-3">
          <label className="sr-only" htmlFor="pw">Password</label>
          <input id="pw" type={show ? "text" : "password"} required placeholder="Password" className="input py-3.5 pr-11" />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button className="pill-dark mt-3 w-full rounded-xl py-3.5 text-base">SIGN IN</button>
        <button type="button" className="mx-auto mt-5 block text-sm font-medium">Forgot Password?</button>
        <Link href="/onboarding" onClick={() => localStorage.setItem("cm-session", "demo")} className="mt-5 block rounded-xl border border-line py-3 text-center text-[15px]">
          Not a member? <b>Sign up now</b>
        </Link>
      </form>
    </main>
  );
}
