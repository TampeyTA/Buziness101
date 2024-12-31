'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  addElectricityUsage, 
  addNewUtilityBill, 
  getActiveUtilityBill,
  getUsageHistory,
  getDailyUsageTrend,
  addPastElectricityUsage
} from '@/actions/electricityUsage';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardBody, CardHeader, Input, Button, Divider, Spinner } from "@nextui-org/react";

interface UtilityBill {
  id: number;
  initialUnits: number;
  remainingUnits: number;
  totalCostMWK: number;
  isActive: boolean;
  usageRecords: Array<{
    id: number;
    date: string;
    unitsUsed: number;
    costMWK: number;
    notes: string | null;
  }>;
}

const formatMWK = (value: number) => 
  `MWK ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function DailyUnitsUsage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [unitsUsed, setUnitsUsed] = useState<string>('');
  const [costMWK, setCostMWK] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [newInitialUnits, setNewInitialUnits] = useState<string>('');
  const [newTotalCostMWK, setNewTotalCostMWK] = useState<string>('');
  const [activeBill, setActiveBill] = useState<UtilityBill | null>(null);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [pastDate, setPastDate] = useState<string>('');
  const [pastUnitsUsed, setPastUnitsUsed] = useState<string>('');
  const [pastCostMWK, setPastCostMWK] = useState<string>('');
  const [pastNotes, setPastNotes] = useState<string>('');

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch('/api/auth/check-admin');
        if (res.ok) {
          const { isAdmin } = await res.json();
          setIsAdmin(isAdmin);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    checkAdminStatus();
    loadActiveBill();
    loadUsageHistory();
  }, []);

  useEffect(() => {
    if (activeBill) {
      loadDailyTrend();
    }
  }, [activeBill]);

  const loadActiveBill = async () => {
    try {
      const bill = await getActiveUtilityBill();
      setActiveBill(bill);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load active utility bill' });
    }
  };

  const loadUsageHistory = async () => {
    try {
      const history = await getUsageHistory();
      setUsageHistory(history);
    } catch (error) {
      console.error('Failed to load usage history:', error);
    }
  };

  const loadDailyTrend = async () => {
    try {
      if (activeBill) {
        const trend = await getDailyUsageTrend(activeBill.id);
        setDailyTrend(trend);
      }
    } catch (error) {
      console.error('Failed to load daily trend:', error);
    }
  };

  const handleAddNewBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'You do not have permission to add a new bill' });
      return;
    }
    if (!newInitialUnits || !newTotalCostMWK) {
      setMessage({ type: 'error', text: 'Please enter both initial units and cost' });
      return;
    }

    try {
      await addNewUtilityBill({
        initialUnits: parseFloat(newInitialUnits),
        totalCostMWK: parseFloat(newTotalCostMWK)
      });
      setMessage({ type: 'success', text: 'New utility bill added successfully' });
      setNewInitialUnits('');
      setNewTotalCostMWK('');
      loadActiveBill();
      router.refresh(); 
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add new utility bill' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'You do not have permission to record usage' });
      return;
    }
    if (!unitsUsed || !costMWK) {
      setMessage({ type: 'error', text: 'Please enter both units used and cost' });
      return;
    }

    try {
      await addElectricityUsage({
        unitsUsed: parseFloat(unitsUsed),
        costMWK: parseFloat(costMWK),
        notes: notes || null,
      });

      setMessage({ type: 'success', text: 'Electricity usage recorded successfully' });
      setUnitsUsed('');
      setCostMWK('');
      setNotes('');
      loadActiveBill();
      loadUsageHistory();
      loadDailyTrend();
      router.refresh(); 
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to record electricity usage' 
      });
    }
  };

  const handlePastUsageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'You do not have permission to record past usage' });
      return;
    }
    if (!pastDate || !pastUnitsUsed || !pastCostMWK) {
      setMessage({ type: 'error', text: 'Please enter date, units used, and cost for past usage' });
      return;
    }

    try {
      await addPastElectricityUsage({
        date: new Date(pastDate),
        unitsUsed: parseFloat(pastUnitsUsed),
        costMWK: parseFloat(pastCostMWK),
        notes: pastNotes || null,
      });

      setMessage({ type: 'success', text: 'Past electricity usage recorded successfully' });
      setPastDate('');
      setPastUnitsUsed('');
      setPastCostMWK('');
      setPastNotes('');
      loadActiveBill();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to record past electricity usage' 
      });
    }
  };

  const prepareChartData = () => {
    return dailyTrend.map(day => ({
      date: new Date(day.date).toLocaleDateString(),
      unitsUsed: day.totalUnits,
      costMWK: day.totalCost
    }));
  };

  const preparePieData = () => {
    if (!activeBill) return [];
    return [
      { name: 'Used', value: activeBill.initialUnits - activeBill.remainingUnits },
      { name: 'Remaining', value: activeBill.remainingUnits }
    ];
  };

  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <div className="w-full max-w-7xl gap-8">
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Daily Electricity Usage</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        {message && (
          <div className={`p-3 mb-4 rounded ${
            message.type === 'success' 
              ? 'bg-success-50 text-success' 
              : 'bg-danger-50 text-danger'
          }`}>
            {message.text}
          </div>
        )}

        {activeBill ? (
          <Card>
            <CardHeader>
              <h3 className="font-medium">Current Utility Bill Status</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>Initial Units: {activeBill.initialUnits} KWH</p>
                  <p>Remaining Units: {activeBill.remainingUnits.toFixed(2)} KWH</p>
                  <p>Used: {(activeBill.initialUnits - activeBill.remainingUnits).toFixed(2)} KWH</p>
                  <p>Total Cost: {formatMWK(activeBill.totalCostMWK)}</p>
                </div>
                <div className="h-48 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePieData()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        label
                      >
                        {preparePieData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <p>No active utility bill. Please add a new one below.</p>
            </CardBody>
          </Card>
        )}

        {!activeBill && isAdmin && (
          <form onSubmit={handleAddNewBill} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="New Initial Units (KWH)"
                value={newInitialUnits}
                onChange={(e) => setNewInitialUnits(e.target.value)}
                placeholder="Enter initial units (e.g., 700)"
              />
              <Input
                type="number"
                label="Total Cost (MWK)"
                value={newTotalCostMWK}
                onChange={(e) => setNewTotalCostMWK(e.target.value)}
                placeholder="Enter total cost in MWK"
              />
            </div>
            <Button
              type="submit"
              color="success"
              className="mt-4 w-full"
            >
              Add New Utility Bill
            </Button>
          </form>
        )}

        {activeBill && activeBill.remainingUnits > 0 && isAdmin && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Units Used Today (KWH)"
                value={unitsUsed}
                onChange={(e) => setUnitsUsed(e.target.value)}
                placeholder="Enter units used"
              />
              <Input
                type="number"
                label="Cost (MWK)"
                value={costMWK}
                onChange={(e) => setCostMWK(e.target.value)}
                placeholder="Enter cost in MWK"
              />
            </div>
            <Input
              type="text"
              label="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes"
            />
            <Button
              type="submit"
              color="primary"
            >
              Record Usage
            </Button>
          </form>
        )}

        {activeBill && activeBill.remainingUnits > 0 && isAdmin && (
          <form onSubmit={handlePastUsageSubmit} className="mt-6 space-y-4">
            <h3 className="font-medium mb-2">Add Past Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date"
                value={pastDate}
                onChange={(e) => setPastDate(e.target.value)}
                required
              />
              <Input
                type="number"
                label="Units Used (KWH)"
                value={pastUnitsUsed}
                onChange={(e) => setPastUnitsUsed(e.target.value)}
                placeholder="Enter units used"
                required
              />
              <Input
                type="number"
                label="Cost (MWK)"
                value={pastCostMWK}
                onChange={(e) => setPastCostMWK(e.target.value)}
                placeholder="Enter cost in MWK"
                required
              />
              <Input
                type="text"
                label="Notes (Optional)"
                value={pastNotes}
                onChange={(e) => setPastNotes(e.target.value)}
                placeholder="Add any notes"
              />
            </div>
            <Button
              type="submit"
              color="success"
            >
              Record Past Usage
            </Button>
          </form>
        )}

        {dailyTrend.length > 0 && (
          <div className="mt-10">
            <h3 className="font-medium mb-2">Usage History</h3>
           <div className="h-64 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="unitsUsed"
                    stroke="#8884d8"
                    name="Units Used (KWH)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="costMWK"
                    stroke="#82ca9d"
                    name="Cost (MWK)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {usageHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Recent Usage Details</h3>
            <div className="space-y-2">
              {usageHistory.map(record => (
                <Card key={record.id}>
                  <CardBody>
                    <p className="text-sm">
                      {new Date(record.date).toLocaleDateString()}: {record.unitsUsed} KWH
                      {' - '}{formatMWK(record.costMWK)}
                    </p>
                    {record.notes && <p className="text-sm text-gray-600">{record.notes}</p>}
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
    </div>
  );
}

