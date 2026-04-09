import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

function generateInviteCode() {
  return randomBytes(4).toString('hex').toUpperCase();
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Tên nhóm không hợp lệ' }, { status: 400 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        inviteCode: generateInviteCode(),
        ownerId: session.user.id,
        members: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json({ ok: true, workspaceId: workspace.id, workspaceName: workspace.name });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
