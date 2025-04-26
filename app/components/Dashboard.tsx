'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import TransactionList from '@/app/components/TransactionList';
import { formatCurrency } from '../utils/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

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

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface BudgetComparisonData {
  name: string;
  budget: number;
  actual: number;
  overBudget: boolean;
}

interface Summary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyData: {
    name: string;
    income: number;
    expense: number;
  }[];
  categoryData: CategoryData[];
  budgetComparison: BudgetComparisonData[];
}

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

// Simplify processing monthly data
function processMonthlyData(transactions: Transaction[]): { name: string; income: number; expense: number }[] {
  // Group transactions by month
  const monthlyDataMap = new Map<string, { income: number; expense: number }>();
  
  transactions.forEach(transaction => {
    // Format month/year (e.g., "Jan 2023")
    const date = new Date(transaction.date);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    // Initialize month data if not exists
    if (!monthlyDataMap.has(monthYear)) {
      monthlyDataMap.set(monthYear, { income: 0, expense: 0 });
    }
    
    // Add amount to appropriate category
    const monthData = monthlyDataMap.get(monthYear)!;
    if (transaction.type === 'income') {
      monthData.income += transaction.amount;
    } else {
      monthData.expense += transaction.amount;
    }
  });
  
  // Convert to array and sort chronologically
  return sortAndLimitMonthlyData(monthlyDataMap);
}

// Helper function to sort and limit monthly data
function sortAndLimitMonthlyData(monthlyDataMap: Map<string, { income: number; expense: number }>) {
  return Array.from(monthlyDataMap.entries())
    .map(([name, data]) => ({
      name,
      income: data.income,
      expense: data.expense,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-6); // Show only last 6 months
}

// Calculate income and expense totals
function calculateTotals(transactions: Transaction[]): { totalIncome: number; totalExpenses: number } {
  let totalIncome = 0;
  let totalExpenses = 0;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpenses += transaction.amount;
    }
  });
  
  return { totalIncome, totalExpenses };
}

function processSummaryData(transactions: Transaction[], budgets: Budget[]): Summary {
  // Get totals
  const { totalIncome, totalExpenses } = calculateTotals(transactions);
  
  // Process monthly data for charts
  const monthlyData = processMonthlyData(transactions);
  
  // Process category data
  const categoryData = processCategoryData(transactions);

  // Process budget comparison data
  const budgetComparison = processBudgetComparison(transactions, budgets);
  
  return {
    totalBalance: totalIncome - totalExpenses,
    totalIncome,
    totalExpenses,
    monthlyData,
    categoryData,
    budgetComparison,
  };
}

// Function to process expenses by category
function processCategoryData(transactions: Transaction[]): CategoryData[] {
  // Filter to expenses only
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  // Count expenses by category
  const categoryMap = new Map<string, number>();
  expenseTransactions.forEach(transaction => {
    const category = transaction.category || 'Uncategorized';
    const currentAmount = categoryMap.get(category) || 0;
    categoryMap.set(category, currentAmount + transaction.amount);
  });
  
  // Format for chart display
  return formatCategoriesForChart(categoryMap);
}

// Helper to format categories for chart display
function formatCategoriesForChart(categoryMap: Map<string, number>): CategoryData[] {
  return Array.from(categoryMap.entries())
    .map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
      value,
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.value - a.value); // Sort by highest amount
}

// Function to process budget vs actual expenses for the current month
function processBudgetComparison(transactions: Transaction[], budgets: Budget[]): BudgetComparisonData[] {
  // Return early if no budget data
  if (budgets.length === 0) return [];

  // Get current month info
  const { currentMonth, currentBudgets, currentExpenses } = getCurrentMonthInfo(transactions, budgets);
  
  // Return early if no budgets for current month
  if (currentBudgets.length === 0) return [];
  
  // Calculate expenses by category
  const expensesByCategory = sumExpensesByCategory(currentExpenses);
  
  // Create the comparison data
  return createBudgetComparison(currentBudgets, expensesByCategory);
}

// Helper to get current month information
function getCurrentMonthInfo(transactions: Transaction[], budgets: Budget[]) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Filter budgets for current month
  const currentBudgets = budgets.filter(budget => budget.month === currentMonth);
  
  // Filter expense transactions for current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const currentExpenses = transactions.filter(transaction => 
    transaction.type === 'expense' &&
    new Date(transaction.date) >= currentMonthStart &&
    new Date(transaction.date) <= currentMonthEnd
  );
  
  return { currentMonth, currentBudgets, currentExpenses };
}

