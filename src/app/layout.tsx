import type { Metadata } from "next";
import { Inter, Roboto, Nunito } from "next/font/google";
import "./globals.css";
import TabBar from "@/components/TabBar";
import { Toaster } from "react-hot-toast";
import { SettingsProvider } from "@/contexts/SettingsContext";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ["latin", "cyrillic"], variable: '--font-roboto' });
const nunito = Nunito({ subsets: ["latin", "cyrillic"], variable: '--font-nunito' });

export const metadata: Metadata = {
  title: "MaktabAI - O'qituvchilar uchun AI yordamchi",
  description: "Dars rejasi, testlar yaratish, javoblarni tekshirish va hisobotlar avtomatlashtirilgan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="text-base font-inter">
      <body className={`${inter.variable} ${roboto.variable} ${nunito.variable} antialiased min-h-[100dvh]`}>
        <SettingsProvider>
          <Toaster position="top-center" toastOptions={{
            className: '!bg-[var(--card-bg)] !text-[var(--text-primary)] !shadow-md !border !border-[var(--card-border)]',
          }} />

          <div className="min-h-[100dvh] flex flex-col items-center px-3 py-4">
            <div className="w-full max-w-[420px] flex flex-col gap-4 flex-1">
              <main id="app-main" className="flex-1 overflow-y-auto overflow-x-hidden pb-1">
                {children}
              </main>
              <TabBar />
            </div>
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
