import { chromium } from "playwright";
import { mkdirSync } from "fs";

const base = process.env.APP_URL || "http://127.0.0.1:3000";
const out = "/opt/cursor/artifacts/screenshots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(base, { waitUntil: "networkidle" });

await page.getByTestId("goal-0").fill("беречь сон");
await page.getByTestId("goal-1").fill("закончить проект");
await page.screenshot({ path: `${out}/01-onboarding.png`, fullPage: true });
await page.getByTestId("start-onboarding").click();
await page.getByTestId("new-situation").waitFor();
await page.screenshot({ path: `${out}/02-home.png`, fullPage: true });

await page.getByTestId("new-situation").click();
await page.getByTestId("situation-text").fill(
  "Коллега просит взять срочную задачу в пятницу вечером",
);
await page.getByTestId("situation-next").click();
await page.getByTestId("filter-work").click();

for (let i = 0; i < 10; i++) {
  if (await page.getByRole("heading", { name: "Мягкое резюме" }).isVisible().catch(() => false)) {
    break;
  }
  await page.getByTestId("question-option-0").click();
  await page.waitForTimeout(120);
}
await page.getByRole("heading", { name: "Мягкое резюме" }).waitFor();
await page.screenshot({ path: `${out}/03-summary.png`, fullPage: true });
await page.getByRole("button", { name: "Выбрать решение" }).click();
await page.getByRole("button", { name: "Отказаться" }).click();
await page.getByTestId("new-situation").waitFor();

await page.getByText("Коллега просит").first().click();
await page.getByTestId("fb-gained").fill("спокойный вечер");
await page.getByTestId("fb-spent").fill("ничего лишнего");
await page.getByRole("button", { name: "Легче" }).click();
await page.getByRole("button", { name: "Да" }).click();
await page.getByRole("button", { name: "Сохранить отзыв" }).click();
await page.getByRole("heading", { name: "Статистика" }).waitFor();
await page.screenshot({ path: `${out}/04-stats.png`, fullPage: true });

await page.getByRole("button", { name: "На главную" }).click();
await page.getByRole("button", { name: /Указать контакты|Изменить/ }).click();
await page.getByTestId("spec-name").fill("Анна П.");
await page.getByTestId("spec-contact").fill("@anna_psy");
await page.getByRole("button", { name: "Сохранить" }).click();
await page.getByText("Анна П.").waitFor();
await page.screenshot({ path: `${out}/05-specialist-home.png`, fullPage: true });

console.log("E2E_OK");
await browser.close();
