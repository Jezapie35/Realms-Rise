import React, { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SHADOWS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { formatGold } from "@/utils/formatNumber";
import { UPGRADE_BY_ID } from "@/data/upgrades";
import IconPlaceholder from "./IconPlaceholder";

interface Props {
  visible: boolean;
  onConfirm: (carryOverId?: string | null) => void;
  onCancel: () => void;
}

export default function PrestigeModal({ visible, onConfirm, onCancel }: Props) {
  const { state, prestigeReward } = useGame();
  const [carryOverId, setCarryOverId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top + 12, Platform.OS === "web" ? 24 : 32);
  const bottomPad = Math.max(insets.bottom, 16);

  const hasHolyOrder = state.unlockedSkillNodes.includes("faith_3a");
  const buildingsOwned = Object.values(state.buildings).reduce((s, b) => s + b.count, 0);
  const runDurationSec = Math.floor((Date.now() - state.runStartTime) / 1000);
  const runHrs = Math.floor(runDurationSec / 3600);
  const runMin = Math.floor((runDurationSec % 3600) / 60);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: bottomPad + 24 }]}>
          <View style={styles.sealWrap}>
            <IconPlaceholder size={96} tint={COLORS.red} borderRadius={48} />
          </View>
          <Text style={styles.title}>Declare Sovereignty</Text>
          <Text style={styles.subtitle}>Your kingdom falls. Your legacy endures forever.</Text>

          <View style={styles.sealsBox}>
            <Text style={styles.sealsLabel}>ROYAL SEALS TO EARN</Text>
            <View style={styles.bigSealRow}>
              <IconPlaceholder size={28} tint={COLORS.red} borderRadius={14} />
              <Text style={styles.bigSealNumber}>{formatGold(prestigeReward)}</Text>
            </View>
            <Text style={styles.totalText}>
              New total: {formatGold(state.sealsAvailable + prestigeReward)} Seals
            </Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, styles.keepCard]}>
              <Text style={styles.infoHeader}>You Keep</Text>
              <Text style={styles.infoLine}>• {state.unlockedSkillNodes.length} skill nodes</Text>
              <Text style={styles.infoLine}>• {formatGold(state.totalGoldEarned)} lifetime gold</Text>
              <Text style={styles.infoLine}>• {state.prestigeCount} prestiges</Text>
              <Text style={styles.infoLine}>• All Royal Seals</Text>
            </View>
            <View style={[styles.infoCard, styles.loseCard]}>
              <Text style={styles.infoHeader}>You Lose</Text>
              <Text style={styles.infoLineLose}>• {formatGold(state.gold)} current gold</Text>
              <Text style={styles.infoLineLose}>• {buildingsOwned} buildings</Text>
              <Text style={styles.infoLineLose}>• {state.purchasedUpgrades.length} upgrades</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              This run: {runHrs > 0 ? `${runHrs}h ${runMin}m` : `${runMin}m`} · {buildingsOwned} buildings · {state.purchasedUpgrades.length} upgrades
            </Text>
          </View>

          {hasHolyOrder && state.purchasedUpgrades.length > 0 && (
            <View style={styles.carryBox}>
              <Text style={styles.carryTitle}>Holy Order — Carry one upgrade</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {state.purchasedUpgrades.map((id) => {
                  const u = UPGRADE_BY_ID[id];
                  if (!u) return null;
                  const sel = carryOverId === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => setCarryOverId(sel ? null : id)}
                      style={[styles.carryChip, sel && styles.carryChipSel]}
                    >
                      <Text style={[styles.carryChipText, sel && styles.carryChipTextSel]}>{u.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <Pressable onPress={onCancel} style={styles.returnBtn} testID="prestige-cancel">
            <Text style={styles.returnBtnText}>Return to the Realm</Text>
          </Pressable>
          <Pressable
            onPress={() => onConfirm(carryOverId)}
            style={styles.abandonBtn}
            testID="prestige-confirm"
          >
            <Text style={styles.abandonBtnText}>Abandon the Kingdom</Text>
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
  sealWrap: {
    marginTop: 8,
    marginBottom: 12,
    ...SHADOWS.goldGlow,
  },
  title: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 28,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  sealsBox: {
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.lg,
    padding: 16,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gold4,
  },
  sealsLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "700",
    marginBottom: 6,
  },
  bigSealRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bigSealNumber: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 48,
    fontWeight: "800",
  },
  totalText: {
    color: COLORS.textSub,
    fontFamily: FONTS.serif,
    fontSize: 13,
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.lg,
    padding: 12,
    borderLeftWidth: 3,
  },
  keepCard: { borderLeftColor: COLORS.green },
  loseCard: { borderLeftColor: COLORS.red },
  infoHeader: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 6,
  },
  infoLine: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 11,
    marginTop: 2,
  },
  infoLineLose: {
    color: "#e67b70",
    fontFamily: FONTS.system,
    fontSize: 11,
    marginTop: 2,
  },
  statsRow: { marginTop: 12, width: "100%" },
  statsText: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
  },
  carryBox: {
    marginTop: 12,
    width: "100%",
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.md,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.purple,
  },
  carryTitle: {
    color: COLORS.purpleLight,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 13,
  },
  carryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.bg5,
  },
  carryChipSel: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purpleLight,
  },
  carryChipText: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 11,
    fontWeight: "700",
  },
  carryChipTextSel: {
    color: "#fff",
  },
  returnBtn: {
    marginTop: 20,
    width: "100%",
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.lg,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.bg5,
  },
  returnBtnText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 15,
  },
  abandonBtn: {
    marginTop: 8,
    width: "100%",
    backgroundColor: COLORS.redDark,
    borderRadius: RADIUS.lg,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  abandonBtnText: {
    color: COLORS.redLight,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 1,
  },
});
