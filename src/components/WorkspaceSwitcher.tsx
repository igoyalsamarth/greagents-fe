import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createWorkspace, fetchWorkspaces, switchWorkspace } from '@/lib/api';
import { getOrgIdFromToken, setAuthToken } from '@/lib/auth';

const NEW_WORKSPACE_VALUE = '__new_workspace__';

export function WorkspaceSwitcher() {
  const queryClient = useQueryClient();
  const orgId = getOrgIdFromToken();
  const [dialogOpen, setDialogOpen] = useState(false);
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
      setDialogOpen(false);
      void queryClient.invalidateQueries();
    },
  });

  const current = workspaces?.find((w) => w.id === orgId);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setNewName('');
      createMut.reset();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        <span className="truncate">Loading workspaces…</span>
      </div>
    );
  }

  if (!workspaces?.length) {
    return (
      <p className="text-sm text-sidebar-foreground/70">
        No workspaces found. Try signing in again.
      </p>
    );
  }

  return (
    <>
      <div className="w-full min-w-0">
        <Select
          value={orgId ?? workspaces[0]?.id}
          onValueChange={(id) => {
            if (id === NEW_WORKSPACE_VALUE) {
              setDialogOpen(true);
              return;
            }
            if (id && id !== orgId) switchMut.mutate(id);
          }}
          disabled={switchMut.isPending}
        >
          <SelectTrigger
            size="sm"
            className="h-9 w-full min-w-0 max-w-none bg-sidebar-accent/50 [&>span]:truncate"
          >
            <SelectValue placeholder="Workspace">
              {current?.name ?? workspaces[0]?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" align="start" className="min-w-[var(--radix-select-trigger-width)]">
            <SelectGroup>
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  <span className="truncate">
                    {w.name}
                    {w.is_personal ? ' · personal' : ''}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectItem value={NEW_WORKSPACE_VALUE} className="[&_svg]:text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Plus className="size-3.5 shrink-0" aria-hidden />
                  New workspace
                </span>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription>
              Team workspaces do not include signup promotional credit. You can invite people by
              username after it is created.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-workspace-name">Workspace name</Label>
            <Input
              id="new-workspace-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Engineering"
              autoComplete="off"
            />
          </div>
          {createMut.isError ? (
            <p className="text-sm text-destructive" role="alert">
              Could not create workspace. Check the name and try again.
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
              Cancel
            </Button>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
