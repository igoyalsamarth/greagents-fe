import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { isAuthenticated } from '@/lib/auth';
import {
  billingErrorMessage,
  createBillingCheckoutSession,
  createCustomerPortalSession,
  createTopupCheckoutSession,
  fetchBillingSubscription,
  shouldOfferPaidPlanCheckout,
} from '@/lib/billing';
import type { BillingPlanId } from '@/lib/api';
import {
  ArrowRight,
  Bot,
  Check,
  CircleDollarSign,
  Rocket,
  ShieldCheck,
  Sparkles,
  Stars,
  Loader2,
} from 'lucide-react';

type PlanBilling =
  | { kind: 'free' }
  | { kind: 'paid'; planId: BillingPlanId }
  | { kind: 'topup' };

const plans: {
  name: string;
  price: string;
  /** Shown struck through before `price` (optional). */
  compareAtPrice?: string;
  /** Shown next to price when set (e.g. "credits"). */
  priceQualifier?: string;
  cadence: string;
  /** Note under the price row (e.g. free credits copy). */
  priceFootnote?: string;
  eyebrow: string;
  description: string;
  /** Shown above feature list, no checkmark — playful lead-in copy. */
  featureLeadIn?: string;
  features: string[];
  featured?: boolean;
  billing: PlanBilling;
}[] = [
  {
    name: 'Starter Mischief',
    price: 'Free',
    cadence: '',
    priceFootnote:
      'Credits arrive like a polite poltergeist with a spreadsheet — no invoice required.',
    eyebrow: 'For curious teams',
    description:
      'A gentle on-ramp: let GreAgents sniff around one repo before they redecorate your whole workflow.',
    features: [
      '$5 in credits on the house',
      'Basic model',
      'Review summaries with light sass',
    ],
    billing: { kind: 'free' },
  },
  {
    name: 'Ship Goblin',
    price: '$20',
    cadence: '/seat',
    eyebrow: 'Most popular',
    description:
      'For teams that want useful automation, fewer rituals, and a codebase that moves with suspicious confidence.',
    featureLeadIn:
      'Starter gremlins keep their keys — parallel agents, a fast lane, dashboards that gossip.',
    features: [
      'Coder + Reviewer running in parallel',
      'Priority agent queue',
      'Usage and activity visibility',
    ],
    featured: true,
    billing: { kind: 'paid', planId: 'ship_goblin' },
  },
  {
    name: 'Pocket Kraken',
    price: 'Custom',
    priceQualifier: 'top-up',
    cadence: '',
    eyebrow: 'Need more juice?',
    description:
      'When the agents are pulling their weight and your credit meter looks nervous, feed the beast on your terms.',
    features: [
      'Buy credits in the chunk that matches your budget',
      'Stacks with free tier or Ship Goblin',
      'No mystery bundles — you pick the top-up',
      'Same gremlins, more runway',
    ],
    billing: { kind: 'topup' },
  },
];

const enterprisePlan = {
  name: 'Enterprise Haunting',
  price: 'Let’s talk',
  cadence: '',
  eyebrow: 'For larger operations',
  description:
    'For teams that require approvals, controls, auditability, and a more formal relationship with their helpful weirdos.',
  featureLeadIn: 'Everything in Ship Goblin, plus:',
  features: [
    'Unlimited repos',
    'SSO and access controls',
    'Audit logs and deployment guardrails',
    'Custom rollout support',
    'Contractual peace of mind',
  ],
};

