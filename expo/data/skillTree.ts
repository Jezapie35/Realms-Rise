export type SkillBranch = "commerce" | "military" | "faith" | "lineage" | "cross" | "pinnacle";

export interface SkillNodeDef {
  id: string;
  name: string;
  description: string;
  branch: SkillBranch;
  cost: number;
  requires: string[];
  requiresAll?: boolean;
  x: number;
  y: number;
  tier: number;
}

export const SKILL_TREE_NODES: SkillNodeDef[] = [
  // COMMERCE
  { id: "commerce_1", name: "Market Wisdom", description: "All buildings produce ×1.2.", branch: "commerce", cost: 1, requires: [], x: 120, y: 80, tier: 0 },
  { id: "commerce_2a", name: "Merchant Guild", description: "Market Stalls produce ×3.", branch: "commerce", cost: 2, requires: ["commerce_1"], x: 60, y: 220, tier: 1 },
  { id: "commerce_2b", name: "Trade Winds", description: "All building costs ×0.75.", branch: "commerce", cost: 3, requires: ["commerce_1"], x: 180, y: 220, tier: 1 },
  { id: "commerce_3a", name: "Banking House", description: "Earn 0.5% of current gold per minute as interest.", branch: "commerce", cost: 4, requires: ["commerce_2a"], x: 60, y: 380, tier: 2 },
  { id: "commerce_3b", name: "Silk Roads", description: "Unlocks legendary (tier-5) upgrades per building.", branch: "commerce", cost: 5, requires: ["commerce_2b"], x: 180, y: 380, tier: 2 },
  { id: "commerce_4", name: "Royal Exchange", description: "All commerce multipliers apply ×2.", branch: "commerce", cost: 6, requires: ["commerce_3a", "commerce_3b"], requiresAll: false, x: 120, y: 540, tier: 3 },

  // MILITARY
  { id: "military_1", name: "Iron Discipline", description: "Click power ×2.", branch: "military", cost: 1, requires: [], x: 300, y: 80, tier: 0 },
  { id: "military_2a", name: "War Machine", description: "Barracks and Castle Tower ×3.", branch: "military", cost: 2, requires: ["military_1"], x: 240, y: 220, tier: 1 },
  { id: "military_2b", name: "Siege Tactics", description: "Each click adds 2% of current GPS.", branch: "military", cost: 3, requires: ["military_1"], x: 360, y: 220, tier: 1 },
  { id: "military_3a", name: "Standing Army", description: "Each building owned adds 0.1% to click power.", branch: "military", cost: 4, requires: ["military_2a"], x: 240, y: 380, tier: 2 },
  { id: "military_3b", name: "Fortress", description: "Golden Coins appear twice as often and last 25s.", branch: "military", cost: 5, requires: ["military_2b"], x: 360, y: 380, tier: 2 },
  { id: "military_4", name: "Warlord", description: "Click power ×5 and +25% Seals per prestige.", branch: "military", cost: 6, requires: ["military_3a", "military_3b"], requiresAll: false, x: 300, y: 540, tier: 3 },

  // FAITH
  { id: "faith_1", name: "Divine Blessing", description: "Offline cap increases to 6 hours.", branch: "faith", cost: 1, requires: [], x: 480, y: 80, tier: 0 },
  { id: "faith_2a", name: "Sacred Rites", description: "Cathedral ×3.", branch: "faith", cost: 2, requires: ["faith_1"], x: 420, y: 220, tier: 1 },
  { id: "faith_2b", name: "Pilgrim Road", description: "All production ×3 for first 90s of each run.", branch: "faith", cost: 3, requires: ["faith_1"], x: 540, y: 220, tier: 1 },
  { id: "faith_3a", name: "Holy Order", description: "Carry one purchased upgrade across prestiges.", branch: "faith", cost: 4, requires: ["faith_2a"], x: 420, y: 380, tier: 2 },
  { id: "faith_3b", name: "Prophecy", description: "Golden Coin bonus value ×4.", branch: "faith", cost: 5, requires: ["faith_2b"], x: 540, y: 380, tier: 2 },
  { id: "faith_4", name: "Divine Right", description: "+2 free Royal Seals every prestige.", branch: "faith", cost: 6, requires: ["faith_3a", "faith_3b"], requiresAll: false, x: 480, y: 540, tier: 3 },

  // LINEAGE
  { id: "lineage_1", name: "Noble Heritage", description: "Start each run with 100 gold.", branch: "lineage", cost: 1, requires: [], x: 660, y: 80, tier: 0 },
  { id: "lineage_2a", name: "Royal Bloodline", description: "+1 Royal Seal per prestige.", branch: "lineage", cost: 2, requires: ["lineage_1"], x: 600, y: 220, tier: 1 },
  { id: "lineage_2b", name: "Ancient Wisdom", description: "Upgrade strip shows 3 additional bonus upgrades per run.", branch: "lineage", cost: 3, requires: ["lineage_1"], x: 720, y: 220, tier: 1 },
  { id: "lineage_3a", name: "Grand Dynasty", description: "Seals per prestige ×1.5.", branch: "lineage", cost: 4, requires: ["lineage_2a"], x: 600, y: 380, tier: 2 },
  { id: "lineage_3b", name: "Legacy of Builders", description: "Palace ×5. Royal Treasury ×2.", branch: "lineage", cost: 5, requires: ["lineage_2b"], x: 720, y: 380, tier: 2 },
  { id: "lineage_4", name: "Eternal Throne", description: "All multipliers ×1.5 per prestige (up to 10).", branch: "lineage", cost: 6, requires: ["lineage_3a", "lineage_3b"], requiresAll: false, x: 660, y: 540, tier: 3 },

  // CROSS BRANCH
  { id: "cross_1", name: "Economic Union", description: "Commerce and Military bonuses cross-apply.", branch: "cross", cost: 20, requires: ["commerce_4", "military_4"], requiresAll: true, x: 390, y: 700, tier: 4 },
  { id: "cross_2", name: "Sacred Economy", description: "All production ×2 permanently.", branch: "cross", cost: 20, requires: ["faith_4", "lineage_4"], requiresAll: true, x: 570, y: 700, tier: 4 },

  // PINNACLE
  { id: "pinnacle", name: "Immortal Crown", description: "All systems ×10. Golden Coins every 30s. Your kingdom is eternal.", branch: "pinnacle", cost: 50, requires: ["cross_1", "cross_2"], requiresAll: true, x: 480, y: 900, tier: 5 },
];

export const SKILL_NODE_BY_ID: Record<string, SkillNodeDef> = Object.fromEntries(
  SKILL_TREE_NODES.map((n) => [n.id, n]),
);

export const CANVAS_WIDTH = 840;
export const CANVAS_HEIGHT = 1000;

export function isNodeRequirementMet(node: SkillNodeDef, unlocked: string[]): boolean {
  if (node.requires.length === 0) return true;
  if (node.requiresAll === false) {
    return node.requires.some((r) => unlocked.includes(r));
  }
  return node.requires.every((r) => unlocked.includes(r));
}
