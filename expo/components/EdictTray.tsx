import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "@/constants/colors";
import { useGame } from "@/context/GameContext";
import { EDICT_BY_ID } from "@/data/challenges";

export default function EdictTray() {
  const { state, useEdict } = useGame();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const edicts = state.challenges.edicts;
  if (!edicts || edicts.length === 0) return null;

  const selectedEdict = selectedIndex !== null ? EDICT_BY_ID[edicts[selectedIndex]] : null;

  function handleUse() {
    if (selectedIndex === null || !selectedEdict) return;
    useEdict(selectedEdict.id);
    setSelectedIndex(null);
  }

  return (
    <>
      <View style={styles.tray}>
        <Text style={styles.trayLabel}>EDICTS</Text>
        <View style={styles.icons}>
          {edicts.map((id, i) => {
            const edict = EDICT_BY_ID[id];
            if (!edict) return null;
            const sel = selectedIndex === i;
            return (
              <Pressable
                key={`${id}-${i}`}
                onPress={() => setSelectedIndex(sel ? null : i)}
                style={[styles.edictIcon, sel && styles.edictIconSel]}
              >
                <Text style={styles.edictEmoji}>{edict.icon}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedEdict && selectedIndex !== null && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setSelectedIndex(null)}>
          <Pressable style={styles.backdrop} onPress={() => setSelectedIndex(null)}>
            <Pressable style={styles.popup} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.popupIcon}>{selectedEdict.icon}</Text>
              <Text style={styles.popupName}>{selectedEdict.name}</Text>
              <Text style={styles.popupDesc}>{selectedEdict.description}</Text>
              <Pressable onPress={handleUse} style={styles.useBtn}>
                <Text style={styles.useBtnText}>USE EDICT</Text>
              </Pressable>
              <Pressable onPress={() => setSelectedIndex(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tray: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.bg3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bg5,
    gap: 8,
  },
  trayLabel: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  icons: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  edictIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg4,
    borderWidth: 1,
    borderColor: COLORS.bg5,
    alignItems: "center",
    justifyContent: "center",
  },
  edictIconSel: {
    borderColor: COLORS.gold3,
    backgroundColor: COLORS.bg5,
  },
  edictEmoji: {
    fontSize: 18,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  popup: {
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.xl,
    padding: 24,
    width: 280,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.gold4,
  },
  popupIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  popupName: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
  },
  popupDesc: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 2,
  },
  useBtn: {
    marginTop: 10,
    width: "100%",
    backgroundColor: COLORS.gold4,
    borderRadius: RADIUS.lg,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.gold2,
  },
  useBtnText: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 2,
  },
  cancelBtn: {
    width: "100%",
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 13,
  },
});
