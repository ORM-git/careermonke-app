import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { demoStore, hasSession, requestedPath, startSession } from "@/lib/demo";
import { AuthCard } from "@/components/auth-card";
import { useDemoGate, useRestartDemo } from "@/components/demo-gate";
import { AppStateProvider } from "@/components/app-state";
import { JobsView } from "@/components/jobs/jobs-view";
import { GUIDE_STEPS } from "@/components/guide";
import { countMatches, readSaved } from "@/mocks/filters";
import { getJob, jobs } from "@/mocks/jobs";
import { companies, questionsFor } from "@/mocks/interview";
import { exploreSearch } from "@/mocks/explore";
import { KEYS } from "@/mocks/onboarding";
import CoachingPage from "@/app/(app)/coaching/page";
import AgentPage from "@/app/(app)/agent/page";

const router = () => useRouter() as unknown as { push: ReturnType<typeof vi.fn>; replace: ReturnType<typeof vi.fn> };
beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); history.replaceState(null, "", "/"); });

function Gate() { const ok = useDemoGate(); return <p>{ok ? "app" : "gated"}</p>; }

describe("walkthrough entry", () => {
  it("both sign-in and sign-up demo buttons lead to onboarding, not straight to jobs", async () => {
    for (const mode of ["signin", "signup"] as const) {
      demoStore.clear(); vi.clearAllMocks();
      const { unmount } = render(<AuthCard initial={mode} />);
      await userEvent.click(screen.getByRole("button", { name: /with Google/ }));
      expect(router().push).toHaveBeenCalledWith("/onboarding/role");
      expect(hasSession()).toBe(true);
      unmount();
    }
  });

  it("fresh entry to a deep link starts onboarding and remembers the page", () => {
    history.replaceState(null, "", "/?sort=Top+Matched");
    render(<Gate />);
    expect(router().replace).toHaveBeenCalledWith("/onboarding/role");
    expect(requestedPath()).toBe("/?sort=Top+Matched");
    expect(screen.getByText("gated")).toBeInTheDocument();
  });

  it("once onboarding started in this visit, internal navigation does not restart it (no loop)", () => {
    startSession();
    render(<Gate />);
    expect(router().replace).not.toHaveBeenCalled();
    expect(screen.getByText("app")).toBeInTheDocument();
  });

  it("old persistent seen-flags in localStorage do not suppress the welcome on a new visit", async () => {
    for (const k of Object.values(KEYS)) localStorage.setItem(k, "1");
    localStorage.setItem("cm-session", "demo");
    expect(hasSession()).toBe(false); // the demo session is visit-scoped, not read from localStorage
    history.replaceState(null, "", "/jobs?welcome=1");
    render(<AppStateProvider><JobsView /></AppStateProvider>);
    expect(await screen.findByRole("dialog", { name: "We found roles that fit you" })).toBeInTheDocument();
  });

  it("Restart Demo clears only this demo's state", async () => {
    startSession(); demoStore.setItem(KEYS.welcome, "1"); localStorage.setItem("unrelated", "keep");
    function R() { const restart = useRestartDemo(); return <button onClick={restart}>restart</button>; }
    render(<R />);
    await userEvent.click(screen.getByRole("button", { name: "restart" }));
    expect(hasSession()).toBe(false);
    expect(demoStore.getItem(KEYS.welcome)).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe("keep");
    expect(router().push).toHaveBeenCalledWith("/onboarding/role");
  });
});

describe("welcome confirmation", () => {
  it("count comes from the feed's filter and confirm keeps the base path and other params", async () => {
    demoStore.setItem(KEYS.prefs, JSON.stringify({ jobFunction: "Software Engineer", location: "India", jobTypes: ["Full-time"] }));
    history.replaceState(null, "", "/careermonke-app/jobs?welcome=1&sort=Top+Matched");
    render(<AppStateProvider><JobsView /></AppStateProvider>);
    const dialog = await screen.findByRole("dialog", { name: "We found roles that fit you" });
    const f = readSaved()[0].filter;
    const expected = countMatches({ ...f, levels: ["Senior Level"], jobFunctions: [...f.jobFunctions, "Backend Engineer"] });
    expect(expected).toBeGreaterThan(0);
    expect(within(dialog).getByText(`${expected} sample roles`)).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent("1,842");
    await userEvent.click(within(dialog).getByRole("button", { name: "Confirm & See Jobs" }));
    expect(location.pathname).toBe("/careermonke-app/jobs");
    expect(location.search).toBe("?sort=Top+Matched");
  });
});

