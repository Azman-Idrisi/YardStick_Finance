import Dashboard from './components/Dashboard';
import ShadcnTransactionForm from './components/ShadcnTransactionForm';
import SpendingInsights from './components/SpendingInsights';

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Dashboard />
      </div>
      
      <div>
        <div className="space-y-8 sticky top-20">
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
            <ShadcnTransactionForm />
          </div>
          
          <SpendingInsights />
        </div>
      </div>
    </div>
  );
}