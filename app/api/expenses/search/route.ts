import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    
    if (!q || q.trim() === '') {
        return NextResponse.json([]);
    }

    const workspaceId = await getCurrentWorkspaceId((session.user as any).id);
    if (!workspaceId) {
        return NextResponse.json([]);
    }

    try {
        const expenses = await prisma.expense.findMany({
            where: {
                workspaceId,
                OR: [
                    { note: { contains: q, mode: 'insensitive' } },
                    { categoryRef: { name: { contains: q, mode: 'insensitive' } } },
                    { category: { contains: q, mode: 'insensitive' } }
                ]
            },
            orderBy: { date: 'desc' },
            take: 100, // Limit to 100 results
            include: { categoryRef: true }
        });

        // Ensure Decimal is converted to number or string before JSON serialization
        // though Next.js response might handle it or we map it:
        const serialized = expenses.map(e => ({
            ...e,
            amount: Number(e.amount)
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
}
