import { z } from "zod/v4";

export const MonthlyBudgetConfigSchema = z.object({
  id: z.string(),
  userId: z.string(),
  year: z.number().int().min(2000),
  month: z.number().int().min(1).max(12),
  amount: z.union([z.string(), z.number()]),
  currency: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MonthlyBudgetSummarySchema = z.object({
  year: z.number().int().min(2000),
  month: z.number().int().min(1).max(12),
  totals: z.object({
    movements: z.object({
      expenses: z.number(),
      income: z.number(),
      net: z.number(),
    }),
    debts: z.object({
      payments: z.number(),
    }),
    bills: z.object({
      total: z.number(),
      paid: z.number(),
      pending: z.number(),
    }),
    cdts: z.object({
      invested: z.number(),
    }),
  }),
  overall: z.object({
    limit: z.number(),
    used: z.number(),
    remaining: z.number(),
    usagePercentage: z.number(),
  }),
});

export const BudgetSummaryResponseSchema = z.object({
  config: MonthlyBudgetConfigSchema.nullable(),
  summary: MonthlyBudgetSummarySchema,
});

export const BudgetUpsertSchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().min(1).max(10).default("COP"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
});

export type MonthlyBudgetConfig = z.infer<typeof MonthlyBudgetConfigSchema>;
export type MonthlyBudgetSummary = z.infer<typeof MonthlyBudgetSummarySchema>;
export type BudgetSummaryResponse = z.infer<typeof BudgetSummaryResponseSchema>;
export type BudgetUpsertInput = z.infer<typeof BudgetUpsertSchema>;
