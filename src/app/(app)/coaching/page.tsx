import { ArrowRight, Check, FileSearch, GraduationCap, MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/shell";
import { coachSteps, situations } from "@/mocks/misc";

const icons = [GraduationCap, FileSearch, MessagesSquare];

export default function CoachingPage() {
  return (
    <>
      <PageHeader title="COACHING" right={<span />}><span className="border-b-2 border-ink text-[15px] font-medium">Discover</span></PageHeader>
      <div className="bg-[radial-gradient(ellipse_at_center,#DBEAFE_0%,transparent_60%)] px-4 py-16 md:py-24">
        <h2 className="mx-auto max-w-2xl text-center text-3xl md:text-4xl">1-on-1 Coaching With Senior Recruiters, Built to <b>Land Your Next Interview</b></h2>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {["Coaching built around you", "Find your job-search blocker", "Fix it together"].map((t) => <span key={t} className="chip"><Check className="h-4 w-4 rounded-full bg-accent p-0.5 text-white" />{t}</span>)}
        </div>
        <div className="card mx-auto mt-10 max-w-5xl bg-white/80 p-6">
          <h3 className="text-center text-xl">Where do you need the most help?</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {situations.map((s, i) => { const Icon = icons[i]; return (
              <div key={s.title} className="flex flex-col items-center rounded-xl bg-white p-6 text-center">
                <Icon className="h-12 w-12 stroke-[1.25]" aria-hidden="true" />
                <h4 className="mt-4 text-lg font-semibold">{s.title}</h4>
                <p className="mt-1 flex-1 text-sm text-neutral-600">{s.text}</p>
                <button className="pill mt-4 bg-accent-tint text-ink hover:bg-blue-100">Meet My Coach <ArrowRight className="h-4 w-4" /></button>
              </div>
            ); })}
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-5xl">
          <h3 className="text-center text-xl font-semibold">How it works</h3>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {coachSteps.map((s, i) => (
              <li key={s.title} className="card flex gap-4 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-white">{i + 1}</span>
                <span><b className="block font-semibold">{s.title}</b><span className="text-sm text-neutral-600">{s.text}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
