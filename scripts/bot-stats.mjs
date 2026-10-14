/**
 * Local stats store for the Telegram bot admin panel.
 * Counts visits and Mini App usage only. Never stores practice text.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const STORE_PATH = resolve(root, "data", "bot-stats.json");

const MAX_EVENTS = 250;
const DAY_MS = 24 * 60 * 60 * 1000;

export const PRACTICE_LABELS = {
  mood: "Дневник настроения",
  gratitude: "Благодарность",
  emotions: "Эмоции",
  questions: "Генератор вопросов",
  abc: "ABC-дневник",
  wheel: "Колесо баланса",
  breath: "Практика дыхания",
  "ideal-day": "Идеальный день",
  "five-whys": "5 почему",
  decision: "Определиться с выбором",
};

function emptyStore() {
  return {
    version: 1,
    adminIds: [],
    users: {},
    daily: {},
    events: [],
  };
}

export function loadStore() {
  try {
    if (!existsSync(STORE_PATH)) return emptyStore();
    const raw = JSON.parse(readFileSync(STORE_PATH, "utf8"));
    if (!raw || typeof raw !== "object") return emptyStore();
    return {
      version: 1,
      adminIds: Array.isArray(raw.adminIds) ? raw.adminIds.map(Number).filter(Boolean) : [],
      users: raw.users && typeof raw.users === "object" ? raw.users : {},
      daily: raw.daily && typeof raw.daily === "object" ? raw.daily : {},
      events: Array.isArray(raw.events) ? raw.events : [],
    };
  } catch {
    return emptyStore();
  }
}

export function saveStore(store) {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  const tmp = `${STORE_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(store, null, 2));
  renameSync(tmp, STORE_PATH);
}

export function dayKey(ts = Date.now()) {
  return new Date(ts).toISOString().slice(0, 10);
}

function emptyDay() {
  return {
    newUsers: 0,
    starts: 0,
    botTouches: 0,
    appOpens: 0,
    practices: 0,
    active: {},
    appActive: {},
  };
}

function ensureDay(store, key) {
  if (!store.daily[key]) store.daily[key] = emptyDay();
  return store.daily[key];
}

function emptyUser(id, nowIso) {
  return {
    id,
    firstName: "",
    lastName: "",
    username: "",
    language: "",
    firstSeenAt: nowIso,
    lastSeenAt: nowIso,
    lastBotAt: "",
    lastAppAt: "",
    starts: 0,
    botMessages: 0,
    appOpens: 0,
    appHeartbeats: 0,
    practices: {},
    blocked: false,
  };
}

export function upsertUser(store, from, now = Date.now()) {
  if (!from?.id) return null;
  const id = String(from.id);
  const nowIso = new Date(now).toISOString();
  const isNew = !store.users[id];
  const user = store.users[id] || emptyUser(from.id, nowIso);
  user.id = from.id;
  if (from.first_name) user.firstName = String(from.first_name);
  if (from.last_name != null) user.lastName = String(from.last_name);
  if (from.username != null) user.username = String(from.username);
  if (from.language_code) user.language = String(from.language_code);
  user.lastSeenAt = nowIso;
  user.blocked = false;
  store.users[id] = user;
  if (isNew) {
    const day = ensureDay(store, dayKey(now));
    day.newUsers += 1;
  }
  return user;
}

function pushEvent(store, userId, type, now, extra) {
  store.events.push({
    at: new Date(now).toISOString(),
    userId,
    type,
    ...(extra ? extra : {}),
  });
  if (store.events.length > MAX_EVENTS) {
    store.events.splice(0, store.events.length - MAX_EVENTS);
  }
}

export function recordBotTouch(store, from, { start = false } = {}, now = Date.now()) {
  const user = upsertUser(store, from, now);
  if (!user) return;
  user.lastBotAt = new Date(now).toISOString();
  user.botMessages += 1;
  if (start) user.starts += 1;
  const day = ensureDay(store, dayKey(now));
  day.botTouches += 1;
  if (start) day.starts += 1;
  day.active[String(user.id)] = true;
  pushEvent(store, user.id, start ? "start" : "bot", now);
}

export function recordBlocked(store, from, blocked, now = Date.now()) {
  const user = upsertUser(store, from, now);
  if (!user) return;
  user.blocked = Boolean(blocked);
  user.lastSeenAt = new Date(now).toISOString();
  pushEvent(store, user.id, blocked ? "blocked" : "unblocked", now);
}

export function recordAppEvent(store, from, event, practice, now = Date.now()) {
  const user = upsertUser(store, from, now);
  if (!user) return;
  const nowIso = new Date(now).toISOString();
  user.lastAppAt = nowIso;
  const day = ensureDay(store, dayKey(now));
  day.active[String(user.id)] = true;
  day.appActive[String(user.id)] = true;

  if (event === "open") {
    user.appOpens += 1;
    day.appOpens += 1;
    pushEvent(store, user.id, "app_open", now);
    return;
  }
  if (event === "practice") {
    const key = PRACTICE_LABELS[practice] ? practice : "other";
    user.practices[key] = (user.practices[key] || 0) + 1;
    day.practices += 1;
    pushEvent(store, user.id, "practice", now, { practice: key });
    return;
  }
  user.appHeartbeats += 1;
  pushEvent(store, user.id, "app_active", now);
}

export function mergeAdminIds(store, envIds) {
  const set = new Set([
    ...store.adminIds.map(Number).filter(Boolean),
    ...envIds.map(Number).filter(Boolean),
  ]);
  return [...set];
}

export function claimAdmin(store, userId) {
  const id = Number(userId);
  if (!id) return false;
  if (store.adminIds.includes(id)) return false;
  store.adminIds.push(id);
  return true;
}

function inWindow(iso, sinceMs) {
  if (!iso) return false;
  const t = Date.parse(iso);
  return Number.isFinite(t) && t >= sinceMs;
}

export function summarize(store, { now = Date.now(), days = 7 } = {}) {
  const users = Object.values(store.users);
  const alive = users.filter((u) => !u.blocked);
  const since = now - days * DAY_MS;
  const today = dayKey(now);
  const day = store.daily[today] || emptyDay();

  const startedBot = alive.length;
  const openedApp = alive.filter((u) => u.appOpens > 0).length;
  const activeBot = alive.filter((u) => inWindow(u.lastSeenAt, since)).length;
  const activeApp = alive.filter((u) => inWindow(u.lastAppAt, since)).length;
  const blocked = users.filter((u) => u.blocked).length;
  const newInWindow = alive.filter((u) => inWindow(u.firstSeenAt, since)).length;

  const practiceCounts = {};
  for (const u of users) {
    for (const [k, n] of Object.entries(u.practices || {})) {
      practiceCounts[k] = (practiceCounts[k] || 0) + n;
    }
  }

  let periodAppOpens = 0;
  let periodStarts = 0;
  let periodPractices = 0;
  let periodNew = 0;
  for (let i = 0; i < days; i++) {
    const key = dayKey(now - i * DAY_MS);
    const d = store.daily[key];
    if (!d) continue;
    periodAppOpens += d.appOpens || 0;
    periodStarts += d.starts || 0;
    periodPractices += d.practices || 0;
    periodNew += d.newUsers || 0;
  }

  return {
    totalUsers: users.length,
    startedBot,
    openedApp,
    activeBot,
    activeApp,
    blocked,
    newInWindow,
    todayNew: day.newUsers || 0,
    todayStarts: day.starts || 0,
    todayBot: day.botTouches || 0,
    todayAppOpens: day.appOpens || 0,
    todayPractices: day.practices || 0,
    todayAppUsers: Object.keys(day.appActive || {}).length,
    periodDays: days,
    periodAppOpens,
    periodStarts,
    periodPractices,
    periodNew,
    practiceCounts,
    totalAppOpens: users.reduce((s, u) => s + (u.appOpens || 0), 0),
  };
}

export function listRecentUsers(store, { offset = 0, limit = 8 } = {}) {
  const users = Object.values(store.users).sort(
    (a, b) => Date.parse(b.lastSeenAt || 0) - Date.parse(a.lastSeenAt || 0),
  );
  return {
    total: users.length,
    offset,
    users: users.slice(offset, offset + limit),
  };
}

export function parseAdminIdsEnv(raw) {
  if (!raw) return [];
  return String(raw)
    .split(/[,;\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}
