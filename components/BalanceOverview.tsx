
import React from 'react';
import { Expense, Balance } from '../types';

interface BalanceOverviewProps {
  expenses: Expense[];
  onRemind?: (balance: Balance) => void;
}

const BalanceOverview: React.FC<BalanceOverviewProps> = ({ expenses, onRemind }) => {
  const calculateBalances = (): Balance[] => {
    const people = Array.from(new Set(expenses.flatMap(e => [e.payer, ...e.splits.map(s => s.name)]))) as string[];
    const netBalances: Record<string, number> = {};
    people.forEach(p => netBalances[p] = 0);

    expenses.forEach(e => {
        netBalances[e.payer] = (netBalances[e.payer] || 0) + e.totalAmount;
        e.splits.forEach(s => {
            netBalances[s.name] = (netBalances[s.name] || 0) - s.amount;
        });
    });

    const creditors = people.filter(p => (netBalances[p] || 0) > 0.01).sort((a, b) => (netBalances[b] || 0) - (netBalances[a] || 0));
    const debtors = people.filter(p => (netBalances[p] || 0) < -0.01).sort((a, b) => (netBalances[a] || 0) - (netBalances[b] || 0));

    const result: Balance[] = [];
    let i = 0, j = 0;
    const netBalancesCopy = { ...netBalances };

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amountToPay = Math.min(-(netBalancesCopy[debtor] || 0), (netBalancesCopy[creditor] || 0));

        if (amountToPay > 0.01) {
            result.push({ from: debtor, to: creditor, amount: amountToPay });
        }

        netBalancesCopy[debtor] = (netBalancesCopy[debtor] || 0) + amountToPay;
        netBalancesCopy[creditor] = (netBalancesCopy[creditor] || 0) - amountToPay;

        if (Math.abs(netBalancesCopy[debtor] || 0) < 0.01) i++;
        if (Math.abs(netBalancesCopy[creditor] || 0) < 0.01) j++;
    }

    return result;
  };

  const balances = calculateBalances();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Who owes who?</h2>
      {balances.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400">All settled up! No pending dues.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {balances.map((balance, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                  {balance.from[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{balance.from}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">owes {balance.to}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-rose-500 dark:text-rose-400">₹{balance.amount.toFixed(2)}</p>
                <button 
                  onClick={() => onRemind?.(balance)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider hover:underline"
                >
                  Remind
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BalanceOverview;
