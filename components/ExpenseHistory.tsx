
import React from 'react';
import { Expense } from '../types';

interface ExpenseHistoryProps {
  expenses: Expense[];
}

const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({ expenses }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 px-1">Recent Expenses</h2>
      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 transition-colors">
          <p className="text-slate-400 dark:text-slate-600">No expenses yet. Add one to get started!</p>
        </div>
      ) : (
        expenses.slice().reverse().map((expense) => (
          <div key={expense.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{expense.description}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Paid by {expense.payer} • {formatDate(expense.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">₹{expense.totalAmount}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                {expense.splits.length} People
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ExpenseHistory;
