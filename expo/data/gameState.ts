import { BUILDINGS } from "./buildings";

export const SAVE_VERSION = 5;

export type BuyMode = "1" | "10" | "max" | "next";

/** After declaring sovereignty, spend seals in the legacy shop before a new run. */
export type PrestigePhase = "playing" | "legacy_shop";

export interface ActiveBonus {
  type: "gps_boost" | "click_boost";
  multiplier: number;
  expiresAt: number;
}

export interface AscensionState {
  count: number;
  crowns: number;
  totalCrownsEarned: number;
  crownUpgrades: string[];
  crownFragments: number;
  totalFragmentsEarned: number;
  lifetimeGoldThisAscension: number;
}

export interface ChallengeState {
  active: string | null;
  activeStartTime: number | null;
  activeTier: string | null;
  completed: string[];
  medals: Record<string, string>; // challengeId → "bronze"|"silver"|"gold"
  edicts: string[];
  fragmentsEarned: number;
  // Plague
  plagueRecovery: number;
  lastPlagueEventTime: number;
  ratInfestationBuilding: string | null;
  ratInfestationExpiry: number;
  // Entropy
  entropyDecay: number;
  entropyDecayRate: number;
  entropyCollapsed: boolean;
  // Siege
  siegeIntensity: number;
  // Austerity
  austerityUnlocked: boolean;
  // One Building selection
  activeChallengeBuilding: string | null;
  // Taxed drain timer
  lastTaxedDrainTime: number;
  // Temporary cost multiplier (Gravediggers event)
  tempCostMultiplier: number;
  tempCostMultiplierExpiry: number;
  // Edict: free next upgrade
  freeNextUpgrade: boolean;
}

export const DEFAULT_ASCENSION_STATE: AscensionState = {
  count: 0,
  crowns: 0,
  totalCrownsEarned: 0,
  crownUpgrades: [],
  crownFragments: 0,
  totalFragmentsEarned: 0,
  lifetimeGoldThisAscension: 0,
};

export const DEFAULT_CHALLENGE_STATE: ChallengeState = {
  active: null,
  activeStartTime: null,
  activeTier: null,
  completed: [],
  medals: {},
  edicts: [],
  fragmentsEarned: 0,
  plagueRecovery: 1.0,
  lastPlagueEventTime: 0,
  ratInfestationBuilding: null,
  ratInfestationExpiry: 0,
  entropyDecay: 1.0,
  entropyDecayRate: 0.02,
  entropyCollapsed: false,
  siegeIntensity: 0,
  austerityUnlocked: false,
  activeChallengeBuilding: null,
  lastTaxedDrainTime: 0,
  tempCostMultiplier: 1,
  tempCostMultiplierExpiry: 0,
  freeNextUpgrade: false,
};

export interface GameState {
  gold: number;
  totalGoldEarned: number;
  lifetimeGoldAllTime: number;
  goldPerClick: number;
  totalGPS: number;
  totalClicks: number;
  prestigeCount: number;
  sealsAvailable: number;
  sealsTotal: number;
  buildings: Record<string, { count: number }>;
  purchasedUpgrades: string[];
  unlockedSkillNodes: string[];
  triggeredMilestones: string[];
  goldenCoinsCollected: number;
  carryOverUpgrade: string | null;
  carryOverUpgrades: string[];
  lastTimestamp: number;
  runStartTime: number;
  activeBonus: ActiveBonus | null;
  edictBoosts: ActiveBonus[];
  goldenCoinVisible: boolean;
  goldenCoinX: number;
  goldenCoinY: number;
  nextGoldenCoinTime: number;
  buyMode: BuyMode;
  saveVersion: number;
  lastInterestTick: number;
  legacyUpgrades: string[];
  lifetimeClicks: number;
  lastRunGps: number;
  prestigePhase: PrestigePhase;
  ascension: AscensionState;
  challenges: ChallengeState;
}

export function createInitialState(): GameState {
  const now = Date.now();
  const buildings: Record<string, { count: number }> = {};
  for (const b of BUILDINGS) buildings[b.id] = { count: 0 };
  return {
    gold: 0,
    totalGoldEarned: 0,
    lifetimeGoldAllTime: 0,
    goldPerClick: 1,
    totalGPS: 0,
    totalClicks: 0,
    prestigeCount: 0,
    sealsAvailable: 0,
    sealsTotal: 0,
    buildings,
    purchasedUpgrades: [],
    unlockedSkillNodes: [],
    triggeredMilestones: [],
    goldenCoinsCollected: 0,
    carryOverUpgrade: null,
    carryOverUpgrades: [],
    lastTimestamp: now,
    runStartTime: now,
    activeBonus: null,
    edictBoosts: [],
    goldenCoinVisible: false,
    goldenCoinX: 0,
    goldenCoinY: 0,
    nextGoldenCoinTime: now + 60_000 + Math.random() * 540_000,
    buyMode: "1",
    saveVersion: SAVE_VERSION,
    lastInterestTick: now,
    legacyUpgrades: [],
    lifetimeClicks: 0,
    lastRunGps: 0,
    prestigePhase: "playing",
    ascension: { ...DEFAULT_ASCENSION_STATE },
    challenges: { ...DEFAULT_CHALLENGE_STATE },
  };
}
