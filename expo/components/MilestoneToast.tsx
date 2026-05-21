import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Scroll, Star, Trophy, Zap } from "lucide-react-native";
import { COLORS, FONTS, RADIUS, SHADOWS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";

export default function MilestoneToast() {
  const { toasts } = useGame();

  return (
    <View style={styles.wrap} pointerEvents="none">
      {toasts.map((t) => (
        <ToastCard key={t.id} title={t.title} desc={t.desc} kind={t.kind} />
      ))}
    </View>
  );
}

interface CardProps {
  title: string;
  desc: string;
  kind: "milestone" | "info" | "success" | "bonus";
}

function ToastCard({ title, desc, kind }: CardProps) {
  const tx = useRef(new Animated.Value(280)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(tx, {
        toValue: 0,
        useNativeDriver: true,
        tension: 130,
        friction: 16,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [tx, opacity]);

  const borderColor =
    kind === "milestone" ? COLORS.gold2
    : kind === "success"  ? COLORS.greenLight
    : kind === "bonus"    ? "#a855f7"
    : COLORS.gold4;

  const Icon =
    kind === "milestone" ? Trophy
    : kind === "success"  ? Star
    : kind === "bonus"    ? Zap
    : Scroll;

  const iconColor =
    kind === "milestone" ? COLORS.gold2
    : kind === "success"  ? COLORS.greenLight
    : kind === "bonus"    ? "#c084fc"
    : COLORS.gold3;

  return (
    <Animated.View
      style={[
        styles.card,
        { borderLeftColor: borderColor, opacity, transform: [{ translateX: tx }] },
      ]}
    >
      <View style={styles.row}>
        <Icon color={iconColor} size={14} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={styles.desc} numberOfLines={2}>
        {desc}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 12,
    bottom: 96,
    width: 230,
    gap: 6,
    zIndex: 200,
    flexDirection: "column",
  },
  card: {
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.lg,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    ...SHADOWS.cardLift,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 12,
    flex: 1,
  },
  desc: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontStyle: "italic",
    fontSize: 10,
    lineHeight: 14,
  },
});
