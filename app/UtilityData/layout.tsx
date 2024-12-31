import { Navbar } from "@/components/navbar";


export default function ElectricityUsageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4">
          <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            <div className="w-full max-w-[95%] lg:max-w-[85%] xl:max-w-[80%]">
              {children}
            </div>
          </section>
        </main>
        <footer className="w-full p-4 border-t border-divider">
          <div className="container mx-auto text-center text-default-600">
            © 2024 Taalgorithm. All rights reserved.
          </div>
        </footer>
      </div>
    
  );
}

