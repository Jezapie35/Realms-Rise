import type { GameState } from "./gameState";
import { BUILDINGS } from "./buildings";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChallengeTier = "iron" | "steel" | "legendary";

export interface ChallengeModifier {
  type: string;
  [key: string]: unknown;
}

export interface Challenge {
  id: string;
  tier: ChallengeTier;
  name: string;
  multiplier: number;
  flavour: string;
  modifier: ChallengeModifier;
  requiresSelection?: boolean;
}

// ─── Challenge definitions ────────────────────────────────────────────────────

export const CHALLENGES: Challenge[] = [
  // ── Iron tier — 2× seal multiplier ──
  {
    id: "ch_hungry",
    tier: "iron",
    name: "The Hungry Kingdom",
    multiplier: 2.0,
    flavour: "The coffers ran dry. Every stone costs twice what it should.",
    modifier: { type: "building_cost_multiplier", value: 1.5 },
  },
  {
    id: "ch_idle",
    tier: "iron",
    name: "Idle Hands",
    multiplier: 2.0,
    flavour: "A king who cannot act must trust his kingdom to run itself.",
    modifier: { type: "click_disabled" },
  },
  {
    id: "ch_silent",
    tier: "iron",
    name: "The Silent Market",
    multiplier: 2.0,
    flavour: "Trade routes collapsed overnight.",
    modifier: { type: "building_gps_zero", buildings: ["market_stall", "harbor"] },
  },
  {
    id: "ch_taxed",
    tier: "iron",
    name: "Taxed to Ruin",
    multiplier: 2.0,
    flavour: "The tax collectors have turned on the crown.",
    modifier: { type: "gold_drain_percent", percent: 0.05, intervalSeconds: 60 },
  },
  // ── Steel tier — 3.5× seal multiplier ──
  {
    id: "ch_austerity",
    tier: "steel",
    name: "Age of Austerity",
    multiplier: 3.5,
    flavour: "The scholars went on strike. Upgrades are a luxury the realm cannot afford.",
    modifier: { type: "upgrades_locked_until_gps_threshold", thresholdPercent: 0.01 },
  },
  {
    id: "ch_crumbling",
    tier: "steel",
    name: "The Crumbling Realm",
    multiplier: 3.5,
    flavour: "Overpopulation strains the realm.",
    modifier: { type: "building_count_penalty", countThreshold: 50, penaltyPerExtra: 0.10 },
  },
  {
    id: "ch_night",
    tier: "steel",
    name: "The Long Night",
    multiplier: 3.5,
    flavour: "The kingdom does not sleep. Neither do you.",
    modifier: { type: "offline_disabled" },
  },
  // ── Legendary tier — 7× seal multiplier ──
  {
    id: "ch_plague",
    tier: "legendary",
    name: "Plague Season",
    multiplier: 7.0,
    flavour: "The realm is sick. It may never fully recover.",
    modifier: {
      type: "plague",
      startingGPSPercent: 0.05,
      recoveryPerMinute: 0.003,
      spreadChanceOnPurchase: 0.15,
      spreadPenalty: 0.05,
      eventIntervalSeconds: 180,
    },
  },
  {
    id: "ch_entropy",
    tier: "legendary",
    name: "Entropy",
    multiplier: 7.0,
    flavour: "Everything falls apart. Everything.",
    modifier: {
      type: "entropy",
      startingDecayRate: 0.02,
      accelerationPerMinute: 0.005,
      collapseThreshold: 0.10,
      floor: 0.05,
    },
  },
  {
    id: "ch_forsaken",
    tier: "legendary",
    name: "The Forsaken Run",
    multiplier: 7.0,
    flavour: "Rule without power. Prove the realm is yours.",
    modifier: { type: "skill_tree_disabled" },
  },
  {
    id: "ch_one",
    tier: "legendary",
    name: "One Building",
    multiplier: 7.0,
    flavour: "A kingdom built on a single pillar.",
    modifier: { type: "single_building_only" },
    requiresSelection: true,
  },
  {
    id: "ch_siege",
    tier: "legendary",
    name: "The Eternal Siege",
    multiplier: 7.0,
    flavour: "The dragons demand tribute. Ignore them at your peril.",
    modifier: {
      type: "siege",
      coinLifetimeSeconds: 8,
      baseDrainPercent: 0.20,
      drainPerIntensity: 0.05,
      coinSpawnIntervalSeconds: 15,
    },
  },
];

