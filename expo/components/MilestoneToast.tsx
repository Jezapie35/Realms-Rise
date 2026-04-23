import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Scroll } from "lucide-react-native";
import { COLORS, FONTS, RADIUS, SHADOWS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";

export default function MilestoneToast() {
  const { toasts } = useGame();

  return (
    <View style={styles.wrap} pointerEvents="none">
      {toasts.map((t, idx) => (
        <ToastCard key={t.id} title={t.title} desc={t.desc} index={idx} kind={t.kind} />
      ))}
    </View>
  );
}

interface CardProps {
  title: string;
  desc: string;
  index: number;
  kind: "milestone" | "info" | "success" | "bonus";
}

function ToastCard({ title, desc, index, kind }: CardProps) {
  const tx = useRef(new Animated.Value(260)).current;

  useEffect(() => {
    Animated.spring(tx, {
      toValue: 0,
      useNativeDriver: true,
      tension: 120,
      friction: 14,
    }).start();
  }, [tx]);

  const borderColor =
    kind === "success" ? COLORS.greenLight : kind === "milestone" ? COLORS.gold3 : COLORS.gold4;

  return (
    <Animated.View
      style={[
        styles.card,
        { borderLeftColor: borderColor },
        { transform: [{ translateX: tx }, { translateY: -index * 68 }] },
      ]}
    >
      <View style={styles.row}>
        <Scroll color={COLORS.gold2} size={16} />
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
    bottom: 90,
    width: 220,
    gap: 8,
    zIndex: 100,
  },
  card: {
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.lg,
    paddingVertical: 10,
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
    fontSize: 13,
    flex: 1,
  },
  desc: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontStyle: "italic",
    fontSize: 11,
  },
});
