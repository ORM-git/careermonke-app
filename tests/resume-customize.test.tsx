import { describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppStateProvider } from "@/components/app-state";
import { Toaster } from "@/components/toast";
import { JobCard } from "@/components/job-card";
import { jobs } from "@/mocks/jobs";
import { LOW_SCORE, resumeFit } from "@/mocks/resume-fit";

const low = jobs[8]; // Rallypoint, sample score 5.4
const high = jobs[9]; // Blockparty, sample score 6.6
const renderCards = (...js: typeof jobs) => render(<AppStateProvider>{js.map((j) => <JobCard key={j.id} job={j} />)}<Toaster /></AppStateProvider>);
const flow = () => screen.getByRole("dialog", { name: "Generate Your Custom Resume" });

describe("resume fit mock data", () => {
  it("every job gets 8-15 keywords, a low-ish sample match, and a higher score after", () => {
    for (const j of jobs) {
      const f = resumeFit(j);
      expect(f.keywords.length).toBeGreaterThanOrEqual(8);
      expect(f.keywords.length).toBeLessThanOrEqual(15);
      expect(f.after).toBeGreaterThan(f.score);
      expect(f.after).toBeLessThanOrEqual(9);
    }
    expect(resumeFit(low).score).toBeLessThan(LOW_SCORE);
    expect(resumeFit(high).score).toBeGreaterThanOrEqual(LOW_SCORE);
  });

  it("different jobs show different keyword lists", () => {
    const lists = [jobs[0], jobs[8], jobs[6]].map((j) => resumeFit(j).keywords.map((k) => k.name).join());
    expect(new Set(lists).size).toBe(3);
  });
});

describe("customize flow", () => {
  it("Apply on a low-score job asks first; 'Don't remind me again' skips it for the rest of the visit", async () => {
    renderCards(low);
    await userEvent.click(screen.getByRole("button", { name: /APPLY/ }));
    const prompt = screen.getByRole("dialog", { name: "Customize Your Resume in 10 seconds" });
    expect(prompt).toHaveTextContent("In this demo, scores under 6.0 count as low");
    await userEvent.click(within(prompt).getByLabelText(/Don't remind me again/));
    await userEvent.click(within(prompt).getByRole("button", { name: "Apply Without Customizing" }));
    await userEvent.click(screen.getByRole("button", { name: "Back to CareerMonke" }));
    await userEvent.click(screen.getByRole("button", { name: /No, I didn/ }));
    await userEvent.click(screen.getByRole("button", { name: /APPLY/ }));
    expect(screen.queryByRole("dialog", { name: "Customize Your Resume in 10 seconds" })).not.toBeInTheDocument();
    expect(screen.getByText(/Simulated employer form/)).toBeInTheDocument();
  });

  it("a job scoring 6.0 or more goes straight to the simulated Apply form", async () => {
    renderCards(high);
    await userEvent.click(screen.getByRole("button", { name: /APPLY/ }));
    expect(screen.getByText(/Simulated employer form/)).toBeInTheDocument();
  });

  it("runs all three steps, spends one demo credit, updates the card and then applies", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderCards(low);
    await userEvent.click(screen.getByRole("button", { name: "Customize Resume" }));
    expect(flow()).toHaveTextContent("2 credits available today");
    expect(flow()).toHaveTextContent(low.title);
    expect(flow()).toHaveTextContent("Demo: sample result, nothing is generated or sent.");
    await userEvent.click(screen.getByRole("button", { name: "Improve My Resume for This Job" }));

    const generate = screen.getByRole("button", { name: "Generate My New Resume" });
    for (const s of ["Summary", "Skills", "Work Experience"]) await userEvent.click(screen.getByLabelText(s));
    expect(generate).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "Improve My Resume for This Job" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Improve My Resume for This Job" }));
    await userEvent.click(screen.getByRole("button", { name: "Select all" }));
    await userEvent.type(screen.getByLabelText("Add tools keyword"), "Grafana{Enter}");
    expect(screen.getByLabelText("Grafana")).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "Generate My New Resume" }));
    expect(screen.getByRole("status")).toHaveTextContent("Rewriting sample resume (demo)");
    await act(async () => { vi.advanceTimersByTime(2100); });
    vi.useRealTimers();

    const { score, after } = resumeFit(low);
    expect(flow()).toHaveTextContent(`jumped from ${score.toFixed(1)} to ${after.toFixed(1)}`);
    expect(flow()).toHaveTextContent("1 credit consumed");
    expect(flow()).toHaveTextContent("1 credit available today");
    expect(screen.getByRole("article", { name: "Sample resume preview" })).toHaveTextContent("alex.carter@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Use stronger action verbs for my latest experience" }));
    expect(await screen.findByText("Demo: no changes are made")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Apply Now" }));
    expect(screen.queryByRole("dialog", { name: "Generate Your Custom Resume" })).not.toBeInTheDocument();
    expect(screen.getByText(/Simulated employer form/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Back to CareerMonke" }));
    await userEvent.click(screen.getByRole("button", { name: /No, I didn/ }));
    expect(screen.getByText(`Resume customized (demo) · ${after.toFixed(1)}/10`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(`^${Math.round(after * 10)}% match`) })).toBeInTheDocument();
    // Customized jobs no longer show the low-score prompt.
    await userEvent.click(screen.getByRole("button", { name: /APPLY/ }));
    expect(screen.getByText(/Simulated employer form/)).toBeInTheDocument();
  });

  it("Escape closes the overlay", async () => {
    renderCards(low);
    await userEvent.click(screen.getByRole("button", { name: "Customize Resume" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Generate Your Custom Resume" })).not.toBeInTheDocument();
  });
});
