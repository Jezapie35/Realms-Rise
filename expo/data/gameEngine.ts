import { BUILDINGS } from "./buildings";
import { UPGRADES, UPGRADE_BY_ID } from "./upgrades";
import type { GameState, ActiveBonus } from "./gameState";
import { calculateLegacyBonuses } from "./legacyUpgrades";
import {
  getPlagueMultiplier,
  getEntropyMultiplier,
  getCrumblingMultiplier,
  isBuildingDisabled,
  isSkillTreeDisabled,
  isOnlyAllowedBuilding,
  getChallengeBuildingCostMultiplier,
  getAusterityProgress,
  calculateChallengeSeals,
} from "./challenges";
import {
  getCrownGPSMultiplier,
  getCrownClickMultiplier,
  getCrownOfflineCap,
  getCrownStartGold,
  getCrownSealCostMultiplier,
  getCrownEternalThroneBoost,
} from "./ascension";

export function getLegacyBonuses(state: GameState) {
  return calculateLegacyBonuses(
    state.legacyUpgrades ?? [],
    state.sealsTotal,
    state.prestigeCount,
    state.lifetimeClicks ?? 0,
    state.lastRunGps ?? 0,
  );
}

const BUILDING_BY_ID = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));

function totalBuildingCount(buildings: GameState["buildings"]): number {
  let n = 0;
  for (const id in buildings) n += buildings[id].count;
  return n;
}

export function calculateBuildingGPS(
  buildingId: string,
  count: number,
  purchasedUpgrades: string[],
  unlockedSkillNodes: string[],
  activeBonus: ActiveBonus | null,
  runStartTime: number,
  now: number,
  state?: GameState,
): number {
  const b = BUILDING_BY_ID[buildingId];
  if (!b || count <= 0) return 0;

  // Challenge: Silent Market disables specific buildings
  if (state && isBuildingDisabled(state, buildingId)) return 0;

  // Challenge: One Building — all others produce 0
  if (state && !isOnlyAllowedBuilding(state, buildingId)) return 0;

  // Challenge: Forsaken — rat infestation debuff
  const ratDebuffActive =
    state &&
    state.challenges.ratInfestationBuilding === buildingId &&
    now < state.challenges.ratInfestationExpiry;

  let gps = b.baseGPS * count;

  // Per-building upgrade multipliers
  for (const upgId of purchasedUpgrades) {
    const u = UPGRADE_BY_ID[upgId];
    if (!u) continue;
    for (const e of u.effects) {
      if (e.kind === "building_mult" && e.building === buildingId && e.multiplier) {
        gps *= e.multiplier;
      }
      if (e.kind === "synergy_mult" && e.buildings?.includes(buildingId) && e.multiplier) {
        gps *= e.multiplier;
      }
    }
  }

  // Skill tree building-specific (disabled during Forsaken challenge)
  const skillsActive = !state || !isSkillTreeDisabled(state);
  if (skillsActive) {
    let commerceMult = 1;
    if (buildingId === "market_stall" && unlockedSkillNodes.includes("commerce_2a")) commerceMult *= 2;
    if (buildingId === "barracks" || buildingId === "castle_tower") {
      if (unlockedSkillNodes.includes("military_2a")) gps *= 2;
      if (unlockedSkillNodes.includes("war_drums")) gps *= 2;
    }
    if (buildingId === "cathedral" && unlockedSkillNodes.includes("faith_2a")) gps *= 2;
    if (buildingId === "palace" && unlockedSkillNodes.includes("lineage_3b")) gps *= 3;
    if (buildingId === "royal_treasury" && unlockedSkillNodes.includes("lineage_3b")) gps *= 1.5;
    if (unlockedSkillNodes.includes("commerce_4") && buildingId === "market_stall") commerceMult *= 1.5;
    gps *= commerceMult;
    if (unlockedSkillNodes.includes("cross_1")) gps *= 1.5;
    if (unlockedSkillNodes.includes("faith_2b") && now - runStartTime < 60_000) gps *= 2;
  }

  // Crown: Eternal Throne boost ×10
  if (state && buildingId === "eternal_throne") {
    gps *= getCrownEternalThroneBoost(state);
  }

  // Rat infestation debuff: 50% production
  if (ratDebuffActive) gps *= 0.5;

  // Active gps bonus (ad reward)
  if (activeBonus?.type === "gps_boost" && now < activeBonus.expiresAt && activeBonus.multiplier) {
    gps *= activeBonus.multiplier;
  }

  return gps;
}

