import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { randomBytes } from "crypto";

function generateInviteCode() {
  return randomBytes(4).toString('hex').toUpperCase();
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, role } = body;
  if (!email || !password) return NextResponse.json({ error: "Thiếu email hoặc mật khẩu" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 });
  const hashed = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({ data: { email, password: hashed, role: (role as Role) || Role.WIFE } });
  
  // Auto-create personal workspace
  await prisma.workspace.create({
    data: {
      name: 'Cá nhân',
      inviteCode: generateInviteCode(),
      ownerId: user.id,
      members: { connect: { id: user.id } },
    }
  });

  return NextResponse.json({ ok: true });
}
