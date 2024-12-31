'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ElectricityUsageData, UtilityBillData, RemainingDaysEstimate  } from '@/types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


export async function addNewUtilityBill(data: UtilityBillData) {
  try {
    await prisma.utilityBill.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    const bill = await prisma.utilityBill.create({
      data: {
        initialUnits: data.initialUnits,
        remainingUnits: data.initialUnits,
        totalCostMWK: data.totalCostMWK,
        isActive: true
      },
    });
    
    return { success: true, data: bill };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.code, error.message);
    }
    throw new Error('Failed to add utility bill');
  }
}

export async function getUsageHistory(limit: number = 10) {
  try {
    const activeBill = await prisma.utilityBill.findFirst({
      where: { isActive: true }
    });

    if (!activeBill) {
      return [];
    }

    const usageRecords = await prisma.electricityUsage.findMany({
      where: {
        billId: activeBill.id
      },
      orderBy: {
        date: 'desc'
      },
      take: limit
    });

    return usageRecords;
  } catch (error) {
    console.error('Error fetching usage history:', error);
    return [];
  }
}

export async function addPastElectricityUsage(data: ElectricityUsageData & { date: Date }) {
  try {
    const activeBill = await prisma.utilityBill.findFirst({
      where: { isActive: true }
    });

    if (!activeBill) {
      throw new Error('No active utility bill found');
    }

    if (activeBill.remainingUnits < data.unitsUsed) {
      throw new Error('Insufficient units remaining');
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const usage = await tx.electricityUsage.create({
        data: {
          unitsUsed: data.unitsUsed,
          costMWK: data.costMWK,
          notes: data.notes || null,
          billId: activeBill.id,
          date: data.date
        },
      });

      const updatedBill = await tx.utilityBill.update({
        where: { id: activeBill.id },
        data: { 
          remainingUnits: activeBill.remainingUnits - data.unitsUsed,
          isActive: (activeBill.remainingUnits - data.unitsUsed) > 0
        },
      });

      return { usage, updatedBill };
    });

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.code, error.message);
    }
    throw error;
  }
}




export async function addElectricityUsage(data: ElectricityUsageData) {
  try {
    const activeBill = await prisma.utilityBill.findFirst({
      where: { isActive: true }
    });

    if (!activeBill) {
      throw new Error('No active utility bill found');
    }

    if (activeBill.remainingUnits < data.unitsUsed) {
      throw new Error('Insufficient units remaining');
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const usage = await tx.electricityUsage.create({
        data: {
          unitsUsed: data.unitsUsed,
          costMWK: data.costMWK,
          notes: data.notes || null,
          billId: activeBill.id
        },
      });

      const updatedBill = await tx.utilityBill.update({
        where: { id: activeBill.id },
        data: { 
          remainingUnits: activeBill.remainingUnits - data.unitsUsed,
          isActive: (activeBill.remainingUnits - data.unitsUsed) > 0
        },
      });

      return { usage, updatedBill };
    });

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.code, error.message);
    }
    throw error;
  }
}

export async function getActiveUtilityBill() {
  try {
    const bill = await prisma.utilityBill.findFirst({
      where: { isActive: true },
      include: {
        usageRecords: {
          orderBy: { date: 'desc' }
        }
      },
    });
    return bill;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.code, error.message);
    }
    throw new Error('Failed to fetch active utility bill');
  }
}

export async function getUtilityBillHistory(limit: number = 5) {
  try {
    const bills = await prisma.utilityBill.findMany({
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        usageRecords: {
          orderBy: { date: 'desc' }
        }
      },
    });
    return bills;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.code, error.message);
    }
    throw new Error('Failed to fetch utility bill history');
  }
}

export async function getUsageStatistics(billId: number) {
  try {
    const usageStats = await prisma.electricityUsage.aggregate({
      where: { billId },
      _sum: {
        unitsUsed: true,
        costMWK: true
      },
      _avg: {
        unitsUsed: true,
        costMWK: true
      },
      _max: {
        unitsUsed: true,
        costMWK: true
      },
      _min: {
        unitsUsed: true,
        costMWK: true
      },
    });
    return usageStats;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.code, error.message);
    }
    throw new Error('Failed to calculate usage statistics');
  }
}

export async function calculateRemainingDaysEstimate(billId: number): Promise<RemainingDaysEstimate | null> {
  try {
    const bill = await prisma.utilityBill.findUnique({
      where: { id: billId },
      include: {
        usageRecords: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    if (bill.usageRecords.length === 0) {
      return null; // Not enough data to make an estimate
    }

    const totalUsage = bill.usageRecords.reduce((acc: any, record: any) => acc + record.unitsUsed, 0);
    const averageDaily = totalUsage / bill.usageRecords.length;
    
    const remainingDays = averageDaily > 0 
      ? Math.floor(bill.remainingUnits / averageDaily)
      : null;

    return {
      averageDailyUsage: Number(averageDaily.toFixed(2)),
      estimatedRemainingDays: remainingDays
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.code, error.message);
    }
    throw new Error('Failed to calculate remaining days estimate');
  }
}

export async function getDailyUsageTrend(billId: number, days: number = 7) {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const usageRecords = await prisma.electricityUsage.findMany({
      where: {
        billId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      },
    });

    // Group by date and calculate daily totals
    const dailyUsage = usageRecords.reduce((acc: any, record: any) => {
      const date = record.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          totalUnits: 0,
          totalCost: 0
        };
      }
      acc[date].totalUnits += record.unitsUsed;
      acc[date].totalCost += record.costMWK;
      return acc;
    }, {} as Record<string, { date: string; totalUnits: number; totalCost: number; }>);

    return Object.values(dailyUsage);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.code, error.message);
    }
    throw new Error('Failed to fetch daily usage trend');
  }
}

export async function checkLowBalanceAlert(billId: number, threshold: number = 50) {
  try {
    const bill = await prisma.utilityBill.findUnique({
      where: { id: billId }
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    const isLow = bill.remainingUnits <= threshold;
    const percentageRemaining = (bill.remainingUnits / bill.initialUnits) * 100;

    return {
      isLow,
      remainingUnits: bill.remainingUnits,
      percentageRemaining: Number(percentageRemaining.toFixed(2)),
      threshold
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.code, error.message);
    }
    throw new Error('Failed to check low balance alert');
  }
}

export async function getMonthlyComparison(billId: number) {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfLastMonth = new Date(firstDayOfMonth);
    lastDayOfLastMonth.setDate(lastDayOfLastMonth.getDate() - 1);
    const firstDayOfLastMonth = new Date(lastDayOfLastMonth.getFullYear(), lastDayOfLastMonth.getMonth(), 1);

    const [currentMonth, lastMonth] = await Promise.all([
      prisma.electricityUsage.aggregate({
        where: {
          billId,
          date: {
            gte: firstDayOfMonth
          }
        },
        _sum: {
          unitsUsed: true,
          costMWK: true
        }
      }),
      prisma.electricityUsage.aggregate({
        where: {
          billId,
          date: {
            gte: firstDayOfLastMonth,
            lt: firstDayOfMonth
          }
        },
        _sum: {
          unitsUsed: true,
          costMWK: true
        }
      })
    ]);

    return {
      currentMonth: {
        units: currentMonth._sum.unitsUsed || 0,
        cost: currentMonth._sum.costMWK || 0
      },
      lastMonth: {
        units: lastMonth._sum.unitsUsed || 0,
        cost: lastMonth._sum.costMWK || 0
      }
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error:', error.code, error.message);
    }
    throw new Error('Failed to get monthly comparison');
  }
}

