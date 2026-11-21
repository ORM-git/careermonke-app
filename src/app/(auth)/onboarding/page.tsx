"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Client-side redirect: a server redirect() doesn't work in the static export.
export default function OnboardingIndex() {
  const router = useRouter();
  useEffect(() => router.replace("/onboarding/role"), [router]);
  return null;
}
