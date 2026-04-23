import { BUILDINGS } from "./buildings";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface UpgradeEffect {
  kind:
    | "building_mult"
    | "synergy_mult"
    | "global_gps_mult"
    | "click_mult"
    | "building_count_bonus"
    | "click_from_gps"
    | "custom";
  building?: string;
  buildings?: string[];
  multiplier?: number;
  value?: number;
}

export interface UpgradeRequires {
  buildingCounts?: Record<string, number>;
  totalGold?: number;
  totalClicks?: number;
  goldenCoins?: number;
  needsSilkRoads?: boolean;
}

export interface Upgrade {
  id: string;
  buildingId: string;
  tier: number;
  rarity: Rarity;
  name: string;
  description: string;
  cost: number;
  requires: UpgradeRequires;
  effects: UpgradeEffect[];
}

const BUILDING_UPGRADE_NAMES: Record<string, string[]> = {
  peasant_hut: [
    "Thatched Roofing", "Stone Foundations", "Manor Homes", "Noble Estates",
    "Legendary Village", "Walled Hamlet", "Fertile Commons", "Ancestral Homestead",
    "Timbered Longhouses", "Guild Quarters", "Stonemason's District", "Immortal Village",
  ],
  market_stall: [
    "Better Goods", "Supply Routes", "Trade Monopoly", "Royal Franchise",
    "Merchant Empire", "Spice Routes", "Grand Bazaar", "Mercantile League",
    "Free City Charter", "Coin Cartel", "World Exchange", "Eternal Market",
  ],
  blacksmith: [
    "Tempered Steel", "Master's Apprentice", "Damascus Forge", "Royal Armoury",
    "Forge of Legends", "Black Anvil", "Smelting Foundry", "Warsmith's Hall",
    "Iron Cartel", "Runic Smithing", "Starforged Metal", "Forge Eternal",
  ],
  tavern: [
    "Imported Ale", "Bawdy Songs", "High-Stakes Dice", "Royal Vintner",
    "Tavern Empire", "Bard's Circuit", "Pilgrims' Rest", "Gambling Dens",
    "Smuggler's Wharf", "Honeyed Mead", "Feast Hall", "Eternal Revel",
  ],
  mill: [
    "Watermill", "Windmill Sails", "Grand Granary", "Royal Mills",
    "Kingdom Harvest", "Terraced Fields", "Plough Horse", "Great Silos",
    "Irrigation Works", "Bread Cartel", "Cloud Mills", "Harvest Eternal",
  ],
  barracks: [
    "Steel Arms", "War Banners", "Veterans' Hall", "Royal Legion",
    "Eternal Guard", "Crossbow Corps", "Cavalry Lances", "War College",
    "Iron Discipline", "Mercenary Contracts", "Dragon Knights", "Army Undying",
  ],
  cathedral: [
    "Sacred Relics", "Stained Glass", "Saint's Tomb", "Pilgrim Road",
    "Cathedral of Legends", "Holy Choir", "Blessed Vestments", "Reliquary Vaults",
    "Grand Basilica", "Papal Favour", "Divine Concord", "Cathedral Eternal",
  ],
  castle_tower: [
    "Murder Holes", "Ballistae", "Royal Garrison", "Iron Battlements",
    "Sky Spire", "Watchfires", "Trebuchet Platforms", "Inner Keep",
    "Moat Works", "Arrow Slits", "Obsidian Walls", "Sky Citadel",
  ],
  royal_treasury: [
    "Iron Vaults", "Royal Accountants", "Sovereign Mint", "Dragon Hoard",
    "Infinite Coffers", "Gilded Ledgers", "Crown Bonds", "Goldsmith Guild",
    "Sealed Vault", "Tax Reformation", "Jewelled Scepters", "Coffers Eternal",
  ],
  palace: [
    "Silk Tapestries", "Royal Feasts", "Gilded Halls", "Eternal Dynasty",
    "Palace of Legends", "Throne of Gold", "Marble Pillars", "Crystal Chandeliers",
    "Royal Menagerie", "Summer Palace", "Sky Gardens", "Palace Immortal",
  ],
};

