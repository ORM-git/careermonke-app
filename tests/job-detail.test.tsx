import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoStore } from "@/lib/demo";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppStateProvider } from "@/components/app-state";
import { Toaster } from "@/components/toast";
import { JobDetail } from "@/components/jobs/job-detail";
import { jobs } from "@/mocks/jobs";

const job = jobs[8];
const appState = () => JSON.parse(demoStore.getItem("cm-dummy-state") || "{}");

beforeEach(() => { demoStore.setItem("cm_cover_tour_done", "1"); });
// This job has a low sample resume score, so Apply first offers the customize demo.
const clickApply = async () => { await userEvent.click(screen.getByRole("button", { name: /APPLY/ })); await userEvent.click(screen.getByRole("button", { name: "Apply Without Customizing" })); };
const renderDetail = () => render(<AppStateProvider><JobDetail job={job} /><Toaster /></AppStateProvider>);

describe("Job detail", () => {
  it("renders sections in order and Company scrolls to its anchor", async () => {
    renderDetail();
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings.indexOf(`Insider Connection @${job.company}`)).toBeLessThan(headings.indexOf("Responsibilities"));
    expect(headings.indexOf("Qualification")).toBeLessThan(headings.indexOf("Benefits"));
    expect(headings.at(-1)).toBe("Company");
    await userEvent.click(screen.getByRole("button", { name: "Company" }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Company" })).toHaveAttribute("aria-current", "true");
  });

  it("Share copies the link and shows a toast", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText: write }, configurable: true });
    renderDetail();
    await userEvent.click(screen.getByRole("button", { name: "Share" }));
    expect(write).toHaveBeenCalledWith(expect.stringContaining(`/jobs/${job.id}`));
    expect(await screen.findByText("Success! Link copied to clipboard.")).toBeInTheDocument();
  });

  it("Report needs a reason, and Cancel sends nothing", async () => {
    renderDetail();
    await userEvent.click(screen.getByRole("button", { name: "Report Issue" }));
    const dialog = screen.getByRole("dialog", { name: "Report this job" });
    expect(within(dialog).getByRole("button", { name: "Submit" })).toBeDisabled();
    await userEvent.click(within(dialog).getByLabelText("The posting date is wrong"));
    expect(within(dialog).getByRole("button", { name: "Submit" })).toBeEnabled();
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Report this job" })).not.toBeInTheDocument();
  });

  // Returning from the local simulated application always asks once; only Yes records it.
  const applyAndReturn = async () => {
    await clickApply();
    expect(screen.getByText(/Simulated employer form/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Back to CareerMonke" }));
    return screen.getByRole("dialog", { name: "Did you apply?" });
  };
  const mine = () => ((appState().applied ?? []) as { id: string; sample?: boolean }[]).filter((x) => !x.sample);

  it("Apply stays inside the demo (no window.open) and 'No' records nothing", async () => {
    const open = vi.spyOn(window, "open");
    renderDetail();
    const ask = await applyAndReturn();
    expect(open).not.toHaveBeenCalled();
    await userEvent.click(within(ask).getByRole("button", { name: /No, I didn/ }));
    expect(mine()).toHaveLength(0);
  });

  it("closing 'Did you apply?' records nothing; 'Yes' records exactly one application", async () => {
    renderDetail();
    await userEvent.click(within(await applyAndReturn()).getByRole("button", { name: "Close" }));
    expect(mine()).toHaveLength(0);
    await userEvent.click(within(await applyAndReturn()).getByRole("button", { name: "Yes, I applied!" }));
    expect(mine()).toEqual([expect.objectContaining({ id: job.id, status: "Applied" })]);
    expect(screen.getByRole("button", { name: "APPLIED" })).toBeInTheDocument();
  });

  it("has a Customize Resume action next to Apply that opens the 3-step flow for this job", async () => {
    renderDetail();
    await userEvent.click(screen.getByRole("button", { name: "Customize Resume" }));
    expect(screen.getByRole("dialog", { name: "Generate Your Custom Resume" })).toHaveTextContent(job.title);
  });

  it("the simulated form autofills from the sample profile and only simulates submission", async () => {
    renderDetail();
    await clickApply();
    await screen.findByText(/Autofill complete/, {}, { timeout: 4000 });
    expect(screen.getByLabelText("Email")).toHaveValue("aarav.demo@careermonke.com");
    await userEvent.click(screen.getByRole("button", { name: "Submit (simulated)" }));
    expect(screen.getByText("Simulated submission complete")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Return to CareerMonke" }));
    expect(screen.getByRole("dialog", { name: "Did you apply?" })).toBeInTheDocument();
  });

  it("match score and H1B status are the same data the card uses", () => {
    renderDetail();
    expect(screen.getByLabelText(`Match score ${job.match}%`)).toBeInTheDocument();
    expect(screen.getByText(job.h1b ? "H1B Sponsor Likely" : "No H1B")).toBeInTheDocument();
  });

  it("revealing an email asks before using a credit, and Cancel uses none", async () => {
    renderDetail();
    await userEvent.click(screen.getByRole("button", { name: "View" }));
    await userEvent.click(screen.getByRole("button", { name: "Reveal email" }));
    const confirm = screen.getByRole("dialog", { name: "Use 1 email credit?" });
    expect(confirm).toHaveTextContent("1 of your 2 credits");
    await userEvent.click(within(confirm).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Use 1 email credit?" })).not.toBeInTheDocument();
  });

  it("Find Any Email rejects non-LinkedIn URLs before asking for a credit", async () => {
    renderDetail();
    await userEvent.type(screen.getByLabelText("LinkedIn profile URL"), "https://example.com/me");
    await userEvent.click(screen.getByRole("button", { name: "Find any email" }));
    expect(screen.getByRole("alert")).toHaveTextContent("LinkedIn profile URL");
    expect(screen.queryByRole("dialog", { name: "Use 1 email credit?" })).not.toBeInTheDocument();
  });

  it("Analyze opens Monke, shows Thinking, then sectioned results", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderDetail();
    await userEvent.click(screen.getByRole("button", { name: /Analyze How Well You Fit/ }));
    const panel = screen.getByRole("complementary", { name: "Monke assistant" });
    expect(within(panel).getByRole("status")).toHaveTextContent("Thinking");
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(within(panel).getByText("Core Skills")).toBeInTheDocument();
    expect(within(panel).getByText("Seniority")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("cover letter coachmark shows once on first visit", async () => {
    demoStore.removeItem("cm_cover_tour_done");
    renderDetail();
    const tip = screen.getByRole("dialog", { name: "Stand Out Among Applicants" });
    await userEvent.click(within(tip).getByRole("button", { name: "EXIT" }));
    expect(demoStore.getItem("cm_cover_tour_done")).toBe("1");
  });
});
