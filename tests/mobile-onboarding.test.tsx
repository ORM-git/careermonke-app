import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import RolePage from "@/app/(auth)/onboarding/role/page";
import ResumeStepPage from "@/app/(auth)/onboarding/resume/page";
import { UploadModal } from "@/components/resume-upload";
import { readPrefs } from "@/mocks/onboarding";

const router = () => useRouter() as unknown as { push: ReturnType<typeof vi.fn> };
const file = (name: string, size = 1024) => { const f = new File(["x"], name); Object.defineProperty(f, "size", { value: size }); return f; };
const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

describe("mobile onboarding: role step", () => {
  it("a failed Next shows every error next to its field, marks the inputs invalid and scrolls the first error into view", async () => {
    render(<RolePage />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Full-time" })); // no job type left
    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    const alerts = screen.getAllByRole("alert");
    expect(alerts.map((a) => a.textContent)).toEqual(["Enter the job function you want.", "Pick at least one job type.", "Choose a location from the list."]);
    expect(screen.getByLabelText("Job Function")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Job Function")).toHaveAttribute("aria-describedby", "fn-err");
    expect(screen.getByLabelText("Location")).toHaveAttribute("aria-describedby", "loc-err");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(router().push).not.toHaveBeenCalled();
    expect(readPrefs()).toBeNull();
  });

  it("valid answers are saved unchanged and Next goes to the resume step", async () => {
    render(<RolePage />);
    await userEvent.click(screen.getByRole("button", { name: "Use the sample answers" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Contract" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "H1B sponsorship" }));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.queryByRole("alert")).toBeNull();
    expect(readPrefs()).toMatchObject({ jobFunction: "Software Engineer", jobTypes: ["Full-time", "Contract"], location: "India", openToRemote: true, h1b: true });
    expect(router().push).toHaveBeenCalledWith("/onboarding/resume");
  });

  it("text inputs use 16px type on phones (no iOS focus zoom) and keep the desktop size from md", () => {
    render(<RolePage />);
    for (const label of ["Job Function", "Location"]) {
      expect(screen.getByLabelText(label)).toHaveClass("text-base", "md:text-sm");
    }
  });

  it("the first step has no Back control", () => {
    render(<RolePage />);
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
  });
});

describe("mobile onboarding: resume step", () => {
  it("rejects a wrong type and an oversized file with a visible error tied to the upload button", async () => {
    const { container } = render(<ResumeStepPage />);
    await userEvent.upload(fileInput(container), file("photo.png"), { applyAccept: false });
    expect(screen.getByRole("alert")).toHaveTextContent("Please choose a PDF or Word file.");
    expect(screen.getByRole("button", { name: "Upload Your Resume" })).toHaveAttribute("aria-describedby", "resume-err");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled(); // not hidden behind the fixed action bar

    await userEvent.upload(fileInput(container), file("cv.pdf", 11 * 1024 * 1024));
    expect(screen.getByRole("alert")).toHaveTextContent("This file is over 10MB.");
  });

  it("an accepted file shows its name with a remove control; removing restores the upload button", async () => {
    const { container } = render(<ResumeStepPage />);
    await userEvent.upload(fileInput(container), file("cv.docx"));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("1-cv.docx")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove file" }));
    expect(screen.getByRole("button", { name: "Upload Your Resume" })).toBeInTheDocument();
  });

  it("Back returns to the role step and Start Matching saves the resume and continues", async () => {
    render(<ResumeStepPage />);
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(router().push).toHaveBeenCalledWith("/onboarding/role");

    await userEvent.click(screen.getByRole("button", { name: "Use a sample resume instead" }));
    await userEvent.click(screen.getByRole("button", { name: "Start Matching" }));
    expect(readPrefs()?.resume).toBe("Sample resume - Aarav Mehta.pdf");
    expect(router().push).toHaveBeenLastCalledWith("/onboarding/matching");
  });
});

describe("mobile onboarding: upload modal", () => {
  it("validates files and its button can shrink to a 320px screen", async () => {
    const onFile = vi.fn();
    render(<UploadModal open onClose={() => {}} onFile={onFile} />);
    const input = document.getElementById("resume-file") as HTMLInputElement;
    await userEvent.upload(input, file("notes.txt"), { applyAccept: false });
    expect(screen.getByRole("alert")).toHaveTextContent("Please choose a PDF or Word file.");
    expect(onFile).not.toHaveBeenCalled();

    await userEvent.upload(input, file("cv.pdf"));
    expect(onFile).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Upload" })).toHaveClass("w-full", "max-w-60");
  });
});
