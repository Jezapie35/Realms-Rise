import React, { useMemo } from "react";
import { FlatList, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Lock, Trophy, X } from "lucide-react-native";
import { COLORS, FONTS, RADIUS, SHADOWS } from "@/constants/colors";
import { MILESTONES, Milestone } from "@/data/milestones";
import { useGame } from "@/context/GameContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Row {
  m: Milestone;
  unlocked: boolean;
}

export default function AchievementsModal({ visible, onClose }: Props) {
  const { state } = useGame();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === "web" ? 12 : 20);
  const bottomPad = Math.max(insets.bottom, 16);

  const rows: Row[] = useMemo(() => {
    const list = MILESTONES.map<Row>((m) => ({
      m,
      unlocked: state.triggeredMilestones.includes(m.id),
    }));
    list.sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
    return list;
  }, [state.triggeredMilestones]);

  const unlockedCount = rows.filter((r) => r.unlocked).length;
  const total = rows.length;
  const pct = total === 0 ? 0 : Math.round((unlockedCount / total) * 100);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={[styles.root, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <Trophy color={COLORS.gold2} size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Achievements</Text>
            <Text style={styles.subtitle}>
              {unlockedCount} / {total} unlocked · {pct}%
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            hitSlop={16}
            testID="achievements-close"
          >
            <X color={COLORS.textPrimary} size={24} />
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>

        <FlatList
          data={rows}
          keyExtractor={(r) => r.m.id}
          renderItem={({ item }) => <AchievementRow row={item} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad + 40 }]}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          showsVerticalScrollIndicator
        />
      </View>
    </Modal>
  );
}

function AchievementRow({ row }: { row: Row }) {
  const { m, unlocked } = row;
  return (
    <View
      style={[
        styles.card,
        unlocked ? styles.cardUnlocked : styles.cardLocked,
      ]}
      testID={`achievement-${m.id}`}
    >
      <View
        style={[
          styles.badge,
          unlocked ? styles.badgeUnlocked : styles.badgeLocked,
        ]}
      >
        {unlocked ? (
          <Check color={COLORS.bg1} size={20} strokeWidth={3} />
        ) : (
          <Lock color={COLORS.textDim} size={18} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.cardTitle,
            unlocked ? styles.cardTitleUnlocked : styles.cardTitleLocked,
          ]}
        >
          {unlocked ? m.title : "???"}
        </Text>
        <Text
          style={[
            styles.cardDesc,
            unlocked ? styles.cardDescUnlocked : styles.cardDescLocked,
          ]}
          numberOfLines={2}
        >
          {m.desc}
        </Text>
      </View>
      {unlocked && (
        <View style={styles.unlockedTag}>
          <Text style={styles.unlockedTagText}>UNLOCKED</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bg1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
    gap: 12,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.bg4,
    borderWidth: 1,
    borderColor: COLORS.gold4,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.bg5,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.gold2,
    borderRadius: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sep: { height: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 14,
  },
  cardUnlocked: {
    backgroundColor: COLORS.bg4,
    borderColor: COLORS.gold4,
    ...SHADOWS.cardLift,
  },
  cardLocked: {
    backgroundColor: COLORS.bg3,
    borderColor: COLORS.bg5,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  badgeUnlocked: {
    backgroundColor: COLORS.gold2,
    borderColor: COLORS.gold1,
  },
  badgeLocked: {
    backgroundColor: COLORS.bg2,
    borderColor: COLORS.bg5,
  },
  cardTitle: {
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 15,
  },
  cardTitleUnlocked: {
    color: COLORS.textGold,
  },
  cardTitleLocked: {
    color: COLORS.textDim,
    fontStyle: "italic",
  },
  cardDesc: {
    fontFamily: FONTS.system,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  cardDescUnlocked: {
    color: COLORS.textPrimary,
  },
  cardDescLocked: {
    color: COLORS.textDim,
  },
  unlockedTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gold5,
    borderWidth: 1,
    borderColor: COLORS.gold4,
  },
  unlockedTagText: {
    color: COLORS.gold2,
    fontFamily: FONTS.system,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
