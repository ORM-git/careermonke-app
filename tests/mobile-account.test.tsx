import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppStateProvider } from "@/components/app-state";
import { Sidebar } from "@/components/shell";
import { SettingsModal } from "@/components/settings-modal";
import { MessagesDrawer } from "@/components/messages-drawer";

const renderShell = () => render(<AppStateProvider><Sidebar /><SettingsModal /><MessagesDrawer /></AppStateProvider>);

beforeEach(() => { vi.clearAllMocks(); });

describe("mobile navigation", () => {
  it("the phone bar keeps five destinations plus More, with touch-sized targets", () => {
    renderShell();
    const bar = screen.getByRole("navigation", { name: "Main" });
    expect(within(bar).getAllByRole("link").map((a) => a.textContent)).toEqual(["Jobs", "Explore", "Resume", "Profile", "Agent"]);
    const more = within(bar).getByRole("button", { name: "More" });
    expect(more).toHaveClass("min-h-14");
    expect(more).toHaveAttribute("aria-expanded", "false");
  });

  it("More lists every destination that is not on the bar (nothing removed) and closes with Escape", async () => {
    renderShell();
    await userEvent.click(screen.getByRole("button", { name: "More" }));
    const sheet = screen.getByRole("dialog", { name: "More" });
    expect(within(sheet).getByRole("link", { name: "Coaching" })).toHaveAttribute("href", "/coaching");
    expect(within(sheet).getByRole("link", { name: "Interview" })).toHaveAttribute("href", "/interview");
    for (const name of ["Messages", "Feedback", "Settings", /Restart Demo/]) expect(within(sheet).getByRole("button", { name })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "More" })).toBeNull();
  });

  it("Settings and Messages from More use the existing handlers", async () => {
    renderShell();
    await userEvent.click(screen.getByRole("button", { name: "More" }));
    await userEvent.click(within(screen.getByRole("dialog", { name: "More" })).getByRole("button", { name: "Settings" }));
    expect(screen.queryByRole("dialog", { name: "More" })).toBeNull();
    expect(screen.getByRole("dialog", { name: /Settings/ })).toBeInTheDocument();
  });
});
