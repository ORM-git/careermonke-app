// Mock job data for the demo. Scores, counts and company facts are sample values, not real data about any company.
export type Job = {
  id: string; title: string; company: string; initials: string; color: string; industry: string; industryName: string; stage: string;
  tagline: string; location: string; country: string; mode: "Remote" | "Onsite" | "Hybrid"; type: string; level: string; exp: string; expMin: number;
  salary?: string; salaryK?: number; posted: string; postedHours: number; applicants: string; match: number;
  breakdown: { experience: number; skills: number; industry: number };
  reasons: string[]; summary: string; tags: string[]; responsibilities: string[]; requirements: string[]; preferred: string[]; benefits: string[];
  skills: string[]; h1b: boolean; citizenOnly: boolean; clearance: boolean; staffing: boolean; growth: boolean;
  companyAbout: string; size: string; founded: number; hq: string; website: string; badges: string[]; applyUrl: string;
  funding: { stage: string; total: string; investors: string[]; events: { date: string; label: string }[] };
  leaders: { name: string; title: string }[]; news: { source: string; title: string; date: string }[];
};

type Seed = {
  title: string; company: string; color: string; industry: string; tagline: string; location: string; country: string;
  mode: Job["mode"]; level: string; match: number; posted: string; postedHours: number; salary?: string; salaryK?: number; skills: string[];
};

// salaryK is the lower bound in thousands of USD (INR converted at ~1.2K USD per lakh) so one slider works for every job.
const seeds: Seed[] = [
  { title: "Business Analyst II", company: "Northwind Health", color: "#F59E0B", industry: "Healthcare · Late Stage", tagline: "Care navigation for employers and families", location: "Bengaluru, KA", country: "India", mode: "Onsite", level: "Mid Level", salary: "₹14L – ₹22L/yr", salaryK: 17, posted: "7 hours ago", postedHours: 7, match: 44, skills: ["SQL", "Excel", "Stakeholder management", "Jira"] },
  { title: "Technical Business Analyst", company: "Ledgerline", color: "#0F172A", industry: "Financial Services · Public Company", tagline: "Accounting software for growing businesses", location: "India", country: "India", mode: "Remote", level: "Mid Level", posted: "1 day ago", postedHours: 24, match: 48, skills: ["SQL", "APIs", "Process mapping"] },
  { title: "Senior Business Analyst", company: "Microvolt Systems", color: "#7C3AED", industry: "Hardware · Public Company", tagline: "Power electronics for EVs and data centres", location: "Hyderabad, TS", country: "India", mode: "Onsite", level: "Senior Level", salary: "₹28L – ₹40L/yr", salaryK: 34, posted: "21 hours ago", postedHours: 21, match: 46, skills: ["SQL", "Tableau", "Stakeholder management"] },
  { title: "Growth Analyst", company: "Brightpath Consulting", color: "#2563EB", industry: "Consulting · Late Stage", tagline: "Strategy and operations advisory", location: "Mumbai, MH", country: "India", mode: "Hybrid", level: "Entry Level", salary: "₹10L – ₹15L/yr", salaryK: 12, posted: "5 days ago", postedHours: 120, match: 35, skills: ["Excel", "SQL", "Python"] },
  { title: "Product Analyst", company: "Quickcart", color: "#16A34A", industry: "E-commerce · Growth Stage", tagline: "Groceries delivered in minutes", location: "Gurugram, HR", country: "India", mode: "Hybrid", level: "Entry Level", salary: "₹12L – ₹18L/yr", salaryK: 14, posted: "2 days ago", postedHours: 48, match: 72, skills: ["SQL", "Python", "A/B testing"] },
  { title: "Data Analyst", company: "Skyline Travel", color: "#0EA5E9", industry: "Travel · Growth Stage", tagline: "Trip planning and bookings", location: "Remote, India", country: "India", mode: "Remote", level: "Mid Level", salary: "₹15L – ₹24L/yr", salaryK: 18, posted: "3 hours ago", postedHours: 3, match: 81, skills: ["SQL", "Power BI", "Python"] },
  { title: "Associate Product Manager", company: "Papertrail", color: "#EF4444", industry: "Software · Early Stage", tagline: "Document workflows for legal teams", location: "Pune, MH", country: "India", mode: "Onsite", level: "Entry Level", salary: "₹18L – ₹26L/yr", salaryK: 22, posted: "4 days ago", postedHours: 96, match: 58, skills: ["Product strategy", "SQL", "Figma"] },
  { title: "Operations Analyst", company: "Freightly", color: "#A16207", industry: "Logistics · Early Stage", tagline: "Freight booking for small shippers", location: "Chennai, TN", country: "India", mode: "Onsite", level: "Entry Level", salary: "₹8L – ₹12L/yr", salaryK: 10, posted: "1 week ago", postedHours: 168, match: 63, skills: ["Excel", "Process mapping"] },
  { title: "Senior Backend Engineer", company: "Rallypoint", color: "#EA580C", industry: "Sports · Growth Stage", tagline: "Team and league management for youth sports", location: "United States", country: "United States", mode: "Remote", level: "Senior Level", posted: "3 hours ago", postedHours: 3, match: 84, skills: ["Node.js", "Python", "SQL", "Golang", "Distributed systems", "Webhooks"] },
  { title: "Senior Software Engineer - Backend", company: "Blockparty", color: "#15803D", industry: "Information Technology · Public Company", tagline: "Neighbourhood network for local news and listings", location: "United States", country: "United States", mode: "Remote", level: "Senior Level", salary: "$165K – $250K/yr", salaryK: 165, posted: "3 days ago", postedHours: 72, match: 96, skills: ["Python", "AWS", "Kubernetes", "SQL"] },
  { title: "Software Engineer (Senior/Staff)", company: "Silverline Care", color: "#0284C7", industry: "Healthcare · Late Stage", tagline: "Virtual wellness care for older adults", location: "United States", country: "United States", mode: "Remote", level: "Lead/Staff", salary: "$150K – $270K/yr", salaryK: 150, posted: "4 days ago", postedHours: 96, match: 96, skills: ["TypeScript", "React", "Node.js", "AWS"] },
  { title: "Software Engineer", company: "Cloudnest", color: "#4F46E5", industry: "Artificial Intelligence (AI) · Growth Stage", tagline: "Managed GPU cloud for model training", location: "Austin, TX", country: "United States", mode: "Hybrid", level: "Mid Level", salary: "$140K – $190K/yr", salaryK: 140, posted: "12 hours ago", postedHours: 12, match: 77, skills: ["Python", "Golang", "Kubernetes"] },
  { title: "Backend Engineer", company: "Payloop", color: "#DB2777", industry: "Financial Services · Early Stage", tagline: "Payouts infrastructure for marketplaces", location: "Bengaluru, KA", country: "India", mode: "Hybrid", level: "Mid Level", salary: "₹30L – ₹45L/yr", salaryK: 36, posted: "1 day ago", postedHours: 24, match: 69, skills: ["Java", "SQL", "Kafka", "AWS"] },
  { title: "Engineering Manager, Platform", company: "Civic Bank", color: "#1E3A8A", industry: "Financial Services · Public Company", tagline: "Digital banking for everyone", location: "Mumbai, MH", country: "India", mode: "Onsite", level: "Lead/Staff", salary: "₹60L – ₹85L/yr", salaryK: 72, posted: "3 days ago", postedHours: 72, match: 52, skills: ["Java", "Leadership", "AWS"] },
];

