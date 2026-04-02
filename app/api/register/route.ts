import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, role } = body;
  if (!email || !password) return NextResponse.json({ error: "Thiếu email hoặc mật khẩu" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 });
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, password: hashed, role: (role as Role) || Role.WIFE } });
  return NextResponse.json({ ok: true });
}
