import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/app/lib/mongodb';
import Transaction from '@/app/lib/models/transaction';
import mongoose from 'mongoose';

// Helper function to check if ID is valid
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/transactions/[id] - Get a single transaction
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();
    
    const { id } = params;
    
    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }
    
    // Find transaction by ID
    const transaction = await Transaction.findById(id);
    
    // Check if transaction exists
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ transaction }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();
    
    const { id } = params;
    
    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const updates = await request.json();
    
    // Convert date string to Date object if provided
    if (updates.date) {
      updates.date = new Date(updates.date);
    }
    
    // Find and update the transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    // Check if transaction exists
    if (!updatedTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Transaction updated successfully', transaction: updatedTransaction },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();
    
    const { id } = params;
    
    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }
    
    // Find and delete the transaction
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    
    // Check if transaction exists
    if (!deletedTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Transaction deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction', message: error.message },
      { status: 500 }
    );
  }
} 