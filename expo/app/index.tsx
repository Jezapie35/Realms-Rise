import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Animated, Easing, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Lock, Settings, Trophy } from "lucide-react-native";
import { COLORS, FONTS, RADIUS } from "@/constants/colors";
import { BUILDINGS, Building } from "@/data/buildings";
import { useGame } from "@/context/GameContext";
import { canPrestige } from "@/data/gameEngine";
import { formatGold } from "@/utils/formatNumber";
import TopPanel from "@/components/TopPanel";
import UpgradeStrip from "@/components/UpgradeStrip";
import BuildingRow from "@/components/BuildingRow";
import ChallengeBanner from "@/components/ChallengeBanner";
import EdictTray from "@/components/EdictTray";
import PrestigeModal from "@/components/PrestigeModal";
import AscensionModal from "@/components/AscensionModal";
import CrownShopSheet from "@/components/CrownShopSheet";
import SettingsModal from "@/components/SettingsModal";
import AchievementsModal from "@/components/AchievementsModal";
import SkillTreeSheet from "@/components/SkillTreeSheet";
import MilestoneToast from "@/components/MilestoneToast";
import CrownIcon from "@/components/icons/ui/CrownIcon";
import WatchAdButton from "@/components/WatchAdButton";

const BUY_MODES: ("1" | "10" | "max" | "next")[] = ["1", "10", "max", "next"];

interface RowData {
  b: Building;
  count: number;
  revealed: boolean;
}

