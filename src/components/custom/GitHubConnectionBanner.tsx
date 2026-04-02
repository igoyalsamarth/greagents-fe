import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

import { fetchGitHubAppInstallation } from '@/lib/api';

/**
 * Shown on dashboard and agent pages when the GitHub App is not installed,
 * so new users know to open Connections and complete setup.
 */
export function GitHubConnectionBanner() {
  const { data, isLoading } = useQuery({
    queryKey: ['github-app-installation'],
    queryFn: fetchGitHubAppInstallation,
  });

  if (isLoading || !data || data.installed) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm"
      role="status"
    >
      <Github className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <p className="min-w-0 text-muted-foreground">
        <span className="font-medium text-foreground">Connect GitHub to use GreAgents.</span>{' '}
        Install the GreAgents GitHub App from the{' '}
        <Link
          to="/connections"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Connections
        </Link>{' '}
        page so agents can access your repositories.
      </p>
    </div>
  );
}
