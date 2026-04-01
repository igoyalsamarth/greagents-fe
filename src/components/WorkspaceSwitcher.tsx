import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { createWorkspace, fetchWorkspaces, switchWorkspace } from '@/lib/api';
import { getOrgIdFromToken, setAuthToken } from '@/lib/auth';

export function WorkspaceSwitcher() {
  const queryClient = useQueryClient();
  const orgId = getOrgIdFromToken();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
  });

  const switchMut = useMutation({
    mutationFn: (workspaceId: string) => switchWorkspace(workspaceId),
    onSuccess: (res) => {
      setAuthToken(res.token);
      void queryClient.invalidateQueries();
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const ws = await createWorkspace(newName.trim());
      const { token } = await switchWorkspace(ws.id);
      return token;
    },
    onSuccess: (token) => {
      setAuthToken(token);
      setNewName('');
      setSheetOpen(false);
      void queryClient.invalidateQueries();
    },
  });

  const current = workspaces?.find((w) => w.id === orgId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading workspaces…
      </div>
    );
  }

  if (!workspaces?.length) {
    return (
      <p className="text-sm text-muted-foreground">No workspaces found. Try signing in again.</p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={orgId ?? workspaces[0]?.id}
          onValueChange={(id) => {
            if (id && id !== orgId) switchMut.mutate(id);
          }}
          disabled={switchMut.isPending}
        >
          <SelectTrigger size="sm" className="min-w-[200px] max-w-[280px]">
            <SelectValue placeholder="Workspace">
              {current?.name ?? workspaces[0]?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                <span className="truncate">
                  {w.name}
                  {w.is_personal ? ' · personal' : ''}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
          <Plus className="mr-1 h-4 w-4" aria-hidden />
          New workspace
        </Button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>New workspace</SheetTitle>
            <SheetDescription>
              Team workspaces do not include signup promotional credit. You can invite people by
              username after it is created.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2 px-4">
            <Label htmlFor="new-workspace-name">Workspace name</Label>
            <Input
              id="new-workspace-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Engineering"
              autoComplete="off"
            />
          </div>
          <SheetFooter className="mt-auto">
            {createMut.isError ? (
              <p className="text-sm text-destructive" role="alert">
                Could not create workspace. Check the name and try again.
              </p>
            ) : null}
            <Button
              type="button"
              disabled={!newName.trim() || createMut.isPending}
              onClick={() => createMut.mutate()}
            >
              {createMut.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Creating…
                </>
              ) : (
                'Create and switch'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
