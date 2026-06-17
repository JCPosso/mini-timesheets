import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { QueryProvider } from "@/components/QueryProvider";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mini Timesheets",
  description: "Timesheet tracker — OCMI Workers Comp assessment",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200">
          <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
            <span className="font-semibold text-sm tracking-tight">Mini Timesheets</span>
            <Link href="/employees" className="text-sm text-gray-600 hover:text-gray-900">
              Employees
            </Link>
            <Link href="/time-entries" className="text-sm text-gray-600 hover:text-gray-900">
              Time Entries
            </Link>
            <Link href="/weekly" className="text-sm text-gray-600 hover:text-gray-900">
              Weekly Summary
            </Link>
          </nav>
        </header>
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          <QueryProvider>{children}</QueryProvider>
        </main>
      </body>
    </html>
  );
}
