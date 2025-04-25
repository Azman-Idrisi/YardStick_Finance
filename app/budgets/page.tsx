'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BudgetForm from '@/app/components/BudgetForm';
import { formatCurrency } from '@/app/utils/format';

interface Budget {
  _id: string;
  category: string;
  month: string;
  amount: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/budgets');
      
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      
      const data = await response.json();
      setBudgets(data.budgets);
    } catch (err: any) {
      console.error('Error fetching budgets:', err);
      setError(err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBudgets();
  }, []);
  
  const handleDelete = async (id: string) => {
    // Find budget to get category and month
    const budget = budgets.find(b => b._id === id);
    if (!budget) return;
    
    if (!confirm(`Are you sure you want to delete the budget for ${budget.category}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/budgets/${budget.category}/${budget.month}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }
      
      // Refresh budgets after deletion
      fetchBudgets();
    } catch (err: any) {
      console.error('Error deleting budget:', err);
      alert('Failed to delete budget: ' + err.message);
    }
  };

  // Group budgets by month
  const budgetsByMonth = budgets.reduce<Record<string, Budget[]>>((acc, budget) => {
    if (!acc[budget.month]) {
      acc[budget.month] = [];
    }
    acc[budget.month].push(budget);
    return acc;
  }, {});

  // Sort months newest first
  const sortedMonths = Object.keys(budgetsByMonth).sort().reverse();

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Budget Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-6">Loading budgets...</div>
              ) : error ? (
                <div className="text-center py-6 text-red-600">{error}</div>
              ) : budgets.length === 0 ? (
                <div className="text-center py-6 text-gray-600">
                  No budgets found. Add your first budget to get started.
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedMonths.map(month => {
                    const monthBudgets = budgetsByMonth[month];
                    const monthDate = new Date(parseInt(month.substring(0, 4)), parseInt(month.substring(5, 7)) - 1);
                    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    
                    return (
                      <div key={month} className="space-y-4">
                        <h3 className="text-xl font-semibold">{monthName}</h3>
                        <div className="divide-y">
                          {monthBudgets.map(budget => (
                            <div key={budget._id} className="py-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                              <div className="capitalize font-medium">{budget.category}</div>
                              <div>{formatCurrency(budget.amount)}</div>
                              <div>
                                <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                  {month}
                                </span>
                              </div>
                              <div className="text-right">
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDelete(budget._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <BudgetForm onSuccess={fetchBudgets} />
        </div>
      </div>
    </main>
  );
} 