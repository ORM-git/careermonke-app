import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppStateProvider } from "@/components/app-state";
import { JobsView, isJobUrl } from "@/components/jobs/jobs-view";
import { blankFilter, countMatches, matches, readSaved } from "@/mocks/filters";
import { jobs } from "@/mocks/jobs";
import { KEYS } from "@/mocks/onboarding";

beforeEach(() => {
  // Skip first-visit popups so tests see the plain feed.
  localStorage.setItem(KEYS.autofill, "1");
  localStorage.setItem(KEYS.prefs, JSON.stringify({ jobFunction: "Analyst", location: "India", jobTypes: ["Full-time"] }));
  history.replaceState(null, "", "/jobs");
});

async function renderFeed() {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  render(<AppStateProvider><JobsView /></AppStateProvider>);
  await act(async () => { vi.advanceTimersByTime(400); });
  vi.useRealTimers();
}
const titles = () => screen.getAllByRole("link").filter((a) => a.getAttribute("href")?.startsWith("/jobs/")).map((a) => a.textContent);

describe("filter model", () => {
  it("job function, exclusions and stage narrow the results", () => {
    const f = { ...blankFilter(), jobFunctions: ["Analyst"], country: "India" };
    const n = countMatches(f);
    expect(n).toBeGreaterThan(0);
    expect(countMatches({ ...f, excludedTitles: ["Business"] })).toBeLessThan(n);
    expect(jobs.filter((j) => matches(j, { ...f, stages: ["Public Company"] })).every((j) => j.stage === "Public Company")).toBe(true);
  });
  it("first saved filter comes from onboarding", () => {
    expect(readSaved()[0].filter.title).toBe("Analyst, India");
  });
  it("external URLs must be real http(s) links", () => {
    expect(isJobUrl("")).toBe(false);
    expect(isJobUrl("not a url")).toBe(false);
    expect(isJobUrl("https://jobs.example.com/123")).toBe(true);
  });
});

describe("Jobs feed", () => {
  it("shows a skeleton first, then cards", async () => {
    render(<AppStateProvider><JobsView /></AppStateProvider>);
    expect(await screen.findByTestId("feed-loading")).toBeInTheDocument();
    expect(await screen.findByText("Data Analyst", {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it("Top Matched reorders by match and writes the sort to the URL", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: /^Recommended/ }));
    await userEvent.click(screen.getByRole("button", { name: "Top Matched" }));
    expect(location.search).toContain("sort=Top+Matched");
    await screen.findByText("Data Analyst", {}, { timeout: 2000 });
    expect(titles()[0]).toBe("Data Analyst"); // highest-match analyst job (81%)
  });

  it("Date Posted is single choice (radio); Job Type is multi choice (checkbox)", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: "Date Posted" }));
    const date = screen.getByRole("dialog", { name: "Date Posted filter" });
    await userEvent.click(within(date).getByLabelText("Past 24 hours"));
    await userEvent.click(within(date).getByLabelText("Past week"));
    expect(within(date).getByLabelText("Past 24 hours")).not.toBeChecked();
    expect(within(date).getByLabelText("Past week")).toBeChecked();
    await userEvent.keyboard("{Escape}");

    await userEvent.click(screen.getByRole("button", { name: "Full-time" }));
    const type = screen.getByRole("dialog", { name: "Full-time filter" });
    await userEvent.click(within(type).getByLabelText("Contract"));
    expect(within(type).getByLabelText("Full-time")).toBeChecked();
    expect(within(type).getByLabelText("Contract")).toBeChecked();
  });

  it("closing a popover without Confirm discards the draft", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: "Date Posted" }));
    await userEvent.click(within(screen.getByRole("dialog", { name: "Date Posted filter" })).getByLabelText("Past 24 hours"));
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Date Posted" })).toBeInTheDocument();
    expect(readSaved()[0].filter.datePosted).toBe("");
  });

  it("Confirm applies a popover and saves it", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: "Date Posted" }));
    const date = screen.getByRole("dialog", { name: "Date Posted filter" });
    await userEvent.click(within(date).getByLabelText("Past 24 hours"));
    await userEvent.click(within(date).getByRole("button", { name: "Confirm" }));
    expect(screen.getByRole("button", { name: "Past 24 hours" })).toBeInTheDocument();
    expect(readSaved()[0].filter.datePosted).toBe("24h");
  });

  it("Job Type cannot be confirmed empty", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: "Full-time" }));
    const type = screen.getByRole("dialog", { name: "Full-time filter" });
    await userEvent.click(within(type).getByLabelText("Full-time"));
    expect(within(type).getByRole("button", { name: "Confirm" })).toBeDisabled();
  });
});

