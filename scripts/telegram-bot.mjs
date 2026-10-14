/**
 * Lightweight Telegram polling bot for /start welcome.
 * Reads TELEGRAM_BOT_TOKEN and TELEGRAM_WEBAPP_URL from .env.local
 * (never commit those files).
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    throw new Error("Missing .env.local with TELEGRAM_BOT_TOKEN");
  }
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    env[t.slice(0, i)] = t.slice(i + 1);
  }
  return env;
}

const env = loadEnvLocal();
const TOKEN = env.TELEGRAM_BOT_TOKEN;
const WEBAPP = (env.TELEGRAM_WEBAPP_URL || "").replace(/\/$/, "");
if (!TOKEN || !WEBAPP) {
  throw new Error("TELEGRAM_BOT_TOKEN and TELEGRAM_WEBAPP_URL required");
}

const API = `https://api.telegram.org/bot${TOKEN}`;
let offset = 0;

async function api(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return res.json();
}

const START_TEXT = [
  "Здравствуйте. Это бот «Точка ясности».",
  "",
  "Здесь можно спокойно разобрать решение или сделать короткую практику.",
  "",
  "Как открыть приложение:",
  "• нажмите кнопку ниже «Открыть приложение», или",
  "• слева внизу у поля ввода — кнопка меню «Точка ясности».",
  "",
  "Это не терапия и не диагноз. При тяжёлом состоянии обратитесь к специалисту (в РФ: 8-800-2000-122).",
].join("\n");

function startMarkup() {
  return {
    inline_keyboard: [
      [
        {
          text: "Открыть приложение",
          web_app: { url: WEBAPP },
        },
      ],
    ],
  };
}

async function handleUpdate(update) {
  const msg = update.message || update.edited_message;
  if (!msg?.chat?.id) return;
  const text = (msg.text || "").trim();
  if (!text) return;

  const isStart =
    text === "/start" ||
    text.startsWith("/start ") ||
    text === "/app" ||
    text.startsWith("/app ");

  if (!isStart) {
    await api("sendMessage", {
      chat_id: msg.chat.id,
      text:
        "Чтобы открыть «Точку ясности», нажмите /start или кнопку меню слева внизу.",
      reply_markup: startMarkup(),
    });
    return;
  }

  await api("sendMessage", {
    chat_id: msg.chat.id,
    text: START_TEXT,
    reply_markup: startMarkup(),
  });
}

async function loop() {
  console.log("telegram-bot: polling… webapp configured");
  for (;;) {
    try {
      const data = await api("getUpdates", {
        offset,
        timeout: 25,
        allowed_updates: ["message"],
      });
      if (!data.ok) {
        console.error("getUpdates failed", data.description || data);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      for (const u of data.result || []) {
        offset = u.update_id + 1;
        try {
          await handleUpdate(u);
        } catch (e) {
          console.error("handleUpdate", e);
        }
      }
    } catch (e) {
      console.error("poll error", e);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

loop();
