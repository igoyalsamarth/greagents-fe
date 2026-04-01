import { useQuery } from '@tanstack/react-query';

import { fetchCurrentOrganization } from '@/lib/api';
import { getOrgIdFromToken } from '@/lib/auth';

/** Loads the current organization from the session JWT (single owner per account). */
export function useCurrentWorkspace() {
  const orgId = getOrgIdFromToken();
  const q = useQuery({
    queryKey: ['organization'],
    queryFn: fetchCurrentOrganization,
    enabled: !!orgId,
  });
  return {
    ...q,
    orgId,
    current: q.data,
  };
}