export function calculateTotalGPS(state: GameState, now: number = Date.now()): number {
  const legacy = getLegacyBonuses(state);
  const totalBuildings = totalBuildingCount(state.buildings);
  const skillsActive = !isSkillTreeDisabled(state);

  // 1. Base GPS from buildings
  let total = 0;
  for (const b of BUILDINGS) {
    const count = state.buildings[b.id]?.count ?? 0;
    let gps = calculateBuildingGPS(
      b.id,
      count,
      state.purchasedUpgrades,
      state.unlockedSkillNodes,
      state.activeBonus,
      state.runStartTime,
      now,
      state,
    );
    const perMult = legacy.perBuildingMult[b.id];
    if (perMult && perMult > 1) gps *= perMult;
    total += gps;
  }

  // 2. Building upgrade multipliers (global effects from upgrades)
  for (const id of state.purchasedUpgrades) {
    const u = UPGRADE_BY_ID[id];
    if (!u) continue;
    for (const e of u.effects) {
      if (e.kind === "global_gps_mult" && e.multiplier) total *= e.multiplier;
      if (e.kind === "building_count_bonus" && e.value) {
        total *= 1 + totalBuildings * e.value;
      }
    }
  }

  // 3. Skill tree global multipliers (disabled during Forsaken challenge)
  if (skillsActive) {
    if (state.unlockedSkillNodes.includes("commerce_1")) total *= 1.15;
    if (state.unlockedSkillNodes.includes("cross_2")) total *= 1.5;
    if (state.unlockedSkillNodes.includes("pinnacle")) total *= 5;
    if (state.unlockedSkillNodes.includes("lineage_4")) {
      total *= Math.pow(1.3, Math.min(state.prestigeCount, 10));
    }
  }

  // 4. Legacy multipliers
  total *= legacy.gpsMultiplier;

  // 5. Edict boosts (timed GPS boosts from edicts)
  for (const boost of state.edictBoosts ?? []) {
    if (boost.type === "gps_boost" && now < boost.expiresAt) total *= boost.multiplier;
  }

  // 6. Crown: Sovereign Blood + Dynasty Eternal + Blood of Ascendants
  total *= getCrownGPSMultiplier(state);

  // 7. Challenge: Plague season GPS reduction
  total *= getPlagueMultiplier(state);

  // 8. Challenge: Entropy decay
  total *= getEntropyMultiplier(state);

  // 9. Challenge: Crumbling Realm penalty per building over threshold
  total *= getCrumblingMultiplier(state, totalBuildings);

  const result = Math.max(0, total);
  return isFinite(result) ? Math.min(result, 1e250) : 0;
}

