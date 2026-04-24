import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";
import { NEWS_MESSAGES } from "@/data/news";

export default function NewsTicker() {
  const [width, setWidth] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [idx, setIdx] = useState<number>(() => Math.floor(Math.random() * NEWS_MESSAGES.length));
  const translate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (width === 0 || textWidth === 0) return;

    const totalDistance = width + textWidth;
    const speed = (width * 2) / 12000;
    const duration = totalDistance / speed;

    translate.setValue(width);
    const loop = Animated.loop(
      Animated.timing(translate, {
        toValue: -textWidth,
        duration,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    );
    loop.start();

    const iv = setInterval(() => setIdx((i) => (i + 1) % NEWS_MESSAGES.length), duration + 1000);
    return () => {
      loop.stop();
      clearInterval(iv);
    };
  }, [translate, width, textWidth]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Animated.Text
        numberOfLines={1}
        shouldRasterizeIOS
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
        style={[styles.text, { transform: [{ translateX: translate }] }]}
      >
        {NEWS_MESSAGES[idx]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 28,
    backgroundColor: "#060402",
    borderTopWidth: 1,
    borderTopColor: COLORS.bg5,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 4,
  },
  text: {
    color: COLORS.gold3,
    fontFamily: FONTS.serif,
    fontStyle: "italic",
    fontSize: 14,
  },
});