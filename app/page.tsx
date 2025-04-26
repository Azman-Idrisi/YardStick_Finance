import Dashboard from './components/Dashboard';
import ShadcnTransactionForm from './components/ShadcnTransactionForm';
import SpendingInsights from './components/SpendingInsights';

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div className="lg:col-span-2">
        <Dashboard />
      </div>
      
      <div className="space-y-6 md:space-y-8">
        <div className="bg-card rounded-lg shadow-sm border p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Add New Transaction</h2>
          <ShadcnTransactionForm />
        </div>
        
        <SpendingInsights />
      </div>
    </div>
  );
}