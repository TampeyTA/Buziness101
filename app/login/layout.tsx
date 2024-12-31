export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <main className="flex items-center justify-center min-h-screen p-4">
        {children}
      </main>
    </div>
  );
}