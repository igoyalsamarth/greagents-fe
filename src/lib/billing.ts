import { HTTPError } from 'ky';

import {
  api,
  type BillingCheckoutSession,
  type BillingPlanId,
  type BillingSubscriptionInfo,
  type BillingSubscriptionResponse,
  type CustomerPortalSessionResponse,
} from '@/lib/api';

/** Paid plan used by in-app “subscribe” CTAs (matches Ship Goblin on `/pricing`). */
export const DEFAULT_SUBSCRIPTION_PLAN_ID: BillingPlanId = 'ship_goblin';

/**
 * Subscriptions in these states can start (or retry) checkout; all others use the customer portal.
 * Aligns with Dodo lifecycle states (e.g. active, on_hold, pending) vs ended or abandoned checkout.
 */
const CHECKOUT_ELIGIBLE_STATUSES = new Set([
  'canceled',
  'cancelled',
  'expired',
  'failed',
  'incomplete',
  'incomplete_expired',
]);

function normalizeSubscriptionStatus(status: string): string {
  return status.toLowerCase().replace(/\s+/g, '_');
}

export function shouldOfferPaidPlanCheckout(
  subscription: BillingSubscriptionInfo | null | undefined,
): boolean {
  if (!subscription) return true;
  return CHECKOUT_ELIGIBLE_STATUSES.has(normalizeSubscriptionStatus(subscription.status));
}

export async function createBillingCheckoutSession(
  plan: BillingPlanId,
): Promise<BillingCheckoutSession> {
  return api.post('billing/checkout-session', { json: { plan } }).json();
}

export async function fetchBillingSubscription(): Promise<BillingSubscriptionResponse> {
  return api.get('billing/subscription').json();
}

/** One-time wallet top-up via Dodo hosted checkout (optional product id for multi-SKU top-ups). */
export async function createTopupCheckoutSession(
  productId?: string | null,
): Promise<BillingCheckoutSession> {
  const body =
    productId && productId.trim() !== '' ? { product_id: productId.trim() } : {};
  return api.post('billing/topup-checkout-session', { json: body }).json();
}

export async function createCustomerPortalSession(): Promise<CustomerPortalSessionResponse> {
  return api.post('billing/customer-portal-session').json();
}

export async function billingErrorMessage(error: unknown): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const body = (await error.response.json()) as { detail?: unknown };
      if (typeof body.detail === 'string') {
        return body.detail;
      }
      if (Array.isArray(body.detail)) {
        const first = body.detail[0];
        if (first && typeof first === 'object' && first !== null && 'msg' in first) {
          return String((first as { msg: string }).msg);
        }
      }
    } catch {
      /* ignore malformed error body */
    }
  }
  return 'Something went wrong starting checkout. Please try again.';
}
