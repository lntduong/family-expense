import { NextResponse } from "next/server";
import { qrSchema } from "@/lib/validators";
import { generateVietQR } from "@/lib/vietqr";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = qrSchema.safeParse({
    bankBin: body.bankBin || process.env.VIETQR_BANK_BIN,
    accountNumber: body.accountNumber || process.env.VIETQR_ACCOUNT_NUMBER,
    accountName: body.accountName || process.env.VIETQR_ACCOUNT_NAME,
    description: body.description,
    amount: body.amount,
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = await generateVietQR(parsed.data);
  return NextResponse.json({ ...data });
}