describe("All Filters / saved filter", () => {
  it("Intern/New Grad reveals locked start and graduation fields", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: /All Filters/ }));
    const d = screen.getByRole("dialog", { name: "All filters" });
    expect(within(d).queryByLabelText("Graduation year")).not.toBeInTheDocument();
    await userEvent.click(within(d).getByLabelText("Intern/New Grad"));
    expect(within(d).getByLabelText("Graduation year")).toBeDisabled();
    expect(within(d).getByRole("button", { name: /Confirm \(\d+\)/ })).toBeInTheDocument();
  });

  it("closing a changed draft asks before discarding", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: /All Filters/ }));
    const d = screen.getByRole("dialog", { name: "All filters" });
    await userEvent.click(within(d).getByLabelText("Manager"));
    await userEvent.click(within(d).getByRole("button", { name: "Close" }));
    await userEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(readSaved()[0].filter.role).toBe("");
  });

  it("adding a filter is gated, but editing the existing one is free", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: "Add saved filter" }));
    expect(screen.getByRole("dialog", { name: "Track multiple job searches at once" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await userEvent.click(screen.getByRole("button", { name: "Edit Analyst, India" }));
    const d = screen.getByRole("dialog", { name: "All filters" });
    const name = within(d).getByLabelText("Filter name");
    await userEvent.clear(name);
    await userEvent.type(name, "Analyst roles");
    await userEvent.click(within(d).getByRole("button", { name: /^Confirm/ }));
    expect(readSaved()[0].filter.title).toBe("Analyst roles");
  });

  it("Delete needs confirmation", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: "Edit Analyst, India" }));
    await userEvent.click(within(screen.getByRole("dialog", { name: "All filters" })).getAllByRole("button", { name: /Delete/ })[0]);
    const confirm = screen.getByRole("dialog", { name: "Delete this saved filter?" });
    await userEvent.click(within(confirm).getByRole("button", { name: "Cancel" }));
    expect(readSaved()).toHaveLength(1);
  });
});

describe("Trackers and checklist", () => {
  it("Applied status tabs show counts and External validates URLs", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("tab", { name: /Applied/ }));
    expect(screen.getByRole("tab", { name: "Interviewing(0)" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /External/ }));
    await userEvent.click(screen.getByRole("button", { name: /Add Job/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("Oops! Please enter a proper job posting URL.");
  });

  it("Already Applied from the card menu moves a job into Applied", async () => {
    await renderFeed();
    await userEvent.click(screen.getAllByRole("button", { name: "More options" })[0]);
    await userEvent.click(screen.getByRole("menuitem", { name: "Already Applied" }));
    expect(screen.getByRole("tab", { name: /Applied/ })).toHaveTextContent("1");
  });

  it("checklist progress only moves on a real signal", async () => {
    await renderFeed();
    expect(screen.getByRole("progressbar", { name: "Checklist progress" })).toHaveAttribute("aria-valuenow", "0");
    await userEvent.click(screen.getByText("2. Enable Autofill Extension"));
    await userEvent.click(screen.getByRole("button", { name: "Enable Now" }));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByRole("progressbar", { name: "Checklist progress" })).toHaveAttribute("aria-valuenow", "0");
    await userEvent.click(screen.getByRole("button", { name: "I've installed" }));
    expect(screen.getByRole("progressbar", { name: "Checklist progress" })).toHaveAttribute("aria-valuenow", "50");
  });
});
