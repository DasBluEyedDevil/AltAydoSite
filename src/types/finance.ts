export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

export type TransactionCategory = 
  | 'SALARY'
  | 'MISSION_REWARD'
  | 'CARGO_SALE'
  | 'MINING_PROCEEDS'
  | 'EQUIPMENT_PURCHASE'
  | 'SHIP_PURCHASE'
  | 'FUEL_EXPENSE'
  | 'MAINTENANCE'
  | 'OTHER';

export interface Transaction {
  id?: string;
  _id?: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  submittedBy: string;
  submittedAt: Date;
}

export interface FinanceState {
  grandTotal: number;
  transactions: Transaction[];
} 