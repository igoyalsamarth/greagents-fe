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

export interface CoderUsageSummary {
  runCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: string;
}

export interface CoderUsageIssue {
  issueNumber: number;
  runCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: string;
  lastRunAt: string;
}

export interface CoderUsageRepository {
  githubFullName: string;
  /** Internal id; backend may send string or number. */
  repositoryId: string | number;
  distinctIssueCount: number;
  runCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: string;
  issues: CoderUsageIssue[];
}

export interface CoderUsageResponse {
  summary: CoderUsageSummary;
  repositories: CoderUsageRepository[];
}
