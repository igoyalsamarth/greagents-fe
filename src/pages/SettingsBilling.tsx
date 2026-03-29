import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import { WalletTopUpPanel } from '@/components/custom/WalletTopUpPanel';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  billingErrorMessage,
  createCustomerPortalSession,
  fetchBillingSubscription,
} from '@/lib/billing';

/**
 * Dedicated billing / wallet page (return target for Dodo top-up checkout).
 */
export default function SettingsBilling() {
  const [portalError, setPortalError] = useState<string | null>(null);

  const billingQuery = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: fetchBillingSubscription,
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
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link to="/settings" className="gap-1">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All settings
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Wallet & billing</h2>
        <p className="text-muted-foreground">
          Top up your organization wallet and manage your subscription in Dodo.
        </p>
      </div>

      <WalletTopUpPanel />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Payment method and plan changes go through the Dodo customer portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {billingQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading…
            </div>
          ) : billingQuery.data?.subscription ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Status:</span>{' '}
              <span className="font-medium capitalize">
                {billingQuery.data.subscription.status.replace(/_/g, ' ')}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No subscription yet.{' '}
              <Link to="/pricing" className="text-primary underline-offset-4 hover:underline">
                View pricing
              </Link>
            </p>
          )}
          {portalError ? (
            <p className="text-sm text-destructive" role="alert">
              {portalError}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={!billingQuery.data?.dodo_customer_id || portalMutation.isPending}
            onClick={() => portalMutation.mutate()}
          >
            {portalMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Opening portal…
              </>
            ) : (
              'Open Dodo customer portal'
            )}
          </Button>
          {!billingQuery.data?.dodo_customer_id ? (
            <p className="text-xs text-muted-foreground">
              Complete a subscription checkout first; the portal unlocks after Dodo links your
              customer.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
