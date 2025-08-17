import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Transaction, TransactionType, TransactionCategory } from '@/types/finance';
import { ObjectId, WithId, Document } from 'mongodb';
import { apiRateLimiter } from '@/lib/rate-limiter';

// Validate transaction type
const isValidTransactionType = (type: string): type is TransactionType => {
  return ['DEPOSIT', 'WITHDRAWAL'].includes(type);
};

// Validate transaction category
const isValidCategory = (category: string): category is TransactionCategory => {
  return [
    'SALARY',
    'MISSION_REWARD',
    'CARGO_SALE',
    'MINING_PROCEEDS',
    'EQUIPMENT_PURCHASE',
    'SHIP_PURCHASE',
    'FUEL_EXPENSE',
    'MAINTENANCE',
    'OTHER'
  ].includes(category);
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    if (apiRateLimiter.isRateLimited(session.user.email)) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          resetTime: apiRateLimiter.getResetTime(session.user.email),
          remainingRequests: apiRateLimiter.getRemainingRequests(session.user.email)
        }, 
        { status: 429 }
      );
    }

    const { client } = await connectToDatabase();
    const db = client.db();
    
    // Get all transactions (not just current user's) sorted by date
    const transactions = await db
      .collection('transactions')
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();

    // Convert MongoDB documents to Transaction type and calculate grand total
    const typedTransactions = transactions.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      _id: undefined,
      submittedAt: new Date(doc.submittedAt)
    })) as Transaction[];

    const grandTotal = typedTransactions.reduce((total: number, transaction: Transaction) => {
      return total + (transaction.type === 'DEPOSIT' ? transaction.amount : -transaction.amount);
    }, 0);

    return NextResponse.json({
      transactions: typedTransactions,
      grandTotal,
      remainingRequests: apiRateLimiter.getRemainingRequests(session.user.email)
    });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has required clearance (level 3 or higher)
    const clearance = session.user.clearanceLevel;
    if (typeof clearance !== 'number' || clearance < 3) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only users with clearance level 3 or higher can submit transactions.' },
        { status: 403 }
      );
    }

    // Apply rate limiting
    if (apiRateLimiter.isRateLimited(session.user.email)) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          resetTime: apiRateLimiter.getResetTime(session.user.email),
          remainingRequests: apiRateLimiter.getRemainingRequests(session.user.email)
        }, 
        { status: 429 }
      );
    }

    const { type, amount, category, description } = await request.json();

    // Validate required fields
    if (!type || !amount || !category || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate transaction type
    if (!isValidTransactionType(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Validate category
    if (!isValidCategory(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const { client } = await connectToDatabase();
    const db = client.db();

    const transaction: Omit<Transaction, 'id' | '_id'> = {
      type,
      amount,
      category,
      description,
      submittedBy: session.user.email,
      submittedAt: new Date()
    };

    const result = await db.collection('transactions').insertOne(transaction);

    return NextResponse.json({
      message: 'Transaction created successfully',
      transaction: {
        ...transaction,
        id: result.insertedId.toString(),
      },
      remainingRequests: apiRateLimiter.getRemainingRequests(session.user.email)
    });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 