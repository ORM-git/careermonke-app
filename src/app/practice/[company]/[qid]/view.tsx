"use client";

import { notFound, useParams } from "next/navigation";
import { PracticeMode } from "@/components/interview/practice-mode";
import { getCompany } from "@/mocks/interview";
import { useDemoGate } from "@/components/demo-gate";
import { GuideBar } from "@/components/guide";

export default function PracticeView() {
  const { company, qid } = useParams<{ company: string; qid: string }>();
  // Practice mode sits outside the app shell, so it runs the same demo gate.
  const ok = useDemoGate();
  const c = getCompany(company);
  if (!c) notFound();
  if (!ok) return null;
  return <><PracticeMode key={qid} company={c} questionId={qid} /><GuideBar dark /></>;
}
