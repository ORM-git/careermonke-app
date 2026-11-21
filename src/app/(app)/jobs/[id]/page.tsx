import { jobs } from "@/mocks/jobs";
import JobDetailView from "./view";

// Pre-build one page per mock job so the static export (GitHub Pages) has them.
export const generateStaticParams = () => jobs.map((j) => ({ id: j.id }));

export default function JobDetailPage() {
  return <JobDetailView />;
}
