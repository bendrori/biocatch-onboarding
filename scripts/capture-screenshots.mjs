import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";

const BASE = "http://localhost:3000";
const OUT = "/opt/cursor/artifacts/screenshots";

const pages = [
  { name: "executive", path: "/dashboard" },
  { name: "research-feed", path: "/dashboard/feed" },
  { name: "research-topics", path: "/dashboard/topics" },
  { name: "signal-ideas", path: "/dashboard/ideas" },
  { name: "validation-lab", path: "/dashboard/validation" },
  { name: "production-pipeline", path: "/dashboard/pipeline" },
  { name: "agent-team", path: "/dashboard/agents" },
];

mkdirSync(OUT, { recursive: true });

async function main() {
  await fetch(`${BASE}/api/pipeline`, { method: "POST" });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  });
  const page = await context.newPage();

  for (const { name, path: route } of pages) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(OUT, `${name}.png`),
      fullPage: true,
    });
    console.log(`Captured ${name}.png`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
