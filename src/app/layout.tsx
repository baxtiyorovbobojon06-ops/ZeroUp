import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";
import { SettingsProvider } from "@/contexts/SettingsContext";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="uz" className="light">
      <body className={`${inter.className} text-slate-900 dark:text-slate-100 antialiased h-[100dvh] flex flex-col md:flex-row overflow-hidden mesh-bg relative transition-colors duration-300`}>
        <SettingsProvider>
          {/* Subtle overlay for the mesh background so it's not too bright */}
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/70 backdrop-blur-[2px] z-0 pointer-events-none transition-colors duration-300"></div>
          
          <Toaster position="top-center" toastOptions={{
            className: 'glass-panel !bg-white/80 dark:!bg-slate-800/80 !text-slate-800 dark:!text-slate-200 !shadow-lg border-none',
          }} />
          
          <div className="z-10 flex flex-col md:flex-row w-full h-full p-0 md:p-4 gap-0 md:gap-4 relative">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-white/60 dark:bg-slate-800/60 md:bg-white/70 md:dark:bg-slate-800/70 backdrop-blur-xl md:rounded-3xl border-none md:border md:border-white/60 md:dark:border-slate-700/60 shadow-2xl relative z-10 w-full mb-0 md:mb-0 transition-colors duration-300">
              <div className="mx-auto max-w-6xl p-4 md:p-8 min-h-full">
                {children}
              </div>
            </main>
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
