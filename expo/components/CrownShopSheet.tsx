import React from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SHADOWS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { CROWN_UPGRADES, CROWN_BY_ID, type CrownUpgrade } from "@/data/ascension";

const TIER_LABELS: Record<number, string> = {
  1: "TIER I",
  2: "TIER II",
  3: "TIER III",
  4: "TIER IV",
};

const TIER_COLORS: Record<number, string> = {
  1: "#b09a70",
  2: "#8a9ab0",
  3: "#cc9a20",
  4: "#c0392b",
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CrownShopSheet({ visible, onClose }: Props) {
  const { state, buyCrownUpgrade } = useGame();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top + 12, Platform.OS === "web" ? 24 : 32);
  const bottomPad = Math.max(insets.bottom, 16);

  const owned = state.ascension.crownUpgrades;
  const crowns = state.ascension.crowns;
  const ascensionCount = state.ascension.count;

  function canAfford(u: CrownUpgrade): boolean {
    return crowns >= u.cost;
  }

  function prereqsMet(u: CrownUpgrade): boolean {
    return u.requires.every((r) => owned.includes(r));
  }

  function ascensionMet(u: CrownUpgrade): boolean {
    return !u.requiresAscension || ascensionCount >= u.requiresAscension;
  }

  function isOwned(u: CrownUpgrade): boolean {
    return owned.includes(u.id);
  }

  function canBuy(u: CrownUpgrade): boolean {
    return !isOwned(u) && canAfford(u) && prereqsMet(u) && ascensionMet(u);
  }

  const tiers = [1, 2, 3, 4];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingTop: topPad, paddingBottom: bottomPad + 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>CROWN SHOP</Text>
              <Text style={styles.subtitle}>Permanent upgrades across all ascensions</Text>
            </View>
            <View style={styles.balanceChip}>
              <Text style={styles.balanceLabel}>CROWNS</Text>
              <Text style={styles.balanceValue}>{crowns}</Text>
            </View>
          </View>

          <Pressable onPress={onClose} style={styles.closeRow}>
            <Text style={styles.closeText}>✕  Close</Text>
          </Pressable>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {tiers.map((tier) => {
              const tierUpgrades = CROWN_UPGRADES.filter((u) => u.tier === tier);
              const tierColor = TIER_COLORS[tier];
              return (
                <View key={tier} style={styles.tierSection}>
                  <Text style={[styles.tierLabel, { color: tierColor }]}>{TIER_LABELS[tier]}</Text>
                  {tier === 4 && (
                    <Text style={styles.tierNote}>Requires 2+ Ascensions</Text>
                  )}
                  {tierUpgrades.map((u) => {
                    const owned_ = isOwned(u);
                    const buyable = canBuy(u);
                    const prereqs = prereqsMet(u);
                    const asc = ascensionMet(u);
                    const locked = !prereqs || !asc;

                    return (
                      <View
                        key={u.id}
                        style={[
                          styles.upgradeCard,
                          owned_ && styles.ownedCard,
                          buyable && styles.buyableCard,
                          { borderLeftColor: owned_ ? tierColor : locked ? COLORS.bg5 : tierColor + "60" },
                        ]}
                      >
                        <View style={styles.cardTop}>
                          <Text style={[styles.upgradeName, owned_ && { color: tierColor }]}>
                            {u.name}
                          </Text>
                          <View style={[styles.costChip, owned_ && styles.ownedChip, !canAfford(u) && !owned_ && styles.cantAffordChip]}>
                            <Text style={[styles.costText, owned_ && styles.ownedText, !canAfford(u) && !owned_ && styles.cantAffordText]}>
                              {owned_ ? "OWNED" : `${u.cost} ♛`}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.upgradeDesc, locked && !owned_ && styles.lockedDesc]}>
                          {u.description}
                        </Text>

                        {!owned_ && u.requires.length > 0 && (
                          <Text style={styles.prereqText}>
                            Requires: {u.requires.map((r) => CROWN_BY_ID[r]?.name ?? r).join(", ")}
                          </Text>
                        )}

                        {!owned_ && u.requiresAscension && !asc && (
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.bg2,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: "92%",
    borderTopWidth: 1,
    borderColor: COLORS.gold4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  title: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 3,
  },
  subtitle: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 11,
    marginTop: 2,
  },
  balanceChip: {
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gold4,
    ...SHADOWS.goldGlow,
  },
  balanceLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  balanceValue: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 24,
    fontWeight: "800",
  },
  closeRow: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 8,
  },
  closeText: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  tierSection: {
    gap: 8,
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
  ownedCard: {
    opacity: 0.75,
  },
  buyableCard: {
    borderColor: COLORS.bg5,
  },
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
  ownedChip: {
    backgroundColor: "#0a2a0a",
    borderColor: COLORS.green,
  },
  cantAffordChip: {
    borderColor: COLORS.bg5,
  },
  costText: {
    color: COLORS.textGold,
    fontFamily: FONTS.system,
    fontSize: 11,
    fontWeight: "700",
  },
  ownedText: {
    color: COLORS.greenLight,
  },
  cantAffordText: {
    color: COLORS.textDim,
  },
  upgradeDesc: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 12,
    lineHeight: 17,
  },
  lockedDesc: {
    color: COLORS.textDim,
  },
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
