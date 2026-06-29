import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  Purchases,
  PurchasesPackage,
  CustomerInfo,
  PURCHASES_ERROR_CODE,
} from '@revenuecat/purchases-capacitor';

export const ENTITLEMENT_ID = 'uBloom Premium';
export const OFFERING_ID = 'uBloom Default';

export type PurchaseStatus = 'loading' | 'entitled' | 'not_entitled' | 'unavailable';

export function usePurchases() {
  const [status, setStatus] = useState<PurchaseStatus>('loading');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  const checkEntitlement = useCallback(async () => {
    if (!isNative) { setStatus('unavailable'); return; }
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      setCustomerInfo(customerInfo);
      const entitled = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setStatus(entitled ? 'entitled' : 'not_entitled');
    } catch (e) {
      console.error('RevenueCat entitlement check failed:', e);
      setStatus('not_entitled');
    }
  }, [isNative]);

  const fetchOfferings = useCallback(async () => {
    if (!isNative) return;
    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings.all[OFFERING_ID] ?? offerings.current;
      if (offering) { setPackages(offering.availablePackages); }
    } catch (e) { console.error('RevenueCat fetch offerings failed:', e); }
  }, [isNative]);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    setIsLoading(true); setError(null);
    try {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      setCustomerInfo(customerInfo);
      const entitled = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setStatus(entitled ? 'entitled' : 'not_entitled');
      return true;
    } catch (e: any) {
      if (e?.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        setError('Purchase failed. Please try again.');
        console.error('RevenueCat purchase failed:', e);
      }
      return false;
    } finally { setIsLoading(false); }
  }, []);

  const restorePurchases = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const { customerInfo } = await Purchases.restorePurchases();
      setCustomerInfo(customerInfo);
      const entitled = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setStatus(entitled ? 'entitled' : 'not_entitled');
      return entitled;
    } catch (e) {
      setError('Restore failed. Please try again.');
      console.error('RevenueCat restore failed:', e);
      return false;
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    if (!isNative) { setStatus('unavailable'); return; }
    checkEntitlement();
    fetchOfferings();
  }, [isNative, checkEntitlement, fetchOfferings]);

  return { status, customerInfo, packages, isLoading, error, purchasePackage, restorePurchases, checkEntitlement };
}