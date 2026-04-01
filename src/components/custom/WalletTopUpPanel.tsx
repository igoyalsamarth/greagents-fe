import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, Wallet } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  billingErrorMessage,
  createTopupCheckoutSession,
  fetchBillingSubscription,
} from '@/lib/billing';

/** Matches backend ``MIN_WALLET_USD_TO_START_AGENT`` (agent runs blocked below this). */
const MIN_WALLET_USD_FOR_AGENTS = 2;

function parseWalletUsd(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function formatUsd(amount: number | null): string {
  if (amount === null) return '—';
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export type WalletTopUpPanelProps = {
  /**
   * Optional Dodo product id for this button (fixed SKU). Omit to use the server default
   * from ``DODO_PRODUCT_ID_WALLET_TOPUP``.
   */
  productId?: string;
  /** Secondary line under the title. */
  description?: string;
  /** Workspace admins and creators can top up; members with the user role cannot. */
  allowManage?: boolean;
};

/**
 * Custom billing widget: organization wallet balance, low-balance notice, and top-up checkout.
 */
export function WalletTopUpPanel({
  productId,
  description = 'Usage is charged from this balance after each agent run. Subscriptions and top-ups add funds here.',
  allowManage = true,
}: WalletTopUpPanelProps) {
  const [topupError, setTopupError] = useState<string | null>(null);

  const billingQuery = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: fetchBillingSubscription,
  });

  const topupMutation = useMutation({
    mutationFn: () => createTopupCheckoutSession(productId ?? null),
    onMutate: () => setTopupError(null),
    onSuccess: (data) => {
      window.location.assign(data.checkout_url);
    },
    onError: async (err) => {
      setTopupError(await billingErrorMessage(err));
    },
  });

  const balance = parseWalletUsd(billingQuery.data?.spendable_balance_usd);
  const lowBalance =
    balance !== null && balance < MIN_WALLET_USD_FOR_AGENTS;

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/40">
            <Wallet className="h-5 w-5 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <h3 className="font-semibold leading-none tracking-tight">Organization wallet</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {billingQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading balance…
            </div>
          ) : billingQuery.isError ? (
            <p className="text-sm text-destructive">Could not load wallet balance.</p>
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Available balance
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{formatUsd(balance)}</p>
            </>
          )}
        </div>

        {allowManage ? (
          <Button
            type="button"
            disabled={billingQuery.isLoading || billingQuery.isError || topupMutation.isPending}
            onClick={() => topupMutation.mutate()}
          >
            {topupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Redirecting…
              </>
            ) : (
              'Add funds'
            )}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground max-w-xs text-right">
            Only workspace admins or the creator can add funds.
          </p>
        )}
      </div>

      {lowBalance ? (
        <p
          className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100"
          role="status"
        >
          Balance is below ${MIN_WALLET_USD_FOR_AGENTS.toFixed(2)}. Coder and reviewer agents will
          not start until you add funds.
        </p>
      ) : null}

      {topupError ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {topupError}
        </p>
      ) : null}
    </div>
  );
}
