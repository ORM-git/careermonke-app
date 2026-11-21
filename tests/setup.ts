import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => { cleanup(); localStorage.clear(); });

// jsdom has no layout engine: stub the scroll API the anchor navigation uses.
Element.prototype.scrollIntoView = vi.fn();

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: push, back: vi.fn() }),
  usePathname: () => "/",
  useParams: () => ({}),
  notFound: () => { throw new Error("notFound"); },
}));
