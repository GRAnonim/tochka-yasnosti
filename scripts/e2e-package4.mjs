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
await page.screenshot({ path: `${out}/p4-practices-menu.png`, fullPage: true });

await page.getByTestId("practice-ideal-day").click();
await page.getByTestId("ideal-horizon-Обычный хороший день").click();
await page.getByTestId("ideal-setting").fill("утро дома, тихо и светло");
await page.getByTestId("ideal-actions").fill("работаю без спешки, гуляю, читаю");
await page.getByTestId("ideal-feelings").fill("спокойно и собранно");
await page.getByTestId("ideal-people").fill("наедине и вечером с близкими");
await page.getByTestId("ideal-step").fill("лечь спать до полуночи");
await page.screenshot({ path: `${out}/p4-ideal-day.png`, fullPage: true });
await page.getByTestId("ideal-day-save").click();
await page.getByTestId("practice-log-view").waitFor();

await page.getByRole("button", { name: "На главную" }).click();
await page.getByTestId("open-practices").click();
await page.getByTestId("practice-five-whys").click();
await page.getByTestId("five-start").fill("раздражаюсь от сообщений вечером");
await page.getByTestId("five-why-0").fill("потому что хочу отдохнуть");
await page.getByTestId("five-whys-add").click();
await page.getByTestId("five-why-1").fill("потому что днём отдаю много сил");
await page.getByTestId("five-need").fill("тихий час без телефона");
await page.screenshot({ path: `${out}/p4-five-whys.png`, fullPage: true });
await page.getByTestId("five-whys-save").click();
await page.getByText("5 почему").first().waitFor();
await page.screenshot({ path: `${out}/p4-practice-log.png`, fullPage: true });

await page.getByRole("button", { name: "На главную" }).click();
await page.getByTestId("open-stats").click();
await page.getByText(/идеальный день/).waitFor();
await page.getByText(/5 почему/).waitFor();

console.log("PACKAGE4_E2E_OK");
await browser.close();
