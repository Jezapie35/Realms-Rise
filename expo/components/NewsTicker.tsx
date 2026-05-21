import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View, Text } from "react-native";
import { COLORS, FONTS } from "@/constants/colors";
import { NEWS_MESSAGES } from "@/data/news";

export default function NewsTicker() {
  const [width, setWidth] = useState(0);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * NEWS_MESSAGES.length));
  const translate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (width === 0) return;

    const run = (i: number) => {
      translate.setValue(width);
      Animated.timing(translate, {
        toValue: -width * 3,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setTimeout(() => {
            const next = (i + 1) % NEWS_MESSAGES.length;
            setIdx(next);
            run(next);
          }, 500);
        }
      });
    };

    run(idx);

    return () => translate.stopAnimation();
  }, [width]);

  return (
    <View style={styles.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
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