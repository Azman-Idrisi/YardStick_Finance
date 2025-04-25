'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Transaction categories
const TRANSACTION_CATEGORIES = [
  { id: 'income', label: 'Income' },
  { id: 'housing', label: 'Housing' },
  { id: 'food', label: 'Food' },
  { id: 'transportation', label: 'Transportation' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'personal', label: 'Personal' },
  { id: 'education', label: 'Education' },
  { id: 'bill', label: 'Bill' },
  { id: 'other', label: 'Other' },
];

// Transaction type options
const TRANSACTION_TYPES = [
  { id: 'expense', label: 'Expense' },
  { id: 'income', label: 'Income' },
];

// Types
type TransactionType = 'income' | 'expense';

interface Transaction {
  _id?: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
}

interface TransactionFormProps {
  editMode?: boolean;
  transaction?: Transaction;
}

export default function ShadcnTransactionForm({ 
  editMode = false,
  transaction 
}: TransactionFormProps) {
  const router = useRouter();
  
  // Form state
  const [formState, setFormState] = useState({
    amount: transaction ? transaction.amount.toString() : '',
    description: transaction?.description || '',
    category: transaction?.category || '',
    type: transaction?.type || 'expense' as TransactionType,
    date: transaction?.date ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  
  // UI state
  const [status, setStatus] = useState({
    isSubmitting: false,
    error: '',
    success: '',
  });

  // Update form field helper
  const updateField = (field: string, value: string | TransactionType) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Validation
  const validateForm = () => {
    const { amount, description, category, date } = formState;
    
    if (!amount || !description || !category || !date) {
      return { valid: false, message: 'All fields are required' };
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return { valid: false, message: 'Amount must be a valid number greater than 0' };
    }

    return { valid: true, message: '' };
  };

  // Form submission handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Reset status
    setStatus({ 
      isSubmitting: true, 
      error: '', 
      success: '' 
    });

    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      setStatus(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        error: validation.message 
      }));
      return;
    }

    try {
      const formData = {
        amount: parseFloat(formState.amount),
        description: formState.description,
        category: formState.category,
        type: formState.type,
        date: new Date(formState.date).toISOString(),
      };

      await submitTransactionToAPI(formData);
      handleSuccessfulSubmission();
    } catch (err: any) {
      handleSubmissionError(err);
    }
  }

  // API submission logic
  async function submitTransactionToAPI(formData: Omit<Transaction, '_id'>) {
    const endpoint = editMode && transaction?._id 
      ? `/api/transactions/${transaction._id}` 
      : '/api/transactions';
    const method = editMode ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to ${editMode ? 'update' : 'create'} transaction`);
    }

    return data;
  }

  // Success handler
  function handleSuccessfulSubmission() {
    const successMessage = editMode 
      ? 'Transaction updated successfully!' 
      : 'Transaction added successfully!';
    
    setStatus(prev => ({ ...prev, success: successMessage, isSubmitting: false }));
    
    // Reset form if not in edit mode
    if (!editMode) {
      resetForm();
    }

    // Refresh data
    router.refresh();

    // Force reload after delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  // Error handler
  function handleSubmissionError(err: any) {
    console.error('Transaction form error:', err);
    setStatus(prev => ({ 
      ...prev, 
      error: err.message || 'Something went wrong', 
      isSubmitting: false 
    }));
  }

  // Reset form to initial state
  function resetForm() {
    setFormState({
      amount: '',
      description: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <div className="space-y-4">
      {/* Status messages */}
      <StatusMessage 
        error={status.error} 
        success={status.success} 
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type */}
        <div className="space-y-1.5">
          <Label className="text-sm">Transaction Type</Label>
          <div className="flex gap-4">
            {TRANSACTION_TYPES.map(({ id, label }) => (
              <RadioOption
                key={id}
                id={id}
                label={label}
                checked={formState.type === id}
                onChange={() => updateField('type', id as TransactionType)}
                disabled={status.isSubmitting}
              />
            ))}
          </div>
        </div>

        {/* Amount */}
        <FormField
          id="amount"
          label="Amount"
          type="number"
          value={formState.amount}
          onChange={(e) => updateField('amount', e.target.value)}
          placeholder="0.00"
          disabled={status.isSubmitting}
          step="0.01"
          min="0.01"
        />

        {/* Description */}
        <FormField
          id="description"
          label="Description"
          value={formState.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Enter description"
          disabled={status.isSubmitting}
        />

        {/* Category */}
        <div className="space-y-1.5">
          <Label className="text-sm">Category</Label>
          <Select
            disabled={status.isSubmitting}
            onValueChange={(value) => updateField('category', value)}
            value={formState.category}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <FormField
          id="date"
          label="Date"
          type="date"
          value={formState.date}
          onChange={(e) => updateField('date', e.target.value)}
          disabled={status.isSubmitting}
        />

        <Button 
          type="submit" 
          disabled={status.isSubmitting} 
          className="w-full"
        >
          {status.isSubmitting
            ? 'Processing...'
            : editMode
              ? 'Update Transaction'
              : 'Add Transaction'}
        </Button>
      </form>
    </div>
  );
}

// Helper component for form fields
function FormField({ 
  id, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '', 
  disabled = false,
  ...rest
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  [key: string]: any;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm" htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="h-9"
        {...rest}
      />
    </div>
  );
}

// Radio option component
function RadioOption({ 
  id, 
  label, 
  checked, 
  onChange, 
  disabled = false 
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={id}
        value={id}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4"
        disabled={disabled}
      />
      <label htmlFor={id} className="text-sm">{label}</label>
    </div>
  );
}

// Status message component
function StatusMessage({ 
  error, 
  success 
}: {
  error: string;
  success: string;
}) {
  if (!error && !success) return null;
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
        {error}
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
        {success}
      </div>
    );
  }
  
  return null;
} 