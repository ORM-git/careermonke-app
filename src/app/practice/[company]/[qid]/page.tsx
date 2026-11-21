import { companies, questionsFor } from "@/mocks/interview";
import PracticeView from "./view";

// Only readable questions get a practice page; locked ones link to pricing.
export const generateStaticParams = () =>
  companies.flatMap((c) => questionsFor(c.slug).filter((q) => !q.locked).map((q) => ({ company: c.slug, qid: q.id })));

export default function PracticePage() {
  return <PracticeView />;
}
