/**
 * MW-54 / MW-62 smoke: progress filter by weapon tier/zone + claim ignores guide quiz.
 * Mirrors src/lib/dailyAdventure.ts eligibility + prefer rules (no bundler).
 * Run: node scripts/smoke-daily-adventure.mjs
 */
import assert from "node:assert/strict";

const ACTION_KINDS = new Set(["fight", "craft", "trade", "home"]);

const weaponTiers = [
  "wooden-sword",
  "stone-sword",
  "iron-sword",
  "diamond-sword",
];

const GOAL_ZONE = {
  "wooden-sword": "forest",
  "stone-sword": "cave",
  "iron-sword": "mines",
  "diamond-sword": "crystal",
};

const templates = [
  { slug: "forest-wood", actionKind: "fight", exploreZoneId: "forest" },
  { slug: "craft-wood-sword", actionKind: "craft" },
  { slug: "place-home", actionKind: "home" },
  {
    slug: "cave-stone",
    actionKind: "fight",
    exploreZoneId: "cave",
    requiredUnlockedWeaponId: "wooden-sword",
  },
  {
    slug: "craft-stone-sword",
    actionKind: "craft",
    requiredUnlockedWeaponId: "wooden-sword",
  },
  {
    slug: "mines-iron",
    actionKind: "fight",
    exploreZoneId: "mines",
    requiredUnlockedWeaponId: "stone-sword",
  },
  {
    slug: "craft-iron-sword",
    actionKind: "craft",
    requiredUnlockedWeaponId: "stone-sword",
  },
  {
    slug: "crystal-diamond",
    actionKind: "fight",
    exploreZoneId: "crystal",
    requiredUnlockedWeaponId: "iron-sword",
  },
  {
    slug: "emerald-trade",
    actionKind: "trade",
    requiredUnlockedWeaponId: "iron-sword",
  },
  {
    slug: "craft-diamond-sword",
    actionKind: "craft",
    requiredUnlockedWeaponId: "iron-sword",
  },
];

function zoneUnlocked(zoneId, unlocked) {
  if (zoneId === "forest") return true;
  if (zoneId === "cave") return unlocked.includes("wooden-sword");
  if (zoneId === "mines") return unlocked.includes("stone-sword");
  if (zoneId === "crystal") return unlocked.includes("iron-sword");
  return false;
}

function eligible(t, unlocked) {
  if (
    t.requiredUnlockedWeaponId &&
    !unlocked.includes(t.requiredUnlockedWeaponId)
  ) {
    return false;
  }
  if (t.exploreZoneId && !zoneUnlocked(t.exploreZoneId, unlocked)) return false;
  return true;
}

function getCurrentWeaponGoal(unlockedIds) {
  for (const id of weaponTiers) {
    if (!unlockedIds.includes(id)) return id;
  }
  return null;
}

/** Prefer templates that feed the current weapon goal (MW-54). */
function preferForProgress(pool, unlockedIds) {
  const goal = getCurrentWeaponGoal(unlockedIds);
  const goalZone = goal ? GOAL_ZONE[goal] : null;
  const lineComplete = !goal;

  const preferred = pool.filter((template) => {
    if (template.actionKind === "home") return true;
    if (lineComplete) {
      return template.actionKind === "fight" || template.actionKind === "trade";
    }
    if (template.actionKind === "fight") {
      return template.exploreZoneId === goalZone;
    }
    if (template.actionKind === "craft") {
      if (!template.requiredUnlockedWeaponId) {
        return goal === "wooden-sword";
      }
      const reqIndex = weaponTiers.indexOf(template.requiredUnlockedWeaponId);
      const next = weaponTiers[reqIndex + 1];
      return next === goal;
    }
    if (template.actionKind === "trade") {
      return goal === "diamond-sword";
    }
    return false;
  });

  return preferred.length > 0 ? preferred : pool;
}

function canClaim(plan, speakLoop) {
  const needed = plan.actionCount ?? 1;
  const progress = speakLoop[plan.actionKind] ?? 0;
  // guideDone intentionally unused
  return progress >= needed;
}

function playHref(plan) {
  switch (plan.actionKind) {
    case "fight":
      return "/explore";
    case "craft":
      return "/crafting";
    case "trade":
      return "/trade";
    case "home":
      return "/";
    default:
      return "/explore";
  }
}