const expFor = (level: string) => ({ "Intern/New Grad": 0, "Entry Level": 1, "Mid Level": 3, "Senior Level": 5, "Lead/Staff": 7, "Director/Executive": 10 } as Record<string, number>)[level] ?? 0;

export const jobs: Job[] = seeds.map((s, i) => {
  const [industryName, stage] = s.industry.split(" · ");
  const slug = s.company.toLowerCase().replace(/\W+/g, "");
  const expMin = expFor(s.level);
  return {
    ...s,
    id: String(i + 1),
    industryName, stage,
    initials: s.company.split(" ").map((w) => w[0]).join("").slice(0, 2),
    type: i === 7 ? "Contract" : "Full-time",
    expMin,
    exp: `${expMin}+ years exp`,
    applicants: i % 3 === 1 ? "< 25 applicants" : "25+ applicants",
    breakdown: { experience: Math.min(100, s.match + 12), skills: Math.max(20, s.match - 15), industry: Math.max(20, s.match - 10) },
    reasons: [
      `Your recent work lines up with the core of this role at ${s.company}.`,
      `Skills overlap: ${s.skills.slice(0, 3).join(", ")}.`,
      `Check the seniority: the role asks for ${expMin}+ years.`,
    ],
    summary: `${s.company} is hiring a ${s.title} to build and improve its products and work closely with product and engineering teams.`,
    tags: [industryName, stage],
    responsibilities: [
      "Partner with product and engineering to scope and ship improvements",
      "Own a problem area end to end, from discovery to measurement",
      "Write clear documentation and share progress every week",
      "Help the team raise quality, reliability and speed",
    ],
    requirements: [`${expMin}+ years of relevant experience`, `Hands-on with ${s.skills.slice(0, 2).join(" and ")}`, "Clear written and spoken communication"],
    preferred: [`Experience with ${s.skills.slice(2).join(", ") || "related tools"}`, `Background in ${industryName.toLowerCase()}`],
    benefits: ["Health insurance for you and family", "Flexible hours", "Learning budget", "Annual team offsite"],
    h1b: s.country === "United States" && i % 2 === 1,
    citizenOnly: i === 8,
    clearance: false,
    staffing: i === 3,
    growth: i % 2 === 0,
    companyAbout: s.tagline + ".",
    size: ["51-200", "201-500", "1,001-5,000", "10,000+"][i % 4],
    founded: 2008 + (i % 12),
    hq: s.location,
    website: `https://www.${slug}.example`,
    badges: [i % 2 ? "Early applicant" : "1 former colleague"],
    applyUrl: `https://careers.${slug}.example/jobs/${i + 1}`,
    funding: {
      stage, total: `$${(12 + i * 7.3).toFixed(1)}M`, investors: ["Northgate Capital", "Foundry Partners"],
      events: [{ date: "2025-12-05", label: "Series B · $18M" }, { date: "2023-04-14", label: "Series A · $6M" }],
    },
    leaders: [{ name: "Ananya Rao", title: "Chief Executive Officer" }, { name: "David Kim", title: "Head of Engineering" }],
    news: [
      { source: `${s.company} Blog`, title: `${s.company} announces a new product line`, date: "2026-10-13" },
      { source: "Business Wire", title: `${s.company} expands its team`, date: "2026-09-30" },
    ],
  };
});

export const getJob = (id: string) => jobs.find((j) => j.id === id);
