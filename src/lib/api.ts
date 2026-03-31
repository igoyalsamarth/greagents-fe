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

export interface OnboardingData {
  organization: string;
  username: string;
  fullName?: string;
  bio?: string;
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
