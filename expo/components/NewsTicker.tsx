import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View, Text } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";
import { NEWS_MESSAGES } from "@/data/news";

export default function NewsTicker() {
  const [width, setWidth] = useState(0);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * NEWS_MESSAGES.length));
  const [textWidth, setTextWidth] = useState(0);
  const nextTextWidthRef = useRef(0);
  const translate = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const nextIdx = (idx + 1) % NEWS_MESSAGES.length;

  useEffect(() => {
    if (width === 0 || textWidth === 0) return;

    animRef.current?.stop();
    translate.setValue(width);

    const duration = ((width + textWidth) / 100) * 1000;

    const anim = Animated.timing(translate, {
      toValue: -textWidth,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    animRef.current = anim;

    anim.start(({ finished }) => {
      if (finished) {
        // use pre-measured next width, skip the measurement delay
        const nextWidth = nextTextWidthRef.current;
        setIdx(nextIdx);
        if (nextWidth > 0) setTextWidth(nextWidth);
      }
    });

    return () => anim.stop();
  }, [width, textWidth]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {/* Measure current message */}
      <Text
        key={idx}
        style={[styles.text, { position: "absolute", opacity: 0, width: 9999 }]}
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
      >
        {NEWS_MESSAGES[idx]}
      </Text>
      {/* Pre-measure NEXT message in background */}
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