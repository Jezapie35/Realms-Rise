import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS, FONTS, RADIUS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { BUILDINGS } from "@/data/buildings";
import { UPGRADE_BY_ID } from "@/data/upgrades";
import { LEGACY_UPGRADES } from "@/data/legacyUpgrades";

const ADMIN_CODE = "hello";

const ALL_SKILL_NODE_IDS = [
  "commerce_1", "commerce_2a", "commerce_2b", "commerce_3a", "commerce_3b", "commerce_4",
  "military_1", "military_2a", "military_2b", "military_3a", "military_3b", "military_4",
  "faith_1", "faith_2a", "faith_2b", "faith_3a", "faith_3b", "faith_4",
  "lineage_1", "lineage_2a", "lineage_2b", "lineage_3a", "lineage_3b", "lineage_4",
  "cross_1", "cross_2", "pinnacle",
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AdminPanel({ visible, onClose }: Props) {
  const [authenticated, setAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);
  const gameCtx = useGame() as any;
  const { state, pushToast } = gameCtx;
  const _patchState = gameCtx._patchState;

  const handleLogin = () => {
    if (codeInput.trim().toLowerCase() === ADMIN_CODE) {
      setAuthenticated(true);
      setCodeError(false);
      setCodeInput("");
    } else {
      setCodeError(true);
      setCodeInput("");
    }
  };

  const handleClose = () => {
    setAuthenticated(false);
    setCodeInput("");
    setCodeError(false);
    onClose();
  };

  // ─── Cheat Actions ────────────────────────────────────────────────────────

  const cheatAddGold = (amount: number) => {
    _patchState((prev: any) => ({
      ...prev,
      gold: Math.min(prev.gold + amount, 1e300),
      totalGoldEarned: Math.min(prev.totalGoldEarned + amount, 1e300),
    }));
    pushToast("Admin Cheat", `+${amount.toExponential(2)} gold added 💰`, "success");
  };

  const cheatMaxBuildings = () => {
    _patchState((prev: any) => {
      const buildings: Record<string, { count: number }> = { ...prev.buildings };
      for (const b of BUILDINGS) buildings[b.id] = { count: 500 };
      return { ...prev, buildings };
    });
    pushToast("Admin Cheat", "All buildings maxed to 500 🏰", "success");
  };

  const cheatUnlockUpgrades = () => {
    _patchState((prev: any) => {
      const allIds = Object.keys(UPGRADE_BY_ID);
      const existing = new Set(prev.purchasedUpgrades);
      const merged = [...prev.purchasedUpgrades, ...allIds.filter((id: string) => !existing.has(id))];
      return { ...prev, purchasedUpgrades: merged };
    });
    pushToast("Admin Cheat", "All upgrades unlocked ⚔️", "success");
  };

  const cheatUnlockSkills = () => {
    _patchState((prev: any) => {
      const existing = new Set(prev.unlockedSkillNodes);
      const merged = [...prev.unlockedSkillNodes, ...ALL_SKILL_NODE_IDS.filter((id) => !existing.has(id))];
      return { ...prev, unlockedSkillNodes: merged };
    });
    pushToast("Admin Cheat", "All skill nodes unlocked 🌟", "success");
  };

  const cheatAddSeals = (amount: number) => {
    _patchState((prev: any) => ({
      ...prev,
      sealsAvailable: prev.sealsAvailable + amount,
      sealsTotal: prev.sealsTotal + amount,
    }));
    pushToast("Admin Cheat", `+${amount} Royal Seals added 🔱`, "success");
  };

  const cheatUnlockLegacy = () => {
    _patchState((prev: any) => {
      const allLegacyIds = LEGACY_UPGRADES.map((u: any) => u.id);
      const existing = new Set(prev.legacyUpgrades ?? []);
      const merged = [...(prev.legacyUpgrades ?? []), ...allLegacyIds.filter((id: string) => !existing.has(id))];
      return { ...prev, legacyUpgrades: merged };
    });
    pushToast("Admin Cheat", "All legacy upgrades unlocked 📜", "success");
  };

  const cheatMaxClicks = () => {
    _patchState((prev: any) => ({
      ...prev,
      totalClicks: prev.totalClicks + 1_000_000,
      lifetimeClicks: (prev.lifetimeClicks ?? 0) + 1_000_000,
    }));
    pushToast("Admin Cheat", "+1M clicks added 👆", "success");
  };

  const cheatUnlockEverything = () => {
    _patchState((prev: any) => {
      const allUpgradeIds = Object.keys(UPGRADE_BY_ID);
      const allLegacyIds = LEGACY_UPGRADES.map((u: any) => u.id);
      const buildings: Record<string, { count: number }> = {};
      for (const b of BUILDINGS) buildings[b.id] = { count: 500 };
      return {
        ...prev,
        gold: 1e50,
        totalGoldEarned: Math.max(prev.totalGoldEarned, 1e50),
        buildings,
        purchasedUpgrades: allUpgradeIds,
        unlockedSkillNodes: ALL_SKILL_NODE_IDS,
        legacyUpgrades: allLegacyIds,
        sealsAvailable: prev.sealsAvailable + 9999,
        sealsTotal: prev.sealsTotal + 9999,
        totalClicks: prev.totalClicks + 1_000_000,
        lifetimeClicks: (prev.lifetimeClicks ?? 0) + 1_000_000,
      };
    });
    pushToast("👑 ADMIN GOD MODE", "Everything unlocked!", "bonus");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {!authenticated ? (
            <View style={styles.loginContainer}>
              <Text style={styles.crownIcon}>👑</Text>
              <Text style={styles.title}>Admin Panel</Text>
              <Text style={styles.subtitle}>Enter the secret code to continue</Text>
              <TextInput
                style={[styles.codeInput, codeError && styles.codeInputError]}
                value={codeInput}
                onChangeText={(t) => { setCodeInput(t); setCodeError(false); }}
                placeholder="Enter code..."
                placeholderTextColor="#888"
                secureTextEntry
                autoCapitalize="none"
                onSubmitEditing={handleLogin}
              />
              {codeError && <Text style={styles.errorText}>❌ Wrong code. Try again.</Text>}
              <Pressable style={styles.loginBtn} onPress={handleLogin}>
                <Text style={styles.loginBtnText}>Unlock Admin</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.crownIcon}>👑</Text>
                <Text style={styles.title}>Admin Panel</Text>
                <Pressable onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </Pressable>
              </View>
              <Text style={styles.subtitle}>Cheats &amp; Debug Tools</Text>

              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* GOD MODE */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚡ God Mode</Text>
                  <CheatButton
                    label="UNLOCK EVERYTHING"
                    desc="Max gold, buildings, upgrades, skills, seals — all at once"
                    color="#cc8800"
                    onPress={cheatUnlockEverything}
                  />
                </View>

                {/* GOLD */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💰 Gold</Text>
                  <CheatButton label="+1 Million Gold" desc="Add 1,000,000 gold" onPress={() => cheatAddGold(1_000_000)} />
                  <CheatButton label="+1 Billion Gold" desc="Add 1,000,000,000 gold" onPress={() => cheatAddGold(1_000_000_000)} />
                  <CheatButton label="+1 Trillion Gold" desc="Add 1e12 gold" onPress={() => cheatAddGold(1e12)} />
                  <CheatButton label="+Insane Gold (1e50)" desc="Basically infinite" color="#a06800" onPress={() => cheatAddGold(1e50)} />
                </View>

                {/* BUILDINGS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🏰 Buildings</Text>
                  <CheatButton label="Max All Buildings" desc="Set every building to 500" onPress={cheatMaxBuildings} />
                </View>

                {/* UPGRADES */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚔️ Upgrades</Text>
                  <CheatButton label="Unlock All Upgrades" desc="Purchase every upgrade instantly" onPress={cheatUnlockUpgrades} />
                </View>

                {/* SKILL TREE */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🌟 Skill Tree</Text>
                  <CheatButton label="Unlock All Skill Nodes" desc="All 27 nodes across every branch" onPress={cheatUnlockSkills} />
                  <CheatButton label="+100 Royal Seals" desc="Add 100 seals to spend" onPress={() => cheatAddSeals(100)} />
                  <CheatButton label="+9999 Royal Seals" desc="Basically unlimited seals" color="#a06800" onPress={() => cheatAddSeals(9999)} />
                </View>

                {/* LEGACY */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📜 Legacy</Text>
                  <CheatButton label="Unlock All Legacy Upgrades" desc="Every legacy upgrade unlocked" onPress={cheatUnlockLegacy} />
                </View>

                {/* CLICKS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>👆 Clicks</Text>
                  <CheatButton label="+1 Million Clicks" desc="Adds to total and lifetime click counters" onPress={cheatMaxClicks} />
                </View>

                {/* LIVE STATS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📊 Current State</Text>
                  <StatRow label="Gold" value={state.gold.toExponential(2)} />
                  <StatRow label="Seals Available" value={String(state.sealsAvailable)} />
                  <StatRow label="Prestige Count" value={String(state.prestigeCount)} />
                  <StatRow label="Upgrades Owned" value={String(state.purchasedUpgrades.length)} />
                  <StatRow label="Skills Unlocked" value={`${state.unlockedSkillNodes.length} / ${ALL_SKILL_NODE_IDS.length}`} />
                  <StatRow label="Buildings w/ 500" value={String(Object.values(state.buildings).filter((b: any) => b.count >= 500).length)} />
                </View>

                <View style={{ height: 24 }} />
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CheatButton({
  label, desc, onPress, color = "#2d5a2d",
}: { label: string; desc: string; onPress: () => void; color?: string }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.cheatBtn, { backgroundColor: color, opacity: pressed ? 0.75 : 1 }]}
      onPress={onPress}
    >
      <Text style={styles.cheatBtnLabel}>{label}</Text>
      <Text style={styles.cheatBtnDesc}>{desc}</Text>
    </Pressable>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: COLORS.surface ?? "#1a1a2e",
    borderRadius: RADIUS.lg ?? 16,
    width: "88%",
    maxHeight: "88%",
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.gold3 ?? "#cc8800",
  },
  loginContainer: { alignItems: "center", paddingVertical: 16 },
  crownIcon: { fontSize: 36, marginBottom: 8 },
  title: {
    fontSize: 22,
    color: COLORS.gold2 ?? "#d4a830",
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 14,
    textAlign: "center",
  },
  codeInput: {
    backgroundColor: COLORS.bg ?? "#0f0f1a",
    borderWidth: 1,
    borderColor: COLORS.gold3 ?? "#cc8800",
    borderRadius: RADIUS.md ?? 10,
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    width: "80%",
    textAlign: "center",
    marginBottom: 8,
  },
  codeInputError: { borderColor: "#cc3333" },
  errorText: { color: "#cc3333", fontSize: 13, marginBottom: 8 },
  loginBtn: {
    backgroundColor: COLORS.gold3 ?? "#cc8800",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: RADIUS.md ?? 10,
    marginTop: 8,
  },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  closeBtn: { marginLeft: "auto", padding: 4 },
  closeBtnText: { color: "#aaa", fontSize: 18 },
  scroll: { marginTop: 10 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gold3 ?? "#cc8800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  cheatBtn: {
    borderRadius: RADIUS.md ?? 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 6,
  },
  cheatBtnLabel: { color: "#fff", fontWeight: "700", fontSize: 14 },
  cheatBtnDesc: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  statLabel: { color: "#aaa", fontSize: 13 },
  statValue: { color: COLORS.gold2 ?? "#d4a830", fontSize: 13, fontWeight: "600" },
});


const ADMIN_CODE = "hello";

const ALL_SKILL_NODE_IDS = [
  "commerce_1", "commerce_2a", "commerce_2b", "commerce_3a", "commerce_3b", "commerce_4",
  "military_1", "military_2a", "military_2b", "military_3a", "military_3b", "military_4",
  "faith_1", "faith_2a", "faith_2b", "faith_3a", "faith_3b", "faith_4",
  "lineage_1", "lineage_2a", "lineage_2b", "lineage_3a", "lineage_3b", "lineage_4",
  "cross_1", "cross_2", "pinnacle",
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AdminPanel({ visible, onClose }: Props) {
  const [authenticated, setAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);
  const { state, pushToast } = useGame();

  // We need direct state mutation via setState — access internal setter via context trick
  // Instead we'll use the exposed actions + a direct state patch helper via setState wrapper
  const gameCtx = useGame() as any;

  const setState = (updater: (prev: any) => any) => {
    // Access internal setState via the context's raw state + recalc
    // We call internal mutators to patch state safely
    if (typeof gameCtx._setState === "function") {
      gameCtx._setState(updater);
    }
  };

  const handleLogin = () => {
    if (codeInput.trim().toLowerCase() === ADMIN_CODE) {
      setAuthenticated(true);
      setCodeError(false);
      setCodeInput("");
    } else {
      setCodeError(true);
      setCodeInput("");
    }
  };

  const handleClose = () => {
    setAuthenticated(false);
    setCodeInput("");
    setCodeError(false);
    onClose();
  };

  // ─── Cheat Actions ────────────────────────────────────────────────────────

  const cheatAddGold = (amount: number) => {
    gameCtx._patchState((prev: any) => ({
      ...prev,
      gold: Math.min(prev.gold + amount, 1e300),
      totalGoldEarned: Math.min(prev.totalGoldEarned + amount, 1e300),
    }));
    pushToast("Admin Cheat", `+${amount.toExponential(2)} gold added 💰`, "success");
  };

  const cheatMaxBuildings = () => {
    gameCtx._patchState((prev: any) => {
      const buildings: Record<string, { count: number }> = { ...prev.buildings };
      for (const b of BUILDINGS) buildings[b.id] = { count: 500 };
      return { ...prev, buildings };
    });
    pushToast("Admin Cheat", "All buildings maxed to 500 🏰", "success");
  };

  const cheatUnlockUpgrades = () => {
    gameCtx._patchState((prev: any) => {
      const allIds = Object.keys(UPGRADE_BY_ID);
      const existing = new Set(prev.purchasedUpgrades);
      const merged = [...prev.purchasedUpgrades, ...allIds.filter((id) => !existing.has(id))];
      return { ...prev, purchasedUpgrades: merged };
    });
    pushToast("Admin Cheat", "All upgrades unlocked ⚔️", "success");
  };

  const cheatUnlockSkills = () => {
    gameCtx._patchState((prev: any) => {
      const existing = new Set(prev.unlockedSkillNodes);
      const merged = [...prev.unlockedSkillNodes, ...ALL_SKILL_NODE_IDS.filter((id) => !existing.has(id))];
      return { ...prev, unlockedSkillNodes: merged };
    });
    pushToast("Admin Cheat", "All skill nodes unlocked 🌟", "success");
  };

  const cheatAddSeals = (amount: number) => {
    gameCtx._patchState((prev: any) => ({
      ...prev,
      sealsAvailable: prev.sealsAvailable + amount,
      sealsTotal: prev.sealsTotal + amount,
    }));
    pushToast("Admin Cheat", `+${amount} Royal Seals added 🔱`, "success");
  };

  const cheatUnlockLegacy = () => {
    gameCtx._patchState((prev: any) => {
      const allLegacyIds = LEGACY_UPGRADES.map((u: any) => u.id);
      const existing = new Set(prev.legacyUpgrades ?? []);
      const merged = [...(prev.legacyUpgrades ?? []), ...allLegacyIds.filter((id: string) => !existing.has(id))];
      return { ...prev, legacyUpgrades: merged };
    });
    pushToast("Admin Cheat", "All legacy upgrades unlocked 📜", "success");
  };

  const cheatMaxClicks = () => {
    gameCtx._patchState((prev: any) => ({
      ...prev,
      totalClicks: prev.totalClicks + 1_000_000,
      lifetimeClicks: (prev.lifetimeClicks ?? 0) + 1_000_000,
    }));
    pushToast("Admin Cheat", "+1M clicks added 👆", "success");
  };

  const cheatUnlockEverything = () => {
    cheatAddGold(1e50);
    setTimeout(() => {
      cheatMaxBuildings();
      setTimeout(() => {
        cheatUnlockUpgrades();
        setTimeout(() => {
          cheatUnlockSkills();
          setTimeout(() => {
            cheatAddSeals(9999);
            cheatUnlockLegacy();
            cheatMaxClicks();
            pushToast("👑 ADMIN GOD MODE", "Everything unlocked!", "bonus");
          }, 100);
        }, 100);
      }, 100);
    }, 100);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {!authenticated ? (
            <View style={styles.loginContainer}>
              <Text style={styles.crownIcon}>👑</Text>
              <Text style={styles.title}>Admin Panel</Text>
              <Text style={styles.subtitle}>Enter the secret code to continue</Text>
              <TextInput
                style={[styles.codeInput, codeError && styles.codeInputError]}
                value={codeInput}
                onChangeText={(t) => { setCodeInput(t); setCodeError(false); }}
                placeholder="Enter code..."
                placeholderTextColor={COLORS.textMuted ?? "#888"}
                secureTextEntry
                autoCapitalize="none"
                onSubmitEditing={handleLogin}
              />
              {codeError && <Text style={styles.errorText}>❌ Wrong code. Try again.</Text>}
              <Pressable style={styles.loginBtn} onPress={handleLogin}>
                <Text style={styles.loginBtnText}>Unlock Admin</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.crownIcon}>👑</Text>
                <Text style={styles.title}>Admin Panel</Text>
                <Pressable onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </Pressable>
              </View>
              <Text style={styles.subtitle}>Cheats &amp; Debug Tools</Text>

              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* GOD MODE */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚡ God Mode</Text>
                  <CheatButton
                    label="UNLOCK EVERYTHING"
                    desc="Max gold, buildings, upgrades, skills, seals"
                    color="#cc8800"
                    onPress={cheatUnlockEverything}
                  />
                </View>

                {/* GOLD */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💰 Gold</Text>
                  <CheatButton label="+1 Million Gold" desc="Add 1,000,000 gold" onPress={() => cheatAddGold(1_000_000)} />
                  <CheatButton label="+1 Billion Gold" desc="Add 1,000,000,000 gold" onPress={() => cheatAddGold(1_000_000_000)} />
                  <CheatButton label="+1 Trillion Gold" desc="Add 1e12 gold" onPress={() => cheatAddGold(1e12)} />
                  <CheatButton label="+Insane Gold" desc="Add 1e50 gold" color="#d4a830" onPress={() => cheatAddGold(1e50)} />
                </View>

                {/* BUILDINGS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🏰 Buildings</Text>
                  <CheatButton label="Max All Buildings" desc="Set all buildings to 500" onPress={cheatMaxBuildings} />
                </View>

                {/* UPGRADES */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚔️ Upgrades</Text>
                  <CheatButton label="Unlock All Upgrades" desc="Purchase every upgrade instantly" onPress={cheatUnlockUpgrades} />
                </View>

                {/* SKILL TREE */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🌟 Skill Tree</Text>
                  <CheatButton label="Unlock All Skill Nodes" desc="Unlock every node across all branches" onPress={cheatUnlockSkills} />
                  <CheatButton label="+100 Royal Seals" desc="Add 100 seals to spend" onPress={() => cheatAddSeals(100)} />
                  <CheatButton label="+9999 Royal Seals" desc="Add 9999 seals" color="#d4a830" onPress={() => cheatAddSeals(9999)} />
                </View>

                {/* LEGACY */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📜 Legacy</Text>
                  <CheatButton label="Unlock All Legacy Upgrades" desc="Unlock every legacy upgrade" onPress={cheatUnlockLegacy} />
                </View>

                {/* CLICKS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>👆 Clicks</Text>
                  <CheatButton label="+1 Million Clicks" desc="Add 1M to click counters" onPress={cheatMaxClicks} />
                </View>

                {/* STATUS */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📊 Current State</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Gold</Text>
                    <Text style={styles.statValue}>{state.gold.toExponential(2)}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Seals Available</Text>
                    <Text style={styles.statValue}>{state.sealsAvailable}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Prestige Count</Text>
                    <Text style={styles.statValue}>{state.prestigeCount}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Upgrades Owned</Text>
                    <Text style={styles.statValue}>{state.purchasedUpgrades.length}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Skills Unlocked</Text>
                    <Text style={styles.statValue}>{state.unlockedSkillNodes.length} / {ALL_SKILL_NODE_IDS.length}</Text>
                  </View>
                </View>

                <View style={{ height: 24 }} />
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CheatButton({
  label,
  desc,
  onPress,
  color = "#4a7a4a",
}: {
  label: string;
  desc: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.cheatBtn, { backgroundColor: color, opacity: pressed ? 0.75 : 1 }]}
      onPress={onPress}
    >
      <Text style={styles.cheatBtnLabel}>{label}</Text>
      <Text style={styles.cheatBtnDesc}>{desc}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: COLORS.surface ?? "#1a1a2e",
    borderRadius: RADIUS.lg ?? 16,
    width: "88%",
    maxHeight: "88%",
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.gold3 ?? "#cc8800",
  },
  loginContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  crownIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.heading ?? undefined,
    color: COLORS.gold2 ?? "#d4a830",
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted ?? "#aaa",
    marginBottom: 16,
    textAlign: "center",
  },
  codeInput: {
    backgroundColor: COLORS.bg ?? "#0f0f1a",
    borderWidth: 1,
    borderColor: COLORS.gold3 ?? "#cc8800",
    borderRadius: RADIUS.md ?? 10,
    color: COLORS.text ?? "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    width: "80%",
    textAlign: "center",
    marginBottom: 8,
  },
  codeInputError: {
    borderColor: "#cc3333",
  },
  errorText: {
    color: "#cc3333",
    fontSize: 13,
    marginBottom: 8,
  },
  loginBtn: {
    backgroundColor: COLORS.gold3 ?? "#cc8800",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: RADIUS.md ?? 10,
    marginTop: 8,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  closeBtn: {
    marginLeft: "auto",
    padding: 4,
  },
  closeBtnText: {
    color: COLORS.textMuted ?? "#aaa",
    fontSize: 18,
  },
  scroll: {
    marginTop: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.gold3 ?? "#cc8800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  cheatBtn: {
    borderRadius: RADIUS.md ?? 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 6,
  },
  cheatBtnLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  cheatBtnDesc: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginTop: 2,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  statLabel: {
    color: COLORS.textMuted ?? "#aaa",
    fontSize: 13,
  },
  statValue: {
    color: COLORS.gold2 ?? "#d4a830",
    fontSize: 13,
    fontWeight: "600",
  },
});
