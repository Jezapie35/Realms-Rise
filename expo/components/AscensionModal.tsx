import React from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SHADOWS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { formatNumber } from "@/utils/formatNumber";
import {
  getAscensionRequirements,
  getAscensionLabel,
  calculateCrownsEarned,
} from "@/data/ascension";

interface Props {
  visible: boolean;
  onAscend: () => void;
  onViewShop: () => void;
  onClose: () => void;
}

export default function AscensionModal({ visible, onAscend, onViewShop, onClose }: Props) {
  const { state } = useGame();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top + 12, Platform.OS === "web" ? 24 : 32);
  const bottomPad = Math.max(insets.bottom, 16);

  const req = getAscensionRequirements(state);
  const label = getAscensionLabel(state.ascension.count);
  const crownsToEarn = calculateCrownsEarned(state);
  const fragmentBonus = Math.floor(state.ascension.crownFragments / 5);

  const goldProgress = Math.min(1, state.ascension.lifetimeGoldThisAscension / req.goldRequired);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: bottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>ASCENSION</Text>
          <Text style={styles.subheader}>[{label}]</Text>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>REQUIREMENTS</Text>

            {/* Gold requirement */}
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
                  <View style={[styles.barFill, { width: `${goldProgress * 100}%`, backgroundColor: req.goldMet ? COLORS.green : COLORS.gold3 }]} />
                </View>
              </View>
            </View>

            {/* Prestige requirement */}
            <View style={styles.reqRow}>
              <Text style={req.prestigesMet ? styles.tick : styles.cross}>
                {req.prestigesMet ? "☑" : "☒"}
              </Text>
              <View style={styles.reqText}>
                <Text style={styles.reqLabel}>Prestiges Completed</Text>
                <Text style={styles.reqValue}>{state.prestigeCount} / 25</Text>
              </View>
            </View>

            {/* Eternal Realm requirement */}
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

          {/* Crowns earned preview */}
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

          <Pressable onPress={onViewShop} style={styles.shopBtn}>
            <Text style={styles.shopBtnText}>View Crown Shop</Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Return to Realm</Text>
          </Pressable>
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
  scroll: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
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
  tick: {
    color: COLORS.greenLight,
    fontSize: 18,
    lineHeight: 22,
  },
  cross: {
    color: COLORS.red,
    fontSize: 18,
    lineHeight: 22,
  },
  reqText: {
    flex: 1,
    gap: 2,
  },
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
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
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
  ascendBtnTextDisabled: {
    color: COLORS.textDim,
  },
  shopBtn: {
    marginTop: 10,
    width: "100%",
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.lg,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.gold4,
  },
  shopBtnText: {
    color: COLORS.gold3,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 14,
  },
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
});
