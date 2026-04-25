import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View, Text } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";
import { NEWS_MESSAGES } from "@/data/news";

export default function NewsTicker() {
  const [width, setWidth] = useState(0);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * NEWS_MESSAGES.length));
  const nextTextWidthRef = useRef(0);
  const translate = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const widthRef = useRef(0);
  const idxRef = useRef(idx);

  const nextIdx = (idx + 1) % NEWS_MESSAGES.length;

  const startAnimation = (containerWidth: number, msgWidth: number, currentIdx: number) => {
    animRef.current?.stop();
    translate.setValue(containerWidth);

    const duration = ((containerWidth + msgWidth) / 100) * 1000;

    const anim = Animated.timing(translate, {
      toValue: -msgWidth,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    animRef.current = anim;

    anim.start(({ finished }) => {
      if (finished) {
        setTimeout(() => {
          const next = (currentIdx + 1) % NEWS_MESSAGES.length;
          idxRef.current = next;
          setIdx(next);
          // start next animation immediately using pre-measured width
          startAnimation(widthRef.current, nextTextWidthRef.current, next);
        }, 1000);
      }
    });
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    widthRef.current = w;
    setWidth(w);
  };

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {/* Measure current */}
      <Text
        key={idx}
        style={[styles.text, { position: "absolute", opacity: 0, width: 9999 }]}
        onLayout={(e) => {
          const measured = e.nativeEvent.layout.width;
          if (widthRef.current > 0 && measured > 0) {
            startAnimation(widthRef.current, measured, idxRef.current);
          }
        }}
      >
        {NEWS_MESSAGES[idx]}
      </Text>
      {/* Pre-measure next */}
      <Text
        key={`next-${nextIdx}`}
        style={[styles.text, { position: "absolute", opacity: 0, width: 9999 }]}
        onLayout={(e) => { nextTextWidthRef.current = e.nativeEvent.layout.width; }}
      >
        {NEWS_MESSAGES[nextIdx]}
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