export type Job = {
  id: string; title: string; company: string; initials: string; color: string; industry: string;
  location: string; mode: "Remote" | "Onsite" | "Hybrid"; type: string; level: string; exp: string;
  salary?: string; posted: string; applicants: string; match: number;
  breakdown: { experience: number; skills: number; industry: number };
  reasons: string[]; summary: string; responsibilities: string[]; requirements: string[]; benefits: string[];
  companyAbout: string; size: string; badges: string[];
};

type Seed = Pick<Job, "title" | "company" | "color" | "industry" | "location" | "mode" | "level" | "match" | "posted"> & { salary?: string };

const seeds: Seed[] = [
  { title: "Business Analyst II", company: "Northwind Health", color: "#F59E0B", industry: "Healthcare · Late Stage", location: "Bengaluru, KA", mode: "Onsite", level: "Mid Level", salary: "₹14L – ₹22L/yr", posted: "7 hours ago", match: 44 },
  { title: "Technical Business Analyst", company: "Ledgerline", color: "#0F172A", industry: "Fintech · Public Company", location: "India", mode: "Remote", level: "Mid Level", posted: "1 day ago", match: 48 },
  { title: "Senior Business Analyst", company: "Microvolt Systems", color: "#7C3AED", industry: "Hardware · Public Company", location: "Hyderabad, TS", mode: "Onsite", level: "Senior Level", salary: "₹28L – ₹40L/yr", posted: "21 hours ago", match: 46 },
  { title: "Growth Analyst", company: "Brightpath Consulting", color: "#2563EB", industry: "Consulting · Late Stage", location: "Mumbai, MH", mode: "Hybrid", level: "Entry Level", salary: "₹10L – ₹15L/yr", posted: "5 days ago", match: 35 },
  { title: "Product Analyst", company: "Quickcart", color: "#16A34A", industry: "E-commerce · Growth Stage", location: "Gurugram, HR", mode: "Hybrid", level: "Entry Level", salary: "₹12L – ₹18L/yr", posted: "2 days ago", match: 72 },
  { title: "Data Analyst", company: "Skyline Travel", color: "#0EA5E9", industry: "Travel · Series C", location: "Remote, India", mode: "Remote", level: "Mid Level", salary: "₹15L – ₹24L/yr", posted: "3 hours ago", match: 81 },
  { title: "Associate Product Manager", company: "Papertrail", color: "#EF4444", industry: "SaaS · Series B", location: "Pune, MH", mode: "Onsite", level: "Entry Level", salary: "₹18L – ₹26L/yr", posted: "4 days ago", match: 58 },
  { title: "Operations Analyst", company: "Freightly", color: "#A16207", industry: "Logistics · Series A", location: "Chennai, TN", mode: "Onsite", level: "Entry Level", salary: "₹8L – ₹12L/yr", posted: "1 week ago", match: 63 },
  { title: "BI Developer", company: "Cloudnest", color: "#4F46E5", industry: "Cloud · Public Company", location: "Remote", mode: "Remote", level: "Mid Level", salary: "₹20L – ₹30L/yr", posted: "6 hours ago", match: 54 },
  { title: "Strategy Analyst", company: "Greenfield Energy", color: "#15803D", industry: "Energy · Late Stage", location: "Delhi, DL", mode: "Hybrid", level: "Mid Level", posted: "2 days ago", match: 41 },
  { title: "Marketing Analyst", company: "Loopwave", color: "#DB2777", industry: "Media · Series B", location: "Bengaluru, KA", mode: "Remote", level: "Entry Level", salary: "₹9L – ₹14L/yr", posted: "12 hours ago", match: 67 },
  { title: "Junior Business Analyst", company: "Civic Bank", color: "#1E3A8A", industry: "Banking · Public Company", location: "Kolkata, WB", mode: "Onsite", level: "Entry Level", salary: "₹7L – ₹10L/yr", posted: "3 days ago", match: 76 },
];

export const jobs: Job[] = seeds.map((s, i) => ({
  ...s,
  id: String(i + 1),
  initials: s.company.split(" ").map((w) => w[0]).join("").slice(0, 2),
  type: "Full-time",
  exp: s.level === "Senior Level" ? "5+ years exp" : s.level === "Mid Level" ? "3+ years exp" : "0-2 years exp",
  applicants: i % 3 === 1 ? "< 25 applicants" : "25+ applicants",
  breakdown: { experience: Math.max(20, s.match - 14), skills: s.match, industry: Math.min(95, s.match + 21) },
  reasons: [
    `Your analytics projects line up with the core work at ${s.company}.`,
    "Skills overlap: SQL, stakeholder management, reporting.",
    `Seniority gap: the role asks for ${s.level.toLowerCase()} experience.`,
  ],
  summary: `${s.company} is hiring a ${s.title} to partner with business teams on strategy, process analysis and operational improvement.`,
  responsibilities: [
    "Partner with stakeholders to define requirements and success metrics",
    "Turn ambiguous problems into clear, shipped improvements",
    "Write clear documentation and share progress every week",
    "Work with design and engineering to prioritise the roadmap",
  ],
  requirements: ["2+ years of relevant experience", "Strong written and spoken communication", "Comfort with SQL, spreadsheets or similar tools", "Bias for action and ownership"],
  benefits: ["Health insurance for you and family", "Flexible hours", "Learning budget", "Annual team offsite"],
  companyAbout: `${s.company} builds ${s.industry.split(" · ")[0].toLowerCase()} products used by millions of customers across India and abroad.`,
  size: ["51-200", "201-500", "1,001-5,000", "10,000+"][i % 4],
  badges: [i % 2 ? "1 school alum" : "1 former colleague", "Early applicant"],
}));

export const getJob = (id: string) => jobs.find((j) => j.id === id);
