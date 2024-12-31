'use server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
export async function calculateProfitLoss(startDate: Date, endDate: Date) {
  const income = await prisma.incomeRecord.aggregate({
    where: {
      date: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
    },
    _sum: {
      amount: true,
    },
  })

  const expenses = await prisma.expenseRecord.aggregate({
    where: {
      date: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
    },
    _sum: {
      amount: true,
    },
  })

  const incomeAmount = income._sum.amount || 0
  const expensesAmount = expenses._sum.amount || 0
  const profit = incomeAmount - expensesAmount

  return { income: incomeAmount, expenses: expensesAmount, profit }
}
