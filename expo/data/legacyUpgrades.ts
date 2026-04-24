export interface LegacyUpgrade {
  id: string;
  name: string;
  cost: number;
  description: string;
  effect: string;
  requires: string[];
}

export const LEGACY_UPGRADES: LegacyUpgrade[] = [
  { id: "legacy_1", name: "Ancestral Memory", cost: 1, description: "Start each new run with 200 gold instead of 0.", effect: "start_gold_200", requires: [] },
  { id: "legacy_2", name: "Kingdom Records", cost: 1, description: "The first building of each type costs 50% less.", effect: "first_building_half_price", requires: [] },
  { id: "legacy_3", name: "Veteran Peasants", cost: 1, description: "Peasant Huts produce ×2 permanently.", effect: "peasant_hut_permanent_2x", requires: ["legacy_1"] },
  { id: "legacy_4", name: "Trade Legacy", cost: 2, description: "Market Stalls produce ×2 permanently.", effect: "market_stall_permanent_2x", requires: ["legacy_2"] },
  { id: "legacy_5", name: "Iron Legacy", cost: 2, description: "Blacksmiths produce ×2 permanently.", effect: "blacksmith_permanent_2x", requires: ["legacy_3"] },

  { id: "legacy_6", name: "Eternal Forge", cost: 3, description: "All buildings produce ×1.3 permanently.", effect: "all_gps_1_3x", requires: ["legacy_3", "legacy_4"] },
  { id: "legacy_7", name: "The Long Memory", cost: 3, description: "Start each run with click power ×2 already applied.", effect: "start_click_2x", requires: ["legacy_1"] },
  { id: "legacy_8", name: "Scouting Reports", cost: 3, description: "All buildings are revealed from the start of each run.", effect: "all_buildings_revealed", requires: ["legacy_2", "legacy_4"] },
  { id: "legacy_9", name: "Veteran Merchants", cost: 4, description: "Taverns and Mills produce ×2 permanently.", effect: "tavern_mill_permanent_2x", requires: ["legacy_5", "legacy_6"] },
  { id: "legacy_10", name: "Wartime Economy", cost: 4, description: "All buildings produce ×1.5 permanently. Stacks with Eternal Forge.", effect: "all_gps_1_5x", requires: ["legacy_6", "legacy_7"] },

  { id: "legacy_11", name: "Legendary Smiths", cost: 5, description: "Barracks, Cathedral, and Castle Tower produce ×2 permanently.", effect: "military_faith_permanent_2x", requires: ["legacy_9"] },
  { id: "legacy_12", name: "Seal of Gold", cost: 5, description: "Each Royal Seal ever earned permanently boosts all GPS by 2%.", effect: "gps_per_seal_2pct", requires: ["legacy_10"] },
  { id: "legacy_13", name: "Ancestral Wealth", cost: 5, description: "Start each run with gold equal to 1 minute of your previous run's GPS.", effect: "start_gold_prev_gps_1min", requires: ["legacy_8", "legacy_10"] },
  { id: "legacy_14", name: "The Great Chronicle", cost: 6, description: "Each prestige declared permanently boosts all GPS by 5%.", effect: "gps_per_prestige_5pct", requires: ["legacy_12"] },
  { id: "legacy_15", name: "Dynasty of Clicks", cost: 6, description: "Total lifetime clicks permanently boost click power by 0.001% each.", effect: "click_per_lifetime_click", requires: ["legacy_7", "legacy_11"] },

  { id: "legacy_16", name: "The Immortal Treasury", cost: 8, description: "Royal Treasury and Palace produce ×3 permanently.", effect: "treasury_palace_permanent_3x", requires: ["legacy_11", "legacy_13"] },
  { id: "legacy_17", name: "Blood of Kings", cost: 8, description: "All permanent legacy multipliers are increased by ×1.5.", effect: "legacy_mult_1_5x", requires: ["legacy_14", "legacy_15"] },
  { id: "legacy_18", name: "The Sovereign's Will", cost: 10, description: "All buildings produce ×3 permanently.", effect: "all_gps_3x", requires: ["legacy_16", "legacy_17"] },
  { id: "legacy_19", name: "Golden Legacy", cost: 10, description: "Each completed prestige run adds 1% to your Seal income formula permanently.", effect: "seal_income_per_prestige", requires: ["legacy_14", "legacy_16"] },
  { id: "legacy_20", name: "The Eternal Realm", cost: 12, description: "All production ×10. This is your legacy.", effect: "all_gps_10x", requires: ["legacy_18", "legacy_19"] },
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

  const legacyBoost = has("legacy_17") ? 1.5 : 1.0;
  const scale = (v: number) => 1 + (v - 1) * legacyBoost;

  let gpsMult = 1;
  let clickMult = 1;
  let startingGold = 0;
  const perBuildingMult: Record<string, number> = {};

  const addBuilding = (id: string, mult: number) => {
    const effective = scale(mult);
    perBuildingMult[id] = (perBuildingMult[id] ?? 1) * effective;
  };

  if (has("legacy_1")) startingGold += 200;
  if (has("legacy_3")) addBuilding("peasant_hut", 2);
  if (has("legacy_4")) addBuilding("market_stall", 2);
  if (has("legacy_5")) addBuilding("blacksmith", 2);
  if (has("legacy_6")) gpsMult *= scale(1.3);
  if (has("legacy_7")) clickMult *= scale(2);
  if (has("legacy_9")) { addBuilding("tavern", 2); addBuilding("mill", 2); }
  if (has("legacy_10")) gpsMult *= scale(1.5);
  if (has("legacy_11")) { addBuilding("barracks", 2); addBuilding("cathedral", 2); addBuilding("castle_tower", 2); }
  if (has("legacy_12")) gpsMult *= 1 + sealsTotal * 0.02;
  if (has("legacy_13")) startingGold += prevRunGps * 60;
  if (has("legacy_14")) gpsMult *= 1 + prestigeCount * 0.05;
  if (has("legacy_15")) clickMult *= 1 + lifetimeClicks * 0.00001;
  if (has("legacy_16")) { addBuilding("royal_treasury", 3); addBuilding("palace", 3); }
  if (has("legacy_18")) gpsMult *= scale(3);
  if (has("legacy_20")) gpsMult *= scale(10);

  return {
    gpsMultiplier: gpsMult,
    clickMultiplier: clickMult,
    startingGold,
    buildingsRevealedAll: has("legacy_8"),
    perBuildingMult,
    firstBuildingHalfPrice: has("legacy_2"),
    sealIncomeBonus: has("legacy_19") ? prestigeCount * 0.01 : 0,
  };
}