// Tier spec — tiers 1-4 as before; tiers 5+ unlock every 50 counts after 100 (150, 200, 250, ...)
interface TierSpec { count: number; mult: number; rarity: Rarity; costMult: number; needsSilkRoads?: boolean }
const BASE_TIERS: TierSpec[] = [
  { count: 10,  mult: 2,    rarity: "common",    costMult: 120 },
  { count: 25,  mult: 3,    rarity: "uncommon",  costMult: 500 },
  { count: 50,  mult: 5,    rarity: "rare",      costMult: 2_000 },
  { count: 100, mult: 10,   rarity: "epic",      costMult: 8_000 },
  { count: 150, mult: 25,   rarity: "legendary", costMult: 25_000, needsSilkRoads: true },
  { count: 200, mult: 35,   rarity: "epic",      costMult: 300_000_000 },
  { count: 250, mult: 60,   rarity: "rare",      costMult: 10_000_000_000 },
  { count: 300, mult: 100,  rarity: "epic",      costMult: 300_000_000_000 },
  { count: 350, mult: 175,  rarity: "legendary", costMult: 10_000_000_000_000 },
  { count: 400, mult: 300,  rarity: "epic",      costMult: 300_000_000_000_000 },
  { count: 450, mult: 500,  rarity: "legendary", costMult: 10_000_000_000_000_000 },
  { count: 500, mult: 1000, rarity: "legendary", costMult: 300_000_000_000_000_000 },
];

// Continue tiers every 50 levels up to 5000, with ever-growing mults/costs.
function extendedTiers(): TierSpec[] {
  const list: TierSpec[] = [...BASE_TIERS];
  let mult = 1000;
  let costMult = 300_000_000_000_000_000;
  const rarityCycle: Rarity[] = ["epic", "legendary", "rare", "epic", "legendary"];
  let idx = 0;
  for (let count = 550; count <= 5000; count += 50) {
    mult = Math.floor(mult * 1.8);
    costMult = costMult * 30;
    list.push({
      count,
      mult,
      rarity: rarityCycle[idx % rarityCycle.length],
      costMult,
    });
    idx++;
  }
  return list;
}
const BUILDING_TIERS: TierSpec[] = extendedTiers();

const MASTERY_SUFFIXES: string[] = [
  "Mastery", "Ascendance", "Apotheosis", "Supremacy", "Zenith",
  "Dominion", "Paragon", "Transcendence", "Epoch", "Legacy",
  "Horizon", "Pinnacle", "Crucible", "Sanctum", "Reverie",
  "Covenant", "Oblivion", "Reckoning", "Aetherium", "Mythos",
  "Paradigm", "Eminence", "Exaltation", "Cosmic Order", "Infinity",
];

function masteryName(buildingName: string, index: number): string {
  const suffix = MASTERY_SUFFIXES[(index - 1) % MASTERY_SUFFIXES.length];
  const cycle = Math.floor((index - 1) / MASTERY_SUFFIXES.length) + 1;
  return cycle === 1 ? `${buildingName} ${suffix}` : `${buildingName} ${suffix} ${toRoman(cycle)}`;
}

function toRoman(n: number): string {
  const vals: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  let v = n;
  for (const [num, sym] of vals) {
    while (v >= num) { out += sym; v -= num; }
  }
  return out;
}

function buildingUpgrades(): Upgrade[] {
  const out: Upgrade[] = [];
  for (const b of BUILDINGS) {
    const names = BUILDING_UPGRADE_NAMES[b.id];
    for (let i = 0; i < BUILDING_TIERS.length; i++) {
      const t = BUILDING_TIERS[i];
      const name = names[i] ?? masteryName(b.name, i + 1 - names.length);
      out.push({
        id: `${b.id}_${i + 1}`,
        buildingId: b.id,
        tier: i + 1,
        rarity: t.rarity,
        name,
        description: `${b.name}s produce ×${t.mult}.`,
        cost: Math.floor(b.baseCost * t.costMult),
        requires: { buildingCounts: { [b.id]: t.count }, ...(t.needsSilkRoads ? { needsSilkRoads: true } : {}) },
        effects: [{ kind: "building_mult", building: b.id, multiplier: t.mult }],
      });
    }
  }
  return out;
}

