import { jobs, type Job } from "./jobs";
import { readPrefs } from "./onboarding";

export const LEVELS = ["Intern/New Grad", "Entry Level", "Mid Level", "Senior Level", "Lead/Staff", "Director/Executive"];
export const JOB_TYPES = ["Full-time", "Contract", "Part-time", "Internship"];
export const WORK_MODELS = ["Onsite", "Hybrid", "Remote"];
export const DATE_POSTED = [
  { v: "24h", label: "Past 24 hours", hours: 24 }, { v: "3d", label: "Past 3 days", hours: 72 },
  { v: "week", label: "Past week", hours: 168 }, { v: "month", label: "Past month", hours: 720 },
];
export const STAGES = ["Early Stage", "Growth Stage", "Late Stage", "Public Company"];
export const INDUSTRIES = [...new Set(jobs.map((j) => j.industryName))].sort();
export const COMPANIES = [...new Set(jobs.map((j) => j.company))].sort();
export const SKILLS = [...new Set(jobs.flatMap((j) => j.skills))].sort();
export const EXP_MAX = 15;
export const SALARY_MAX = 300;

export type Filter = {
  title: string; country: string; locations: string[]; workModels: string[]; jobFunctions: string[]; excludedTitles: string[];
  jobTypes: string[]; levels: string[]; expOpen: boolean; exp: [number, number]; datePosted: string;
  salaryOpen: boolean; minSalaryK: number; h1b: boolean; excludeClearance: boolean; excludeCitizen: boolean;
  industryOptions: string[]; industries: string[]; excludedIndustries: string[];
  skillOptions: string[]; skills: string[]; excludedSkills: string[]; role: "" | "IC" | "Manager";
  companies: string[]; stages: string[]; excludeStaffing: boolean; excludedCompanies: string[];
  internStart: string; gradTime: string; hiddenJobs: boolean;
};

export const blankFilter = (): Filter => ({
  title: "All jobs", country: "", locations: [], workModels: [...WORK_MODELS], jobFunctions: [], excludedTitles: [],
  jobTypes: ["Full-time"], levels: [], expOpen: true, exp: [0, EXP_MAX], datePosted: "",
  salaryOpen: true, minSalaryK: 0, h1b: false, excludeClearance: false, excludeCitizen: false,
  industryOptions: ["Information Technology", "Artificial Intelligence (AI)", "Financial Services", "Consulting", "Software"], industries: [], excludedIndustries: [],
  skillOptions: ["Python", "TypeScript", "SQL", "Node.js", "AWS"], skills: [], excludedSkills: [], role: "",
  companies: [], stages: [], excludeStaffing: false, excludedCompanies: [],
  internStart: "", gradTime: "", hiddenJobs: false,
});

const shortCountry = (c: string) => (c === "United States" ? "US" : c === "United Kingdom" ? "UK" : c);

/** The first saved filter comes from the onboarding answers. */
export function filterFromOnboarding(): Filter {
  const p = readPrefs();
  const fn = p?.jobFunction || "Business Analyst";
  const country = p?.location && p.location !== "Remote (anywhere)" ? p.location : p?.location ? "" : "India";
  return { ...blankFilter(), title: [fn, shortCountry(country)].filter(Boolean).join(", "), jobFunctions: [fn], country, jobTypes: p?.jobTypes?.length ? p.jobTypes : ["Full-time"], h1b: !!p?.h1b };
}

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);
const titleHas = (title: string, phrase: string) => { const t = words(title); return words(phrase).every((w) => t.includes(w)); };
const isManager = (title: string) => /manager|head|director|lead\b/i.test(title);

export function matches(j: Job, f: Filter): boolean {
  if (f.jobFunctions.length && !f.jobFunctions.some((fn) => titleHas(j.title, fn))) return false;
  if (f.excludedTitles.some((t) => titleHas(j.title, t))) return false;
  if (f.country && j.country !== f.country) return false;
  if (f.locations.length && !f.locations.some((l) => l.startsWith("Anywhere") || j.location.toLowerCase().includes(l.toLowerCase()))) return false;
  if (f.workModels.length && !f.workModels.includes(j.mode)) return false;
  if (f.jobTypes.length && !f.jobTypes.includes(j.type)) return false;
  if (f.levels.length && !f.levels.includes(j.level)) return false;
  if (!f.expOpen && (j.expMin < f.exp[0] || j.expMin > f.exp[1])) return false;
  const d = DATE_POSTED.find((x) => x.v === f.datePosted);
  if (d && j.postedHours > d.hours) return false;
  if (!f.salaryOpen && (j.salaryK ?? 0) < f.minSalaryK) return false;
  if (f.h1b && !j.h1b) return false;
  if (f.excludeCitizen && j.citizenOnly) return false;
  if (f.excludeClearance && j.clearance) return false;
  if (f.industries.length && !f.industries.includes(j.industryName)) return false;
  if (f.excludedIndustries.includes(j.industryName)) return false;
  if (f.skills.length && !f.skills.some((s) => j.skills.includes(s))) return false;
  if (f.excludedSkills.some((s) => j.skills.includes(s))) return false;
  if (f.role === "Manager" && !isManager(j.title)) return false;
  if (f.role === "IC" && isManager(j.title)) return false;
  if (f.companies.length && !f.companies.includes(j.company)) return false;
  if (f.stages.length && !f.stages.includes(j.stage)) return false;
  if (f.excludeStaffing && j.staffing) return false;
  if (f.excludedCompanies.includes(j.company)) return false;
  return true;
}

export const countMatches = (f: Filter) => jobs.filter((j) => matches(j, f)).length;

/** Summary chips shown at the top of the All Filters drawer. */
export function filterChips(f: Filter): string[] {
  const exp = f.expOpen ? [] : [`${f.exp[0]}-${f.exp[1]} yrs`];
  const date = DATE_POSTED.find((d) => d.v === f.datePosted)?.label;
  return [
    ...f.jobFunctions, ...f.jobTypes, ...f.workModels, ...f.levels, ...(f.country ? [f.country] : []), ...f.locations, ...exp, ...(date ? [date] : []),
    ...(f.salaryOpen ? [] : [`$${f.minSalaryK}K+`]), ...(f.h1b ? ["H1B sponsorship"] : []), ...(f.excludeCitizen ? ["No US-citizen-only"] : []),
    ...(f.excludeClearance ? ["No clearance required"] : []), ...f.industries, ...f.skills, ...(f.role ? [f.role] : []),
    ...f.companies, ...f.stages, ...(f.excludeStaffing ? ["Exclude staffing agency"] : []),
    ...f.excludedTitles.map((t) => `−${t}`), ...f.excludedIndustries.map((t) => `−${t}`), ...f.excludedSkills.map((t) => `−${t}`), ...f.excludedCompanies.map((t) => `−${t}`),
  ];
}

export type SavedFilter = { id: string; filter: Filter };
const KEY = "cm-saved-filters";
export const readSaved = (): SavedFilter[] => {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [{ id: "f1", filter: filterFromOnboarding() }];
  } catch { return [{ id: "f1", filter: filterFromOnboarding() }]; }
};
export const writeSaved = (list: SavedFilter[]) => localStorage.setItem(KEY, JSON.stringify(list));
