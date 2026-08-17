import TabBar from "@/components/TabBar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-3 py-4">
      <div className="w-full max-w-[420px] flex flex-col gap-4 flex-1">
        <main id="app-main" className="flex-1 overflow-y-auto overflow-x-hidden pb-1">
          {children}
        </main>
        <TabBar />
      </div>
    </div>
  );
}
