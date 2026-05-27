import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../components/LanguageContext";
import Navbar from "@/components/Navbar";
import WarningModal from "@/components/WarningModal";
import TelegramBotWorker from "@/components/TelegramBotWorker";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Blood Indo - Emergency Blood Donation Platform",
  description: "Real-time emergency blood donation matching and life-saving alerts. Connect with nearby donors instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="bg-brand-black text-gray-100 min-h-screen flex flex-col">
        <LanguageProvider>
        <TelegramBotWorker />
        <WarningModal />
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
