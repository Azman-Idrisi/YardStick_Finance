import ShadcnTransactionForm from '@/app/components/ShadcnTransactionForm';

export default function NewTransactionPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Transaction</h1>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
          <ShadcnTransactionForm />
        </div>
      </div>
    </div>
  );
} 