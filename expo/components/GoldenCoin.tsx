import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";
import TapCoin from "@/components/icons/ui/TapCoin";

interface Props {
  x: number;
  y: number;
  onCollect: () => void;
}

export default function GoldenCoin({ x, y, onCollect }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 380, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulse, { toValue: 1,    duration: 380, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <Animated.View style={[styles.wrap, { left: x, top: y, transform: [{ scale: pulse }] }]} pointerEvents="box-none">
      <Pressable onPress={onCollect} testID="golden-coin">
        <TapCoin size={64} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    width: 64,
    height: 64,
    zIndex: 40,
  },
});