export default function Pricing() {
  const authed = isAuthenticated();
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [topupStarting, setTopupStarting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);
  const salesEmail = import.meta.env.VITE_SALES_EMAIL?.trim();

  const billingQuery = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: fetchBillingSubscription,
    enabled: authed,
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

  const enterpriseMailto = salesEmail
    ? `mailto:${salesEmail}?subject=${encodeURIComponent('GreAgents Enterprise')}`
    : null;

  async function startPaidCheckout(planId: BillingPlanId, planName: string) {
    setCheckoutError(null);
    setCheckoutPlan(planName);
    try {
      const { checkout_url: checkoutUrl } = await createBillingCheckoutSession(planId);
      window.location.assign(checkoutUrl);
    } catch (e) {
      setCheckoutError(await billingErrorMessage(e));
      setCheckoutPlan(null);
    }
  }

  async function startTopupCheckout() {
    setCheckoutError(null);
    setTopupStarting(true);
    try {
      const { checkout_url: checkoutUrl } = await createTopupCheckoutSession();
      window.location.assign(checkoutUrl);
    } catch (e) {
      setCheckoutError(await billingErrorMessage(e));
      setTopupStarting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="size-4" aria-hidden />
            </span>
            GreAgents
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <Link to="/pricing" className="text-foreground">
              Pricing
            </Link>
            {authed ? (
              <Button asChild size="default">
                <Link to="/dashboard">
                  Dashboard
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="default">
                <Link to="/login">Log in</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative isolate border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/18 blur-3xl" />
            <div className="absolute left-0 top-32 h-56 w-56 rounded-full bg-chart-2/15 blur-3xl" />
            <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-chart-1/10 blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:py-24 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <CircleDollarSign className="size-3.5" aria-hidden />
                  Pricing for teams with deadlines and opinions
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                  <Sparkles className="size-3.5" aria-hidden />
                  Zero “contact us for vibes” energy
                </div>
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Pick a plan for your favorite repo gremlins
              </h1>
              <p className="max-w-3xl text-lg text-muted-foreground md:text-xl">
                Start small, scale up, and only pay for the level of useful mischief your team
                actually needs. The plans are simple on purpose. The agents are not.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {authed ? (
                  <Button asChild size="lg" className="h-10 px-5 text-sm shadow-lg shadow-primary/20">
                    <Link to="/dashboard">
                      Open dashboard
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="h-10 px-5 text-sm shadow-lg shadow-primary/20">
                    <Link to="/login">
                      Start for free
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="h-10 border-border/80 bg-background/60 px-5 text-sm backdrop-blur-sm"
                  asChild
                >
                  <Link to="/">Back to landing</Link>
                </Button>
              </div>
            </div>

            <Card className="relative overflow-hidden border-border/70 bg-card/75 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
              <CardHeader className="gap-4 border-b border-border/70 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-xl">Billing philosophy</CardTitle>
                    <CardDescription>
                      Predictable enough for finance. Weird enough for the rest of us.
                    </CardDescription>
                  </div>
                  <div className="shrink-0 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs leading-none text-muted-foreground">
                    no nonsense
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
                  You should not need a procurement séance to understand what this costs.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-primary/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Rocket className="size-4 text-primary" aria-hidden />
                      Starts small
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Free entry for curious teams and side quests.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-chart-2/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <ShieldCheck className="size-4 text-chart-2" aria-hidden />
                      Grows responsibly
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Controls, support, and grown-up guardrails when you need them.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                  No hidden multipliers. No “AI credits” disguised as moon dust.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-b border-border/60 bg-muted/20">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:py-20">
            <div className="flex flex-col gap-3 md:max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Plans with names that know what they are doing
              </h2>
              <p className="text-muted-foreground">
                Free credits to start, a seat-based tier for steady shipping, custom top-ups when the
                meter blinks, and enterprise when legal wants a nametag.
              </p>
            </div>

            {checkoutError ? (
              <p
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {checkoutError}
              </p>
            ) : null}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => {
                const isCurrentPaidPlan =
                  authed &&
                  plan.billing.kind === 'paid' &&
                  billingQuery.data &&
                  !shouldOfferPaidPlanCheckout(billingQuery.data.subscription);

                return (
                <Card
                  key={plan.name}
                  className={`flex h-full flex-col border-border/80 bg-card/80 shadow-none transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl ${
                    plan.featured ? 'ring-1 ring-primary/40 shadow-lg shadow-primary/10' : ''
                  }`}
                >
                  <CardHeader className="gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                        {plan.eyebrow}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {isCurrentPaidPlan ? (
                          <div className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            Current plan
                          </div>
                        ) : null}
                        {plan.featured ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                            <Stars className="size-3.5" aria-hidden />
                            Recommended
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                      {plan.compareAtPrice ? (
                        <span
                          className="pb-1 text-2xl font-semibold tracking-tight text-muted-foreground line-through"
                          aria-hidden
                        >
                          {plan.compareAtPrice}
                        </span>
                      ) : null}
                      <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                      {plan.priceQualifier ? (
                        <span className="pb-1 text-lg font-medium tracking-tight text-muted-foreground">
                          {plan.priceQualifier}
                        </span>
                      ) : null}
                      {plan.cadence ? (
                        <span className="pb-1 text-sm text-muted-foreground">{plan.cadence}</span>
                      ) : null}
                    </div>
                    {plan.priceFootnote ? (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {plan.priceFootnote}
                      </p>
                    ) : plan.compareAtPrice ? (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Normally {plan.compareAtPrice}
                        {plan.cadence} — distributed free.
                      </p>
                    ) : null}
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-5">
                    <div className="space-y-3">
                      {plan.featureLeadIn ? (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {plan.featureLeadIn}
                        </p>
                      ) : null}
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3 text-sm">
                          <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
                            <Check className="size-3.5" aria-hidden />
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {plan.billing.kind === 'paid' ? (
                      authed ? (
                        billingQuery.isLoading ? (
                          <Button
                            type="button"
                            className="mt-auto w-full gap-2"
                            variant={plan.featured ? 'default' : 'outline'}
                            disabled
                          >
                            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                            Checking subscription…
                          </Button>
                        ) : billingQuery.isError ||
                          shouldOfferPaidPlanCheckout(billingQuery.data?.subscription) ? (
                          <Button
                            type="button"
                            className="mt-auto w-full"
                            variant={plan.featured ? 'default' : 'outline'}
                            disabled={checkoutPlan === plan.name}
                            onClick={() => {
                              if (plan.billing.kind !== 'paid') return;
                              void startPaidCheckout(plan.billing.planId, plan.name);
                            }}
                          >
                            {checkoutPlan === plan.name ? 'Redirecting…' : `Subscribe to ${plan.name}`}
                            {checkoutPlan === plan.name ? null : (
                              <ArrowRight data-icon="inline-end" />
                            )}
                          </Button>
                        ) : (
                          <div className="mt-auto flex w-full flex-col gap-2">
                            {portalError ? (
                              <p className="text-sm text-destructive" role="alert">
                                {portalError}
                              </p>
                            ) : null}
                            <Button
                              type="button"
                              className="w-full gap-2"
                              variant="outline"
                              disabled={
                                !billingQuery.data?.dodo_customer_id ||
                                portalMutation.isPending
                              }
                              onClick={() => portalMutation.mutate()}
                            >
                              {portalMutation.isPending ? (
                                <>
                                  <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                                  Opening billing portal…
                                </>
                              ) : (
                                <>
                                  Manage or cancel subscription
                                  <ArrowRight data-icon="inline-end" />
                                </>
                              )}
                            </Button>
                            {!billingQuery.data?.dodo_customer_id ? (
                              <p className="text-xs text-muted-foreground">
                                Billing portal unlocks after checkout completes. If this persists,
                                try again from Settings.
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Cancel or change your plan in the Dodo billing portal.
                              </p>
                            )}
                          </div>
                        )
                      ) : (
                        <Button
                          asChild
                          className="mt-auto w-full"
                          variant={plan.featured ? 'default' : 'outline'}
                        >
                          <Link to="/login">
                            Log in to subscribe
                            <ArrowRight data-icon="inline-end" />
                          </Link>
                        </Button>
                      )
                    ) : plan.billing.kind === 'free' ? (
                      authed ? (
                        <Button
                          asChild
                          className="mt-auto w-full"
                          variant={plan.featured ? 'default' : 'outline'}
                        >
                          <Link to="/dashboard">
                            Continue on free tier
                            <ArrowRight data-icon="inline-end" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          className="mt-auto w-full"
                          variant={plan.featured ? 'default' : 'outline'}
                        >
                          <Link to="/login">
                            Start for free
                            <ArrowRight data-icon="inline-end" />
                          </Link>
                        </Button>
                      )
                    ) : plan.billing.kind === 'topup' ? (
                      authed ? (
                        <Button
                          type="button"
                          className="mt-auto w-full gap-2"
                          variant={plan.featured ? 'default' : 'outline'}
                          disabled={topupStarting}
                          onClick={() => void startTopupCheckout()}
                        >
                          {topupStarting ? (
                            <>
                              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                              Redirecting…
                            </>
                          ) : (
                            <>
                              Top up credits
                              <ArrowRight data-icon="inline-end" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          asChild
                          className="mt-auto w-full"
                          variant={plan.featured ? 'default' : 'outline'}
                        >
                          <Link to="/login">
                            Log in to top up
                            <ArrowRight data-icon="inline-end" />
                          </Link>
                        </Button>
                      )
                    ) : null}
                  </CardContent>
                </Card>
                );
              })}
            </div>

            <div className="mt-10 lg:mt-14">
              <Card className="border-border/80 border-dashed border-primary/20 bg-card/70 shadow-none backdrop-blur-sm">
                <CardHeader className="gap-4 pb-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                          {enterprisePlan.eyebrow}
                        </div>
                      </div>
                      <CardTitle className="text-2xl">{enterprisePlan.name}</CardTitle>
                      <CardDescription className="text-base">
                        {enterprisePlan.description}
                      </CardDescription>
                      <div className="flex flex-wrap items-end gap-x-2 gap-y-1 pt-1">
                        <span className="text-3xl font-bold tracking-tight">
                          {enterprisePlan.price}
                        </span>
                      </div>
                    </div>
                    {enterpriseMailto ? (
                      <Button asChild className="shrink-0 md:mt-2" variant="outline">
                        <a href={enterpriseMailto}>
                          Contact sales
                          <ArrowRight data-icon="inline-end" />
                        </a>
                      </Button>
                    ) : (
                      <p className="max-w-sm shrink-0 text-sm text-muted-foreground md:mt-2">
                        Set{' '}
                        <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_SALES_EMAIL</code>{' '}
                        to enable contact sales.
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {enterprisePlan.featureLeadIn ? (
                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                      {enterprisePlan.featureLeadIn}
                    </p>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {enterprisePlan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
                          <Check className="size-3.5" aria-hidden />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3 md:py-20">
            <Card className="border-border/80 bg-card/75">
              <CardHeader className="gap-3">
                <CardTitle className="text-lg">What counts as a seat?</CardTitle>
                <CardDescription>
                  A human with access to provision, run, or supervise agents in a workspace.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border/80 bg-card/75">
              <CardHeader className="gap-3">
                <CardTitle className="text-lg">Can I start free?</CardTitle>
                <CardDescription>
                  Yes. The free tier is meant for trying the workflow without signing a blood oath.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border/80 bg-card/75">
              <CardHeader className="gap-3">
                <CardTitle className="text-lg">Need enterprise details?</CardTitle>
                <CardDescription>
                  If your security team has a questionnaire the size of a novella, we can work with that.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section>
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
            <div className="flex flex-col gap-2 md:max-w-xl">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                Ready to put a budget behind the weird little productivity boost?
              </h2>
              <p className="text-sm text-muted-foreground">
                Start free, upgrade when the agents become oddly indispensable, and keep the humans
                in charge the whole time.
              </p>
            </div>
            {authed ? (
              <Button asChild size="lg" className="h-10 shrink-0 px-5 text-sm">
                <Link to="/dashboard">
                  Go to dashboard
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="h-10 shrink-0 px-5 text-sm">
                <Link to="/login">
                  Start for free
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GreAgents. Pricing without interpretive dance.
          </p>
          <Separator className="md:hidden" />
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="text-foreground/80">Starter Mischief</span>
            <span className="text-foreground/80">Ship Goblin</span>
            <span className="text-foreground/80">Pocket Kraken</span>
            <span>Enterprise Haunting</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
