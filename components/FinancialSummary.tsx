'use client';

import { useState, useEffect } from 'react';
import { getFinancialSummary } from '@/actions/financialSummary';
import { Card, CardBody, Spinner } from "@nextui-org/react";
import { TrendingUp, TrendingDown, Banknote, Percent } from 'lucide-react';

interface FinancialSummaryProps {
  lastUpdate?: Date | null;
}

export default function FinancialSummary({ lastUpdate }: FinancialSummaryProps) {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setIsLoading(true);
        const data = await getFinancialSummary();
        setSummary(data);
      } catch (err) {
        setError('Failed to fetch financial summary');
        console.error('Error fetching financial summary:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();
  }, [lastUpdate]);

    if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" label="Loading financial summary..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-danger bg-danger-50 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4 text-warning bg-warning-50 rounded-lg text-center">
        No financial data available
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Income",
      value: `MWK ${summary.totalIncome.toFixed(2)}`,
      icon: Banknote,
      color: "success",
      trend: summary.totalIncome > 0 ? "up" : "down"
    },
    {
      title: "Total Expenses",
      value: `MWK ${summary.totalExpenses.toFixed(2)}`,
      icon: Banknote,
      color: "danger",
      trend: summary.totalExpenses > 0 ? "up" : "down"
    },
    {
      title: "Net Profit",
      value: `MWK ${summary.netProfit.toFixed(2)}`,
      icon: TrendingUp,
      color: summary.netProfit >= 0 ? "success" : "danger",
      trend: summary.netProfit >= 0 ? "up" : "down"
    },
    {
      title: "Profit Margin",
      value: `${summary.profitMargin.toFixed(2)}%`,
      icon: Percent,
      color: summary.profitMargin >= 0 ? "success" : "danger",
      trend: summary.profitMargin >= 0 ? "up" : "down"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-content1">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <metric.icon 
                  className={`text-${metric.color}`} 
                  size={24} 
                />
                <h3 className="text-sm font-medium">{metric.title}</h3>
              </div>
              {metric.trend === "up" ? (
                <TrendingUp className={`text-${metric.color}`} size={20} />
              ) : (
                <TrendingDown className={`text-${metric.color}`} size={20} />
              )}
            </div>
            <p className={`text-${metric.color} text-2xl font-bold mt-2`}>
              {metric.value}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}