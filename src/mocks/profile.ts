import { user } from "./user";

export type Personal = {
  first: string; middle: string; last: string; email: string; phoneType: string; phoneCode: string; phone: string;
  address: string; country: string; state: string; city: string; county: string; postal: string;
  linkedin: string; github: string; portfolio: string;
};
export type Education = { school: string; major: string; degree: string; gpa: string; start: string; end: string; current: boolean };
export type Work = { title: string; company: string; jobType: string; location: string; start: string; end: string; current: boolean; summary: string; bullets: string[] };
export type Eeo = { country: string; answers: Record<string, string | string[]> };
export type Profile = { personal: Personal; education: Education[]; work: Work[]; skills: string[]; eeo: Eeo };

export const SECTIONS = ["Personal", "Education", "Work Experience", "Skills", "Equal Employment"] as const;
export type Section = (typeof SECTIONS)[number];

// Mock seed. Phone, address and postal code are blank on purpose so the "complete your profile" flow has work to do.
export const seedProfile: Profile = {
  personal: {
    first: user.name.split(" ")[0], middle: "", last: user.name.split(" ")[1] ?? "", email: user.email,
    phoneType: "", phoneCode: "+91", phone: "", address: "", country: "India", state: "Karnataka", city: "Bengaluru",
    county: "", postal: "", linkedin: "", github: "", portfolio: "",
  },
  education: [{ school: "Silicon University", major: "Computer Science", degree: "B.Tech", gpa: "", start: "2022-08", end: "2026-05", current: false }],
  work: [{ title: "Analyst Intern", company: "Ledgerline", jobType: "Internship", location: "Bengaluru", start: "2025-07", end: "", current: true, summary: "Reporting and analytics for the finance team.", bullets: ["Built weekly KPI dashboards used by 3 teams"] }],
  skills: ["SQL", "Excel", "Power BI", "Stakeholder management"],
  eeo: { country: "", answers: {} },
};

export const emptyEducation = (): Education => ({ school: "", major: "", degree: "", gpa: "", start: "", end: "", current: false });
export const emptyWork = (): Work => ({ title: "", company: "", jobType: "", location: "", start: "", end: "", current: false, summary: "", bullets: [""] });

export const PERSONAL_REQUIRED: (keyof Personal)[] = ["first", "last", "email", "phone", "address", "country", "state", "city", "postal"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errs = Record<string, string>;
export function personalErrors(p: Personal): Errs {
  const e: Errs = {};
  for (const k of PERSONAL_REQUIRED) if (!p[k].trim()) e[k] = "Required";
  if (p.email.trim() && !EMAIL.test(p.email)) e.email = "Enter a valid email";
  if (p.phone.trim() && !/^[\d\s-]{6,15}$/.test(p.phone)) e.phone = "Enter a valid phone number";
  return e;
}
const datedErrors = (start: string, end: string, current: boolean): Errs => {
  const e: Errs = {};
  if (!start) e.start = "Required";
  if (!current && !end) e.end = "Required, or tick 'currently'";
  if (start && end && !current && end < start) e.end = "End must be after start";
  return e;
};
export const educationErrors = (list: Education[]): Errs[] =>
  list.map((x) => ({ ...(x.school.trim() ? {} : { school: "Required" }), ...(x.degree.trim() ? {} : { degree: "Required" }), ...datedErrors(x.start, x.end, x.current) }));
export const workErrors = (list: Work[]): Errs[] =>
  list.map((x) => ({ ...(x.title.trim() ? {} : { title: "Required" }), ...(x.company.trim() ? {} : { company: "Required" }), ...datedErrors(x.start, x.end, x.current) }));

const none = (errs: Errs | Errs[]) => (Array.isArray(errs) ? errs.every((x) => !Object.keys(x).length) : !Object.keys(errs).length);

/** Completion comes from the actual fields. Equal Employment counts once a country is chosen; its answers stay optional. */
export function sectionDone(p: Profile): Record<Section, boolean> {
  return {
    Personal: none(personalErrors(p.personal)),
    Education: p.education.length > 0 && none(educationErrors(p.education)),
    "Work Experience": p.work.length > 0 && none(workErrors(p.work)),
    Skills: p.skills.length > 0,
    "Equal Employment": !!p.eeo.country,
  };
}

export type Question = { key: string; label: string; options: string[]; multi?: boolean };
const q = {
  gender: { key: "gender", label: "Gender", options: ["Female", "Male", "Non-binary", "Self-describe"] },
  disability: { key: "disability", label: "Do you have a disability?", options: ["Yes", "No"] },
  veteran: { key: "veteran", label: "Veteran status", options: ["I am a protected veteran", "I am not a protected veteran"] },
  lgbtq: { key: "lgbtq", label: "Do you identify as LGBTQ+?", options: ["Yes", "No"] },
  race: { key: "race", label: "Race", options: ["American Indian or Alaska Native", "Asian", "Black or African American", "Native Hawaiian or Pacific Islander", "White", "Two or more races"] },
  hispanic: { key: "hispanic", label: "Are you Hispanic or Latino?", options: ["Yes", "No"] },
  orientation: { key: "orientation", label: "Sexual orientation", options: ["Asexual", "Bisexual", "Gay", "Heterosexual", "Lesbian", "Pansexual", "Queer", "Self-describe"], multi: true },
  pronouns: { key: "pronouns", label: "Pronouns", options: ["She/her", "He/him", "They/them", "Self-describe"] },
  ethnicity: { key: "ethnicity", label: "Ethnicity", options: ["Asian or Asian British", "Black, African or Caribbean", "Mixed or multiple", "White", "Other ethnic group"] },
  minority: { key: "minority", label: "Do you identify as a member of a visible minority?", options: ["Yes", "No"] },
  indigenous: { key: "indigenous", label: "Do you identify as Indigenous?", options: ["Yes", "No"] },
} satisfies Record<string, Question>;

export const EEO_COUNTRIES: Record<string, Question[]> = {
  "United States": [q.disability, q.veteran, q.gender, q.lgbtq, q.race, q.hispanic, q.orientation, q.pronouns],
  Canada: [q.gender, q.disability, q.minority, q.indigenous, q.lgbtq, q.pronouns],
  "United Kingdom": [q.gender, q.disability, q.ethnicity, q.lgbtq, q.orientation, q.pronouns],
  Australia: [q.gender, q.disability, q.indigenous, q.lgbtq, q.pronouns],
  Ireland: [q.gender, q.disability, q.ethnicity, q.lgbtq, q.orientation, q.pronouns],
  "New Zealand": [q.gender, q.disability, q.indigenous, q.lgbtq, q.pronouns],
};

const KEY = "cm-profile";
export const readProfile = (): Profile => {
  try { return { ...seedProfile, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return seedProfile; }
};
export const saveProfile = (p: Profile) => localStorage.setItem(KEY, JSON.stringify(p));
