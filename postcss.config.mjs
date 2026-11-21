import { fileURLToPath } from "node:url";

// Absolute config path so Tailwind works when next is started from another folder.
export default { plugins: { tailwindcss: { config: fileURLToPath(new URL("./tailwind.config.ts", import.meta.url)) }, autoprefixer: {} } };
