import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { CHALLENGE_BY_ID, TIER_COLORS } from "@/data/challenges";
import { formatNumber } from "@/utils/formatNumber";

export default function ChallengeBanner() {
  const { state } = useGame();
  const active = state.challenges.active;
  if (!active) return null;

  const challenge = CHALLENGE_BY_ID[active];
  if (!challenge) return null;

  const tierColor = TIER_COLORS[challenge.tier] ?? COLORS.gold3;

  function renderStats() {
    switch (active) {
      case "ch_austerity": {
        const gpsThreshold = 100_000_000_000 * 0.01;
        const progress = Math.min(1, state.totalGPS / gpsThreshold);
        const locked = !state.challenges.austerityUnlocked;
        return (
          <View style={styles.statRow}>
            <Text style={[styles.statText, { color: locked ? "#e67b70" : COLORS.greenLight }]}>
              {locked
                ? `GPS needed: ${formatNumber(gpsThreshold)} (${(progress * 100).toFixed(1)}%)`
                : "Upgrades unlocked"}
            </Text>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: locked ? COLORS.red : COLORS.greenLight }]} />
            </View>
          </View>
        );
      }
      case "ch_plague": {
        const pct = (state.challenges.plagueRecovery * 100).toFixed(1);
        return (
          <View style={styles.statRow}>
            <Text style={styles.statText}>GPS: {pct}% recovered</Text>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${state.challenges.plagueRecovery * 100}%`, backgroundColor: COLORS.greenLight }]} />
            </View>
          </View>
        );
      }
      case "ch_entropy": {
        const pct = (state.challenges.entropyDecay * 100).toFixed(1);
        const rate = (state.challenges.entropyDecayRate * 100).toFixed(2);
        const collapsed = state.challenges.entropyCollapsed;
        return (
          <View style={styles.statRow}>
            <Text style={[styles.statText, { color: collapsed ? COLORS.red : COLORS.textPrimary }]}>
              {collapsed ? "COLLAPSED" : `${pct}% remaining — decaying at ${rate}%/min`}
            </Text>
            {!collapsed && (
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${state.challenges.entropyDecay * 100}%`, backgroundColor: "#e67b70" }]} />
              </View>
            )}
          </View>
        );
      }
      case "ch_siege": {
        const intensity = state.challenges.siegeIntensity;
        const drain = ((0.20 + intensity * 0.05) * 100).toFixed(0);
        return (
          <View style={styles.statRow}>
            <Text style={styles.statText}>
              ⚔ Intensity: {intensity}/10  ·  Drain on miss: {drain}%
            </Text>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${(intensity / 10) * 100}%`, backgroundColor: COLORS.red }]} />
            </View>
          </View>
        );
      }
      default:
        return null;
    }
  }

  return (
    <View style={[styles.banner, { borderBottomColor: tierColor, backgroundColor: tierColor + "18" }]}>
      <Text style={[styles.name, { color: tierColor }]}>{challenge.name.toUpperCase()}</Text>
      <Text style={styles.mult}>{challenge.multiplier}× SEALS</Text>
      {renderStats()}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    flexDirection: "column",
    gap: 2,
  },
  name: {
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  mult: {
    color: COLORS.gold2,
    fontFamily: FONTS.system,
    fontSize: 10,
    fontWeight: "700",
    position: "absolute",
    right: 12,
    top: 8,
  },
  statRow: { gap: 2 },
  statText: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 10,
  },
  bar: {
    height: 3,
    backgroundColor: COLORS.bg5,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 1,
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
  },
});
