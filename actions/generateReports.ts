'use server'
import { prisma } from '@/lib/prisma'
import { subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay } from 'date-fns'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Define the types for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body: string[][];
  theme?: string;
  headStyles?: {
    fillColor?: number[];
    textColor?: number;
    fontSize?: number;
    halign?: string;
  };
  styles?: {
    fontSize?: number;
    cellPadding?: number;
    halign?: string;
  };
  columnStyles?: {
    [key: number]: {
      halign?: string;
      fontStyle?: string;
    };
  };
}

const PAGE_HEIGHT = 280
const LINE_HEIGHT = 10
const MARGIN_TOP = 20
const PAGE_WIDTH = 210

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

    // Title
    doc.setFontSize(18)
    doc.text(reportTitle, PAGE_WIDTH / 2, yPos, { align: 'center' })
    yPos += LINE_HEIGHT * 2

    // Summary Section
    const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0)
    const totalExpenses = expenseRecords.reduce((sum, record) => sum + record.amount, 0)
    const totalUtilityBill = utilityBill.reduce((sum, record) => sum + record.initialUnits, 0)
    const totalElectricityUsage = electricityUsage.reduce((sum, record) => sum + record.unitsUsed, 0)
    
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

    

    // Income Records
    if (incomeRecords.length > 0) {
      checkNewPage(LINE_HEIGHT * 2)
      doc.setFontSize(14)
      doc.text('Income Records:', 10, yPos)
      yPos += LINE_HEIGHT

      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Amount (MWK)']],
        body: incomeRecords.map(record => [
          record.date.toISOString().split('T')[0],
          record.amount.toFixed(2)
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontSize: 12,
          halign: 'center',
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        columnStyles: {
          1: { halign: 'center' },
        },
      })

      yPos = (doc as any).lastAutoTable.finalY + LINE_HEIGHT
    }

    // Expense Records
    if (expenseRecords.length > 0) {
      checkNewPage(LINE_HEIGHT * 2)
      doc.setFontSize(14)
      doc.text('Expense Records:', 10, yPos)
      yPos += LINE_HEIGHT

      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Amount (MWK)', 'Category']],
        body: expenseRecords.map(record => [
          record.date.toISOString().split('T')[0],
          record.amount.toFixed(2),
          record.category
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontSize: 12,
          halign: 'center',
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        columnStyles: {
          1: { halign: 'center' },
        },
      })

      yPos = (doc as any).lastAutoTable.finalY + LINE_HEIGHT
    }

    // Utility Bills Records
    if (utilityBill.length > 0) {
      checkNewPage(LINE_HEIGHT * 2)
      doc.setFontSize(14)
      doc.text('Utility Bills Records:', 10, yPos)
      yPos += LINE_HEIGHT

      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Total Cost (MWK)', 'Initial Units (KWH)', 'Used Units (KWH)']],
        body: utilityBill.map(record => [
          record.startDate.toISOString().split('T')[0],
          record.totalCostMWK.toFixed(2),
          record.initialUnits.toFixed(2),
          (record.initialUnits - record.remainingUnits).toFixed(2)
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontSize: 12,
          halign: 'center',
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' },
        },
      })

      yPos = (doc as any).lastAutoTable.finalY + LINE_HEIGHT
    }

    // Electricity Usage Records
    if (electricityUsage.length > 0) {
      checkNewPage(LINE_HEIGHT * 2)
      doc.setFontSize(14)
      doc.text('Electricity Usage Records:', 10, yPos)
      yPos += LINE_HEIGHT

      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Units Used (KWH)', 'Cost (MWK)']],
        body: electricityUsage.map(record => [
          record.date.toISOString().split('T')[0],
          record.unitsUsed.toFixed(2),
          record.costMWK.toFixed(2)
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: 255,
          fontSize: 12,
          halign: 'center',
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'center' },
        },
      })

      yPos = (doc as any).lastAutoTable.finalY + LINE_HEIGHT
    }

    // Add page numbers
    const pageCount = (doc as any).internal.pages.length
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(
        `Page ${i} of ${pageCount}`,
        PAGE_WIDTH / 2,
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
  
  // Title
  doc.setFontSize(18)
  doc.text('Maize Milling Business - Manual Entry Form', PAGE_WIDTH / 2, MARGIN_TOP, { align: 'center' })

  // Create form table
  doc.autoTable({
    startY: MARGIN_TOP + 20,
    head: [['Date', 'Income (MWK)', 'Expense (MWK)', 'Category', 'Units (KWH)']],
    body: Array(20).fill(['____________', '____________', '____________', '____________', '____________']),
    theme: 'grid',
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontSize: 12,
      halign: 'center',
    },
    styles: {
      fontSize: 10,
      cellPadding: 8,
      halign: 'center',
    },
  })

  // Add page numbers
  const pageCount = (doc as any).internal.pages.length
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.text(
      `Page ${i} of ${pageCount}`,
      PAGE_WIDTH / 2,
      290,
      { align: 'center' }
    )
  }

  return doc.output('arraybuffer')
}

