'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from '@/app/utils/format';
import { AlertCircle, TrendingUp, BadgeCheck, Zap } from 'lucide-react';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

interface Budget {
  _id: string;
  category: string;
  month: string;
  amount: number;
}

interface SpendingInsight {
  type: 'success' | 'warning' | 'info';
  message: string;
  icon: React.ReactNode;
}

export default function SpendingInsights() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const transactionsResponse = await fetch('/api/transactions');
        if (transactionsResponse.ok) {
          const data = await transactionsResponse.json();
          setTransactions(data.transactions);
        }
        
        const budgetsResponse = await fetch('/api/budgets');
        if (budgetsResponse.ok) {
          const data = await budgetsResponse.json();
          setBudgets(data.budgets);
        }
      } catch (err) {
        console.error('Error fetching data for insights:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && transactions.length > 0) {
      const generatedInsights = generateInsights(transactions, budgets);
      setInsights(generatedInsights);
    }
  }, [loading, transactions, budgets]);

  function generateInsights(transactions: Transaction[], budgets: Budget[]): SpendingInsight[] {
    const insights: SpendingInsight[] = [];
    
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const currentBudgets = budgets.filter(budget => budget.month === currentMonth);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const currentExpenses = transactions.filter(transaction => 
      transaction.type === 'expense' &&
      new Date(transaction.date) >= currentMonthStart &&
      new Date(transaction.date) <= currentMonthEnd
    );
    
    if (currentBudgets.length === 0 || currentExpenses.length === 0) {
      insights.push({
        type: 'info',
        message: "Add more transactions and budgets to see spending insights",
        icon: <AlertCircle className="h-4 w-4" />
      });
      return insights;
    }
    
    const expensesByCategory = new Map<string, number>();
    currentExpenses.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      const currentAmount = expensesByCategory.get(category) || 0;
      expensesByCategory.set(category, currentAmount + transaction.amount);
    });
    
    let highestCategory = '';
    let highestAmount = 0;
    expensesByCategory.forEach((amount, category) => {
      if (amount > highestAmount) {
        highestAmount = amount;
        highestCategory = category;
      }
    });
    
    if (highestCategory) {
      insights.push({
        type: 'info',
        message: `Your highest spending category is ${highestCategory.charAt(0).toUpperCase() + highestCategory.slice(1)} (${formatCurrency(highestAmount)})`,
        icon: <TrendingUp className="h-4 w-4" />
      });
    }
    
    currentBudgets.forEach(budget => {
      const actualSpending = expensesByCategory.get(budget.category) || 0;
      const percentSpent = Math.round((actualSpending / budget.amount) * 100);
      
      if (actualSpending < budget.amount) {
        insights.push({
          type: 'success',
          message: `You're under budget in ${budget.category.charAt(0).toUpperCase() + budget.category.slice(1)} (${percentSpent}% spent)`,
          icon: <BadgeCheck className="h-4 w-4" />
        });
      }
      else if (percentSpent >= 80 && percentSpent <= 100) {
        insights.push({
          type: 'warning',
          message: `You've spent ${percentSpent}% of your ${budget.category} budget`,
          icon: <AlertCircle className="h-4 w-4" />
        });
      }
      else if (actualSpending > budget.amount) {
        insights.push({
          type: 'warning',
          message: `You're over budget in ${budget.category.charAt(0).toUpperCase() + budget.category.slice(1)} by ${formatCurrency(actualSpending - budget.amount)}`,
          icon: <Zap className="h-4 w-4" />
        });
      }
    });

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        message: "Add more transactions and budgets to see spending insights",
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
    
    return insights.slice(0, 3);
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground py-2">
            Loading insights...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
        <CardDescription>Tips based on your spending patterns</CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`flex items-start p-3 text-sm rounded-lg ${
                  insight.type === 'success' 
                    ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-100' 
                    : insight.type === 'warning'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-100'
                      : 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-100'
                }`}
              >
                <div className="mr-3 mt-0.5">{insight.icon}</div>
                <div>{insight.message}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-2">
            No insights available yet. Add more transactions and set up budgets.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 