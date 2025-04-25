'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BudgetFormProps {
  onSuccess?: () => void;
}

export default function BudgetForm({ onSuccess }: BudgetFormProps) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get current month in YYYY-MM format for default value
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(currentMonth);

  // Common expense categories
  const categories = [
    'groceries', 
    'utilities', 
    'rent', 
    'transportation',
    'entertainment',
    'health',
    'shopping',
    'education',
    'travel',
    'dining',
    'other'
  ];

  // Generate the last 12 months as options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return {
      value: `${year}-${month}`,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (!category || !amount || !month) {
      setError('All fields are required');
      setIsSubmitting(false);
      return;
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: category.toLowerCase(),
          month,
          amount: parsedAmount
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add budget');
      }

      const data = await response.json();
      setSuccess(data.message || 'Budget added successfully');
      
      // Reset form
      setCategory('');
      setAmount('');
      setMonth(currentMonth);
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select 
              value={month} 
              onValueChange={setMonth}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Budget'}
          </Button>
        </form>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 space-y-4">
            <div className="text-sm text-gray-500 font-medium border-t pt-4">Developer Tools</div>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={async () => {
                const sampleBudgets = [
                  { category: 'groceries', amount: 500 },
                  { category: 'rent', amount: 1200 },
                  { category: 'utilities', amount: 300 },
                  { category: 'entertainment', amount: 200 },
                  { category: 'transportation', amount: 150 }
                ];
                
                // Get current month
                const now = new Date();
                const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                
                for (const budget of sampleBudgets) {
                  await fetch('/api/budgets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...budget, month: currentMonth })
                  });
                }
                
                if (onSuccess) onSuccess();
                setSuccess('Sample budgets added successfully');
              }}
            >
              Add Sample Budgets (Current Month)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 