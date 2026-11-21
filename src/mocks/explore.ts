import { jobs, ROLES, type Job } from "./jobs";

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9₹]+/).filter(Boolean);
const INDUSTRY_WORDS: Record<string, string> = { fintech: "Financial Services", finance: "Financial Services", ai: "Artificial Intelligence (AI)", healthcare: "Healthcare", ecommerce: "E-commerce", logistics: "Logistics" };
const TITLE_WORDS = ["analyst", "engineer", "product", "designer", "manager", "scientist", "marketing", "sales", "operations", "devops", "backend", "frontend", "data"];

export type ExploreResult = { jobs: Job[]; understood: string[] };

/**
 * Turns a plain-English query into filters over the sample jobs, then ranks by match.
 * Only exact matches are returned; an empty result is reported honestly rather than padded.
 */
export function exploreSearch(query: string, n = 3): ExploreResult {
  const q = query.toLowerCase();
  const w = words(query).map((x) => x.replace(/s$/, ""));
  const understood: string[] = [];
  let list = jobs.slice();

  const role = ROLES.filter((r) => words(r).every((x) => w.includes(x))).sort((a, b) => b.length - a.length)[0];
  if (role) { list = list.filter((j) => words(j.title).join(" ").includes(words(role).join(" "))); understood.push(role); }
  else {
    const kw = TITLE_WORDS.filter((t) => w.includes(t));
    if (kw.length) { list = list.filter((j) => kw.every((k) => words(j.title).some((x) => x.startsWith(k)))); understood.push(...kw.map((k) => `"${k}" roles`)); }
  }
  if (/\bremote\b/.test(q)) { list = list.filter((j) => j.mode === "Remote"); understood.push("remote"); }
  const hours = /24 hours|today/.test(q) ? 24 : /3 days/.test(q) ? 72 : /week/.test(q) ? 168 : /month/.test(q) ? 720 : 0;
  if (hours) { list = list.filter((j) => j.postedHours <= hours); understood.push(`posted in the last ${hours === 24 ? "24 hours" : hours === 72 ? "3 days" : hours === 168 ? "week" : "month"}`); }
  if (/entry[- ]level/.test(q)) { list = list.filter((j) => j.level === "Entry Level"); understood.push("entry level"); }
  if (/\bsenior\b/.test(q)) { list = list.filter((j) => j.level === "Senior Level"); understood.push("senior level"); }
  const ind = Object.keys(INDUSTRY_WORDS).find((k) => w.includes(k));
  if (ind) { list = list.filter((j) => j.industryName === INDUSTRY_WORDS[ind]); understood.push(INDUSTRY_WORDS[ind]); }
  const lakh = /₹\s?(\d+)\s?l/.exec(q);
  if (lakh) { const min = Number(lakh[1]); list = list.filter((j) => Number(/₹(\d+)L/.exec(j.salary ?? "")?.[1] ?? 0) >= min); understood.push(`₹${min}L+ salary`); }

  return { jobs: list.sort((a, b) => b.match - a.match).slice(0, n), understood };
}
