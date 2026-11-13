/**
 * MW-68 / Ship D smoke: Explore mini scene + enter transition; Fight enlarged
 * monster stage + hit/defeat 2D animation markers.
 * Run: node scripts/smoke-ship-d-spatial.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const exploreSrc = readFileSync(
  join(root, "src/components/ExploreZonePicker.tsx"),
  "utf8",
);
assert.match(exploreSrc, /mw-explore-portal-scene/);
assert.match(exploreSrc, /mw-explore-portal-mob/);
assert.match(exploreSrc, /mw-explore-enter/);
assert.match(exploreSrc, /走进去打怪/);
assert.match(exploreSrc, /startEnter/);
assert.match(exploreSrc, /prefersReducedMotion/);
assert.match(exploreSrc, /ENTER_MS = 900/);
assert.doesNotMatch(
  exploreSrc,
  /three\.js|WebGLRenderer|@react-three/,
  "no 3D engine",
);

const fightSrc = readFileSync(join(root, "src/app/fight/page.tsx"), "utf8");
assert.match(fightSrc, /mw-fight-page/);
assert.match(fightSrc, /mw-fight-page-entered/);
assert.match(fightSrc, /mw-fight-encounters/);

const monsterSrc = readFileSync(
  join(root, "src/components/WordMonsterCard.tsx"),
  "utf8",
);
assert.match(monsterSrc, /mw-monster-stage/);
assert.match(monsterSrc, /mw-monster-sprite/);
assert.match(monsterSrc, /mw-monster-stage-defeat/);
assert.match(monsterSrc, /mw-damage-float/);
assert.match(monsterSrc, /mw-monster-poof/);
assert.match(monsterSrc, /setDefeatAnim\(true\)/);
assert.match(monsterSrc, /playGameSfx\("hit"\)/);
assert.match(monsterSrc, /ListenOnce|listenOnce|开口攻击/);

const css = readFileSync(join(root, "src/styles/globals.css"), "utf8");
assert.match(css, /\.mw-explore-portal-scene/);
assert.match(css, /\.mw-explore-enter/);
assert.match(css, /@keyframes mw-explore-enter-zoom/);
assert.match(css, /\.mw-monster-sprite/);
assert.match(css, /@keyframes mw-monster-defeat/);
assert.match(css, /@keyframes mw-damage-float/);
assert.match(css, /\.mw-fight-page-entered/);

console.log("MW-68 Ship D explore/fight spatial smoke OK");
