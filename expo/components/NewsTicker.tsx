import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View, Text } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";
import { NEWS_MESSAGES } from "@/data/news";

export default function NewsTicker() {
  const [width, setWidth] = useState<number>(0);
  const [idx, setIdx] = useState<number>(() => Math.floor(Math.random() * NEWS_MESSAGES.length));
  const translate = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const widthRef = useRef<number>(0);
  const idxRef = useRef<number>(idx);

  const startAnimation = (containerWidth: number, msgWidth: number) => {
    if (containerWidth === 0 || msgWidth === 0) return;
    animRef.current?.stop();

    const totalDistance = containerWidth + msgWidth;
    const duration = (totalDistance / 100) * 1000;

    translate.setValue(containerWidth);
    animRef.current = Animated.timing(translate, {
      toValue: -msgWidth,
      duration,
      useNativeDriver: true,
      easing: Easing.linear,
    });

    animRef.current.start(({ finished }) => {
      if (finished) {
        idxRef.current = (idxRef.current + 1) % NEWS_MESSAGES.length;
        setIdx(idxRef.current);
      }
    });
  };

  useEffect(() => {
    if (width > 0) {
      widthRef.current = width;
    }
  }, [width]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
    widthRef.current = e.nativeEvent.layout.width;
  };

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Text
        key={`measure-${idx}`}
        style={[styles.text, { position: "absolute", opacity: 0, width: 9999 }]}
        onLayout={(e) => startAnimation(widthRef.current, e.nativeEvent.layout.width)}
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