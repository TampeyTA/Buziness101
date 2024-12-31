'use server'
import { prisma } from '@/lib/prisma';
import { subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';
import {  } from '@/types';
import jsPDF from 'jspdf'

const PAGE_HEIGHT = 280
const LINE_HEIGHT = 10
const MARGIN_TOP = 20

export async function generatePDFReport(period: 'week' | 'month' | '6months' | 'year') {
  try {
    const endDate = new Date()
    let startDate: Date
    let reportTitle: string

    switch (period) {
      case 'week':
        startDate = subDays(endDate, 7)
        reportTitle = 'Weekly Report (Last 7 Days)'
        break
      case 'month':
        startDate = subWeeks(endDate, 4)
        reportTitle = 'Monthly Report (Last 4 Weeks)'
        break
      case '6months':
        startDate = subMonths(endDate, 6)
        reportTitle = '6-Month Report'
        break
      case 'year':
        startDate = subYears(endDate, 1)
        reportTitle = 'Yearly Report'
        break
    }

    const utcStartDate = startOfDay(new Date(startDate.toISOString()))
    const utcEndDate = endOfDay(new Date(endDate.toISOString()))

    console.log('Date range:', { utcStartDate, utcEndDate })

    const [incomeRecords, expenseRecords, utilityBill, electricityUsage] = await Promise.all([
      prisma.incomeRecord.findMany({
        where: {
          date: {
            gte: utcStartDate,
            lte: utcEndDate,
          },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.expenseRecord.findMany({
        where: {
          date: {
            gte: utcStartDate,
            lte: utcEndDate,
          },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.utilityBill.findMany({
        where: {
          startDate: {
            gte: utcStartDate,
            lte: utcEndDate,
          },
        },
        orderBy: { startDate: 'asc' }
      }),
      prisma.electricityUsage.findMany({
        where: {
          date: {
            gte: utcStartDate,
            lte: utcEndDate,
          },
        },
        orderBy: { date: 'asc' }
      }),
    ])

    console.log('Retrieved records:', {
      incomeCount: incomeRecords.length,
      expenseCount: expenseRecords.length,
      utilityCount: utilityBill.length,
      usageCount: electricityUsage.length
    })

    if (!incomeRecords.length && !expenseRecords.length && !utilityBill.length && !electricityUsage.length) {
      throw new Error('No records found for the selected period')
    }

    const doc = new jsPDF()
    let yPos = MARGIN_TOP

    const checkNewPage = (requiredSpace: number = LINE_HEIGHT) => {
      if (yPos + requiredSpace > PAGE_HEIGHT) {
        doc.addPage()
        yPos = MARGIN_TOP
        return true
      }
      return false
    }

    doc.setFontSize(18)
    doc.text(reportTitle, 105, yPos, { align: 'center' })
    yPos += LINE_HEIGHT * 2

    const totalIncome = incomeRecords.reduce((sum: any, record: any) => sum + record.amount, 0)
    const totalExpenses = expenseRecords.reduce((sum: any, record: any) => sum + record.amount, 0)
    const totalUtilityBill = utilityBill.reduce((sum: any, record: any) => sum + record.initialUnits, 0)
    const totalElectricityUsage = electricityUsage.reduce((sum: any, record: any) => sum + record.unitsUsed, 0)
    
    doc.setFontSize(14)
    doc.text(`Total Income: MWK ${totalIncome.toFixed(2)}`, 10, yPos)
    yPos += LINE_HEIGHT
    doc.text(`Total Expenses: MWK ${totalExpenses.toFixed(2)}`, 10, yPos)
    yPos += LINE_HEIGHT
    doc.text(`Net Balance: MWK ${(totalIncome - totalExpenses).toFixed(2)}`, 10, yPos)
    yPos += LINE_HEIGHT
    doc.text(`Total Units Purchased: KWH ${totalUtilityBill.toFixed(2)}`, 10, yPos)
    yPos += LINE_HEIGHT
    doc.text(`Total Units Consumed: KWH ${totalElectricityUsage.toFixed(2)}`, 10, yPos)
    yPos += LINE_HEIGHT * 2

    if (incomeRecords.length > 0) {
      checkNewPage(LINE_HEIGHT * 2)
      doc.text('Income Records:', 10, yPos)
      yPos += LINE_HEIGHT

      doc.setFontSize(12)
      incomeRecords.forEach((record: any) => {
        checkNewPage()
        doc.text(
          `Date: ${record.date.toISOString().split('T')[0]}, Amount: MWK ${record.amount.toFixed(2)}`,
          10,
          yPos
        )
        yPos += LINE_HEIGHT
      })
    }

    if (expenseRecords.length > 0) {
      yPos += LINE_HEIGHT
      checkNewPage(LINE_HEIGHT * 2)
      doc.setFontSize(14)
      doc.text('Expense Records:', 10, yPos)
      yPos += LINE_HEIGHT

      doc.setFontSize(12)
      expenseRecords.forEach((record: any) => {
        checkNewPage()
        doc.text(
          `Date: ${record.date.toISOString().split('T')[0]}, Amount: MWK ${record.amount.toFixed(2)}, Category: ${record.category}`,
          10,
          yPos
        )
        yPos += LINE_HEIGHT
      })
    }

    if (utilityBill.length > 0) {
      yPos += LINE_HEIGHT
      checkNewPage(LINE_HEIGHT * 2)
      doc.setFontSize(14)
      doc.text('Utility Bills Records:', 10, yPos)
      yPos += LINE_HEIGHT

      doc.setFontSize(12)
      utilityBill.forEach((record: any) => {
        checkNewPage()
        doc.text(
          `Date: ${record.startDate.toISOString().split('T')[0]}, Total Cost: MWK ${record.totalCostMWK}, Initial Units: KWH ${record.initialUnits.toFixed(2)}, Used: KWH ${(record.initialUnits - record.remainingUnits).toFixed(2)}`,
          10,
          yPos
        )
        yPos += LINE_HEIGHT
      })
    }

    if (electricityUsage.length > 0) {
      yPos += LINE_HEIGHT
      checkNewPage(LINE_HEIGHT * 2)
      doc.setFontSize(14)
      doc.text('Electricity Usage Records:', 10, yPos)
      yPos += LINE_HEIGHT

      doc.setFontSize(12)
      electricityUsage.forEach((record: any) => {
        checkNewPage()
        doc.text(
          `Date: ${record.date.toISOString().split('T')[0]}, Units Used: KWH ${record.unitsUsed.toFixed(2)}, Cost: MWK ${record.costMWK.toFixed(2)}`,
          10,
          yPos
        )
        yPos += LINE_HEIGHT
      })
    }

    const pageCount = (doc as any).internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        290,
        { align: 'center' }
      )
    }

    const output = doc.output('arraybuffer')
    if (!output || output.byteLength === 0) {
      throw new Error('Generated PDF is empty')
    }
    
    return output
  } catch (error) {
    console.error('Error in generatePDFReport:', error)
    throw error
  }
}

export async function generateBlankPDF() {
  const doc = new jsPDF()
  let yPos = MARGIN_TOP

  const checkNewPage = (requiredSpace: number = LINE_HEIGHT) => {
    if (yPos + requiredSpace > PAGE_HEIGHT) {
      doc.addPage()
      yPos = MARGIN_TOP
      return true
    }
    return false
  }

  doc.setFontSize(18)
  doc.text('Maize Milling Business - Manual Entry Form', 105, yPos, { align: 'center' })
  yPos += LINE_HEIGHT * 2

  for (let i = 0; i < 20; i++) {
    checkNewPage()
    doc.setFontSize(12)
    doc.text(
      `Date: ____________ Income: ____________ Expense: ____________ Category: ____________
      Units: ______________
      `,
      10,
      yPos
    )
    yPos += LINE_HEIGHT
  }

  const pageCount = (doc as any).internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    )
  }

  return doc.output('arraybuffer')
}