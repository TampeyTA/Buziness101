'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardBody, CardHeader } from "@nextui-org/react";

const DailyEntryForm = dynamic(() => import('@/components/DailyEntryForm'), { ssr: false });
const FinancialSummary = dynamic(() => import("@/components/FinancialSummary"), { ssr: false });

export default function DailyEntryFormPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
  }, []);

  const handleEntrySubmitted = () => {
    setLastUpdate(new Date());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Daily Business Entry</h1>
          </CardHeader>
          <CardBody>
            <DailyEntryForm 
              isAdmin={isAdmin} 
              onEntrySubmitted={handleEntrySubmitted} 
            />
          </CardBody>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card className="sticky top-6">
          <CardHeader>
            <h2 className="text-2xl font-bold">Financial Overview</h2>
          </CardHeader>
          <CardBody>
            <FinancialSummary lastUpdate={lastUpdate} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

