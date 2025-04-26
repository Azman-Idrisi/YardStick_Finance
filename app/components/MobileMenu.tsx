'use client';

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="fixed inset-0 bg-background/80" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col space-y-4">
              <Link href="/" passHref>
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              <Link href="/transactions" passHref>
                <Button variant="ghost" className="w-full justify-start">
                  Transactions
                </Button>
              </Link>
              <Link href="/budgets" passHref>
                <Button variant="ghost" className="w-full justify-start">
                  Budgets
                </Button>
              </Link>
              <Link href="/settings" passHref>
                <Button variant="ghost" className="w-full justify-start">
                  Settings
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
} 