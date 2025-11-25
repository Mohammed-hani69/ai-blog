import React from 'react';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H16a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H16a2 2 0 01-2-2v-2z' },
    { id: 'analytics', label: 'التحليلات والبيانات', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'ai-control', label: 'الطيار الآلي (AI)', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'manual', label: 'كتابة يدوية', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'ads', label: 'إدارة الإعلانات', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed right-0 top-0 z-50 font-sans shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 space-x-reverse">
         <Logo className="w-10 h-10 rounded-lg" />
         <div>
            <h1 className="text-xl font-bold font-serif tracking-wide text-white">مزاد <span className="text-blue-500">بلس</span></h1>
         </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase mb-2">القائمة الرئيسية</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-[-4px]'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-[-2px]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button onClick={() => window.open('/', '_blank')} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-2 rounded-lg flex items-center justify-center space-x-2 space-x-reverse transition-colors">
           <span>زيارة الموقع</span>
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </button>
        <div className="mt-4 flex items-center space-x-3 space-x-reverse">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 border-2 border-slate-700"></div>
          <div>
            <p className="text-sm font-medium text-white">المدير العام</p>
            <p className="text-xs text-green-400">متصل الآن</p>
          </div>
        </div>
      </div>
    </div>
  );
};