// Early save: no diamond / emerald / crystal
const early = templates.filter((t) => eligible(t, []));
assert.ok(
  early.every((t) => t.slug !== "emerald-trade"),
  "early must not get emerald trade",
);
assert.ok(
  early.every((t) => t.slug !== "crystal-diamond"),
  "early must not get crystal",
);
assert.ok(
  early.every((t) => t.slug !== "craft-diamond-sword"),
  "early must not get diamond craft",
);
assert.ok(early.some((t) => t.slug === "forest-wood"), "early keeps forest fight");
assert.ok(early.some((t) => t.slug === "place-home"), "early keeps home");

const iron = templates.filter((t) =>
  eligible(t, ["wooden-sword", "stone-sword", "iron-sword"]),
);
assert.ok(iron.some((t) => t.slug === "emerald-trade"), "iron unlocks trade day");
assert.ok(iron.some((t) => t.slug === "crystal-diamond"), "iron unlocks crystal");

assert.ok(
  templates.every((t) => ACTION_KINDS.has(t.actionKind)),
  "all templates are fight|craft|trade|home",
);

// Prefer: wood goal → forest fight + wood craft (+ home), not cave/mines.
const woodPrefer = preferForProgress(early, []);
assert.ok(
  woodPrefer.every(
    (t) =>
      t.actionKind === "home" ||
      t.exploreZoneId === "forest" ||
      t.slug === "craft-wood-sword",
  ),
  "wood goal prefers forest/wood craft/home",
);
assert.ok(
  woodPrefer.some((t) => t.slug === "forest-wood"),
  "wood prefer keeps forest fight",
);
assert.ok(
  !woodPrefer.some((t) => t.exploreZoneId === "cave"),
  "wood prefer excludes cave",
);

// Stone goal (wooden unlocked): cave fight + stone craft.
const afterWood = ["wooden-sword"];
const stonePool = templates.filter((t) => eligible(t, afterWood));
const stonePrefer = preferForProgress(stonePool, afterWood);
assert.ok(
  stonePrefer.some((t) => t.slug === "cave-stone"),
  "stone goal prefers cave fight",
);
assert.ok(
  stonePrefer.some((t) => t.slug === "craft-stone-sword"),
  "stone goal prefers stone craft",
);
assert.ok(
  !stonePrefer.some((t) => t.slug === "forest-wood"),
  "stone goal drops forest fight from prefer pool",
);

// Diamond goal (iron unlocked): crystal + emerald trade + diamond craft.
const afterIron = ["wooden-sword", "stone-sword", "iron-sword"];
const diamondPrefer = preferForProgress(
  templates.filter((t) => eligible(t, afterIron)),
  afterIron,
);
assert.ok(
  diamondPrefer.some((t) => t.slug === "crystal-diamond"),
  "diamond goal prefers crystal",
);
assert.ok(
  diamondPrefer.some((t) => t.slug === "emerald-trade"),
  "diamond goal prefers emerald trade",
);
assert.ok(
  diamondPrefer.some((t) => t.slug === "craft-diamond-sword"),
  "diamond goal prefers diamond craft",
);

// Line-complete: fight + trade + home only (no craft days).
const allWeapons = [
  "wooden-sword",
  "stone-sword",
  "iron-sword",
  "diamond-sword",
];
const postLine = preferForProgress(
  templates.filter((t) => eligible(t, allWeapons)),
  allWeapons,
);
assert.ok(
  postLine.every((t) => ["fight", "trade", "home"].includes(t.actionKind)),
  "post-diamond prefer is fight|trade|home",
);

// CTA hrefs stay on speak loop — never /quests or /guides.
for (const t of templates) {
  const href = playHref(t);
  assert.ok(!href.includes("/quests"), "no quest island CTA");
  assert.ok(!href.includes("/guides"), "no guide island CTA");
}

const fightPlan = {
  actionKind: "fight",
  actionCount: 2,
  guideId: "fight-zombie",
};
assert.equal(
  canClaim(fightPlan, { fight: 0, craft: 0, trade: 0, home: 0 }),
  false,
);
assert.equal(
  canClaim(fightPlan, { fight: 2, craft: 0, trade: 0, home: 0 }),
  true,
);
// Completing guide alone must NOT unlock claim
assert.equal(canClaim(fightPlan, { fight: 0 }), false);

console.log("MW-54/62 daily-adventure smoke OK", {
  earlyCount: early.length,
  ironCount: iron.length,
  woodPrefer: woodPrefer.map((t) => t.slug),
  stonePrefer: stonePrefer.map((t) => t.slug),
  diamondPrefer: diamondPrefer.map((t) => t.slug),
  postLine: postLine.map((t) => t.slug),
});
