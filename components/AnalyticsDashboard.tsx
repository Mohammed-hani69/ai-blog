import React from 'react';
import { BlogPost, Comment } from '../types';

interface AnalyticsDashboardProps {
  posts: BlogPost[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ posts }) => {
  // 1. Calculate Basic Stats
  const countCommentsDeep = (comments: Comment[]): number => {
    return comments.reduce((acc, c) => acc + 1 + (c.replies ? countCommentsDeep(c.replies) : 0), 0);
  };

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalComments = posts.reduce((sum, post) => sum + countCommentsDeep(post.comments), 0);
  const totalPosts = posts.length;
  const engagementRate = totalViews > 0 ? ((totalComments / totalViews) * 100).toFixed(2) : "0";

  // 2. Get Top Articles (Most Viewed)
  const sortedByViews = [...posts].sort((a, b) => b.views - a.views);
  
  // 3. Get Top Engaged Articles (Most Commented)
  const sortedByComments = [...posts].sort((a, b) => countCommentsDeep(b.comments) - countCommentsDeep(a.comments));
  const topCommented = sortedByComments.slice(0, 5);

  // 4. Category Distribution
  const categoryCounts: Record<string, number> = {};
  const categoryViews: Record<string, number> = {};
  
  posts.forEach(post => {
    categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
    categoryViews[post.category] = (categoryViews[post.category] || 0) + post.views;
  });
  
  const categoryData = Object.keys(categoryCounts).map(cat => ({
    category: cat,
    count: categoryCounts[cat],
    views: categoryViews[cat],
    avgViews: Math.round(categoryViews[cat] / categoryCounts[cat])
  })).sort((a, b) => b.views - a.views);

  // 5. Traffic Sources Analysis
  const trafficTotals = posts.reduce((acc, post) => {
    const sources = post.trafficSources || { search: 0, social: 0, direct: 0, referral: 0 };
    acc.search += sources.search || 0;
    acc.social += sources.social || 0;
    acc.direct += sources.direct || 0;
    acc.referral += sources.referral || 0;
    return acc;
  }, { search: 0, social: 0, direct: 0, referral: 0 });

  const totalTraffic = trafficTotals.search + trafficTotals.social + trafficTotals.direct + trafficTotals.referral;
  
  const trafficData = [
    { label: 'محركات البحث', value: trafficTotals.search, color: '#3b82f6' },
    { label: 'شبكات اجتماعية', value: trafficTotals.social, color: '#8b5cf6' },
    { label: 'زيارات مباشرة', value: trafficTotals.direct, color: '#10b981' },
    { label: 'إحالات مواقع', value: trafficTotals.referral, color: '#f59e0b' },
  ];

  const calculateDashArray = (val: number, total: number) => {
      if (total === 0) return "0 100";
      const percent = (val / total) * 100;
      return `${percent} ${100 - percent}`;
  };

  const calculateOffset = (index: number, data: any[], total: number) => {
      let prevPercent = 0;
      for(let i=0; i<index; i++) {
          prevPercent += (data[i].value / total) * 100;
      }
      return 25 - prevPercent;
  };

  // 6. Generate Trend Data (Simulated)
  const trendData = (() => {
     const days = ['الجمعة', 'الخميس', 'الأربعاء', 'الثلاثاء', 'الاثنين', 'الأحد', 'السبت'].reverse();
     const data = [];
     for (let i = 0; i < 7; i++) {
        const progress = (i + 1) / 7; 
        const dayValue = Math.floor(totalViews * (0.1 + (0.15 * progress) + (Math.random() * 0.05)));
        data.push({ label: days[i], value: dayValue });
     }
     return data;
  })();

  const maxTrend = Math.max(...trendData.map(d => d.value)) || 10;
  const chartWidth = 600;
  const chartHeight = 200;
  
  const polylinePoints = trendData.map((d, i) => {
      const x = (i / (trendData.length - 1)) * chartWidth;
      const y = chartHeight - ((d.value / maxTrend) * (chartHeight - 40)) - 20;
      return `${x},${y}`;
  }).join(' ');

  // 7. Comment Analysis (Length & Sentiment)
  const allCommentsList: string[] = [];
  const collectComments = (cmts: Comment[]) => {
      cmts.forEach(c => {
          allCommentsList.push(c.content);
          if(c.replies) collectComments(c.replies);
      });
  };
  posts.forEach(p => collectComments(p.comments));

  const shortComments = allCommentsList.filter(c => c.length < 50).length;
  const longComments = allCommentsList.length - shortComments;

  // Sentiment Analysis
  let sentimentStats = { positive: 0, negative: 0, neutral: 0 };
  allCommentsList.forEach(txt => {
      if (/(شكرا|رائع|جميل|ممتاز|مفيد|أحببت|جيد|عظيم|اتفق|يسلمو|نعم)/i.test(txt)) sentimentStats.positive++;
      else if (/(سيء|ضعيف|خطأ|لا أتفق|مشكلة|تحسين|غريب|كذب|كلا)/i.test(txt)) sentimentStats.negative++;
      else sentimentStats.neutral++;
  });
  
  const sentimentData = [
      { label: 'إيجابي', value: sentimentStats.positive, color: '#22c55e' }, // green-500
      { label: 'سلبي', value: sentimentStats.negative, color: '#ef4444' },   // red-500
      { label: 'محايد', value: sentimentStats.neutral, color: '#cbd5e1' }    // slate-300
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">لوحة التحليلات الشاملة</h2>
            <p className="text-slate-500 text-sm mt-1">بيانات تفصيلية حول الجمهور والمحتوى.</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي المشاهدات', value: totalViews.toLocaleString(), color: 'blue', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
          { label: 'إجمالي التعليقات والردود', value: totalComments.toLocaleString(), color: 'purple', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
          { label: 'المقالات المنشورة', value: totalPosts, color: 'green', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
          { label: 'معدل المشاركة', value: `${engagementRate}%`, color: 'orange', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 space-x-reverse hover:shadow-md transition-shadow">
             <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-full flex items-center justify-center`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
             </div>
             <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Traffic & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Traffic Sources */}
         <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">مصادر الزيارات</h3>
            <div className="flex flex-col items-center">
               <div className="relative w-48 h-48 mb-6">
                  <svg width="100%" height="100%" viewBox="0 0 40 40" className="transform -rotate-0">
                     <circle cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
                     {trafficData.map((item, i) => (
                        <circle
                           key={i}
                           cx="20" cy="20" r="15.91549430918954" 
                           fill="transparent" stroke={item.color} strokeWidth="4"
                           strokeDasharray={calculateDashArray(item.value, totalTraffic)}
                           strokeDashoffset={calculateOffset(i, trafficData, totalTraffic)}
                        />
                     ))}
                     <g className="fill-slate-800">
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="text-[0.5rem] font-bold">{totalTraffic > 0 ? 'Traffic' : '0'}</text>
                     </g>
                  </svg>
               </div>
               <div className="w-full space-y-3">
                  {trafficData.map((item, i) => {
                     const percent = totalTraffic > 0 ? Math.round((item.value / totalTraffic) * 100) : 0;
                     return (
                        <div key={i} className="flex justify-between items-center text-sm">
                           <div className="flex items-center space-x-2 space-x-reverse">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                              <span className="text-slate-600">{item.label}</span>
                           </div>
                           <span className="font-bold text-slate-800">{percent}%</span>
                        </div>
                     )
                  })}
               </div>
            </div>
         </div>

         {/* View Trend */}
         <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-800 mb-6">نمو المشاهدات (آخر 7 أيام)</h3>
             <div className="w-full h-64 relative">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                     <polyline points={polylinePoints} fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md" />
                     {trendData.map((d, i) => {
                         const x = (i / (trendData.length - 1)) * chartWidth;
                         const y = chartHeight - ((d.value / maxTrend) * (chartHeight - 40)) - 20;
                         return (
                            <g key={i} className="group cursor-pointer">
                               <circle cx={x} cy={y} r="6" className="fill-white stroke-blue-500 stroke-2 hover:r-8 transition-all" />
                               <text x={x} y={chartHeight + 20} textAnchor="middle" fontSize="12" fill="#64748b" className="mt-2">{d.label}</text>
                            </g>
                         );
                     })}
                  </svg>
             </div>
         </div>
      </div>

      {/* Deep Dive: Comments Analysis & Sentiment */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
             <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
             </div>
             <h3 className="text-xl font-bold text-slate-800">تحليل التعليقات وتفاعل الجمهور</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Column 1: Top Discussed */}
             <div>
                <h4 className="font-bold text-slate-600 mb-4">أكثر المقالات نقاشاً</h4>
                <div className="space-y-4">
                   {topCommented.slice(0, 4).map((post, i) => (
                      <div key={post.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex items-center space-x-3 space-x-reverse">
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${i===0?'bg-yellow-500':'bg-slate-400'}`}>#{i+1}</span>
                            <span className="text-sm font-medium text-slate-800 truncate max-w-[150px]">{post.title}</span>
                         </div>
                         <div className="flex items-center space-x-1 space-x-reverse text-purple-600">
                             <span className="font-bold">{countCommentsDeep(post.comments)}</span>
                             <span className="text-xs">تعليق</span>
                         </div>
                      </div>
                   ))}
                   {topCommented.length === 0 && <p className="text-slate-400">لا توجد بيانات كافية.</p>}
                </div>
             </div>
             
             {/* Column 2: Comment Length Nature */}
             <div>
                 <h4 className="font-bold text-slate-600 mb-4">طبيعة التعليقات (الطول)</h4>
                 <div className="space-y-6">
                     <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>تعليقات طويلة (نقاشات)</span>
                            <span className="font-bold">{totalComments > 0 ? Math.round((longComments/totalComments)*100) : 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${totalComments > 0 ? (longComments/totalComments)*100 : 0}%` }}></div>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>تعليقات قصيرة (ردود سريعة)</span>
                            <span className="font-bold">{totalComments > 0 ? Math.round((shortComments/totalComments)*100) : 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${totalComments > 0 ? (shortComments/totalComments)*100 : 0}%` }}></div>
                        </div>
                     </div>
                     
                     <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 mt-4">
                        <strong>ملاحظة:</strong> 
                        {totalComments < 5 
                            ? ' التفاعل منخفض حالياً.' 
                            : ' التعليقات الطويلة تدل على اهتمام عميق بالمحتوى.'}
                     </div>
                 </div>
             </div>

             {/* Column 3: Sentiment Analysis */}
             <div className="flex flex-col items-center">
                <h4 className="font-bold text-slate-600 mb-4 w-full text-right">تحليل المشاعر (Sentiment)</h4>
                <div className="relative w-40 h-40 mb-4">
                  <svg width="100%" height="100%" viewBox="0 0 40 40" className="transform -rotate-0">
                     <circle cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
                     {sentimentData.map((item, i) => (
                        <circle
                           key={i}
                           cx="20" cy="20" r="15.91549430918954" 
                           fill="transparent" stroke={item.color} strokeWidth="4"
                           strokeDasharray={calculateDashArray(item.value, totalComments)}
                           strokeDashoffset={calculateOffset(i, sentimentData, totalComments)}
                        />
                     ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-xs text-slate-400">الإجمالي</span>
                      <span className="text-xl font-bold text-slate-800">{totalComments}</span>
                  </div>
               </div>
               <div className="w-full space-y-2">
                  {sentimentData.map((item, i) => {
                      const percent = totalComments > 0 ? Math.round((item.value / totalComments) * 100) : 0;
                      return (
                        <div key={i} className="flex justify-between items-center text-xs">
                           <div className="flex items-center space-x-2 space-x-reverse">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                              <span className="text-slate-600">{item.label}</span>
                           </div>
                           <span className="font-bold">{percent}%</span>
                        </div>
                      );
                  })}
               </div>
             </div>
          </div>
      </div>

      {/* Stats Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">أداء الأقسام</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                        <tr>
                            <th className="p-3 rounded-r-lg">القسم</th>
                            <th className="p-3">المقالات</th>
                            <th className="p-3">المشاهدات</th>
                            <th className="p-3 rounded-l-lg">متوسط المشاهدات</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {categoryData.map((cat) => (
                            <tr key={cat.category} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                <td className="p-3 font-medium text-slate-800">{cat.category}</td>
                                <td className="p-3">{cat.count}</td>
                                <td className="p-3">{cat.views.toLocaleString()}</td>
                                <td className="p-3 text-blue-600 font-bold">{cat.avgViews.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
      </div>
    </div>
  );
};