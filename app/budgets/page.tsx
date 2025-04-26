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

  const handleEdit = (budget: Budget) => {
    // For now, we'll just show an alert since we don't have an edit form yet
    alert(`Editing budget for ${budget.category} in ${budget.month}`);
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
    <main className="container mx-auto py-6 md:py-8 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Budget Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Monthly Budgets</CardTitle>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 md:px-4">Category</th>
                        <th className="text-left py-2 px-2 md:px-4">Month</th>
                        <th className="text-left py-2 px-2 md:px-4">Amount</th>
                        <th className="text-left py-2 px-2 md:px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgets.map((budget) => (
                        <tr key={budget._id} className="border-b">
                          <td className="py-2 px-2 md:px-4 capitalize">{budget.category}</td>
                          <td className="py-2 px-2 md:px-4">{budget.month}</td>
                          <td className="py-2 px-2 md:px-4">{formatCurrency(budget.amount)}</td>
                          <td className="py-2 px-2 md:px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(budget)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(budget._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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