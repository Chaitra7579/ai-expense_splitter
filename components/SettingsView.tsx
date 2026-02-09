
import React, { useState } from 'react';
import { requestNotificationPermission } from '../services/notificationService';

interface SettingsViewProps {
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  pushNotifications: boolean;
  onPushNotificationsChange: (val: boolean) => void;
  settlementReminders: boolean;
  onSettlementRemindersChange: (val: boolean) => void;
}

type SubView = 'main' | 'currency' | 'theme' | 'notifications' | 'preferences' | 'ai' | 'payments' | 'privacy' | 'about' | 'privacy_policy' | 'terms_of_service';

const SettingsView: React.FC<SettingsViewProps> = ({ 
  onClose, 
  theme, 
  onThemeChange, 
  pushNotifications, 
  onPushNotificationsChange, 
  settlementReminders, 
  onSettlementRemindersChange 
}) => {
  const [subView, setSubView] = useState<SubView>('main');
  const [currency, setCurrency] = useState('₹ (Indian Rupees)');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [defaultSplit, setDefaultSplit] = useState<'equal' | 'item'>('equal');
  const [docLoading, setDocLoading] = useState(false);

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out? Your data is stored locally and will be cleared.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleTogglePush = async () => {
    const newVal = !pushNotifications;
    if (newVal) {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        onPushNotificationsChange(true);
      } else {
        alert("Notification permission denied. Please enable them in your browser settings.");
      }
    } else {
      onPushNotificationsChange(false);
    }
  };

  const handleToggleSettlement = async () => {
    const newVal = !settlementReminders;
    if (newVal) {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        onSettlementRemindersChange(true);
      } else {
        alert("Notification permission denied. Settlement reminders require notifications.");
      }
    } else {
      onSettlementRemindersChange(false);
    }
  };

  const openDocument = (view: SubView) => {
    setDocLoading(true);
    setTimeout(() => {
      setSubView(view);
      setDocLoading(false);
    }, 600);
  };

  const renderHeader = (title: string, onBack: () => void) => (
    <div className="flex items-center justify-between mb-8">
      <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
      <div className="w-10"></div>
    </div>
  );

  const renderMain = () => {
    const settingsSections = [
      {
        title: "General",
        items: [
          { label: "Currency", value: currency, icon: "₹", view: 'currency' as SubView },
          { label: "Theme", value: theme.charAt(0).toUpperCase() + theme.slice(1), icon: theme === 'light' ? "🌞" : "🌙", view: 'theme' as SubView },
        ]
      },
      {
        title: "Preferences",
        items: [
          { label: "Notifications & Reminders", value: (pushNotifications && settlementReminders) ? "All On" : (pushNotifications || settlementReminders) ? "Custom" : "Off", icon: "🔔", view: 'notifications' as SubView },
          { label: "Expense Preferences", value: defaultSplit === 'equal' ? "Equal Split" : "Item-based", icon: "📊", view: 'preferences' as SubView },
          { label: "AI Features", value: aiEnabled ? "Enabled" : "Disabled", icon: "✨", view: 'ai' as SubView },
        ]
      },
      {
        title: "Account",
        items: [
          { label: "Payments & Wallet", value: "3 Linked", icon: "💳", view: 'payments' as SubView },
          { label: "Privacy", value: "Standard", icon: "🔒", view: 'privacy' as SubView },
        ]
      },
      {
        title: "Support",
        items: [
          { label: "About SplitBhai", value: "v1.0.4", icon: "ℹ️", view: 'about' as SubView },
        ]
      }
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
        {renderHeader("Settings", onClose)}
        <div className="space-y-8">
          {settingsSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 px-1">{section.title}</h3>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                {section.items.map((item, itemIdx) => (
                  <button 
                    key={itemIdx} 
                    onClick={() => setSubView(item.view)}
                    className={`w-full flex items-center justify-between p-5 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors ${itemIdx !== section.items.length - 1 ? 'border-b border-slate-200/50 dark:border-slate-800' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl w-8 text-center">{item.icon}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">{item.value}</span>}
                      <svg className="w-4 h-4 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 pb-12">
            <button 
              onClick={handleSignOut}
              className="w-full py-4 text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/30 active:scale-95 transition-all"
            >
              Sign Out
            </button>
            <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.2em] mt-8">
              Made with ❤️ in India
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSubViewContent = () => {
    if (docLoading) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-950 z-[60]">
          <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-xs">Loading Content...</p>
        </div>
      );
    }

    switch (subView) {
      case 'currency':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {renderHeader("Currency", () => setSubView('main'))}
            <div className="space-y-2">
              {['₹ (Indian Rupees)', '$ (US Dollar)', '€ (Euro)', '£ (Pound)'].map((curr) => (
                <button 
                  key={curr}
                  onClick={() => { setCurrency(curr); setSubView('main'); }}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${currency === curr ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span className="font-bold">{curr}</span>
                  {currency === curr && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case 'theme':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {renderHeader("Theme", () => setSubView('main'))}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onThemeChange('light')}
                className={`flex flex-col items-center gap-4 p-8 rounded-3xl transition-all border-2 ${theme === 'light' ? 'bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-400 shadow-xl scale-105' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-2 ${theme === 'light' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>🌞</div>
                <span className="font-bold">Light</span>
                {theme === 'light' && <span className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-80">Selected</span>}
              </button>
              <button 
                onClick={() => onThemeChange('dark')}
                className={`flex flex-col items-center gap-4 p-8 rounded-3xl transition-all border-2 ${theme === 'dark' ? 'bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-400 shadow-xl scale-105' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-2 ${theme === 'dark' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>🌙</div>
                <span className="font-bold">Dark</span>
                {theme === 'dark' && <span className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-80">Selected</span>}
              </button>
            </div>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic px-4 mt-4 leading-relaxed">
              Theme changes are applied immediately across the entire app and saved to your local storage.
            </p>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {renderHeader("Notifications", () => setSubView('main'))}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <button 
                onClick={handleTogglePush}
                className="w-full flex items-center justify-between p-5 border-b border-slate-200/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex flex-col text-left">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Push Notifications</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Get alerts for new group expenses</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative pointer-events-none ${pushNotifications ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${pushNotifications ? 'left-7' : 'left-1'}`}></div>
                </div>
              </button>
              <button 
                onClick={handleToggleSettlement}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex flex-col text-left">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Settlement Reminders</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Weekly nudge for pending dues</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors relative pointer-events-none ${settlementReminders ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settlementReminders ? 'left-7' : 'left-1'}`}></div>
                </div>
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 dark:text-slate-600 px-4">
              Notifications help you stay on top of shared expenses. We promise not to spam!
            </p>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {renderHeader("Expense Preferences", () => setSubView('main'))}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1">Default Split Method</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'equal', title: 'Equally', desc: 'Split total bill equally among everyone' },
                  { id: 'item', title: 'Item-based', desc: 'AI assigns items to specific people' }
                ].map((method) => (
                  <button 
                    key={method.id}
                    onClick={() => setDefaultSplit(method.id as 'equal' | 'item')}
                    className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${defaultSplit === method.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-md' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <div className="text-left">
                      <p className="font-bold">{method.title}</p>
                      <p className="text-xs opacity-70">{method.desc}</p>
                    </div>
                    {defaultSplit === method.id && (
                      <div className="bg-indigo-500 rounded-full p-1 text-white">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {renderHeader("Privacy", () => setSubView('main'))}
            <div className="space-y-6">
               <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800">
                 <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Data Protection</h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                   Your financial data is stored locally on your device. We use end-to-end encryption for any data processed via Gemini AI for bill scanning.
                 </p>
               </div>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {renderHeader("AI Features", () => setSubView('main'))}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-3xl mb-4 border border-indigo-100 dark:border-indigo-800/50">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200">Gemini 3 Pro Powered</h3>
              </div>
              <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
                SplitBhai uses advanced AI to understand your voice, text, and photos of bills. 
                Our AI suggests fair splits based on item descriptions automatically.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-2 space-y-1 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between p-5">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700 dark:text-slate-300">AI Bill Scanning</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Extract items and prices from photos</span>
                </div>
                <button 
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${aiEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${aiEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {renderHeader("About SplitBhai", () => setSubView('main'))}
            <div className="text-center space-y-4 px-4 py-8">
              <div className="w-24 h-24 bg-indigo-600 dark:bg-indigo-500 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mx-auto shadow-2xl shadow-indigo-200 dark:shadow-none">
                SB
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">SplitBhai</h2>
                <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">Version 1.0.4 Platinum</p>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                The smarter way to split bills with friends. No more calculators, no more awkward "who owes what" conversations. Let the AI handle it!
              </p>
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <button 
                  onClick={() => openDocument('privacy_policy')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => openDocument('terms_of_service')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        );
      case 'privacy_policy':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full">
            {renderHeader("Privacy Policy", () => setSubView('about'))}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 prose dark:prose-invert prose-slate max-w-none overflow-y-auto max-h-[70vh]">
              <h3 className="font-black text-slate-800 dark:text-slate-100">1. Data Collection</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">We prioritize your privacy. SplitBhai stores your expense data locally on your device.</p>
              
              <h3 className="font-black text-slate-800 dark:text-slate-100 mt-4">2. AI Processing</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Your data is processed by Google Gemini AI according to enterprise standards.</p>

              <h3 className="font-black text-slate-800 dark:text-slate-100 mt-4">3. Permissions</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">We request notification permission to alert you about pending settlement and group activities.</p>
            </div>
          </div>
        );
      case 'terms_of_service':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full">
            {renderHeader("Terms of Service", () => setSubView('about'))}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 prose dark:prose-invert prose-slate max-w-none overflow-y-auto max-h-[70vh]">
              <h3 className="font-black text-slate-800 dark:text-slate-100">1. Acceptance</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">By using SplitBhai, you agree to these terms.</p>
              
              <h3 className="font-black text-slate-800 dark:text-slate-100 mt-4">2. User Conduct</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">You are responsible for the accuracy of expenses entered.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {renderHeader("Setting", () => setSubView('main'))}
            <div className="text-center py-12">
              <p className="text-slate-400 dark:text-slate-600 italic">This module is under construction.</p>
              <button 
                onClick={() => setSubView('main')}
                className="mt-4 px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full font-bold"
              >
                Go Back
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 overflow-y-auto transition-colors duration-300">
      <div className="max-w-md mx-auto px-6 py-8">
        {subView === 'main' ? renderMain() : renderSubViewContent()}
      </div>
    </div>
  );
};

export default SettingsView;