export function calculateGoldPerClick(
  state: GameState,
  now: number = Date.now(),
): number {
  // Idle Hands challenge: clicking does nothing (flat 1 gold)
  if (state.challenges.active === "ch_idle") return 1;

  let mult = 1;
  const u = state.unlockedSkillNodes;
  const skillsActive = !isSkillTreeDisabled(state);

  if (skillsActive) {
    if (u.includes("military_1")) mult *= 2;
    if (u.includes("military_4")) mult *= 3;
    if (u.includes("pinnacle")) mult *= 5;
  }

  // Click upgrades (always active regardless of challenge)
  for (const id of state.purchasedUpgrades) {
    const up = UPGRADE_BY_ID[id];
    if (!up) continue;
    for (const e of up.effects) {
      if (e.kind === "click_mult" && e.multiplier) mult *= e.multiplier;
    }
  }

  if (skillsActive) {
    if (u.includes("military_3a")) {
      mult *= 1 + totalBuildingCount(state.buildings) * 0.0005;
    }
    if (u.includes("lineage_4")) {
      mult *= Math.pow(1.3, Math.min(state.prestigeCount, 10));
    }
  }

  if (state.activeBonus?.type === "click_boost" && now < state.activeBonus.expiresAt) {
    mult *= state.activeBonus.multiplier;
  }

  // Edict click boosts
  for (const boost of state.edictBoosts ?? []) {
    if (boost.type === "click_boost" && now < boost.expiresAt) mult *= boost.multiplier;
  }

  const legacy = getLegacyBonuses(state);
  mult *= legacy.clickMultiplier;

  // Crown: Conqueror's Will
  mult *= getCrownClickMultiplier(state);

  let result = mult;

  // Kingdom Charter — add 1% of GPS per click (additive on base)
  if (state.purchasedUpgrades.includes("global_3")) {
    result += state.totalGPS * 0.01;
  }

  // Royal Touch — ensure click is at least 1% of GPS (max, after additives)
  if (state.purchasedUpgrades.includes("click_2")) {
    const fromGps = state.totalGPS * 0.01;
    if (fromGps > result) result = fromGps;
  }

  return Math.max(1, result);
}

export function calculateBuildingCost(
  buildingId: string,
  currentCount: number,
  unlockedSkillNodes: string[],
  purchasedUpgrades: string[],
  legacyUpgrades: string[] = [],
  state?: GameState,
): number {
  const b = BUILDING_BY_ID[buildingId];
  if (!b) return 0;
  let cost = Math.floor(b.baseCost * Math.pow(1.15, currentCount));
  if (unlockedSkillNodes.includes("commerce_2b")) cost = Math.floor(cost * 0.85);
  if (unlockedSkillNodes.includes("commerce_4")) cost = Math.floor(cost * 0.90);
  // Crown: Crowned Wisdom reduces skill node costs (handled in skill tree UI)
  // Legacy — Kingdom Records: first of each type costs 50% less
  if (currentCount === 0 && legacyUpgrades.includes("legacy_2")) {
    cost = Math.floor(cost * 0.5);
  }
  // Challenge modifiers
  if (state) {
    cost = Math.floor(cost * getChallengeBuildingCostMultiplier(state));
  }
  return cost;
}

export function calculateBuyBulkCost(
  buildingId: string,
  currentCount: number,
  quantity: number,
  unlockedSkillNodes: string[],
  purchasedUpgrades: string[],
  legacyUpgrades: string[] = [],
): number {
  let total = 0;
  for (let i = 0; i < quantity; i++) {
    total += calculateBuildingCost(buildingId, currentCount + i, unlockedSkillNodes, purchasedUpgrades, legacyUpgrades);
  }
  return total;
}

export function calculateBuyMaxCount(
  buildingId: string,
  currentGold: number,
  currentCount: number,
  unlockedSkillNodes: string[],
  purchasedUpgrades: string[],
  legacyUpgrades: string[] = [],
): number {
  let gold = currentGold;
  let n = 0;
  while (n < 10000) {
    const c = calculateBuildingCost(buildingId, currentCount + n, unlockedSkillNodes, purchasedUpgrades, legacyUpgrades);
    if (gold < c || gold - c === gold) break;
    gold -= c;
    n += 1;
  }
  return n;
}

export function calculatePrestigeSeals(state: GameState): number {
  const THRESHOLD = 100_000_000_000;
  if (!isFinite(state.totalGoldEarned) || state.totalGoldEarned < THRESHOLD) return 0;
  let seals = Math.floor(Math.log10(state.totalGoldEarned / THRESHOLD) * 5) + 2;
  seals = Math.max(seals, 2);
  const legacy = getLegacyBonuses(state);
  if (legacy.sealIncomeBonus > 0) seals = Math.floor(seals * (1 + legacy.sealIncomeBonus));
  if (state.unlockedSkillNodes.includes("lineage_3a")) seals = Math.floor(seals * 1.5);
  if (state.unlockedSkillNodes.includes("lineage_2a")) seals += 1;
  if (state.unlockedSkillNodes.includes("military_4")) seals = Math.ceil(seals * 1.15);
  if (state.unlockedSkillNodes.includes("faith_4")) seals += 2;
  // Apply challenge seal multiplier
  seals = calculateChallengeSeals(seals, state);
  return Math.max(seals, 0);
}

