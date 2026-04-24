import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GameState } from "./gameState";
import { SAVE_VERSION } from "./gameState";

const KEY = "realms_rise_v2";

export async function saveGame(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.log("[save] error", e);
  }
}

export async function loadGame(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.saveVersion !== SAVE_VERSION) {
      console.log("[save] version mismatch — starting fresh");
      return null;
    }
    return parsed;
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
