import mongoose, { Schema } from 'mongoose';

export interface ITransaction {
  amount: number;
  description: string;
  category?: string;
  type?: 'income' | 'expense';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    amount: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, default: 'uncategorized' },
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

// Use mongoose.models to prevent model recompilation in development
const Transaction = mongoose.models?.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction; 