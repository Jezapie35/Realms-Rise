import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GameState } from "./gameState";
import { SAVE_VERSION, DEFAULT_ASCENSION_STATE, DEFAULT_CHALLENGE_STATE } from "./gameState";

const KEY = "realms_rise_v2";

export async function saveGame(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.log("[save] error", e);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateV4toV5(old: any): GameState {
  return {
    ...old,
    saveVersion: 5,
    lifetimeGoldAllTime: old.lifetimeGoldAllTime ?? old.totalGoldEarned ?? 0,
    carryOverUpgrades: old.carryOverUpgrades ?? (old.carryOverUpgrade ? [old.carryOverUpgrade] : []),
    edictBoosts: old.edictBoosts ?? [],
    ascension: { ...DEFAULT_ASCENSION_STATE, ...(old.ascension ?? {}) },
    challenges: { ...DEFAULT_CHALLENGE_STATE, ...(old.challenges ?? {}) },
  };
}

export async function loadGame(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = JSON.parse(raw) as any;

    if (parsed.saveVersion === 3) {
      parsed.saveVersion = 4;
      parsed.prestigePhase = "playing";
    }

    if (parsed.saveVersion === 4) {
      return migrateV4toV5(parsed);
    }

    if (parsed.saveVersion !== SAVE_VERSION) {
      console.log("[save] version mismatch — starting fresh");
      return null;
    }

    // Patch any missing fields on existing v5 saves
    if (!parsed.prestigePhase) parsed.prestigePhase = "playing";
    if (!parsed.ascension) parsed.ascension = { ...DEFAULT_ASCENSION_STATE };
    if (!parsed.challenges) parsed.challenges = { ...DEFAULT_CHALLENGE_STATE };
    if (!parsed.edictBoosts) parsed.edictBoosts = [];
    if (!parsed.carryOverUpgrades) parsed.carryOverUpgrades = [];
    if (parsed.lifetimeGoldAllTime == null) parsed.lifetimeGoldAllTime = parsed.totalGoldEarned ?? 0;

    return parsed as GameState;
  } catch (e) {
    console.log("[load] error", e);
    return null;
  }
}

export async function deleteSave(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.log("[delete] error", e);
  }
}
