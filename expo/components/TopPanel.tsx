import React, { useCallback, useRef, useState } from "react";
import { Animated, Image, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, SHADOWS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { formatGold } from "@/utils/formatNumber";
import FloatingText from "./FloatingText";
import GoldenCoin from "./GoldenCoin";
import NewsTicker from "./NewsTicker";
import IconPlaceholder from "./IconPlaceholder";

interface FloatItem {
  id: number;
  text: string;
  x: number;
  y: number;
}

export default function TopPanel() {
  const { state, click, coinVisible, coinPos, collectGoldenCoin, banner } = useGame();
  const [floats, setFloats] = useState<FloatItem[]>([]);
  const [panelHeight, setPanelHeight] = useState<number>(280);
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

  const onLayout = (e: LayoutChangeEvent) => setPanelHeight(e.nativeEvent.layout.height);

  const gpsBoosted = !!state.activeBonus && state.activeBonus.type === "gps_boost";
  const clickBoosted = !!state.activeBonus && state.activeBonus.type === "click_boost";

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <LinearGradient colors={[COLORS.bg1, COLORS.bg2]} style={StyleSheet.absoluteFill} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>GOLD</Text>
          <View style={styles.statRow}>
            <View style={styles.sealDot} />
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
        {/* Decorative corners */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable onPress={handlePress} style={styles.clickBtn} testID="click-btn">
            <IconPlaceholder size={120} tint={COLORS.gold3} borderRadius={60} />
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
      {void panelHeight}
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
  sealDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.red,
    borderWidth: 1,
    borderColor: COLORS.gold3,
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
    borderRadius: 80,
    borderWidth: 3,
    borderColor: COLORS.gold3,
    backgroundColor: COLORS.bg3,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.goldGlow,
  },
  corner: {
    position: "absolute",
    width: 14,
    height: 14,
    borderColor: COLORS.gold4,
  },
  cornerTL: { top: 20, left: "50%", marginLeft: -110, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 20, right: "50%", marginRight: -110, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 20, left: "50%", marginLeft: -110, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 20, right: "50%", marginRight: -110, borderBottomWidth: 2, borderRightWidth: 2 },
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
void Image;
