import { useQuery } from '@tanstack/react-query';

import { fetchWorkspaces, type WorkspaceRole } from '@/lib/api';
import { getOrgIdFromToken } from '@/lib/auth';

export function useCurrentWorkspace() {
  const orgId = getOrgIdFromToken();
  const q = useQuery({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
  });
  const current = q.data?.find((w) => w.id === orgId);
  return {
    ...q,
    orgId,
    current,
    role: current?.role as WorkspaceRole | undefined,
  };
}

export function roleAtLeastAdmin(role: WorkspaceRole | undefined): boolean {
  return role === 'creator' || role === 'admin';
}

export function isCreator(role: WorkspaceRole | undefined): boolean {
  return role === 'creator';
}
