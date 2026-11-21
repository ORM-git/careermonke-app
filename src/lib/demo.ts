// Visit-scoped demo state. It lives in this JS module, so it survives client-side navigation
// but a reload or a fresh visit starts empty: onboarding, tours and checklists always replay.
// Nothing is written to localStorage, so old "seen" flags from earlier builds are ignored.
const data = new Map<string, string>();
const listeners = new Set<() => void>();

export const demoStore = {
  getItem: (k: string) => data.get(k) ?? null,
  setItem: (k: string, v: string) => { data.set(k, v); listeners.forEach((l) => l()); },
  removeItem: (k: string) => { data.delete(k); listeners.forEach((l) => l()); },
  clear: () => { data.clear(); listeners.forEach((l) => l()); },
};
export const subscribeDemo = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const SESSION = "cm-session";
export const NEXT = "cm-next";
export const hasSession = () => !!demoStore.getItem(SESSION);
export const startSession = () => demoStore.setItem(SESSION, "demo");

/** Remember the page a visitor opened so the walkthrough can bring them back to it. */
export const rememberNext = (path: string) => { if (path && !path.startsWith("/onboarding")) demoStore.setItem(NEXT, path); };
export const requestedPath = () => demoStore.getItem(NEXT);

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** Path with the deploy base path, for raw history/URL work outside Next's router. */
export const withBase = (path: string) => `${BASE_PATH}${path}`;
