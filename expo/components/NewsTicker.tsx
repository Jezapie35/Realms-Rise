import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";
import { NEWS_MESSAGES } from "@/data/news";

export default function NewsTicker() {
  const [width, setWidth] = useState<number>(0);
  const [idx, setIdx] = useState<number>(() => Math.floor(Math.random() * NEWS_MESSAGES.length));
  const translate = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (width === 0) return;

    const startLoop = () => {
      translate.setValue(width);
      const loop = Animated.loop(
        Animated.timing(translate, {
          toValue: -width,
          duration: 12000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      );
      loopRef.current = loop;
      loop.start();
    };

    startLoop();

    const iv = setInterval(() => {
      loopRef.current?.stop();
      setIdx((i) => (i + 1) % NEWS_MESSAGES.length);
      startLoop();
    }, 12000);

    return () => {
      loopRef.current?.stop();
      clearInterval(iv);
    };
  }, [width]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Animated.Text
        numberOfLines={1}
        shouldRasterizeIOS
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