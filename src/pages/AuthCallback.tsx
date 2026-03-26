import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthToken } from '@/lib/auth';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionToken = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate('/?error=' + error);
      return;
    }

    if (sessionToken) {
      setAuthToken(sessionToken);
      navigate('/onboarding');
    } else {
      navigate('/?error=missing_token');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
        <p className="text-lg text-muted-foreground">
          Authenticating...
        </p>
      </div>
    </div>
  );
}