export const CHALLENGE_BY_ID: Record<string, Challenge> = Object.fromEntries(
  CHALLENGES.map((c) => [c.id, c]),
);

// ─── Unlock conditions ────────────────────────────────────────────────────────

export function isChallengeUnlocked(challenge: Challenge, state: GameState): boolean {
  switch (challenge.tier) {
    case "iron":      return state.prestigeCount >= 1;
    case "steel":     return state.prestigeCount >= 5;
    case "legendary": return state.prestigeCount >= 15;
    default:          return false;
  }
}

// ─── Seal multiplier ──────────────────────────────────────────────────────────

export function calculateChallengeSeals(baseSeals: number, state: GameState): number {
  if (!state.challenges.active) return baseSeals;
  const challenge = CHALLENGE_BY_ID[state.challenges.active];
  if (!challenge) return baseSeals;
  let multiplier = challenge.multiplier;
  if (state.ascension.crownUpgrades.includes("crown_sovereign_epoch")) multiplier *= 2;
  return Math.floor(baseSeals * multiplier);
}

// ─── GPS modifiers ────────────────────────────────────────────────────────────

export function getPlagueMultiplier(state: GameState): number {
  if (state.challenges.active !== "ch_plague") return 1.0;
  const base = 0.05;
  return base + state.challenges.plagueRecovery * (1 - base);
}

export function getEntropyMultiplier(state: GameState): number {
  if (state.challenges.active !== "ch_entropy") return 1.0;
  return Math.max(0.05, state.challenges.entropyDecay);
}

export function getCrumblingMultiplier(state: GameState, totalBuildings: number): number {
  if (state.challenges.active !== "ch_crumbling") return 1.0;
  const threshold = 50;
  const extra = Math.max(0, totalBuildings - threshold);
  if (extra === 0) return 1.0;
  return Math.pow(0.90, extra);
}

export function isBuildingDisabled(state: GameState, buildingId: string): boolean {
  if (state.challenges.active !== "ch_silent") return false;
  return ["market_stall", "harbor"].includes(buildingId);
}

export function isSkillTreeDisabled(state: GameState): boolean {
  return state.challenges.active === "ch_forsaken";
}

export function isOnlyAllowedBuilding(state: GameState, buildingId: string): boolean {
  if (state.challenges.active !== "ch_one") return true;
  const selected = state.challenges.activeChallengeBuilding;
  if (!selected) return true;
  return buildingId === selected;
}

export function getChallengeBuildingCostMultiplier(state: GameState): number {
  const active = state.challenges.active;
  if (active === "ch_hungry") return 1.5;
  const now = Date.now();
  if (
    state.challenges.tempCostMultiplier > 1 &&
    now < state.challenges.tempCostMultiplierExpiry
  ) {
    return state.challenges.tempCostMultiplier;
  }
  return 1;
}

// ─── Siege config ─────────────────────────────────────────────────────────────

export function getSiegeConfig(state: GameState) {
  if (state.challenges.active !== "ch_siege") return null;
  return {
    lifetimeMs: 8_000,
    spawnIntervalMs: 15_000,
    drainOnExpiry:
      0.20 + state.challenges.siegeIntensity * 0.05,
  };
}

// ─── Austerity check ──────────────────────────────────────────────────────────

export function getAusterityProgress(state: GameState): { locked: boolean; progress: number } {
  if (state.challenges.active !== "ch_austerity") return { locked: false, progress: 1 };
  if (state.challenges.austerityUnlocked) return { locked: false, progress: 1 };
  const THRESHOLD = 100_000_000_000; // prestige gold requirement
  const gpsThreshold = THRESHOLD * 0.01;
  const progress = Math.min(1, state.totalGPS / gpsThreshold);
  return { locked: true, progress };
}

// ─── Plague random events ─────────────────────────────────────────────────────

export interface PlagueEvent {
  id: string;
  label: string;
  description: string;
}

export const PLAGUE_EVENTS: PlagueEvent[] = [
  { id: "rats",         label: "Rat Infestation",       description: "Your weakest building loses production for 2 minutes." },
  { id: "fever",        label: "Fever Spreads",          description: "Recovery progress cut by 10%." },
  { id: "gravediggers", label: "The Gravediggers Strike", description: "Building costs increased 25% for 90 seconds." },
  { id: "exodus",       label: "Mass Exodus",            description: "Lose 8% of current gold." },
];

