import type { Metadata } from "next";
import { Inter, Roboto, Nunito } from "next/font/google";
import "./globals.css";
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

          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
