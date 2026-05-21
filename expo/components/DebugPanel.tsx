import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";

const QUICK_AMOUNTS = [
  { label: "1K", value: 1_000 },
  { label: "1M", value: 1_000_000 },
  { label: "1B", value: 1_000_000_000 },
  { label: "100B", value: 100_000_000_000 },
  { label: "1T", value: 1_000_000_000_000 },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function DebugPanel({ visible, onClose }: Props) {
  const { debugAddGold, state } = useGame();
  const insets = useSafeAreaInsets();
  const [custom, setCustom] = useState("");

  const handleCustom = () => {
    const val = parseFloat(custom.replace(/,/g, ""));
    if (!isNaN(val) && val > 0) {
      debugAddGold(val);
      setCustom("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.panel, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Testing Panel</Text>
          <Text style={styles.subtitle}>
            Current gold: <Text style={styles.gold}>{state.gold.toLocaleString()}</Text>
          </Text>

          <Text style={styles.label}>Quick Add Gold</Text>
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map(({ label, value }) => (
              <Pressable
                key={label}
                onPress={() => debugAddGold(value)}
                style={({ pressed }) => [styles.quickBtn, pressed && styles.pressed]}
              >
                <Text style={styles.quickBtnText}>+{label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Custom Amount</Text>
          <View style={styles.customRow}>
            <TextInput
              style={styles.input}
              value={custom}
              onChangeText={setCustom}
              placeholder="e.g. 500000"
              placeholderTextColor={COLORS.textDim}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleCustom}
            />
            <Pressable
              onPress={handleCustom}
              style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  panel: {
    backgroundColor: COLORS.bg2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#aa00ff",
    borderBottomWidth: 0,
    padding: 20,
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.bg5,
    alignSelf: "center",
    marginBottom: 4,
  },
  title: {
    color: "#cc66ff",
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 20,
    fontStyle: "italic",
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 12,
    textAlign: "center",
  },
  gold: {
    color: COLORS.textGold,
    fontWeight: "700",
  },
  label: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 4,
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  quickBtn: {
    flex: 1,
    backgroundColor: COLORS.bg4,
    borderWidth: 1,
    borderColor: "#aa00ff",
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 56,
  },
  quickBtnText: {
    color: "#cc66ff",
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 13,
  },
  customRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bg4,
    borderWidth: 1,
    borderColor: COLORS.bg5,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontFamily: FONTS.system,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: "#2d0050",
    borderWidth: 1,
    borderColor: "#aa00ff",
    borderRadius: RADIUS.md,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  addBtnText: {
    color: "#cc66ff",
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.6,
  },
  closeBtn: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 4,
  },
  closeBtnText: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontSize: 14,
  },
});
