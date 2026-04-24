import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Palette } from "@/constants/colors";

interface Props {
  size: number;
  tint?: string;
  label?: string;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

export default function IconPlaceholder({ size, tint = Palette.goldMuted, label, borderRadius, style, testID }: Props) {
  const radius = borderRadius ?? Math.max(6, Math.round(size * 0.18));
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, overflow: "hidden" }, style]} testID={testID}>
      <LinearGradient
        colors={[lighten(tint, 0.22), tint, darken(tint, 0.35)]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.fill, { borderRadius: radius }]}
      >
        {label ? (
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              { fontSize: Math.max(8, Math.round(size * 0.11)), paddingHorizontal: 4 },
            ]}
          >
            {label}
          </Text>
        ) : null}
      </LinearGradient>
    </View>
  );
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}
function hexToRgb(h: string): [number, number, number] {
  const s = h.replace("#", "");
  const v = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb(r: number, g: number, b: number): string {
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}
function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgb(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}
function darken(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgb(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#fff8e0",
    fontFamily: "Georgia",
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
