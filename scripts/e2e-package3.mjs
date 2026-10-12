import { chromium } from "playwright";
import { mkdirSync } from "fs";

const base = process.env.APP_URL || "http://127.0.0.1:43123";
const out = "/opt/cursor/artifacts/screenshots";
mkdirSync(out, { recursive: true });

const areas = [
  "health",
  "work",
  "money",
  "relations",
  "friends",
  "growth",
  "rest",
  "meaning",
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });

await page.getByTestId("goal-0").fill("беречь сон");
await page.getByTestId("goal-1").fill("закончить проект");
await page.getByTestId("start-onboarding").click();
await page.getByTestId("open-practices").click();
await page.screenshot({ path: `${out}/p3-practices-menu.png`, fullPage: true });

await page.getByTestId("practice-wheel").click();
for (const id of areas) {
  const score = id === "rest" ? 3 : 7;
  await page.getByTestId(`wheel-${id}-${score}`).click();
}
await page.getByTestId("wheel-note").fill("вечером короткая прогулка");
await page.screenshot({ path: `${out}/p3-wheel.png`, fullPage: true });
await page.getByTestId("wheel-save").click();
await page.getByTestId("practice-log-view").waitFor();

await page.getByRole("button", { name: "На главную" }).click();
await page.getByTestId("open-practices").click();
await page.getByTestId("practice-breath").click();
await page.getByTestId("breath-duration-60").click();
await page.getByTestId("breath-start").click();
await page.getByTestId("breath-orb").waitFor();
await page.getByTestId("breath-stop").click();
await page.getByTestId("breath-notice").fill("чуть спокойнее в плечах");
await page.getByTestId("breath-save").click();
await page.getByText("Практика дыхания").first().waitFor();
await page.screenshot({ path: `${out}/p3-practice-log.png`, fullPage: true });

await page.getByRole("button", { name: "На главную" }).click();
await page.getByTestId("open-stats").click();
await page.getByText(/колесо/).waitFor();
await page.getByText(/дыхание/).waitFor();

console.log("PACKAGE3_E2E_OK");
await browser.close();
