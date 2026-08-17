export default function PlayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[420px] flex flex-col gap-4">{children}</div>
    </div>
  );
}
