import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { demoStore } from "@/lib/demo";
import { AppStateProvider } from "@/components/app-state";
import { JobsView } from "@/components/jobs/jobs-view";
import { JobDetail } from "@/components/jobs/job-detail";
import { JobCard } from "@/components/job-card";
import { Toaster } from "@/components/toast";
import { jobs } from "@/mocks/jobs";
import { KEYS } from "@/mocks/onboarding";

beforeEach(() => {
  vi.clearAllMocks();
  demoStore.setItem(KEYS.prefs, JSON.stringify({ jobFunction: "Software Engineer", location: "India", jobTypes: ["Full-time"] }));
  history.replaceState(null, "", "/jobs");
});

async function renderFeed() {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  render(<AppStateProvider><JobsView /></AppStateProvider>);
  await act(async () => { vi.advanceTimersByTime(400); });
  vi.useRealTimers();
}
const cardTitles = () => screen.getAllByRole("link").filter((a) => a.getAttribute("href")?.startsWith("/jobs/")).map((a) => a.textContent);

describe("mobile jobs feed", () => {
  it("keeps one tablist: on phones it is pinned as a full-width strip, and the selected tab is scrolled into view", async () => {
    await renderFeed();
    const tablist = screen.getByRole("tab", { name: "Recommended" }).closest('[role="tablist"]')!;
    expect(screen.getAllByRole("tab", { name: /^(Recommended|Liked|Applied|External)/ })).toHaveLength(4);
    expect(tablist.parentElement).toHaveClass("max-md:fixed", "max-md:inset-x-0", "max-md:top-16");
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    await userEvent.click(screen.getByRole("tab", { name: /^External/ }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(location.search).toBe("?tab=external");
  });

  it("the phone search field filters the feed and is written to the URL", async () => {
    await renderFeed();
    const all = cardTitles();
    const phoneSearch = screen.getAllByLabelText("Search jobs").find((el) => el.closest("label")?.className.includes("md:hidden"))!;
    expect(phoneSearch).toHaveClass("text-base"); // 16px: no iOS focus zoom
    const needle = "Senior";
    expect(all.some((t) => !t!.includes(needle))).toBe(true); // the search must actually narrow the feed
    await userEvent.type(phoneSearch, needle);
    expect(cardTitles().length).toBeGreaterThan(0);
    expect(cardTitles().every((t) => t!.includes(needle))).toBe(true);
    expect(new URLSearchParams(location.search).get("q")).toBe(needle);
  });

  it("a quick filter opens as a sheet with a reachable close control", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: /^Industry/ }));
    const sheet = screen.getByRole("dialog", { name: "Industry filter" });
    expect(sheet).toHaveClass("fixed", "bottom-0", "overflow-y-auto", "sm:absolute");
    await userEvent.click(within(sheet).getByRole("button", { name: "Close filter" }));
    expect(screen.queryByRole("dialog", { name: "Industry filter" })).toBeNull();
  });
});

describe("mobile job card", () => {
  it("shows the match score on phones and opens/hides the same breakdown", async () => {
    const job = jobs[0];
    render(<AppStateProvider><JobCard job={job} /></AppStateProvider>);
    // the desktop match column keeps its own accessible name
    expect(screen.getByRole("button", { name: new RegExp(`^${job.match}% match`) })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: `Match ${job.match}%, show breakdown` }));
    expect(screen.getByText("Why This Job Is A Match")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hide breakdown" }));
    expect(screen.queryByText("Why This Job Is A Match")).toBeNull();
  });
});

describe("mobile job detail", () => {
  it("keeps Back, Share and Report reachable on phones", () => {
    render(<AppStateProvider><JobDetail job={jobs[8]} /><Toaster /></AppStateProvider>);
    expect(screen.getByRole("link", { name: "Back to jobs" })).toHaveAttribute("href", "/jobs");
    const share = screen.getByRole("button", { name: "Share" });
    expect(share.parentElement).not.toHaveClass("hidden");
    expect(screen.getByRole("button", { name: "Report Issue" })).toBeInTheDocument();
  });
});
