// Static copy of Carrier-hound's /pricing (billing-disabled state): same layout, plans and copy, no Supabase or Razorpay.
import { PageHeader } from "@/components/shell";
import { inr, plans } from "@/mocks/misc";

const FEATURES = [
  "Unlimited browsing of verified unindexed remote jobs",
  "Filters for role, location and job type",
  "Salary data where available",
  "Direct apply links to employer career pages",
];
const FAQ = [
  ["What do I get?", "Full access to CareerMonke job listings: every verified unindexed remote job, with filters, salary data where the employer publishes it, and direct apply links."],
  ["Does my plan renew automatically?", "No. Plans are prepaid for a fixed duration and do not auto-renew. Access ends when the period is over unless you choose to buy again."],
  ["Can I get a refund?", "All sales are final. Only a duplicate or failed-but-debited payment is reviewed and refunded."],
  ["How can I pay?", "Payments are processed in Indian Rupees through Razorpay, with UPI, NetBanking and cards supported."],
];

export default function PricingPage() {
  return (
    <>
      <PageHeader title="PRICING" right={<span />} />
      <div className="mx-auto flex max-w-5xl flex-col gap-16 bg-white px-4 py-12 sm:px-6 sm:py-20">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#090E34] sm:text-5xl">Plans and pricing</h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">Full access to verified unindexed remote job listings. One-time payment, no auto-renewal.</p>
        </header>
        <section aria-label="Plans" className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {plans.map((p) => {
            const popular = p.id === "monthly";
            return (
              <article key={p.id} className={`flex flex-col rounded-2xl bg-white p-6 sm:p-8 ${popular ? "border-2 border-[#2563EB] shadow-lg shadow-blue-600/10" : "border border-slate-200"}`}>
                <div className="flex min-h-[28px] items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold text-[#090E34]">{p.name}</h2>
                  {popular && <span className="rounded-full bg-[#2563EB] px-2.5 py-0.5 text-xs font-medium text-white">Most popular</span>}
                </div>
                <div className="mt-6 flex items-baseline gap-2"><span className="text-4xl font-semibold tracking-tight text-[#090E34]">{inr(p.price)}</span><span className="text-sm text-slate-500">one-time</span></div>
                <p className="mt-1 text-sm text-slate-500">{p.days} days access</p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-slate-700">
                  {FEATURES.map((f) => <li key={f} className="flex items-start gap-2.5"><span aria-hidden="true" className="text-[#2563EB]">✓</span>{f}</li>)}
                </ul>
                <button disabled className="mt-8 min-h-[48px] w-full cursor-not-allowed rounded-xl bg-slate-200 text-sm font-semibold text-slate-600">Upgrade</button>
                <p className="mt-2 text-center text-xs text-slate-500">Payments are currently unavailable.</p>
              </article>
            );
          })}
        </section>
        <section aria-labelledby="faq" className="mx-auto w-full max-w-3xl">
          <h2 id="faq" className="text-center text-xl font-semibold text-[#090E34] sm:text-2xl">Frequently asked questions</h2>
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-[#090E34]">{q}<span aria-hidden="true" className="text-xl text-slate-400 transition-transform group-open:rotate-45">+</span></summary>
                <p className="mt-3 text-sm text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </section>
        <p className="text-center text-xs font-semibold text-[#090E34]">All sales final · no refunds</p>
      </div>
    </>
  );
}
