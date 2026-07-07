// Temporarily disabled: import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export async function openCustomerCenter() {
  if (!Capacitor.isNativePlatform()) return;
  // Temporarily disabled for RevenueCat diagnostic
  return;
  // try {
  //   const { customerInfo } = await Purchases.getCustomerInfo();
  //   const managementURL = customerInfo.managementURL;
  //   if (managementURL) {
  //     await Browser.open({ url: managementURL });
  //   }
  // } catch (e) {
  //   console.error('Could not open customer center:', e);
  // }
}
