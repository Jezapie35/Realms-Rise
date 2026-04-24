export interface Building {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseGPS: number;
}

export const BUILDINGS: Building[] = [
  { id: "peasant_hut", name: "Peasant Hut", baseCost: 15, baseGPS: 0.1, description: "Humble folk who occasionally find coins in the mud." },
  { id: "market_stall", name: "Market Stall", baseCost: 200, baseGPS: 0.8, description: "Traders hawk questionable goods at reasonable prices." },
  { id: "blacksmith", name: "Blacksmith", baseCost: 1200, baseGPS: 4, description: "The clanging never stops. Neither does the gold." },
  { id: "tavern", name: "Tavern", baseCost: 6000, baseGPS: 16, description: "Where adventurers spend their gold. Your gold now." },
  { id: "mill", name: "Mill", baseCost: 30_000, baseGPS: 70, description: "Grinds grain. Also grinds out profit." },
  { id: "barracks", name: "Barracks", baseCost: 150_000, baseGPS: 280, description: "Soldiers collect taxes. Enthusiastically." },
  { id: "cathedral", name: "Cathedral", baseCost: 800_000, baseGPS: 1200, description: "The tithe goes directly to the crown. Obviously." },
  { id: "castle_tower", name: "Castle Tower", baseCost: 4_500_000, baseGPS: 5500, description: "A symbol of power that also generates revenue." },
  { id: "royal_treasury", name: "Royal Treasury", baseCost: 28_000_000, baseGPS: 28_000, description: "Gold begets gold. The rich get richer. As is tradition." },
  { id: "palace", name: "Palace", baseCost: 200_000_000, baseGPS: 160_000, description: "The grandest structure in the realm. Yours, naturally." },
  { id: "arcane_library", name: "Arcane Library", baseCost: 2_000_000_000, baseGPS: 900_000, description: "Ancient tomes that write themselves. The royalties are extraordinary." },
  { id: "wizards_tower", name: "Wizard's Tower", baseCost: 15_000_000_000, baseGPS: 5_000_000, description: "Magic makes money. The mechanism remains unclear. Results do not." },
  { id: "dragon_lair", name: "Dragon Lair", baseCost: 120_000_000_000, baseGPS: 30_000_000, description: "The dragon takes a cut. It is, in fairness, a very small cut." },
  { id: "astral_observatory", name: "Astral Observatory", baseCost: 1_000_000_000_000, baseGPS: 200_000_000, description: "Star-charts predict market movements with unsettling precision." },
  { id: "realm_gate", name: "Realm Gate", baseCost: 10_000_000_000_000, baseGPS: 1_500_000_000, description: "Dimensions are simply untapped markets. Tariffs apply across all planes." },
];

export const BUILDING_TINTS: Record<string, string> = {
  peasant_hut: "#8b6b3a",
  market_stall: "#a8522a",
  blacksmith: "#6b4a30",
  tavern: "#b8823a",
  mill: "#7a8a4a",
  barracks: "#5a5a5a",
  cathedral: "#b0a0d0",
  castle_tower: "#7a7a8a",
  royal_treasury: "#d4a430",
  palace: "#e8d080",
  arcane_library: "#7a4aaa",
  wizards_tower: "#4a6ab0",
  dragon_lair: "#aa3a2a",
  astral_observatory: "#2a7a9a",
  realm_gate: "#8a2a8a",
};
