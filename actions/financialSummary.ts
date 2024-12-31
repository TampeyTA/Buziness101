'use server'
import {prisma} from '@/lib/prisma';

export async function getFinancialSummary() {
  const totalIncome = await prisma.incomeRecord.aggregate({
    _sum: {
      amount: true,
    },
  })

  const totalExpenses = await prisma.expenseRecord.aggregate({
    _sum: {
      amount: true,
    },
  })

  const totalIncomeAmount = totalIncome._sum.amount || 0
  const totalExpensesAmount = totalExpenses._sum.amount || 0
  const netProfit = totalIncomeAmount - totalExpensesAmount
  const profitMargin = totalIncomeAmount > 0 ? (netProfit / totalIncomeAmount) * 100 : 0

  return {
    totalIncome: totalIncomeAmount,
    totalExpenses: totalExpensesAmount,
    netProfit,
    profitMargin,
  }
}

