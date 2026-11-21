"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { PracticeMode } from "@/components/interview/practice-mode";
import { getCompany } from "@/mocks/interview";

export default function PracticeView() {
  const { company, qid } = useParams<{ company: string; qid: string }>();
  const router = useRouter();
  const [ok, setOk] = useState(false);
  // Practice mode sits outside the app shell, so it repeats the mock session check.
  useEffect(() => { if (localStorage.getItem("cm-session")) setOk(true); else router.replace("/signin"); }, [router]);
  const c = getCompany(company);
  if (!c) notFound();
  if (!ok) return null;
  return <PracticeMode key={qid} company={c} questionId={qid} />;
}
