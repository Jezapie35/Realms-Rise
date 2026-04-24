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
  // Tier 0 — small quality-of-life GPS boost. ×1.2 is mild and appropriate for 3 seals.
  { id: "commerce_1", name: "Market Wisdom", description: "All buildings produce ×1.15.", branch: "commerce", cost: 3, requires: [], x: 120, y: 80, tier: 0 },
  // Tier 1a — single-building boost for 6 seals. ×2 is fair (was ×3, too strong for tier 1).
  { id: "commerce_2a", name: "Merchant Guild", description: "Market Stalls produce ×2.", branch: "commerce", cost: 6, requires: ["commerce_1"], x: 60, y: 220, tier: 1 },
  // Tier 1b — cost discount. 15% off (was 25%) is meaningful without trivialing the economy.
  { id: "commerce_2b", name: "Trade Winds", description: "All building costs ×0.85.", branch: "commerce", cost: 8, requires: ["commerce_1"], x: 180, y: 220, tier: 1 },
  // Tier 2a — interest income. 0.3%/min (was 0.5%) to avoid passive snowballing too fast.
  { id: "commerce_3a", name: "Banking House", description: "Earn 0.3% of current gold per minute as passive interest.", branch: "commerce", cost: 12, requires: ["commerce_2a"], x: 60, y: 380, tier: 2 },
  // Tier 2b — gate unlock. Same power, appropriate cost.
  { id: "commerce_3b", name: "Silk Roads", description: "Unlocks legendary (tier-5) upgrades per building.", branch: "commerce", cost: 15, requires: ["commerce_2b"], x: 180, y: 380, tier: 2 },
  // Tier 3 capstone — was "×2 all commerce multipliers" which double-dips hugely. Toned to +50% commerce bonus instead.
  { id: "commerce_4", name: "Royal Exchange", description: "Market Stalls produce ×3. All building costs ×0.9.", branch: "commerce", cost: 20, requires: ["commerce_3a", "commerce_3b"], requiresAll: false, x: 120, y: 540, tier: 3 },

  // MILITARY
  // Tier 0 — click ×2 is fair for 3 seals; clicks are not the main income source.
  { id: "military_1", name: "Iron Discipline", description: "Click power ×2.", branch: "military", cost: 3, requires: [], x: 300, y: 80, tier: 0 },
  // Tier 1a — two-building ×2 (was ×3, too strong at this tier).
  { id: "military_2a", name: "War Machine", description: "Barracks and Castle Tower produce ×2.", branch: "military", cost: 6, requires: ["military_1"], x: 240, y: 220, tier: 1 },
  // Tier 1b — siege bonus. 1% of GPS per click (was 2%) to keep clicking supplemental not dominant.
  { id: "military_2b", name: "Siege Tactics", description: "Each click adds 1% of current GPS.", branch: "military", cost: 8, requires: ["military_1"], x: 360, y: 220, tier: 1 },
  // Tier 2a — per-building click bonus. 0.05% each (was 0.1%) — scales with count so needs a cap.
  { id: "military_3a", name: "Standing Army", description: "Each building owned adds 0.05% to click power.", branch: "military", cost: 12, requires: ["military_2a"], x: 240, y: 380, tier: 2 },
  // Tier 2b — Golden Coin utility. Duration bonus only (was also double frequency — too strong combined).
  { id: "military_3b", name: "Fortress", description: "Golden Coins last 50% longer and appear more often.", branch: "military", cost: 15, requires: ["military_2b"], x: 360, y: 380, tier: 2 },
  // Tier 3 capstone — click ×3 (was ×5, excessive) + modest seal bonus of +15% (was +25%).
  { id: "military_4", name: "Warlord", description: "Click power ×3 and +15% Seals per prestige.", branch: "military", cost: 20, requires: ["military_3a", "military_3b"], requiresAll: false, x: 300, y: 540, tier: 3 },

  // FAITH
  // Tier 0 — offline cap to 6h. Good quality-of-life, not a power spike. Fair at 3 seals.
  { id: "faith_1", name: "Divine Blessing", description: "Offline earnings cap increases from 2 hours to 5 hours.", branch: "faith", cost: 3, requires: [], x: 480, y: 80, tier: 0 },
  // Tier 1a — Cathedral ×2 (was ×3 — same as War Machine, both toned to ×2 for parity).
  { id: "faith_2a", name: "Sacred Rites", description: "Cathedral produces ×2.", branch: "faith", cost: 6, requires: ["faith_1"], x: 420, y: 220, tier: 1 },
  // Tier 1b — early-run boost. ×2 for 60s (was ×3 for 90s — strong but brief, toned slightly).
  { id: "faith_2b", name: "Pilgrim Road", description: "All production ×2 for the first 60 seconds of each run.", branch: "faith", cost: 8, requires: ["faith_1"], x: 540, y: 220, tier: 1 },
  // Tier 2a — Holy Order carry. Unique and powerful, cost appropriate. Kept as-is.
  { id: "faith_3a", name: "Holy Order", description: "Carry one purchased upgrade across prestiges.", branch: "faith", cost: 14, requires: ["faith_2a"], x: 420, y: 380, tier: 2 },
  // Tier 2b — Golden Coin value ×2 (was ×4 — too explosive mid-game).
  { id: "faith_3b", name: "Prophecy", description: "Golden Coin bonus value ×2.", branch: "faith", cost: 15, requires: ["faith_2b"], x: 540, y: 380, tier: 2 },
  // Tier 3 capstone — +1 seal per prestige (was +2 — seal generation should be gradual).
  { id: "faith_4", name: "Divine Right", description: "+1 free Royal Seal every prestige.", branch: "faith", cost: 20, requires: ["faith_3a", "faith_3b"], requiresAll: false, x: 480, y: 540, tier: 3 },

  // LINEAGE
  // Tier 0 — starting gold of 500 (was 100 — trivially small, bumped to feel rewarding at 3 seals).
  { id: "lineage_1", name: "Noble Heritage", description: "Start each run with 500 gold.", branch: "lineage", cost: 3, requires: [], x: 660, y: 80, tier: 0 },
  // Tier 1a — +1 seal per prestige. Modest but compounds; fair at 6 seals.
  { id: "lineage_2a", name: "Royal Bloodline", description: "+1 Royal Seal per prestige.", branch: "lineage", cost: 6, requires: ["lineage_1"], x: 600, y: 220, tier: 1 },
  // Tier 1b — +2 extra upgrade choices (was +3 — slightly toned so the strip isn't overwhelming).
  { id: "lineage_2b", name: "Ancient Wisdom", description: "Upgrade strip shows 2 additional bonus upgrades per run.", branch: "lineage", cost: 8, requires: ["lineage_1"], x: 720, y: 220, tier: 1 },
  // Tier 2a — seals ×1.25 (was ×1.5 — compounds heavily, toned for balance).
  { id: "lineage_3a", name: "Grand Dynasty", description: "Seals earned per prestige ×1.25.", branch: "lineage", cost: 14, requires: ["lineage_2a"], x: 600, y: 380, tier: 2 },
  // Tier 2b — Palace ×3 and Treasury ×1.5 (was ×5 and ×2 — those are mid-game buildings, kept reasonable).
  { id: "lineage_3b", name: "Legacy of Builders", description: "Palace produces ×3. Royal Treasury produces ×1.5.", branch: "lineage", cost: 15, requires: ["lineage_2b"], x: 720, y: 380, tier: 2 },
  // Tier 3 capstone — ×1.3 per prestige up to 10 (was ×1.5 — ×1.5^10 = ~57x total, far too strong; ×1.3^10 = ~13.8x, powerful but earned).
  { id: "lineage_4", name: "Eternal Throne", description: "All production ×1.3 per prestige completed (stacks up to 10 times).", branch: "lineage", cost: 20, requires: ["lineage_3a", "lineage_3b"], requiresAll: false, x: 660, y: 540, tier: 3 },

  // CROSS BRANCH
  // Removed the vague "cross-apply" mechanic for commerce_4/military_4 (it was poorly defined in the engine and caused unintended stacking).
  // Replaced with clear, measurable, non-redundant bonuses.
  { id: "cross_1", name: "Economic Union", description: "All buildings produce ×1.5. Building costs reduced by 10%.", branch: "cross", cost: 50, requires: ["commerce_4", "military_4"], requiresAll: true, x: 390, y: 700, tier: 4 },
  // Sacred Economy ×1.5 (was ×2 — at this tier combined with other stacks ×2 is way over the top).
  { id: "cross_2", name: "Sacred Economy", description: "All production ×1.5 permanently.", branch: "cross", cost: 50, requires: ["faith_4", "lineage_4"], requiresAll: true, x: 570, y: 700, tier: 4 },

  // PINNACLE — the true endgame reward. ×5 (was ×10 — combined with every other multiplier active at this point ×10 is absurd).
  { id: "pinnacle", name: "Immortal Crown", description: "All production ×5. Click power ×5. Golden Coins spawn every 45 seconds. Your kingdom is eternal.", branch: "pinnacle", cost: 120, requires: ["cross_1", "cross_2"], requiresAll: true, x: 480, y: 900, tier: 5 },
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
