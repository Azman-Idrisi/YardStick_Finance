'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../utils/format';

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

interface TransactionListProps {
  limit?: number;
}

export default function TransactionList({ limit }: TransactionListProps) {
  const stableLimit = React.useMemo(() => limit, [limit]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [stableLimit]);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const data = await getTransactionsFromAPI(stableLimit);
      setTransactions(data.transactions);
    } catch (err: any) {
      handleFetchError(err);
    } finally {
      setLoading(false);
    }
  }

  async function getTransactionsFromAPI(limit?: number) {
    const queryParams = limit ? `?limit=${limit}` : '';
    const response = await fetch(`/api/transactions${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    return await response.json();
  }

  function handleFetchError(err: any) {
    console.error('Error fetching transactions:', err);
    setError(err.message || 'Failed to load transactions');
  }

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState(error);
  }

  if (transactions.length === 0) {
    return renderEmptyState();
  }

  return renderTransactionTable(transactions);
}

function renderLoadingState() {
  return <div className="py-10 text-center">Loading transactions...</div>;
}

function renderErrorState(error: string) {
  return <div className="py-10 text-center text-red-600">Error: {error}</div>;
}

function renderEmptyState() {
  return <div className="py-10 text-center">No transactions found. Add your first transaction!</div>;
}

function renderTransactionTable(transactions: Transaction[]) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full w-full text-sm text-left">
        <thead className="text-xs uppercase bg-zinc-50 dark:bg-zinc-700">
          <tr>
            <th className="px-2 sm:px-4 py-3">Date</th>
            <th className="px-2 sm:px-4 py-3">Description</th>
            <th className="px-2 sm:px-4 py-3">Category</th>
            <th className="px-2 sm:px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction._id}
              className="border-b dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600"
            >
              <td className="px-2 sm:px-4 py-4">{formatDate(transaction.date)}</td>
              <td className="px-2 sm:px-4 py-4">{transaction.description}</td>
              <td className="px-2 sm:px-4 py-4">{transaction.category}</td>
              <td className={`px-2 sm:px-4 py-4 text-right ${
                getAmountColorClass(transaction.type)
              }`}>
                {getAmountPrefix(transaction.type)} {formatCurrency(transaction.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getAmountColorClass(type: 'income' | 'expense'): string {
  return type === 'income' ? 'text-green-600' : 'text-red-600';
}

function getAmountPrefix(type: 'income' | 'expense'): string {
  return type === 'income' ? '+' : '-';
} 