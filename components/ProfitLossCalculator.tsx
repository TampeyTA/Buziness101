'use client'

import { useState } from 'react'
import { calculateProfitLoss } from '@/actions/calculateProfitLoss'
import { Card, CardHeader, CardBody, Input, Button, Divider } from "@nextui-org/react";

export default function ProfitLossCalculator() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [result, setResult] = useState<{ income: number; expenses: number; profit: number } | null>(null)

  const handleCalculate = async () => {
    if (startDate && endDate) {
      const calculatedResult = await calculateProfitLoss(new Date(startDate), new Date(endDate))
      setResult(calculatedResult)
    }
  }

  return (
  
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Profit/Loss Calculator</h2>
      </CardHeader>
      <Divider />
      <CardBody>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button color="primary" onClick={handleCalculate}>
            Calculate
          </Button>
        </div>
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <Card>
              <CardBody>
                <p className="font-semibold">Total Income</p>
                <p className="text-success text-xl">MWK {result.income.toFixed(2)}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="font-semibold">Total Expenses</p>
                <p className="text-danger text-xl">MWK {result.expenses.toFixed(2)}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="font-semibold">Profit/Loss</p>
                <p className={`text-xl ${result.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                  MWK {result.profit.toFixed(2)}
                </p>
              </CardBody>
            </Card>
          </div>
        )}
      </CardBody>
    </Card>

    

  )
}

