import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = await getCurrentWorkspaceId(session.user.id);
  if (!workspaceId) {
    return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      workspaceId: workspaceId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50 // Limit to recent 50
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      workspaceId: workspaceId,
      isRead: false
    }
  });

  return NextResponse.json({
    items: notifications,
    unreadCount
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = await getCurrentWorkspaceId(session.user.id);
  if (!workspaceId) {
    return NextResponse.json({ error: 'No workspace' }, { status: 400 });
  }

  // Mark all as read
  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      workspaceId: workspaceId,
      isRead: false
    },
    data: {
      isRead: true
    }
  });

  return NextResponse.json({ success: true });
}
