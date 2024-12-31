'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addIncomeRecord, addExpenseRecord } from '@/actions/dailyEntry';
import { Button, Input, Tooltip, Divider, Card, CardBody, CardHeader } from "@nextui-org/react";
import { Trash2, Plus } from 'lucide-react';

interface DailyEntryFormProps {
  isAdmin: boolean;
  onEntrySubmitted: () => void;
}

interface ExpenseEntry {
  category: string;
  amount: string;
  notes: string;
}

type ExpenseField = keyof ExpenseEntry;

export default function DailyEntryForm({ isAdmin, onEntrySubmitted }: DailyEntryFormProps) {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([{ category: '', amount: '', notes: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddExpense = () => {
    setExpenses([...expenses, { category: '', amount: '', notes: '' }]);
  };

  const handleExpenseChange = (index: number, field: ExpenseField, value: string) => {
    const newExpenses = [...expenses];
    newExpenses[index] = {
      ...newExpenses[index],
      [field]: value
    };
    setExpenses(newExpenses);
  };

  const handleRemoveExpense = (index: number) => {
    const newExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(newExpenses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Unauthorized action attempted');
      return;
    }

    if (!date || !income) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await addIncomeRecord(new Date(date), parseFloat(income), '');
      for (const expense of expenses) {
        if (expense.category && expense.amount) {
          await addExpenseRecord(
            new Date(date),
            parseFloat(expense.amount),
            expense.category,
            expense.notes
          );
        }
      }
      
      setSuccessMessage('Entry saved successfully!');
      setTimeout(() => {
        setDate('');
        setIncome('');
        setExpenses([{ category: '', amount: '', notes: '' }]);
        setSuccessMessage(null);
      }, 2000);
      
      onEntrySubmitted();
      router.refresh();
    } catch (error) {
      console.error('Error submitting daily entry:', error);
      setError('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return <div className="text-danger">You do not have permission to access this form.</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Daily Entry Form</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        {error && <div className="text-danger mb-4">{error}</div>}
        {successMessage && <div className="text-success mb-4">{successMessage}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            isInvalid={!!error && !date}
            errorMessage={!date ? "Date is required" : ""}
          />
          <Input
            type="number"
            label="Daily Income (MWK)"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            required
            isInvalid={!!error && !income}
            errorMessage={!income ? "Income is required" : ""}
          />
          <div>
            <h3 className="text-lg font-semibold mb-2">Daily Expenses</h3>
            {expenses.map((expense, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <Input
                  type="text"
                  placeholder="Category"
                  value={expense.category}
                  onChange={(e) => handleExpenseChange(index, 'category', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={expense.amount}
                  onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Notes"
                  value={expense.notes}
                  onChange={(e) => handleExpenseChange(index, 'notes', e.target.value)}
                />
                <Tooltip content="Remove Expense">
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    onPress={() => handleRemoveExpense(index)}
                    aria-label="Remove Expense"
                  >
                    <Trash2/>
                  </Button>
                </Tooltip>
              </div>
            ))}
            <Button
              color="primary"
              variant="light"
              onPress={handleAddExpense}
            >
              <Plus/> Add Expense
            </Button>
          </div>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Daily Entry'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

