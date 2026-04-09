import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviteCode } = await req.json();

    if (!inviteCode || typeof inviteCode !== 'string') {
      return NextResponse.json({ error: 'Mã mời không hợp lệ' }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
      include: { members: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Không tìm thấy Không gian làm việc với mã này' }, { status: 404 });
    }

    // Check if already a member
    const isMember = workspace.members.some((m) => m.id === userId) || workspace.ownerId === userId;

    if (!isMember) {
      // Join workspace
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          members: {
            connect: { id: userId },
          },
        },
      });
    }

    // Automatically switch to the joined workspace
    cookies().set('workspaceId', workspace.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({ ok: true, workspaceId: workspace.id, workspaceName: workspace.name });
  } catch (error) {
    console.error('Error joining workspace:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
