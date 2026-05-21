import React from 'react';

export { default as PeasantHut } from './buildings/PeasantHut';
export { default as MarketStall } from './buildings/MarketStall';
export { default as Blacksmith } from './buildings/Blacksmith';
export { default as Apothecary } from './buildings/Apothecary';
export { default as Tavern } from './buildings/Tavern';
export { default as Mill } from './buildings/Mill';
export { default as Harbor } from './buildings/Harbor';
export { default as Barracks } from './buildings/Barracks';
export { default as Cathedral } from './buildings/Cathedral';
export { default as CastleTower } from './buildings/CastleTower';
export { default as RoyalTreasury } from './buildings/RoyalTreasury';
export { default as Palace } from './buildings/Palace';
export { default as WizardsTower } from './buildings/WizardsTower';
export { default as DragonAerie } from './buildings/DragonAerie';
export { default as Coliseum } from './buildings/Coliseum';
export { default as CelestialSpire } from './buildings/CelestialSpire';
export { default as RealmsForge } from './buildings/RealmsForge';
export { default as EternalThrone } from './buildings/EternalThrone';

export { default as TapCastle } from './ui/TapCastle';
export { default as TapCoin } from './ui/TapCoin';
export { default as CrownIcon } from './ui/CrownIcon';
export { default as SkillCommerce } from './ui/SkillCommerce';
export { default as SkillMilitary } from './ui/SkillMilitary';
export { default as SkillFaith } from './ui/SkillFaith';
export { default as SkillLineage } from './ui/SkillLineage';
export { default as SkillCross } from './ui/SkillCross';
export { default as SkillPinnacle } from './ui/SkillPinnacle';
export { default as RoyalSeal } from './ui/RoyalSeal';

import PeasantHut from './buildings/PeasantHut';
import MarketStall from './buildings/MarketStall';
import Blacksmith from './buildings/Blacksmith';
import Apothecary from './buildings/Apothecary';
import Tavern from './buildings/Tavern';
import Mill from './buildings/Mill';
import Harbor from './buildings/Harbor';
import Barracks from './buildings/Barracks';
import Cathedral from './buildings/Cathedral';
import CastleTower from './buildings/CastleTower';
import RoyalTreasury from './buildings/RoyalTreasury';
import Palace from './buildings/Palace';
import WizardsTower from './buildings/WizardsTower';
import DragonAerie from './buildings/DragonAerie';
import Coliseum from './buildings/Coliseum';
import CelestialSpire from './buildings/CelestialSpire';
import RealmsForge from './buildings/RealmsForge';
import EternalThrone from './buildings/EternalThrone';

export const BUILDING_ICON_MAP: Record<string, React.FC<{ size?: number }>> = {
  peasant_hut: PeasantHut,
  market_stall: MarketStall,
  blacksmith: Blacksmith,
  apothecary: Apothecary,
  tavern: Tavern,
  mill: Mill,
  harbor: Harbor,
  barracks: Barracks,
  cathedral: Cathedral,
  castle_tower: CastleTower,
  royal_treasury: RoyalTreasury,
  palace: Palace,
  wizard_tower: WizardsTower,
  dragon_aerie: DragonAerie,
  coliseum: Coliseum,
  celestial_spire: CelestialSpire,
  realms_forge: RealmsForge,
  eternal_throne: EternalThrone,
};
