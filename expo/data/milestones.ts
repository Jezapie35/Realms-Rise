import type { GameState } from "./gameState";
import { BUILDINGS } from "./buildings";

export interface Milestone {
  id: string;
  title: string;
  desc: string;
  important?: boolean;
  check: (s: GameState) => boolean;
}

function bc(id: string, n: number) {
  return (s: GameState) => (s.buildings[id]?.count ?? 0) >= n;
}

// ── Gold earned (lifetime) ────────────────────────────────────────────────────
const GOLD_MILESTONES: Milestone[] = [
  { id: "gold_1",    title: "A Humble Beginning",    desc: "Earn your first gold coin.",                   important: true,  check: (s) => s.totalGoldEarned >= 1 },
  { id: "gold_1k",   title: "Coin Hoarder",          desc: "1,000 gold earned.",                                             check: (s) => s.totalGoldEarned >= 1_000 },
  { id: "gold_10k",  title: "Market Regular",        desc: "10,000 gold earned.",                                            check: (s) => s.totalGoldEarned >= 10_000 },
  { id: "gold_100k", title: "Local Legend",          desc: "100,000 gold earned.",                                           check: (s) => s.totalGoldEarned >= 100_000 },
  { id: "gold_1m",   title: "A True Realm",          desc: "1 million gold earned.",                                         check: (s) => s.totalGoldEarned >= 1_000_000 },
  { id: "gold_10m",  title: "Noble House",           desc: "10 million gold earned.",                                        check: (s) => s.totalGoldEarned >= 10_000_000 },
  { id: "gold_100m", title: "Grand Lord",            desc: "100 million gold earned.",                                       check: (s) => s.totalGoldEarned >= 100_000_000 },
  { id: "gold_1b",   title: "The Eternal Kingdom",   desc: "1 billion gold. You are legend.",              important: true,  check: (s) => s.totalGoldEarned >= 1_000_000_000 },
  { id: "gold_10b",  title: "Ascending Power",       desc: "10 billion gold earned.",                                        check: (s) => s.totalGoldEarned >= 10_000_000_000 },
  { id: "gold_100b", title: "Sovereign Wealth",      desc: "100 billion gold. Sovereignty awaits.",                          check: (s) => s.totalGoldEarned >= 100_000_000_000 },
  { id: "gold_1t",   title: "The Golden Age",        desc: "1 trillion gold earned.",                      important: true,  check: (s) => s.totalGoldEarned >= 1_000_000_000_000 },
  { id: "gold_10t",  title: "Empire of Gold",        desc: "10 trillion gold earned.",                                       check: (s) => s.totalGoldEarned >= 10_000_000_000_000 },
  { id: "gold_100t", title: "Beyond Measure",        desc: "100 trillion gold. Numbers lose meaning.",                       check: (s) => s.totalGoldEarned >= 100_000_000_000_000 },
  { id: "gold_1q",   title: "Timeless Wealth",       desc: "1 quadrillion gold earned.",                   important: true,  check: (s) => s.totalGoldEarned >= 1_000_000_000_000_000 },
  { id: "gold_10q",  title: "Infinite Coffers",      desc: "10 quadrillion gold earned.",                                    check: (s) => s.totalGoldEarned >= 10_000_000_000_000_000 },
  { id: "gold_100q", title: "Beyond Reckoning",      desc: "100 quadrillion gold earned.",                                   check: (s) => s.totalGoldEarned >= 100_000_000_000_000_000 },
  { id: "gold_1qi",  title: "The Infinite Vault",    desc: "1 quintillion gold. You have transcended.",    important: true,  check: (s) => s.totalGoldEarned >= 1_000_000_000_000_000_000 },
  { id: "gold_10qi", title: "Vault of the Gods",     desc: "10 quintillion gold. The realm defies math.",                   check: (s) => s.totalGoldEarned >= 10_000_000_000_000_000_000 },
  { id: "gold_1sx",  title: "Sextillionaire",        desc: "1 sextillion gold. Truly beyond measure.",     important: true,  check: (s) => s.totalGoldEarned >= 1e21 },
];

