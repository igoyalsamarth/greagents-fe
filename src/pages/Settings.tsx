import { useMutation, useQuery } from '@tanstack/react-query';
import { WalletTopUpPanel } from '@/components/custom/WalletTopUpPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import {
  billingErrorMessage,
  createBillingCheckoutSession,
  createCustomerPortalSession,
  DEFAULT_SUBSCRIPTION_PLAN_ID,
  fetchBillingSubscription,
  shouldOfferPaidPlanCheckout,
} from '@/lib/billing';
import { User, Building2, Bell, CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [portalError, setPortalError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const billingQuery = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: fetchBillingSubscription,
  });

  const offerCheckout = shouldOfferPaidPlanCheckout(
    billingQuery.data?.subscription,
  );

  const checkoutMutation = useMutation({
    mutationFn: () => createBillingCheckoutSession(DEFAULT_SUBSCRIPTION_PLAN_ID),
    onMutate: () => setCheckoutError(null),
    onSuccess: (data) => {
      window.location.assign(data.checkout_url);
    },
    onError: async (err) => {
      setCheckoutError(await billingErrorMessage(err));
    },
  });

  const portalMutation = useMutation({
    mutationFn: createCustomerPortalSession,
    onMutate: () => setPortalError(null),
    onSuccess: (data) => {
      window.location.assign(data.portal_url);
    },
    onError: async (err) => {
      setPortalError(await billingErrorMessage(err));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="johndoe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Settings
            </CardTitle>
            <CardDescription>
              Manage your organization details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" placeholder="Acme Inc." />
            </div>
            <Button>Update Organization</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing
            </CardTitle>
            <CardDescription>
              Wallet balance, top-ups, and Dodo subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Full wallet page (e.g. after checkout){' '}
                <Link
                  to="/settings/billing"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Wallet & billing
                </Link>
              </p>
            </div>
            <WalletTopUpPanel />
            {billingQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading billing…
              </div>
            ) : billingQuery.isError ? (
              <p className="text-sm text-destructive">Could not load billing. Try again later.</p>
            ) : offerCheckout ? (
              <>
                <p className="text-sm text-muted-foreground">
                  No active subscription on this organization. Enable a plan to get started.
                </p>
                {checkoutError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {checkoutError}
                  </p>
                ) : null}
                <Button
                  type="button"
                  disabled={checkoutMutation.isPending}
                  onClick={() => checkoutMutation.mutate()}
                >
                  {checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Redirecting to checkout…
                    </>
                  ) : (
                    'Enable subscription'
                  )}
                </Button>
              </>
            ) : (
              <>
                {billingQuery.data?.subscription ? (
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <span className="font-medium capitalize">
                        {billingQuery.data.subscription.status.replace(/_/g, ' ')}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Billing:</span>{' '}
                      <span className="font-medium">{billingQuery.data.subscription.billing_cycle}</span>
                      {billingQuery.data.subscription.quantity > 1 ? (
                        <span className="text-muted-foreground">
                          {' '}
                          · {billingQuery.data.subscription.quantity} seats
                        </span>
                      ) : null}
                    </p>
                    {billingQuery.data.subscription.current_period_end ? (
                      <p className="text-muted-foreground">
                        Current period ends{' '}
                        {new Date(
                          billingQuery.data.subscription.current_period_end,
                        ).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {portalError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {portalError}
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    !billingQuery.data?.dodo_customer_id || portalMutation.isPending
                  }
                  onClick={() => portalMutation.mutate()}
                >
                  {portalMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Opening portal…
                    </>
                  ) : (
                    'Manage subscription in Dodo'
                  )}
                </Button>
                {!billingQuery.data?.dodo_customer_id ? (
                  <p className="text-xs text-muted-foreground">
                    If the portal does not open, wait for checkout webhooks to link your customer, or
                    contact support.
                  </p>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notification settings coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
