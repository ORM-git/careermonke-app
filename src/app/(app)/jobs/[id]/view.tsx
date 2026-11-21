"use client";

import { notFound, useParams } from "next/navigation";
import { JobDetail } from "@/components/jobs/job-detail";
import { getJob } from "@/mocks/jobs";

export default function JobDetailView() {
  const { id } = useParams<{ id: string }>();
  const job = getJob(id);
  if (!job) notFound();
  return <JobDetail key={job.id} job={job} />;
}