// ── Current gold (on hand) ────────────────────────────────────────────────────
const CURRENT_GOLD_MILESTONES: Milestone[] = [
  { id: "cur_1m",  title: "A Fine Purse",       desc: "Hold 1 million gold at once.",      check: (s) => s.gold >= 1_000_000 },
  { id: "cur_1b",  title: "War Chest",          desc: "Hold 1 billion gold at once.",      check: (s) => s.gold >= 1_000_000_000 },
  { id: "cur_1t",  title: "Treasury of Kings",  desc: "Hold 1 trillion gold at once.",     check: (s) => s.gold >= 1_000_000_000_000 },
  { id: "cur_1q",  title: "Godlike Coffers",    desc: "Hold 1 quadrillion gold at once.",  check: (s) => s.gold >= 1_000_000_000_000_000 },
  { id: "cur_1qi", title: "The Hoard Eternal",  desc: "Hold 1 quintillion gold at once.",  check: (s) => s.gold >= 1_000_000_000_000_000_000 },
  { id: "cur_1sx", title: "Unspendable",        desc: "Hold 1 sextillion gold at once.",   check: (s) => s.gold >= 1e21 },
];

// ── GPS milestones ────────────────────────────────────────────────────────────
const GPS_MILESTONES: Milestone[] = [
  { id: "gps_1",    title: "Trickle",            desc: "Reach 1 gold per second.",              important: true, check: (s) => s.totalGPS >= 1 },
  { id: "gps_10",   title: "Stream",             desc: "Reach 10 gold per second.",                              check: (s) => s.totalGPS >= 10 },
  { id: "gps_100",  title: "River",              desc: "Reach 100 gold per second.",                             check: (s) => s.totalGPS >= 100 },
  { id: "gps_1k",   title: "Torrent",            desc: "Reach 1,000 gold per second.",                           check: (s) => s.totalGPS >= 1_000 },
  { id: "gps_10k",  title: "Flood of Gold",      desc: "Reach 10,000 gold per second.",                          check: (s) => s.totalGPS >= 10_000 },
  { id: "gps_100k", title: "Endless Flow",       desc: "Reach 100,000 gold per second.",                         check: (s) => s.totalGPS >= 100_000 },
  { id: "gps_1m",   title: "Gold Storm",         desc: "Reach 1 million gold per second.",      important: true, check: (s) => s.totalGPS >= 1_000_000 },
  { id: "gps_10m",  title: "The Golden Rain",    desc: "Reach 10 million gold per second.",                      check: (s) => s.totalGPS >= 10_000_000 },
  { id: "gps_100m", title: "Cascade of Kings",   desc: "Reach 100 million gold per second.",                     check: (s) => s.totalGPS >= 100_000_000 },
  { id: "gps_1b",   title: "Infinite Flow",      desc: "Reach 1 billion gold per second.",      important: true, check: (s) => s.totalGPS >= 1_000_000_000 },
  { id: "gps_10b",  title: "World's Wealth",     desc: "Reach 10 billion gold per second.",                      check: (s) => s.totalGPS >= 10_000_000_000 },
  { id: "gps_100b", title: "Transcendent Riches",desc: "Reach 100 billion gold per second.",                     check: (s) => s.totalGPS >= 100_000_000_000 },
  { id: "gps_1t",   title: "Gold Singularity",   desc: "Reach 1 trillion gold per second.",     important: true, check: (s) => s.totalGPS >= 1_000_000_000_000 },
  { id: "gps_10t",  title: "The Eternal Stream", desc: "Reach 10 trillion gold per second.",                     check: (s) => s.totalGPS >= 10_000_000_000_000 },
  { id: "gps_100t", title: "Beyond All Flow",    desc: "Reach 100 trillion gold per second.",                    check: (s) => s.totalGPS >= 100_000_000_000_000 },
];

