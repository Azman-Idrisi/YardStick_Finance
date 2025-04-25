import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/app/lib/mongodb';
import Budget from '@/app/lib/models/budget';

// GET /api/budgets - Get all budgets or filter by category/month
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const month = searchParams.get('month');
    
    // Build query object based on provided filters
    const query: Record<string, any> = {};
    if (category) query.category = category;
    if (month) query.month = month;
    
    // Fetch budgets
    const budgets = await Budget.find(query).sort({ category: 1, month: 1 });
    
    return NextResponse.json({ budgets }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Create a new budget or update existing
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.category || !body.month || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Category, month, and amount are required fields' },
        { status: 400 }
      );
    }
    
    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(body.month)) {
      return NextResponse.json(
        { error: 'Month must be in YYYY-MM format' },
        { status: 400 }
      );
    }
    
    // Try to find an existing budget for this category/month
    const existingBudget = await Budget.findOne({
      category: body.category,
      month: body.month
    });
    
    let result;
    let statusCode = 201;
    let message = 'Budget created successfully';
    
    if (existingBudget) {
      // Update existing budget
      existingBudget.amount = body.amount;
      result = await existingBudget.save();
      statusCode = 200;
      message = 'Budget updated successfully';
    } else {
      // Create new budget
      const newBudget = new Budget({
        category: body.category,
        month: body.month,
        amount: body.amount
      });
      result = await newBudget.save();
    }
    
    return NextResponse.json(
      { message, budget: result },
      { status: statusCode }
    );
  } catch (error: any) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create/update budget', message: error.message },
      { status: 500 }
    );
  }
} 