const GLOBAL_UPGRADES: Upgrade[] = [
  { id: "global_1", buildingId: "_global", tier: 0, rarity: "uncommon", name: "Tax Reform", description: "All buildings +20% GPS.", cost: 900, requires: { totalGold: 1000 }, effects: [{ kind: "global_gps_mult", multiplier: 1.2 }] },
  { id: "global_2", buildingId: "_global", tier: 0, rarity: "uncommon", name: "Royal Proclamation", description: "Click power ×2.", cost: 8000, requires: { totalGold: 10000 }, effects: [{ kind: "click_mult", multiplier: 2 }] },
  { id: "global_3", buildingId: "_global", tier: 0, rarity: "rare", name: "Kingdom Charter", description: "Clicks add 1% of total GPS to earnings.", cost: 100_000, requires: { totalGold: 150_000 }, effects: [{ kind: "custom" }] },
  { id: "global_4", buildingId: "_global", tier: 0, rarity: "rare", name: "Golden Age", description: "All production ×1.5.", cost: 1_200_000, requires: { totalGold: 2_000_000 }, effects: [{ kind: "global_gps_mult", multiplier: 1.5 }] },
  { id: "global_5", buildingId: "_global", tier: 0, rarity: "epic", name: "Imperial Decree", description: "Each building owned adds +0.3% to all GPS.", cost: 15_000_000, requires: { totalGold: 30_000_000 }, effects: [{ kind: "building_count_bonus", value: 0.003 }] },
  { id: "global_6", buildingId: "_global", tier: 0, rarity: "epic", name: "Manifest Destiny", description: "All production ×2. Click power ×3.", cost: 200_000_000, requires: { totalGold: 500_000_000 }, effects: [{ kind: "global_gps_mult", multiplier: 2 }, { kind: "click_mult", multiplier: 3 }] },
  { id: "global_7", buildingId: "_global", tier: 0, rarity: "legendary", name: "Eternal Kingdom", description: "All production ×5. You are immortalised in legend.", cost: 2_000_000_000, requires: { totalGold: 10_000_000_000 }, effects: [{ kind: "global_gps_mult", multiplier: 5 }] },
  { id: "global_8", buildingId: "_global", tier: 0, rarity: "legendary", name: "Age of Gold", description: "All production ×3.", cost: 250_000_000, requires: { totalGold: 2_000_000_000 }, effects: [{ kind: "global_gps_mult", multiplier: 3 }] },
  { id: "global_9", buildingId: "_global", tier: 0, rarity: "legendary", name: "Continental Empire", description: "All production ×4. Click power ×4.", cost: 5_000_000_000, requires: { totalGold: 50_000_000_000 }, effects: [{ kind: "global_gps_mult", multiplier: 4 }, { kind: "click_mult", multiplier: 4 }] },
  { id: "global_10", buildingId: "_global", tier: 0, rarity: "legendary", name: "World Sovereign", description: "All production ×10.", cost: 100_000_000_000, requires: { totalGold: 1_000_000_000_000 }, effects: [{ kind: "global_gps_mult", multiplier: 10 }] },
  ...((): Upgrade[] => {
    const names = [
      "Golden Epoch", "Celestial Charter", "Astral Mandate", "Starbound Realm", "Cosmic Dominion",
      "Infinite Concord", "Beyond the Veil", "Eternity's Crown", "The Forever Reign", "All-Kingdom",
      "Transcendent Order", "Kingdom of Kingdoms", "Aeon Sovereign", "Mythic Hegemony", "Godhead Realm",
    ];
    const out: Upgrade[] = [];
    let cost = 500_000_000_000;
    let gold = 10_000_000_000_000;
    let mult = 6;
    for (let i = 0; i < names.length; i++) {
      out.push({
        id: `global_${11 + i}`,
        buildingId: "_global",
        tier: 0,
        rarity: "legendary",
        name: names[i],
        description: `All production ×${mult}.`,
        cost,
        requires: { totalGold: gold },
        effects: [{ kind: "global_gps_mult", multiplier: mult }],
      });
      cost *= 25;
      gold *= 30;
      mult = Math.floor(mult * 1.4);
    }
    return out;
  })(),
];