// ── Click milestones ──────────────────────────────────────────────────────────
const CLICK_MILESTONES: Milestone[] = [
  { id: "clicks_1",    title: "The First Tap",     desc: "Tap the realm for the first time.",    important: true, check: (s) => s.totalClicks >= 1 },
  { id: "clicks_100",  title: "Diligent Ruler",    desc: "100 taps. Keep going.",                               check: (s) => s.totalClicks >= 100 },
  { id: "clicks_1k",   title: "Callused Fingers",  desc: "1,000 taps.",                                          check: (s) => s.totalClicks >= 1_000 },
  { id: "clicks_5k",   title: "Devoted Subject",   desc: "5,000 taps.",                                          check: (s) => s.totalClicks >= 5_000 },
  { id: "clicks_10k",  title: "Iron Wrist",        desc: "10,000 taps.",                                         check: (s) => s.totalClicks >= 10_000 },
  { id: "clicks_50k",  title: "Devoted Ruler",     desc: "50,000 taps. Impressive dedication.",                  check: (s) => s.totalClicks >= 50_000 },
  { id: "clicks_100k", title: "The Eternal Tap",   desc: "100,000 taps. Legendary.",                             check: (s) => s.totalClicks >= 100_000 },
  { id: "clicks_500k", title: "Infinite Press",    desc: "500,000 taps. Are you a machine?",                    check: (s) => s.totalClicks >= 500_000 },
  { id: "clicks_1m",   title: "One Million Taps",  desc: "1,000,000 taps. There are no words.",  important: true, check: (s) => s.totalClicks >= 1_000_000 },
  { id: "clicks_5m",   title: "Tap Immortal",      desc: "5,000,000 taps. A legend incarnate.",                 check: (s) => s.totalClicks >= 5_000_000 },
];

// ── Upgrades purchased ────────────────────────────────────────────────────────
const UPGRADE_MILESTONES: Milestone[] = [
  { id: "upg_1",   title: "Progress!",          desc: "Purchase your first upgrade.",    important: true, check: (s) => s.purchasedUpgrades.length >= 1 },
  { id: "upg_5",   title: "Improving",          desc: "5 upgrades purchased.",                           check: (s) => s.purchasedUpgrades.length >= 5 },
  { id: "upg_10",  title: "Scholar",            desc: "10 upgrades purchased.",                          check: (s) => s.purchasedUpgrades.length >= 10 },
  { id: "upg_25",  title: "Innovator",          desc: "25 upgrades purchased.",                          check: (s) => s.purchasedUpgrades.length >= 25 },
  { id: "upg_50",  title: "Reformer",           desc: "50 upgrades purchased.",                          check: (s) => s.purchasedUpgrades.length >= 50 },
  { id: "upg_100", title: "Master of Progress", desc: "100 upgrades purchased.",                         check: (s) => s.purchasedUpgrades.length >= 100 },
  { id: "upg_200", title: "Eternal Improver",   desc: "200 upgrades purchased.",                         check: (s) => s.purchasedUpgrades.length >= 200 },
  { id: "upg_500", title: "The Endless Scholar",desc: "500 upgrades purchased.",                         check: (s) => s.purchasedUpgrades.length >= 500 },
  { id: "upg_1000",title: "Upgrade Transcendent",desc:"1,000 upgrades purchased.",       important: true, check: (s) => s.purchasedUpgrades.length >= 1_000 },
];

