import { describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InterviewDirectory } from "@/components/interview/directory";
import { PracticeMode } from "@/components/interview/practice-mode";
import { getCompany, questionsFor } from "@/mocks/interview";

const company = getCompany("flipkart")!;
const first = questionsFor("flipkart").find((q) => !q.locked)!;
const renderPractice = () => render(<PracticeMode company={company} questionId={first.id} />);

describe("Interview directory", () => {
  it("search shows matching companies and keeps the directory below", async () => {
    render(<InterviewDirectory />);
    await userEvent.type(screen.getByRole("combobox"), "pay");
    const results = screen.getByRole("listbox");
    expect(within(results).getByText("Razorpay")).toBeInTheDocument();
    expect(within(results).queryByText("Flipkart")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Top Tech" })).toBeInTheDocument();
  });

  it("shows an empty message when nothing matches", async () => {
    render(<InterviewDirectory />);
    await userEvent.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText(/No companies match/)).toBeInTheDocument();
  });
});

describe("Practice mode", () => {
  it("opens and closes the question list drawer", async () => {
    renderPractice();
    await userEvent.click(screen.getByRole("button", { name: /Question List/ }));
    const drawer = screen.getByRole("dialog", { name: "Question list" });
    expect(within(drawer).queryByLabelText(/Locked .* question/)).not.toBeInTheDocument(); // everything unlocked in the demo
    await userEvent.selectOptions(within(drawer).getByLabelText("Seniority"), "Mid Level");
    expect(within(drawer).getAllByRole("link").length).toBe(questionsFor("flipkart").filter((x) => x.seniority === "Mid Level").length);
    await userEvent.click(within(drawer).getByRole("button", { name: "Close question list" }));
    expect(screen.queryByRole("dialog", { name: "Question list" })).not.toBeInTheDocument();
  });

  it("closes the drawer with Escape", async () => {
    renderPractice();
    await userEvent.click(screen.getByRole("button", { name: /Question List/ }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Question list" })).not.toBeInTheDocument();
  });

  it("anchor buttons scroll to their section and mark it current", async () => {
    renderPractice();
    const nav = screen.getByRole("navigation", { name: "Question sections" });
    await userEvent.click(within(nav).getByRole("button", { name: "The Approach" }));
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(within(nav).getByRole("button", { name: "The Approach" })).toHaveAttribute("aria-current", "true");
  });

  it("keeps each language's code when switching languages and sections", async () => {
    renderPractice();
    const py = screen.getByLabelText("Python code editor");
    await userEvent.type(py, "# my note");
    await userEvent.selectOptions(screen.getByLabelText("Programming language"), "javascript");
    expect(screen.getByLabelText("JavaScript code editor")).toHaveValue(first.starter!.javascript);
    await userEvent.click(screen.getByRole("button", { name: "Insider Tips" }));
    await userEvent.selectOptions(screen.getByLabelText("Programming language"), "python");
    expect((screen.getByLabelText("Python code editor") as HTMLTextAreaElement).value).toContain("# my note");
  });

  it("run shows a labelled sample walkthrough: failure, then success, then completion", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderPractice();
    expect(screen.getByTestId("status")).toHaveTextContent("Not Started");
    await userEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(screen.getByRole("button", { name: "Running..." })).toBeDisabled();
    expect(screen.getByRole("tab", { name: "Test Result" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Running sample cases...")).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(1300); });
    expect(screen.getByText("Sample result: 1 case failed")).toBeInTheDocument();
    expect(screen.getAllByText(/your code was not executed/).length).toBeGreaterThan(0);
    expect(screen.getByTestId("status")).toHaveTextContent("In Progress");
    await userEvent.click(screen.getByRole("button", { name: "Run" }));
    await act(async () => { vi.advanceTimersByTime(1300); });
    expect(screen.getByText("Sample result: all cases passed")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Mark question complete" }));
    expect(screen.getByTestId("status")).toHaveTextContent("Completed");
    vi.useRealTimers();
  });

  it("switches test cases and keeps the active case across tabs", async () => {
    renderPractice();
    await userEvent.click(screen.getByRole("tab", { name: "Case 2" }));
    expect(screen.getByText(first.cases![1].explanation)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Test Result" }));
    await userEvent.click(screen.getByRole("tab", { name: "Testcase" }));
    expect(screen.getByRole("tab", { name: "Case 2" })).toHaveAttribute("aria-selected", "true");
  });

  it("disables Previous on the first readable question", () => {
    renderPractice();
    expect(screen.getByRole("button", { name: "Previous question" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Next question" })).toBeInTheDocument();
  });
});