/** Helper exported for challenge banner: austerity progress. */
export { getAusterityProgress } from "./challenges";

export function canPrestige(state: GameState): boolean {
  if (state.prestigePhase === "legacy_shop") return false;
  if (state.totalGoldEarned < 100_000_000_000) return false;
  const differentBuildingsOwned = Object.values(state.buildings).filter((b) => b.count >= 1).length;
  return differentBuildingsOwned >= 5;
}

export function applyOfflineProgress(
  state: GameState,
  currentTime: number,
): { goldEarned: number; secondsElapsed: number } {
  // Challenge: The Long Night disables offline progress
  if (state.challenges.active === "ch_night") {
    return { goldEarned: 0, secondsElapsed: 0 };
  }
  const elapsed = Math.max(0, (currentTime - state.lastTimestamp) / 1000);
  let cap = state.unlockedSkillNodes.includes("faith_1") ? 21600 : 7200;
  // Crown: Iron Epoch extends to 12 hours (already 43200, larger than faith_1's 21600)
  const crownCap = getCrownOfflineCap(state);
  if (crownCap > cap) cap = crownCap;
  const capped = Math.min(elapsed, cap);
  const safeGPS = isFinite(state.totalGPS) ? state.totalGPS : 0;
  const goldEarned = safeGPS * capped * 0.5;
  return { goldEarned, secondsElapsed: elapsed };
}

export function isUpgradeAvailable(upgradeId: string, state: GameState): boolean {
  const u = UPGRADE_BY_ID[upgradeId];
  if (!u) return false;
  if (state.purchasedUpgrades.includes(upgradeId)) return false;
  const r = u.requires;
  if (r.buildingCounts) {
    for (const k in r.buildingCounts) {
      if ((state.buildings[k]?.count ?? 0) < r.buildingCounts[k]) return false;
    }
  }
  if (r.totalGold !== undefined && state.totalGoldEarned < r.totalGold) return false;
  if (r.totalClicks !== undefined && state.totalClicks < r.totalClicks) return false;
  if (r.goldenCoins !== undefined && state.goldenCoinsCollected < r.goldenCoins) return false;
  if (r.needsSilkRoads && !state.unlockedSkillNodes.includes("commerce_3b")) return false;
  return true;
}

const EARLY_MILESTONES_BASE      = [10, 25, 50, 100, 200, 250, 300, 350, 400, 450, 500];
const EARLY_MILESTONES_SILK_ROADS = [10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

export function getNextUpgradeMilestone(count: number, hasSilkRoads: boolean = false): number {
  const list = hasSilkRoads ? EARLY_MILESTONES_SILK_ROADS : EARLY_MILESTONES_BASE;
  for (const m of list) {
    if (count < m) return m;
  }
  return Math.ceil((count + 1) / 50) * 50;
}

export function availableUpgrades(state: GameState) {
  return UPGRADES.filter((u) => isUpgradeAvailable(u.id, state));
}

export function computeClickGoldReward(state: GameState, now: number = Date.now()): { add: number; flatSiegeBonus: number } {
  // goldPerClick already includes Kingdom Charter and Royal Touch GPS scaling
  let add = state.goldPerClick;
  let siege = 0;
  // Siege Tactics — 1% of GPS per click (kept separate for siege mechanic)
  if (state.unlockedSkillNodes.includes("military_2b")) {
    siege += state.totalGPS * 0.01;
  }
  return { add, flatSiegeBonus: siege };
}
