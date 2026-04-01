import ky from 'ky';

import { API_BASE_URL } from '@/lib/config';

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
  },
});

export type WorkspaceRole = 'creator' | 'admin' | 'user';

export interface WorkspaceSummary {
  id: string;
  name: string;
  is_personal: boolean;
  role: WorkspaceRole;
}

export interface WorkspaceMember {
  user_id: string;
  username: string;
  role: WorkspaceRole;
}

export async function fetchWorkspaces(): Promise<WorkspaceSummary[]> {
  return api.get('workspaces').json();
}

export async function createWorkspace(name: string): Promise<WorkspaceSummary> {
  return api.post('workspaces', { json: { name } }).json();
}

export async function switchWorkspace(workspaceId: string): Promise<{ token: string }> {
  return api
    .post('workspaces/switch', { json: { workspace_id: workspaceId } })
    .json();
}

export async function patchWorkspaceName(
  workspaceId: string,
  name: string,
): Promise<{ status: string; name: string }> {
  return api.patch(`workspaces/${workspaceId}`, { json: { name } }).json();
}

export async function deleteWorkspace(workspaceId: string): Promise<{ status: string }> {
  return api.delete(`workspaces/${workspaceId}`).json();
}

export async function fetchWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  return api.get(`workspaces/${workspaceId}/members`).json();
}

export async function addWorkspaceMember(
  workspaceId: string,
  body: { username: string; role: 'admin' | 'user' },
): Promise<WorkspaceMember> {
  return api.post(`workspaces/${workspaceId}/members`, { json: body }).json();
}

export async function removeWorkspaceMember(
  workspaceId: string,
  memberUserId: string,
): Promise<{ status: string }> {
  return api.delete(`workspaces/${workspaceId}/members/${memberUserId}`).json();
}

export interface GitHubAppInstallation {
  id: string;
  installed: boolean;
  accountLogin?: string;
  accountType?: 'User' | 'Organization';
  accountAvatarUrl?: string;
  installedAt?: string;
  repositories?: {
    id: number;
    name: string;
    fullName: string;
    private: boolean;
  }[];
  permissions?: Record<string, string>;
}

export interface GitHubAppInstallationResponse {
  installUrl: string;
}

export interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  owner: string;
  description?: string;
  language?: string;
  updatedAt?: string;
}

/** Stored as ``config_json.mode`` on ``RepositoryAgent`` (coder + reviewer). */
export type RepoAgentMode = 'auto' | 'on_assignment';

export interface RepositoryAgentConfig {
  repositoryId: number;
  enabled: boolean;
  mode: RepoAgentMode;
}

export interface RepositoryAgentSettings {
  repositories: Repository[];
  configurations: RepositoryAgentConfig[];
}

/** Matches ``GET /agents/usage`` query and payload ``workflow`` field. */
export type GitHubWorkflowKind = "code" | "review";

export interface WorkflowUsageSummary {
  runCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: string;
}

export interface WorkflowUsageItem {
  workflow: GitHubWorkflowKind;
  itemNumber: number;
  runCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: string;
  lastRunAt: string | null;
}

export interface WorkflowUsageRepository {
  githubFullName: string;
  workflow: GitHubWorkflowKind;
  /** Internal id; backend may omit or send string. */
  repositoryId: string | number | null;
  distinctItemCount: number;
  runCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: string;
  items: WorkflowUsageItem[];
}

export interface WorkflowUsageResponse {
  summary: WorkflowUsageSummary;
  repositories: WorkflowUsageRepository[];
}

export interface DashboardRecentActivityItem {
  workflow: GitHubWorkflowKind;
  githubFullName: string;
  itemNumber: number;
  createdAt: string | null;
}

export interface DashboardResponse {
  activeAgentsCount: number;
  teamMemberCount: number;
  activityLast24Hours: number;
  recentActivity: DashboardRecentActivityItem[];
  workspaceRole: WorkspaceRole;
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  return api.get('dashboard').json();
}

/** Paid plan ids accepted by ``POST /billing/checkout-session``. */
export type BillingPlanId = 'ship_goblin';

export interface BillingCheckoutSession {
  checkout_url: string;
  session_id: string;
}

export interface BillingSubscriptionInfo {
  dodo_subscription_id: string;
  dodo_product_id: string;
  status: string;
  billing_cycle: string;
  quantity: number;
  current_period_end: string | null;
}

export interface BillingSubscriptionResponse {
  dodo_customer_id: string | null;
  /** Paid + active promo, USD decimal string (matches backend spendable total). */
  spendable_balance_usd: string;
  subscription: BillingSubscriptionInfo | null;
}

export interface CustomerPortalSessionResponse {
  portal_url: string;
}
