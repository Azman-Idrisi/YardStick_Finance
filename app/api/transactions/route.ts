import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/app/lib/mongodb';
import Transaction from '@/app/lib/models/transaction';

// GET /api/transactions - Get all transactions
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 50;
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const sort = searchParams.get('sort') || '-date'; // Default sort by date descending
    
    // Get total count
    const total = await Transaction.countDocuments();
    
    // Fetch transactions with pagination
    const transactions = await Transaction.find({})
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.amount || !body.description) {
      return NextResponse.json(
        { error: 'Amount and description are required fields' },
        { status: 400 }
      );
    }
    
    // Create new transaction
    const newTransaction = new Transaction({
      amount: body.amount,
      description: body.description,
      category: body.category,
      type: body.type,
      date: body.date ? new Date(body.date) : new Date(),
    });
    
    // Save to database
    await newTransaction.save();
    
    return NextResponse.json(
      { message: 'Transaction created successfully', transaction: newTransaction },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction', message: error.message },
      { status: 500 }
    );
  }
} 