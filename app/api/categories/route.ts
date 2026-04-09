import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCurrentWorkspaceId } from '@/lib/workspace';

// GET - List all categories for current user
export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const workspaceId = await getCurrentWorkspaceId(user.id);
		if (!workspaceId) {
			return NextResponse.json([]);
		}

		const categories = await prisma.category.findMany({
			where: { workspaceId },
			orderBy: { createdAt: 'asc' },
		});

		return NextResponse.json(categories);
	} catch (error) {
		console.error('Error fetching categories:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
			{ status: 500 },
		);
	}
}

// POST - Create new category
export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const body = await request.json();
		const { name, icon, color, ruleType } = body;

		if (!name) {
			return NextResponse.json(
				{ error: 'Category name is required' },
				{ status: 400 },
			);
		}

		const workspaceId = await getCurrentWorkspaceId(user.id);
		if (!workspaceId) {
			return NextResponse.json({ error: 'No workspace found' }, { status: 400 });
		}

		const category = await prisma.category.create({
			data: {
				name,
				icon: icon || '📁',
				color: color || '#3b82f6',
				ruleType: ruleType || 'NEEDS',
				userId: user.id,
				workspaceId,
			},
		});

		return NextResponse.json(category, { status: 201 });
	} catch (error: any) {
		console.error('Error creating category:', error);
		
		// Handle duplicate category name
		if (error.code === 'P2002') {
			return NextResponse.json(
				{ error: 'Category name already exists' },
				{ status: 409 },
			);
		}

		return NextResponse.json(
			{ error: 'Failed to create category' },
			{ status: 500 },
		);
	}
}
