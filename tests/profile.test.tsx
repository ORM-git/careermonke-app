import { beforeEach, describe, expect, it } from "vitest";
import { demoStore } from "@/lib/demo";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileView } from "@/components/profile/profile-view";
import { UploadModal, resumeFileError } from "@/components/resume-upload";
import { readProfile, sectionDone, seedProfile } from "@/mocks/profile";

beforeEach(() => demoStore.setItem("cm-profile-intro", "1"));
const drawer = () => screen.getByRole("dialog");

describe("Profile", () => {
  it("derives completion from real fields", () => {
    const done = sectionDone(seedProfile);
    expect(done.Personal).toBe(false); // seed has no phone/address/postal
    expect(done.Skills).toBe(true);
    expect(done["Equal Employment"]).toBe(false);
  });

  it("blocks Update until required personal fields are valid, then saves", async () => {
    render(<ProfileView />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Personal" }));
    await userEvent.click(within(drawer()).getByRole("button", { name: "UPDATE" }));
    expect(within(drawer()).getAllByText("Required").length).toBeGreaterThan(0);
    expect(readProfile().personal.phone).toBe("");

    await userEvent.type(within(drawer()).getByLabelText(/Phone$/), "98765 43210");
    await userEvent.type(within(drawer()).getByLabelText(/Address Line/), "12 MG Road");
    await userEvent.type(within(drawer()).getByLabelText(/Postal Code/), "560001");
    await userEvent.click(within(drawer()).getByRole("button", { name: "UPDATE" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(readProfile().personal.postal).toBe("560001");
  }, 10_000);

  it("closing with unsaved changes asks, and Discard throws the draft away", async () => {
    render(<ProfileView />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Skills" }));
    await userEvent.click(within(drawer()).getByRole("button", { name: "Remove SQL" }));
    await userEvent.click(within(drawer()).getByRole("button", { name: "Close" }));
    expect(screen.getByRole("alertdialog", { name: "Unsaved changes" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(readProfile().skills).toContain("SQL");
  });

  it("closing without changes does not ask", async () => {
    render(<ProfileView />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Education" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("current position hides the end date and passes validation", async () => {
    render(<ProfileView />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Work Experience" }));
    await userEvent.click(within(drawer()).getByRole("button", { name: "Add Work" }));
    const second = within(drawer()).getByRole("group", { name: "#2" });
    await userEvent.type(within(second).getByLabelText(/Job Title/), "Data Analyst");
    await userEvent.type(within(second).getByLabelText(/Company/), "Quickcart");
    await userEvent.type(within(second).getByLabelText(/Start Date/), "2024-01");
    expect(within(second).getByLabelText(/End Date/)).toBeInTheDocument();
    await userEvent.click(within(second).getByLabelText("I currently work here"));
    expect(within(second).queryByLabelText(/End Date/)).not.toBeInTheDocument();
    await userEvent.click(within(drawer()).getByRole("button", { name: "UPDATE" }));
    expect(readProfile().work).toHaveLength(2);
  });

  it("equal employment questions are country specific and never prefilled", async () => {
    render(<ProfileView />);
    await userEvent.click(screen.getByRole("button", { name: "Edit Equal Employment" }));
    await userEvent.selectOptions(within(drawer()).getByLabelText("Country"), "United States");
    expect(within(drawer()).getByLabelText("Veteran status")).toHaveValue("");
    await userEvent.selectOptions(within(drawer()).getByLabelText("Country"), "Canada");
    expect(within(drawer()).queryByLabelText("Veteran status")).not.toBeInTheDocument();
  });

  it("wizard Next is blocked on missing personal fields", async () => {
    render(<ProfileView />);
    await userEvent.click(screen.getByRole("button", { name: "Complete Profile" }));
    await userEvent.click(within(drawer()).getByRole("button", { name: "Next" }));
    expect(within(drawer()).getByText("1. Personal").closest("li")).toHaveAttribute("aria-current", "step");
  });
});

describe("Resume upload", () => {
  it("validates type and size", () => {
    expect(resumeFileError(new File(["x"], "cv.png"))).toMatch(/PDF or Word/);
    const big = new File(["x"], "cv.pdf");
    Object.defineProperty(big, "size", { value: 11 * 1024 * 1024 });
    expect(resumeFileError(big)).toMatch(/10MB/);
    expect(resumeFileError(new File(["x"], "cv.docx"))).toBe("");
  });

  it("shows an error for a bad file and accepts a good one", async () => {
    let got = "";
    render(<UploadModal open onClose={() => undefined} onFile={(f) => { got = f.name; }} />);
    const input = screen.getByLabelText("Resume file");
    await userEvent.upload(input, new File(["x"], "photo.png", { type: "image/png" }), { applyAccept: false });
    expect(screen.getByRole("alert")).toHaveTextContent(/PDF or Word/);
    await userEvent.upload(input, new File(["x"], "cv.pdf", { type: "application/pdf" }));
    expect(got).toBe("cv.pdf");
  });
});
