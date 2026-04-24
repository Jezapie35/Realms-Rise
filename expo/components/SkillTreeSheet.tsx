import React, { useMemo, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Lock, X } from "lucide-react-native";
import { COLORS, FONTS, RADIUS, SHADOWS, BRANCH_COLORS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import {
  SKILL_TREE_NODES,
  SkillBranch,
  SkillNodeDef,
  isNodeRequirementMet,
} from "@/data/skillTree";
import { LEGACY_UPGRADES, LegacyUpgrade } from "@/data/legacyUpgrades";
import { formatGold } from "@/utils/formatNumber";
import IconPlaceholder from "./IconPlaceholder";

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Section {
  key: SkillBranch;
  title: string;
  subtitle: string;
  color: string;
}

const SECTIONS: Section[] = [
  { key: "commerce", title: "Commerce", subtitle: "Wealth & trade", color: BRANCH_COLORS.commerce },
  { key: "military", title: "Military", subtitle: "Might & conquest", color: BRANCH_COLORS.military },
  { key: "faith", title: "Faith", subtitle: "Devotion & divine favor", color: BRANCH_COLORS.faith },
  { key: "lineage", title: "Lineage", subtitle: "Legacy & bloodline", color: BRANCH_COLORS.lineage },
  { key: "cross", title: "Cross-Branch", subtitle: "Master two paths", color: COLORS.gold1 },
  { key: "pinnacle", title: "Pinnacle", subtitle: "Eternal mastery", color: COLORS.gold2 },
];

type Tab = "skills" | "legacy";

export default function SkillTreeSheet({ visible, onClose }: Props) {
  const { state, unlockSkillNode, buyLegacyUpgrade } = useGame();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === "web" ? 12 : 20);
  const [tab, setTab] = useState<Tab>("skills");

  const grouped = useMemo(() => {
    const map: Record<SkillBranch, SkillNodeDef[]> = {
      commerce: [],
      military: [],
      faith: [],
      lineage: [],
      cross: [],
      pinnacle: [],
    };
    for (const n of SKILL_TREE_NODES) {
      map[n.branch].push(n);
    }
    for (const k of Object.keys(map) as SkillBranch[]) {
      map[k].sort((a, b) => a.tier - b.tier);
    }
    return map;
  }, []);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            hitSlop={16}
            testID="close-skill-tree"
          >
            <X color={COLORS.textPrimary} size={24} />
          </Pressable>
          <Text style={styles.title}>Skill Tree</Text>
          <View style={styles.sealsRow}>
            <View style={styles.sealDot} />
            <Text style={styles.sealsText}>{state.sealsAvailable}</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          <Pressable
            onPress={() => setTab("skills")}
            style={[styles.tabBtn, tab === "skills" && styles.tabBtnActive]}
            testID="tab-skills"
          >
            <Text style={[styles.tabText, tab === "skills" && styles.tabTextActive]}>SKILL TREE</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("legacy")}
            style={[styles.tabBtn, tab === "legacy" && styles.tabBtnActive]}
            testID="tab-legacy"
          >
            <Text style={[styles.tabText, tab === "legacy" && styles.tabTextActive]}>LEGACY</Text>
          </Pressable>
        </View>

        {tab === "legacy" ? (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionBar, { backgroundColor: COLORS.gold2 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: COLORS.gold2 }]}>Legacy Upgrades</Text>
                  <Text style={styles.sectionSubtitle}>Permanent bonuses across all runs</Text>
                </View>
              </View>
              {LEGACY_UPGRADES.map((u) => {
                const owned = (state.legacyUpgrades ?? []).includes(u.id);
                const reqMet = u.requires.every((r) => (state.legacyUpgrades ?? []).includes(r));
                const affordable = state.sealsAvailable >= u.cost;
                return (
                  <LegacyCard
                    key={u.id}
                    upgrade={u}
                    owned={owned}
                    reqMet={reqMet}
                    affordable={affordable}
                    onBuy={() => buyLegacyUpgrade(u.id)}
                  />
                );
              })}
              <View style={{ height: 40 }} />
            </View>
          </ScrollView>
        ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
        >
          {SECTIONS.map((section) => {
            const nodes = grouped[section.key];
            if (!nodes || nodes.length === 0) return null;
            return (
              <View key={section.key} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionBar, { backgroundColor: section.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitle, { color: section.color }]}>
                      {section.title}
                    </Text>
                    <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                  </View>
                </View>

                {nodes.map((node) => (
                  <SkillNodeCard
                    key={node.id}
                    node={node}
                    color={section.color}
                    unlocked={state.unlockedSkillNodes.includes(node.id)}
                    reqMet={isNodeRequirementMet(node, state.unlockedSkillNodes)}
                    affordable={state.sealsAvailable >= node.cost}
                    onUnlock={() => unlockSkillNode(node.id)}
                  />
                ))}
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function LegacyCard({
  upgrade,
  owned,
  reqMet,
  affordable,
  onBuy,
}: {
  upgrade: LegacyUpgrade;
  owned: boolean;
  reqMet: boolean;
  affordable: boolean;
  onBuy: () => void;
}) {
  const cardState: "locked" | "available" | "cannot" | "unlocked" = owned
    ? "unlocked"
    : !reqMet
    ? "locked"
    : affordable
    ? "available"
    : "cannot";
  const color = COLORS.gold2;
  const borderColor = cardState === "locked" ? COLORS.bg5 : color;
  const borderWidth = cardState === "available" || cardState === "unlocked" ? 2 : 1;
  return (
    <Pressable
      onPress={cardState === "available" ? onBuy : undefined}
      disabled={cardState !== "available"}
      style={[
        styles.card,
        {
          borderColor,
          borderWidth,
          opacity: cardState === "locked" ? 0.55 : 1,
          backgroundColor: cardState === "unlocked" ? COLORS.bg4 : COLORS.bg3,
        },
        cardState === "available" && {
          shadowColor: color,
          shadowOpacity: 0.45,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
      ]}
      testID={`legacy-${upgrade.id}`}
    >
      <View style={[styles.iconWrap, { borderColor: color }]}>
        <IconPlaceholder size={28} tint={color} borderRadius={6} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{upgrade.name}</Text>
          {cardState === "locked" && <Lock color={COLORS.textDim} size={14} />}
          {cardState === "unlocked" && <Check color={color} size={16} />}
        </View>
        <Text style={styles.cardDesc}>{upgrade.description}</Text>
        <View style={styles.cardFooter}>
          {cardState === "unlocked" ? (
            <Text style={[styles.mastered, { color }]}>ETERNAL</Text>
          ) : cardState === "locked" ? (
            <Text style={styles.lockedText}>Requires previous legacy</Text>
          ) : cardState === "cannot" ? (
            <Text style={styles.cannotText}>Need {formatGold(upgrade.cost)} Seals</Text>
          ) : (
            <View style={[styles.costPill, { borderColor: color }]}>
              <View style={[styles.costDot, { backgroundColor: color }]} />
              <Text style={styles.costText}>{formatGold(upgrade.cost)} Seal{upgrade.cost === 1 ? "" : "s"}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

interface NodeProps {
  node: SkillNodeDef;
  color: string;
  unlocked: boolean;
  reqMet: boolean;
  affordable: boolean;
  onUnlock: () => void;
}

function SkillNodeCard({ node, color, unlocked, reqMet, affordable, onUnlock }: NodeProps) {
  const cardState: "locked" | "available" | "cannot" | "unlocked" = unlocked
    ? "unlocked"
    : !reqMet
    ? "locked"
    : affordable
    ? "available"
    : "cannot";

  const borderColor =
    cardState === "locked"
      ? COLORS.bg5
      : cardState === "unlocked"
      ? color
      : cardState === "available"
      ? color
      : color;

  const borderWidth = cardState === "available" || cardState === "unlocked" ? 2 : 1;

  const cardStyle = [
    styles.card,
    {
      borderColor,
      borderWidth,
      opacity: cardState === "locked" ? 0.55 : 1,
      backgroundColor: cardState === "unlocked" ? COLORS.bg4 : COLORS.bg3,
    },
    cardState === "available" && {
      shadowColor: color,
      shadowOpacity: 0.45,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
      elevation: 6,
    },
  ];

  return (
    <Pressable
      onPress={cardState === "available" ? onUnlock : undefined}
      disabled={cardState !== "available"}
      style={cardStyle}
      testID={`node-${node.id}`}
    >
      <View style={[styles.iconWrap, { borderColor: color }]}>
        <IconPlaceholder size={28} tint={color} borderRadius={6} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {node.name}
          </Text>
          {cardState === "locked" && <Lock color={COLORS.textDim} size={14} />}
          {cardState === "unlocked" && <Check color={color} size={16} />}
        </View>
        <Text style={styles.cardDesc}>{node.description}</Text>
        <View style={styles.cardFooter}>
          {cardState === "unlocked" ? (
            <Text style={[styles.mastered, { color }]}>MASTERED</Text>
          ) : cardState === "locked" ? (
            <Text style={styles.lockedText}>Requires previous skill</Text>
          ) : cardState === "cannot" ? (
            <Text style={styles.cannotText}>Need {formatGold(node.cost)} Seals</Text>
          ) : (
            <View style={[styles.costPill, { borderColor: color }]}>
              <View style={[styles.costDot, { backgroundColor: color }]} />
              <Text style={styles.costText}>
                {formatGold(node.cost)} Seal{node.cost === 1 ? "" : "s"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
    backgroundColor: COLORS.bg2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 20,
    fontStyle: "italic",
    textAlign: "center",
  },
  sealsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.gold4,
  },
  sealDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.red,
    borderWidth: 1,
    borderColor: COLORS.gold3,
  },
  sealsText: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 14,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.bg1,
  },
  scrollContent: {
    padding: 12,
    paddingTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  sectionTitle: {
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontStyle: "italic",
    fontSize: 20,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: RADIUS.lg,
    marginBottom: 10,
    ...SHADOWS.cardLift,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg2,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 15,
  },
  cardDesc: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 12.5,
    fontStyle: "italic",
    lineHeight: 17,
  },
  cardFooter: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  costPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    backgroundColor: COLORS.bg2,
  },
  costDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  costText: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 12,
  },
  mastered: {
    fontFamily: FONTS.system,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  lockedText: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 11,
    fontStyle: "italic",
  },
  cannotText: {
    color: COLORS.redLight,
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: "700",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.bg2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: COLORS.gold2,
    backgroundColor: COLORS.bg3,
  },
  tabText: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 1.2,
  },
  tabTextActive: {
    color: COLORS.textGold,
  },
});
