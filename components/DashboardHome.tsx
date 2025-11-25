import React from 'react';
import { BlogPost, AIState, LogEntry } from '../types';
import { AIStatusTerminal } from './AIStatusTerminal';

interface DashboardHomeProps {
  posts: BlogPost[];
  aiState: AIState;
  logs: LogEntry[];
  onNavigate: (tab: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ posts, aiState, logs, onNavigate }) => {
  const totalViews = posts.reduce((acc, p) => acc + p.views, 0);
  const totalPosts = posts.length;
  const recentPost = posts.length > 0 ? posts[0] : null;
  const activeDiscussions = posts.filter(p => p.comments.length > 0).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
       {/* Welcome Banner */}
       <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-serif mb-2">مرحباً بك في مزاد بلس</h1>
            <p className="text-slate-300 max-w-xl text-lg">لوحة التحكم المركزية لإدارة المحتوى والذكاء الاصطناعي. نظامك يعمل بكفاءة.</p>
            <div className="mt-8 flex gap-4">
               <button 
                 onClick={() => onNavigate('manual')} 
                 className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/50 flex items-center"
               >
                 <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 كتابة مقال جديد
               </button>
               <button 
                 onClick={() => onNavigate('analytics')} 
                 className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors border border-slate-600 flex items-center"
               >
                 <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                 عرض التحليلات
               </button>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats Column */}
          <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-slate-500 text-sm font-medium mb-2">إجمالي المشاهدات</p>
                      <h3 className="text-3xl font-bold text-slate-800">{totalViews.toLocaleString()}</h3>
                      <div className="mt-2 text-green-500 text-xs font-bold flex items-center bg-green-50 w-fit px-2 py-1 rounded-full">
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        <span>تحديث لحظي</span>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-slate-500 text-sm font-medium mb-2">المقالات المنشورة</p>
                      <h3 className="text-3xl font-bold text-slate-800">{totalPosts}</h3>
                      <div className="mt-2 text-blue-500 text-xs font-bold flex items-center bg-blue-50 w-fit px-2 py-1 rounded-full">
                        <span>آخر نشر: {recentPost?.date || '-'}</span>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-slate-500 text-sm font-medium mb-2">مناقشات نشطة</p>
                      <h3 className="text-3xl font-bold text-slate-800">{activeDiscussions}</h3>
                      <div className="mt-2 text-purple-500 text-xs font-bold flex items-center bg-purple-50 w-fit px-2 py-1 rounded-full">
                        <span>مقالات بها تعليقات</span>
                      </div>
                  </div>
              </div>

               {/* Recent Activity / Post Teaser */}
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-lg text-slate-800">آخر مقال تم نشره</h3>
                     <button onClick={() => onNavigate('post')} className="text-blue-600 text-sm font-bold hover:underline">معاينة</button>
                  </div>
                  {recentPost ? (
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <img src={recentPost.imageUrl} className="w-full md:w-48 h-32 rounded-xl object-cover shadow-sm" alt="post" />
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-2">
                              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">{recentPost.category}</span>
                              <span className="text-slate-400 text-xs">{recentPost.date}</span>
                           </div>
                           <h4 className="text-xl font-bold text-slate-900 mb-2 leading-snug">{recentPost.title}</h4>
                           <p className="text-slate-500 text-sm line-clamp-2 mb-4">{recentPost.excerpt}</p>
                           <div className="flex items-center gap-4 text-sm text-slate-500 border-t border-slate-50 pt-3">
                              <span className="flex items-center"><svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> {recentPost.views}</span>
                              <span className="flex items-center"><svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> {recentPost.comments.length}</span>
                           </div>
                        </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                        <p>لا توجد مقالات منشورة حتى الآن.</p>
                    </div>
                  )}
               </div>
          </div>

          {/* System Status (Terminal) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1 overflow-hidden h-full">
                <AIStatusTerminal logs={logs} currentState={aiState} />
             </div>
          </div>
       </div>
    </div>
  );
};