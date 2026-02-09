
import React, { useState, useRef } from 'react';
import { processExpenseText, processExpenseImage } from '../services/geminiService';
import { AIProcessedExpense, Expense } from '../types';

interface ExpenseFormProps {
  onExpenseAdded: (expense: Expense) => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onExpenseAdded, onCancel }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<AIProcessedExpense | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      const result = await processExpenseText(inputText);
      setPreview(result);
    } catch (error) {
      console.error(error);
      alert("Failed to process expense. Try being more specific.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const result = await processExpenseImage(base64Data, file.type);
        setPreview(result);
      };
    } catch (error) {
      console.error(error);
      alert("Failed to read bill.");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmExpense = () => {
    if (!preview) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: preview.description,
      totalAmount: preview.totalAmount,
      payer: preview.payer,
      date: new Date().toISOString(),
      splits: preview.splits,
    };

    onExpenseAdded(newExpense);
    setPreview(null);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 overflow-y-auto px-4 py-8 transition-colors duration-300">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onCancel} className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">New Expense</h1>
          <div className="w-10"></div>
        </div>

        {!preview ? (
          <div className="space-y-6">
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-colors">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder='Try saying "Dinner at Taj for 5000. Amit paid. Split equally between Amit, Rahul, and Sneha."'
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 min-h-[120px] resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isProcessing || !inputText.trim()}
                className="w-full py-4 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Thinking...
                   </span>
                ) : 'Process with AI'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-600 transition-colors">or scan bill</span>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Upload Bill Image
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-950 space-y-6 transition-colors">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-3xl text-center border border-indigo-100 dark:border-indigo-800/50">
              <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">Total Bill</p>
              <h2 className="text-4xl font-black text-indigo-600 dark:text-indigo-300">₹{preview.totalAmount}</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">{preview.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase mb-3">Paid by</h3>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold">
                   {preview.payer[0]}
                 </div>
                 <span className="font-bold text-slate-700 dark:text-slate-200">{preview.payer}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase mb-3">Splits</h3>
              <div className="space-y-2">
                {preview.splits.map((split, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
                    <span className="font-medium text-slate-600 dark:text-slate-400">{split.name}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{split.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/40">
               <p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase mb-1">AI Recommendation</p>
               <p className="text-sm italic text-amber-800 dark:text-amber-200">"{preview.reminders}"</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setPreview(null)}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Redo
              </button>
              <button
                onClick={confirmExpense}
                className="flex-[2] py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 dark:shadow-none transition-all hover:scale-[1.02]"
              >
                Add Expense
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseForm;
