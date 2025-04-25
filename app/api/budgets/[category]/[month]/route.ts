import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/app/lib/mongodb';
import Budget from '@/app/lib/models/budget';

// GET /api/budgets/[category]/[month]
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string; month: string } }
) {
  try {
    await connectToMongoDB();
    
    const { category, month } = params;
    
    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'Month must be in YYYY-MM format' },
        { status: 400 }
      );
    }
    
    // Find the budget
    const budget = await Budget.findOne({ category, month });
    
    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ budget }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/budgets/[category]/[month]
export async function PUT(
  request: NextRequest,
  { params }: { params: { category: string; month: string } }
) {
  try {
    await connectToMongoDB();
    
    const { category, month } = params;
    const body = await request.json();
    
    // Validate required fields
    if (body.amount === undefined) {
      return NextResponse.json(
        { error: 'Amount is a required field' },
        { status: 400 }
      );
    }
    
    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'Month must be in YYYY-MM format' },
        { status: 400 }
      );
    }
    
    // Find and update the budget
    const updatedBudget = await Budget.findOneAndUpdate(
      { category, month },
      { amount: body.amount },
      { new: true, runValidators: true }
    );
    
    if (!updatedBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Budget updated successfully', budget: updatedBudget },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[category]/[month]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { category: string; month: string } }
) {
  try {
    await connectToMongoDB();
    
    const { category, month } = params;
    
    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'Month must be in YYYY-MM format' },
        { status: 400 }
      );
    }
    
    // Find and delete the budget
    const deletedBudget = await Budget.findOneAndDelete({ category, month });
    
    if (!deletedBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Budget deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget', message: error.message },
      { status: 500 }
    );
  }
} 