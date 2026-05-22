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
  DEFAULT_CHALLENGE_STATE,
  ChallengeState,
} from "@/data/gameState";
import {
  applyOfflineProgress,
  calculateBuildingCost,
  calculateBuyMaxCount,
  calculateGoldPerClick,
  calculatePrestigeSeals,
  calculateTotalGPS,
  computeClickGoldReward,
  isUpgradeAvailable,
} from "@/data/gameEngine";
import { MILESTONES } from "@/data/milestones";
import { deleteSave, loadGame, saveGame } from "@/data/saveSystem";
import { formatGold } from "@/utils/formatNumber";
import { LEGACY_BY_ID, LEGACY_UPGRADES, calculateLegacyBonuses } from "@/data/legacyUpgrades";
import {
  getAscensionRequirements,
  buildPostAscensionState,
  calculateCrownsEarned,
  getCrownStartGold,
  getCrownCoinSpawnInterval,
  CROWN_BY_ID,
} from "@/data/ascension";
import {
  CHALLENGE_BY_ID,
  isChallengeUnlocked,
  evaluateMedal,
  GOLD_MEDAL_BONUSES,
  pickPlagueEvent,
  getLowestGPSBuilding,
  getAusterityProgress,
  EDICT_BY_ID,
  MAX_EDICTS,
} from "@/data/challenges";

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

// ─── Plague event application ─────────────────────────────────────────────────
function applyPlagueEvent(
  state: GameState,
  eventId: string,
  now: number,
): Partial<GameState & { challenges: ChallengeState }> {
  const ch = { ...state.challenges };
  let gold = state.gold;
  switch (eventId) {
    case "rats": {
      const building = getLowestGPSBuilding(state);
      if (building) {
        ch.ratInfestationBuilding = building;
        ch.ratInfestationExpiry = now + 120_000;
      }
      break;
    }
    case "fever":
      ch.plagueRecovery = Math.max(0.05, ch.plagueRecovery - 0.10);
      break;
    case "gravediggers":
      ch.tempCostMultiplier = 1.25;
      ch.tempCostMultiplierExpiry = now + 90_000;
      break;
    case "exodus":
      gold = capGold(gold * 0.92);
      break;
  }
  return { challenges: ch, gold };
}

function coinInterval(state: GameState): { min: number; max: number } {
  const unlocked = state.unlockedSkillNodes;
  // Siege challenge: coins spawn frequently
  if (state.challenges.active === "ch_siege") return { min: 15_000, max: 15_000 };
  // Crown: The Crowned Age — 30s guaranteed
  if (state.ascension?.crownUpgrades?.includes("crown_crowned_age")) return { min: 30_000, max: 30_000 };
  if (unlocked.includes("pinnacle")) return { min: 30_000, max: 30_000 };
  if (unlocked.includes("military_3b")) return { min: 30_000, max: 270_000 };
  return { min: 60_000, max: 600_000 };
}

