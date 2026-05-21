import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Check,
  Coins,
  Crown,
  Lock,
  Shield,
  Star,
  Trophy,
  X,
} from "lucide-react-native";
import { COLORS, FONTS, RADIUS, SHADOWS } from "@/constants/colors";
import { MILESTONE_CATEGORIES, Milestone } from "@/data/milestones";
import { useGame } from "@/context/GameContext";
import { useSettings } from "@/context/SettingsContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS = {
  wealth:  Coins,
  kingdom: Crown,
  power:   Shield,
  glory:   Star,
};

const CATEGORY_COLORS = {
  wealth:  "#d4a430",
  kingdom: "#7a8ab0",
  power:   "#aa4444",
  glory:   "#7a4aaa",
};

type CategoryId = keyof typeof CATEGORY_COLORS;

function getCategoryAccent(id: string) {
  return CATEGORY_COLORS[id as CategoryId] ?? COLORS.gold2;
}

function ListSeparator() {
  return <View style={styles.sep} />;
}

export default function AchievementsModal({ visible, onClose }: Props) {
  const { state } = useGame();
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === "web" ? 12 : 20);
  const bottomPad = Math.max(insets.bottom, 16);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  const triggered = state.triggeredMilestones;
  const triggeredSet = useMemo(() => new Set(triggered), [triggered]);

  useEffect(() => {
    if (!visible) setSelectedCategory(null);
  }, [visible]);

  const totalUnlocked = triggeredSet.size;
  const totalAll = MILESTONE_CATEGORIES.reduce((s, c) => s + c.milestones.length, 0);

  const categoryStats = useMemo(() =>
    MILESTONE_CATEGORIES.map((cat) => {
      const unlocked = cat.milestones.filter((m) => triggeredSet.has(m.id)).length;
      return { ...cat, unlocked, total: cat.milestones.length };
    }),
    [triggeredSet],
  );

  const activeCat = categoryStats.find((c) => c.id === selectedCategory) ?? null;

  const rows = useMemo(() => {
    if (!activeCat) return [];
    return activeCat.milestones
      .map((m) => ({ m, unlocked: triggeredSet.has(m.id) }))
      .filter((r) => !(settings.hideAcquiredAchievements && r.unlocked))
      .sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
  }, [activeCat, triggeredSet, settings.hideAcquiredAchievements]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={[styles.root, { paddingTop: topPad }]}>
        {/* ── Header ── */}
        <View style={styles.header}>
          {activeCat ? (
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
              hitSlop={16}
            >
              <ArrowLeft color={COLORS.textPrimary} size={22} />
            </Pressable>
          ) : (
            <View style={styles.headerIconWrap}>
              <Trophy color={COLORS.gold2} size={20} />
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {activeCat ? activeCat.label : "Achievements"}
            </Text>
            <Text style={styles.subtitle}>
              {activeCat
                ? `${activeCat.unlocked} / ${activeCat.total} · ${pct(activeCat.unlocked, activeCat.total)}%`
                : `${totalUnlocked} / ${totalAll} unlocked`}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            hitSlop={16}
          >
            <X color={COLORS.textPrimary} size={22} />
          </Pressable>
        </View>

        {/* ── Overall progress bar (home only) ── */}
        {!activeCat && (
          <View style={styles.overallBar}>
            <View style={[styles.overallFill, { width: `${pct(totalUnlocked, totalAll)}%` }]} />
          </View>
        )}

        {/* ── Category grid (home screen) ── */}
        {!activeCat && (
          <View style={styles.categoryGrid}>
            {categoryStats.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id as CategoryId] ?? Trophy;
              const color = getCategoryAccent(cat.id);
              const p = pct(cat.unlocked, cat.total);
              return (
                <Pressable
                  key={cat.id}
                  style={({ pressed }) => [styles.catCard, pressed && { opacity: 0.75 }]}
                  onPress={() => setSelectedCategory(cat.id as CategoryId)}
                >
                  <View style={[styles.catIconWrap, { backgroundColor: color + "22", borderColor: color + "55" }]}>
                    <Icon color={color} size={26} />
                  </View>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <Text style={[styles.catCount, { color }]}>
                    {cat.unlocked}/{cat.total}
                  </Text>

                  {/* Progress bar */}
                  <View style={styles.catBarTrack}>
                    <View
                      style={[
                        styles.catBarFill,
                        { width: `${p}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={styles.catPct}>{p}%</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── Achievement list (category screen) ── */}
        {activeCat && (
          <View style={styles.detailPane}>
            <View style={styles.catDetailBar}>
              <View
                style={[
                  styles.catDetailFill,
                  {
                    width: `${pct(activeCat.unlocked, activeCat.total)}%`,
                    backgroundColor: getCategoryAccent(activeCat.id),
                  },
                ]}
              />
            </View>

            <FlatList
              style={styles.list}
              data={rows}
              keyExtractor={(r) => r.m.id}
              renderItem={({ item }) => (
                <AchievementRow
                  m={item.m}
                  unlocked={item.unlocked}
                  accentColor={getCategoryAccent(activeCat.id)}
                />
              )}
              contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad + 24 }]}
              ItemSeparatorComponent={ListSeparator}
              showsVerticalScrollIndicator
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

function pct(n: number, total: number) {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

const AchievementRow = React.memo(function AchievementRow({
  m,
  unlocked,
  accentColor,
}: {
  m: Milestone;
  unlocked: boolean;
  accentColor: string;
}) {
  return (
    <View
      style={[styles.card, unlocked ? [styles.cardUnlocked, { borderColor: accentColor + "66" }] : styles.cardLocked]}
    >
      <View style={[styles.badge, unlocked ? { backgroundColor: accentColor, borderColor: accentColor } : styles.badgeLocked]}>
        {unlocked ? (
          <Check color="#fff" size={18} strokeWidth={3} />
        ) : (
          <Lock color={COLORS.textDim} size={16} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, unlocked ? { color: COLORS.textGold } : styles.cardTitleLocked]}>
          {unlocked ? m.title : "???"}
        </Text>
        <Text
          style={[styles.cardDesc, unlocked ? { color: COLORS.textPrimary } : { color: COLORS.textDim }]}
          numberOfLines={2}
        >
          {unlocked ? m.desc : "Complete this achievement to reveal details."}
        </Text>
      </View>
      {unlocked && (
        <View style={[styles.unlockedTag, { backgroundColor: accentColor + "22", borderColor: accentColor + "55" }]}>
          <Text style={[styles.unlockedTagText, { color: accentColor }]}>✓</Text>
        </View>
      )}
    </View>
  );
});

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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bg4,
    borderWidth: 1,
    borderColor: COLORS.gold4,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    fontSize: 19,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  // Overall bar
  overallBar: {
    height: 4,
    backgroundColor: COLORS.bg5,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 2,
    overflow: "hidden",
  },
  overallFill: {
    height: "100%",
    backgroundColor: COLORS.gold2,
    borderRadius: 2,
  },

  // Category grid
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 10,
  },
  catCard: {
    flexGrow: 1,
    flexBasis: "45%",
    maxWidth: "48%",
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.bg5,
    padding: 16,
    alignItems: "center",
    gap: 6,
    ...SHADOWS.cardLift,
  },
  catIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  catLabel: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 15,
  },
  catCount: {
    fontFamily: FONTS.system,
    fontSize: 12,
    fontWeight: "600",
  },
  catBarTrack: {
    width: "100%",
    height: 6,
    backgroundColor: COLORS.bg5,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 2,
  },
  catBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  catPct: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 11,
  },

  detailPane: {
    flex: 1,
  },
  // Category detail bar
  catDetailBar: {
    height: 5,
    backgroundColor: COLORS.bg5,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 3,
    overflow: "hidden",
  },
  catDetailFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Achievement list
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 14,
  },
  sep: { height: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 12,
  },
  cardUnlocked: {
    backgroundColor: COLORS.bg4,
    ...SHADOWS.cardLift,
  },
  cardLocked: {
    backgroundColor: COLORS.bg3,
    borderColor: COLORS.bg5,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  badgeLocked: {
    backgroundColor: COLORS.bg2,
    borderColor: COLORS.bg5,
  },
  cardTitle: {
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 14,
  },
  cardTitleLocked: {
    color: COLORS.textDim,
    fontStyle: "italic",
  },
  cardDesc: {
    fontFamily: FONTS.system,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  unlockedTag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockedTagText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
