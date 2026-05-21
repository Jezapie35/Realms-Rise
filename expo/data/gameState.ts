import { BUILDINGS } from "./buildings";

export const SAVE_VERSION = 4;

export type BuyMode = "1" | "10" | "max" | "next";

/** After declaring sovereignty, spend seals in the legacy shop before a new run. */
export type PrestigePhase = "playing" | "legacy_shop";

export interface ActiveBonus {
  type: "gps_boost" | "click_boost";
  multiplier: number;
  expiresAt: number;
}

export interface GameState {
  gold: number;
  totalGoldEarned: number;
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
  lastTimestamp: number;
  runStartTime: number;
  activeBonus: ActiveBonus | null;
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
}

export function createInitialState(): GameState {
  const now = Date.now();
  const buildings: Record<string, { count: number }> = {};
  for (const b of BUILDINGS) buildings[b.id] = { count: 0 };
  return {
    gold: 0,
    totalGoldEarned: 0,
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
    lastTimestamp: now,
    runStartTime: now,
    activeBonus: null,
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
  };
}
