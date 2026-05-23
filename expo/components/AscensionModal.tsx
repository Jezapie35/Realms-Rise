import React, { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AscensionIcon from "@/components/icons/ui/AscensionIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SHADOWS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { formatNumber } from "@/utils/formatNumber";
import {
  CROWN_UPGRADES,
  CROWN_BY_ID,
  type CrownUpgrade,
  getAscensionRequirements,
  getAscensionLabel,
  calculateCrownsEarned,
} from "@/data/ascension";

type Tab = "ascend" | "crowns";

const TIER_LABELS: Record<number, string> = { 1: "TIER I", 2: "TIER II", 3: "TIER III", 4: "TIER IV" };
const TIER_COLORS: Record<number, string> = { 1: "#b09a70", 2: "#8a9ab0", 3: "#cc9a20", 4: "#c0392b" };

interface Props {
  visible: boolean;
  onAscend: () => void;
  onClose: () => void;
}

export default function AscensionModal({ visible, onAscend, onClose }: Props) {
  const { state, buyCrownUpgrade } = useGame();
  const [tab, setTab] = useState<Tab>("ascend");
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top + 12, Platform.OS === "web" ? 24 : 32);
  const bottomPad = Math.max(insets.bottom, 16);

  const req = getAscensionRequirements(state);
  const label = getAscensionLabel(state.ascension.count);
  const crownsToEarn = calculateCrownsEarned(state);
  const fragmentBonus = Math.floor(state.ascension.crownFragments / 5);
  const goldProgress = Math.min(1, state.ascension.lifetimeGoldThisAscension / req.goldRequired);

  const crowns = state.ascension.crowns;
  const ascensionCount = state.ascension.count;
  const activeUpgrades = state.ascension.crownUpgrades ?? [];
  const pendingUpgrades = state.ascension.pendingCrownUpgrades ?? [];
  const allOwned = [...activeUpgrades, ...pendingUpgrades];

  function isOwned(u: CrownUpgrade): boolean { return allOwned.includes(u.id); }
  function isPending(u: CrownUpgrade): boolean { return pendingUpgrades.includes(u.id); }
  function canAfford(u: CrownUpgrade): boolean { return crowns >= u.cost; }
  function prereqsMet(u: CrownUpgrade): boolean { return u.requires.every((r) => allOwned.includes(r)); }
  function ascensionMet(u: CrownUpgrade): boolean { return !u.requiresAscension || ascensionCount >= u.requiresAscension; }
  function canBuy(u: CrownUpgrade): boolean {
    return !isOwned(u) && canAfford(u) && prereqsMet(u) && ascensionMet(u);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Tab bar */}
        <View style={[styles.tabBar, { paddingTop: topPad }]}>
          <Pressable
            onPress={() => setTab("ascend")}
            style={[styles.tab, tab === "ascend" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "ascend" && styles.tabTextActive]}>ASCENSION</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("crowns")}
            style={[styles.tab, tab === "crowns" && styles.tabActive]}
          >
            <View style={styles.tabRow}>
              <Text style={[styles.tabText, tab === "crowns" && styles.tabTextActive]}>
                CROWN SHOP
              </Text>
              <View style={styles.tabBadge}>
                <AscensionIcon size={14} />
                <Text style={[styles.tabBadgeText, tab === "crowns" && styles.tabTextActive]}>
                  {crowns}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {tab === "ascend" ? (
            <>
              <Text style={styles.header}>ASCENSION</Text>
              <Text style={styles.subheader}>[{label}]</Text>

              {/* Requirements */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>REQUIREMENTS</Text>

                <View style={styles.reqRow}>
                  <Text style={req.goldMet ? styles.tick : styles.cross}>
                    {req.goldMet ? "☑" : "☒"}
                  </Text>
                  <View style={styles.reqText}>
                    <Text style={styles.reqLabel}>Lifetime Gold This Ascension</Text>
                    <Text style={styles.reqValue}>
                      {formatNumber(state.ascension.lifetimeGoldThisAscension)} / {formatNumber(req.goldRequired)}
                    </Text>
                    <View style={styles.bar}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${goldProgress * 100}%`, backgroundColor: req.goldMet ? COLORS.green : COLORS.gold3 },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.reqRow}>
                  <Text style={req.prestigesMet ? styles.tick : styles.cross}>
                    {req.prestigesMet ? "☑" : "☒"}
                  </Text>
                  <View style={styles.reqText}>
                    <Text style={styles.reqLabel}>Prestiges Completed</Text>
                    <Text style={styles.reqValue}>{state.prestigeCount} / 25</Text>
                  </View>
                </View>

                <View style={styles.reqRow}>
                  <Text style={req.eternalRealmMet ? styles.tick : styles.cross}>
                    {req.eternalRealmMet ? "☑" : "☒"}
                  </Text>
                  <View style={styles.reqText}>
                    <Text style={styles.reqLabel}>Eternal Realm Purchased</Text>
                    <Text style={styles.reqValue}>{req.eternalRealmMet ? "Yes" : "No"}</Text>
                  </View>
                </View>
              </View>

              {/* Crowns preview */}
              <View style={styles.crownBox}>
                <View style={styles.crownRow}>
                  <Text style={styles.crownLabel}>CROWNS TO EARN</Text>
                  <Text style={styles.crownCount}>{crownsToEarn}</Text>
                </View>
                {fragmentBonus > 0 && (
                  <Text style={styles.fragmentLine}>+ {fragmentBonus} fragment bonus</Text>
                )}
                <Text style={styles.crownTotal}>
                  New total: {state.ascension.crowns + crownsToEarn} Crowns
                </Text>
              </View>

              {/* Warning */}
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  This will reset your seals, legacy upgrades, skill tree, and prestige count.
                  Crown purchases are permanent.
                </Text>
              </View>

              <Pressable
                onPress={onAscend}
                style={[styles.ascendBtn, !req.canAscend && styles.ascendBtnDisabled]}
                disabled={!req.canAscend}
              >
                <Text style={[styles.ascendBtnText, !req.canAscend && styles.ascendBtnTextDisabled]}>
                  ASCEND
                </Text>
              </Pressable>

              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Return to Realm</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.shopTitle}>Crown Shop</Text>
              <Text style={styles.shopSubtitle}>Permanent upgrades across all ascensions</Text>

              {pendingUpgrades.length > 0 && (
                <View style={styles.pendingBanner}>
                  <Text style={styles.pendingBannerText}>
                    {pendingUpgrades.length} purchase{pendingUpgrades.length > 1 ? "s" : ""} take effect next kingdom
                  </Text>
                </View>
              )}

              {[1, 2, 3, 4].map((tier) => {
                const tierUpgrades = CROWN_UPGRADES.filter((u) => u.tier === tier);
                const tierColor = TIER_COLORS[tier];
                return (
                  <View key={tier} style={styles.tierSection}>
                    <Text style={[styles.tierLabel, { color: tierColor }]}>{TIER_LABELS[tier]}</Text>
                    {tier === 4 && (
                      <Text style={styles.tierNote}>Requires 2+ Ascensions</Text>
                    )}
                    {tierUpgrades.map((u) => {
                      const owned = isOwned(u);
                      const pending = isPending(u);
                      const buyable = canBuy(u);
                      const prereqs = prereqsMet(u);
                      const asc = ascensionMet(u);
                      const locked = !prereqs || !asc;

                      return (
                        <View
                          key={u.id}
                          style={[
                            styles.upgradeCard,
                            owned && styles.ownedCard,
                            buyable && styles.buyableCard,
                            { borderLeftColor: owned ? tierColor : locked ? COLORS.bg5 : tierColor + "60" },
                          ]}
                        >
                          <View style={styles.cardTop}>
                            <Text style={[styles.upgradeName, owned && { color: tierColor }]}>
                              {u.name}
                            </Text>
                            <View
                              style={[
                                styles.costChip,
                                owned && !pending && styles.ownedChip,
                                pending && styles.pendingChip,
                                !canAfford(u) && !owned && styles.cantAffordChip,
                              ]}
                            >
                              {owned ? (
                                <Text
                                  style={[
                                    styles.costText,
                                    !pending && styles.ownedText,
                                    pending && styles.pendingText,
                                  ]}
                                >
                                  {pending ? "NEXT RUN" : "OWNED"}
                                </Text>
                              ) : (
                                <View style={styles.costRow}>
                                  <Text style={[styles.costText, !canAfford(u) && styles.cantAffordText]}>
                                    {u.cost}
                                  </Text>
                                  <AscensionIcon size={14} />
                                </View>
                              )}
                            </View>
                          </View>

                          <Text style={[styles.upgradeDesc, locked && !owned && styles.lockedDesc]}>
                            {u.description}
                          </Text>

                          {!owned && u.requires.length > 0 && (
                            <Text style={styles.prereqText}>
                              Requires: {u.requires.map((r) => CROWN_BY_ID[r]?.name ?? r).join(", ")}
                            </Text>
                          )}

                          {!owned && u.requiresAscension && !asc && (
                            <Text style={styles.prereqText}>
                              Requires {u.requiresAscension}+ Ascensions
                            </Text>
                          )}

                          {buyable && (
                            <Pressable
                              onPress={() => buyCrownUpgrade(u.id)}
                              style={[styles.buyBtn, { borderColor: tierColor }]}
                            >
                              <Text style={[styles.buyBtnText, { color: tierColor }]}>Purchase</Text>
                            </Pressable>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })}

              <Pressable onPress={onClose} style={[styles.closeBtn, { marginTop: 20 }]}>
                <Text style={styles.closeBtnText}>Return to Realm</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.bg1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.bg2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold3,
  },
  tabText: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1.5,
  },
  tabTextActive: {
    color: COLORS.textGold,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  tabBadgeText: {
    color: COLORS.gold3,
    fontFamily: FONTS.system,
    fontSize: 11,
    fontWeight: "700",
  },
  costRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  scroll: {
    paddingHorizontal: 20,
    alignItems: "center",
    paddingTop: 16,
  },
  // Ascend tab
  header: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 4,
    textAlign: "center",
    marginTop: 8,
    ...SHADOWS.goldGlow,
  },
  subheader: {
    color: COLORS.textSub,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  section: {
    width: "100%",
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.lg,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.bg5,
  },
  sectionLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "700",
    marginBottom: 2,
  },
  reqRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  tick: { color: COLORS.greenLight, fontSize: 18, lineHeight: 22 },
  cross: { color: COLORS.red, fontSize: 18, lineHeight: 22 },
  reqText: { flex: 1, gap: 2 },
  reqLabel: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: "700",
  },
  reqValue: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 12,
  },
  bar: {
    height: 4,
    backgroundColor: COLORS.bg5,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  barFill: { height: "100%", borderRadius: 2 },
  crownBox: {
    marginTop: 14,
    width: "100%",
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.gold4,
    gap: 4,
  },
  crownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  crownLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  crownCount: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 28,
    fontWeight: "800",
  },
  fragmentLine: {
    color: COLORS.gold3,
    fontFamily: FONTS.system,
    fontSize: 12,
    textAlign: "right",
  },
  crownTotal: {
    color: COLORS.textSub,
    fontFamily: FONTS.serif,
    fontSize: 12,
    textAlign: "right",
    fontStyle: "italic",
  },
  warningBox: {
    marginTop: 14,
    width: "100%",
    backgroundColor: "#2a0000",
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  warningText: {
    color: "#e67b70",
    fontFamily: FONTS.system,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  ascendBtn: {
    marginTop: 20,
    width: "100%",
    backgroundColor: COLORS.gold4,
    borderRadius: RADIUS.lg,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.gold2,
    ...SHADOWS.goldGlow,
  },
  ascendBtnDisabled: {
    backgroundColor: COLORS.bg5,
    borderColor: COLORS.bg5,
    shadowOpacity: 0,
    elevation: 0,
  },
  ascendBtnText: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 3,
  },
  ascendBtnTextDisabled: { color: COLORS.textDim },
  closeBtn: {
    marginTop: 8,
    width: "100%",
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.lg,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.bg5,
  },
  closeBtnText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 14,
  },
  // Crown shop tab
  shopTitle: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 24,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    width: "100%",
    marginTop: 4,
  },
  shopSubtitle: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  pendingBanner: {
    width: "100%",
    backgroundColor: "#1a1430",
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.purple,
    alignItems: "center",
  },
  pendingBannerText: {
    color: COLORS.purpleLight,
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: "700",
  },
  tierSection: {
    width: "100%",
    gap: 8,
    marginBottom: 12,
  },
  tierLabel: {
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 2,
  },
  tierNote: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 10,
    fontStyle: "italic",
    marginTop: -4,
    marginBottom: 2,
  },
  upgradeCard: {
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.md,
    padding: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.bg5,
    gap: 4,
  },
  ownedCard: { opacity: 0.75 },
  buyableCard: { borderColor: COLORS.bg5 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  upgradeName: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 14,
  },
  costChip: {
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.gold4,
  },
  ownedChip: { backgroundColor: "#0a2a0a", borderColor: COLORS.green },
  pendingChip: { backgroundColor: "#1a1430", borderColor: COLORS.purple },
  cantAffordChip: { borderColor: COLORS.bg5 },
  costText: {
    color: COLORS.textGold,
    fontFamily: FONTS.system,
    fontSize: 11,
    fontWeight: "700",
  },
  ownedText: { color: COLORS.greenLight },
  pendingText: { color: COLORS.purpleLight },
  cantAffordText: { color: COLORS.textDim },
  upgradeDesc: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 12,
    lineHeight: 17,
  },
  lockedDesc: { color: COLORS.textDim },
  prereqText: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 10,
    fontStyle: "italic",
  },
  buyBtn: {
    marginTop: 6,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: COLORS.bg4,
  },
  buyBtnText: {
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
