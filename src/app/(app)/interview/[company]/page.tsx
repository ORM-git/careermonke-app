"use client";

import { notFound, useParams } from "next/navigation";
import { CompanyBrowser } from "@/components/interview/company-browser";
import { getCompany } from "@/mocks/interview";

export default function CompanyPage() {
  const { company } = useParams<{ company: string }>();
  const c = getCompany(company);
  if (!c) notFound();
  return <CompanyBrowser company={c} />;
}
