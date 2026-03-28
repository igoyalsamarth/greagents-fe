import { HTTPError } from 'ky';

import {
  api,
  type BillingCheckoutSession,
  type BillingPlanId,
  type BillingSubscriptionResponse,
  type CustomerPortalSessionResponse,
} from '@/lib/api';

export async function createBillingCheckoutSession(
  plan: BillingPlanId,
): Promise<BillingCheckoutSession> {
  return api.post('billing/checkout-session', { json: { plan } }).json();
}

export async function fetchBillingSubscription(): Promise<BillingSubscriptionResponse> {
  return api.get('billing/subscription').json();
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
