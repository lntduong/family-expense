import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(2).optional(), // Keep for backward compatibility
  categoryId: z.string().optional(),
  note: z.string().max(200).optional(),
  date: z.coerce.date(),
  recurring: z.boolean().optional(),
  receiptUrl: z.string().url().optional(),
});

export const budgetSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  limit: z.number().positive(),
});

export const qrSchema = z.object({
  amount: z.number().positive(),
  description: z.string().max(50).optional(),
  bankBin: z.string().min(3).max(8),
  accountNumber: z.string(),
  accountName: z.string(),
});
