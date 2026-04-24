import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";

interface Props {
  id: number;
  text: string;
  x: number;
  y: number;
  onDone: (id: number) => void;
}

export default function FloatingText({ id, text, x, y, onDone }: Props) {
  const translate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translate, { toValue: -70, duration: 900, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start(() => onDone(id));
  }, [id, onDone, opacity, translate]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { left: x - 50, top: y - 20, opacity, transform: [{ translateY: translate }] },
      ]}
    >
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    width: 100,
    alignItems: "center",
    zIndex: 50,
  },
  text: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 16,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
