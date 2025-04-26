import { Inter } from "next/font/google";
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/app/components/MobileMenu";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Yardstick Finance",
  description: "Track your personal finances",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 border-b bg-background">
              <div className="container mx-auto px-4 py-3">
                <nav className="flex items-center justify-between">
                  <Link 
                    href="/" 
                    className="text-xl font-bold"
                  >
                    Yardstick Finance
                  </Link>
                  
                  <div className="hidden md:flex items-center space-x-4">
                    <ul className="flex space-x-4">
                      <li>
                        <Link href="/" passHref>
                          <Button asChild variant="ghost" size="sm">
                            <span>Dashboard</span>
                          </Button>
                        </Link>
                      </li>
                      <li>
                        <Link href="/transactions" passHref>
                          <Button asChild variant="ghost" size="sm">
                            <span>Transactions</span>
                          </Button>
                        </Link>
                      </li>
                      <li>
                        <Link href="/budgets" passHref>
                          <Button asChild variant="ghost" size="sm">
                            <span>Budgets</span>
                          </Button>
                        </Link>
                      </li>
                      <li>
                        <Link href="/settings" passHref>
                          <Button asChild variant="ghost" size="sm">
                            <span>Settings</span>
                          </Button>
                        </Link>
                      </li>
                    </ul>
                    <div className="flex items-center gap-2">
                      <Link href="/transactions/new" passHref>
                        <Button asChild size="sm">
                          <span>Add Transaction</span>
                        </Button>
                      </Link>
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* Mobile menu button */}
                  <div className="md:hidden flex items-center gap-2">
                    <Link href="/transactions/new" passHref>
                      <Button asChild size="sm">
                        <span>Add</span>
                      </Button>
                    </Link>
                    <ThemeToggle />
                    <MobileMenu />
                  </div>
                </nav>
              </div>
            </header>
            <main className="flex-1 container mx-auto py-8 px-4">
              {children}
            </main>
            <footer className="border-t py-6">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Yardstick Finance. All rights reserved.
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
