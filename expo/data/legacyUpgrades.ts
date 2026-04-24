export interface LegacyUpgrade {
  id: string;
  name: string;
  cost: number;
  description: string;
  effect: string;
  requires: string[];
}

export const LEGACY_UPGRADES: LegacyUpgrade[] = [
  // Tier 1 — cheap quality-of-life, no raw multipliers
  { id: "legacy_1", name: "Ancestral Memory", cost: 2, description: "Start each new run with 100,000 gold instead of 0.", effect: "start_gold_200", requires: [] },
  { id: "legacy_2", name: "Kingdom Records", cost: 2, description: "The first building of each type costs 30% less.", effect: "first_building_half_price", requires: [] },
  // Tier 2 — single-building permanent ×1.5 (was ×2 — permanent across all runs is strong, toned)
  { id: "legacy_3", name: "Veteran Peasants", cost: 4, description: "Peasant Huts produce ×1.5 permanently.", effect: "peasant_hut_permanent_2x", requires: ["legacy_1"] },
  { id: "legacy_4", name: "Trade Legacy", cost: 4, description: "Market Stalls produce ×1.5 permanently.", effect: "market_stall_permanent_2x", requires: ["legacy_2"] },
  { id: "legacy_5", name: "Iron Legacy", cost: 4, description: "Blacksmiths produce ×1.5 permanently.", effect: "blacksmith_permanent_2x", requires: ["legacy_3"] },
  // Tier 3 — global ×1.2 (was ×1.3) and click ×1.5 (was ×2)
  { id: "legacy_6", name: "Eternal Forge", cost: 6, description: "All buildings produce ×1.2 permanently.", effect: "all_gps_1_3x", requires: ["legacy_3", "legacy_4"] },
  { id: "legacy_7", name: "The Long Memory", cost: 6, description: "Start each run with click power ×1.5 already applied.", effect: "start_click_2x", requires: ["legacy_1"] },
  { id: "legacy_8", name: "Scouting Reports", cost: 6, description: "All buildings are revealed from the start of each run.", effect: "all_buildings_revealed", requires: ["legacy_2", "legacy_4"] },
  // Tier 4 — two-building ×1.5 (was ×2) and global ×1.3 (was ×1.5)
  { id: "legacy_9", name: "Veteran Merchants", cost: 8, description: "Taverns and Mills produce ×1.5 permanently.", effect: "tavern_mill_permanent_2x", requires: ["legacy_5", "legacy_6"] },
  { id: "legacy_10", name: "Wartime Economy", cost: 8, description: "All buildings produce ×1.3 permanently. Stacks with Eternal Forge.", effect: "all_gps_1_5x", requires: ["legacy_6", "legacy_7"] },
  // Tier 5 — three-building ×1.5 (was ×2), seal bonus 1% per seal (was 2%), prestige GPS +3% (was +5%)
  { id: "legacy_11", name: "Legendary Smiths", cost: 10, description: "Barracks, Cathedral, and Castle Tower produce ×1.5 permanently.", effect: "military_faith_permanent_2x", requires: ["legacy_9"] },
  { id: "legacy_12", name: "Seal of Gold", cost: 10, description: "Each Royal Seal ever earned permanently boosts all GPS by 1%.", effect: "gps_per_seal_2pct", requires: ["legacy_10"] },
  { id: "legacy_13", name: "Ancestral Wealth", cost: 10, description: "Start each run with gold equal to 30 seconds of your previous run's GPS.", effect: "start_gold_prev_gps_1min", requires: ["legacy_8", "legacy_10"] },
  // Tier 6 — prestige GPS bonus and click scaling both toned
  { id: "legacy_14", name: "The Great Chronicle", cost: 14, description: "Each prestige declared permanently boosts all GPS by 3%.", effect: "gps_per_prestige_5pct", requires: ["legacy_12"] },
  { id: "legacy_15", name: "Dynasty of Clicks", cost: 14, description: "Total lifetime clicks permanently boost click power by 0.0005% each.", effect: "click_per_lifetime_click", requires: ["legacy_7", "legacy_11"] },
  // Tier 7 — two-building ×2 (reasonable at this tier cost), legacy amp ×1.25 (was ×1.5)
  { id: "legacy_16", name: "The Immortal Treasury", cost: 18, description: "Royal Treasury and Palace produce ×2 permanently.", effect: "treasury_palace_permanent_3x", requires: ["legacy_11", "legacy_13"] },
  { id: "legacy_17", name: "Blood of Kings", cost: 18, description: "All permanent legacy multipliers are boosted by ×1.25.", effect: "legacy_mult_1_5x", requires: ["legacy_14", "legacy_15"] },
  // Tier 8 — global ×2 (was ×3) and seal bonus per prestige kept (it's a formula tweak, low impact early)
  { id: "legacy_18", name: "The Sovereign's Will", cost: 22, description: "All buildings produce ×2 permanently.", effect: "all_gps_3x", requires: ["legacy_16", "legacy_17"] },
  { id: "legacy_19", name: "Golden Legacy", cost: 22, description: "Each completed prestige run adds 0.5% to your Seal income formula permanently.", effect: "seal_income_per_prestige", requires: ["legacy_14", "legacy_16"] },
  // Final — ×5 (was ×10 — with Blood of Kings applying ×1.25 and all prior stacks, ×5 is already enormous)
  { id: "legacy_20", name: "The Eternal Realm", cost: 30, description: "All production ×5. This is your legacy.", effect: "all_gps_10x", requires: ["legacy_18", "legacy_19"] },
];