// ── Total buildings owned ─────────────────────────────────────────────────────
const TOTAL_BUILDING_MILESTONES: Milestone[] = [
  { id: "tot_10",    title: "A Village",           desc: "Own 10 buildings total.",         check: (s) => Object.values(s.buildings).reduce((a, b) => a + b.count, 0) >= 10 },
  { id: "tot_50",    title: "A Town",              desc: "Own 50 buildings total.",         check: (s) => Object.values(s.buildings).reduce((a, b) => a + b.count, 0) >= 50 },
  { id: "tot_100",   title: "A City",              desc: "Own 100 buildings total.",        check: (s) => Object.values(s.buildings).reduce((a, b) => a + b.count, 0) >= 100 },
  { id: "tot_250",   title: "A Kingdom",           desc: "Own 250 buildings total.",        check: (s) => Object.values(s.buildings).reduce((a, b) => a + b.count, 0) >= 250 },
  { id: "tot_500",   title: "An Empire",           desc: "Own 500 buildings total.",        check: (s) => Object.values(s.buildings).reduce((a, b) => a + b.count, 0) >= 500 },
  { id: "tot_1000",  title: "The Eternal Realm",   desc: "Own 1,000 buildings total.",      check: (s) => Object.values(s.buildings).reduce((a, b) => a + b.count, 0) >= 1_000 },
  { id: "tot_2000",  title: "Immortal Empire",     desc: "Own 2,000 buildings total.",      check: (s) => Object.values(s.buildings).reduce((a, b) => a + b.count, 0) >= 2_000 },
  { id: "tot_5000",  title: "The Infinite Realm",  desc: "Own 5,000 buildings total.",      check: (s) => Object.values(s.buildings).reduce((a, b) => a + b.count, 0) >= 5_000 },
  { id: "tot_10000", title: "God of Construction", desc: "Own 10,000 buildings total.",     check: (s) => Object.values(s.buildings).reduce((a, b) => a + b.count, 0) >= 10_000 },
];

// ── Per-building milestones (auto-generated) ──────────────────────────────────
interface BuildingSpec { id: string; name: string; titles: [string, string, string, string, string, string] }
const BUILDING_SPECS: BuildingSpec[] = [
  { id: "peasant_hut",     name: "Peasant Hut",     titles: ["First Subject",        "Peasant Quarter",     "Peasant Army",        "Nation of Peasants",   "Peasant Dominion",    "Eternal Peasantry"] },
  { id: "market_stall",    name: "Market Stall",    titles: ["Open for Business",    "Marketplace",         "Trade Hub",           "Merchant Empire",      "Bazaar Eternal",      "Market Transcendent"] },
  { id: "blacksmith",      name: "Blacksmith",      titles: ["Forged in Fire",       "Iron Works",          "Master Forge",        "Steel Nation",         "Forge Dominion",      "Eternal Smithing"] },
  { id: "apothecary",      name: "Apothecary",      titles: ["First Remedy",         "Healing Quarter",     "Grand Apothecary",    "Elixir Empire",        "Alchemist's Dominion","Eternal Elixir"] },
  { id: "tavern",          name: "Tavern",          titles: ["The First Round",      "Ale District",        "Brewery Kingdom",     "Realm of Revelry",     "Eternal Feast",       "Infinite Revel"] },
  { id: "mill",            name: "Mill",            titles: ["The First Mill",       "Grain District",      "Breadbasket Kingdom", "Harvest Empire",       "Mill Dominion",       "Eternal Harvest"] },
  { id: "harbor",          name: "Harbor",          titles: ["First Port",           "Trading Port",        "Naval Power",         "Ocean Empire",         "Harbour Eternal",     "Seas Without End"] },
  { id: "barracks",        name: "Barracks",        titles: ["First Soldier",        "Standing Army",       "Warrior Nation",      "Military Empire",      "War Eternal",         "Infinite Legion"] },
  { id: "cathedral",       name: "Cathedral",       titles: ["First Blessing",       "Holy District",       "Divine Nation",       "Theocracy",            "Cathedral Eternal",   "Infinite Faith"] },
  { id: "castle_tower",    name: "Castle Tower",    titles: ["First Fortification",  "Walled Realm",        "Fortress Nation",     "Impenetrable Empire",  "Citadel Eternal",     "Infinite Walls"] },
  { id: "royal_treasury",  name: "Royal Treasury",  titles: ["The Vaults Open",      "Gilded Quarter",      "Bullion Standard",    "Gold Standard",        "Treasury Eternal",    "Vault Transcendent"] },
  { id: "palace",          name: "Palace",          titles: ["Seat of Power",        "Royal District",      "Imperial Court",      "Palace of Eternity",   "Palace Dominion",     "Throne of Thrones"] },
  { id: "wizard_tower",    name: "Wizard's Tower",  titles: ["First Spell",          "Mage Circle",         "Arcane Nation",       "Tower of Infinity",    "Arcane Dominion",     "Eternal Sorcery"] },
  { id: "dragon_aerie",    name: "Dragon's Aerie",  titles: ["First Dragon",         "Dragon Flight",       "Dragon Empire",       "Age of Dragons",       "Draconic Dominion",   "Eternal Dragonfire"] },
  { id: "coliseum",        name: "Coliseum",        titles: ["First Arena",          "The Circuit",         "Champion Empire",     "Eternal Games",        "Coliseum Eternal",    "Infinite Arena"] },
  { id: "celestial_spire", name: "Celestial Spire", titles: ["First Stargazer",      "Astral Circle",       "Cosmic Empire",       "Infinite Cosmos",      "Celestial Dominion",  "Stars Without End"] },
  { id: "realms_forge",    name: "Realm's Forge",   titles: ["First Forging",        "Forgemaster Circle",  "Reality Forge",       "Forge of Eternity",    "Forge Dominion",      "Infinite Forging"] },
  { id: "eternal_throne",  name: "Eternal Throne",  titles: ["The Throne Claims You","Circle of Eternity",  "Eternal Empire",      "Immortal Dominion",    "Throne Ascendant",    "Beyond the Throne"] },
];

