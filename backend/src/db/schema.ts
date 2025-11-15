import { mysqlTable, varchar, decimal, boolean, datetime, int, text, mysqlEnum, uniqueIndex, index } from 'drizzle-orm/mysql-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';

// ============================================
// USERS TABLE
// ============================================
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  username: varchar('username', { length: 191 }).notNull(),
  email: varchar('email', { length: 191 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
}, (table) => ({
  usernameIdx: uniqueIndex('users_username_idx').on(table.username),
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
}));

// ============================================
// ACCOUNTS TABLE
// ============================================
export const accounts = mysqlTable('accounts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  institution: varchar('institution', { length: 255 }).notNull(),
  accountType: mysqlEnum('account_type', [
    'ahorro',
    'corriente',
    'inversion',
    'nomina',
    'efectivo',
    'otro'
  ]).notNull(),
  accountNumber: varchar('account_number', { length: 255 }),
  currency: mysqlEnum('currency', [
    'ARS',
    'USD',
    'EUR',
    'BRL',
    'CLP',
    'UYU',
    'MXN',
    'COP',
    'PEN',
    'otro'
  ]).notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).notNull(),
  isNational: boolean('is_national').notNull().default(true),
  owner: varchar('owner', { length: 255 }).notNull(),
  status: mysqlEnum('status', ['activa', 'inactiva', 'bloqueada']).notNull().default('activa'),
  description: text('description'),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
});

// ============================================
// BILLS TABLE
// ============================================
export const bills = mysqlTable('bills', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 255 }).notNull(),
  category: mysqlEnum('category', [
    'electricidad',
    'agua',
    'gas',
    'internet',
    'telefono',
    'cable',
    'streaming',
    'alquiler',
    'condominio',
    'seguro',
    'otros'
  ]).notNull(),
  cycle: mysqlEnum('cycle', [
    'mensual',
    'bimestral',
    'trimestral',
    'semestral',
    'anual'
  ]).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  dueDate: datetime('due_date').notNull(),
  status: mysqlEnum('status', ['pendiente', 'pagado', 'vencido']).notNull().default('pendiente'),
  paymentDate: datetime('payment_date'),
  attachment: varchar('attachment', { length: 500 }),
  description: text('description'),
  autoRenew: boolean('auto_renew').default(false),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
});

// ============================================
// CDTS TABLE
// ============================================
export const cdts = mysqlTable('cdts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  institution: varchar('institution', { length: 255 }).notNull(),
  openingDate: datetime('opening_date').notNull(),
  initialAmount: decimal('initial_amount', { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal('interest_rate', { precision: 5, scale: 2 }).notNull(),
  term: int('term').notNull(), // d�as
  dueDate: datetime('due_date').notNull(),
  finalAmount: decimal('final_amount', { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['activo', 'vencido', 'cancelado']).notNull().default('activo'),
  autoRenew: boolean('auto_renew').default(false),
  description: text('description'),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
});

// ============================================
// DEBTS TABLE
// ============================================
export const debts = mysqlTable('debts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: mysqlEnum('type', ['deuda', 'prestamo']).notNull(),
  origin: varchar('origin', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal('interest_rate', { precision: 5, scale: 2 }).notNull(),
  installments: int('installments').notNull(),
  startDate: datetime('start_date').notNull(),
  paymentDay: int('payment_day').notNull(),
  description: text('description'),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
});

// ============================================
// PAYMENTS TABLE
// ============================================
export const payments = mysqlTable('payments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  debtId: varchar('debt_id', { length: 36 }).notNull(),
  installmentNumber: int('installment_number').notNull(),
  dueDate: datetime('due_date').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  principal: decimal('principal', { precision: 15, scale: 2 }).notNull(),
  interest: decimal('interest', { precision: 15, scale: 2 }).notNull(),
  isPaid: boolean('is_paid').notNull().default(false),
  paidDate: datetime('paid_date'),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
});

// ============================================
// MOVEMENTS TABLE
// ============================================
export const movements = mysqlTable('movements', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: mysqlEnum('type', ['ingreso', 'egreso']).notNull(),
  category: mysqlEnum('category', [
    'comida',
    'transporte',
    'servicios',
    'ocio',
    'salud',
    'educacion',
    'vivienda',
    'otros'
  ]).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  tags: text('tags'), // JSON string array
  attachment: varchar('attachment', { length: 500 }),
  date: datetime('date').notNull(),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
});

// ============================================
// MONTHLY BUDGETS TABLE
// ============================================
export const monthlyBudgets = mysqlTable('monthly_budgets', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  year: int('year').notNull(),
  month: int('month').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('COP'),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').notNull().$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => ({
  uniqueYearMonthIdx: uniqueIndex('monthly_budgets_year_month_idx').on(table.userId, table.year, table.month),
}));

// ============================================
// NOTIFICATIONS TABLE
// ============================================
export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: mysqlEnum('type', ['info', 'warning', 'alert']).notNull().default('info'),
  status: mysqlEnum('status', ['unread', 'read']).notNull().default('unread'),
  resourceType: varchar('resource_type', { length: 100 }),
  resourceId: varchar('resource_id', { length: 36 }),
  eventType: varchar('event_type', { length: 100 }),
  createdAt: datetime('created_at').notNull().$defaultFn(() => new Date()),
  readAt: datetime('read_at'),
}, (table) => ({
  userResourceEventIdx: index('notifications_user_resource_event_idx').on(table.userId, table.resourceId, table.eventType),
}));

// ============================================
// RELATIONS
// ============================================
export const debtsRelations = relations(debts, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  debt: one(debts, {
    fields: [payments.debtId],
    references: [debts.id],
  }),
}));

// ============================================
// DRIZZLE-ZOD SCHEMAS
// ============================================

export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertBillSchema = createInsertSchema(bills);
export const selectBillSchema = createSelectSchema(bills);

export const insertCdtSchema = createInsertSchema(cdts);
export const selectCdtSchema = createSelectSchema(cdts);

export const insertDebtSchema = createInsertSchema(debts);
export const selectDebtSchema = createSelectSchema(debts);

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

export const insertMovementSchema = createInsertSchema(movements);
export const selectMovementSchema = createSelectSchema(movements);
export const insertMonthlyBudgetSchema = createInsertSchema(monthlyBudgets);
export const selectMonthlyBudgetSchema = createSelectSchema(monthlyBudgets);
export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);

// ============================================
// TYPES
// ============================================
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Bill = typeof bills.$inferSelect;
export type InsertBill = typeof bills.$inferInsert;

export type Cdt = typeof cdts.$inferSelect;
export type InsertCdt = typeof cdts.$inferInsert;

export type Debt = typeof debts.$inferSelect;
export type InsertDebt = typeof debts.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export type Movement = typeof movements.$inferSelect;
export type InsertMovement = typeof movements.$inferInsert;
export type MonthlyBudget = typeof monthlyBudgets.$inferSelect;
export type InsertMonthlyBudget = typeof monthlyBudgets.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
