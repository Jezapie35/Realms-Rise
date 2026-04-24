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
};
