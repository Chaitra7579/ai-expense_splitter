
import React, { useState, useEffect, useRef } from 'react';
import { Expense, View, ScheduledReminder } from './types';
import BalanceOverview from './components/BalanceOverview';
import ExpenseForm from './components/ExpenseForm';
import ExpenseHistory from './components/ExpenseHistory';
import SettingsView from './components/SettingsView';
import { showLocalNotification, requestNotificationPermission } from './services/notificationService';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  // Notification states
  const [pushNotifications, setPushNotifications] = useState<boolean>(() => {
    const saved = localStorage.getItem('pushNotifications');
    return saved === null ? true : saved === 'true';
  });
  const [settlementReminders, setSettlementReminders] = useState<boolean>(() => {
    const saved = localStorage.getItem('settlementReminders');
    return saved === null ? true : saved === 'true';
  });

  // Reminder Queue
  const [reminders, setReminders] = useState<ScheduledReminder[]>(() => {
    const saved = localStorage.getItem('scheduledReminders');
    return saved ? JSON.parse(saved) : [];
  });

  const schedulerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('pushNotifications', String(pushNotifications));
  }, [pushNotifications]);

  useEffect(() => {
    localStorage.setItem('settlementReminders', String(settlementReminders));
  }, [settlementReminders]);

  useEffect(() => {
    localStorage.setItem('scheduledReminders', JSON.stringify(reminders));
  }, [reminders]);

  // Settlement Reminder Auto-Scheduler (Weekly on Sundays)
  useEffect(() => {
    if (settlementReminders && pushNotifications) {
      const existingWeekly = reminders.find(r => r.type === 'settlement' && r.status === 'pending');
      if (!existingWeekly) {
        // Schedule next Sunday 10:00 AM
        const now = new Date();
        const nextSunday = new Date();
        nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
        if (nextSunday.getDay() === now.getDay() && now.getHours() >= 10) {
           nextSunday.setDate(nextSunday.getDate() + 7);
        }
        nextSunday.setHours(10, 0, 0, 0);

        const newReminder: ScheduledReminder = {
          id: `weekly-settlement-${nextSunday.getTime()}`,
          title: 'SplitBhai: Settlement Time!',
          body: 'Don\'t forget to settle up your pending balances for the week.',
          scheduledTime: nextSunday.getTime(),
          type: 'settlement',
          status: 'pending'
        };
        setReminders(prev => [...prev, newReminder]);
      }
    }
  }, [settlementReminders, pushNotifications, reminders.length]);

  // The Scheduler Engine
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      const triggeredIndices: number[] = [];
      
      const updatedReminders = reminders.map((r, idx) => {
        if (r.status === 'pending' && r.scheduledTime <= now) {
          if (pushNotifications) {
            showLocalNotification(r.title, { body: r.body });
          }
          triggeredIndices.push(idx);
          return { ...r, status: 'triggered' as const };
        }
        return r;
      });

      if (triggeredIndices.length > 0) {
        setReminders(updatedReminders);
      }
    };

    schedulerIntervalRef.current = window.setInterval(checkReminders, 15000); // Check every 15 seconds
    return () => {
      if (schedulerIntervalRef.current) clearInterval(schedulerIntervalRef.current);
    };
  }, [reminders, pushNotifications]);

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
    setCurrentView(View.DASHBOARD);
    
    // Auto-Notify if push is on
    if (pushNotifications) {
      setTimeout(() => {
        showLocalNotification('Expense Added!', { 
          body: `Added ₹${expense.totalAmount} for ${expense.description}` 
        });
      }, 500);
    }
  };

  const handleManualRemind = (balance: {from: string, to: string, amount: number}) => {
    if (!pushNotifications) {
      alert("Please enable notifications in Settings first.");
      return;
    }
    
    // Request permission just in case
    requestNotificationPermission().then(permission => {
      if (permission === 'granted') {
        const scheduleIn = 5 * 60 * 1000; // Reminder in 5 minutes for demo purposes, usually longer
        const newReminder: ScheduledReminder = {
          id: `followup-${Date.now()}`,
          title: `Follow up: ₹${balance.amount.toFixed(2)}`,
          body: `Time to remind ${balance.from} about the balance for ${balance.to}.`,
          scheduledTime: Date.now() + scheduleIn,
          type: 'followup',
          status: 'pending',
          metadata: { balance }
        };
        setReminders(prev => [...prev, newReminder]);
        alert(`Follow-up reminder set for ${new Date(newReminder.scheduledTime).toLocaleTimeString()}!`);
      } else {
        alert("Notification permission denied. Cannot schedule reminders.");
      }
    });
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

  return (
    <div className="min-h-screen pb-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">SplitBhai</h1>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Your AI Expense Bro</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer" onClick={() => setCurrentView(View.SETTINGS)}>
          <img src="https://picsum.photos/seed/user/100/100" alt="profile" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6 space-y-8">
        
        {/* Summary Card */}
        <section className="bg-indigo-600 dark:bg-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 dark:shadow-none overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-wider">Total Group Spending</p>
            <h2 className="text-4xl font-black mb-4">₹{totalSpent.toLocaleString('en-IN')}</h2>
            <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 flex-1">
                  <p className="text-[10px] font-bold text-indigo-200 uppercase">Expenses</p>
                  <p className="text-xl font-bold">{expenses.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 flex-1">
                  <p className="text-[10px] font-bold text-indigo-200 uppercase">Avg / Exp</p>
                  <p className="text-xl font-bold">₹{expenses.length ? (totalSpent / expenses.length).toFixed(0) : 0}</p>
                </div>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-indigo-400 rounded-full blur-3xl opacity-30"></div>
        </section>

        {/* Dynamic Views */}
        <section className="space-y-8">
          <BalanceOverview expenses={expenses} onRemind={handleManualRemind} />
          <ExpenseHistory expenses={expenses} />
        </section>
      </main>

      {/* Floating Action Button */}
      {currentView === View.DASHBOARD && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={() => setCurrentView(View.ADD_EXPENSE)}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-indigo-300 dark:shadow-indigo-900/50 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Expense
          </button>
        </div>
      )}

      {/* Modals/Overlays */}
      {currentView === View.ADD_EXPENSE && (
        <ExpenseForm 
          onExpenseAdded={addExpense} 
          onCancel={() => setCurrentView(View.DASHBOARD)} 
        />
      )}

      {currentView === View.SETTINGS && (
        <SettingsView 
          theme={theme}
          onThemeChange={setTheme}
          pushNotifications={pushNotifications}
          onPushNotificationsChange={setPushNotifications}
          settlementReminders={settlementReminders}
          onSettlementRemindersChange={setSettlementReminders}
          onClose={() => setCurrentView(View.DASHBOARD)} 
        />
      )}

      {/* Navigation (Mobile Style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-around z-40 transition-colors">
        <button onClick={() => setCurrentView(View.DASHBOARD)} className={`flex flex-col items-center gap-1 transition-colors ${currentView === View.DASHBOARD ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Friends</span>
        </button>
        <button 
          onClick={() => setCurrentView(View.SETTINGS)} 
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === View.SETTINGS ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
