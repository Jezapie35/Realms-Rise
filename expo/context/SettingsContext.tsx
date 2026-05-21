import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export type HapticStrength = "off" | "light" | "medium" | "heavy";

export interface HapticEvents {
  click: boolean;
  purchase: boolean;
  skill: boolean;
}

interface Settings {
  strength: HapticStrength;
  events: HapticEvents;
  hideAcquiredAchievements: boolean;
}

const STORAGE_KEY = "realms_rise_settings_v1";

const DEFAULT_SETTINGS: Settings = {
  strength: "light",
  events: { click: true, purchase: true, skill: true },
  hideAcquiredAchievements: false,
};

let currentSettings: Settings = DEFAULT_SETTINGS;

export function triggerHaptic(event: keyof HapticEvents) {
  if (Platform.OS === "web") return;
  if (currentSettings.strength === "off") return;
  if (!currentSettings.events[event]) return;
  try {
    const style =
      currentSettings.strength === "heavy"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : currentSettings.strength === "medium"
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(style);
  } catch {}
}

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Settings>;
          const merged: Settings = {
            strength: parsed.strength ?? DEFAULT_SETTINGS.strength,
            events: { ...DEFAULT_SETTINGS.events, ...(parsed.events ?? {}) },
            hideAcquiredAchievements: parsed.hideAcquiredAchievements ?? DEFAULT_SETTINGS.hideAcquiredAchievements,
          };
          setSettings(merged);
          currentSettings = merged;
        }
      } catch (e) {
        console.log("[Settings] load failed", e);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    currentSettings = settings;
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch((e) =>
        console.log("[Settings] save failed", e),
      );
    }
  }, [settings, loaded]);

  const setStrength = useCallback((strength: HapticStrength) => {
    setSettings((prev) => ({ ...prev, strength }));
    if (Platform.OS !== "web" && strength !== "off") {
      try {
        const style =
          strength === "heavy"
            ? Haptics.ImpactFeedbackStyle.Heavy
            : strength === "medium"
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Light;
        Haptics.impactAsync(style);
      } catch {}
    }
  }, []);

  const toggleEvent = useCallback((event: keyof HapticEvents) => {
    setSettings((prev) => ({
      ...prev,
      events: { ...prev.events, [event]: !prev.events[event] },
    }));
  }, []);

  const setHideAcquiredAchievements = useCallback((val: boolean) => {
    setSettings((prev) => ({ ...prev, hideAcquiredAchievements: val }));
  }, []);

  return useMemo(
    () => ({ settings, setStrength, toggleEvent, setHideAcquiredAchievements, loaded }),
    [settings, setStrength, toggleEvent, setHideAcquiredAchievements, loaded],
  );
});
