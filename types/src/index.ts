// Re-export all from individual modules
// Note: For utility functions with naming conflicts, import from specific modules
// (e.g., '@web-project/types/bills' or '@web-project/types/cdts')
export * from './accounts'
export * from './debts'
export * from './movements'
export * from './users'
export * from './budget'
export * from './notifications'

// Re-export bills with conflict resolution
export type { Bill, CreateBill, UpdateBill } from './bills'
export {
  BillCycle,
  BillStatus,
  BillCategory,
  BillSchema,
  CreateBillSchema,
  UpdateBillSchema,
  getDaysUntilDue,
  generateNextBill,
  getUpcomingBills,
  getOverdueBills,
  getTotalByCategory as getBillsTotalByCategory
} from './bills'
export { isDueSoon as isBillDueSoon, isOverdue as isBillOverdue } from './bills'

// Re-export cdts with conflict resolution
export type { Cdt, CreateCdt, UpdateCdt } from './cdts'
export {
  CdtStatus,
  CdtSchema,
  CreateCdtSchema,
  UpdateCdtSchema,
  calculateFinalAmount,
  calculateInterestEarned,
  calculateDueDate,
  getDaysRemaining,
  calculateProgress,
  calculateAccruedInterest,
  getUpcomingCdts,
  getTotalInvested,
  getTotalExpectedReturn,
  getTotalExpectedInterest
} from './cdts'
export { isDueSoon as isCdtDueSoon, isOverdue as isCdtOverdue } from './cdts'
