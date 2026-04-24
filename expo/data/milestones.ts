import type { GameState } from "./gameState";

export interface Milestone {
  id: string;
  title: string;
  desc: string;
  check: (s: GameState) => boolean;
}

export const MILESTONES: Milestone[] = [
  { id: "first_click", title: "A Humble Beginning", desc: "Your first gold coin.", check: (s) => s.totalGoldEarned >= 1 },
  { id: "first_building", title: "First Subject", desc: "A peasant joins your realm.", check: (s) => (s.buildings.peasant_hut?.count ?? 0) >= 1 },
  { id: "gold_1k", title: "Coin Hoarder", desc: "1,000 gold earned.", check: (s) => s.totalGoldEarned >= 1000 },
  { id: "gold_100k", title: "Local Legend", desc: "100,000 gold earned.", check: (s) => s.totalGoldEarned >= 100000 },
  { id: "gold_1m", title: "A True Realm", desc: "1 million gold. Sovereignty awaits.", check: (s) => s.totalGoldEarned >= 1_000_000 },
  { id: "gold_1b", title: "The Eternal Kingdom", desc: "One billion gold. You are legend.", check: (s) => s.totalGoldEarned >= 1_000_000_000 },
  { id: "first_upgrade", title: "Progress!", desc: "First upgrade purchased.", check: (s) => s.purchasedUpgrades.length >= 1 },
  { id: "all_buildings", title: "Full Kingdom", desc: "Every building type owned.", check: (s) => Object.values(s.buildings).every((b) => b.count >= 1) },
  { id: "prestige_1", title: "Sovereign", desc: "First sovereignty declared.", check: (s) => s.prestigeCount >= 1 },
  { id: "prestige_5", title: "Dynasty", desc: "Five kingdoms risen.", check: (s) => s.prestigeCount >= 5 },
  { id: "first_skill", title: "The Tree Awakens", desc: "First skill node unlocked.", check: (s) => s.unlockedSkillNodes.length >= 1 },
  { id: "hut_100", title: "Peasant Army", desc: "100 Peasant Huts built.", check: (s) => (s.buildings.peasant_hut?.count ?? 0) >= 100 },
  { id: "first_coin", title: "Fortune Favours", desc: "First Golden Coin collected.", check: (s) => s.goldenCoinsCollected >= 1 },
  {
    id: "full_branch",
    title: "Branch Mastered",
    desc: "An entire skill branch unlocked.",
    check: (s) =>
      ["commerce", "military", "faith", "lineage"].some((b) =>
        [`${b}_1`, `${b}_2a`, `${b}_2b`, `${b}_3a`, `${b}_3b`, `${b}_4`].every((n) => s.unlockedSkillNodes.includes(n)),
      ),
  },
  { id: "warlord", title: "Warlord", desc: "Unlocked the Warlord skill.", check: (s) => s.unlockedSkillNodes.includes("military_4") },
  { id: "pinnacle", title: "Immortal Crown", desc: "You have conquered everything.", check: (s) => s.unlockedSkillNodes.includes("pinnacle") },
  { id: "click_100k", title: "Devoted Ruler", desc: "50,000 taps. Impressive dedication.", check: (s) => s.totalClicks >= 50000 },
  { id: "syn_royal", title: "Royal Compound", desc: "Palace and Treasury working as one.", check: (s) => s.purchasedUpgrades.includes("syn_5") },
];
