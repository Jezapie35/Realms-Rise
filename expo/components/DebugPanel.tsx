import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";

const GOLD_AMOUNTS = [
  { label: "1K",   value: 1_000 },
  { label: "1M",   value: 1_000_000 },
  { label: "1B",   value: 1_000_000_000 },
  { label: "100B", value: 100_000_000_000 },
  { label: "1T",   value: 1_000_000_000_000 },
];

const CROWN_AMOUNTS = [
  { label: "+1",  value: 1 },
  { label: "+5",  value: 5 },
  { label: "+10", value: 10 },
  { label: "+50", value: 50 },
];

const SEAL_AMOUNTS = [
  { label: "+10",  value: 10 },
  { label: "+50",  value: 50 },
  { label: "+100", value: 100 },
  { label: "+500", value: 500 },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function DebugPanel({ visible, onClose }: Props) {
  const { debugAddGold, debugAddCrowns, debugAddSeals, state } = useGame();
  const insets = useSafeAreaInsets();

  const [customGold, setCustomGold] = useState("");
  const [customCrowns, setCustomCrowns] = useState("");
  const [customSeals, setCustomSeals] = useState("");

  function handleCustomGold() {
    const val = parseFloat(customGold.replace(/,/g, ""));
    if (!isNaN(val) && val > 0) { debugAddGold(val); setCustomGold(""); }
  }
  function handleCustomCrowns() {
    const val = parseFloat(customCrowns.replace(/,/g, ""));
    if (!isNaN(val) && val > 0) { debugAddCrowns(val); setCustomCrowns(""); }
  }
  function handleCustomSeals() {
    const val = parseFloat(customSeals.replace(/,/g, ""));
    if (!isNaN(val) && val > 0) { debugAddSeals(val); setCustomSeals(""); }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.panel, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Testing Panel</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>GOLD</Text>
              <Text style={styles.statValueGold}>{state.gold.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>CROWNS</Text>
              <Text style={styles.statValueCrown}>{state.ascension.crowns}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>SEALS</Text>
              <Text style={styles.statValueSeal}>{state.sealsAvailable}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

            {/* ── Gold ── */}
            <Text style={styles.sectionLabel}>Add Gold</Text>
            <View style={styles.quickRow}>
              {GOLD_AMOUNTS.map(({ label, value }) => (
                <Pressable
                  key={label}
                  onPress={() => debugAddGold(value)}
                  style={({ pressed }) => [styles.quickBtn, styles.goldBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.goldBtnText}>+{label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.customRow}>
              <TextInput
                style={styles.input}
                value={customGold}
                onChangeText={setCustomGold}
                placeholder="custom amount"
                placeholderTextColor={COLORS.textDim}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleCustomGold}
              />
              <Pressable onPress={handleCustomGold} style={({ pressed }) => [styles.addBtn, styles.goldAddBtn, pressed && styles.pressed]}>
                <Text style={styles.goldAddBtnText}>Add</Text>
              </Pressable>
            </View>

            {/* ── Crowns ── */}
            <Text style={[styles.sectionLabel, styles.crownLabel]}>Add Crowns</Text>
            <View style={styles.quickRow}>
              {CROWN_AMOUNTS.map(({ label, value }) => (
                <Pressable
                  key={label}
                  onPress={() => debugAddCrowns(value)}
                  style={({ pressed }) => [styles.quickBtn, styles.crownBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.crownBtnText}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.customRow}>
              <TextInput
                style={styles.input}
                value={customCrowns}
                onChangeText={setCustomCrowns}
                placeholder="custom amount"
                placeholderTextColor={COLORS.textDim}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleCustomCrowns}
              />
              <Pressable onPress={handleCustomCrowns} style={({ pressed }) => [styles.addBtn, styles.crownAddBtn, pressed && styles.pressed]}>
                <Text style={styles.crownAddBtnText}>Add</Text>
              </Pressable>
            </View>

            {/* ── Seals ── */}
            <Text style={[styles.sectionLabel, styles.sealLabel]}>Add Royal Seals</Text>
            <View style={styles.quickRow}>
              {SEAL_AMOUNTS.map(({ label, value }) => (
                <Pressable
                  key={label}
                  onPress={() => debugAddSeals(value)}
                  style={({ pressed }) => [styles.quickBtn, styles.sealBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.sealBtnText}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.customRow}>
              <TextInput
                style={styles.input}
                value={customSeals}
                onChangeText={setCustomSeals}
                placeholder="custom amount"
                placeholderTextColor={COLORS.textDim}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={handleCustomSeals}
              />
              <Pressable onPress={handleCustomSeals} style={({ pressed }) => [styles.addBtn, styles.sealAddBtn, pressed && styles.pressed]}>
                <Text style={styles.sealAddBtnText}>Add</Text>
              </Pressable>
            </View>

            <View style={{ height: 8 }} />
          </ScrollView>

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
    maxHeight: "85%",
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
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statChip: {
    flex: 1,
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.md,
    padding: 8,
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.bg5,
  },
  statLabel: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  statValueGold: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 13,
  },
  statValueCrown: {
    color: COLORS.purpleLight,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 13,
  },
  statValueSeal: {
    color: COLORS.gold3,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 13,
  },
  scroll: {
    flexGrow: 0,
  },
  sectionLabel: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 4,
  },
  crownLabel: { color: COLORS.purpleLight },
  sealLabel: { color: COLORS.gold3 },
  quickRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 6,
  },
  quickBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 56,
    backgroundColor: COLORS.bg4,
  },
  // Gold
  goldBtn: { borderColor: "#aa00ff" },
  goldBtnText: { color: "#cc66ff", fontFamily: FONTS.serif, fontWeight: "800", fontSize: 13 },
  // Crown
  crownBtn: { borderColor: COLORS.purple },
  crownBtnText: { color: COLORS.purpleLight, fontFamily: FONTS.serif, fontWeight: "800", fontSize: 13 },
  // Seal
  sealBtn: { borderColor: COLORS.gold4 },
  sealBtnText: { color: COLORS.gold3, fontFamily: FONTS.serif, fontWeight: "800", fontSize: 13 },
  customRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
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
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  goldAddBtn: { backgroundColor: "#2d0050", borderColor: "#aa00ff" },
  goldAddBtnText: { color: "#cc66ff", fontFamily: FONTS.serif, fontWeight: "800", fontSize: 14 },
  crownAddBtn: { backgroundColor: "#1a0030", borderColor: COLORS.purple },
  crownAddBtnText: { color: COLORS.purpleLight, fontFamily: FONTS.serif, fontWeight: "800", fontSize: 14 },
  sealAddBtn: { backgroundColor: COLORS.gold5, borderColor: COLORS.gold4 },
  sealAddBtnText: { color: COLORS.gold3, fontFamily: FONTS.serif, fontWeight: "800", fontSize: 14 },
  pressed: { opacity: 0.6 },
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
