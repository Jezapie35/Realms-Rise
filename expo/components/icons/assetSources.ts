/**
 * Centralized list of bundled image asset modules.
 * Used both by the shared AssetIcon component and by the app-level
 * preloader so every icon is ready before the first render.
 */
export const ICON_SOURCES = {
  peasant_hut: require('@/assets/images/peasant_hut.png'),
  market_stall: require('@/assets/images/market_stall.png'),
  blacksmith: require('@/assets/images/blacksmith.png'),
  apothecary: require('@/assets/images/apothecary.png'),
  tavern: require('@/assets/images/tavern.png'),
  mill: require('@/assets/images/mill.png'),
  harbor: require('@/assets/images/harbor.png'),
  barracks: require('@/assets/images/barracks.png'),
  cathedral: require('@/assets/images/cathedral.png'),
  castle_tower: require('@/assets/images/castle_tower.png'),
  royal_treasury: require('@/assets/images/royal_treasury.png'),
  palace: require('@/assets/images/palace.png'),
  wizards_tower: require('@/assets/images/wizards_tower.png'),
  dragon_aerie: require('@/assets/images/dragon_aerie.png'),
  coliseum: require('@/assets/images/coliseum.png'),
  celestial_spire: require('@/assets/images/celestial_spire.png'),
  realms_forge: require('@/assets/images/realms_forge.png'),
  eternal_throne: require('@/assets/images/eternal_throne.png'),
  crown: require('@/assets/images/crown.png'),
  ascension_robe: require('@/assets/images/ascension_robe.png'),
  skill_node: require('@/assets/images/skill_node.png'),
  coin: require('@/assets/images/coin.png'),
  seal: require('@/assets/images/seal.png'),
  upgrade_generic: require('@/assets/images/upgrade_generic.png'),
} as const;

export type IconKey = keyof typeof ICON_SOURCES;

export const ALL_ICON_MODULES: number[] = Object.values(ICON_SOURCES) as unknown as number[];
