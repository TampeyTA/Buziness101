'use server'

import { prisma } from '../lib/prisma'
import { TrendDataPoint } from '@/types'

interface IncomeRecord {
  date: Date;
  amount: number;
}

interface ExpenseRecord {
  date: Date;
  amount: number;
}

export async function getTrendsData(): Promise<TrendDataPoint[]> {
  const incomeData = await prisma.incomeRecord.findMany({
    select: {
      date: true,
      amount: true,
    },
    orderBy: {
      date: 'asc',
    },
  }) as IncomeRecord[]

  const expenseData = await prisma.expenseRecord.findMany({
    select: {
      date: true,
      amount: true,
    },
    orderBy: {
      date: 'asc',
    },
  }) as ExpenseRecord[]

  const trendsData: TrendDataPoint[] = incomeData.map((income) => {
    const matchingExpense = expenseData.find(
      (expense) => expense.date.toISOString() === income.date.toISOString()
    )
    return {
      date: income.date.toISOString().split('T')[0],
      income: income.amount,
      expenses: matchingExpense ? matchingExpense.amount : 0,
      profit: income.amount - (matchingExpense ? matchingExpense.amount : 0),
    }
  })

  return trendsData
}