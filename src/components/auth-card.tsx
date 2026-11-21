"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { toast } from "./toast";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_OK = (p: string) => p.length >= 8 && /\d/.test(p) && /[a-z]/i.test(p);

function GoogleG() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" /></svg>;
}

export function AuthCard({ initial }: { initial: "signin" | "signup" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initial);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [updates, setUpdates] = useState(true);
  const [err, setErr] = useState("");
  const signup = mode === "signup";

  // shortcut: mock session flag in localStorage, swap for Supabase auth when the backend lands
  const enter = () => {
    localStorage.setItem("cm-session", "demo");
    router.push(signup ? "/onboarding/role" : "/jobs");
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email)) return setErr("Enter a valid email address.");
    if (signup && !PASSWORD_OK(pw)) return setErr("Your password should contain both numbers and letters with 8 minimum length.");
    if (!signup && !pw) return setErr("Enter your password.");
    enter();
  };
  const switchMode = () => { setMode(signup ? "signin" : "signup"); setErr(""); setPw(""); };
  const showPw = !signup || EMAIL.test(email);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F6FF] p-4">
      <form onSubmit={submit} noValidate className="animate-pop relative w-full max-w-[480px] rounded-[28px] bg-white px-8 pb-6 pt-10 shadow-xl">
        <Link href="/" aria-label="Close" className="absolute right-6 top-6 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white"><X className="h-4 w-4" /></Link>
        <h1 className="px-6 text-center text-[26px]">{signup ? "Welcome to" : "Welcome back to"} <b>CareerMonke</b></h1>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-neutral-100">
          <button type="button" className="rounded-xl border border-ink bg-white py-2.5 text-sm">Job Seekers</button>
          <button type="button" onClick={() => toast("Employer accounts are coming soon")} className="rounded-xl py-2.5 text-sm text-neutral-700">Employers</button>
        </div>
        <button type="button" onClick={enter} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-line py-3 text-[15px] font-medium hover:bg-neutral-50">
          <GoogleG /> {signup ? "Sign up with Google" : "Sign in with Google"}
        </button>
        <p className="my-4 text-center text-xs text-neutral-500">OR</p>

        <label className="sr-only" htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="Email" className="input py-3.5" />
        {showPw && (
          <div className="animate-pop mt-3">
            <div className="relative">
              <label className="sr-only" htmlFor="pw">Password</label>
              <input id="pw" type={show ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} placeholder="Password" className="input py-3.5 pr-11" />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {signup && <p className={`mt-1.5 text-xs ${pw && PASSWORD_OK(pw) ? "text-green-600" : "text-neutral-500"}`}>Your password should contain both numbers and letters with 8 minimum length</p>}
          </div>
        )}
        {signup && (
          <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" checked={updates} onChange={(e) => setUpdates(e.target.checked)} className="peer sr-only" />
            <span className="flex h-5 w-5 items-center justify-center rounded border border-line bg-white transition-colors peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300">{updates && <Check className="h-3.5 w-3.5 text-white" />}</span>
            I want to receive updates from CareerMonke about latest job offers
          </label>
        )}
        {err && <p role="alert" className="mt-3 text-sm text-red-500">{err}</p>}
        <button className="pill-dark mt-4 w-full rounded-xl py-3.5 text-base">{signup ? "SIGN UP" : "SIGN IN"}</button>

        {signup
          ? <p className="mx-auto mt-5 max-w-xs text-center text-xs text-neutral-500">By continuing, you agree to the CareerMonke Terms of Service and the Privacy Policy</p>
          : <button type="button" className="mx-auto mt-5 block text-sm font-medium">Forgot Password?</button>}
        <button type="button" onClick={switchMode} className="mt-5 block w-full rounded-xl border border-line py-3 text-center text-[15px]">
          {signup ? <>Already a member? <b>Sign in now</b></> : <>Not a member? <b>Sign up now</b></>}
        </button>
      </form>
    </main>
  );
}
