import type { GameState, AscensionState } from "./gameState";
import { formatNumber } from "@/utils/formatNumber";

// ─── Crown Upgrades ───────────────────────────────────────────────────────────

export interface CrownUpgrade {
  id: string;
  tier: number;
  name: string;
  cost: number;
  description: string;
  requires: string[];
  requiresAscension?: number;
}

export const CROWN_UPGRADES: CrownUpgrade[] = [
  // Tier 1
  { id: "crown_ascendant_start",  tier: 1, cost: 1,  name: "Ascendant Start",     description: "Begin every run with 10 million gold.",                                               requires: [] },
  { id: "crown_crowned_wisdom",   tier: 1, cost: 1,  name: "Crowned Wisdom",      description: "Skill tree nodes cost 20% fewer Seals.",                                              requires: [] },
  { id: "crown_ancient_coffers",  tier: 1, cost: 1,  name: "Ancient Coffers",     description: "Legacy shop displays 3 additional upgrades.",                                         requires: [] },
  { id: "crown_eternal_momentum", tier: 1, cost: 2,  name: "Eternal Momentum",    description: "First 10 prestiges of each ascension award double Seals.",                           requires: [] },
  // Tier 2
  { id: "crown_sovereign_blood",  tier: 2, cost: 3,  name: "Sovereign Blood",     description: "All GPS permanently ×1.5.",                                                          requires: ["crown_ascendant_start"] },
  { id: "crown_conquerors_will",  tier: 2, cost: 3,  name: "Conqueror's Will",    description: "Click power permanently ×2.",                                                        requires: ["crown_crowned_wisdom"] },
  { id: "crown_iron_epoch",       tier: 2, cost: 4,  name: "Iron Epoch",          description: "Offline progress cap increased to 12 hours.",                                        requires: ["crown_ancient_coffers"] },
  { id: "crown_crowned_age",      tier: 2, cost: 4,  name: "The Crowned Age",     description: "Golden Coins guaranteed to spawn every 30 seconds.",                                 requires: ["crown_eternal_momentum"] },
  // Tier 3
  { id: "crown_dynasty_eternal",  tier: 3, cost: 6,  name: "Dynasty Eternal",     description: "All building base GPS ×2.",                                                          requires: ["crown_sovereign_blood", "crown_conquerors_will"] },
  { id: "crown_blood_ascendants", tier: 3, cost: 6,  name: "Blood of Ascendants", description: "Each completed ascension permanently adds 10% to all production (stacks up to 20).", requires: ["crown_iron_epoch", "crown_crowned_age"] },
  { id: "crown_undying_realm",    tier: 3, cost: 8,  name: "The Undying Realm",   description: "Holy Order carries 3 upgrades across prestiges instead of 1.",                       requires: ["crown_dynasty_eternal"] },
  { id: "crown_first_crown",      tier: 3, cost: 10, name: "The First Crown",     description: "All Crown upgrade effects ×1.25.",                                                   requires: ["crown_blood_ascendants"] },
  // Tier 4 (requires ascension 2)
  { id: "crown_realm_incarnate",  tier: 4, cost: 10, name: "Realm Incarnate",     description: "Once per prestige, one skill tree branch can be completed for free.",               requires: ["crown_undying_realm"],    requiresAscension: 2 },
  { id: "crown_sovereign_epoch",  tier: 4, cost: 12, name: "The Sovereign Epoch", description: "Challenge run Seal multipliers doubled permanently.",                                requires: ["crown_first_crown"],      requiresAscension: 2 },
  { id: "crown_undying_throne",   tier: 4, cost: 15, name: "The Undying Throne",  description: "Eternal Throne GPS ×10. Tapping the realm earns bonus gold equal to 1 min of GPS.", requires: ["crown_realm_incarnate", "crown_sovereign_epoch"], requiresAscension: 2 },
];

export const CROWN_BY_ID: Record<string, CrownUpgrade> = Object.fromEntries(
  CROWN_UPGRADES.map((u) => [u.id, u]),
);

// ─── Crown amplifier ──────────────────────────────────────────────────────────

export function getCrownAmplifier(state: GameState): number {
  return state.ascension.crownUpgrades.includes("crown_first_crown") ? 1.25 : 1.0;
}

function scaledEffect(baseValue: number, amplifier: number): number {
  return 1 + (baseValue - 1) * amplifier;
}

// ─── Crown GPS multipliers ────────────────────────────────────────────────────

export function getCrownGPSMultiplier(state: GameState): number {
  const crowns = state.ascension.crownUpgrades;
  const amp = getCrownAmplifier(state);
  let mult = 1;

  if (crowns.includes("crown_sovereign_blood"))  mult *= scaledEffect(1.5, amp);
  if (crowns.includes("crown_dynasty_eternal"))  mult *= scaledEffect(2.0, amp);

  // Blood of Ascendants: +10% per ascension, stacks up to 20
  if (crowns.includes("crown_blood_ascendants")) {
    const stacks = Math.min(state.ascension.count, 20);
    const perStack = scaledEffect(1.10, amp) - 1; // amplified bonus per stack
    mult *= 1 + stacks * perStack;
  }

  return mult;
}

