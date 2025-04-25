import mongoose, { Schema } from 'mongoose';

export interface IBudget {
  category: string;
  month: string; // Format: YYYY-MM
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    category: { type: String, required: true, trim: true },
    month: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return /^\d{4}-\d{2}$/.test(v);
        },
        message: props => `${props.value} is not a valid month format! Use YYYY-MM`
      }
    },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Create compound index for category and month
budgetSchema.index({ category: 1, month: 1 }, { unique: true });

// Prevent model recompilation in development
const Budget = mongoose.models?.Budget || mongoose.model<IBudget>('Budget', budgetSchema);

export default Budget; 