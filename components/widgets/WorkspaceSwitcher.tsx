'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="w-[150px] max-w-[40vw]">
      <Select 
        value={activeSpace?.id || activeWorkspaceId || ''} 
        onValueChange={handleSwitch}
        disabled={isPending}
      >
        <SelectTrigger className="h-8 text-xs font-semibold px-3 overflow-hidden">
          <div className="truncate flex-1 text-left">
            {isPending ? (
              <Loader2 className="h-3 w-3 shrink-0 animate-spin opacity-50" />
            ) : (
              <SelectValue placeholder="Chọn nhóm" />
            )}
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="z-[100]">
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
