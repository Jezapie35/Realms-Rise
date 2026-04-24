import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";

interface Props {
  x: number;
  y: number;
  onCollect: () => void;
}

export default function GoldenCoin({ x, y, onCollect }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 350, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulse, { toValue: 1, duration: 350, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ]),
    ).start();
    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.linear }),
    ).start();
  }, [pulse, rot]);

  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View style={[styles.wrap, { left: x, top: y, transform: [{ scale: pulse }] }]} pointerEvents="box-none">
      <Pressable onPress={onCollect} testID="golden-coin">
        <Animated.View style={[styles.coin, { transform: [{ rotate: spin }] }]}>
          <View style={styles.inner}>
            <Text style={styles.glyph}>✦</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    width: 48,
    height: 48,
    zIndex: 40,
  },
  coin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gold2,
    borderWidth: 2,
    borderColor: COLORS.gold1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.gold2,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  inner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.gold1,
  },
  glyph: {
    color: COLORS.bg1,
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: "900",
  },
});
