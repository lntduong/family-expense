'use client';

import { useState, useTransition } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 max-w-[150px] justify-between text-xs font-semibold" disabled={isPending}>
          <span className="truncate">{activeSpace?.name || 'Chọn nhóm'}</span>
          {isPending ? (
            <Loader2 className="ml-2 h-3 w-3 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleSwitch(workspace.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            {workspace.name}
            {workspace.id === activeSpace?.id && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
