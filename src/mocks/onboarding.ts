export const jobFunctions = [
  "Software Engineer", "Backend Engineer", "Frontend Engineer", "Data Analyst", "Data Scientist", "Business Analyst",
  "Product Manager", "Product Designer", "Marketing Manager", "Sales Executive", "Operations Analyst", "DevOps Engineer",
];

export const countries = [
  "Remote (anywhere)", "Australia", "Bangladesh", "Brazil", "Canada", "China", "France", "Germany", "India", "Indonesia",
  "Ireland", "Japan", "Malaysia", "Mexico", "Netherlands", "New Zealand", "Nigeria", "Pakistan", "Philippines", "Poland",
  "Singapore", "South Africa", "Spain", "Sri Lanka", "Sweden", "Switzerland", "United Arab Emirates", "United Kingdom", "United States", "Vietnam",
];

export const jobTypes = ["Full-time", "Contract", "Part-time", "Internship"];

export const experienceLevels = [
  { label: "Intern/New Grad", sub: "" },
  { label: "Entry Level", sub: "1-3 years" },
  { label: "Mid Level", sub: "2-5 years" },
  { label: "Senior Level", sub: "5+ years, project leader" },
  { label: "Lead/Staff", sub: "Cross-team leader/Domain expert" },
  { label: "Director/Executive", sub: "Director/VP/CXO" },
];
export const defaultLevels = ["Senior Level"];

// Mock: pretend these came from parsing the uploaded resume.
export const additionalFunctions = ["Backend Engineer"];

export const statusSentences = [
  "Identifying your job preferences - industry, role, and location.",
  "Applying advanced AI to create your unique suitability profile.",
  "Matching your profile with relevant job posts.",
];

export const featureHighlights = [
  "Generate Custom Resume For Each Job",
  "Autofill Application Forms In One-Click",
  "Find LinkedIn Connections For Referrals",
];

export const tourSteps = [
  { anchor: "match", title: "Match Score", text: "Think of the score beside each job as your qualification score, reflecting how well you fit the job." },
  { anchor: "filters", title: "Adjust Your Job Preference", text: "You can refine your job title, industry, company, salary, and other preference here." },
  { anchor: "ask", title: "Ask Monke", text: "Anything you'd like to know about a job? Ask me!" },
  { anchor: "ask", title: "Generate Custom Resume", text: "Want a better shot at this job? Ask Monke to customize your resume in seconds." },
];

export const chatSuggestions = [
  "Tell me why this job is a good fit for me.",
  "Give me some resume tips if I want to apply.",
  "Generate custom resume tailored to this job.",
  "Show me Connections for potential referral.",
];

export const matchCount = 1842;

// localStorage keys. Logout clears only cm-session, so these survive and never replay.
export const KEYS = { prefs: "cm-onboarding", welcome: "cm_welcome_done", tour: "cm_tour_done", autofill: "cm_autofill_seen", linkedin: "cm_linkedin_dismissed" };

export type Prefs = { jobFunction: string; jobTypes: string[]; location: string; openToRemote: boolean; h1b: boolean; resume?: string };
export const readPrefs = (): Prefs | null => {
  try { return JSON.parse(localStorage.getItem(KEYS.prefs) || "null"); } catch { return null; }
};
export const savePrefs = (p: Partial<Prefs>) => localStorage.setItem(KEYS.prefs, JSON.stringify({ ...readPrefs(), ...p }));
