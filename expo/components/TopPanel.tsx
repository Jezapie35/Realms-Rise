import React, { useCallback, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { formatGold } from "@/utils/formatNumber";
import FloatingText from "./FloatingText";
import GoldenCoin from "./GoldenCoin";
import NewsTicker from "./NewsTicker";
import TapCoin from "./icons/ui/TapCoin";

interface FloatItem {
  id: number;
  text: string;
  x: number;
  y: number;
}

export default function TopPanel() {
  const { state, click, coinVisible, coinPos, collectGoldenCoin, banner } = useGame();
  const [floats, setFloats] = useState<FloatItem[]>([]);
  const floatId = useRef<number>(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bannerAnim = useRef(new Animated.Value(-60)).current;

  React.useEffect(() => {
    if (banner) {
      Animated.spring(bannerAnim, { toValue: 0, useNativeDriver: true, tension: 120, friction: 12 }).start();
    } else {
      Animated.timing(bannerAnim, { toValue: -60, duration: 250, useNativeDriver: true }).start();
    }
  }, [banner, bannerAnim]);

  const handlePress = useCallback(
    (evt: { nativeEvent: { locationX: number; locationY: number } }) => {
      click();
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true, tension: 300, friction: 10 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
      ]).start();
      floatId.current += 1;
      const id = floatId.current;
      const x = evt.nativeEvent.locationX;
      const y = evt.nativeEvent.locationY + 120;
      setFloats((f) => [...f, { id, text: `+${formatGold(state.goldPerClick)} gold`, x, y }]);
    },
    [click, state.goldPerClick, scaleAnim],
  );

  const removeFloat = useCallback((id: number) => {
    setFloats((f) => f.filter((x) => x.id !== id));
  }, []);

  const gpsBoosted = !!state.activeBonus && state.activeBonus.type === "gps_boost";
  const clickBoosted = !!state.activeBonus && state.activeBonus.type === "click_boost";

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={[COLORS.bg1, COLORS.bg2]} style={StyleSheet.absoluteFill} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>GOLD</Text>
          <View style={styles.statRow}>
            <ExpoImage source={require('@/assets/images/coin.png')} style={styles.coinIcon} contentFit="contain" transition={0} cachePolicy="memory-disk" />
            <Text style={styles.statValue}>{formatGold(state.gold)}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>PER SECOND</Text>
          <Text style={[styles.statValue2, gpsBoosted && styles.boosted]}>
            {formatGold(state.totalGPS)}
            {gpsBoosted ? " ×" : ""}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>PER CLICK</Text>
          <Text style={[styles.statValue2, clickBoosted && styles.boosted]}>
            {formatGold(state.goldPerClick)}
            {clickBoosted ? " ×" : ""}
          </Text>
        </View>
      </View>

      {/* Click button zone */}
      <View style={styles.clickZone}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable onPress={handlePress} style={styles.clickBtn} testID="click-btn">
            <TapCoin size={160} />
          </Pressable>
        </Animated.View>
        {floats.map((f) => (
          <FloatingText key={f.id} id={f.id} text={f.text} x={f.x} y={f.y} onDone={removeFloat} />
        ))}
        {coinVisible && <GoldenCoin x={coinPos.x} y={coinPos.y} onCollect={collectGoldenCoin} />}
      </View>

      <NewsTicker />

      {banner && (
        <Animated.View style={[styles.banner, { transform: [{ translateY: bannerAnim }] }]} pointerEvents="none">
          <Text style={styles.bannerText}>{banner.text}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.bg1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
    overflow: "hidden",
  },
  statsRow: {
    flexDirection: "row",
    height: 48,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statLabel: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "700",
    marginBottom: 2,
  },
  statValue: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 17,
    fontWeight: "700",
  },
  statValue2: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: "600",
  },
  boosted: {
    color: COLORS.gold2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.bg5,
  },
  clickZone: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  clickBtn: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  coinIcon: {
    width: 16,
    height: 16,
  },
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: COLORS.gold5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold3,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  bannerText: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: "700",
  },
});
