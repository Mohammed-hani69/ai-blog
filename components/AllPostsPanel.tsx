
import React, { useState } from 'react';
import { BlogPost } from '../types';

interface AllPostsPanelProps {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
}

export const AllPostsPanel: React.FC<AllPostsPanelProps> = ({ posts, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Stats Calculation
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0); // Shallow count for speed
  const avgViews = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;
  const mostViewed = [...posts].sort((a, b) => b.views - a.views)[0];

  // Filtering
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(posts.map(p => p.category)));

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium mb-1">إجمالي المقالات</p>
            <h3 className="text-2xl font-bold text-slate-800">{posts.length}</h3>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium mb-1">إجمالي المشاهدات</p>
            <h3 className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</h3>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-medium mb-1">متوسط التفاعل</p>
            <h3 className="text-2xl font-bold text-slate-800">{avgViews} <span className="text-xs text-slate-400">مشاهدة/مقال</span></h3>
         </div>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <p className="text-slate-400 text-sm font-medium mb-1">المقال الأفضل أداءً</p>
            <h3 className="text-lg font-bold truncate" title={mostViewed?.title}>{mostViewed ? mostViewed.title : '-'}</h3>
            <p className="text-xs text-green-400 mt-1">{mostViewed?.views} مشاهدة</p>
         </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
         <div className="relative w-full md:w-96">
            <input 
               type="text" 
               placeholder="بحث في العناوين..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
            />
            <svg className="w-5 h-5 text-slate-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
         </div>
         <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-48 px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none bg-white text-sm"
         >
            <option value="all">جميع الأقسام</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
         </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-right">
               <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                     <th className="px-6 py-4">المقال</th>
                     <th className="px-6 py-4">القسم</th>
                     <th className="px-6 py-4">تاريخ النشر</th>
                     <th className="px-6 py-4">المشاهدات</th>
                     <th className="px-6 py-4">الحالة</th>
                     <th className="px-6 py-4 text-center">إجراءات</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredPosts.map(post => (
                     <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                              <div>
                                 <p className="font-bold text-slate-800 text-sm line-clamp-1 max-w-xs">{post.title}</p>
                                 <p className="text-xs text-slate-400">{post.author}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-bold border border-slate-200">
                              {post.category}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{post.date}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              {post.views.toLocaleString()}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 ${
                              post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                           }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                              {post.status === 'published' ? 'منشور' : 'مسودة'}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                 onClick={() => onEdit(post)}
                                 className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                 title="تعديل المقال"
                              >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button 
                                 onClick={() => {
                                    if(window.confirm('هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.')) {
                                       onDelete(post.id);
                                    }
                                 }}
                                 className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                 title="حذف المقال"
                              >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
                  {filteredPosts.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                           لا توجد مقالات تطابق بحثك.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
