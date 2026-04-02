import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Parser } from "json2csv";

export async function GET() {
  const expenses = await prisma.expense.findMany({ orderBy: { date: "asc" } });
  const parser = new Parser({ fields: ["date", "amount", "category", "note"] });
  const csv = parser.parse(expenses.map((e) => ({ ...e, amount: Number(e.amount) })));
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="expenses.csv"`,
    },
  });
}
