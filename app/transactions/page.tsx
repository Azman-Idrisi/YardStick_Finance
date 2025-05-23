'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/app/utils/format';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
  timestamp: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAndProcessTransactions();
  }, []);

  async function fetchAndProcessTransactions() {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data.transactions);

      updateChartData(data.transactions);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }

  function updateChartData(transactionsData: Transaction[]) {
    const monthlyChartData = createMonthlyData(transactionsData);
    const categoryChartData = createCategoryData(transactionsData);
    
    setMonthlyData(monthlyChartData);
    setCategoryData(categoryChartData);
  }

  function createMonthlyData(transactionsData: Transaction[]): MonthlyData[] {
    const monthlyMap = groupTransactionsByMonth(transactionsData);
    
    return convertMonthlyMapToSortedArray(monthlyMap);
  }

  function groupTransactionsByMonth(transactionsData: Transaction[]) {
    const monthlyMap = new Map<string, { income: number; expense: number; timestamp: number }>();
    
    transactionsData.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      const timestamp = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      
      if (!monthlyMap.has(monthYear)) {
        monthlyMap.set(monthYear, { income: 0, expense: 0, timestamp });
      }
      
      const monthData = monthlyMap.get(monthYear)!;
      if (transaction.type === 'income') {
        monthData.income += transaction.amount;
      } else {
        monthData.expense += transaction.amount;
      }
    });
    
    return monthlyMap;
  }

  function convertMonthlyMapToSortedArray(monthlyMap: Map<string, { income: number; expense: number; timestamp: number }>) {
    return Array.from(monthlyMap.entries())
      .map(([name, data]) => ({
        name,
        income: data.income,
        expense: data.expense,
        timestamp: data.timestamp
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  function createCategoryData(transactionsData: Transaction[]): CategoryData[] {
    const expenseTransactions = transactionsData.filter(t => t.type === 'expense');
    
    if (expenseTransactions.length === 0) {
      return [];
    }
    
    const categoryMap = groupExpensesByCategory(expenseTransactions);
    
    return formatCategoryDataForChart(categoryMap);
  }

  function groupExpensesByCategory(expenseTransactions: Transaction[]) {
    const categoryMap = new Map<string, number>();
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      const currentAmount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentAmount + transaction.amount);
    });
    
    return categoryMap;
  }

  function formatCategoryDataForChart(categoryMap: Map<string, number>) {
    return Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      const updatedTransactions = transactions.filter(t => t._id !== id);
      setTransactions(updatedTransactions);
      
      updateChartData(updatedTransactions);
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      alert(err.message || 'Failed to delete transaction');
    }
  }

  function calculatePercentage(value: number): string {
    const total = categoryData.reduce((sum, item) => sum + item.value, 0);
    return ((value / total) * 100).toFixed(1);
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 p-2 border rounded shadow">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-gray-500">
            {calculatePercentage(payload[0].value)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <Link href="/transactions/new">
            <Button>Add New Transaction</Button>
          </Link>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-10 text-center">
          <p className="text-gray-500 mb-4">No transactions found</p>
          <Link href="/transactions/new">
            <Button variant="outline">Add Your First Transaction</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Link href="/transactions/new">
          <Button className="w-full sm:w-auto">Add New Transaction</Button>
        </Link>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Monthly Overview</h2>
            <div className="h-60 md:h-80">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value) => typeof value === 'number' ? [`$${value.toFixed(2)}`, undefined] : [`$${value}`, undefined]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#4ade80" />
                    <Bar dataKey="expense" name="Expense" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Not enough data to display chart
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Expense Categories</h2>
            <div className="h-60 md:h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((entry, index) => (
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
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">All Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 md:px-4">Date</th>
                  <th className="text-left py-2 px-2 md:px-4">Description</th>
                  <th className="text-left py-2 px-2 md:px-4">Category</th>
                  <th className="text-left py-2 px-2 md:px-4">Type</th>
                  <th className="text-left py-2 px-2 md:px-4">Amount</th>
                  <th className="text-left py-2 px-2 md:px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b">
                    <td className="py-2 px-2 md:px-4">{formatDate(transaction.date)}</td>
                    <td className="py-2 px-2 md:px-4">{transaction.description}</td>
                    <td className="py-2 px-2 md:px-4">{transaction.category}</td>
                    <td className="py-2 px-2 md:px-4 capitalize">{transaction.type}</td>
                    <td className={`py-2 px-2 md:px-4 ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-2 px-2 md:px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/transactions/edit/${transaction._id}`)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="Edit transaction"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 