const THRESHOLDS = [1, 25, 100, 200, 500, 1000] as const;
const THRESHOLD_DESCS = (name: string, n: number) => ({
  1:    `Build your first ${name}.`,
  25:   `Own 25 ${name}s.`,
  100:  `Own 100 ${name}s.`,
  200:  `Own 200 ${name}s.`,
  500:  `Own 500 ${name}s.`,
  1000: `Own 1,000 ${name}s.`,
})[n] ?? `Own ${n} ${name}s.`;

const BUILDING_MILESTONES: Milestone[] = BUILDING_SPECS.flatMap((spec) =>
  THRESHOLDS.map((n, i) => ({
    id: `${spec.id}_${n}`,
    title: spec.titles[i],
    desc: THRESHOLD_DESCS(spec.name, n),
    check: bc(spec.id, n),
  }))
);

// ── All buildings owned ───────────────────────────────────────────────────────
const DIVERSITY_MILESTONES: Milestone[] = [
  {
    id: "all_original",
    title: "Full Kingdom",
    desc: "Own at least one of every original building type.",
    important: true,
    check: (s) => ["peasant_hut","market_stall","blacksmith","tavern","mill","barracks","cathedral","castle_tower","royal_treasury","palace"].every((id) => (s.buildings[id]?.count ?? 0) >= 1),
  },
  {
    id: "all_buildings",
    title: "The Complete Realm",
    desc: "Own at least one of every building type — all 18.",
    important: true,
    check: (s) => BUILDINGS.every((b) => (s.buildings[b.id]?.count ?? 0) >= 1),
  },
  {
    id: "late_game_start",
    title: "Beyond the Horizon",
    desc: "Construct your first Wizard's Tower.",
    check: bc("wizard_tower", 1),
  },
  {
    id: "endgame_reached",
    title: "The Eternal Realm Beckons",
    desc: "Construct your first Eternal Throne.",
    check: bc("eternal_throne", 1),
  },
];

