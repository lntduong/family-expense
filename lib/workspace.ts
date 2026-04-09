import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function getCurrentWorkspaceId(userId: string): Promise<string | null> {
  const cookieWorkspaceId = cookies().get('workspaceId')?.value;

  // Verify the user has access to this workspace
  if (cookieWorkspaceId) {
    const hasAccess = await prisma.workspace.findFirst({
      where: {
        id: cookieWorkspaceId,
        OR: [
          { ownerId: userId },
          { members: { some: { id: userId } } }
        ]
      }
    });

    if (hasAccess) return cookieWorkspaceId;
  }

  // Fallback: pick the first workspace they have access to
  const firstWorkspace = await prisma.workspace.findFirst({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { id: userId } } }
      ]
    },
    select: { id: true }
  });

  return firstWorkspace?.id || null;
}