// Synergy upgrades at 100+ thresholds. Naming flavourful. Many of them.
const SYNERGY_UPGRADES: Upgrade[] = [
  { id: "syn_1", buildingId: "_synergy", tier: 0, rarity: "rare", name: "Merry Men", description: "Taverns and Barracks each ×2.", cost: 120_000_000, requires: { buildingCounts: { tavern: 15, barracks: 10 } }, effects: [{ kind: "synergy_mult", buildings: ["tavern", "barracks"], multiplier: 2 }] },
  { id: "syn_2", buildingId: "_synergy", tier: 0, rarity: "rare", name: "Holy Warriors", description: "Cathedral ×2. Barracks ×3.", cost: 800_000_000, requires: { buildingCounts: { cathedral: 10, barracks: 25 } }, effects: [{ kind: "synergy_mult", buildings: ["cathedral"], multiplier: 2 }, { kind: "synergy_mult", buildings: ["barracks"], multiplier: 3 }] },
  { id: "syn_3", buildingId: "_synergy", tier: 0, rarity: "uncommon", name: "Grain Trade", description: "Mills and Market Stalls each ×2.", cost: 12_000_000, requires: { buildingCounts: { mill: 10, market_stall: 15 } }, effects: [{ kind: "synergy_mult", buildings: ["mill", "market_stall"], multiplier: 2 }] },
  { id: "syn_4", buildingId: "_synergy", tier: 0, rarity: "epic", name: "Industrial Complex", description: "Blacksmiths and Mills each ×4.", cost: 45_000_000, requires: { buildingCounts: { blacksmith: 25, mill: 20 } }, effects: [{ kind: "synergy_mult", buildings: ["blacksmith", "mill"], multiplier: 4 }] },
  { id: "syn_5", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Royal Compound", description: "Palace ×3. Royal Treasury ×3.", cost: 100_000_000_000, requires: { buildingCounts: { palace: 1, royal_treasury: 20 } }, effects: [{ kind: "synergy_mult", buildings: ["palace", "royal_treasury"], multiplier: 3 }] },
  { id: "syn_6", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Castle Economy", description: "Castle Tower and Barracks each ×5.", cost: 2_700_000_000, requires: { buildingCounts: { castle_tower: 40, barracks: 50 } }, effects: [{ kind: "synergy_mult", buildings: ["castle_tower", "barracks"], multiplier: 5 }] },

  // 100+ milestone synergies — lots of them, balanced
  { id: "syn_100_hut", buildingId: "_synergy", tier: 0, rarity: "rare", name: "Village Kingdom", description: "Peasant Huts ×3 and all production +5%.", cost: 2_000_000, requires: { buildingCounts: { peasant_hut: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["peasant_hut"], multiplier: 3 }, { kind: "global_gps_mult", multiplier: 1.05 }] },
  { id: "syn_100_mkt", buildingId: "_synergy", tier: 0, rarity: "rare", name: "Market Dominance", description: "Market Stalls ×3. Mills ×2.", cost: 8_000_000, requires: { buildingCounts: { market_stall: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["market_stall"], multiplier: 3 }, { kind: "synergy_mult", buildings: ["mill"], multiplier: 2 }] },
  { id: "syn_100_blk", buildingId: "_synergy", tier: 0, rarity: "epic", name: "Forge Supremacy", description: "Blacksmiths ×4. Barracks ×2.", cost: 30_000_000, requires: { buildingCounts: { blacksmith: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["blacksmith"], multiplier: 4 }, { kind: "synergy_mult", buildings: ["barracks"], multiplier: 2 }] },
  { id: "syn_100_tav", buildingId: "_synergy", tier: 0, rarity: "epic", name: "Ale-Soaked Realm", description: "Taverns ×4. Click power ×2.", cost: 80_000_000, requires: { buildingCounts: { tavern: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["tavern"], multiplier: 4 }, { kind: "click_mult", multiplier: 2 }] },
  { id: "syn_100_mill", buildingId: "_synergy", tier: 0, rarity: "epic", name: "Breadbasket Kingdom", description: "Mills ×5. Peasant Huts ×2.", cost: 200_000_000, requires: { buildingCounts: { mill: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["mill"], multiplier: 5 }, { kind: "synergy_mult", buildings: ["peasant_hut"], multiplier: 2 }] },
  { id: "syn_100_brk", buildingId: "_synergy", tier: 0, rarity: "epic", name: "Standing Army", description: "Barracks ×5. Click power ×3.", cost: 500_000_000, requires: { buildingCounts: { barracks: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["barracks"], multiplier: 5 }, { kind: "click_mult", multiplier: 3 }] },
  { id: "syn_100_cath", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Divine Mandate", description: "Cathedrals ×5. All production ×1.25.", cost: 1_500_000_000, requires: { buildingCounts: { cathedral: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["cathedral"], multiplier: 5 }, { kind: "global_gps_mult", multiplier: 1.25 }] },
  { id: "syn_100_tower", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Fortress Nation", description: "Castle Towers ×5. Barracks ×3.", cost: 4_000_000_000, requires: { buildingCounts: { castle_tower: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["castle_tower"], multiplier: 5 }, { kind: "synergy_mult", buildings: ["barracks"], multiplier: 3 }] },
  { id: "syn_100_treas", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Bullion Standard", description: "Treasuries ×6. Market Stalls ×2.", cost: 10_000_000_000, requires: { buildingCounts: { royal_treasury: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["royal_treasury"], multiplier: 6 }, { kind: "synergy_mult", buildings: ["market_stall"], multiplier: 2 }] },
  { id: "syn_100_pal", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Imperial Court", description: "Palaces ×8. All production ×1.5.", cost: 30_000_000_000, requires: { buildingCounts: { palace: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["palace"], multiplier: 8 }, { kind: "global_gps_mult", multiplier: 1.5 }] },

  // Cross-building 100 milestones
  { id: "syn_x_1", buildingId: "_synergy", tier: 0, rarity: "epic", name: "Feudal Bond", description: "Peasant Huts and Market Stalls each ×3.", cost: 15_000_000, requires: { buildingCounts: { peasant_hut: 100, market_stall: 50 } }, effects: [{ kind: "synergy_mult", buildings: ["peasant_hut", "market_stall"], multiplier: 3 }] },
  { id: "syn_x_2", buildingId: "_synergy", tier: 0, rarity: "epic", name: "Arms and Ale", description: "Taverns and Barracks each ×3.", cost: 120_000_000, requires: { buildingCounts: { tavern: 100, barracks: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["tavern", "barracks"], multiplier: 3 }] },
  { id: "syn_x_3", buildingId: "_synergy", tier: 0, rarity: "epic", name: "Forge & Flour", description: "Blacksmiths and Mills each ×3.", cost: 300_000_000, requires: { buildingCounts: { blacksmith: 100, mill: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["blacksmith", "mill"], multiplier: 3 }] },
  { id: "syn_x_4", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Faith and Iron", description: "Cathedrals and Barracks each ×4.", cost: 1_000_000_000, requires: { buildingCounts: { cathedral: 100, barracks: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["cathedral", "barracks"], multiplier: 4 }] },
  { id: "syn_x_5", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Crown and Coin", description: "Palace and Royal Treasury each ×5.", cost: 25_000_000_000, requires: { buildingCounts: { palace: 50, royal_treasury: 100 } }, effects: [{ kind: "synergy_mult", buildings: ["palace", "royal_treasury"], multiplier: 5 }] },
  { id: "syn_x_6", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Keep of Kings", description: "Castle Towers and Palaces each ×4.", cost: 40_000_000_000, requires: { buildingCounts: { castle_tower: 100, palace: 50 } }, effects: [{ kind: "synergy_mult", buildings: ["castle_tower", "palace"], multiplier: 4 }] },

  // 200+ milestone synergies (late game)
  { id: "syn_200_hut", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Nation of Peasants", description: "Peasant Huts ×6.", cost: 500_000_000, requires: { buildingCounts: { peasant_hut: 200 } }, effects: [{ kind: "synergy_mult", buildings: ["peasant_hut"], multiplier: 6 }] },
  { id: "syn_200_brk", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Warrior Society", description: "Barracks ×8. Castle Towers ×2.", cost: 20_000_000_000, requires: { buildingCounts: { barracks: 200 } }, effects: [{ kind: "synergy_mult", buildings: ["barracks"], multiplier: 8 }, { kind: "synergy_mult", buildings: ["castle_tower"], multiplier: 2 }] },
  { id: "syn_200_cath", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Theocracy", description: "Cathedrals ×10. All production ×1.5.", cost: 200_000_000_000, requires: { buildingCounts: { cathedral: 200 } }, effects: [{ kind: "synergy_mult", buildings: ["cathedral"], multiplier: 10 }, { kind: "global_gps_mult", multiplier: 1.5 }] },
  { id: "syn_200_treas", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Gold Standard", description: "Treasuries ×12.", cost: 1_000_000_000_000, requires: { buildingCounts: { royal_treasury: 200 } }, effects: [{ kind: "synergy_mult", buildings: ["royal_treasury"], multiplier: 12 }] },

  // Grand synergy — all buildings 100
  { id: "syn_grand_100", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "United Realm", description: "All production ×3. Click power ×5.", cost: 50_000_000_000, requires: { buildingCounts: { peasant_hut: 100, market_stall: 100, blacksmith: 100, tavern: 100, mill: 100, barracks: 100, cathedral: 100, castle_tower: 100, royal_treasury: 100, palace: 50 } }, effects: [{ kind: "global_gps_mult", multiplier: 3 }, { kind: "click_mult", multiplier: 5 }] },
  { id: "syn_grand_200", buildingId: "_synergy", tier: 0, rarity: "legendary", name: "Empire Eternal", description: "All production ×5. Click power ×10.", cost: 2_000_000_000_000, requires: { buildingCounts: { peasant_hut: 200, market_stall: 200, blacksmith: 200, tavern: 200, mill: 200, barracks: 200, cathedral: 200, castle_tower: 200, royal_treasury: 200, palace: 100 } }, effects: [{ kind: "global_gps_mult", multiplier: 5 }, { kind: "click_mult", multiplier: 10 }] },

  // Grand synergies every 100 thresholds up to 1000.
  ...((): Upgrade[] => {
    const out: Upgrade[] = [];
    const names = [
      "Dynastic Glory", "Ageless Dominion", "Celestial Kingdom", "Astral Empire",
      "Divine Hegemony", "Starlit Realm", "Worldforge", "Eternity's Reign",
    ];
    let cost = 50_000_000_000_000;
    let gpsMult = 7;
    let clickMult = 15;
    for (let i = 0; i < names.length; i++) {
      const threshold = 300 + i * 100; // 300, 400, ..., 1000
      const palaceT = Math.floor(threshold / 2);
      out.push({
        id: `syn_grand_${threshold}`,
        buildingId: "_synergy",
        tier: 0,
        rarity: "legendary",
        name: names[i],
        description: `All production ×${gpsMult}. Click power ×${clickMult}.`,
        cost,
        requires: {
          buildingCounts: {
            peasant_hut: threshold, market_stall: threshold, blacksmith: threshold,
            tavern: threshold, mill: threshold, barracks: threshold, cathedral: threshold,
            castle_tower: threshold, royal_treasury: threshold, palace: palaceT,
          },
        },
        effects: [
          { kind: "global_gps_mult", multiplier: gpsMult },
          { kind: "click_mult", multiplier: clickMult },
        ],
      });
      cost *= 40;
      gpsMult = Math.floor(gpsMult * 1.6);
      clickMult = Math.floor(clickMult * 1.6);
    }
    return out;
  })(),

  // Per-building high-threshold synergies (every 100 after 200, up to 1000) — lots of late-game upgrades.
  ...((): Upgrade[] => {
    const out: Upgrade[] = [];
    const flavours: Record<string, string[]> = {
      peasant_hut: ["People's Reign", "Commoner Ascendant", "Villager Apotheosis", "Hearth of Nations", "Homeland Forever", "Folk Eternal", "Age of the Peasant", "Mortal Multitudes"],
      market_stall: ["Trade Hegemony", "Coin Ascendant", "Merchant Apotheosis", "Global Bazaar", "Silk Zenith", "Spice Eternal", "Coin Cosmos", "Trade Infinity"],
      blacksmith: ["Forge Hegemony", "Iron Ascendant", "Smith's Apotheosis", "Starforge", "Weaponsmith Zenith", "Eternal Anvil", "Forge of Cosmos", "Smithing Infinity"],
      tavern: ["Ale Hegemony", "Revel Ascendant", "Bard's Apotheosis", "Feast Cosmos", "Mead Zenith", "Eternal Revelry", "Tavern Infinity", "Carouse Cosmos"],
      mill: ["Harvest Hegemony", "Grain Ascendant", "Bread Apotheosis", "Fields Cosmos", "Granary Zenith", "Eternal Harvest", "Farmlands Infinity", "Plough Cosmos"],
      barracks: ["War Hegemony", "Blade Ascendant", "Legion Apotheosis", "Battle Cosmos", "Soldier Zenith", "Eternal War", "Army Infinity", "Martial Cosmos"],
      cathedral: ["Faith Hegemony", "Saint Ascendant", "Holy Apotheosis", "Divine Cosmos", "Pilgrim Zenith", "Eternal Hymn", "Sacred Infinity", "Celestial Faith"],
      castle_tower: ["Fortress Hegemony", "Stone Ascendant", "Bastion Apotheosis", "Walled Cosmos", "Tower Zenith", "Eternal Keep", "Citadel Infinity", "Rampart Cosmos"],
      royal_treasury: ["Vault Hegemony", "Gold Ascendant", "Mint Apotheosis", "Coffer Cosmos", "Bullion Zenith", "Eternal Treasury", "Wealth Infinity", "Sovereign Cosmos"],
      palace: ["Throne Hegemony", "Crown Ascendant", "Royal Apotheosis", "Dynastic Cosmos", "Regal Zenith", "Eternal Palace", "Imperial Infinity", "Sovereign Cosmos"],
    };
    for (const b of BUILDINGS) {
      const names = flavours[b.id] ?? [];
      let cost = 5_000_000_000 * Math.max(1, Math.floor(b.baseCost / 10));
      let mult = 10;
      for (let i = 0; i < names.length; i++) {
        const threshold = 300 + i * 100; // 300..1000
        out.push({
          id: `syn_${b.id}_${threshold}`,
          buildingId: "_synergy",
          tier: 0,
          rarity: "legendary",
          name: names[i],
          description: `${b.name}s ×${mult}.`,
          cost,
          requires: { buildingCounts: { [b.id]: threshold } },
          effects: [{ kind: "synergy_mult", buildings: [b.id], multiplier: mult }],
        });
        cost *= 25;
        mult = Math.floor(mult * 1.5);
      }
    }
    return out;
  })(),
];

const CLICK_UPGRADES: Upgrade[] = [
  { id: "click_1", buildingId: "_click", tier: 0, rarity: "rare", name: "Better Grip", description: "Click power ×2.", cost: 2_000, requires: { totalClicks: 200 }, effects: [{ kind: "click_mult", multiplier: 2 }] },
  { id: "click_2", buildingId: "_click", tier: 0, rarity: "rare", name: "Royal Touch", description: "Click power equals 1% of total GPS (if higher).", cost: 100_000, requires: { totalClicks: 2_000 }, effects: [{ kind: "custom" }] },
  { id: "click_3", buildingId: "_click", tier: 0, rarity: "epic", name: "Midas Touch", description: "Click power ×5.", cost: 8_000_000, requires: { totalClicks: 20_000 }, effects: [{ kind: "click_mult", multiplier: 5 }] },
  { id: "click_4", buildingId: "_click", tier: 0, rarity: "legendary", name: "The Golden Fist", description: "Click power ×10. Chance to spawn Golden Coins.", cost: 500_000_000, requires: { totalClicks: 150_000 }, effects: [{ kind: "click_mult", multiplier: 10 }] },
  { id: "click_5", buildingId: "_click", tier: 0, rarity: "legendary", name: "Hand of Kings", description: "Click power ×15.", cost: 250_000_000, requires: { totalClicks: 500_000 }, effects: [{ kind: "click_mult", multiplier: 15 }] },
  { id: "click_6", buildingId: "_click", tier: 0, rarity: "legendary", name: "Fingers of Fate", description: "Click power ×25.", cost: 10_000_000_000, requires: { totalClicks: 2_000_000 }, effects: [{ kind: "click_mult", multiplier: 25 }] },
  ...((): Upgrade[] => {
    const names = [
      "Sovereign Touch", "Crown of Fingers", "Touch of Heavens", "The Infinite Click",
      "Aeon Strike", "Godhand", "Click of Eternity", "Tap Cosmos", "Infinity Press", "Transcendent Tap",
    ];
    const out: Upgrade[] = [];
    let cost = 500_000_000_000;
    let clicks = 10_000_000;
    let mult = 40;
    for (let i = 0; i < names.length; i++) {
      out.push({
        id: `click_${7 + i}`,
        buildingId: "_click",
        tier: 0,
        rarity: "legendary",
        name: names[i],
        description: `Click power ×${mult}.`,
        cost,
        requires: { totalClicks: clicks },
        effects: [{ kind: "click_mult", multiplier: mult }],
      });
      cost *= 30;
      clicks *= 5;
      mult = Math.floor(mult * 1.5);
    }
    return out;
  })(),
];

const COIN_UPGRADES: Upgrade[] = [
  { id: "coin_1", buildingId: "_coin", tier: 0, rarity: "uncommon", name: "Fortune's Eye", description: "Golden Coins last longer.", cost: 80_000, requires: { goldenCoins: 5 }, effects: [{ kind: "custom" }] },
  { id: "coin_2", buildingId: "_coin", tier: 0, rarity: "rare", name: "Treasure Sense", description: "Golden Coin bonus value ×2.", cost: 2_000_000, requires: { goldenCoins: 20 }, effects: [{ kind: "custom" }] },
  { id: "coin_3", buildingId: "_coin", tier: 0, rarity: "epic", name: "King's Favour", description: "Golden Coin bonus duration ×2.", cost: 500_000_000, requires: { goldenCoins: 75 }, effects: [{ kind: "custom" }] },
];

export const UPGRADES: Upgrade[] = [
  ...buildingUpgrades(),
  ...GLOBAL_UPGRADES,
  ...SYNERGY_UPGRADES,
  ...CLICK_UPGRADES,
  ...COIN_UPGRADES,
];

export const UPGRADE_BY_ID: Record<string, Upgrade> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
);

export const RARITY_COLORS: Record<Rarity, string> = {
  common: "#8a8a8a",
  uncommon: "#27ae60",
  rare: "#2e86c1",
  epic: "#9b59b6",
  legendary: "#f5c842",
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function upgradeTierImage(tier: number): 1 | 2 | 3 {
  if (tier <= 1) return 1;
  if (tier <= 3) return 2;
  return 3;
}
