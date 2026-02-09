
export interface Split {
  name: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  totalAmount: number;
  payer: string;
  date: string;
  splits: Split[];
  category?: string;
}

export interface Balance {
  from: string;
  to: string;
  amount: number;
}

export interface AIProcessedExpense {
  description: string;
  totalAmount: number;
  payer: string;
  splits: Split[];
  reminders: string;
}

export interface ScheduledReminder {
  id: string;
  title: string;
  body: string;
  scheduledTime: number; // timestamp
  type: 'settlement' | 'followup';
  status: 'pending' | 'triggered' | 'cancelled';
  metadata?: any;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  ADD_EXPENSE = 'ADD_EXPENSE',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  REMINDERS = 'REMINDERS'
}