// ── Prestige milestones ───────────────────────────────────────────────────────
const PRESTIGE_MILESTONES: Milestone[] = [
  { id: "prestige_1",  title: "Sovereign",       desc: "Declare Sovereignty for the first time.", important: true, check: (s) => s.prestigeCount >= 1 },
  { id: "prestige_3",  title: "Veteran Ruler",   desc: "Three kingdoms risen.",                                   check: (s) => s.prestigeCount >= 3 },
  { id: "prestige_5",  title: "Dynasty",         desc: "Five kingdoms risen.",                    important: true, check: (s) => s.prestigeCount >= 5 },
  { id: "prestige_10", title: "Empire",          desc: "Ten kingdoms risen.",                     important: true, check: (s) => s.prestigeCount >= 10 },
  { id: "prestige_25", title: "Eternal Ruler",   desc: "Twenty-five kingdoms risen.",             important: true, check: (s) => s.prestigeCount >= 25 },
  { id: "prestige_50", title: "The Undying",     desc: "Fifty kingdoms. You cannot be stopped.",  important: true, check: (s) => s.prestigeCount >= 50 },
  { id: "prestige_100",title: "Godking",         desc: "One hundred sovereignties declared.",     important: true, check: (s) => s.prestigeCount >= 100 },
];

// ── Seals milestones ──────────────────────────────────────────────────────────
const SEAL_MILESTONES: Milestone[] = [
  { id: "seals_5",    title: "Seal Keeper",       desc: "Earn 5 Royal Seals total.",    check: (s) => s.sealsTotal >= 5 },
  { id: "seals_25",   title: "Seal Bearer",       desc: "Earn 25 Royal Seals total.",   check: (s) => s.sealsTotal >= 25 },
  { id: "seals_100",  title: "Seal Master",       desc: "Earn 100 Royal Seals total.",  check: (s) => s.sealsTotal >= 100 },
  { id: "seals_250",  title: "The Seal Hoard",    desc: "Earn 250 Royal Seals total.",  check: (s) => s.sealsTotal >= 250 },
  { id: "seals_500",  title: "Seal of Ages",      desc: "Earn 500 Royal Seals total.",  check: (s) => s.sealsTotal >= 500 },
  { id: "seals_1000", title: "The Eternal Seal",  desc: "Earn 1,000 Royal Seals total.",check: (s) => s.sealsTotal >= 1_000 },
];

// ── Golden coin milestones ────────────────────────────────────────────────────
const COIN_MILESTONES: Milestone[] = [
  { id: "coins_1",    title: "Fortune Favours",    desc: "Collect your first Golden Coin.",   important: true, check: (s) => s.goldenCoinsCollected >= 1 },
  { id: "coins_10",   title: "Coin Chaser",        desc: "Collect 10 Golden Coins.",                          check: (s) => s.goldenCoinsCollected >= 10 },
  { id: "coins_50",   title: "Coin Hunter",        desc: "Collect 50 Golden Coins.",                          check: (s) => s.goldenCoinsCollected >= 50 },
  { id: "coins_100",  title: "Golden Hoarder",     desc: "Collect 100 Golden Coins.",                         check: (s) => s.goldenCoinsCollected >= 100 },
  { id: "coins_500",  title: "The Golden Magpie",  desc: "Collect 500 Golden Coins.",                         check: (s) => s.goldenCoinsCollected >= 500 },
  { id: "coins_1k",   title: "Gilded Obsession",   desc: "Collect 1,000 Golden Coins.",                       check: (s) => s.goldenCoinsCollected >= 1_000 },
  { id: "coins_5k",   title: "Coin Sovereign",     desc: "Collect 5,000 Golden Coins.",                       check: (s) => s.goldenCoinsCollected >= 5_000 },
];

