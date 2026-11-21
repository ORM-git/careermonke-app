import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      <div className="relative">
        <p className="text-[140px] font-black leading-none tracking-tighter text-accent-tint [-webkit-text-stroke:3px_#2563EB]">404</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mascot.png" alt="" width={96} height={96} className="absolute -right-10 -top-6 h-24 w-24 rotate-12 object-contain" />
      </div>
      <div><h1 className="text-2xl font-semibold">Page not found</h1><p className="mt-1 text-sm text-neutral-600">This page may have moved, or never existed.</p></div>
      <Link href="/jobs" className="pill-accent">Back to Jobs</Link>
    </main>
  );
}
