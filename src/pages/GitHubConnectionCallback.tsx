import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function GitHubConnectionCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const installationId = searchParams.get('installation_id');
    const setupAction = searchParams.get('setup_action');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      navigate('/connections?error=installation_cancelled', { replace: true });
      return;
    }

    if (!installationId) {
      navigate('/connections?error=no_installation', { replace: true });
      return;
    }

    const completeInstallation = async () => {
      try {
        await api.post('connections/github/installation/callback', {
          json: {
            installation_id: Number(installationId),
            setup_action: setupAction,
          },
        });
        navigate('/connections?success=true', { replace: true });
      } catch (err) {
        console.error('Failed to complete GitHub App installation:', err);
        setError('Failed to install GitHub App. Please try again.');
        setTimeout(() => {
          navigate('/connections?error=installation_failed', { replace: true });
        }, 2000);
      }
    };

    completeInstallation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-600 font-semibold">{error}</div>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg font-semibold">Installing GitHub App...</p>
            <p className="text-sm text-muted-foreground">Please wait while we complete the installation</p>
          </>
        )}
      </div>
    </div>
  );
}
