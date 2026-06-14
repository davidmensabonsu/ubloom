## Plan: Fix Stripe Payment Integration

### 1. Update the Secret Key
Replace the existing `STRIPE_SECRET_KEY` project secret with your new key using the secure update flow.

### 2. Verify the Key Works
Call Stripe’s API from an edge function to confirm the new key is valid and accepted.

### 3. Test the Payment Flow
- Create a test checkout session via `create-checkout`
- Confirm `check-subscription` and `customer-portal` edge functions respond correctly
- Spot-check any existing webhook endpoint if relevant

### 4. Confirm Frontend Pro/Trial Logic
After the backend is verified, do a quick end-to-end check that the upgrade button and Pro-gated features behave as expected.

---

**Technical notes:**
- The integration code (`create-checkout`, `check-subscription`, `customer-portal`, `stripe-webhook`) is already in place and reads `STRIPE_SECRET_KEY` from environment variables — no code changes are needed.
- After updating the secret, the edge functions will automatically pick up the new value on their next invocation.
