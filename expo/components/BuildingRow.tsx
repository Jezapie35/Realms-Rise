import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Lock } from "lucide-react-native";
import { COLORS, FONTS, RADIUS } from "@/constants/colors";

import { Building } from "@/data/buildings";
import { BuyMode, ActiveBonus } from "@/data/gameState";
import {
  calculateBuildingCost,
  calculateBuildingGPS,
  calculateBuyBulkCost,
  calculateBuyMaxCount,
  getNextUpgradeMilestone,
} from "@/data/gameEngine";
import { formatGold } from "@/utils/formatNumber";
import { BUILDING_ICON_MAP } from "./icons";

interface Props {
  building: Building;
  count: number;
  gold: number;
  purchasedUpgrades: string[];
  unlockedSkillNodes: string[];
  legacyUpgrades: string[];
  activeBonus: ActiveBonus | null;
  runStartTime: number;
  altRow: boolean;
  buyMode: BuyMode;
  revealed: boolean;
  onBuy: (id: string, qty: number | "max") => void;
}

function BuildingRowBase({
  building,
  count,
  gold,
  purchasedUpgrades,
  unlockedSkillNodes,
  legacyUpgrades,
  activeBonus,
  runStartTime,
  altRow,
  buyMode,
  revealed,
  onBuy,
}: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;

  const quantity = useMemo<number>(() => {
    if (buyMode === "1") return 1;
    if (buyMode === "10") return 10;
    if (buyMode === "next") {
      const hasSilkRoads = unlockedSkillNodes.includes("commerce_3b");
      return Math.max(1, getNextUpgradeMilestone(count, hasSilkRoads) - count);
    }
    return Math.max(1, calculateBuyMaxCount(building.id, gold, count, unlockedSkillNodes, purchasedUpgrades, legacyUpgrades));
  }, [buyMode, building.id, gold, count, unlockedSkillNodes, purchasedUpgrades, legacyUpgrades]);

  const totalCost = useMemo<number>(() => {
    if (buyMode === "1") return calculateBuildingCost(building.id, count, unlockedSkillNodes, purchasedUpgrades, legacyUpgrades);
    return calculateBuyBulkCost(building.id, count, quantity, unlockedSkillNodes, purchasedUpgrades, legacyUpgrades);
  }, [buyMode, building.id, count, quantity, unlockedSkillNodes, purchasedUpgrades, legacyUpgrades]);

  const affordable = gold >= totalCost && quantity > 0;

  const eachGps = useMemo<number>(
    () =>
      count > 0
        ? calculateBuildingGPS(
            building.id,
            1,
            purchasedUpgrades,
            unlockedSkillNodes,
            activeBonus,
            runStartTime,
            Date.now(),
          )
        : 0,
    [building.id, purchasedUpgrades, unlockedSkillNodes, activeBonus, runStartTime, count],
  );
  const totalGps = eachGps * count;

  useEffect(() => {
    if (!affordable || !revealed) return;
    const loop = Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.linear }),
    );
    loop.start();
    return () => {
      loop.stop();
      shimmer.setValue(0);
    };
  }, [affordable, revealed, shimmer]);

  if (!revealed) {
    return (
      <View style={[styles.row, altRow && styles.rowAlt, styles.lockedRow]}>
        <View style={styles.imageZone}>
          <Lock color={COLORS.textDim} size={28} />
        </View>
        <View style={styles.centerZone}>
          <Text style={styles.nameDim}>???</Text>
          <Text style={styles.descDim}>Keep earning gold to reveal...</Text>
        </View>
        <View style={styles.buyZoneLocked}>
          <Lock color={COLORS.textDim} size={20} />
        </View>
      </View>
    );
  }

  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-30, 110] });

  return (
    <View style={[styles.row, altRow && styles.rowAlt]}>
      <View style={styles.imageZone}>
        {(() => { const Icon = BUILDING_ICON_MAP[building.id]; return Icon ? <Icon size={62} /> : null; })()}
        {count > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
        )}
      </View>

      <View style={styles.centerZone}>
        <Text style={styles.name} numberOfLines={1}>
          {building.name}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {building.description}
        </Text>
        {count > 0 ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaDim} numberOfLines={1}>
              each: {formatGold(eachGps)}/s · total: {formatGold(totalGps)}/s
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={() => affordable && onBuy(building.id, buyMode === "max" ? "max" : quantity)}
        disabled={!affordable}
        style={[styles.buyZone, affordable ? styles.buyZoneActive : styles.buyZoneDim]}
        testID={`buy-${building.id}`}
      >
        {buyMode !== "1" && (
          <Text style={[styles.buyQty, !affordable && styles.buyDim]}>
            {buyMode === "next" ? `+${quantity}` : `×${quantity}`}
          </Text>
        )}
        <Text style={[styles.buyCost, !affordable && styles.buyDim]}>{formatGold(totalCost)}</Text>
        <Text style={[styles.buyLabel, !affordable && styles.buyDim]}>gold</Text>
        {affordable && (
          <Animated.View
            pointerEvents="none"
            style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
          />
        )}
      </Pressable>
    </View>
  );
}

export default memo(BuildingRowBase);

const styles = StyleSheet.create({
  row: {
    minHeight: 110,
    flexDirection: "row",
    backgroundColor: COLORS.bg2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
  },
  rowAlt: {
    backgroundColor: COLORS.bg3,
  },
  lockedRow: { opacity: 0.6 },
  imageZone: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: COLORS.bg5,
    position: "relative",
  },
  countBadge: {
    position: "absolute",
    bottom: 10,
    right: 6,
    backgroundColor: COLORS.bg1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.gold4,
  },
  countBadgeText: {
    color: COLORS.gold2,
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontWeight: "800",
  },
  centerZone: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 8,
    justifyContent: "center",
    gap: 4,
  },
  name: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontSize: 15,
    fontWeight: "700",
  },
  nameDim: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontSize: 15,
    fontWeight: "700",
  },
  desc: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontStyle: "italic",
    fontSize: 11,
  },
  descDim: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontStyle: "italic",
    fontSize: 11,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 1,
  },
  metaDim: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 11,
  },
  buyZone: {
    width: 92,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.bg5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buyZoneActive: {
    backgroundColor: COLORS.gold5,
  },
  buyZoneDim: {
    backgroundColor: COLORS.bg3,
  },
  buyQty: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 10,
    marginBottom: 2,
    fontWeight: "700",
  },
  buyCost: {
    color: COLORS.gold2,
    fontFamily: FONTS.serif,
    fontSize: 15,
    fontWeight: "800",
  },
  buyLabel: {
    color: COLORS.gold4,
    fontFamily: FONTS.system,
    fontSize: 10,
    marginTop: 1,
  },
  buyDim: {
    color: COLORS.textDim,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  buyZoneLocked: {
    width: 92,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: COLORS.bg5,
    backgroundColor: COLORS.bg2,
  },
});
