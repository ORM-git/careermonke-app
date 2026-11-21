import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoStore } from "@/lib/demo";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppStateProvider, SEEDED_APPLICATION } from "@/components/app-state";
import { JobsView, isJobUrl } from "@/components/jobs/jobs-view";
import { blankFilter, countMatches, filterFromOnboarding, matches, readSaved, relatedJobs } from "@/mocks/filters";
import { jobs } from "@/mocks/jobs";
import { countries, jobFunctions, KEYS } from "@/mocks/onboarding";

const setPrefs = (jobFunction: string, location: string) => demoStore.setItem(KEYS.prefs, JSON.stringify({ jobFunction, location, jobTypes: ["Full-time"] }));
beforeEach(() => { setPrefs("Analyst", "India"); history.replaceState(null, "", "/jobs"); });

async function renderFeed() {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  render(<AppStateProvider><JobsView /></AppStateProvider>);
  await act(async () => { vi.advanceTimersByTime(400); });
  vi.useRealTimers();
}
const titles = () => screen.getAllByRole("link").filter((a) => a.getAttribute("href")?.startsWith("/jobs/")).map((a) => a.textContent);

describe("fixtures and filters agree", () => {
  it("every onboarding role has India and United States sample jobs", () => {
    for (const fn of jobFunctions) {
      for (const country of ["India", "United States"]) {
        expect(countMatches({ ...blankFilter(), jobFunctions: [fn], country }), `${fn} in ${country}`).toBeGreaterThan(0);
      }
    }
  });
  it("every listed location has at least one sample job; Remote (anywhere) means remote jobs", () => {
    for (const c of countries.filter((x) => x !== "Remote (anywhere)")) expect(jobs.some((j) => j.country === c), c).toBe(true);
    setPrefs("Software Engineer", "Remote (anywhere)");
    const f = filterFromOnboarding();
    expect(f.workModels).toEqual(["Remote"]);
    expect(jobs.filter((j) => matches(j, f)).every((j) => j.mode === "Remote")).toBe(true);
  });
  it("Software Engineer + India keeps the user's choice and has senior matches for the welcome default", () => {
    setPrefs("Software Engineer", "India");
    const f = filterFromOnboarding();
    expect(f.title).toBe("Software Engineer, India");
    const hits = jobs.filter((j) => matches(j, f));
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((j) => j.country === "India" && /software engineer/i.test(j.title))).toBe(true);
    expect(countMatches({ ...f, levels: ["Senior Level"] })).toBeGreaterThan(0);
  });
  it("job function, exclusions and stage narrow the results", () => {
    const f = { ...blankFilter(), jobFunctions: ["Analyst"], country: "India" };
    const n = countMatches(f);
    expect(countMatches({ ...f, excludedTitles: ["Business"] })).toBeLessThan(n);
    expect(jobs.filter((j) => matches(j, { ...f, stages: ["Public Company"] })).every((j) => j.stage === "Public Company")).toBe(true);
  });
  it("related jobs for an impossible combination share the job function and are never counted as exact", () => {
    const f = { ...blankFilter(), jobFunctions: ["Product Designer"], country: "Japan" };
    expect(countMatches(f)).toBe(0);
    expect(relatedJobs(f).every((j) => /product designer/i.test(j.title))).toBe(true);
  });
  it("first saved filter comes from onboarding", () => {
    expect(readSaved()[0].filter.title).toBe("Analyst, India");
  });
  it("external URLs must be real http(s) links", () => {
    expect(isJobUrl("not a url")).toBe(false);
    expect(isJobUrl("https://jobs.example.com/123")).toBe(true);
  });
});

describe("Jobs feed", () => {
  it("shows a skeleton first, then cards from the saved filter", async () => {
    render(<AppStateProvider><JobsView /></AppStateProvider>);
    expect(await screen.findByTestId("feed-loading")).toBeInTheDocument();
    expect((await screen.findAllByText("Data Analyst", {}, { timeout: 2000 })).length).toBeGreaterThan(0);
  });

  it("card visa line agrees with the job's H1B data", async () => {
    setPrefs("Software Engineer", "United States");
    await renderFeed();
    expect(screen.queryByText(/Visa support likely/)).not.toBeInTheDocument();
    const shown = jobs.filter((j) => matches(j, readSaved()[0].filter));
    if (shown.some((j) => j.h1b)) expect(screen.getAllByText("✓ H1B sponsor likely").length).toBe(shown.filter((j) => j.h1b).length);
  });

  it("Top Matched reorders by match and writes the sort to the URL", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: /^Recommended/ }));
    await userEvent.click(screen.getByRole("button", { name: "Top Matched" }));
    expect(location.search).toContain("sort=Top+Matched");
    await screen.findAllByText("Data Analyst", {}, { timeout: 2000 });
    const best = jobs.filter((j) => matches(j, readSaved()[0].filter)).sort((a, b) => b.match - a.match)[0];
    expect(titles()[0]).toBe(best.title);
  });

  it("Date Posted is single choice (radio); Job Type is multi choice (checkbox)", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: "Date Posted" }));
    const date = screen.getByRole("dialog", { name: "Date Posted filter" });
    await userEvent.click(within(date).getByLabelText("Past 24 hours"));
    await userEvent.click(within(date).getByLabelText("Past week"));
    expect(within(date).getByLabelText("Past 24 hours")).not.toBeChecked();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Full-time" }));
    const type = screen.getByRole("dialog", { name: "Full-time filter" });
    await userEvent.click(within(type).getByLabelText("Contract"));
    expect(within(type).getByLabelText("Full-time")).toBeChecked();
    expect(within(type).getByLabelText("Contract")).toBeChecked();
  });

  it("closing a popover without Confirm discards; Confirm applies", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: "Date Posted" }));
    await userEvent.click(within(screen.getByRole("dialog", { name: "Date Posted filter" })).getByLabelText("Past 24 hours"));
    await userEvent.keyboard("{Escape}");
    expect(readSaved()[0].filter.datePosted).toBe("");
    await userEvent.click(screen.getByRole("button", { name: "Date Posted" }));
    const date = screen.getByRole("dialog", { name: "Date Posted filter" });
    await userEvent.click(within(date).getByLabelText("Past 24 hours"));
    await userEvent.click(within(date).getByRole("button", { name: "Confirm" }));
    expect(readSaved()[0].filter.datePosted).toBe("24h");
  });

  it("an empty result is honest: reset plus labelled related jobs", async () => {
    setPrefs("Product Designer", "Japan");
    await renderFeed();
    expect(screen.getByText("No sample jobs match every filter you set.")).toBeInTheDocument();
    expect(screen.getByText(/not exact matches for your filters/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(readSaved()[0].filter.country).toBe("");
  });

  it("Hidden Jobs is unlocked for the demo and filters the feed", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: /Hidden Jobs/ }));
    expect(readSaved()[0].filter.hiddenJobs).toBe(true);
    expect(screen.queryByRole("dialog", { name: /Unlock/ })).not.toBeInTheDocument();
  });
});

