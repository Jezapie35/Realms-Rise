import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RotateCcw } from "lucide-react-native";
import { COLORS, FONTS, RADIUS } from "@/constants/colors";
import { HapticStrength, useSettings } from "@/context/SettingsContext";
import {
  isRemoveAdsPurchased,
  purchaseRemoveAds,
  restorePurchases,
} from "@/services/monetisation";

interface Props {
  visible: boolean;
  onClose: () => void;
  onHardReset: () => void | Promise<void>;
}

const STRENGTHS: { id: HapticStrength; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "light", label: "Light" },
  { id: "medium", label: "Medium" },
  { id: "heavy", label: "Heavy" },
];

const EVENTS: { id: "click" | "purchase" | "skill"; label: string; desc: string }[] = [
  { id: "click", label: "Tap to Earn", desc: "Vibrate when you tap the castle" },
  { id: "purchase", label: "Purchases", desc: "Vibrate when buying buildings or upgrades" },
  { id: "skill", label: "Skill Unlocks", desc: "Vibrate when unlocking a skill node" },
];

export default function SettingsModal({ visible, onClose, onHardReset }: Props) {
  const [confirm, setConfirm] = useState<number>(0);
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [iapLoading, setIapLoading] = useState(false);
  const { settings, setStrength, toggleEvent, setHideAcquiredAchievements } = useSettings();

  useEffect(() => {
    if (visible) {
      isRemoveAdsPurchased().then(setAdsRemoved);
    }
  }, [visible]);

  const handleBuyRemoveAds = useCallback(async () => {
    setIapLoading(true);
    try {
      const purchased = await purchaseRemoveAds();
      if (purchased) {
        setAdsRemoved(true);
        Alert.alert("Thank you!", "Ads removed. Claim ×2 Gold anytime, for free.");
      }
    } catch (err: any) {
      Alert.alert("Purchase Failed", err?.message ?? "Please try again.");
    } finally {
      setIapLoading(false);
    }
  }, []);

  const handleRestore = useCallback(async () => {
    setIapLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        setAdsRemoved(true);
        Alert.alert("Restored!", "Remove Ads has been restored.");
      } else {
        Alert.alert("Nothing to Restore", "No eligible purchases found.");
      }
    } catch (err: any) {
      Alert.alert("Restore Failed", err?.message ?? "Please try again.");
    } finally {
      setIapLoading(false);
    }
  }, []);

  const handleReset = async () => {
    if (confirm < 1) { setConfirm(1); return; }
    if (confirm < 2) { setConfirm(2); return; }
    await onHardReset();
    setConfirm(0);
    onClose();
  };

  const close = () => {
    setConfirm(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.card} onPress={() => {}}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.divider} />

            {/* Haptics */}
            <Text style={styles.sectionTitle}>Haptics</Text>
            <Text style={styles.sectionHint}>Control vibration feedback. Not available on web.</Text>
            <Text style={styles.subLabel}>Strength</Text>
            <View style={styles.segments}>
              {STRENGTHS.map((s) => {
                const active = settings.strength === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setStrength(s.id)}
                    style={[styles.segment, active && styles.segmentActive]}
                    testID={`haptic-strength-${s.id}`}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.subLabel}>Vibrate on</Text>
            <View style={styles.eventList}>
              {EVENTS.map((e) => {
                const enabled = settings.events[e.id] && settings.strength !== "off";
                return (
                  <Pressable
                    key={e.id}
                    onPress={() => toggleEvent(e.id)}
                    style={styles.eventRow}
                    disabled={settings.strength === "off"}
                    testID={`haptic-event-${e.id}`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.eventLabel, settings.strength === "off" && styles.eventDim]}>
                        {e.label}
                      </Text>
                      <Text style={styles.eventDesc}>{e.desc}</Text>
                    </View>
                    <View style={[styles.toggle, enabled && styles.toggleOn]}>
                      <View style={[styles.toggleKnob, enabled && styles.toggleKnobOn]} />
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* Store */}
            <Text style={styles.sectionTitle}>Store</Text>
            {adsRemoved ? (
              <View style={styles.storeRow}>
                <Text style={[styles.storeLabel, { color: COLORS.greenLight }]}>✓ Ads Removed</Text>
                <Text style={styles.storeSub}>Thank you for your support!</Text>
              </View>
            ) : (
              <View style={styles.storeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storeLabel}>Remove Ads — $2.99</Text>
                  <Text style={styles.storeSub}>Watch ad button becomes free. No ads ever.</Text>
                </View>
                {iapLoading ? (
                  <ActivityIndicator size="small" color={COLORS.gold2} />
                ) : (
                  <Pressable
                    onPress={handleBuyRemoveAds}
                    style={({ pressed }) => [styles.storeBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.storeBtnText}>Buy</Text>
                  </Pressable>
                )}
              </View>
            )}
            {!adsRemoved && (
              <Pressable
                onPress={handleRestore}
                disabled={iapLoading}
                style={({ pressed }) => [styles.restoreRow, pressed && { opacity: 0.7 }]}
              >
                <RotateCcw size={11} color={COLORS.textDim} />
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </Pressable>
            )}

            <View style={styles.divider} />

            {/* Achievements */}
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Pressable
              onPress={() => setHideAcquiredAchievements(!settings.hideAcquiredAchievements)}
              style={styles.eventRow}
              testID="hide-acquired-toggle"
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.eventLabel}>Hide Acquired</Text>
                <Text style={styles.eventDesc}>Only show locked achievements in the list</Text>
              </View>
              <View style={[styles.toggle, settings.hideAcquiredAchievements && styles.toggleOn]}>
                <View style={[styles.toggleKnob, settings.hideAcquiredAchievements && styles.toggleKnobOn]} />
              </View>
            </Pressable>

            <View style={styles.divider} />

            {/* Save Data */}
            <Text style={styles.sectionTitle}>Save Data</Text>
            <Text style={styles.body}>
              Realm&apos;s Rise saves automatically every 30 seconds and when the app is backgrounded.
            </Text>
            <Pressable
              onPress={handleReset}
              style={[styles.resetBtn, confirm > 0 && styles.resetBtnWarn]}
              testID="hard-reset"
            >
              <Text style={[styles.resetBtnText, confirm > 0 && styles.resetBtnTextWarn]}>
                {confirm === 0
                  ? "Hard Reset"
                  : confirm === 1
                  ? "Tap again to confirm"
                  : "Tap once more to wipe kingdom"}
              </Text>
            </Pressable>

            <Pressable onPress={close} style={styles.closeBtn} testID="settings-close">
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
    backgroundColor: COLORS.bg3,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gold4,
    overflow: "hidden",
  },
  scroll: {
    padding: 20,
    gap: 10,
  },
  title: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 22,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.bg5,
    marginVertical: 6,
  },
  sectionTitle: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  sectionHint: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 12,
    fontStyle: "italic",
  },
  subLabel: {
    color: COLORS.textSub,
    fontFamily: FONTS.system,
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 8,
    textTransform: "uppercase",
  },
  segments: { flexDirection: "row", gap: 6 },
  segment: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.bg5,
    alignItems: "center",
  },
  segmentActive: { backgroundColor: COLORS.gold5, borderColor: COLORS.gold3 },
  segmentText: { color: COLORS.textSub, fontFamily: FONTS.serif, fontSize: 13, fontWeight: "600" },
  segmentTextActive: { color: COLORS.textGold },
  eventList: { gap: 8 },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.bg5,
    padding: 12,
    gap: 12,
  },
  eventLabel: { color: COLORS.textPrimary, fontFamily: FONTS.serif, fontSize: 14, fontWeight: "600" },
  eventDim: { color: COLORS.textDim },
  eventDesc: { color: COLORS.textDim, fontFamily: FONTS.system, fontSize: 11, marginTop: 2 },
  toggle: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: COLORS.bg5, padding: 2, justifyContent: "center",
  },
  toggleOn: { backgroundColor: COLORS.gold3 },
  toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.textDim },
  toggleKnobOn: { backgroundColor: COLORS.bg1, transform: [{ translateX: 18 }] },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.bg5,
    padding: 12,
    gap: 12,
  },
  storeLabel: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: "700",
  },
  storeSub: {
    color: COLORS.textDim,
    fontFamily: FONTS.system,
    fontSize: 11,
    marginTop: 2,
  },
  storeBtn: {
    backgroundColor: COLORS.gold5,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.gold3,
  },
  storeBtnText: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: "800",
    fontSize: 13,
  },
  restoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  restoreText: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontSize: 12,
  },
  body: { color: COLORS.textSub, fontFamily: FONTS.system, fontSize: 13, lineHeight: 18 },
  resetBtn: {
    marginTop: 6,
    backgroundColor: COLORS.bg4,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  resetBtnWarn: { backgroundColor: COLORS.redDark },
  resetBtnText: { color: COLORS.redLight, fontFamily: FONTS.serif, fontWeight: "700", fontSize: 14 },
  resetBtnTextWarn: { color: "#ffdede" },
  closeBtn: { marginTop: 4, alignItems: "center", paddingVertical: 10 },
  closeBtnText: { color: COLORS.textPrimary, fontFamily: FONTS.serif, fontSize: 14 },
});
