import { BUILDINGS } from "./buildings";
import { UPGRADES, UPGRADE_BY_ID } from "./upgrades";
import type { GameState, ActiveBonus } from "./gameState";
import { calculateLegacyBonuses } from "./legacyUpgrades";

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
): number {
  const b = BUILDING_BY_ID[buildingId];
  if (!b || count <= 0) return 0;
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

  // Skill tree building-specific
  let commerceMult = 1;
  if (buildingId === "market_stall" && unlockedSkillNodes.includes("commerce_2a")) commerceMult *= 3;
  if (buildingId === "barracks" || buildingId === "castle_tower") {
    if (unlockedSkillNodes.includes("military_2a")) gps *= 3;
    if (unlockedSkillNodes.includes("war_drums")) gps *= 2;
  }
  if (buildingId === "cathedral" && unlockedSkillNodes.includes("faith_2a")) gps *= 3;
  if (buildingId === "palace" && unlockedSkillNodes.includes("lineage_3b")) gps *= 5;
  if (buildingId === "royal_treasury" && unlockedSkillNodes.includes("lineage_3b")) gps *= 2;

  // Royal Exchange: commerce multipliers apply ×2
  if (unlockedSkillNodes.includes("commerce_4") && commerceMult > 1) commerceMult *= 2;
  gps *= commerceMult;

  // Economic Union — cross branch commerce/military cross-apply
  if (unlockedSkillNodes.includes("cross_1")) {
    if (buildingId === "market_stall" || buildingId === "barracks" || buildingId === "castle_tower") {
      gps *= 1.5;
    }
  }

  // Holy Land / Pilgrim Road — early-run boost
  if (unlockedSkillNodes.includes("faith_2b") && now - runStartTime < 90_000) {
    gps *= 3;
  }

  // Active gps bonus
  if (activeBonus?.type === "gps_boost" && now < activeBonus.expiresAt && activeBonus.multiplier) {
    gps *= activeBonus.multiplier;
  }

  return gps;
}

function applyLegacyPerBuilding(state: GameState, buildingId: string, gps: number): number {
  const bonuses = getLegacyBonuses(state);
  const mult = bonuses.perBuildingMult[buildingId];
  if (mult && mult > 1) return gps * mult;
  return gps;
}

export function calculateTotalGPS(state: GameState, now: number = Date.now()): number {
  let total = 0;
  for (const b of BUILDINGS) {
    const count = state.buildings[b.id]?.count ?? 0;
    const gps = calculateBuildingGPS(
      b.id,
      count,
      state.purchasedUpgrades,
      state.unlockedSkillNodes,
      state.activeBonus,
      state.runStartTime,
      now,
    );
    total += applyLegacyPerBuilding(state, b.id, gps);
  }

  // Global upgrades
  for (const id of state.purchasedUpgrades) {
    const u = UPGRADE_BY_ID[id];
    if (!u) continue;
    for (const e of u.effects) {
      if (e.kind === "global_gps_mult" && e.multiplier) total *= e.multiplier;
      if (e.kind === "building_count_bonus" && e.value) {
        const n = totalBuildingCount(state.buildings);
        total *= 1 + n * e.value;
      }
    }
  }

  // Skill tree globals
  if (state.unlockedSkillNodes.includes("commerce_1")) total *= 1.2;
  if (state.unlockedSkillNodes.includes("cross_2")) total *= 2;
  if (state.unlockedSkillNodes.includes("pinnacle")) total *= 10;
  if (state.unlockedSkillNodes.includes("lineage_4")) {
    const stacks = Math.min(state.prestigeCount, 10);
    total *= Math.pow(1.5, stacks);
  }

  // Apply legacy bonuses as the final multiplier
  const legacy = getLegacyBonuses(state);
  total *= legacy.gpsMultiplier;

  return total;
}

