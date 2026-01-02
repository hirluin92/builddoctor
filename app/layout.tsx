import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BuildDoctor - Diagnostica Automatica Build Fallite",
  description: "Trasforma 30 minuti di debug in 30 secondi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
