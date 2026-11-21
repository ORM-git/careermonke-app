// Resumes, interview bank, coaching and plans in one file: each is a few lines.
export type Resume = { id: string; name: string; target: string; modified: string; created: string; primary: boolean };
export const resumes: Resume[] = [
  { id: "r1", name: "aarav-resume-2026.pdf", target: "Business Analyst", modified: "2 months ago", created: "2 months ago", primary: true },
];

export const companies = [
  { name: "Flipkart", group: "Top Tech", questions: 412, updated: "2d ago", locked: false },
  { name: "Swiggy", group: "Top Tech", questions: 233, updated: "1wk ago", locked: true },
  { name: "Zomato", group: "Top Tech", questions: 198, updated: "3d ago", locked: true },
  { name: "Razorpay", group: "Top Tech", questions: 176, updated: "1d ago", locked: true },
  { name: "Infosys", group: "Services", questions: 520, updated: "4d ago", locked: true },
  { name: "TCS", group: "Services", questions: 488, updated: "1wk ago", locked: true },
  { name: "Accenture", group: "Services", questions: 301, updated: "2wk ago", locked: true },
  { name: "Deloitte", group: "Consulting", questions: 145, updated: "6d ago", locked: true },
  { name: "Zerodha", group: "Fintech", questions: 92, updated: "3wk ago", locked: true },
  { name: "PhonePe", group: "Fintech", questions: 167, updated: "5d ago", locked: true },
];
export const categories = ["All", "Coding", "System Design", "Behavioral", "Case Study", "SQL"];
export const sampleQuestions = [
  { q: "Walk me through a time you changed a stakeholder's mind with data.", cat: "Behavioral" },
  { q: "Design a dashboard to track delivery delays across 50 cities.", cat: "Case Study" },
  { q: "Write a SQL query for the 2nd highest order value per customer.", cat: "SQL" },
  { q: "How would you size the market for 10-minute grocery delivery?", cat: "Case Study" },
  { q: "Explain a project where requirements changed mid-way.", cat: "Behavioral" },
  { q: "Find duplicate transactions within a 5-minute window.", cat: "Coding" },
];

export const situations = [
  { title: "I'm looking for my first job", text: "Build a strong resume, LinkedIn profile and a plan that gets interviews." },
  { title: "I'm switching careers", text: "Reframe past experience so recruiters see the fit for your new field." },
  { title: "I have an interview coming up", text: "Practise real questions with a recruiter and walk in prepared." },
];
export const coachSteps = [
  { title: "Tell us your goal", text: "Pick your situation and share your resume." },
  { title: "Meet your coach", text: "A senior recruiter reviews your profile in a 1:1 call." },
  { title: "Fix it together", text: "Leave with a concrete plan and updated materials." },
];

// Same plans and prices as Carrier-hound's src/config/plans.
export const plans = [
  { id: "weekly", name: "Weekly", price: 399, days: 7 },
  { id: "monthly", name: "Monthly", price: 499, days: 30 },
  { id: "quarterly", name: "Quarterly", price: 2199, days: 90 },
];
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
