export interface Building {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseGPS: number;
}

export const BUILDINGS: Building[] = [
  { id: "peasant_hut",     name: "Peasant Hut",       baseCost: 15,                  baseGPS: 0.1,           description: "Humble folk who occasionally find coins in the mud." },
  { id: "market_stall",    name: "Market Stall",       baseCost: 200,                 baseGPS: 0.8,           description: "Traders hawk questionable goods at reasonable prices." },
  { id: "blacksmith",      name: "Blacksmith",         baseCost: 1_200,               baseGPS: 4,             description: "The clanging never stops. Neither does the gold." },
  { id: "apothecary",      name: "Apothecary",         baseCost: 3_500,               baseGPS: 11,            description: "Potions, poultices, and a healthy profit margin." },
  { id: "tavern",          name: "Tavern",             baseCost: 6_000,               baseGPS: 16,            description: "Where adventurers spend their gold. Your gold now." },
  { id: "mill",            name: "Mill",               baseCost: 30_000,              baseGPS: 70,            description: "Grinds grain. Also grinds out profit." },
  { id: "harbor",          name: "Harbor",             baseCost: 80_000,              baseGPS: 170,           description: "Trade fleets line the docks. Gold flows like the tide." },
  { id: "barracks",        name: "Barracks",           baseCost: 150_000,             baseGPS: 280,           description: "Soldiers collect taxes. Enthusiastically." },
  { id: "cathedral",       name: "Cathedral",          baseCost: 800_000,             baseGPS: 1_200,         description: "The tithe goes directly to the crown. Obviously." },
  { id: "castle_tower",    name: "Castle Tower",       baseCost: 4_500_000,           baseGPS: 5_500,         description: "A symbol of power that also generates revenue." },
  { id: "royal_treasury",  name: "Royal Treasury",     baseCost: 28_000_000,          baseGPS: 28_000,        description: "Gold begets gold. The rich get richer. As is tradition." },
  { id: "palace",          name: "Palace",             baseCost: 200_000_000,         baseGPS: 160_000,       description: "The grandest structure in the realm. Yours, naturally." },
  { id: "wizard_tower",    name: "Wizard's Tower",     baseCost: 1_500_000_000,       baseGPS: 1_100_000,     description: "Arcane research has never been more profitable." },
  { id: "dragon_aerie",    name: "Dragon's Aerie",     baseCost: 12_000_000_000,      baseGPS: 7_800_000,     description: "Dragons hoard gold. How fortunate they answer to you." },
  { id: "coliseum",        name: "Coliseum",           baseCost: 100_000_000_000,     baseGPS: 58_000_000,    description: "The crowd roars. Coin purses empty. Yours fills." },
  { id: "celestial_spire", name: "Celestial Spire",    baseCost: 900_000_000_000,     baseGPS: 475_000_000,   description: "Tapping into the cosmos for untold wealth." },
  { id: "realms_forge",    name: "Realm's Forge",      baseCost: 8_000_000_000_000,   baseGPS: 3_800_000_000, description: "Where the raw stuff of creation becomes currency." },
  { id: "eternal_throne",  name: "Eternal Throne",     baseCost: 75_000_000_000_000,  baseGPS: 32_000_000_000,description: "Dominion over all. Even time pays you tribute." },
];

export const BUILDING_TINTS: Record<string, string> = {
  peasant_hut:     "#8b6b3a",
  market_stall:    "#a8522a",
  blacksmith:      "#6b4a30",
  apothecary:      "#3a7a4a",
  tavern:          "#b8823a",
  mill:            "#7a8a4a",
  harbor:          "#2a6a8a",
  barracks:        "#5a5a5a",
  cathedral:       "#b0a0d0",
  castle_tower:    "#7a7a8a",
  royal_treasury:  "#d4a430",
  palace:          "#e8d080",
  wizard_tower:    "#7a3aaa",
  dragon_aerie:    "#aa2a2a",
  coliseum:        "#9a7a2a",
  celestial_spire: "#3a4a9a",
  realms_forge:    "#8a4a1a",
  eternal_throne:  "#c8a800",
};
