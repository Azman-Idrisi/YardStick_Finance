'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ShadcnTransactionForm from '@/app/components/ShadcnTransactionForm';

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTransaction() {
      try {
        const id = params.id;
        
        if (!id) {
          throw new Error('Transaction ID is missing');
        }
        
        const response = await fetch(`/api/transactions/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch transaction');
        }
        
        const data = await response.json();
        setTransaction(data.transaction);
      } catch (err: any) {
        console.error('Error fetching transaction:', err);
        setError(err.message || 'Failed to load transaction');
      } finally {
        setLoading(false);
      }
    }

    fetchTransaction();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          Loading transaction...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <div className="mt-4">
            <button 
              onClick={() => router.push('/transactions')}
              className="text-zinc-500 hover:text-zinc-700"
            >
              &larr; Back to transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Transaction</h1>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
          {transaction ? (
            <ShadcnTransactionForm 
              editMode 
              transaction={transaction} 
            />
          ) : (
            <div className="text-center py-4">Transaction not found</div>
          )}
        </div>
      </div>
    </div>
  );
} 