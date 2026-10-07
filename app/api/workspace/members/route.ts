import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = await getCurrentWorkspaceId(session.user.id);
    if (!workspaceId) {
      return NextResponse.json({ members: [] });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: { select: { id: true, email: true, role: true } },
        members: { select: { id: true, email: true, role: true } }
      }
    });

    if (!workspace) {
      return NextResponse.json({ members: [] });
    }

    const membersMap = new Map();
    membersMap.set(workspace.owner.id, { ...workspace.owner, isOwner: true });
    
    workspace.members.forEach(m => {
      if (!membersMap.has(m.id)) {
        membersMap.set(m.id, { ...m, isOwner: false });
      }
    });

    return NextResponse.json({ 
      workspaceName: workspace.name,
      members: Array.from(membersMap.values()) 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
