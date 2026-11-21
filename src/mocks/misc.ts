// Resumes, coaching and plans in one file: each is a few lines. Interview data lives in mocks/interview.ts.
export type Resume = { id: string; name: string; target: string; modified: string; created: string; primary: boolean };
export const resumes: Resume[] = [
  { id: "r1", name: "aarav-resume-2026.pdf", target: "Business Analyst", modified: "2 months ago", created: "2 months ago", primary: true },
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
