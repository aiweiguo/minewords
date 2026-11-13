/**
 * MW-69 / Ship E smoke: decor celebrate (pop + goal bar + sfx) + parent quiet
 * + optional 「今晚玩多久」 soft tip (not a lock).
 * Run: node scripts/smoke-ship-e-decor-parent.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const hubSrc = read("src/components/HubRoom.tsx");
assert.match(hubSrc, /playGameSfx\("decor"\)/);
assert.match(hubSrc, /mw-weapon-goal-strip-celebrate/);
assert.match(hubSrc, /mw-hub-decor-meter-celebrate/);
assert.match(hubSrc, /mw-hub-deco-fresh/);
assert.match(hubSrc, /mw-deco-lit-toast/);
assert.match(hubSrc, /setDecorCelebrate\(true\)/);

const sfxSrc = read("src/lib/gameSfx.ts");
assert.match(sfxSrc, /"decor"/);
assert.match(sfxSrc, /decor light/);

const parentSrc = read("src/app/parent/page.tsx");
assert.match(parentSrc, /ParentSessionSoftTip/);
assert.match(parentSrc, /mw-parent-quiet-details/);
assert.match(parentSrc, /更多进度明细（旧指标）/);
assert.match(parentSrc, /一句话总结/);
// Summary / word lists live inside the collapsed details, not as open cards.
const detailsIdx = parentSrc.indexOf("mw-parent-quiet-details");
const summaryIdx = parentSrc.indexOf("一句话总结");
assert.ok(detailsIdx >= 0 && summaryIdx > detailsIdx, "summary inside quiet details");
assert.doesNotMatch(
  parentSrc,
  /oauth|cloud sync|AI scoring|biome encyclopedia/i,
  "no account / AI scoring / biome encyclopedia",
);

const tipUi = read("src/components/ParentSessionSoftTip.tsx");
assert.match(tipUi, /今晚玩多久/);
assert.match(tipUi, /也不会锁游戏/);
assert.match(tipUi, /writeParentSessionTip/);
assert.match(tipUi, /先不设/);
assert.match(tipUi, /clearParentSessionTip/);

const tipLib = read("src/lib/parentSessionTip.ts");
assert.match(tipLib, /PARENT_SESSION_TIP_KEY/);
assert.match(tipLib, /reminder only/);
assert.match(tipLib, /never a lock/);
assert.match(tipLib, /parentSessionTipLabel/);

// Tiny localStorage-contract check (mirrors tip helpers without importing TS).
const KEY = "mw-parent-session-tip-v1";
const mem = new Map();
const storage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
storage.setItem(KEY, JSON.stringify({ date: "2026-11-13", choice: 20 }));
const raw = JSON.parse(storage.getItem(KEY));
assert.equal(raw.choice, 20);
assert.equal(raw.date, "2026-11-13");
storage.removeItem(KEY);
assert.equal(storage.getItem(KEY), null);

const css = read("src/styles/globals.css");
assert.match(css, /\.mw-weapon-goal-strip-celebrate/);
assert.match(css, /\.mw-hub-decor-meter-celebrate/);
assert.match(css, /\.mw-hub-deco-fresh/);
assert.match(css, /\.mw-parent-session-tip/);
assert.match(css, /\.mw-parent-quiet-details/);

console.log("MW-69 Ship E decor-celebrate + parent-quiet smoke OK");
