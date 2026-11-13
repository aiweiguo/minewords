/**
 * MW-66 / Ship B smoke: empty-room hub anchors + decoration progress glanceability.
 * Run: node scripts/smoke-ship-b-hub-anchors.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const hubSrc = readFileSync(join(root, "src/components/HubRoom.tsx"), "utf8");
assert.match(hubSrc, /mw-hub-player/);
assert.match(hubSrc, /mw-hub-player-silhouette/);
assert.match(hubSrc, /mw-hub-rack-waiting/);
assert.match(hubSrc, /待挂/);
assert.match(hubSrc, /mw-hub-decor-meter/);
assert.match(hubSrc, /roomIsSparse/);
assert.match(hubSrc, /这是我的房间/);
assert.doesNotMatch(
  hubSrc,
  /仪表盘|goal-strip-stack|encyclopedia/,
  "no dashboard / encyclopedia rewrite markers",
);

const decorateSrc = readFileSync(
  join(root, "src/components/BaseDecorationPanel.tsx"),
  "utf8",
);
assert.match(decorateSrc, /mw-hub-decorate-bar/);
assert.match(decorateSrc, /mw-hub-decorate-count/);
assert.match(decorateSrc, /mw-hub-decorate-awaiting/);
assert.match(decorateSrc, /学词点亮房间装饰/);

const css = readFileSync(join(root, "src/styles/globals.css"), "utf8");
assert.match(css, /\.mw-hub-player/);
assert.match(css, /\.mw-hub-player-silhouette/);
assert.match(css, /\.mw-hub-rack-waiting/);
assert.match(css, /\.mw-hub-rack-peg/);
assert.match(css, /\.mw-hub-decor-meter/);
assert.match(css, /\.mw-hub-decor-pip/);
assert.match(css, /\.mw-hub-decorate-bar/);
assert.match(css, /mw-hub-player-idle/);

// Scope guard: Ship B must not grow furniture encyclopedia rows.
const decoData = readFileSync(
  join(root, "src/data/baseDecorations.ts"),
  "utf8",
);
const decoIds = [...decoData.matchAll(/id:\s*"deco-[^"]+"/g)];
assert.equal(
  decoIds.length,
  10,
  `expected 10 base decorations, got ${decoIds.length}`,
);

console.log("MW-66 Ship B hub-empty-anchors smoke OK", {
  decoCount: decoIds.length,
  anchors: ["player-silhouette", "rack-waiting", "decor-meter"],
});
