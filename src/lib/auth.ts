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

function readJwtPayload(): { sub?: string; org_id?: string } | null {
  const t = getAuthToken();
  if (!t) return null;
  const parts = t.split('.');
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as { sub?: string; org_id?: string };
  } catch {
    return null;
  }
}

/** Read ``org_id`` from the session JWT payload (UI only; not verified). */
export function getOrgIdFromToken(): string | null {
  return readJwtPayload()?.org_id ?? null;
}

/** Read ``sub`` (user id) from the session JWT payload (UI only; not verified). */
export function getUserIdFromToken(): string | null {
  return readJwtPayload()?.sub ?? null;
}
