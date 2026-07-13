// RevenueCat configuration for native in-app purchases (iOS).
//
// The public SDK key is safe to embed in the app bundle. Entitlement and
// offering identifiers must match exactly what is configured in the
// RevenueCat dashboard (Product catalog), and the product identifiers must
// match the auto-renewable subscriptions created in App Store Connect.
export const REVENUECAT_APPLE_API_KEY = 'appl_tVNOZdhirczyijlnynyjAGqgcgL';

// Users with this entitlement active are premium.
export const ENTITLEMENT_ID = 'uBloom Premium';

// The offering whose packages populate the paywall.
export const OFFERING_ID = 'uBloom Default';

// App Store Connect product identifiers (also referenced by the paywall).
export const PRODUCT_ID_MONTHLY = 'monthly_paywall.1';
export const PRODUCT_ID_YEARLY = 'yearly_paywall';
