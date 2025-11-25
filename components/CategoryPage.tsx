import React, { useEffect } from 'react';
import { BlogPost, AdSettings } from '../types';
import { AdDisplay } from './PublicBlog';
import { SEO } from './SEO';
import { Logo } from './Logo';

interface CategoryPageProps {
  category: string;
  posts: BlogPost[];
  adSettings: AdSettings;
  onNavigate: (path: string) => void;
  onViewPost: (post: BlogPost) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ category, posts, adSettings, onNavigate, onViewPost }) => {
  const categoryPosts = posts.filter(post => post.category === category);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);

  // Schema for Category/Collection Page
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category,
    "description": `أرشيف المقالات والتحليلات المتعلقة بـ ${category}`,
    "url": window.location.href,
    "mainEntity": {
        "@type": "ItemList",
        "itemListElement": categoryPosts.map((post, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${window.location.origin}/?post=${post.id}`, // Simulated Permalink
            "name": post.title
        }))
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900" dir="rtl">
      <SEO 
        title={`${category} - أحدث المقالات`}
        description={`تصفح جميع المقالات والأخبار والتحليلات المتعلقة بقسم ${category}. محتوى متجدد وشامل.`}
        keywords={[category, 'مدونة', 'مقالات', 'تحليلات']}
        schema={collectionSchema}
      />

      {/* Header */}
      <header className="border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-8 space-x-reverse">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
                <Logo className="w-10 h-10 rounded-lg" />
                <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900">
                  مزاد <span className="text-blue-600">بلس</span>
                </h1>
             </div>
          </div>
          <button 
             onClick={() => onNavigate('/')}
             className="text-slate-500 hover:text-blue-600 font-medium flex items-center space-x-2 space-x-reverse"
          >
             <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             <span>الرئيسية</span>
          </button>
        </div>
      </header>

      {/* Header Ad */}
      <div className="max-w-7xl mx-auto px-4">
         <AdDisplay zone={adSettings.header} className="my-6" />
      </div>

      {/* Category Hero */}
      <div className="bg-slate-900 text-white py-16">
         <div className="max-w-7xl mx-auto px-4 text-center">
             <p className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-3">تصنيف</p>
             <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">{category}</h2>
             <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                تصفح جميع المقالات والأخبار والتحليلات المتعلقة بقسم {category}.
             </p>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categoryPosts.length === 0 ? (
           <div className="text-center py-20 bg-slate-50 rounded-3xl">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">لا توجد مقالات</h3>
              <p className="text-slate-500">لم يتم نشر أي مقالات في قسم {category} حتى الآن.</p>
              <button onClick={() => onNavigate('/')} className="mt-6 text-blue-600 font-bold hover:underline">العودة للصفحة الرئيسية</button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryPosts.map(post => (
              <article key={post.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                 <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => onViewPost(post)}>
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                       {post.date}
                    </div>
                 </div>
                 <div className="p-6 flex-1 flex flex-col">
                    <h3 
                      className="text-xl font-bold text-slate-900 mb-3 leading-snug font-serif group-hover:text-blue-600 transition-colors cursor-pointer"
                      onClick={() => onViewPost(post)}
                    >
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                       <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-xs font-medium text-slate-500">{post.author}</span>
                       </div>
                       <button 
                          onClick={() => onViewPost(post)}
                          className="text-blue-600 text-sm font-bold hover:underline flex items-center"
                       >
                          قراءة
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                       </button>
                    </div>
                 </div>
              </article>
            ))}
          </div>
        )}
      </main>
      
      {/* Footer Ad */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <AdDisplay zone={adSettings.footer} />
      </div>
      
    </div>
  );
};