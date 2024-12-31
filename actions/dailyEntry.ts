'use server'
import { prisma } from '../lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addIncomeRecord(date: Date, amount: number, notes: string) {
  await prisma.incomeRecord.create({
    data: {
      date,
      amount,
      notes,
    },
  })
  revalidatePath('/dashboard')
}

export async function addExpenseRecord(date: Date, amount: number, category: string, notes: string) {
  await prisma.expenseRecord.create({
    data: {
      date,
      amount,
      category,
      notes,
    },
  })
  revalidatePath('/dashboard')
}

