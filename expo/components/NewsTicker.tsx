import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View, Text } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";
import { NEWS_MESSAGES } from "@/data/news";

export default function NewsTicker() {
  const [width, setWidth] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [idx, setIdx] = useState<number>(() => Math.floor(Math.random() * NEWS_MESSAGES.length));
  const translate = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const widthRef = useRef<number>(0);

  const startAnimation = useCallback((containerWidth: number, msgWidth: number) => {
    animRef.current?.stop();
    const totalDistance = containerWidth + msgWidth;
    const speed = 100;
    const duration = (totalDistance / speed) * 1000;

    translate.setValue(containerWidth + 20);
    const anim = Animated.timing(translate, {
      toValue: -msgWidth,
      duration,
      useNativeDriver: true,
      easing: Easing.linear,
    });
    animRef.current = anim;
    anim.start(({ finished }) => {
      if (finished) {
        setIdx((i) => (i + 1) % NEWS_MESSAGES.length);
      }
    });
  }, [translate]);

  useEffect(() => { widthRef.current = width; }, [width]);

  const onTextLayout = useCallback((e: LayoutChangeEvent) => {
    const measured = e.nativeEvent.layout.width;
    setTextWidth(measured);
    if (widthRef.current > 0) {
      startAnimation(widthRef.current, measured);
    }
  }, [startAnimation]);

  useEffect(() => {
    if (width > 0 && textWidth > 0) {
      startAnimation(width, textWidth);
    }
  }, [width]);

  useEffect(() => {
    return () => { animRef.current?.stop(); };
  }, []);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Text
        numberOfLines={1}
        style={[styles.text, { position: "absolute", opacity: 0, width: 9999 }]}
        onLayout={onTextLayout}
      >
        {NEWS_MESSAGES[idx]}
      </Text>
      <Animated.Text
        shouldRasterizeIOS
        style={[styles.text, { width: 9999, transform: [{ translateX: translate }] }]}
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