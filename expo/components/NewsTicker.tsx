import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View, Text } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";
import { NEWS_MESSAGES } from "@/data/news";

export default function NewsTicker() {
  const [width, setWidth] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [idx, setIdx] = useState<number>(() => Math.floor(Math.random() * NEWS_MESSAGES.length));
  const translate = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnimation = (containerWidth: number, msgWidth: number) => {
    loopRef.current?.stop();
    if (ivRef.current) clearInterval(ivRef.current);

    const totalDistance = containerWidth + msgWidth;
    const speed = 80;
    const duration = (totalDistance / speed) * 1000;

    translate.setValue(containerWidth);
    const loop = Animated.loop(
      Animated.timing(translate, {
        toValue: -msgWidth,
        duration,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    );
    loopRef.current = loop;
    loop.start();

    ivRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % NEWS_MESSAGES.length);
    }, duration);
  };

  // Only fires when textWidth changes (i.e. after new message is measured)
  useEffect(() => {
    if (width === 0 || textWidth === 0) return;
    startAnimation(width, textWidth);
  }, [textWidth, width]);

  useEffect(() => {
    return () => {
      loopRef.current?.stop();
      if (ivRef.current) clearInterval(ivRef.current);
    };
  }, []);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {/* Invisible text to measure width before animating */}
      <Text
        numberOfLines={1}
        style={[styles.text, { position: "absolute", opacity: 0 }]}
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
      >
        {NEWS_MESSAGES[idx]}
      </Text>
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