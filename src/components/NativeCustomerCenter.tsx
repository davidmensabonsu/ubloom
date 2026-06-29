import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export async function openCustomerCenter() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Purchases.showManageSubscriptions();
  } catch (e) {
    console.error('Could not open customer center:', e);
  }
}
