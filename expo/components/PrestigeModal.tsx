import React, { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SHADOWS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { formatGold } from "@/utils/formatNumber";
import { UPGRADE_BY_ID } from "@/data/upgrades";
import { CHALLENGES, CHALLENGE_BY_ID, TIER_COLORS, TIER_LABELS, isChallengeUnlocked, type Challenge } from "@/data/challenges";
import { BUILDINGS } from "@/data/buildings";
import CrownIcon from "./icons/ui/CrownIcon";

interface Props {
  visible: boolean;
  onConfirm: (carryOverId?: string | null) => void;
  onCancel: () => void;
  onStartChallenge: (challengeId: string, selectedBuilding?: string) => void;
}

type Tab = "prestige" | "challenge";
const MEDAL_ICONS: Record<string, string> = { gold: "🥇", silver: "🥈", bronze: "🥉" };

export default function PrestigeModal({ visible, onConfirm, onCancel, onStartChallenge }: Props) {
  const { state, prestigeReward } = useGame();
  const [carryOverId, setCarryOverId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("prestige");
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top + 12, Platform.OS === "web" ? 24 : 32);
  const bottomPad = Math.max(insets.bottom, 16);

  const hasHolyOrder = state.unlockedSkillNodes.includes("faith_3a");
  const buildingsOwned = Object.values(state.buildings).reduce((s, b) => s + b.count, 0);
  const runDurationSec = Math.floor((Date.now() - state.runStartTime) / 1000);
  const runHrs = Math.floor(runDurationSec / 3600);
  const runMin = Math.floor((runDurationSec % 3600) / 60);

  const activeChallenge = state.challenges.active;

  function handleStartChallenge() {
    if (!selectedChallenge) return;
    const challenge = CHALLENGE_BY_ID[selectedChallenge];
    if (!challenge) return;
    if (challenge.requiresSelection && !selectedBuilding) return;
    onStartChallenge(selectedChallenge, selectedBuilding ?? undefined);
    setSelectedChallenge(null);
    setSelectedBuilding(null);
  }

  function renderChallengeList() {
    const tiers: Array<"iron" | "steel" | "legendary"> = ["iron", "steel", "legendary"];
    return tiers.map((tier) => {
      const tierChallenges = CHALLENGES.filter((c) => c.tier === tier);
      const tierColor = TIER_COLORS[tier];
      return (
        <View key={tier} style={styles.tierSection}>
          <Text style={[styles.tierLabel, { color: tierColor }]}>
            {TIER_LABELS[tier]} — {tier === "iron" ? "2×" : tier === "steel" ? "3.5×" : "7×"} Seals
          </Text>
          {tierChallenges.map((c) => {
            const unlocked = isChallengeUnlocked(c, state);
            const medal = state.challenges.medals[c.id];
            const completed = state.challenges.completed.includes(c.id);
            const isSelected = selectedChallenge === c.id;
            const isActive = activeChallenge === c.id;

            return (
              <View key={c.id} style={styles.challengeBlock}>
                <Pressable
                  onPress={() => {
                    if (!unlocked) return;
                    setSelectedChallenge(isSelected ? null : c.id);
                    setSelectedBuilding(null);
                  }}
                  style={[
                    styles.challengeCard,
                    isSelected && styles.challengeCardSel,
                    isActive && styles.challengeCardActive,
                    !unlocked && styles.challengeCardLocked,
                    { borderLeftColor: unlocked ? tierColor : COLORS.bg5 },
                  ]}
                >
                  <View style={styles.challengeTop}>
                    <Text style={[styles.challengeName, !unlocked && styles.lockedText]}>
                      {c.name}
                    </Text>
                    <View style={styles.challengeRight}>
                      {medal && <Text style={styles.medalIcon}>{MEDAL_ICONS[medal]}</Text>}
                      {isActive && <Text style={styles.activePill}>ACTIVE</Text>}
                      {!unlocked && <Text style={styles.lockIcon}>🔒</Text>}
                    </View>
                  </View>
                  <Text style={[styles.challengeFlavour, !unlocked && styles.lockedText]}>
                    {c.flavour}
                  </Text>
                  {!unlocked && (
                    <Text style={styles.unlockHint}>
                      {c.tier === "iron" ? "1" : c.tier === "steel" ? "5" : "15"} prestiges to unlock
                    </Text>
                  )}
                </Pressable>

                {isSelected && c.requiresSelection && (
                  <View style={styles.buildingSelect}>
                    <Text style={styles.buildingSelectLabel}>Choose your building:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {BUILDINGS.map((b) => {
                        const sel = selectedBuilding === b.id;
                        return (
                          <Pressable
                            key={b.id}
                            onPress={() => setSelectedBuilding(sel ? null : b.id)}
                            style={[styles.buildingChip, sel && styles.buildingChipSel]}
                          >
                            <Text style={[styles.buildingChipText, sel && styles.buildingChipTextSel]}>
                              {b.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {isSelected && (
                  <Pressable
                    onPress={handleStartChallenge}
                    disabled={c.requiresSelection && !selectedBuilding}
                    style={[
                      styles.startBtn,
                      { borderColor: tierColor },
                      c.requiresSelection && !selectedBuilding && styles.startBtnDisabled,
                    ]}
                  >
                    <Text style={[styles.startBtnText, { color: tierColor }]}>
                      START CHALLENGE
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      );
    });
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        {/* Tab bar */}
        <View style={[styles.tabBar, { paddingTop: topPad }]}>
          <Pressable
            onPress={() => setTab("prestige")}
            style={[styles.tab, tab === "prestige" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "prestige" && styles.tabTextActive]}>PRESTIGE</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("challenge")}
            style={[styles.tab, tab === "challenge" && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === "challenge" && styles.tabTextActive]}>
              CHALLENGE RUN
              {activeChallenge && <Text style={styles.activeDot}> ●</Text>}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {tab === "prestige" ? (
            <>
              <View style={styles.sealWrap}>
                <CrownIcon size={96} />
              </View>
              <Text style={styles.title}>Declare Sovereignty</Text>
              <Text style={styles.subtitle}>
                Enter the Legacy Hall to spend Royal Seals, then begin a new kingdom.
              </Text>

              <View style={styles.sealsBox}>
                <Text style={styles.sealsLabel}>ROYAL SEALS TO EARN</Text>
                <View style={styles.bigSealRow}>
                  <CrownIcon size={28} />
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
                  <Text style={styles.infoHeader}>After New Kingdom</Text>
                  <Text style={styles.infoLineLose}>• {formatGold(state.gold)} current gold</Text>
                  <Text style={styles.infoLineLose}>• {buildingsOwned} buildings</Text>
                  <Text style={styles.infoLineLose}>• {state.purchasedUpgrades.length} run upgrades</Text>
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
                <Text style={styles.abandonBtnText}>Enter Legacy Hall</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.challengeHeader}>Challenge Runs</Text>
              <Text style={styles.challengeSubheader}>
                Complete a prestige under special conditions for bonus Seals. Medals awarded for speed.
              </Text>
              {renderChallengeList()}
              <Pressable onPress={onCancel} style={[styles.returnBtn, { marginTop: 20 }]}>
                <Text style={styles.returnBtnText}>Return to the Realm</Text>
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
  activeDot: {
    color: COLORS.greenLight,
    fontSize: 10,
  },
  scroll: {
    paddingHorizontal: 20,
    alignItems: "center",
    paddingTop: 16,
  },
  // Prestige tab styles (unchanged)
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
  // Challenge tab styles
  challengeHeader: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 24,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    width: "100%",
  },
  challengeSubheader: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  tierSection: {
    width: "100%",
    gap: 8,
    marginBottom: 12,
  },
  tierLabel: {
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 2,
  },
  challengeBlock: {
    gap: 6,
  },
  challengeCard: {
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.md,
    padding: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.bg5,
    gap: 4,
  },
  challengeCardSel: {
    borderColor: COLORS.gold4,
  },
  challengeCardActive: {
    borderColor: COLORS.greenLight,
  },
  challengeCardLocked: {
    opacity: 0.5,
  },
  challengeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeName: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 14,
  },
  challengeRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  medalIcon: { fontSize: 16 },
  activePill: {
    backgroundColor: "#0a2a0a",
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: COLORS.greenLight,
    fontFamily: FONTS.system,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  lockIcon: { fontSize: 14 },
  challengeFlavour: {
    color: COLORS.textSub,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    fontSize: 12,
    lineHeight: 17,
  },
  unlockHint: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 10,
    marginTop: 2,
  },
  lockedText: {
    color: COLORS.textDim,
  },
  buildingSelect: {
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.md,
    padding: 10,
    gap: 6,
  },
  buildingSelectLabel: {
    color: COLORS.textSub,
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: "700",
  },
  buildingChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.bg5,
  },
  buildingChipSel: {
    backgroundColor: COLORS.gold5,
    borderColor: COLORS.gold3,
  },
  buildingChipText: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 11,
    fontWeight: "700",
  },
  buildingChipTextSel: {
    color: COLORS.textGold,
  },
  startBtn: {
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: COLORS.bg4,
  },
  startBtnDisabled: {
    opacity: 0.4,
  },
  startBtnText: {
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 1.5,
  },
});
