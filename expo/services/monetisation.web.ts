// Web platform stub for monetisation.ts
// Metro automatically resolves .web.ts over .ts on the web platform,
// so this file is used instead of the real implementation for web builds.
// All functions are no-ops — ads and IAP are iOS-only features.

export const IAP_PRODUCT_ID = 'com.jeremy.realmsrise.removeads';
export const AD_BONUS_DURATION_MS = 2 * 60 * 60 * 1000;
export const REWARDED_AD_UNIT_ID = '';

export async function initMonetisation(): Promise<void> {}

export async function isRemoveAdsPurchased(): Promise<boolean> {
  return false;
}

export async function getAdCooldownEnd(): Promise<number> {
  return 0;
}

export async function setAdCooldownEnd(_ts: number): Promise<void> {}

export function showRewardedAd(_unitId: string): Promise<void> {
  return Promise.reject(new Error('Ads are not available on web.'));
}

export function purchaseRemoveAds(): Promise<boolean> {
  return Promise.reject(new Error('IAP is not available on web.'));
}

export async function restorePurchases(): Promise<boolean> {
  return false;
}
