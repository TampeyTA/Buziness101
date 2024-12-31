'use client';

import { Navbar } from "@/components/navbar";
import { Providers } from "../providers";
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-background">
        {pathname !== '/login' && <Navbar />}
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="w-full p-4 border-t border-divider">
          <div className="container mx-auto text-center text-default-600">
            © 2024 Taalgorithm. All rights reserved.
          </div>
        </footer>
      </div>
    </Providers>
  );
}

