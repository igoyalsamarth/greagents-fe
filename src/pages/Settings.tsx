import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  addWorkspaceMember,
  deleteWorkspace,
  fetchWorkspaceMembers,
  fetchWorkspaces,
  patchWorkspaceName,
  removeWorkspaceMember,
  switchWorkspace,
  type WorkspaceMember,
  type WorkspaceRole,
} from '@/lib/api';
import { setAuthToken } from '@/lib/auth';
import { getUserIdFromToken } from '@/lib/auth';
import {
  isCreator,
  roleAtLeastAdmin,
  useCurrentWorkspace,
} from '@/hooks/useCurrentWorkspace';
import {
  Bell,
  Building2,
  CreditCard,
  Loader2,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function canRemoveMember(actor: WorkspaceRole | undefined, row: WorkspaceMember, selfId: string | null): boolean {
  if (!actor || row.user_id === selfId) return false;
  if (row.role === 'creator') return false;
  if (actor === 'creator') return true;
  if (actor === 'admin' && row.role === 'user') return true;
  return false;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [portalError, setPortalError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [memberError, setMemberError] = useState<string | null>(null);

  const { current, role, orgId } = useCurrentWorkspace();
  const selfId = getUserIdFromToken();

  const billingQuery = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: fetchBillingSubscription,
  });

  const membersQuery = useQuery({
    queryKey: ['workspace-members', orgId],
    queryFn: () => fetchWorkspaceMembers(orgId!),
    enabled: !!orgId && roleAtLeastAdmin(role),
  });

  const offerCheckout = shouldOfferPaidPlanCheckout(
    billingQuery.data?.subscription,
  );

  const canBilling = roleAtLeastAdmin(role);

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

  const renameMutation = useMutation({
    mutationFn: () => patchWorkspaceName(orgId!, renameValue.trim()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setRenameValue('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkspace(orgId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      const list = await queryClient.fetchQuery({
        queryKey: ['workspaces'],
        queryFn: fetchWorkspaces,
      });
      const personal = list.find((w) => w.is_personal);
      const fallback = personal ?? list[0];
      if (fallback) {
        const { token } = await switchWorkspace(fallback.id);
        setAuthToken(token);
      }
      void queryClient.invalidateQueries();
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: () =>
      addWorkspaceMember(orgId!, { username: inviteUsername.trim(), role: inviteRole }),
    onMutate: () => setMemberError(null),
    onSuccess: () => {
      setInviteUsername('');
      void membersQuery.refetch();
    },
    onError: () => {
      setMemberError('User not found, already a member, or you lack permission.');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeWorkspaceMember(orgId!, userId),
    onSuccess: () => {
      void membersQuery.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Workspace preferences, members, and billing for the current workspace.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Workspace
            </CardTitle>
            <CardDescription>
              {current?.name ?? '—'}
              {current?.is_personal ? ' · Personal workspace (cannot be deleted)' : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your app username is your GitHub login. Switch workspaces from the selector in the top
              bar.
            </p>
            {isCreator(role) ? (
              <div className="space-y-2 max-w-md">
                <Label htmlFor="rename-ws">Rename workspace</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    id="rename-ws"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    placeholder={current?.name ?? 'Name'}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!renameValue.trim() || renameMutation.isPending}
                    onClick={() => renameMutation.mutate()}
                  >
                    {renameMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      'Save name'
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
            {isCreator(role) && current && !current.is_personal ? (
              <div className="border-t pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (
                      confirm(
                        'Delete this workspace permanently? This cannot be undone.',
                      )
                    ) {
                      deleteMutation.mutate();
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                  {deleteMutation.isPending ? 'Deleting…' : 'Delete workspace'}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {roleAtLeastAdmin(role) && orgId ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members
              </CardTitle>
              <CardDescription>
                Admins can invite by username and remove users. Creators can also remove admins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-2 flex-1 min-w-[140px]">
                  <Label htmlFor="invite-user">GitHub username</Label>
                  <Input
                    id="invite-user"
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    placeholder="teammate"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2 w-[140px]">
                  <Label>Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole(v as 'admin' | 'user')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  disabled={!inviteUsername.trim() || addMemberMutation.isPending}
                  onClick={() => addMemberMutation.mutate()}
                >
                  <UserPlus className="mr-2 h-4 w-4" aria-hidden />
                  Add
                </Button>
              </div>
              {memberError ? (
                <p className="text-sm text-destructive" role="alert">
                  {memberError}
                </p>
              ) : null}
              {membersQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Loading members…
                </div>
              ) : membersQuery.data?.length ? (
                <ul className="divide-y rounded-md border text-sm">
                  {membersQuery.data.map((m) => (
                    <li
                      key={m.user_id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                    >
                      <span className="font-medium">@{m.username}</span>
                      <span className="text-muted-foreground capitalize">{m.role}</span>
                      {canRemoveMember(role, m, selfId) ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={removeMemberMutation.isPending}
                          onClick={() => {
                            if (confirm(`Remove @${m.username} from this workspace?`)) {
                              removeMemberMutation.mutate(m.user_id);
                            }
                          }}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No members loaded.</p>
              )}
            </CardContent>
          </Card>
        ) : null}

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
                Full wallet page{' '}
                <Link
                  to="/settings/billing"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Wallet & billing
                </Link>
              </p>
            </div>
            <WalletTopUpPanel allowManage={canBilling} />
            {billingQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading billing…
              </div>
            ) : billingQuery.isError ? (
              <p className="text-sm text-destructive">Could not load billing. Try again later.</p>
            ) : offerCheckout && canBilling ? (
              <>
                <p className="text-sm text-muted-foreground">
                  No active subscription on this workspace. Enable a plan to get started.
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
            ) : offerCheckout && !canBilling ? (
              <p className="text-sm text-muted-foreground">
                Ask a workspace admin to enable a subscription for this workspace.
              </p>
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
                {canBilling ? (
                  <>
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
                        If the portal does not open, wait for checkout webhooks to link your customer,
                        or contact support.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Subscription management is limited to workspace admins and the creator.
                  </p>
                )}
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