export function getCrownClickMultiplier(state: GameState): number {
  const crowns = state.ascension.crownUpgrades;
  const amp = getCrownAmplifier(state);
  if (crowns.includes("crown_conquerors_will")) return scaledEffect(2.0, amp);
  return 1;
}

export function getCrownOfflineCap(state: GameState): number {
  if (state.ascension.crownUpgrades.includes("crown_iron_epoch")) return 43200; // 12 hours
  return 0; // not active
}

export function getCrownHolyOrderSlots(state: GameState): number {
  if (state.ascension.crownUpgrades.includes("crown_undying_realm")) return 3;
  return 1; // default
}

export function getCrownStartGold(state: GameState): number {
  if (state.ascension.crownUpgrades.includes("crown_ascendant_start")) return 10_000_000;
  return 0;
}

export function getCrownCoinSpawnInterval(state: GameState): number | null {
  if (state.ascension.crownUpgrades.includes("crown_crowned_age")) return 30_000;
  return null;
}

export function getCrownEternalThroneBoost(state: GameState): number {
  if (state.ascension.crownUpgrades.includes("crown_undying_throne")) return 10;
  return 1;
}

export function getCrownSealCostMultiplier(state: GameState): number {
  if (state.ascension.crownUpgrades.includes("crown_crowned_wisdom")) return 0.80;
  return 1.0;
}

// ─── Ascension gate ───────────────────────────────────────────────────────────

export interface AscensionRequirements {
  goldRequired: number;
  goldLabel: string;
  goldMet: boolean;
  prestigesMet: boolean;
  eternalRealmMet: boolean;
  canAscend: boolean;
}

const ASCENSION_GOLD_LABELS: Record<number, string> = {
  0: "The First Crown",
  1: "The Second Age",
  2: "Eternal Dominion",
  3: "Beyond the Veil",
};

export function getAscensionLabel(count: number): string {
  return ASCENSION_GOLD_LABELS[count] ?? `Ascension ${count + 1}`;
}

export function getAscensionRequirements(state: GameState): AscensionRequirements {
  const goldRequired = Math.pow(10, 24 + state.ascension.count * 3);
  const goldLabel = getAscensionLabel(state.ascension.count);
  const goldMet = state.ascension.lifetimeGoldThisAscension >= goldRequired;
  const prestigesMet = state.prestigeCount >= 25;
  const eternalRealmMet = state.legacyUpgrades.includes("legacy_20");
  return {
    goldRequired,
    goldLabel,
    goldMet,
    prestigesMet,
    eternalRealmMet,
    canAscend: goldMet && prestigesMet && eternalRealmMet,
  };
}

// ─── Crown formula ────────────────────────────────────────────────────────────

export function calculateCrownsEarned(state: GameState): number {
  const prestigeCount = state.prestigeCount;
  if (prestigeCount < 10) return 0;

  const base = Math.floor(Math.log10(prestigeCount / 10) * 3) + 1;
  const fragmentBonus = Math.floor(state.ascension.crownFragments / 5);

  const isEarlyPrestige = prestigeCount <= (state.ascension.count * 10) + 10;
  const momentumMultiplier =
    state.ascension.crownUpgrades.includes("crown_eternal_momentum") && isEarlyPrestige ? 2 : 1;

  return Math.max(1, base + fragmentBonus) * momentumMultiplier;
}

// ─── Ascension execute ────────────────────────────────────────────────────────

export function buildPostAscensionState(
  state: GameState,
  freshState: GameState,
): GameState {
  const crownsEarned = calculateCrownsEarned(state);
  const newCount = state.ascension.count + 1;
  const newCrowns = state.ascension.crowns + crownsEarned;

  const newAscension: AscensionState = {
    count: newCount,
    crowns: newCrowns,
    totalCrownsEarned: state.ascension.totalCrownsEarned + crownsEarned,
    crownUpgrades: [...state.ascension.crownUpgrades],
    crownFragments: state.ascension.crownFragments,
    totalFragmentsEarned: state.ascension.totalFragmentsEarned,
    lifetimeGoldThisAscension: 0,
  };

  return {
    ...freshState,
    ascension: newAscension,
    challenges: {
      ...freshState.challenges,
      completed: state.challenges.completed,
      medals: state.challenges.medals,
      fragmentsEarned: state.challenges.fragmentsEarned,
    },
    lifetimeGoldAllTime: state.lifetimeGoldAllTime,
    triggeredMilestones: state.triggeredMilestones,
    saveVersion: 5,
    crownsEarnedThisAscension: crownsEarned,
  } as GameState;
}

export function formatCrownGoldRequirement(state: GameState): string {
  const { goldRequired, goldLabel } = getAscensionRequirements(state);
  return `${formatNumber(goldRequired)} (${goldLabel})`;
}
