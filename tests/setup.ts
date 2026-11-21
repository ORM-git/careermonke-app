import "@testing-library/jest-dom/vitest";
import { demoStore } from "@/lib/demo";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => { cleanup(); demoStore.clear(); });

// jsdom has no layout engine: stub the scroll API the anchor navigation uses.
Element.prototype.scrollIntoView = vi.fn();

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: push, back: vi.fn() }),
  usePathname: () => "/",
  useParams: () => ({}),
  notFound: () => { throw new Error("notFound"); },
}));

// jsdom lacks ResizeObserver; the tour uses it to re-measure its anchor.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
