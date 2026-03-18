import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, CheckCircle2, Loader2, Settings2, Lock } from 'lucide-react';
import { api, type GitHubAppInstallation, type GitHubAppInstallationResponse } from '@/lib/api';
import { useSearchParams } from 'react-router-dom';

export default function Connections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isInstalling, setIsInstalling] = useState(false);

  const { data: githubApp, isLoading } = useQuery<GitHubAppInstallation>({
    queryKey: ['github-app-installation'],
    queryFn: async () => {
      const response = await api.get('connections/github/installation').json<GitHubAppInstallation>();
      return response;
    },
  });

  const installMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('connections/github/install').json<GitHubAppInstallationResponse>();
      return response;
    },
    onSuccess: (data) => {
      window.location.href = data.installUrl;
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: async () => {
      await api.delete('connections/github/installation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-app-installation'] });
    },
  });

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const setupAction = searchParams.get('setup_action');

    if (setupAction === 'install' || success === 'true') {
      setIsInstalling(false);
      queryClient.invalidateQueries({ queryKey: ['github-app-installation'] });
      setSearchParams({});
    } else if (error) {
      setIsInstalling(false);
      setSearchParams({});
    }
  }, [searchParams, queryClient, setSearchParams]);

  const handleInstall = () => {
    setIsInstalling(true);
    installMutation.mutate();
  };

  const handleConfigure = () => {
    if (githubApp?.accountLogin) {
      const appSlug = import.meta.env.VITE_GITHUB_APP_SLUG || 'your-app-slug';
      window.open(`https://github.com/apps/${appSlug}/installations/new`, '_blank');
    }
  };

  const handleUninstall = () => {
    if (confirm('Are you sure you want to uninstall the GitHub App? Agents will no longer have access to your repositories.')) {
      uninstallMutation.mutate();
    }
  };

  const isInstalled = githubApp?.installed;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
        <p className="text-muted-foreground mt-2">
          Connect external services to enhance your agents' capabilities
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Github className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    GitHub App
                    {isInstalled && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isInstalled && githubApp.accountLogin
                      ? `Installed on ${githubApp.accountType === 'Organization' ? 'organization' : 'account'} @${githubApp.accountLogin}`
                      : 'Install the GitHub App to give agents access to your repositories'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {isLoading ? (
                  <Button variant="outline" disabled>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Button>
                ) : isInstalled ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleConfigure}
                      size="sm"
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleUninstall}
                      disabled={uninstallMutation.isPending}
                      size="sm"
                    >
                      {uninstallMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Uninstalling...
                        </>
                      ) : (
                        'Uninstall'
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleInstall}
                    disabled={isInstalling || installMutation.isPending}
                  >
                    {isInstalling || installMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Installing...
                      </>
                    ) : (
                      'Install App'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-4">
              <div>
                <p className="mb-2 font-medium text-foreground">The GitHub App allows agents to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Access repositories you grant permission to</li>
                  <li>Create and manage pull requests</li>
                  <li>Review code and provide feedback</li>
                  <li>Manage issues and discussions</li>
                  <li>Read and write repository contents</li>
                </ul>
              </div>

              {isInstalled && githubApp.repositories && githubApp.repositories.length > 0 && (
                <div>
                  <p className="mb-2 font-medium text-foreground">
                    Accessible Repositories ({githubApp.repositories.length}):
                  </p>
                  <div className="space-y-1 ml-2">
                    {githubApp.repositories.slice(0, 5).map((repo) => (
                      <div key={repo.id} className="flex items-center gap-2 text-xs">
                        {repo.private ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Github className="h-3 w-3" />
                        )}
                        <span>{repo.fullName}</span>
                      </div>
                    ))}
                    {githubApp.repositories.length > 5 && (
                      <p className="text-xs italic">
                        and {githubApp.repositories.length - 5} more...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isInstalled && githubApp.installedAt && (
                <p className="text-xs pt-2 border-t">
                  Installed on {new Date(githubApp.installedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
