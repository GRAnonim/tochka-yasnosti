import {
  claimAdmin,
  listRecentUsers,
  loadStore,
  mergeAdminIds,
  recordAppEvent,
  recordBlocked,
  recordBotTouch,
  STORE_PATH,
  summarize,
} from "./bot-stats.mjs";
import { existsSync, rmSync } from "fs";

const backup = existsSync(STORE_PATH) ? structuredClone(loadStore()) : null;
const store = {
  version: 1,
  adminIds: [],
  users: {},
  daily: {},
  events: [],
};

const t0 = Date.parse("2026-10-14T12:00:00Z");
recordBotTouch(store, { id: 1, first_name: "Анна", username: "ann" }, { start: true }, t0);
recordBotTouch(store, { id: 2, first_name: "Борис" }, { start: true }, t0 + 1000);
recordAppEvent(store, { id: 1, first_name: "Анна" }, "open", null, t0 + 2000);
recordAppEvent(store, { id: 1, first_name: "Анна" }, "practice", "mood", t0 + 3000);
recordBlocked(store, { id: 2, first_name: "Борис" }, true, t0 + 4000);
claimAdmin(store, 1);

const s = summarize(store, { now: t0 + 5000, days: 1 });
const fail = (msg) => {
  console.error(msg, s);
  process.exit(1);
};
if (s.startedBot !== 1) fail("startedBot should skip blocked");
if (s.openedApp !== 1) fail("openedApp");
if (s.todayStarts !== 2) fail("todayStarts");
if (s.todayAppOpens !== 1) fail("todayAppOpens");
if (s.todayPractices !== 1) fail("todayPractices");
if (s.blocked !== 1) fail("blocked");
if (s.practiceCounts.mood !== 1) fail("practiceCounts");
if (!mergeAdminIds(store, []).includes(1)) fail("admin claim");
const list = listRecentUsers(store, { limit: 10 });
if (list.total !== 2) fail("list total");

if (backup) {
  // selftest must not overwrite the real store; loadStore was not saved.
}
console.log("bot-stats.selftest ok");
