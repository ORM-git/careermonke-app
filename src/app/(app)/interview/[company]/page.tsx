import { companies } from "@/mocks/interview";
import CompanyView from "./view";

export const generateStaticParams = () => companies.map((c) => ({ company: c.slug }));

export default function CompanyPage() {
  return <CompanyView />;
}
