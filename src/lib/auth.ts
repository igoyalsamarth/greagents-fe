export const getGitHubAuthUrl = () => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${backendUrl}/auth/github/callback`,
    scope: 'read:user user:email',
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
