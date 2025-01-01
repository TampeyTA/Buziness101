'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from "@nextui-org/link";
import { Card } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { title } from '@/components/primitives';
import { PlusIcon, ChartLine, Calculator, Newspaper, Zap } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check-admin', { credentials: 'include' });
        if (!res.ok) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-background mt-0 flex flex-col">

      <div className="justify-center items-center">
      <h1 className={title()}>Business Manager</h1>
      </div>
      
    <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Daily Entry Card */}
          <Card className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="rounded-full bg-primary/10 p-6">
                <PlusIcon size={48} className="text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Daily Entry</h2>
              <p className="text-lg text-default-600">
                Record your daily business activities, expenses, and notes
              </p>
              <Button 
                as={Link} 
                href="/DailyEntry"
                color="primary" 
                size="lg"
                className="mt-4 font-semibold text-lg"
              >
                Add New Entry
              </Button>
            </div>
          </Card>

          {/* Electricity Usage  Card */}
          <Card className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="rounded-full bg-primary/10 p-6">
                <Zap size={48} className="text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Electricity Usage</h2>
              <p className="text-lg text-default-600">
                Record your daily electricity usage
              </p>
              <Button 
                as={Link} 
                href="/UtilityData"
                color="primary" 
                size="lg"
                className="mt-4 font-semibold text-lg"
              >
                Add Utility Bill
              </Button>
            </div>
          </Card>

          {/* Trends & Insights Card */}
          <Card className="p-6 hover:scale-105 transition-transform duration-300">
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="rounded-full bg-secondary/10 p-6">
                <ChartLine size={48} className="text-secondary" />
              </div>
              <h2 className="text-3xl font-bold">Trends & Insights</h2>
              <p className="text-lg text-default-600">
                Analyze your business performance and discover valuable insights
              </p>
              <Button 
                as={Link} 
                href="/Trends"
                color="secondary" 
                size="lg"
                className="mt-4 font-semibold text-lg"
              >
                View Analytics
              </Button>
            </div>
          </Card>
          {/* Calculator */}
          <Card className= "p-6 hover:scale-105 transition-transform duration-300">
            <div className = "h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="rounded-full bg-secondary/10 p-6">
              <Calculator size={48} className = "text-secondary" />
              </div>
              <h2 className='text-3xl font-bold'>Calculator</h2>
              <p className="text-lg text-default-600">
                Do the essential calculations to keep your business healthy
              </p>
              <Button 
                as={Link}
                href="/Calculator"
                color="secondary"
                size="lg"
                className="mt-4 font-semibold text-lg"
                >
                  Calculate
                </Button>
              </div>
         </Card>

          {/*Reports*/}

         <Card className= "p-6 hover:scale-105 transition-transform duration-300">
            <div className = "h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="rounded-full bg-secondary/10 p-6">
              <Newspaper size={48} className = "text-primary" />
              </div>
              <h2 className='text-3xl font-bold'>Reports</h2>
              <p className="text-lg text-default-600">
                Generate reports to see your financial summary
              </p>
              <Button 
                as={Link}
                href="/Reports"
                color="primary"
                size="lg"
                className="mt-4 font-semibold text-lg"
                >
                  Generate Report
                </Button>
              </div>
         </Card>

        </div>
      </main>

      <footer className="w-full p-4 border-t border-divider">
        <div className="w-full max-w-7xl mx-auto text-center text-default-600">
          © 2024 Taalgorithm. All rights reserved.
        </div>
      </footer>
    </div>
  );
}