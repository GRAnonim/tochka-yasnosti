/**
 * Telegram bot: /start welcome + admin panel (/admin).
 * Reads TELEGRAM_BOT_TOKEN and TELEGRAM_WEBAPP_URL from .env.local
 * (never commit those files).
 *
 * Optional: ADMIN_TELEGRAM_IDS, STATS_INGEST_PORT.
 * Mini App pings POST /event so the panel can count app opens.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { readFileSync, existsSync } from "fs";
import { createServer } from "http";
import { resolve } from "path";
import {
  claimAdmin,
  listRecentUsers,
  loadStore,
  mergeAdminIds,
  parseAdminIdsEnv,
  PRACTICE_LABELS,
  recordAppEvent,
  recordBlocked,
  recordBotTouch,
  saveStore,
  summarize,
} from "./bot-stats.mjs";

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

const INGEST_PORT = Number(env.STATS_INGEST_PORT || 38471);
const ENV_ADMINS = parseAdminIdsEnv(env.ADMIN_TELEGRAM_IDS);
const API = `https://api.telegram.org/bot${TOKEN}`;
let offset = 0;
let store = loadStore();

function persist() {
  saveStore(store);
}

function adminIds() {
  return mergeAdminIds(store, ENV_ADMINS);
}

function isAdmin(userId) {
  return adminIds().includes(Number(userId));
}

async function api(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return res.json();
}

function startText(firstName) {
  const name = (firstName || "").trim();
  const hello = name ? `Здравствуйте, ${name}.` : "Здравствуйте.";
  return [
    hello,
    "",
    "🌿 Это бот «Точка ясности».",
    "",
    "✨ Здесь можно спокойно определиться с выбором или сделать короткую практику.",
    "",
    "Как открыть приложение:",
    "▫️ нажмите кнопку ниже «Открыть приложение»",
    "▫️ или слева внизу у поля ввода — меню «Точка ясности»",
    "",
    "🕊️ Это не терапия и не диагноз. При тяжёлом состоянии обратитесь к специалисту.",
  ].join("\n");
}

function startMarkup() {
  return {
    inline_keyboard: [
      [{ text: "Открыть приложение", web_app: { url: WEBAPP } }],
    ],
  };
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function ruPlural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function people(n) {
  return `${n} ${ruPlural(n, "человек", "человека", "человек")}`;
}

function times(n) {
  return `${n} ${ruPlural(n, "раз", "раза", "раз")}`;
}

function fmtWhen(iso) {
  if (!iso) return "ещё не заходил";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "нет даты";
  const diff = Date.now() - t;
  if (diff < 60_000) return "только что";
  if (diff < 3_600_000) return `${Math.max(1, Math.round(diff / 60_000))} мин назад`;
  if (diff < 22 * 3_600_000) return `${Math.max(1, Math.round(diff / 3_600_000))} ч назад`;
  return new Date(t).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayName(u) {
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  if (name && u.username) return `${esc(name)} @${esc(u.username)}`;
  if (name) return esc(name);
  if (u.username) return `@${esc(u.username)}`;
  return `id ${u.id}`;
}

function adminKeyboard(view, page = 0) {
  const nav = [
    { text: view === "ov" ? "· Обзор ·" : "Обзор", callback_data: "adm:ov" },
    { text: view === "people" ? "· Люди ·" : "Люди", callback_data: "adm:people:0" },
    { text: view === "app" ? "· Приложение ·" : "Приложение", callback_data: "adm:app" },
  ];
  const period = [
    { text: view === "d1" ? "· Сегодня ·" : "Сегодня", callback_data: "adm:d1" },
    { text: view === "d7" ? "· Неделя ·" : "Неделя", callback_data: "adm:d7" },
    { text: view === "d30" ? "· Месяц ·" : "Месяц", callback_data: "adm:d30" },
  ];
  const rows = [nav, period, [{ text: "Что считается", callback_data: "adm:help" }]];
  if (view === "people") {
    const { total } = listRecentUsers(store, { offset: page * 8, limit: 8 });
    const buttons = [];
    if (page > 0) buttons.push({ text: "←", callback_data: `adm:people:${page - 1}` });
    if ((page + 1) * 8 < total) buttons.push({ text: "→", callback_data: `adm:people:${page + 1}` });
    if (buttons.length) rows.splice(2, 0, buttons);
  }
  return { inline_keyboard: rows };
}

function overviewText(days) {
  const s = summarize(store, { days });
  const periodTitle =
    days === 1 ? "Сегодня" : days === 30 ? "За 30 дней" : "За 7 дней";
  return [
    "<b>Точка ясности · админка</b>",
    "",
    "<b>За всё время</b>",
    `▫️ Зашли в бот: ${people(s.startedBot)}`,
    `▫️ Открыли приложение: ${people(s.openedApp)}`,
    `▫️ Активны за 7 дней: ${people(summarize(store, { days: 7 }).activeBot)}`,
    `▫️ Пользуются приложением: ${people(summarize(store, { days: 7 }).activeApp)}`,
    s.blocked ? `▫️ Заблокировали бота: ${people(s.blocked)}` : null,
    "",
    `<b>${periodTitle}</b>`,
    `▫️ Новых: ${people(days === 1 ? s.todayNew : s.periodNew)}`,
    `▫️ /start: ${times(days === 1 ? s.todayStarts : s.periodStarts)}`,
    `▫️ Открытий приложения: ${times(days === 1 ? s.todayAppOpens : s.periodAppOpens)}`,
    `▫️ Начатых практик: ${times(days === 1 ? s.todayPractices : s.periodPractices)}`,
    days === 1 ? `▫️ Сегодня в приложении: ${people(s.todayAppUsers)}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function peopleText(page) {
  const { total, users } = listRecentUsers(store, { offset: page * 8, limit: 8 });
  if (!total) {
    return [
      "<b>Люди</b>",
      "",
      "Пока никого. Как только кто-то напишет боту или откроет приложение, они появятся здесь.",
    ].join("\n");
  }
  const from = page * 8 + 1;
  const to = page * 8 + users.length;
  const lines = [
    `<b>Люди</b> · ${from}–${to} из ${total}`,
    "",
  ];
  users.forEach((u, i) => {
    const flag = u.blocked ? " · блок" : "";
    const app = u.appOpens
      ? `приложение ${times(u.appOpens)}`
      : "приложение не открывал";
    lines.push(
      `${from + i}. ${displayName(u)}${flag}`,
      `    ${fmtWhen(u.lastSeenAt)} · ${app}`,
      `    первый заход ${fmtWhen(u.firstSeenAt)}`,
    );
  });
  return lines.join("\n");
}

function appText() {
  const s = summarize(store, { days: 7 });
  const rows = Object.entries(s.practiceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `▫️ ${PRACTICE_LABELS[k] || k} — ${times(n)}`);
  return [
    "<b>Приложение</b>",
    "",
    `Открывали хотя бы раз: ${people(s.openedApp)} из ${s.startedBot}`,
    `Открытий всего: ${times(s.totalAppOpens)}`,
    `За 7 дней открытий: ${times(s.periodAppOpens)}`,
    `Сейчас пользуются (7 дней): ${people(s.activeApp)}`,
    "",
    "<b>Что начинают</b>",
    rows.length ? rows.join("\n") : "▫️ Пока нет практик",
    "",
    "Тексты записей сюда не попадают. Только счётчики.",
  ].join("\n");
}

function helpText() {
  return [
    "<b>Что считается</b>",
    "",
    "▫️ <b>Зашли в бот</b> — написали /start или любое сообщение.",
    "▫️ <b>Открыли приложение</b> — Mini App смог сообщить боту, что его открыли.",
    "▫️ <b>Активны</b> — заходили в бот или в приложение за выбранный срок.",
    "▫️ <b>Пользуются приложением</b> — открывали Mini App за 7 дней.",
    "",
    "Дневники, ответы и заметки в админку не пишутся.",
    "",
    "Если Mini App на GitHub Pages, а бот крутится только на ноутбуке, открытия приложения дойдут после HTTPS-адреса ingest (см. README).",
  ].join("\n");
}

function panelFor(view, page = 0) {
  if (view === "people") return { text: peopleText(page), markup: adminKeyboard("people", page) };
  if (view === "app") return { text: appText(), markup: adminKeyboard("app") };
  if (view === "help") return { text: helpText(), markup: adminKeyboard("help") };
  if (view === "d1") return { text: overviewText(1), markup: adminKeyboard("d1") };
  if (view === "d30") return { text: overviewText(30), markup: adminKeyboard("d30") };
  if (view === "d7") return { text: overviewText(7), markup: adminKeyboard("d7") };
  return { text: overviewText(7), markup: adminKeyboard("ov") };
}

async function sendPanel(chatId, view = "ov", page = 0, messageId) {
  const { text, markup } = panelFor(view, page);
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: markup,
  };
  if (messageId) {
    const edited = await api("editMessageText", { ...payload, message_id: messageId });
    if (edited.ok) return;
  }
  await api("sendMessage", payload);
}

async function syncAdminCommands() {
  await api("setMyCommands", {
    commands: [
      { command: "start", description: "Открыть Точку ясности" },
      { command: "app", description: "Открыть приложение" },
    ],
  });
  for (const id of adminIds()) {
    await api("setMyCommands", {
      commands: [
        { command: "start", description: "Открыть Точку ясности" },
        { command: "app", description: "Открыть приложение" },
        { command: "admin", description: "Статистика бота" },
        { command: "stats", description: "Краткий обзор" },
      ],
      scope: { type: "chat", chat_id: id },
    });
  }
}

function commandName(text) {
  const raw = (text || "").trim();
  const m = raw.match(/^\/([a-zA-Z0-9_]+)(?:@\w+)?(?:\s|$)/);
  return m ? m[1].toLowerCase() : "";
}

async function handleAdminCommand(msg) {
  const uid = msg.from?.id;
  if (isAdmin(uid)) {
    await sendPanel(msg.chat.id, "ov");
    return;
  }
  if (adminIds().length === 0) {
    const claimed = claimAdmin(store, uid);
    persist();
    if (claimed) await syncAdminCommands();
    await api("sendMessage", {
      chat_id: msg.chat.id,
      text: [
        "Вы назначены администратором этого бота.",
        "",
        `Ваш Telegram id: ${uid}`,
        "",
        "Команда /admin открывает статистику. Можно закрепить id в .env.local:",
        `ADMIN_TELEGRAM_IDS=${uid}`,
      ].join("\n"),
    });
    await sendPanel(msg.chat.id, "ov");
    return;
  }
  await api("sendMessage", {
    chat_id: msg.chat.id,
    text: `▫️ Чтобы открыть «Точку ясности», нажмите /start или кнопку меню слева внизу.`,
    reply_markup: startMarkup(),
  });
}

async function handleMessage(msg) {
  if (!msg?.chat?.id || !msg.from) return;
  const text = (msg.text || "").trim();
  const cmd = commandName(text);
  const isStart = cmd === "start" || cmd === "app";
  recordBotTouch(store, msg.from, { start: isStart });
  persist();

  if (cmd === "admin" || cmd === "stats") {
    await handleAdminCommand(msg);
    return;
  }

  const firstName = msg.from.first_name || "";
  if (!isStart) {
    const tipName = firstName ? `, ${firstName}` : "";
    await api("sendMessage", {
      chat_id: msg.chat.id,
      text: `▫️ Чтобы открыть «Точку ясности»${tipName}, нажмите /start или кнопку меню слева внизу.`,
      reply_markup: startMarkup(),
    });
    return;
  }

  await api("sendMessage", {
    chat_id: msg.chat.id,
    text: startText(firstName),
    reply_markup: startMarkup(),
  });
}

async function handleCallback(cq) {
  const data = cq.data || "";
  const uid = cq.from?.id;
  if (!isAdmin(uid)) {
    await api("answerCallbackQuery", { callback_query_id: cq.id, text: "Недоступно" });
    return;
  }
  const [ns, view, pageRaw] = data.split(":");
  if (ns !== "adm") {
    await api("answerCallbackQuery", { callback_query_id: cq.id });
    return;
  }
  await api("answerCallbackQuery", { callback_query_id: cq.id });
  const page = Number(pageRaw || 0) || 0;
  const chatId = cq.message?.chat?.id;
  const messageId = cq.message?.message_id;
  if (!chatId) return;
  await sendPanel(chatId, view || "ov", page, messageId);
}

async function handleChatMember(upd) {
  const next = upd.new_chat_member;
  const from = upd.from;
  if (!next || !from) return;
  const status = next.status;
  if (status === "kicked") recordBlocked(store, from, true);
  else if (status === "member" || status === "restricted") recordBlocked(store, from, false);
  persist();
}

async function handleUpdate(update) {
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }
  if (update.my_chat_member) {
    await handleChatMember(update.my_chat_member);
    return;
  }
  const msg = update.message || update.edited_message;
  if (msg?.web_app_data?.data) {
    // Keyboard Mini App sendData, if ever used. Count as app open, ignore payload content.
    recordAppEvent(store, msg.from, "open");
    persist();
    return;
  }
  if (msg) await handleMessage(msg);
}

function verifyInitData(initData) {
  if (!initData || typeof initData !== "string") return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const pairs = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join("\n");
  const secret = createHmac("sha256", "WebAppData").update(TOKEN).digest();
  const calc = createHmac("sha256", secret).update(dataCheckString).digest("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(calc, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Math.abs(Date.now() / 1000 - authDate) > 86_400) return null;
  try {
    const user = JSON.parse(params.get("user") || "null");
    if (!user?.id) return null;
    return user;
  } catch {
    return null;
  }
}

const ingestHits = new Map();
function ingestLimited(userId) {
  const now = Date.now();
  const row = ingestHits.get(userId) || { n: 0, t: now };
  if (now - row.t > 60_000) {
    row.n = 0;
    row.t = now;
  }
  row.n += 1;
  ingestHits.set(userId, row);
  return row.n > 80;
}

function startIngestServer() {
  const server = createServer(async (req, res) => {
    const origin = req.headers.origin || "";
    const allow =
      /^https:\/\/granonim\.github\.io$/.test(origin) ||
      /^https:\/\/web\.telegram\.org$/.test(origin) ||
      /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin) ||
      origin === "";
    const cors = allow ? origin || "*" : "";
    const headers = {
      "Access-Control-Allow-Origin": cors || "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };
    if (req.method === "OPTIONS") {
      res.writeHead(204, headers);
      res.end();
      return;
    }
    const url = new URL(req.url || "/", "http://127.0.0.1");
    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, { ...headers, "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (req.method !== "POST" || url.pathname !== "/event") {
      res.writeHead(404, headers);
      res.end();
      return;
    }
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 16_000) req.destroy();
    });
    req.on("end", () => {
      try {
        const body = JSON.parse(raw || "{}");
        const user = verifyInitData(body.initData);
        if (!user) {
          res.writeHead(401, headers);
          res.end(JSON.stringify({ ok: false }));
          return;
        }
        if (ingestLimited(user.id)) {
          res.writeHead(429, headers);
          res.end(JSON.stringify({ ok: false }));
          return;
        }
        const event = body.event === "practice" || body.event === "active" ? body.event : "open";
        const practice = typeof body.practice === "string" ? body.practice.slice(0, 32) : "";
        recordAppEvent(store, user, event, practice);
        persist();
        res.writeHead(200, { ...headers, "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400, headers);
        res.end(JSON.stringify({ ok: false }));
      }
    });
  });
  server.listen(INGEST_PORT, "0.0.0.0", () => {
    console.log(`telegram-bot: stats ingest on :${INGEST_PORT}/event`);
  });
}

async function loop() {
  console.log("telegram-bot: polling… webapp configured");
  await syncAdminCommands();
  for (;;) {
    try {
      const data = await api("getUpdates", {
        offset,
        timeout: 25,
        allowed_updates: ["message", "callback_query", "my_chat_member"],
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

startIngestServer();
loop();
