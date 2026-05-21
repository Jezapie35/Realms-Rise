import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gift, Play, RotateCcw } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, SHADOWS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import {
  AD_BONUS_DURATION_MS,
  getAdCooldownEnd,
  isRemoveAdsPurchased,
  purchaseRemoveAds,
  restorePurchases,
  REWARDED_AD_UNIT_ID,
  setAdCooldownEnd,
  showRewardedAd,
} from '@/services/monetisation';

function formatCooldown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function WatchAdButton() {
  const { applyAdBonus } = useGame();

  const [adsRemoved, setAdsRemoved] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([isRemoveAdsPurchased(), getAdCooldownEnd()]).then(([purchased, end]) => {
      setAdsRemoved(purchased);
      setCooldownEnd(end);
    });
  }, []);

  const onCooldown = cooldownEnd > now;

  // Tick countdown only while cooldown is active
  useEffect(() => {
    if (!onCooldown) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [onCooldown]);

  const grantBonus = useCallback(async () => {
    const end = Date.now() + AD_BONUS_DURATION_MS;
    await setAdCooldownEnd(end);
    setCooldownEnd(end);
    applyAdBonus();
  }, [applyAdBonus]);

  const handleWatchAd = useCallback(async () => {
    if (loading || onCooldown) return;
    setLoading(true);
    try {
      if (adsRemoved) {
        await grantBonus();
      } else {
        await showRewardedAd(REWARDED_AD_UNIT_ID);
        await grantBonus();
      }
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (!msg.includes('closed without earning reward')) {
        Alert.alert('Ad Unavailable', msg || 'Try again shortly.');
      }
    } finally {
      setLoading(false);
    }
  }, [loading, onCooldown, adsRemoved, grantBonus]);

  const handleBuyRemoveAds = useCallback(async () => {
    setLoading(true);
    try {
      const purchased = await purchaseRemoveAds();
      if (purchased) {
        setAdsRemoved(true);
        Alert.alert('Thank you!', 'Ads removed. Claim ×2 Gold anytime, for free.');
      }
    } catch (err: any) {
      Alert.alert('Purchase Failed', err?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRestore = useCallback(async () => {
    setLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        setAdsRemoved(true);
        Alert.alert('Restored!', 'Remove Ads has been restored.');
      } else {
        Alert.alert('Nothing to Restore', 'No eligible purchases found.');
      }
    } catch (err: any) {
      Alert.alert('Restore Failed', err?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const disabled = loading || onCooldown;
  const remainingMs = cooldownEnd - now;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={handleWatchAd}
        disabled={disabled}
        style={[styles.btn, disabled && styles.btnDisabled]}
        testID="watch-ad-btn"
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.gold2} />
        ) : onCooldown ? (
          <>
            <Gift size={18} color={COLORS.textDim} />
            <View style={styles.textBlock}>
              <Text style={[styles.title, styles.dim]}>×2 Gold Active</Text>
              <Text style={[styles.sub, styles.dim]}>Ready in {formatCooldown(remainingMs)}</Text>
            </View>
          </>
        ) : (
          <>
            {adsRemoved
              ? <Gift size={18} color={COLORS.gold2} />
              : <Play size={18} color={COLORS.gold2} fill={COLORS.gold2} />
            }
            <View style={styles.textBlock}>
              <Text style={styles.title}>
                {adsRemoved ? 'Claim ×2 Gold (2hrs)' : 'Watch Ad · ×2 Gold (2hrs)'}
              </Text>
              <Text style={styles.sub}>Boosts gold income across your realm</Text>
            </View>
          </>
        )}
      </Pressable>

      {adsRemoved ? (
        <Text style={styles.noAdsLabel}>✓ No Ads</Text>
      ) : (
        <View style={styles.iapRow}>
          <Pressable onPress={handleBuyRemoveAds} disabled={loading} style={styles.iapBtn}>
            <Text style={styles.iapText}>Remove Ads — $2.99</Text>
          </Pressable>
          <Text style={styles.dot}>·</Text>
          <Pressable onPress={handleRestore} disabled={loading} style={styles.iapBtn}>
            <RotateCcw size={11} color={COLORS.textDim} />
            <Text style={styles.iapText}>Restore</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.bg3,
    borderWidth: 1,
    borderColor: COLORS.gold5,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
    ...SHADOWS.goldGlow,
  },
  btnDisabled: {
    borderColor: COLORS.bg5,
    shadowOpacity: 0,
    elevation: 0,
  },
  textBlock: { flex: 1 },
  title: {
    color: COLORS.textGold,
    fontFamily: FONTS.serif,
    fontWeight: '700',
    fontSize: 15,
  },
  sub: {
    color: COLORS.textSub,
    fontFamily: FONTS.serif,
    fontSize: 12,
    marginTop: 2,
  },
  dim: { color: COLORS.textDim },
  iapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  iapText: {
    color: COLORS.textDim,
    fontFamily: FONTS.serif,
    fontSize: 12,
  },
  dot: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  noAdsLabel: {
    textAlign: 'center',
    color: COLORS.greenLight,
    fontFamily: FONTS.serif,
    fontSize: 12,
  },
});
