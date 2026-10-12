import { chromium } from "playwright";
import { mkdirSync } from "fs";

const base = process.env.APP_URL || "http://127.0.0.1:43123";
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
await page.screenshot({ path: `${out}/p2-practices-menu.png`, fullPage: true });

await page.getByTestId("practice-questions").click();
await page.getByTestId("questions-topic-values").click();
await page.getByTestId("questions-answer-v1").fill("мне важен отдых");
await page.getByTestId("questions-answer-v2").fill("беречь сон");
await page.getByTestId("questions-answer-v3").fill("не согласиться на всё подряд");
await page.getByTestId("questions-save").click();
await page.getByTestId("practice-log-view").waitFor();

await page.getByRole("button", { name: "На главную" }).click();
await page.getByTestId("open-practices").click();
await page.getByTestId("practice-abc").click();
await page.getByTestId("abc-a").fill("коллега написал вечером");
await page.getByTestId("abc-b").fill("если откажу — буду плохим");
await page.getByTestId("abc-c").fill("тревога и желание сразу согласиться");
await page.getByTestId("abc-reframe").fill("отказ вечером — нормальная граница");
await page.screenshot({ path: `${out}/p2-abc.png`, fullPage: true });
await page.getByTestId("abc-save").click();
await page.getByText("ABC-дневник").first().waitFor();
await page.screenshot({ path: `${out}/p2-practice-log.png`, fullPage: true });

await page.getByRole("button", { name: "На главную" }).click();
await page.getByTestId("open-stats").click();
await page.getByText(/вопросы/).waitFor();
await page.getByText(/ABC/).waitFor();

console.log("PACKAGE2_E2E_OK");
await browser.close();
