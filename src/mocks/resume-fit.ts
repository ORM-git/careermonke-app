// Demo-only resume fit: every number and keyword here is derived deterministically from the sample job data.
// Nothing is analysed, generated or sent.
import type { Job } from "./jobs";

export type Keyword = { name: string; group: "Functional Skills" | "Tools"; has: boolean };
export type SampleResume = { id: string; file: string; title: string; years: number };

export const SAMPLE_RESUMES: SampleResume[] = [
  { id: "a", file: "alex-carter-resume", title: "Software Engineer", years: 6 },
  { id: "b", file: "alex-carter-analyst-resume", title: "Data Analyst", years: 3 },
];
export const SAMPLE_PERSON = { name: "Alex Carter", email: "alex.carter@example.com", city: "Portland, OR" };
export const LOW_SCORE = 6;

const TOOLS = new Set(["SQL", "NoSQL", "Python", "Java", "Golang", "TypeScript", "JavaScript", "React", "Node.js", "AWS", "Kafka", "Kubernetes", "Docker", "Terraform",
  "Figma", "Excel", "Power BI", "Tableau", "Jira", "CRM", "MongoDB", "Elasticsearch", "Next.js", "Jest", "Airflow", "dbt", "Looker", "Amplitude", "Miro", "Salesforce", "HubSpot", "Google Analytics", "Webhooks", "APIs"]);

const FAMILY: Record<string, string[]> = {
  backend: ["Backend Systems", "System Architecture", "Database Design", "Event-Driven Systems", "API Development", "Continuous Integration", "Test-Driven Development", "SQL", "NoSQL", "MongoDB", "Elasticsearch", "Kafka", "Docker", "Microservices"],
  frontend: ["Component Design", "Accessibility", "Responsive Layouts", "Performance Tuning", "Design Systems", "Unit Testing", "TypeScript", "React", "Next.js", "JavaScript", "Jest", "Figma", "Webpack"],
  data: ["Data Modelling", "Dashboarding", "Statistical Analysis", "Data Cleaning", "Experiment Design", "Forecasting", "SQL", "Python", "Power BI", "Tableau", "Excel", "Airflow", "dbt", "Looker"],
  product: ["Roadmapping", "User Stories", "Prioritisation", "Stakeholder management", "Market Research", "Go-to-Market", "Product Analytics", "Jira", "Figma", "Amplitude", "SQL", "Miro"],
  design: ["User research", "Prototyping", "Interaction Design", "Wireframing", "Usability Testing", "Design Systems", "Visual Design", "Figma", "Miro", "Accessibility"],
  business: ["Process mapping", "Reporting", "Stakeholder management", "Forecasting", "Campaign Planning", "Negotiation", "Pipeline Management", "Excel", "CRM", "Salesforce", "HubSpot", "Google Analytics", "SQL"],
};

export function family(title: string) {
  const t = title.toLowerCase();
  if (/frontend/.test(t)) return "frontend";
  if (/designer/.test(t)) return "design";
  if (/engineer|devops|developer/.test(t)) return "backend";
  if (/data|analyst|scientist/.test(t)) return "data";
  if (/product/.test(t)) return "product";
  return "business";
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Sample fit for one job: 0-10 score, 8-15 keywords (job skills first, then its role family), and the score after customizing. */
export function resumeFit(job: Job) {
  const score = Math.min(8.5, Math.max(2, round1((job.match - 30) / 10)));
  const fam = FAMILY[family(job.title)];
  const off = Number(job.id) % fam.length; // rotate so jobs in one family still get different lists
  const names = [...new Set([...job.skills, ...fam.slice(off), ...fam.slice(0, off)])].slice(0, 15);
  const hasCount = Math.max(1, Math.round((names.length * score) / 25));
  const keywords: Keyword[] = names.map((name, i) => ({ name, group: TOOLS.has(name) ? "Tools" : "Functional Skills", has: i < hasCount }));
  return { score, after: Math.min(9, round1(score + 3.5)), keywords };
}

export const rating = (s: number) => (s < LOW_SCORE ? "Poor" : s < 8 ? "Fair" : "Good");