export const LEGACY_BY_ID: Record<string, LegacyUpgrade> = Object.fromEntries(
  LEGACY_UPGRADES.map((u) => [u.id, u]),
);

export interface LegacyBonuses {
  gpsMultiplier: number;
  clickMultiplier: number;
  startingGold: number;
  buildingsRevealedAll: boolean;
  perBuildingMult: Record<string, number>;
  firstBuildingHalfPrice: boolean;
  sealIncomeBonus: number;
}

export function calculateLegacyBonuses(
  purchased: string[],
  sealsTotal: number,
  prestigeCount: number,
  lifetimeClicks: number,
  prevRunGps: number,
): LegacyBonuses {
  const has = (id: string) => purchased.includes(id);

  const legacyBoost = has("legacy_17") ? 1.25 : 1.0;
  const scale = (v: number) => 1 + (v - 1) * legacyBoost;

  let gpsMult = 1;
  let clickMult = 1;
  let startingGold = 0;
  const perBuildingMult: Record<string, number> = {};

  const addBuilding = (id: string, mult: number) => {
    const effective = scale(mult);
    perBuildingMult[id] = (perBuildingMult[id] ?? 1) * effective;
  };

  // legacy_1: 100,000 starting gold (description updated)
  if (has("legacy_1")) startingGold += 100_000;
  // legacy_3/4/5/9/11: single-building ×1.5 (was ×2)
  if (has("legacy_3")) addBuilding("peasant_hut", 1.5);
  if (has("legacy_4")) addBuilding("market_stall", 1.5);
  if (has("legacy_5")) addBuilding("blacksmith", 1.5);
  // legacy_6: ×1.2 (was ×1.3)
  if (has("legacy_6")) gpsMult *= scale(1.2);
  // legacy_7: click ×1.5 (was ×2)
  if (has("legacy_7")) clickMult *= scale(1.5);
  if (has("legacy_9")) { addBuilding("tavern", 1.5); addBuilding("mill", 1.5); }
  // legacy_10: ×1.3 (was ×1.5)
  if (has("legacy_10")) gpsMult *= scale(1.3);
  if (has("legacy_11")) { addBuilding("barracks", 1.5); addBuilding("cathedral", 1.5); addBuilding("castle_tower", 1.5); }
  // legacy_12: 1% per seal (was 2%)
  if (has("legacy_12")) gpsMult *= 1 + sealsTotal * 0.01;
  // legacy_13: 30s of prev GPS (was 60s)
  if (has("legacy_13")) startingGold += prevRunGps * 30;
  // legacy_14: +3% per prestige (was +5%)
  if (has("legacy_14")) gpsMult *= 1 + prestigeCount * 0.03;
  // legacy_15: 0.0005% per lifetime click (was 0.001%)
  if (has("legacy_15")) clickMult *= 1 + lifetimeClicks * 0.000005;
  // legacy_16: ×2 (was ×3)
  if (has("legacy_16")) { addBuilding("royal_treasury", 2); addBuilding("palace", 2); }
  // legacy_18: ×2 (was ×3)
  if (has("legacy_18")) gpsMult *= scale(2);
  // legacy_20: ×5 (was ×10)
  if (has("legacy_20")) gpsMult *= scale(5);

  return {
    gpsMultiplier: gpsMult,
    clickMultiplier: clickMult,
    startingGold,
    buildingsRevealedAll: has("legacy_8"),
    perBuildingMult,
    firstBuildingHalfPrice: has("legacy_2"),
    sealIncomeBonus: has("legacy_19") ? prestigeCount * 0.005 : 0,
  };
}