// ── Skill tree milestones ─────────────────────────────────────────────────────
const SKILL_MILESTONES: Milestone[] = [
  {
    id: "first_skill",
    title: "The Tree Awakens",
    desc: "Unlock your first skill node.",
    important: true,
    check: (s) => s.unlockedSkillNodes.length >= 1,
  },
  {
    id: "skill_5",
    title: "Growing Power",
    desc: "Unlock 5 skill nodes.",
    check: (s) => s.unlockedSkillNodes.length >= 5,
  },
  {
    id: "skill_10",
    title: "The Gifted Ruler",
    desc: "Unlock 10 skill nodes.",
    check: (s) => s.unlockedSkillNodes.length >= 10,
  },
  {
    id: "full_branch",
    title: "Branch Mastered",
    desc: "Complete an entire skill branch.",
    important: true,
    check: (s) =>
      ["commerce", "military", "faith", "lineage"].some((b) =>
        [`${b}_1`, `${b}_2a`, `${b}_2b`, `${b}_3a`, `${b}_3b`, `${b}_4`].every((n) =>
          s.unlockedSkillNodes.includes(n)
        )
      ),
  },
  {
    id: "two_branches",
    title: "Dual Mastery",
    desc: "Complete two full skill branches.",
    check: (s) =>
      ["commerce", "military", "faith", "lineage"].filter((b) =>
        [`${b}_1`, `${b}_2a`, `${b}_2b`, `${b}_3a`, `${b}_3b`, `${b}_4`].every((n) =>
          s.unlockedSkillNodes.includes(n)
        )
      ).length >= 2,
  },
  {
    id: "warlord",
    title: "Warlord",
    desc: "Unlock the Warlord skill.",
    check: (s) => s.unlockedSkillNodes.includes("military_4"),
  },
  {
    id: "pinnacle",
    title: "Immortal Crown",
    desc: "Reach the Pinnacle. You have conquered everything.",
    important: true,
    check: (s) => s.unlockedSkillNodes.includes("pinnacle"),
  },
];

// ── Legacy milestones ─────────────────────────────────────────────────────────
const LEGACY_MILESTONES: Milestone[] = [
  { id: "legacy_first", title: "The Long Memory",   desc: "Purchase your first Legacy Upgrade.", important: true, check: (s) => (s.legacyUpgrades?.length ?? 0) >= 1 },
  { id: "legacy_5",     title: "Dynasty Builders",  desc: "Own 5 Legacy Upgrades.",                              check: (s) => (s.legacyUpgrades?.length ?? 0) >= 5 },
  { id: "legacy_10",    title: "The Ancient Order", desc: "Own 10 Legacy Upgrades.",                             check: (s) => (s.legacyUpgrades?.length ?? 0) >= 10 },
  { id: "legacy_all",   title: "Eternal Legacy",    desc: "Own all 20 Legacy Upgrades.",         important: true, check: (s) => (s.legacyUpgrades?.length ?? 0) >= 20 },
];

