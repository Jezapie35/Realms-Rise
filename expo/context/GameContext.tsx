import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { triggerHaptic } from "@/context/SettingsContext";
import { BUILDINGS } from "@/data/buildings";
import { UPGRADE_BY_ID } from "@/data/upgrades";
import { SKILL_NODE_BY_ID, isNodeRequirementMet } from "@/data/skillTree";
import {
  createInitialState,
  GameState,
  BuyMode,
  ActiveBonus,
  SAVE_VERSION,
} from "@/data/gameState";
import {
  applyOfflineProgress,
  calculateBuildingCost,
  calculateBuyMaxCount,
  calculateGoldPerClick,
  calculatePrestigeSeals,
  calculateTotalGPS,
  computeClickGoldReward,
} from "@/data/gameEngine";
import { MILESTONES } from "@/data/milestones";
import { deleteSave, loadGame, saveGame } from "@/data/saveSystem";
import { formatGold } from "@/utils/formatNumber";
import { LEGACY_BY_ID, LEGACY_UPGRADES, calculateLegacyBonuses } from "@/data/legacyUpgrades";

interface Toast {
  id: number;
  title: string;
  desc: string;
  kind: "milestone" | "info" | "success" | "bonus";
  color?: string;
}

interface BannerState {
  id: number;
  text: string;
  color: string;
}

const MAX_GOLD = 1e300;
function capGold(n: number): number {
  if (!isFinite(n) || n > MAX_GOLD) return MAX_GOLD;
  if (n < 0) return 0;
  return n;
}

function coinInterval(unlocked: string[]): { min: number; max: number } {
  if (unlocked.includes("pinnacle")) return { min: 30_000, max: 30_000 };
  if (unlocked.includes("military_3b")) return { min: 30_000, max: 270_000 };
  return { min: 60_000, max: 600_000 };
}

function nextCoinTime(now: number, unlocked: string[]): number {
  const { min, max } = coinInterval(unlocked);
  return now + min + Math.random() * (max - min);
}

function hapticClick() { triggerHaptic("click"); }
function hapticPurchase() { triggerHaptic("purchase"); }
function hapticSkill() { triggerHaptic("skill"); }

