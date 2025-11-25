
import React from 'react';
import { Sidebar } from './Sidebar';
import { AdminProfile } from '../types';

interface DashboardLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  onLogout: () => void;
  adminProfile: AdminProfile;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ activeTab, setActiveTab, children, onLogout, adminProfile }) => {
  
  const getTabTitle = (tab: string) => {
    switch(tab) {
      case 'dashboard': return 'لوحة التحكم';
      case 'all-posts': return 'جميع المقالات';
      case 'analytics': return 'التحليلات والبيانات';
      case 'ai-control': return 'الطيار الآلي (AI)';
      case 'manual': return 'كتابة يدوية';
      case 'ads': return 'إدارة الإعلانات';
      case 'profile': return 'إعدادات الحساب';
      default: return tab;
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans" dir="rtl">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} adminProfile={adminProfile} />
      
      <main className="flex-1 mr-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center">
            <h2 className="font-semibold text-slate-700 text-lg">{getTabTitle(activeTab)}</h2>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 border border-slate-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <button 
              onClick={onLogout}
              className="text-sm font-medium text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
            >
              تسجيل خروج
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="min-h-[calc(100vh-64px)] p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
