import { chromium } from "playwright";
import { mkdirSync } from "fs";

const base = process.env.APP_URL || "http://127.0.0.1:3000";
const out = "/opt/cursor/artifacts/screenshots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });

await page.getByTestId("goal-0").fill("беречь сон");
await page.getByTestId("goal-1").fill("закончить проект");
await page.getByTestId("start-onboarding").click();
await page.getByTestId("open-practices").click();
await page.getByTestId("practice-group-toggle-day").click();
await page.screenshot({ path: `${out}/p1-practices-menu.png`, fullPage: true });

await page.getByTestId("practice-mood").click();
await page.getByTestId("mood-4").click();
await page.getByTestId("activity-отдых").click();
await page.getByTestId("mood-note").fill("тихий вечер");
await page.getByTestId("mood-save").click();
await page.getByTestId("practice-log-view").waitFor();

await page.getByRole("button", { name: "На главную" }).click();
await page.getByTestId("open-practices").click();
await page.getByTestId("practice-group-toggle-day").click();
await page.getByTestId("practice-gratitude").click();
await page.getByTestId("gratitude-0").fill("тёплый чай");
await page.getByTestId("gratitude-1").fill("сообщение друга");
await page.getByTestId("gratitude-save").click();

await page.getByRole("button", { name: "На главную" }).click();
await page.getByTestId("open-practices").click();
await page.getByTestId("practice-group-toggle-day").click();
await page.getByTestId("practice-emotions").click();
await page.getByTestId("emotion-спокойствие").click();
await page.getByTestId("emotion-надежда").click();
await page.getByTestId("intensity-3").click();
await page.getByTestId("emotions-save").click();
await page.screenshot({ path: `${out}/p1-practice-log.png`, fullPage: true });

await page.getByRole("button", { name: "На главную" }).click();
await page.getByTestId("open-stats").click();
await page.getByText(/Практик:/).waitFor();
await page.screenshot({ path: `${out}/p1-stats.png`, fullPage: true });

console.log("PACKAGE1_E2E_OK");
await browser.close();