describe("All Filters / saved filters", () => {
  it("Intern/New Grad reveals start and graduation fields, usable in the demo", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: /All Filters/ }));
    const d = screen.getByRole("dialog", { name: "All filters" });
    expect(within(d).queryByLabelText("Graduation year")).not.toBeInTheDocument();
    await userEvent.click(within(d).getByLabelText("Intern/New Grad"));
    expect(within(d).getByLabelText("Graduation year")).toBeEnabled();
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

  it("adding a filter is unlocked: it creates a copy and opens it for editing", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: "Add saved filter" }));
    const d = screen.getByRole("dialog", { name: "All filters" });
    const name = within(d).getByLabelText("Filter name");
    await userEvent.clear(name);
    await userEvent.type(name, "Analyst roles");
    await userEvent.click(within(d).getByRole("button", { name: /^Confirm/ }));
    expect(readSaved().map((s) => s.filter.title)).toEqual(["Analyst, India", "Analyst roles"]);
  });

  it("Delete needs confirmation", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("button", { name: "Edit Analyst, India" }));
    await userEvent.click(within(screen.getByRole("dialog", { name: "All filters" })).getAllByRole("button", { name: /Delete/ })[0]);
    await userEvent.click(within(screen.getByRole("dialog", { name: "Delete this saved filter?" })).getByRole("button", { name: "Cancel" }));
    expect(readSaved()).toHaveLength(1);
  });
});

describe("Trackers and checklist", () => {
  it("every visit starts with one labelled sample application; stage counts stay consistent", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("tab", { name: /^Applied/ }));
    await userEvent.click(screen.getByRole("tab", { name: "Interviewing(1)" }));
    expect(screen.getByText(/Sample application/)).toBeInTheDocument();
    for (const stage of ["Offer Received", "Rejected", "Archived", "Applied"]) {
      await userEvent.selectOptions(screen.getByLabelText("Status"), stage);
      await userEvent.click(screen.getByRole("tab", { name: `${stage}(1)` }));
      const counts = ["Applied", "Interviewing", "Offer Received", "Rejected", "Archived"]
        .map((s) => Number(screen.getByRole("tab", { name: new RegExp(`^${s}\\(\\d+\\)$`) }).textContent!.match(/\((\d+)\)/)![1]));
      expect(counts.reduce((a, b) => a + b)).toBe(1);
    }
    expect(SEEDED_APPLICATION.sample).toBe(true);
  });

  it("External shows an error for a bad URL", async () => {
    await renderFeed();
    await userEvent.click(screen.getByRole("tab", { name: /External/ }));
    await userEvent.click(screen.getByRole("button", { name: /Add Job/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("Oops! Please enter a proper job posting URL.");
  });

  it("Already Applied adds the job once (no duplicate rows)", async () => {
    await renderFeed();
    await userEvent.click(screen.getAllByRole("button", { name: "More options" })[0]);
    await userEvent.click(screen.getByRole("menuitem", { name: "Already Applied" }));
    expect(screen.getAllByRole("tab", { name: /^Applied/ })[0]).toHaveTextContent("2");
    const state = () => JSON.parse(demoStore.getItem("cm-dummy-state")!).applied as { id: string }[];
    expect(new Set(state().map((a) => a.id)).size).toBe(state().length);
  });

  it("autofill checklist item completes only after the demo fill ran, can be undone, and resets next visit", async () => {
    await renderFeed();
    const bar = () => screen.getByRole("progressbar", { name: "Checklist progress" });
    expect(bar()).toHaveAttribute("aria-valuenow", "0");
    await userEvent.click(screen.getByText("2. Enable Autofill Extension"));
    await userEvent.click(screen.getByRole("button", { name: "Try the Autofill demo" }));
    await userEvent.click(screen.getByRole("button", { name: "Yes, Show Me Autofill" }));
    expect(screen.getByText(/Simulated employer form/)).toBeInTheDocument();
    await screen.findByText(/Autofill complete/, {}, { timeout: 4000 });
    await userEvent.click(screen.getByRole("button", { name: "Back to CareerMonke" }));
    expect(bar()).toHaveAttribute("aria-valuenow", "50");
    await userEvent.click(screen.getByRole("button", { name: "Mark as not done" }));
    expect(bar()).toHaveAttribute("aria-valuenow", "0");
    demoStore.setItem("cm_checklist_autofill", "1");
    demoStore.clear(); // what a reload does: the module store starts empty
    expect(demoStore.getItem("cm_checklist_autofill")).toBeNull();
  });
});
