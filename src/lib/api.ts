import ky from 'ky';

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
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

export interface CoderAgentConfig {
  repositoryId: number;
  enabled: boolean;
  mode: 'auto' | 'on_assignment';
}

export interface CoderAgentSettings {
  repositories: Repository[];
  configurations: CoderAgentConfig[];
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