// ── Special / story achievements ──────────────────────────────────────────────
const SPECIAL_MILESTONES: Milestone[] = [
  {
    id: "royal_compound",
    title: "Royal Compound",
    desc: "Palace and Royal Treasury working as one.",
    check: (s) => s.purchasedUpgrades.includes("syn_5"),
  },
  {
    id: "united_realm",
    title: "United Realm",
    desc: "Unlock the United Realm synergy — 100 of every original building.",
    check: (s) => s.purchasedUpgrades.includes("syn_grand_100"),
  },
  {
    id: "theocracy",
    title: "Divine Mandate",
    desc: "Own 200 Cathedrals.",
    check: bc("cathedral", 200),
  },
  {
    id: "silk_roads",
    title: "Silk Roads Open",
    desc: "Unlock the Silk Roads skill node.",
    important: true,
    check: (s) => s.unlockedSkillNodes.includes("commerce_3b"),
  },
  {
    id: "holy_order",
    title: "Holy Order",
    desc: "Unlock the Holy Order skill — carry an upgrade across sovereignty.",
    check: (s) => s.unlockedSkillNodes.includes("faith_3a"),
  },
  {
    id: "hand_of_kings",
    title: "Hand of Kings",
    desc: "Purchase the Hand of Kings click upgrade.",
    check: (s) => s.purchasedUpgrades.includes("click_5"),
  },
  {
    id: "golden_age",
    title: "Golden Age",
    desc: "Purchase the Golden Age upgrade.",
    check: (s) => s.purchasedUpgrades.includes("global_4"),
  },
  {
    id: "big_spender",
    title: "Big Spender",
    desc: "Hold and spend 1 trillion gold in a single run.",
    check: (s) => s.totalGoldEarned >= 1_000_000_000_000 && s.purchasedUpgrades.length >= 50,
  },
  {
    id: "collector",
    title: "The Collector",
    desc: "Own 500 total buildings across all types.",
    check: (s) => Object.values(s.buildings).reduce((a, b) => a + b.count, 0) >= 500,
  },
  {
    id: "hoard_100b",
    title: "Dragon's Hoard",
    desc: "Hold 100 billion gold at once.",
    check: (s) => s.gold >= 100_000_000_000,
  },
  {
    id: "empire_eternal",
    title: "Empire Eternal",
    desc: "Unlock the Empire Eternal grand synergy.",
    important: true,
    check: (s) => s.purchasedUpgrades.includes("syn_grand_200"),
  },
  {
    id: "wizard_nation",
    title: "Age of Wizardry",
    desc: "Own 50 Wizard's Towers.",
    check: bc("wizard_tower", 50),
  },
  {
    id: "dragonlord",
    title: "Dragonlord",
    desc: "Own 25 Dragon's Aeries.",
    check: bc("dragon_aerie", 25),
  },
  {
    id: "cosmic_ruler",
    title: "Cosmic Ruler",
    desc: "Own 10 Celestial Spires.",
    check: bc("celestial_spire", 10),
  },
  {
    id: "throne_of_thrones",
    title: "Throne of Thrones",
    desc: "Own 50 Eternal Thrones.",
    check: bc("eternal_throne", 50),
  },
];

export const MILESTONES: Milestone[] = [
  ...GOLD_MILESTONES,
  ...CURRENT_GOLD_MILESTONES,
  ...GPS_MILESTONES,
  ...CLICK_MILESTONES,
  ...UPGRADE_MILESTONES,
  ...TOTAL_BUILDING_MILESTONES,
  ...BUILDING_MILESTONES,
  ...DIVERSITY_MILESTONES,
  ...PRESTIGE_MILESTONES,
  ...SEAL_MILESTONES,
  ...COIN_MILESTONES,
  ...SKILL_MILESTONES,
  ...LEGACY_MILESTONES,
  ...SPECIAL_MILESTONES,
];

export interface MilestoneCategory {
  id: string;
  label: string;
  milestones: Milestone[];
}

export const MILESTONE_CATEGORIES: MilestoneCategory[] = [
  {
    id: "wealth",
    label: "Wealth",
    milestones: [...GOLD_MILESTONES, ...CURRENT_GOLD_MILESTONES, ...GPS_MILESTONES],
  },
  {
    id: "kingdom",
    label: "Kingdom",
    milestones: [
      ...UPGRADE_MILESTONES,
      ...CLICK_MILESTONES,
      ...TOTAL_BUILDING_MILESTONES,
      ...BUILDING_MILESTONES,
      ...DIVERSITY_MILESTONES,
    ],
  },
  {
    id: "power",
    label: "Power",
    milestones: [
      ...PRESTIGE_MILESTONES,
      ...SEAL_MILESTONES,
      ...SKILL_MILESTONES,
      ...LEGACY_MILESTONES,
    ],
  },
  {
    id: "glory",
    label: "Glory",
    milestones: [...COIN_MILESTONES, ...SPECIAL_MILESTONES],
  },
];