export function calculateGoldPerClick(
  state: GameState,
  now: number = Date.now(),
): number {
  let flat = 1;
  let mult = 1;
  const u = state.unlockedSkillNodes;

  if (u.includes("military_1")) mult *= 2;
  if (u.includes("military_4")) mult *= 5;
  if (u.includes("pinnacle")) mult *= 10;

  // Click upgrades
  for (const id of state.purchasedUpgrades) {
    const up = UPGRADE_BY_ID[id];
    if (!up) continue;
    for (const e of up.effects) {
      if (e.kind === "click_mult" && e.multiplier) mult *= e.multiplier;
    }
  }

  // Standing Army — 0.1% per building owned
  if (u.includes("military_3a")) {
    const n = totalBuildingCount(state.buildings);
    mult *= 1 + n * 0.001;
  }

  // Lineage Eternal Throne stack
  if (u.includes("lineage_4")) {
    const stacks = Math.min(state.prestigeCount, 10);
    mult *= Math.pow(1.5, stacks);
  }

  if (state.activeBonus?.type === "click_boost" && now < state.activeBonus.expiresAt && state.activeBonus.multiplier) {
    mult *= state.activeBonus.multiplier;
  }

  // Apply legacy click multiplier
  const legacy = getLegacyBonuses(state);
  mult *= legacy.clickMultiplier;

  let result = flat * mult;

  // Royal Touch — max with 1% of GPS
  if (state.purchasedUpgrades.includes("click_2")) {
    const fromGps = state.totalGPS * 0.01;
    if (fromGps > result) result = fromGps;
  }

  return Math.max(1, Math.floor(result));
}

export function calculateBuildingCost(
  buildingId: string,
  currentCount: number,
  unlockedSkillNodes: string[],
  purchasedUpgrades: string[],
  legacyUpgrades: string[] = [],
): number {
  const b = BUILDING_BY_ID[buildingId];
  if (!b) return 0;
  let cost = Math.floor(b.baseCost * Math.pow(1.15, currentCount));
  if (unlockedSkillNodes.includes("commerce_2b")) cost = Math.floor(cost * 0.75);
  // Legacy — Kingdom Records: first of each type costs 50% less
  if (currentCount === 0 && legacyUpgrades.includes("legacy_2")) {
    cost = Math.floor(cost * 0.5);
  }
  void purchasedUpgrades;
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
    if (gold < c) break;
    gold -= c;
    n += 1;
  }
  return n;
}

export function calculatePrestigeSeals(state: GameState): number {
  const THRESHOLD = 100_000_000_000;
  if (state.totalGoldEarned < THRESHOLD) return 0;
  let seals = Math.floor(Math.log10(state.totalGoldEarned / THRESHOLD) * 3);
  seals = Math.max(seals, 1);
  // Legacy — Golden Legacy: +1% per prestige to seal income
  const legacy = getLegacyBonuses(state);
  if (legacy.sealIncomeBonus > 0) seals = Math.floor(seals * (1 + legacy.sealIncomeBonus));
  if (state.unlockedSkillNodes.includes("lineage_3a")) seals = Math.floor(seals * 1.5);
  if (state.unlockedSkillNodes.includes("lineage_2a")) seals += 1;
  if (state.unlockedSkillNodes.includes("military_4")) seals = Math.ceil(seals * 1.25);
  if (state.unlockedSkillNodes.includes("faith_4")) seals += 2;
  return Math.max(seals, 0);
}

export function canPrestige(state: GameState): boolean {
  if (state.totalGoldEarned < 100_000_000_000) return false;
  const differentBuildingsOwned = Object.values(state.buildings).filter((b) => b.count >= 1).length;
  return differentBuildingsOwned >= 5;
}

export function applyOfflineProgress(
  state: GameState,
  currentTime: number,
): { goldEarned: number; secondsElapsed: number } {
  const elapsed = Math.max(0, (currentTime - state.lastTimestamp) / 1000);
  const cap = state.unlockedSkillNodes.includes("faith_1") ? 21600 : 7200;
  const capped = Math.min(elapsed, cap);
  // Offline earnings are 50% of normal GPS
  const goldEarned = state.totalGPS * capped * 0.5;
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

export function availableUpgrades(state: GameState) {
  return UPGRADES.filter((u) => isUpgradeAvailable(u.id, state));
}

export function computeClickGoldReward(state: GameState, now: number = Date.now()): { add: number; flatSiegeBonus: number } {
  let add = state.goldPerClick;
  let siege = 0;
  // Kingdom Charter — 1% of GPS per click
  if (state.purchasedUpgrades.includes("global_3")) {
    add += state.totalGPS * 0.01;
  }
  // Siege Tactics — 2% of GPS per click
  if (state.unlockedSkillNodes.includes("military_2b")) {
    siege += state.totalGPS * 0.02;
  }
  void now;
  return { add, flatSiegeBonus: siege };
}