function nextCoinTime(now: number, state: GameState): number {
  const { min, max } = coinInterval(state);
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
        if (!migrated.prestigePhase) migrated.prestigePhase = "playing";
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
          migrated.nextGoldenCoinTime = nextCoinTime(now, migrated);
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

  // Main tick (paused during legacy shop after declaring sovereignty)
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      setState((prev) => {
        if (prev.prestigePhase === "legacy_shop") return prev;
        const elapsed = Math.max(0, (now - prev.lastTimestamp) / 1000);
        let gold = prev.gold;
        let totalGoldEarned = prev.totalGoldEarned;
        let activeBonus = prev.activeBonus;
        let needsRecalc = false;

        const earned = prev.totalGPS * elapsed;
        gold += earned;
        totalGoldEarned += earned;

        // Banking House — 0.3% of current gold per minute
        let lastInterestTick = prev.lastInterestTick;
        if (prev.unlockedSkillNodes.includes("commerce_3a")) {
          const dt = now - prev.lastInterestTick;
          if (dt > 1000) {
            const minutes = dt / 60000;
            const interest = gold * 0.003 * minutes;
            gold += interest;
            totalGoldEarned += interest;
            lastInterestTick = now;
          }
        } else {
          lastInterestTick = now;
        }

        // ── Challenge ticks ──────────────────────────────────────────────────
        let challenges = { ...prev.challenges };
        const activeChallenge = challenges.active;

        // Plague: recovery ticks + events
        if (activeChallenge === "ch_plague") {
          const recoveryPerSecond = 0.003 / 60;
          challenges.plagueRecovery = Math.min(
            1.0,
            challenges.plagueRecovery + recoveryPerSecond * elapsed,
          );
          if (
            challenges.lastPlagueEventTime === 0 ||
            now - challenges.lastPlagueEventTime >= 180_000
          ) {
            if (challenges.lastPlagueEventTime > 0) {
              const event = pickPlagueEvent();
              const result = applyPlagueEvent(
                { ...prev, gold, challenges },
                event.id,
                now,
              );
              if (result.gold !== undefined) gold = result.gold;
              if (result.challenges) challenges = result.challenges;
              needsRecalc = true;
              pushToast(`⚠ ${event.label}`, event.description, "info");
            }
            challenges.lastPlagueEventTime = now;
          }
        }

        // Entropy: decay accelerates over time
        if (activeChallenge === "ch_entropy" && !challenges.entropyCollapsed) {
          const deltaMinutes = elapsed / 60;
          challenges.entropyDecayRate += 0.005 * deltaMinutes;
          challenges.entropyDecay *= Math.pow(
            1 - challenges.entropyDecayRate,
            deltaMinutes,
          );
          challenges.entropyDecay = Math.max(0.05, challenges.entropyDecay);
          needsRecalc = true;

          if (challenges.entropyDecay <= 0.10) {
            // Entropy collapse: reset buildings and redistribute
            challenges.entropyCollapsed = true;
            needsRecalc = true;
            pushToast("⚡ ENTROPY COLLAPSE", "Your buildings scatter to the winds.", "info");
          }
        }

        // Taxed: drain 5% of gold every 60 seconds
        if (activeChallenge === "ch_taxed") {
          if (now - challenges.lastTaxedDrainTime >= 60_000) {
            gold = capGold(gold * 0.95);
            challenges.lastTaxedDrainTime = now;
          }
        }

        // Austerity: check unlock threshold
        if (activeChallenge === "ch_austerity" && !challenges.austerityUnlocked) {
          const { locked } = getAusterityProgress({ ...prev, totalGPS: prev.totalGPS });
          if (!locked) {
            challenges.austerityUnlocked = true;
            pushToast("Austerity Lifted", "Upgrades are now available.", "success");
          }
        }

        // Track lifetime gold for ascension gate
        const ascension = {
          ...prev.ascension,
          lifetimeGoldThisAscension: capGold(
            (prev.ascension?.lifetimeGoldThisAscension ?? 0) + earned,
          ),
        };

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
            if (m.important) pushToast(m.title, m.desc, "milestone");
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
          lifetimeGoldAllTime: capGold(
            (prev.lifetimeGoldAllTime ?? 0) + earned,
          ),
          activeBonus,
          edictBoosts: (prev.edictBoosts ?? []).filter((b) => now < b.expiresAt),
          lastTimestamp: now,
          lastInterestTick,
          nextGoldenCoinTime: nextCoin,
          triggeredMilestones: triggered,
          challenges,
          ascension,
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
    if (stateRef.current.prestigePhase === "legacy_shop") return;
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

  const debugAddGold = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      gold: capGold(prev.gold + amount),
      totalGoldEarned: capGold(prev.totalGoldEarned + amount),
    }));
  }, []);

  const buyBuilding = useCallback(
    (buildingId: string, quantity: number | "max") => {
      setState((prev) => {
        if (prev.prestigePhase === "legacy_shop") return prev;
        // Challenge: One Building — block other buildings
        if (
          prev.challenges.active === "ch_one" &&
          prev.challenges.activeChallengeBuilding &&
          buildingId !== prev.challenges.activeChallengeBuilding
        ) return prev;

        let gold = prev.gold;
        let count = prev.buildings[buildingId]?.count ?? 0;
        let bought = 0;
        const qty =
          quantity === "max"
            ? calculateBuyMaxCount(buildingId, gold, count, prev.unlockedSkillNodes, prev.purchasedUpgrades, prev.legacyUpgrades)
            : quantity;
        for (let i = 0; i < qty; i++) {
          const cost = calculateBuildingCost(buildingId, count, prev.unlockedSkillNodes, prev.purchasedUpgrades, prev.legacyUpgrades, prev);
          if (gold < cost) break;
          gold -= cost;
          count += 1;
          bought += 1;
        }
        if (bought === 0) return prev;
        hapticPurchase();

        // Plague: chance to spread on purchase
        let challenges = prev.challenges;
        if (prev.challenges.active === "ch_plague" && Math.random() < 0.15) {
          challenges = {
            ...challenges,
            plagueRecovery: Math.max(0.05, challenges.plagueRecovery - 0.05),
          };
        }

        const next: GameState = {
          ...prev,
          gold,
          buildings: { ...prev.buildings, [buildingId]: { count } },
          challenges,
        };
        return recalc(next);
      });
    },
    [recalc],
  );

  const buyUpgrade = useCallback(
    (upgradeId: string) => {
      setState((prev) => {
        if (prev.prestigePhase === "legacy_shop") return prev;
        if (prev.purchasedUpgrades.includes(upgradeId)) return prev;
        const u = UPGRADE_BY_ID[upgradeId];
        if (!u) return prev;
        // Challenge: Austerity — upgrades locked until GPS threshold
        if (prev.challenges.active === "ch_austerity" && !prev.challenges.austerityUnlocked) return prev;
        // Edict: King's Word — next upgrade is free
        const isFree = prev.challenges.freeNextUpgrade;
        if (!isFree && prev.gold < u.cost) return prev;
        const next: GameState = {
          ...prev,
          gold: isFree ? prev.gold : prev.gold - u.cost,
          purchasedUpgrades: [...prev.purchasedUpgrades, upgradeId],
          challenges: { ...prev.challenges, freeNextUpgrade: false },
        };
        hapticPurchase();
        pushToast("Upgrade Acquired", u.name, "success");
        return recalc(next);
      });
    },
    [pushToast, recalc],
  );

  const buyAllUpgrades = useCallback(() => {
    setState((prev) => {
      if (prev.prestigePhase === "legacy_shop") return prev;
      const available = Object.values(UPGRADE_BY_ID)
        .filter((u) => isUpgradeAvailable(u.id, prev))
        .sort((a, b) => a.cost - b.cost);
      let next = prev;
      let bought = 0;
      for (const u of available) {
        if (next.gold < u.cost) break;
        next = recalc({
          ...next,
          gold: next.gold - u.cost,
          purchasedUpgrades: [...next.purchasedUpgrades, u.id],
        });
        bought++;
      }
      if (bought > 0) pushToast("Upgrades Acquired", `Purchased ${bought} upgrade${bought > 1 ? "s" : ""}`, "success");
      return next;
    });
  }, [pushToast, recalc]);

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

  /** Enter legacy shop: award seals and pause the realm until startNewKingdom. */
  const declareSovereignty = useCallback(
    (carryOverUpgradeId?: string | null) => {
      setState((prev) => {
        if (prev.prestigePhase === "legacy_shop") return prev;
        const reward = calculatePrestigeSeals(prev);
        if (reward <= 0) return prev;
        const now = Date.now();

        // Holy Order: how many carry-overs allowed
        const holyOrderActive = prev.unlockedSkillNodes.includes("faith_3a");
        const maxCarryOver = holyOrderActive
          ? (prev.ascension.crownUpgrades.includes("crown_undying_realm") ? 3 : 1)
          : 0;
        const carryOverUpgrades: string[] = [];
        if (holyOrderActive && carryOverUpgradeId) {
          carryOverUpgrades.push(carryOverUpgradeId);
        }

        // Challenge completion
        let challenges = { ...prev.challenges };
        if (challenges.active && challenges.activeStartTime) {
          const elapsedSeconds = (now - challenges.activeStartTime) / 1000;
          const medal = evaluateMedal(elapsedSeconds);
          const challengeId = challenges.active;
          const existingMedal = challenges.medals[challengeId];
          const medalRank: Record<string, number> = { bronze: 1, silver: 2, gold: 3 };
          const shouldUpgrade = !existingMedal || (medalRank[medal] ?? 0) > (medalRank[existingMedal] ?? 0);

          if (shouldUpgrade) {
            challenges = {
              ...challenges,
              medals: { ...challenges.medals, [challengeId]: medal },
              completed: [...challenges.completed, challengeId],
            };
            if (medal === "gold") {
              const bonus = GOLD_MEDAL_BONUSES[challengeId];
              pushToast(
                "🥇 Gold Medal!",
                bonus ? bonus.description : `Gold on ${challengeId}`,
                "success",
              );
            } else {
              pushToast(
                medal === "silver" ? "🥈 Silver Medal" : "🥉 Bronze Medal",
                `Challenge completed: ${CHALLENGE_BY_ID[challengeId]?.name ?? challengeId}`,
                "success",
              );
            }
          } else {
            challenges.completed = [...challenges.completed, challengeId];
          }
          // Grant an edict for completing any challenge
          if (challenges.edicts.length < MAX_EDICTS) {
            const edictIds = ["royal_decree", "war_chest", "kings_word", "conscription", "golden_harvest"];
            challenges.edicts = [
              ...challenges.edicts,
              edictIds[Math.floor(Math.random() * edictIds.length)],
            ];
          }
          challenges.active = null;
          challenges.activeStartTime = null;
          challenges.activeTier = null;
        }

        const next: GameState = {
          ...prev,
          gold: 0,
          prestigeCount: prev.prestigeCount + 1,
          sealsAvailable: prev.sealsAvailable + reward,
          sealsTotal: prev.sealsTotal + reward,
          prestigePhase: "legacy_shop",
          carryOverUpgrade: carryOverUpgrades[0] ?? null,
          carryOverUpgrades,
          lastRunGps: prev.totalGPS,
          lastTimestamp: now,
          challenges,
        };
        pushToast(
          "Sovereignty Declared!",
          `+${reward} Royal Seal${reward === 1 ? "" : "s"} — spend them in the Legacy Hall`,
          "success",
        );
        return next;
      });
    },
    [pushToast],
  );

  /** Begin a fresh kingdom after spending seals in the legacy shop. */
  const startNewKingdom = useCallback(() => {
    setState((prev) => {
      if (prev.prestigePhase !== "legacy_shop") return prev;
      const now = Date.now();
      const legacy = calculateLegacyBonuses(
        prev.legacyUpgrades ?? [],
        prev.sealsTotal,
        prev.prestigeCount,
        prev.lifetimeClicks ?? 0,
        prev.lastRunGps,
      );
      const skillStartGold = prev.unlockedSkillNodes.includes("lineage_1") ? 500 : 0;
      const crownStartGold = getCrownStartGold(prev);
      const startGold = skillStartGold + legacy.startingGold + crownStartGold;
      const buildings: Record<string, { count: number }> = {};
      for (const b of BUILDINGS) buildings[b.id] = { count: 0 };

      // Holy Order carry-overs (single or multi with crown)
      const purchasedUpgrades: string[] = [
        ...(prev.carryOverUpgrades ?? []),
        ...(prev.carryOverUpgrade && !prev.carryOverUpgrades?.includes(prev.carryOverUpgrade)
          ? [prev.carryOverUpgrade]
          : []),
      ].filter(Boolean);

      const fresh: GameState = {
        ...prev,
        gold: startGold,
        totalGoldEarned: startGold,
        buildings,
        purchasedUpgrades,
        activeBonus: null,
        edictBoosts: [],
        carryOverUpgrade: null,
        carryOverUpgrades: [],
        prestigePhase: "playing",
        lastTimestamp: now,
        runStartTime: now,
        lastInterestTick: now,
        nextGoldenCoinTime: nextCoinTime(now, prev),
        // NOTE: triggeredMilestones is intentionally NOT reset — achievements persist across prestiges
      };
      pushToast("A New Kingdom Rises", "Your legacy powers are now active.", "success");
      return recalc(fresh, now);
    });
  }, [pushToast, recalc]);

  /** Start a challenge run — immediately begins new kingdom with challenge active. */
  const startChallengeRun = useCallback(
    (challengeId: string, selectedBuilding?: string | null) => {
      setState((prev) => {
        const challenge = CHALLENGE_BY_ID[challengeId];
        if (!challenge) return prev;
        if (!isChallengeUnlocked(challenge, prev)) return prev;

        const now = Date.now();
        const legacy = calculateLegacyBonuses(
          prev.legacyUpgrades ?? [],
          prev.sealsTotal,
          prev.prestigeCount,
          prev.lifetimeClicks ?? 0,
          prev.lastRunGps,
        );
        const skillStartGold = prev.unlockedSkillNodes.includes("lineage_1") ? 500 : 0;
        const crownStartGold = getCrownStartGold(prev);
        const startGold = skillStartGold + legacy.startingGold + crownStartGold;

        const buildings: Record<string, { count: number }> = {};
        for (const b of BUILDINGS) buildings[b.id] = { count: 0 };

        const challenges: ChallengeState = {
          ...DEFAULT_CHALLENGE_STATE,
          completed: prev.challenges.completed,
          medals: prev.challenges.medals,
          edicts: prev.challenges.edicts,
          fragmentsEarned: prev.challenges.fragmentsEarned,
          active: challengeId,
          activeStartTime: now,
          activeTier: challenge.tier,
          activeChallengeBuilding: selectedBuilding ?? null,
          plagueRecovery: challengeId === "ch_plague" ? 0.05 : 1.0,
          lastPlagueEventTime: challengeId === "ch_plague" ? now : 0,
          lastTaxedDrainTime: challengeId === "ch_taxed" ? now : 0,
          entropyDecay: 1.0,
          entropyDecayRate: 0.02,
        };

        const fresh: GameState = {
          ...prev,
          gold: startGold,
          totalGoldEarned: startGold,
          buildings,
          purchasedUpgrades: [],
          activeBonus: null,
          edictBoosts: [],
          carryOverUpgrade: null,
          carryOverUpgrades: [],
          prestigePhase: "playing",
          lastTimestamp: now,
          runStartTime: now,
          lastInterestTick: now,
          nextGoldenCoinTime: nextCoinTime(now, prev),
          challenges,
        };

        pushToast(
          `Challenge Run: ${challenge.name}`,
          `${challenge.multiplier}× Seals on completion`,
          "success",
        );
        return recalc(fresh, now);
      });
    },
    [pushToast, recalc],
  );

  /** Execute ascension — the meta-prestige. */
  const executeAscension = useCallback(() => {
    setState((prev) => {
      const req = getAscensionRequirements(prev);
      if (!req.canAscend) return prev;
      const crowns = calculateCrownsEarned(prev);
      const fresh = createInitialState();
      const post = buildPostAscensionState(prev, fresh);
      pushToast(
        "ASCENSION",
        `+${crowns} Crown${crowns === 1 ? "" : "s"} — your dynasty endures.`,
        "success",
      );
      return recalc(post);
    });
  }, [pushToast, recalc]);

  /** Buy a Crown upgrade from the Crown Shop. */
  const buyCrownUpgrade = useCallback(
    (crownId: string) => {
      setState((prev) => {
        const upgrade = CROWN_BY_ID[crownId];
        if (!upgrade) return prev;
        if (prev.ascension.crownUpgrades.includes(crownId)) return prev;
        if (prev.ascension.crowns < upgrade.cost) return prev;
        if (upgrade.requiresAscension && prev.ascension.count < upgrade.requiresAscension) return prev;
        for (const req of upgrade.requires) {
          if (!prev.ascension.crownUpgrades.includes(req)) return prev;
        }
        const next: GameState = {
          ...prev,
          ascension: {
            ...prev.ascension,
            crowns: prev.ascension.crowns - upgrade.cost,
            crownUpgrades: [...prev.ascension.crownUpgrades, crownId],
          },
        };
        hapticSkill();
        pushToast(upgrade.name, upgrade.description, "success");
        return recalc(next);
      });
    },
    [pushToast, recalc],
  );

  /** Use an edict from the player's inventory. */
  const useEdict = useCallback(
    (edictId: string) => {
      setState((prev) => {
        const idx = prev.challenges.edicts.indexOf(edictId);
        if (idx === -1) return prev;
        const now = Date.now();
        const newEdicts = [...prev.challenges.edicts];
        newEdicts.splice(idx, 1);
        let gold = prev.gold;
        let totalGoldEarned = prev.totalGoldEarned;
        const edictBoosts = [...(prev.edictBoosts ?? [])];
        let challenges = { ...prev.challenges, edicts: newEdicts };

        switch (edictId) {
          case "royal_decree":
            edictBoosts.push({ type: "gps_boost", multiplier: 3, expiresAt: now + 300_000 });
            pushToast("Royal Decree!", "×3 GPS for 5 minutes.", "bonus", "#f5c842");
            break;
          case "war_chest": {
            const gain = prev.totalGPS * 600;
            gold = capGold(gold + gain);
            totalGoldEarned = capGold(totalGoldEarned + gain);
            pushToast("War Chest!", `+${formatGold(gain)} gold`, "bonus", "#f5c842");
            break;
          }
          case "kings_word":
            challenges = { ...challenges, freeNextUpgrade: true };
            pushToast("The King's Word", "Your next upgrade is free.", "bonus", "#f5c842");
            break;
          case "conscription":
            edictBoosts.push({ type: "click_boost", multiplier: 2, expiresAt: now + 600_000 });
            pushToast("Conscription!", "×2 click power for 10 minutes.", "bonus", "#f5c842");
            break;
          case "golden_harvest":
            // Spawn coins is handled in the component layer; just toast here
            pushToast("Golden Harvest!", "3 Golden Coins incoming.", "bonus", "#f5c842");
            break;
        }

        const next: GameState = { ...prev, gold, totalGoldEarned, edictBoosts, challenges };
        return edictId === "royal_decree" || edictId === "conscription" ? recalc(next, now) : next;
      });
    },
    [pushToast, recalc],
  );

  /** Grant an edict to the player's inventory (called after challenge completion). */
  const grantEdict = useCallback((edictId: string) => {
    setState((prev) => {
      if (prev.challenges.edicts.length >= MAX_EDICTS) return prev;
      return {
        ...prev,
        challenges: {
          ...prev.challenges,
          edicts: [...prev.challenges.edicts, edictId],
        },
      };
    });
  }, []);

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
      let challenges = prev.challenges;

      const coinMult = prev.unlockedSkillNodes.includes("faith_3b") ? 2 : 1;
      const treasureMult = prev.purchasedUpgrades.includes("coin_2") ? 2 : 1;
      const totalMult = coinMult * treasureMult;

      // Siege challenge: collecting reduces intensity
      if (prev.challenges.active === "ch_siege") {
        challenges = {
          ...challenges,
          siegeIntensity: Math.max(0, challenges.siegeIntensity - 1),
        };
      }

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
        nextGoldenCoinTime: nextCoinTime(now, prev),
        challenges,
      };
      return recalc(next, now);
    });
  }, [recalc, showBanner]);

  /** Called when a siege coin expires without being collected. */
  const onSiegeCoinExpired = useCallback(() => {
    setCoinVisible(false);
    setState((prev) => {
      if (prev.challenges.active !== "ch_siege") return prev;
      const intensity = prev.challenges.siegeIntensity;
      const drain = 0.20 + intensity * 0.05;
      const now = Date.now();
      const gold = capGold(prev.gold * (1 - drain));
      const newIntensity = Math.min(10, intensity + 1);
      showBanner(`Coin missed! ${(drain * 100).toFixed(0)}% gold lost.`, "#c0392b");
      const next: GameState = {
        ...prev,
        gold,
        challenges: {
          ...prev.challenges,
          siegeIntensity: newIntensity,
        },
        nextGoldenCoinTime: nextCoinTime(now, prev),
      };
      return next;
    });
  }, [showBanner]);

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

  const applyAdBonus = useCallback(() => {
    const now = Date.now();
    setState((prev) => {
      const bonus: ActiveBonus = {
        type: "gps_boost",
        multiplier: 2,
        expiresAt: now + 2 * 60 * 60 * 1000,
      };
      return recalc({ ...prev, activeBonus: bonus }, now);
    });
    pushToast("Royal Patron!", "×2 Gold/sec for 2 hours", "bonus", "#f5c842");
  }, [recalc, pushToast]);

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
      buyAllUpgrades,
      unlockSkillNode,
      declareSovereignty,
      startNewKingdom,
      startChallengeRun,
      executeAscension,
      buyCrownUpgrade,
      useEdict,
      grantEdict,
      onSiegeCoinExpired,
      hardReset,
      setBuyMode,
      collectGoldenCoin,
      applyAdBonus,
      prestigeReward,
      pushToast,
      buyLegacyUpgrade,
      legacyUpgrades: LEGACY_UPGRADES,
      debugAddGold,
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
      buyAllUpgrades,
      unlockSkillNode,
      declareSovereignty,
      startNewKingdom,
      startChallengeRun,
      executeAscension,
      buyCrownUpgrade,
      useEdict,
      grantEdict,
      onSiegeCoinExpired,
      hardReset,
      setBuyMode,
      collectGoldenCoin,
      applyAdBonus,
      prestigeReward,
      pushToast,
      buyLegacyUpgrade,
      debugAddGold,
    ],
  );
});

export function useGame() {
  return useGameInternal();
}
