import React, { useMemo } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Check, Crown, Lock } from "lucide-react-native";
import { COLORS, FONTS, RADIUS, SHADOWS, BRANCH_COLORS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import {
  SKILL_TREE_NODES,
  SkillNodeDef,
  isNodeRequirementMet,
} from "@/data/skillTree";
import { LEGACY_UPGRADES } from "@/data/legacyUpgrades";
import { formatGold } from "@/utils/formatNumber";
import IconPlaceholder from "./IconPlaceholder";

interface Props {
  visible: boolean;
  onReturn: () => void;
  onStartNewKingdom: () => void;
}

type NodeState = "unlocked" | "available" | "locked";

export default function SovereigntyScreen({ visible, onReturn, onStartNewKingdom }: Props) {
  const { state, prestigeReward, unlockSkillNode, buyLegacyUpgrade } = useGame();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === "web" ? 12 : 20);
  const bottomPad = Math.max(insets.bottom, 12);

  const buildingsOwned = useMemo(
    () => Object.values(state.buildings).reduce((s, b) => s + b.count, 0),
    [state.buildings],
  );

  const runDurationSec = Math.max(0, Math.floor((Date.now() - state.runStartTime) / 1000));
  const runHrs = Math.floor(runDurationSec / 3600);
  const runMin = Math.floor((runDurationSec % 3600) / 60);
  const runSec = runDurationSec % 60;
  const runTimeText =
    runHrs > 0
      ? `${runHrs}h ${runMin}m`
      : runMin > 0
      ? `${runMin}m ${runSec}s`
      : `${runSec}s`;

  const sortedNodes = useMemo(
    () => [...SKILL_TREE_NODES].sort((a, b) => a.tier - b.tier),
    [],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onReturn}>
      <View style={[styles.root, { paddingTop: topPad }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.crownWrap}>
            <Crown color={COLORS.gold2} size={26} />
          </View>
          <Text style={styles.title}>Declare sovereignty</Text>
          <View style={styles.pillsRow}>
            <View style={[styles.pill, styles.pillEarn]}>
              <View style={[styles.pillDot, { backgroundColor: COLORS.gold2 }]} />
              <Text style={[styles.pillText, { color: COLORS.gold1 }]} numberOfLines={1}>
                {formatGold(prestigeReward)} earned this run
              </Text>
            </View>
            <View style={[styles.pill, styles.pillTotal]}>
              <Text style={[styles.pillText, { color: COLORS.textSub }]} numberOfLines={1}>
                {formatGold(state.sealsAvailable)} total seals
              </Text>
            </View>
          </View>
        </View>

        {/* Run stats */}
        <View style={styles.statsRow}>
          <StatCard label="GOLD THIS RUN" value={formatGold(Math.floor(state.totalGoldEarned))} />
          <StatCard label="RUN TIME" value={runTimeText} />
          <StatCard label="BUILDINGS" value={String(buildingsOwned)} />
          <StatCard label="PRESTIGES" value={String(state.prestigeCount)} />
        </View>

        {/* Two-panel body */}
        <View style={styles.body}>
          {/* Left: Skill Tree */}
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Skill Tree</Text>
              <View style={styles.sealRow}>
                <View style={styles.sealDot} />
                <Text style={styles.sealText}>{formatGold(state.sealsAvailable)}</Text>
              </View>
            </View>
            <ScrollView
              style={styles.panelScroll}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator
            >
              <View style={styles.grid}>
                {sortedNodes.map((node) => {
                  const unlocked = state.unlockedSkillNodes.includes(node.id);
                  const reqMet = isNodeRequirementMet(node, state.unlockedSkillNodes);
                  const affordable = state.sealsAvailable >= node.cost;
                  const nodeState: NodeState = unlocked
                    ? "unlocked"
                    : reqMet && affordable
                    ? "available"
                    : "locked";
                  const branchColor =
                    BRANCH_COLORS[node.branch as keyof typeof BRANCH_COLORS] ?? COLORS.gold2;
                  return (
                    <SkillTile
                      key={node.id}
                      node={node}
                      state={nodeState}
                      branchColor={branchColor}
                      onPress={() => unlockSkillNode(node.id)}
                    />
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.legend}>
              <LegendDot color={COLORS.blueLight} label="Unlocked" />
              <LegendDot color={COLORS.gold2} label="Available" />
              <LegendDot color={COLORS.bg5} label="Locked" />
            </View>
          </View>

          {/* Right: Legacy upgrades */}
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Legacy</Text>
              <Text style={styles.panelSub}>Permanent</Text>
            </View>
            <ScrollView
              style={styles.panelScroll}
              contentContainerStyle={styles.legacyContent}
              showsVerticalScrollIndicator
            >
              {LEGACY_UPGRADES.map((u) => {
                const owned = (state.legacyUpgrades ?? []).includes(u.id);
                const reqMet = u.requires.every((r) => (state.legacyUpgrades ?? []).includes(r));
                const affordable = state.sealsAvailable >= u.cost;
                const canBuy = !owned && reqMet && affordable;
                return (
                  <View
                    key={u.id}
                    style={[
                      styles.legacyItem,
                      owned && styles.legacyItemOwned,
                      !reqMet && !owned && styles.legacyItemLocked,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.legacyTitleRow}>
                        <Text
                          style={[styles.legacyName, owned && styles.legacyNameOwned]}
                          numberOfLines={1}
                        >
                          {u.name}
                        </Text>
                        {owned && (
                          <View style={styles.ownedTag}>
                            <Check color={COLORS.greenLight} size={11} />
                            <Text style={styles.ownedTagText}>Owned</Text>
                          </View>
                        )}
                        {!owned && !reqMet && <Lock color={COLORS.textDim} size={12} />}
                      </View>
                      <Text style={styles.legacyDesc} numberOfLines={2}>
                        {u.description}
                      </Text>
                    </View>
                    {!owned && (
                      <Pressable
                        onPress={canBuy ? () => buyLegacyUpgrade(u.id) : undefined}
                        disabled={!canBuy}
                        style={[styles.buyBtn, !canBuy && styles.buyBtnDisabled]}
                        testID={`sov-legacy-${u.id}`}
                      >
                        <Text
                          style={[
                            styles.buyBtnText,
                            !canBuy && styles.buyBtnTextDisabled,
                          ]}
                        >
                          {u.cost}
                        </Text>
                        <Text
                          style={[
                            styles.buyBtnLabel,
                            !canBuy && styles.buyBtnTextDisabled,
                          ]}
                        >
                          seal{u.cost === 1 ? "" : "s"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
              <View style={{ height: 8 }} />
            </ScrollView>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: bottomPad + 12 }]}>
          <Pressable onPress={onReturn} style={styles.returnBtn} testID="sov-return">
            <ArrowLeft color={COLORS.textPrimary} size={18} />
            <Text style={styles.returnBtnText}>Return</Text>
          </Pressable>
          <Pressable onPress={onStartNewKingdom} style={styles.startBtn} testID="sov-start">
            <Crown color="#fff" size={20} />
            <Text style={styles.startBtnText}>Start new kingdom</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function SkillTile({
  node,
  state,
  branchColor,
  onPress,
}: {
  node: SkillNodeDef;
  state: NodeState;
  branchColor: string;
  onPress: () => void;
}) {
  const bg =
    state === "unlocked"
      ? "rgba(36, 113, 163, 0.18)"
      : state === "available"
      ? COLORS.bg3
      : COLORS.bg2;
  const borderColor =
    state === "unlocked"
      ? COLORS.blueLight
      : state === "available"
      ? COLORS.gold2
      : COLORS.bg5;
  const opacity = state === "locked" ? 0.55 : 1;

  return (
    <Pressable
      onPress={state === "available" ? onPress : undefined}
      disabled={state !== "available"}
      style={[styles.tile, { backgroundColor: bg, borderColor, opacity }]}
      testID={`sov-node-${node.id}`}
    >
      <View style={[styles.tileIcon, { borderColor: branchColor }]}>
        <IconPlaceholder size={20} tint={branchColor} borderRadius={4} />
      </View>
      <Text style={styles.tileName} numberOfLines={2}>
        {node.name}
      </Text>
      <View style={styles.tileFooter}>
        {state === "unlocked" ? (
          <Check color={COLORS.blueLight} size={12} />
        ) : (
          <>
            <View
              style={[
                styles.tileSealDot,
                {
                  backgroundColor:
                    state === "available" ? COLORS.gold2 : COLORS.textDim,
                },
              ]}
            />
            <Text
              style={[
                styles.tileCost,
                state === "locked" && { color: COLORS.textDim },
              ]}
            >
              {node.cost}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0a0703",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
    backgroundColor: COLORS.bg1,
  },
  crownWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.gold4,
    ...SHADOWS.goldGlow,
  },
  title: {
    flex: 1,
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.3,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 6,
    flexShrink: 1,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    maxWidth: 170,
  },
  pillEarn: {
    backgroundColor: "rgba(245, 200, 66, 0.12)",
    borderColor: COLORS.gold4,
  },
  pillTotal: {
    backgroundColor: COLORS.bg3,
    borderColor: COLORS.bg5,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillText: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.bg1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.bg5,
  },
  statLabel: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  statValue: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 15,
    marginTop: 2,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    padding: 8,
  },
  panel: {
    flex: 1,
    backgroundColor: COLORS.bg2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.bg5,
    overflow: "hidden",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.bg3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
  },
  panelTitle: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  panelSub: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 10,
    fontStyle: "italic",
  },
  sealRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.gold4,
  },
  sealDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold2,
  },
  sealText: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 11,
  },
  panelScroll: {
    flex: 1,
  },
  gridContent: {
    padding: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  tile: {
    width: "32%",
    aspectRatio: 0.85,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    padding: 5,
    alignItems: "center",
    justifyContent: "space-between",
  },
  tileIcon: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg1,
  },
  tileName: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 9.5,
    textAlign: "center",
    lineHeight: 11,
  },
  tileFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    minHeight: 14,
  },
  tileSealDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tileCost: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 11,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.bg5,
    backgroundColor: COLORS.bg1,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 9,
    fontWeight: "700",
  },
  legacyContent: {
    padding: 8,
    gap: 6,
  },
  legacyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.md,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.bg5,
  },
  legacyItemOwned: {
    backgroundColor: "rgba(30, 132, 73, 0.18)",
    borderColor: COLORS.greenLight,
  },
  legacyItemLocked: {
    opacity: 0.55,
  },
  legacyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legacyName: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 12,
  },
  legacyNameOwned: {
    color: COLORS.greenLight,
  },
  ownedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(39, 174, 96, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
  },
  ownedTagText: {
    color: COLORS.greenLight,
    fontFamily: FONTS.system,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  legacyDesc: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 10.5,
    fontStyle: "italic",
    marginTop: 3,
    lineHeight: 14,
  },
  buyBtn: {
    minWidth: 56,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gold5,
    borderWidth: 1,
    borderColor: COLORS.gold3,
    alignItems: "center",
    justifyContent: "center",
  },
  buyBtnDisabled: {
    backgroundColor: COLORS.bg2,
    borderColor: COLORS.bg5,
  },
  buyBtnText: {
    color: COLORS.gold1,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 14,
  },
  buyBtnLabel: {
    color: COLORS.gold2,
    fontFamily: FONTS.system,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buyBtnTextDisabled: {
    color: COLORS.textDim,
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: COLORS.bg1,
    borderTopWidth: 1,
    borderTopColor: COLORS.bg5,
  },
  returnBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.bg5,
  },
  returnBtnText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 14,
  },
  startBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    backgroundColor: COLORS.red,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.redLight,
    shadowColor: COLORS.red,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  startBtnText: {
    color: "#fff",
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