export function pickPlagueEvent(): PlagueEvent {
  return PLAGUE_EVENTS[Math.floor(Math.random() * PLAGUE_EVENTS.length)];
}

/** Returns the building ID with the lowest GPS contribution (count > 0). */
export function getLowestGPSBuilding(state: GameState): string | null {
  let lowest: string | null = null;
  let lowestGPS = Infinity;
  for (const b of BUILDINGS) {
    const count = state.buildings[b.id]?.count ?? 0;
    if (count === 0) continue;
    const gps = b.baseGPS * count;
    if (gps < lowestGPS) { lowestGPS = gps; lowest = b.id; }
  }
  return lowest;
}

// ─── Medal evaluation ─────────────────────────────────────────────────────────

export type Medal = "bronze" | "silver" | "gold";

export function evaluateMedal(elapsedSeconds: number): Medal {
  if (elapsedSeconds <= 2700) return "gold";   // ≤ 45 minutes
  if (elapsedSeconds <= 7200) return "silver"; // ≤ 2 hours
  return "bronze";
}

export interface GoldMedalBonus {
  type: string;
  value: number;
  description: string;
}

export const GOLD_MEDAL_BONUSES: Record<string, GoldMedalBonus> = {
  ch_hungry:   { type: "building_cost_reduction",  value: 0.01, description: "All building costs permanently 1% cheaper." },
  ch_idle:     { type: "passive_gps",              value: 0.02, description: "All GPS +2% permanently." },
  ch_silent:   { type: "harbor_bonus",             value: 0.05, description: "Harbor GPS +5% permanently." },
  ch_taxed:    { type: "coin_gold_bonus",          value: 0.10, description: "Golden Coins give 10% more gold permanently." },
  ch_austerity:{ type: "upgrade_cost_reduction",   value: 0.05, description: "All upgrades 5% cheaper permanently." },
  ch_crumbling:{ type: "crumbling_threshold_bonus",value: 25,   description: "Crumbling Realm building threshold raised by 25." },
  ch_night:    { type: "offline_efficiency",       value: 0.05, description: "Offline efficiency +5% permanently." },
  ch_plague:   { type: "gps_floor_raise",          value: 0.02, description: "Plague Season GPS floor raised to 7%." },
  ch_entropy:  { type: "entropy_floor_raise",      value: 0.02, description: "Entropy floor raised to 7%." },
  ch_forsaken: { type: "free_skill_node",          value: 1,    description: "Start each run with 1 free skill node." },
  ch_one:      { type: "chosen_building_bonus",    value: 0.10, description: "Your chosen building type gets +10% GPS permanently." },
  ch_siege:    { type: "coin_lifetime_bonus",      value: 2,    description: "All Golden Coins last 2 seconds longer." },
};

// ─── Edicts ───────────────────────────────────────────────────────────────────

export interface Edict {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const EDICTS: Edict[] = [
  { id: "royal_decree",   name: "Royal Decree",   icon: "📜", description: "All GPS ×3 for 5 minutes." },
  { id: "war_chest",      name: "War Chest",       icon: "⚔️", description: "Instantly gain gold equal to 10 minutes of GPS." },
  { id: "kings_word",     name: "The King's Word", icon: "👑", description: "Next upgrade purchased costs 0 gold." },
  { id: "conscription",   name: "Conscription",    icon: "🗡️", description: "Click power ×2 for 10 minutes." },
  { id: "golden_harvest", name: "Golden Harvest",  icon: "🪙", description: "Immediately spawn 3 Golden Coins." },
];

export const EDICT_BY_ID: Record<string, Edict> = Object.fromEntries(
  EDICTS.map((e) => [e.id, e]),
);

export const MAX_EDICTS = 10;

// ─── Tier colors ──────────────────────────────────────────────────────────────

export const TIER_COLORS: Record<ChallengeTier, string> = {
  iron:      "#cc9a20",
  steel:     "#8a9ab0",
  legendary: "#8b1a1a",
};

export const TIER_LABELS: Record<ChallengeTier, string> = {
  iron:      "IRON",
  steel:     "STEEL",
  legendary: "LEGENDARY",
};
