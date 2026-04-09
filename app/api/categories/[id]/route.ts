import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH - Update category
export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } },
) {
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

		// Verify category belongs to user
		const category = await prisma.category.findFirst({
			where: {
				id: params.id,
				userId: user.id,
			},
		});

		if (!category) {
			return NextResponse.json(
				{ error: 'Category not found' },
				{ status: 404 },
			);
		}

		const body = await request.json();
		const { name, icon, color, ruleType } = body;

		const updated = await prisma.category.update({
			where: { id: params.id },
			data: {
				...(name && { name }),
				...(icon && { icon }),
				...(color && { color }),
				...(ruleType && { ruleType }),
			},
		});

		return NextResponse.json(updated);
	} catch (error: any) {
		console.error('Error updating category:', error);

		// Handle duplicate category name
		if (error.code === 'P2002') {
			return NextResponse.json(
				{ error: 'Category name already exists' },
				{ status: 409 },
			);
		}

		return NextResponse.json(
			{ error: 'Failed to update category' },
			{ status: 500 },
		);
	}
}

// DELETE - Delete category
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } },
) {
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

		// Verify category belongs to user
		const category = await prisma.category.findFirst({
			where: {
				id: params.id,
				userId: user.id,
			},
		});

		if (!category) {
			return NextResponse.json(
				{ error: 'Category not found' },
				{ status: 404 },
			);
		}

		// Check if category is in use
		const expenseCount = await prisma.expense.count({
			where: { categoryId: params.id },
		});

		if (expenseCount > 0) {
			return NextResponse.json(
				{
					error: `Cannot delete category. ${expenseCount} expense(s) are using this category.`,
				},
				{ status: 400 },
			);
		}

		await prisma.category.delete({
			where: { id: params.id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting category:', error);
		return NextResponse.json(
			{ error: 'Failed to delete category' },
			{ status: 500 },
		);
	}
}