// Helper to sum expenses by category
function sumExpensesByCategory(expenses: Transaction[]) {
  const expensesByCategory = new Map<string, number>();
  
  expenses.forEach(transaction => {
    const category = transaction.category || 'Uncategorized';
    const currentAmount = expensesByCategory.get(category) || 0;
    expensesByCategory.set(category, currentAmount + transaction.amount);
  });
  
  return expensesByCategory;
}

// Helper to create budget comparison data
function createBudgetComparison(
  budgets: Budget[], 
  expensesByCategory: Map<string, number>
): BudgetComparisonData[] {
  let comparisonData: BudgetComparisonData[] = [];
  
  // Add all budgeted categories
  budgets.forEach(budget => {
    const actualExpense = expensesByCategory.get(budget.category) || 0;
    comparisonData.push({
      name: budget.category.charAt(0).toUpperCase() + budget.category.slice(1),
      budget: budget.amount,
      actual: actualExpense,
      overBudget: actualExpense > budget.amount
    });
    
    // Remove processed category
    expensesByCategory.delete(budget.category);
  });
  
  // Add remaining expense categories that don't have budgets
  expensesByCategory.forEach((amount, category) => {
    comparisonData.push({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      budget: 0,
      actual: amount,
      overBudget: true // No budget means any expense is over budget
    });
  });
  
  // Sort alphabetically
  return comparisonData.sort((a, b) => a.name.localeCompare(b.name));
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<Summary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    monthlyData: [],
    categoryData: [],
    budgetComparison: [],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch transactions
        const transactionsResponse = await fetch('/api/transactions');
        if (!transactionsResponse.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
        
        // Fetch budgets
        const budgetsResponse = await fetch('/api/budgets');
        if (!budgetsResponse.ok) {
          throw new Error('Failed to fetch budgets');
        }
        const budgetsData = await budgetsResponse.json();
        setBudgets(budgetsData.budgets);
        
        // Process data for summary and charts
        const summaryData = processSummaryData(transactionsData.transactions, budgetsData.budgets);
        setSummary(summaryData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 p-2 border rounded shadow">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-gray-500">
            {((payload[0].value / summary.categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for budget comparison chart
  const BudgetComparisonTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const budgetData = payload.find((p: any) => p.dataKey === 'budget');
      const actualData = payload.find((p: any) => p.dataKey === 'actual');
      
      return (
        <div className="bg-white dark:bg-zinc-800 p-2 border rounded shadow">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p>Budget: {formatCurrency(budgetData?.value || 0)}</p>
          <p>Actual: {formatCurrency(actualData?.value || 0)}</p>
          {actualData?.value > budgetData?.value && (
            <p className="text-red-500 font-medium">
              Over by {formatCurrency(actualData.value - budgetData.value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="py-20 text-center">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="py-20 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-4 md:pb-5">
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-2xl md:text-3xl">{formatCurrency(summary.totalBalance)}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-4 md:pb-5">
            <CardDescription>Income</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-green-600">{formatCurrency(summary.totalIncome)}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-4 md:pb-5">
            <CardDescription>Expenses</CardDescription>
            <CardTitle className="text-2xl md:text-3xl text-red-600">{formatCurrency(summary.totalExpenses)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Budget vs. Actual Expenses Chart */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
          <CardTitle className="text-lg md:text-xl">Budget vs. Actual Expenses</CardTitle>
          <Link href="/budgets" className="text-blue-600 hover:underline text-sm">
            Manage Budgets
          </Link>
        </CardHeader>
        <CardContent>
          <div className="h-60 md:h-80">
            {summary.budgetComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.budgetComparison}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<BudgetComparisonTooltip />} />
                  <Legend />
                  <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                  <Bar 
                    dataKey="actual" 
                    name="Actual"
                    fill="#82ca9d"
                    isAnimationActive={true}
                  >
                    {summary.budgetComparison.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.overBudget ? '#FF8042' : '#82ca9d'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                <p>No budget data available for current month</p>
                <Link href="/budgets">
                  <Button variant="outline">Set Up Budgets</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60 md:h-80">
              {summary.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="income" fill="#4ade80" name="Income" />
                    <Bar dataKey="expense" fill="#f87171" name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Not enough data to display chart
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Category Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60 md:h-80">
              {summary.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {summary.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Not enough data to display chart
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
          <CardTitle className="text-lg md:text-xl">Recent Transactions</CardTitle>
          <Link href="/transactions" className="text-blue-600 hover:underline text-sm">
            View All
          </Link>
        </CardHeader>
        <CardContent>
          <TransactionList limit={5} />
        </CardContent>
      </Card>
    </div>
  );
} 