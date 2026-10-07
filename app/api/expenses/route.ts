import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { expenseSchema } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await req.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const data: any = { ...parsed.data, userId: session.user.id as string };

  const workspaceId = await getCurrentWorkspaceId(session.user.id);
  if (!workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  
  data.workspaceId = workspaceId;

  // If categoryId provided, also fill legacy `category` string field for backward compatibility
  if (data.categoryId) {
    const cat = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { name: true },
    });
    if (cat) data.category = cat.name;
  }

  const exp = await prisma.expense.create({
    data,
    include: { categoryRef: true },
  });

  // Create notifications for all workspace members
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: true, owner: true }
  });

  if (workspace) {
    // Collect all members and owner
    const usersToNotify = [...workspace.members.map(m => m.id), workspace.owner.id];
    // Filter duplicates just in case
    const uniqueUsers = Array.from(new Set(usersToNotify));
    
    const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
    const message = `Có một khoản chi ${formatter.format(Number(data.amount))} vừa được thêm vào danh mục ${data.category || 'Khác'}.`;
    
    await prisma.notification.createMany({
      data: uniqueUsers.map(userId => ({
        userId,
        workspaceId,
        title: "Chi tiêu mới",
        message
      }))
    });
  }

  return NextResponse.json(exp);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = 20;
  
  const workspaceId = await getCurrentWorkspaceId(session.user.id);
  if (!workspaceId) return NextResponse.json({ items: [], total: 0, page, pageSize });

  const where: any = { workspaceId };
  if (searchParams.get("category")) where.category = searchParams.get("category");
  if (searchParams.get("q")) where.note = { contains: searchParams.get("q"), mode: "insensitive" };
  if (searchParams.get("from") && searchParams.get("to")) {
    where.date = { gte: new Date(searchParams.get("from")!), lte: new Date(searchParams.get("to")!) };
  }
  const [items, total] = await Promise.all([
    prisma.expense.findMany({ where, orderBy: { date: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.expense.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pageSize });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  
  const workspaceId = await getCurrentWorkspaceId(session.user.id);
  
  // Find expense before deleting to get its info
  const exp = await prisma.expense.findFirst({ where: { id, workspaceId } });
  
  await prisma.expense.deleteMany({ where: { id, workspaceId } });

  if (exp) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true, owner: true }
    });

    if (workspace) {
      const usersToNotify = Array.from(new Set([...workspace.members.map(m => m.id), workspace.owner.id]));
      const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
      const message = `Một khoản chi ${formatter.format(Number(exp.amount))} (${exp.category || 'Khác'}) vừa bị xóa.`;
      
      await prisma.notification.createMany({
        data: usersToNotify.map(userId => ({
          userId,
          workspaceId,
          title: "Xóa chi tiêu",
          message
        }))
      });
    }
  }

  return NextResponse.json({ ok: true });
}
