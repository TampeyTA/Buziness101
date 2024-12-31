import { SVGProps } from "react";
/*import { Prisma } from '@/prisma/client'*/

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Electricity Usage Types
export interface ElectricityUsageData {
  unitsUsed: number
  costMWK: number
  notes?: string | null
}

export interface ElectricityUsageRecord extends ElectricityUsageData {
  id: number
  date: Date
  billId: number
}

export interface UtilityBillData {
  initialUnits: number
  totalCostMWK: number
}

export interface UtilityBill extends UtilityBillData {
  id: number
  remainingUnits: number
  isActive: boolean
  startDate: Date
  usageRecords: ElectricityUsageRecord[]
}

export interface RemainingDaysEstimate {
  averageDailyUsage: number
  estimatedRemainingDays: number | null
}

export interface DailyUsageTrend {
  date: string
  totalUnits: number
  totalCost: number
}

export interface LowBalanceAlert {
  isLow: boolean
  remainingUnits: number
  percentageRemaining: number
  threshold: number
}

export interface MonthlyComparison {
  currentMonth: {
    units: number
    cost: number
  }
  lastMonth: {
    units: number
    cost: number
  }
}

// Report Generation Types
export type ReportPeriod = 'week' | 'month' | '6months' | 'year'

export interface IncomeRecord {
  id: number
  date: Date
  amount: number
}

export interface ExpenseRecord {
  id: number
  date: Date
  amount: number
  category: string
}

export interface ReportData {
  incomeRecords: IncomeRecord[]
  expenseRecords: ExpenseRecord[]
  utilityBills: UtilityBill[]
  electricityUsage: ElectricityUsageRecord[]
}

export interface ReportSummary {
  totalIncome: number
  totalExpenses: number
  totalUtilityUnits: number
  totalElectricityUsage: number
  netBalance: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface TransactionResult {
  usage: ElectricityUsageRecord
  updatedBill: UtilityBill
}

// Utility Types
export type DateRange = {
  startDate: Date
  endDate: Date
}

// Prisma Aggregation Result Types
export type UsageStatistics = {
  _sum: {
    unitsUsed: number | null
    costMWK: number | null
  }
  _avg: {
    unitsUsed: number | null
    costMWK: number | null
  }
  _max: {
    unitsUsed: number | null
    costMWK: number | null
  }
  _min: {
    unitsUsed: number | null
    costMWK: number | null
  }
}

export interface TrendDataPoint {
  date: string;
  income: number;
  expenses: number;
  profit: number;
}
