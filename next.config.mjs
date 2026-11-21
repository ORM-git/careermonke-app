// GITHUB_PAGES=true builds a static export served under /careermonke-app (the Pages project path).
// Without it, the normal build is used (Cloudflare via OpenNext).
const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/careermonke-app" : "";

export default {
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(pages && { output: "export", basePath, images: { unoptimized: true } }),
};
