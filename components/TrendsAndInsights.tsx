'use client';

import { useEffect, useState } from 'react';
import { getTrendsData } from '@/actions/trendsAndInsights';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react";
import { TrendDataPoint } from '@/types';

interface TrendsAndInsightsProps {
  lastUpdate?: string | Date | null;
}

export default function TrendsAndInsights({ lastUpdate = null }: TrendsAndInsightsProps) {
  const [trendsData, setTrendsData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getTrendsData();
        setTrendsData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching trends data:', err);
        setError('Failed to load trends data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lastUpdate]);

  if (isLoading) {
    return <Spinner label="Loading trends and insights..." />;
  }

  if (error) {
    return <div className="text-danger">Error: {error}</div>;
  }

  if (trendsData.length === 0) {
    return <div>No trends data available</div>;
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Trends and Insights</h2>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" minHeight={400} aspect={2}>
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#22C55E" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="expenses" stroke="#DC2626" />
            <Line type="monotone" dataKey="profit" stroke="#F38E1C" />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}