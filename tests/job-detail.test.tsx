import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppStateProvider } from "@/components/app-state";
import { Toaster } from "@/components/toast";
import { JobDetail } from "@/components/jobs/job-detail";
import { jobs } from "@/mocks/jobs";

const job = jobs[8];
const appState = () => JSON.parse(localStorage.getItem("cm-dummy-state") || "{}");

beforeEach(() => { localStorage.setItem("cm_cover_tour_done", "1"); });
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

  it("Apply opens the employer URL safely and 'No' records nothing", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderDetail();
    await userEvent.click(screen.getByRole("button", { name: /APPLY/ }));
    expect(open).toHaveBeenCalledWith(job.applyUrl, "_blank", "noopener,noreferrer");
    expect(screen.queryByRole("dialog", { name: "Did you apply?" })).not.toBeInTheDocument();
    act(() => { window.dispatchEvent(new Event("focus")); });
    await userEvent.click(within(screen.getByRole("dialog", { name: "Did you apply?" })).getByRole("button", { name: /No, I didn/ }));
    expect(appState().applied ?? []).toHaveLength(0);
  });

  it("closing 'Did you apply?' records nothing; 'Yes' records one application", async () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    renderDetail();
    await userEvent.click(screen.getByRole("button", { name: /APPLY/ }));
    act(() => { window.dispatchEvent(new Event("focus")); });
    await userEvent.click(within(screen.getByRole("dialog", { name: "Did you apply?" })).getByRole("button", { name: "Close" }));
    expect(appState().applied ?? []).toHaveLength(0);

    await userEvent.click(screen.getByRole("button", { name: /APPLY/ }));
    act(() => { window.dispatchEvent(new Event("focus")); });
    await userEvent.click(screen.getByRole("button", { name: "Yes, I applied!" }));
    expect(appState().applied).toEqual([expect.objectContaining({ id: job.id, status: "Applied" })]);
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
    localStorage.removeItem("cm_cover_tour_done");
    renderDetail();
    const tip = screen.getByRole("dialog", { name: "Stand Out Among Applicants" });
    await userEvent.click(within(tip).getByRole("button", { name: "EXIT" }));
    expect(localStorage.getItem("cm_cover_tour_done")).toBe("1");
  });
});
