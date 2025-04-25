import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "Finance Tracker",
  description: "Track your personal finances",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gray-100 dark:bg-zinc-900">
          <header className="bg-white dark:bg-zinc-800 shadow">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex justify-between items-center">
                <Link 
                  href="/" 
                  className="text-xl font-bold text-zinc-900 dark:text-white"
                >
                  Finance Tracker
                </Link>
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/" passHref>
                      <Button asChild variant="outline">
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/transactions" passHref>
                      <Button asChild variant="outline">
                        <span>Transactions</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/budgets" passHref>
                      <Button asChild variant="outline">
                        <span>Budgets</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/transactions/new" passHref>
                      <Button asChild variant="outline">
                        <span>Add Transaction</span>
                      </Button>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
