import React, { useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS, SHADOWS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { availableUpgrades } from "@/data/gameEngine";
import { RARITY_COLORS, RARITY_LABELS, UPGRADE_BY_ID, upgradeTierImage, Upgrade } from "@/data/upgrades";
import { formatGold } from "@/utils/formatNumber";
import { BUILDING_ICON_MAP } from "./icons";

export default function UpgradeStrip() {
  const { state, buyUpgrade, buyAllUpgrades } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchasedOpen, setPurchasedOpen] = useState<boolean>(false);
  const [purchasedDetailId, setPurchasedDetailId] = useState<string | null>(null);

  const list = useMemo<Upgrade[]>(() => {
    const arr = availableUpgrades(state);
    return [...arr].sort((a, b) => a.cost - b.cost);
  }, [state]);
  const selected = selectedId ? UPGRADE_BY_ID[selectedId] : null;

  const canBuyAll = useMemo(
    () => list.some((u) => state.gold >= u.cost),
    [list, state.gold],
  );

  const purchasedDetail = purchasedDetailId ? UPGRADE_BY_ID[purchasedDetailId] : null;

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.leftBadge} onPress={() => setPurchasedOpen(true)} testID="upgrade-count">
        <View style={styles.countCircle}>
          <Text style={styles.countText}>{state.purchasedUpgrades.length}</Text>
        </View>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {list.length === 0 ? (
          <Text style={styles.empty}>No upgrades available yet. Keep building.</Text>
        ) : (
          list.map((u) => {
            const affordable = state.gold >= u.cost;
            const rColor = RARITY_COLORS[u.rarity];
            return (
              <Pressable
                key={u.id}
                onPress={() => setSelectedId(u.id === selectedId ? null : u.id)}
                style={[
                  styles.tile,
                  {
                    borderColor: affordable ? rColor : COLORS.bg5,
                    opacity: affordable ? 1 : 0.35,
                    backgroundColor: affordable ? COLORS.bg4 : COLORS.bg1,
                  },
                  affordable && { shadowColor: rColor, shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
                ]}
                testID={`upgrade-${u.id}`}
              >
                {(() => {
                  const Icon = BUILDING_ICON_MAP[u.buildingId];
                  if (Icon) return <Icon size={36} />;
                  return (
                    <Image
                      source={require("@/assets/images/upgrade_generic.png")}
                      style={{ width: 36, height: 36 }}
                      resizeMode="contain"
                    />
                  );
                })()}
                <View style={[styles.rarityDot, { backgroundColor: rColor }]} />
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <Pressable
        onPress={canBuyAll ? buyAllUpgrades : undefined}
        disabled={!canBuyAll}
        style={[styles.buyAllBtn, !canBuyAll && styles.buyAllBtnDisabled]}
        testID="buy-all-upgrades"
      >
        <Text style={[styles.buyAllText, !canBuyAll && styles.buyAllTextDim]}>Buy{"\n"}All</Text>
      </Pressable>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedId(null)}
      >
        {selected && (
          <UpgradeTooltip
            upgrade={selected}
            affordable={state.gold >= selected.cost}
            onBuy={() => {
              buyUpgrade(selected.id);
              setSelectedId(null);
            }}
            onDismiss={() => setSelectedId(null)}
          />
        )}
      </Modal>

      <Modal visible={purchasedOpen} transparent animationType="fade" onRequestClose={() => setPurchasedOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPurchasedOpen(false)}>
          <View style={styles.purchasedCard}>
            <Text style={styles.purchasedTitle}>
              Purchased Upgrades{state.purchasedUpgrades.length > 0 ? ` (${state.purchasedUpgrades.length})` : ""}
            </Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {state.purchasedUpgrades.length === 0 ? (
                <Text style={styles.purchasedEmpty}>None yet. Buy upgrades from the strip.</Text>
              ) : (
                <View style={styles.purchasedGrid}>
                  {state.purchasedUpgrades.map((id) => {
                    const u = UPGRADE_BY_ID[id];
                    if (!u) return null;
                    const rColor = RARITY_COLORS[u.rarity];
                    const Icon = BUILDING_ICON_MAP[u.buildingId];
                    return (
                      <Pressable
                        key={id}
                        style={[styles.purchasedGridTile, { borderColor: rColor }]}
                        onPress={() => {
                          setPurchasedDetailId(id);
                        }}
                      >
                        {Icon ? (
                          <Icon size={28} />
                        ) : (
                          <Image
                            source={require("@/assets/images/upgrade_generic.png")}
                            style={{ width: 28, height: 28 }}
                            resizeMode="contain"
                          />
                        )}
                        <View style={[styles.purchasedGridDot, { backgroundColor: rColor }]} />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Purchased upgrade detail popup */}
      <Modal
        visible={!!purchasedDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setPurchasedDetailId(null)}
      >
        {purchasedDetail && (
          <Pressable style={styles.tooltipBackdrop} onPress={() => setPurchasedDetailId(null)}>
            <View style={[styles.tooltip, { borderColor: RARITY_COLORS[purchasedDetail.rarity] }]}>
              <View style={[styles.rarityTag, { borderColor: RARITY_COLORS[purchasedDetail.rarity], alignSelf: "flex-start", marginBottom: 6 }]}>
                <Text style={[styles.rarityTagText, { color: RARITY_COLORS[purchasedDetail.rarity] }]}>
                  {RARITY_LABELS[purchasedDetail.rarity]}
                </Text>
              </View>
              <Text style={styles.tooltipName}>{purchasedDetail.name}</Text>
              <Text style={styles.tooltipDesc}>{purchasedDetail.description}</Text>
              <View style={[styles.tooltipCost, { marginTop: 10 }]}>
                <Text style={[styles.tooltipBtnText, { color: COLORS.textSub, fontSize: 12 }]}>Tap anywhere to close</Text>
              </View>
            </View>
          </Pressable>
        )}
      </Modal>
    </View>
  );
}

interface TooltipProps {
  upgrade: Upgrade;
  affordable: boolean;
  onBuy: () => void;
  onDismiss: () => void;
}

function UpgradeTooltip({ upgrade, affordable, onBuy, onDismiss }: TooltipProps) {
  const rColor = RARITY_COLORS[upgrade.rarity];
  return (
    <Pressable style={styles.tooltipBackdrop} onPress={onDismiss}>
      <View style={[styles.tooltip, { borderColor: rColor }]}>
        <View style={[styles.rarityTag, { borderColor: rColor, alignSelf: "flex-start", marginBottom: 6 }]}>
          <Text style={[styles.rarityTagText, { color: rColor }]}>{RARITY_LABELS[upgrade.rarity]}</Text>
        </View>
        <Text style={styles.tooltipName}>{upgrade.name}</Text>
        <Text style={styles.tooltipDesc}>{upgrade.description}</Text>
        <View style={styles.tooltipCost}>
          <Text style={styles.tooltipCostLabel}>Cost</Text>
          <Text style={styles.tooltipCostValue}>{formatGold(upgrade.cost)} gold</Text>
        </View>
        <Pressable
          onPress={onBuy}
          disabled={!affordable}
          style={[styles.tooltipBtn, affordable ? styles.tooltipBtnActive : styles.tooltipBtnDisabled]}
        >
          <Text style={[styles.tooltipBtnText, !affordable && styles.tooltipBtnTextDim]}>
            {affordable ? "Purchase" : "Not enough gold"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 68,
    flexDirection: "row",
    backgroundColor: COLORS.bg1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.bg5,
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 6,
  },
  leftBadge: {
    width: 48,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  countCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.bg4,
    borderWidth: 1,
    borderColor: COLORS.gold4,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: COLORS.gold3,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 14,
  },
  scroll: { paddingRight: 12, alignItems: "center", gap: 8 },
  empty: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    fontSize: 12,
    paddingHorizontal: 8,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  rarityDot: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tooltipBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  tooltip: {
    width: 260,
    backgroundColor: COLORS.bg4,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 14,
    gap: 6,
    ...SHADOWS.cardLift,
  },
  tooltipName: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: "700",
  },
  tooltipDesc: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontStyle: "italic",
    fontSize: 12,
  },
  tooltipCost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.bg5,
  },
  tooltipCostLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  tooltipCostValue: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 14,
  },
  tooltipBtn: {
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  tooltipBtnActive: {
    backgroundColor: COLORS.gold2,
  },
  tooltipBtnDisabled: {
    backgroundColor: COLORS.bg5,
  },
  tooltipBtnText: {
    color: COLORS.bg1,
    fontFamily: FONTS.system,
    fontWeight: "800",
    fontSize: 14,
  },
  tooltipBtnTextDim: {
    color: COLORS.textDim,
  },
  rarityTag: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  rarityTagText: {
    fontFamily: FONTS.system,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  buyAllBtn: {
    width: 48,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gold4,
  },
  buyAllBtnDisabled: {
    backgroundColor: COLORS.bg2,
    borderColor: COLORS.bg5,
  },
  buyAllText: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 14,
  },
  buyAllTextDim: {
    color: COLORS.textDim,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  purchasedCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gold4,
  },
  purchasedTitle: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  purchasedEmpty: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  purchasedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  purchasedGridTile: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    backgroundColor: COLORS.bg4,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  purchasedGridDot: {
    position: "absolute",
    right: 3,
    bottom: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