export default function MainScreen() {
  const {
    state,
    setBuyMode,
    buyBuilding,
    declareSovereignty,
    startNewKingdom,
    startChallengeRun,
    executeAscension,
    prestigeReward,
    hardReset,
  } = useGame();

  const [showPrestige, setShowPrestige] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSkillTree, setShowSkillTree] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showAscension, setShowAscension] = useState<boolean>(false);
  const [showCrownShop, setShowCrownShop] = useState<boolean>(false);

  const inLegacyShop = state.prestigePhase === "legacy_shop";
  const showAscensionButton = state.prestigeCount >= 20;

  useEffect(() => {
    if (inLegacyShop) setShowSkillTree(true);
  }, [inLegacyShop]);

  const eligible = canPrestige(state);
  const buildingTypesOwned = Object.values(state.buildings).filter((b) => b.count >= 1).length;

  const buildingData: RowData[] = useMemo(
    () =>
      BUILDINGS.map((b) => {
        const count = state.buildings[b.id]?.count ?? 0;
        const scoutedAll = state.legacyUpgrades?.includes("legacy_8") ?? false;
        const revealed = scoutedAll || count > 0 || state.totalGoldEarned >= b.baseCost * 0.3;
        return { b, count, revealed };
      }),
    [state.buildings, state.totalGoldEarned, state.legacyUpgrades],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: RowData; index: number }) => (
      <BuildingRow
        building={item.b}
        count={item.count}
        gold={state.gold}
        purchasedUpgrades={state.purchasedUpgrades}
        unlockedSkillNodes={state.unlockedSkillNodes}
        legacyUpgrades={state.legacyUpgrades ?? []}
        activeBonus={state.activeBonus}
        runStartTime={state.runStartTime}
        altRow={index % 2 === 1}
        buyMode={state.buyMode}
        revealed={item.revealed}
        onBuy={buyBuilding}
      />
    ),
    [
      buyBuilding,
      state.gold,
      state.purchasedUpgrades,
      state.unlockedSkillNodes,
      state.legacyUpgrades,
      state.activeBonus,
      state.runStartTime,
      state.buyMode,
    ],
  );

  const footer = (
    <View style={styles.footerWrap}>
      <WatchAdButton />
      {eligible ? (
        <PrestigeFooterButton reward={prestigeReward} onPress={() => setShowPrestige(true)} />
      ) : (
        <View style={styles.prestigeLocked}>
          <Lock color={COLORS.textDim} size={22} />
          <View style={{ flex: 1 }}>
            <Text style={styles.lockedTitle}>Declare Sovereignty</Text>
            <Text style={styles.lockedSub}>
              Requires 100b gold · {formatGold(state.totalGoldEarned)} / 100b
            </Text>
            <Text style={styles.lockedSub}>
              Requires 5 building types · {buildingTypesOwned} / 5
            </Text>
          </View>
        </View>
      )}
      <View style={{ height: 100 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Realm&apos;s Rise</Text>
        <LinearGradient
          colors={["transparent", COLORS.gold5, COLORS.gold4, COLORS.gold5, "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.headerRule}
        />
        {showAscensionButton && (
          <Pressable
            onPress={() => setShowAscension(true)}
            style={styles.settingsBtn}
            testID="ascension-btn"
          >
            <Text style={styles.crownEmoji}>♛</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => setShowAchievements(true)}
          style={styles.settingsBtn}
          testID="achievements-btn"
        >
          <Trophy color={COLORS.gold3} size={22} />
        </Pressable>
        <Pressable
          onPress={() => setShowSettings(true)}
          style={styles.settingsBtn}
          testID="settings-btn"
        >
          <Settings color={COLORS.gold3} size={22} />
        </Pressable>
      </View>

      <TopPanel />
      <ChallengeBanner />

      <UpgradeStrip />

      {/* Buy mode */}
      <View style={styles.buyModeRow}>
        {BUY_MODES.map((m) => (
          <Pressable
            key={m}
            onPress={() => setBuyMode(m)}
            style={[styles.modeBtn, state.buyMode === m && styles.modeBtnActive]}
            testID={`buymode-${m}`}
          >
            <Text style={[styles.modeText, state.buyMode === m && styles.modeTextActive]}>
              {m === "max" ? "MAX" : m === "next" ? "NEXT" : "×" + m}
            </Text>
          </Pressable>
        ))}
      </View>

      <EdictTray />

      <FlatList
        data={buildingData}
        keyExtractor={(item) => item.b.id}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({ length: 110, offset: 110 * index, index })}
        initialNumToRender={6}
        ListFooterComponent={footer}
        style={styles.list}
      />

      <PrestigeModal
        visible={showPrestige}
        onConfirm={(carryOverId) => {
          setShowPrestige(false);
          declareSovereignty(carryOverId);
        }}
        onCancel={() => setShowPrestige(false)}
        onStartChallenge={(challengeId, selectedBuilding) => {
          setShowPrestige(false);
          startChallengeRun(challengeId, selectedBuilding);
        }}
      />
      <AscensionModal
        visible={showAscension}
        onAscend={() => {
          setShowAscension(false);
          executeAscension();
        }}
        onViewShop={() => {
          setShowAscension(false);
          setShowCrownShop(true);
        }}
        onClose={() => setShowAscension(false)}
      />
      <CrownShopSheet
        visible={showCrownShop}
        onClose={() => setShowCrownShop(false)}
      />
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onHardReset={hardReset}
      />
      <SkillTreeSheet
        visible={showSkillTree || inLegacyShop}
        legacyShopMode={inLegacyShop}
        onClose={() => {
          if (!inLegacyShop) setShowSkillTree(false);
        }}
        onStartKingdom={() => {
          startNewKingdom();
          setShowSkillTree(false);
        }}
      />
      <AchievementsModal visible={showAchievements} onClose={() => setShowAchievements(false)} />
      <MilestoneToast />
    </SafeAreaView>
  );
}

function PrestigeFooterButton({ reward, onPress }: { reward: number; onPress: () => void }) {
  const border = useRef(new Animated.Value(2)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(border, { toValue: 3.5, duration: 900, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(border, { toValue: 2, duration: 900, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [border]);

  return (
    <Animated.View style={[styles.prestigeWrap, { borderWidth: border }]}>
      <LinearGradient
        colors={[COLORS.bg5, COLORS.gold5, COLORS.bg5]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <Pressable onPress={onPress} style={styles.prestigeInner} testID="prestige-btn">
        <CrownIcon size={48} />
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={styles.prestigeTitle}>DECLARE SOVEREIGNTY</Text>
          <Text style={styles.prestigeSub}>
            Reset for {formatGold(reward)} Royal Seal{reward === 1 ? "" : "s"}
          </Text>
        </View>
        <ChevronRight color={COLORS.gold4} size={22} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg2 },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: COLORS.bg1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
    gap: 12,
  },
  title: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    fontWeight: "700",
    fontSize: 20,
  },
  headerRule: {
    flex: 1,
    height: 1,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  crownEmoji: {
    color: COLORS.textGold,
    fontSize: 22,
  },
  buyModeRow: {
    flexDirection: "row",
    height: 40,
    backgroundColor: COLORS.bg1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
  },
  modeBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  modeBtnActive: {
    backgroundColor: COLORS.bg4,
    borderBottomColor: COLORS.gold2,
  },
  modeText: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  modeTextActive: {
    color: COLORS.textGold,
  },
  list: { flex: 1, backgroundColor: COLORS.bg2 },
  footerWrap: {
    padding: 16,
    gap: 10,
  },
  prestigeWrap: {
    borderRadius: RADIUS.lg,
    borderColor: COLORS.gold3,
    overflow: "hidden",
  },
  prestigeInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    minHeight: 80,
  },
  prestigeTitle: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 1,
  },
  prestigeSub: {
    color: COLORS.gold3,
    fontFamily: FONTS.serif,
    fontSize: 13,
    marginTop: 3,
  },
  prestigeLocked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.bg5,
    borderStyle: "dashed",
    borderRadius: RADIUS.lg,
    padding: 16,
  },
  lockedTitle: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: "800",
  },
  lockedSub: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontSize: 12,
    marginTop: 2,
  },
});
