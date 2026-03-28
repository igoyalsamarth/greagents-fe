/**
 * Start OAuth via the backend so client_id/secret and scopes stay server-side.
 * Backend redirects to GitHub, then back to /auth/github/callback and finally
 * to the frontend with a session JWT in the `token` query param.
 */
import { API_BASE_URL } from '@/lib/config';

export const getGitHubAuthUrl = () => {
  const backendUrl = API_BASE_URL;
  const redirectTo = `${window.location.origin}/auth/callback`;
  const params = new URLSearchParams({
    redirect_to: redirectTo,
  });
  return `${backendUrl}/auth/login?${params.toString()}`;
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
