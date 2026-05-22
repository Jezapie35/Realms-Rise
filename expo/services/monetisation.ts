import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Constants ───────────────────────────────────────────────────────────────

export const IAP_PRODUCT_ID = 'com.jeremy.realmsrise.removeads';
export const AD_BONUS_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

const PROD_REWARDED_AD_UNIT_ID  = 'ca-app-pub-4095824401302732/3161654454';
const TEST_REWARDED_AD_UNIT_ID  = 'ca-app-pub-3940256099942544/5224354917'; // Google sample ID

export const REWARDED_AD_UNIT_ID = __DEV__
  ? TEST_REWARDED_AD_UNIT_ID
  : PROD_REWARDED_AD_UNIT_ID;

const STORAGE = {
  removeAdsPurchased: '@rr:removeAdsPurchased',
  adCooldownEnd: '@rr:adCooldownEnd',
} as const;

// ─── Native module loading ────────────────────────────────────────────────────
// Static require() calls with string literals so Metro can resolve the
// dependency graph. The try/catch gracefully handles environments where the
// native modules aren't linked (e.g. Expo Go / plain JS tests).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let admobLib: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let iapLib: any = null;

try { admobLib = require('react-native-google-mobile-ads'); } catch { /* not linked */ }
try { iapLib = require('react-native-iap'); } catch { /* not linked */ }

// ─── Initialisation ───────────────────────────────────────────────────────────

export async function initMonetisation(): Promise<void> {
  await Promise.allSettled([
    admobLib ? admobLib.default().initialize() : null,
    iapLib ? iapLib.initConnection() : null,
  ]);
}

// ─── AsyncStorage helpers ─────────────────────────────────────────────────────

export async function isRemoveAdsPurchased(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE.removeAdsPurchased)) === 'true';
  } catch { return false; }
}

export async function getAdCooldownEnd(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(STORAGE.adCooldownEnd);
    return val ? Number(val) : 0;
  } catch { return 0; }
}

export async function setAdCooldownEnd(ts: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE.adCooldownEnd, String(ts));
  } catch { /* ignore */ }
}

// ─── AdMob ────────────────────────────────────────────────────────────────────

export function showRewardedAd(unitId: string): Promise<void> {
  if (!admobLib) {
    return Promise.reject(
      new Error('AdMob not available — build with EAS or a custom dev client.'),
    );
  }

  const { RewardedAd, RewardedAdEventType, AdEventType } = admobLib;

  return new Promise((resolve, reject) => {
    const ad = RewardedAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    let earned = false;
    let settled = false;

    const unsubs: Array<() => void> = [
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => ad.show()),
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { earned = true; }),
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        if (settled) return;
        settled = true;
        unsubs.forEach((fn) => fn());
        if (earned) resolve();
        else reject(new Error('Ad closed without earning reward'));
      }),
      ad.addAdEventListener(AdEventType.ERROR, (err: Error) => {
        if (settled) return;
        settled = true;
        unsubs.forEach((fn) => fn());
        reject(err);
      }),
    ];

    ad.load();
  });
}

// ─── IAP ──────────────────────────────────────────────────────────────────────

export function purchaseRemoveAds(): Promise<boolean> {
  if (!iapLib) {
    return Promise.reject(
      new Error('IAP not available — build with EAS or a custom dev client.'),
    );
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let updateSub: { remove: () => void } | null = null;
    let errorSub: { remove: () => void } | null = null;

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      updateSub?.remove();
      errorSub?.remove();
      fn();
    };

    updateSub = iapLib.purchaseUpdatedListener(async (purchase: any) => {
      if (purchase.productId !== IAP_PRODUCT_ID) return;
      try {
        await iapLib.finishTransaction({ purchase, isConsumable: false });
        await AsyncStorage.setItem(STORAGE.removeAdsPurchased, 'true');
        settle(() => resolve(true));
      } catch (err) {
        settle(() => reject(err));
      }
    });

    errorSub = iapLib.purchaseErrorListener((err: any) => {
      settle(() => {
        if (err?.code === 'user-cancelled') resolve(false);
        else reject(new Error(err?.message ?? 'Purchase failed'));
      });
    });

    iapLib.requestPurchase({
      request: { apple: { sku: IAP_PRODUCT_ID } },
      type: 'in-app',
    }).catch((err: any) => {
      settle(() => {
        if (err?.code === 'user-cancelled') resolve(false);
        else reject(new Error(err?.message ?? 'Purchase failed'));
      });
    });
  });
}

export async function restorePurchases(): Promise<boolean> {
  if (!iapLib) {
    throw new Error('IAP not available — build with EAS or a custom dev client.');
  }
  try {
    const purchases: Array<{ productId: string }> = await iapLib.getAvailablePurchases();
    const has = purchases.some((p) => p.productId === IAP_PRODUCT_ID);
    if (has) await AsyncStorage.setItem(STORAGE.removeAdsPurchased, 'true');
    return has;
  } catch { return false; }
}
