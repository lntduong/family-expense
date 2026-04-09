'use client';

import { useState, useTransition } from 'react';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
}: {
  workspaces: Array<{ id: string; name: string }>;
  activeWorkspaceId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeSpace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  if (!workspaces.length) return null;

  async function handleSwitch(id: string) {
    if (id === activeWorkspaceId) return;
    
    // Call server action / route to set cookie
    startTransition(async () => {
      await fetch('/api/workspace/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: id }),
      });
      router.refresh();
    });
  }

  return (
    <div className="relative inline-block w-[150px] max-w-[40vw]">
      <select
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
        value={activeWorkspaceId || ''}
        onChange={(e) => handleSwitch(e.target.value)}
        disabled={isPending}
      >
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </select>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 w-full justify-between text-xs font-semibold pointer-events-none" 
        disabled={isPending}
      >
        <span className="truncate">{activeSpace?.name || 'Chọn nhóm'}</span>
        {isPending ? (
          <Loader2 className="ml-2 h-3 w-3 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        )}
      </Button>
    </div>
  );
}