describe("unlocked demo features", () => {
  it("Coaching: Meet My Coach opens a demo-only flow and keeps the chosen goal for the visit", async () => {
    render(<CoachingPage />);
    await userEvent.click(screen.getAllByRole("button", { name: /Meet My Coach/ })[1]);
    const flow = screen.getByRole("dialog", { name: "Meet your coach" });
    expect(flow).toHaveTextContent("Demo only");
    await userEvent.click(within(flow).getByRole("button", { name: "Next" }));
    expect(within(flow).getByLabelText(/switching careers/i)).toBeChecked();
    await userEvent.click(within(flow).getByRole("button", { name: "Next" }));
    await userEvent.click(within(flow).getByRole("button", { name: "Next" }));
    expect(within(flow).getByRole("button", { name: "Next" })).toBeDisabled(); // a time slot is required
    await userEvent.click(within(flow).getByLabelText("Tue 11:00"));
    await userEvent.click(within(flow).getByRole("button", { name: "Next" }));
    await userEvent.click(within(flow).getByRole("button", { name: /Confirm demo session/ }));
    expect(within(flow).getByRole("status")).toHaveTextContent("nothing was scheduled");
    expect(demoStore.getItem("cm-coach-goal")).toBe("1");
  });

  it("Agent: no upgrade wall; start runs a local simulation with applied and failed samples", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<AgentPage />);
    expect(screen.queryByText("Upgrade to Pro")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Start Agent/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Running (simulated)");
    await act(async () => { vi.advanceTimersByTime(1200 * 10); });
    expect(screen.getAllByText("Applied (simulated)").length).toBeGreaterThan(0);
    expect(screen.getByText("Failed")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Pause Agent/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Paused");
    vi.useRealTimers();
  });

  it("Explore: the data-analyst example returns data analysts from the last 24 hours, ranked by match", () => {
    const r = exploreSearch("Data analyst roles posted in the last 24 hours");
    expect(r.jobs.length).toBeGreaterThan(0);
    expect(r.jobs.every((j) => /data analyst/i.test(j.title) && j.postedHours <= 24)).toBe(true);
    expect(r.jobs.map((j) => j.match)).toEqual([...r.jobs.map((j) => j.match)].sort((a, b) => b - a));
    expect(exploreSearch("Remote product jobs in fintech").jobs.every((j) => j.mode === "Remote" && j.industryName === "Financial Services")).toBe(true);
  });

  it("Interview: every company shows only readable questions", () => {
    for (const c of companies) expect(questionsFor(c.slug).every((q) => !q.locked && q.statement)).toBe(true);
  });
});

describe("guided steps and safety", () => {
  it("every guided step points at a page that exists in the static export", () => {
    for (const s of GUIDE_STEPS) {
      const p = s.path();
      const ok = ["/jobs", "/resume", "/profile", "/explore", "/agent", "/coaching"].includes(p)
        || (/^\/jobs\/[^/]+$/.test(p) && !!getJob(p.split("/")[2]))
        || (/^\/interview\/[^/]+$/.test(p) && companies.some((c) => c.slug === p.split("/")[2]))
        || (/^\/practice\/[^/]+\/[^/]+$/.test(p) && questionsFor(p.split("/")[2]).some((q) => q.id === p.split("/")[3]));
      expect(ok, `${s.title}: ${p}`).toBe(true);
      expect(p.startsWith("/careermonke-app"), "router paths must not repeat the base path").toBe(false);
    }
  });

  it("no fixture links to a dead external application page", () => {
    expect(jobs.every((j) => !("applyUrl" in j))).toBe(true);
    expect(jobs.every((j) => !/^https?:/.test(j.website))).toBe(true);
  });

  it("apply, autofill and coaching flows make no network, mail or window.open calls", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const openSpy = vi.spyOn(window, "open");
    const xhr = vi.spyOn(XMLHttpRequest.prototype, "open");
    startSession();
    demoStore.setItem(KEYS.prefs, JSON.stringify({ jobFunction: "Analyst", location: "India", jobTypes: ["Full-time"] }));
    history.replaceState(null, "", "/jobs");
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<AppStateProvider><JobsView /></AppStateProvider>);
    await act(async () => { vi.advanceTimersByTime(400); });
    vi.useRealTimers();
    await userEvent.click(screen.getAllByRole("button", { name: /APPLY/ })[0]);
    await userEvent.click(screen.getByRole("button", { name: "Back to CareerMonke" }));
    await userEvent.click(screen.getByRole("button", { name: "Yes, I applied!" }));
    const { unmount } = render(<CoachingPage />);
    await userEvent.click(screen.getAllByRole("button", { name: /Meet My Coach/ })[0]);
    unmount();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(xhr).not.toHaveBeenCalled();
  });
});