export const [GameProvider, useGameInternal] = createContextHook(() => {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [loaded, setLoaded] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [coinVisible, setCoinVisible] = useState<boolean>(false);
  const [coinPos, setCoinPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const toastIdRef = useRef<number>(0);
  const stateRef = useRef<GameState>(state);
  stateRef.current = state;

  const pushToast = useCallback(
    (title: string, desc: string, kind: Toast["kind"] = "info", color?: string) => {
      toastIdRef.current += 1;
      const id = toastIdRef.current;
      setToasts((prev) => [...prev, { id, title, desc, kind, color }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
    },
    [],
  );

  const showBanner = useCallback((text: string, color: string) => {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setBanner({ id, text, color });
    setTimeout(() => setBanner((b) => (b && b.id === id ? null : b)), 3000);
  }, []);

  const recalc = useCallback((s: GameState, now: number = Date.now()): GameState => {
    const withGps: GameState = { ...s, totalGPS: calculateTotalGPS(s, now) };
    return {
      ...withGps,
      goldPerClick: calculateGoldPerClick(withGps, now),
    };
  }, []);

  // Load save
  useEffect(() => {
    (async () => {
      const saved = await loadGame();
      if (saved) {
        const now = Date.now();
        const base = createInitialState();
        const migrated: GameState = { ...base, ...saved, saveVersion: SAVE_VERSION };
        for (const b of BUILDINGS) {
          if (!migrated.buildings[b.id]) migrated.buildings[b.id] = { count: 0 };
        }
        // Apply offline progress
        const preGps = calculateTotalGPS(migrated, now);
        const offline = applyOfflineProgress({ ...migrated, totalGPS: preGps }, now);
        migrated.gold += offline.goldEarned;
        migrated.totalGoldEarned += offline.goldEarned;
        migrated.lastTimestamp = now;
        migrated.lastInterestTick = now;
        if (migrated.activeBonus && now >= migrated.activeBonus.expiresAt) migrated.activeBonus = null;
        if (!migrated.nextGoldenCoinTime || migrated.nextGoldenCoinTime < now) {
          migrated.nextGoldenCoinTime = nextCoinTime(now, migrated.unlockedSkillNodes);
        }
        // Apply carry-over upgrade (Holy Order)
        if (migrated.carryOverUpgrade && !migrated.purchasedUpgrades.includes(migrated.carryOverUpgrade)) {
          migrated.purchasedUpgrades = [...migrated.purchasedUpgrades, migrated.carryOverUpgrade];
          migrated.carryOverUpgrade = null;
        }
        const final = recalc(migrated, now);
        setState(final);
        if (offline.secondsElapsed > 60 && offline.goldEarned > 0) {
          const hrs = Math.floor(offline.secondsElapsed / 3600);
          const mins = Math.floor((offline.secondsElapsed % 3600) / 60);
          const dur = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
          pushToast("Welcome back!", `You were away for ${dur}. Your kingdom prospered.`, "success");
        }
      }
      setLoaded(true);
    })();
  }, [pushToast, recalc]);

  // Main tick
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      setState((prev) => {
        const elapsed = Math.max(0, (now - prev.lastTimestamp) / 1000);
        let gold = prev.gold;
        let totalGoldEarned = prev.totalGoldEarned;
        let activeBonus = prev.activeBonus;
        let needsRecalc = false;

        const earned = prev.totalGPS * elapsed;
        gold += earned;
        totalGoldEarned += earned;

        // Banking House — 0.5% of current gold per minute
        let lastInterestTick = prev.lastInterestTick;
        if (prev.unlockedSkillNodes.includes("commerce_3a")) {
          const dt = now - prev.lastInterestTick;
          if (dt > 1000) {
            const minutes = dt / 60000;
            const interest = gold * 0.005 * minutes;
            gold += interest;
            totalGoldEarned += interest;
            lastInterestTick = now;
          }
        } else {
          lastInterestTick = now;
        }

        gold = capGold(gold);
        totalGoldEarned = capGold(totalGoldEarned);

        // Bonus expiry
        if (activeBonus && now >= activeBonus.expiresAt) {
          activeBonus = null;
          needsRecalc = true;
        }

        // Golden coin spawn
        let nextCoin = prev.nextGoldenCoinTime;
        if (!coinVisible && now >= prev.nextGoldenCoinTime) {
          setCoinPos({ x: 30 + Math.random() * 220, y: 20 + Math.random() * 160 });
          setCoinVisible(true);
        }

        // Milestones
        const triggered = [...prev.triggeredMilestones];
        const probe: GameState = { ...prev, gold, totalGoldEarned, activeBonus };
        for (const m of MILESTONES) {
          if (!triggered.includes(m.id) && m.check(probe)) {
            triggered.push(m.id);
            pushToast(m.title, m.desc, "milestone");
          }
        }

        // Check pilgrim-road / faith_2b window end → recalc
        if (prev.unlockedSkillNodes.includes("faith_2b")) {
          const wasBoosted = prev.lastTimestamp - prev.runStartTime < 90_000;
          const stillBoosted = now - prev.runStartTime < 90_000;
          if (wasBoosted !== stillBoosted) needsRecalc = true;
        }

        const base: GameState = {
          ...prev,
          gold,
          totalGoldEarned,
          activeBonus,
          lastTimestamp: now,
          lastInterestTick,
          nextGoldenCoinTime: nextCoin,
          triggeredMilestones: triggered,
        };
        return needsRecalc ? recalc(base, now) : base;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [coinVisible, pushToast, recalc]);

  // Auto-save interval
  useEffect(() => {
    if (!loaded) return;
    const iv = setInterval(() => saveGame(stateRef.current), 30_000);
    return () => clearInterval(iv);
  }, [loaded]);

  // Save on background
  useEffect(() => {
    if (!loaded) return;
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "background" || next === "inactive") saveGame(stateRef.current);
    });
    return () => sub.remove();
  }, [loaded]);

  // Actions
  const click = useCallback(() => {
    hapticClick();
    setState((prev) => {
      const now = Date.now();
      const { add, flatSiegeBonus } = computeClickGoldReward(prev, now);
      const gain = add + flatSiegeBonus;
      // Golden Fist — 1% chance to spawn coin
      if (prev.purchasedUpgrades.includes("click_4") && !coinVisible && Math.random() < 0.01) {
        setCoinPos({ x: 30 + Math.random() * 220, y: 20 + Math.random() * 160 });
        setCoinVisible(true);
      }
      return {
        ...prev,
        gold: capGold(prev.gold + gain),
        totalGoldEarned: capGold(prev.totalGoldEarned + gain),
        totalClicks: prev.totalClicks + 1,
        lifetimeClicks: (prev.lifetimeClicks ?? 0) + 1,
      };
    });
  }, [coinVisible]);

  const buyBuilding = useCallback(
    (buildingId: string, quantity: number | "max") => {
      setState((prev) => {
        let gold = prev.gold;
        let count = prev.buildings[buildingId]?.count ?? 0;
        let bought = 0;
        const qty =
          quantity === "max"
            ? calculateBuyMaxCount(buildingId, gold, count, prev.unlockedSkillNodes, prev.purchasedUpgrades, prev.legacyUpgrades)
            : quantity;
        for (let i = 0; i < qty; i++) {
          const cost = calculateBuildingCost(buildingId, count, prev.unlockedSkillNodes, prev.purchasedUpgrades, prev.legacyUpgrades);
          if (gold < cost) break;
          gold -= cost;
          count += 1;
          bought += 1;
        }
        if (bought === 0) return prev;
        hapticPurchase();
        const next: GameState = {
          ...prev,
          gold,
          buildings: { ...prev.buildings, [buildingId]: { count } },
        };
        return recalc(next);
      });
    },
    [recalc],
  );

  const buyUpgrade = useCallback(
    (upgradeId: string) => {
      setState((prev) => {
        if (prev.purchasedUpgrades.includes(upgradeId)) return prev;
        const u = UPGRADE_BY_ID[upgradeId];
        if (!u) return prev;
        if (prev.gold < u.cost) return prev;
        const next: GameState = {
          ...prev,
          gold: prev.gold - u.cost,
          purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId],
        };
        hapticPurchase();
        pushToast("Upgrade Acquired", u.name, "success");
        return recalc(next);
      });
    },
    [pushToast, recalc],
  );

  const unlockSkillNode = useCallback(
    (nodeId: string) => {
      setState((prev) => {
        if (prev.unlockedSkillNodes.includes(nodeId)) return prev;
        const node = SKILL_NODE_BY_ID[nodeId];
        if (!node) return prev;
        if (!isNodeRequirementMet(node, prev.unlockedSkillNodes)) return prev;
        if (prev.sealsAvailable < node.cost) return prev;
        const next: GameState = {
          ...prev,
          sealsAvailable: prev.sealsAvailable - node.cost,
          unlockedSkillNodes: [...prev.unlockedSkillNodes, nodeId],
        };
        hapticSkill();
        pushToast(node.name + " unlocked!", node.description, "success");
        return recalc(next);
      });
    },
    [pushToast, recalc],
  );

  const prestige = useCallback(
    (carryOverUpgradeId?: string | null) => {
      setState((prev) => {
        const reward = calculatePrestigeSeals(prev);
        if (reward <= 0) return prev;
        const now = Date.now();
        const legacy = calculateLegacyBonuses(
          prev.legacyUpgrades ?? [],
          prev.sealsTotal + reward,
          prev.prestigeCount + 1,
          prev.lifetimeClicks ?? 0,
          prev.totalGPS,
        );
        const skillStartGold = prev.unlockedSkillNodes.includes("lineage_1") ? 100 : 0;
        const startGold = skillStartGold + legacy.startingGold;
        const buildings: Record<string, { count: number }> = {};
        for (const b of BUILDINGS) buildings[b.id] = { count: 0 };

        let purchasedUpgrades: string[] = [];
        if (prev.unlockedSkillNodes.includes("faith_3a") && carryOverUpgradeId) {
          purchasedUpgrades = [carryOverUpgradeId];
        }

        const fresh: GameState = {
        ...prev,
        gold: startGold,
        totalGoldEarned: startGold,  // was prev.totalGoldEarned
        prestigeCount: prev.prestigeCount + 1,
        sealsAvailable: prev.sealsAvailable + reward,
        sealsTotal: prev.sealsTotal + reward,
        buildings,
        purchasedUpgrades,
        activeBonus: null,
        carryOverUpgrade: null,
        lastTimestamp: now,
        runStartTime: now,
        lastInterestTick: now,
        lastRunGps: prev.totalGPS,
        triggeredMilestones: [],  // add this line
        };
        pushToast("Sovereignty Declared!", `+${reward} Royal Seal${reward === 1 ? "" : "s"}`, "success");
        return recalc(fresh, now);
      });
    },
    [pushToast, recalc],
  );

  const setBuyMode = useCallback((mode: BuyMode) => {
    setState((prev) => ({ ...prev, buyMode: mode }));
  }, []);

  const collectGoldenCoin = useCallback(() => {
    setCoinVisible(false);
    setState((prev) => {
      const now = Date.now();
      const roll = Math.random();
      let bonus: ActiveBonus | null = prev.activeBonus;
      let gold = prev.gold;
      let totalGoldEarned = prev.totalGoldEarned;
      const coinMult = prev.unlockedSkillNodes.includes("faith_3b") ? 4 : 1;
      const treasureMult = prev.purchasedUpgrades.includes("coin_2") ? 2 : 1;
      const totalMult = coinMult * treasureMult;
      if (roll < 0.5) {
        const add = prev.totalGPS * 900 * totalMult;
        gold = capGold(gold + add);
        totalGoldEarned = capGold(totalGoldEarned + add);
        showBanner(`Royal Windfall! +${formatGold(Math.floor(add))} gold`, "#cc8800");
      } else if (roll < 0.8) {
        bonus = { type: "gps_boost", multiplier: 2 * totalMult, expiresAt: now + 30_000 };
        showBanner(`Royal Favour! ×${2 * totalMult} Gold/sec for 30s`, "#cc8800");
      } else {
        bonus = { type: "click_boost", multiplier: 10 * totalMult, expiresAt: now + 30_000 };
        showBanner(`King's Blessing! ×${10 * totalMult} Click Power for 30s`, "#cc8800");
      }
      const next: GameState = {
        ...prev,
        gold,
        totalGoldEarned,
        activeBonus: bonus,
        goldenCoinsCollected: prev.goldenCoinsCollected + 1,
        nextGoldenCoinTime: nextCoinTime(now, prev.unlockedSkillNodes),
      };
      return recalc(next, now);
    });
  }, [recalc, showBanner]);

  const buyLegacyUpgrade = useCallback(
    (legacyId: string) => {
      setState((prev) => {
        if ((prev.legacyUpgrades ?? []).includes(legacyId)) return prev;
        const u = LEGACY_BY_ID[legacyId];
        if (!u) return prev;
        const current = prev.legacyUpgrades ?? [];
        for (const req of u.requires) if (!current.includes(req)) return prev;
        if (prev.sealsAvailable < u.cost) return prev;
        const next: GameState = {
          ...prev,
          sealsAvailable: prev.sealsAvailable - u.cost,
          legacyUpgrades: [...current, legacyId],
        };
        hapticSkill();
        pushToast(u.name + " — Legacy Unlocked", u.description, "success");
        return recalc(next);
      });
    },
    [pushToast, recalc],
  );

  const hardReset = useCallback(async () => {
    await deleteSave();
    setState(createInitialState());
    pushToast("Kingdom wiped.", "A new tale begins.", "info");
  }, [pushToast]);

  const prestigeReward = useMemo(
    () => calculatePrestigeSeals(state),
    [state],
  );

  return useMemo(
    () => ({
      state,
      loaded,
      toasts,
      banner,
      coinVisible,
      coinPos,
      click,
      buyBuilding,
      buyUpgrade,
      unlockSkillNode,
      prestige,
      hardReset,
      setBuyMode,
      collectGoldenCoin,
      prestigeReward,
      pushToast,
      buyLegacyUpgrade,
      legacyUpgrades: LEGACY_UPGRADES,
    }),
    [
      state,
      loaded,
      toasts,
      banner,
      coinVisible,
      coinPos,
      click,
      buyBuilding,
      buyUpgrade,
      unlockSkillNode,
      prestige,
      hardReset,
      setBuyMode,
      collectGoldenCoin,
      prestigeReward,
      pushToast,
      buyLegacyUpgrade,
    ],
  );
});

export function useGame() {
  return useGameInternal();
}
