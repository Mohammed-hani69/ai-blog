import React, { useState, useEffect } from 'react';
import { BlogPost, AdSettings, AdZone } from '../types';
import { SEO } from './SEO';
import { Logo } from './Logo';

interface PublicBlogProps {
  posts: BlogPost[];
  adSettings: AdSettings;
  onNavigate: (path: string) => void;
  onViewPost: (post: BlogPost) => void;
  onNavigateCategory: (category: string) => void;
}

export const AdDisplay: React.FC<{ zone: AdZone, className?: string }> = ({ zone, className }) => {
    if (!zone.enabled) return null;
    
    return (
        <div className={`w-full flex justify-center items-center overflow-hidden ${className || 'my-8'}`}>
            {zone.code ? (
                 <div dangerouslySetInnerHTML={{ __html: zone.code }} />
            ) : (
                 <div className="w-full py-4 bg-slate-50 border-y border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <span className="mb-1 uppercase tracking-widest font-bold opacity-50">إعلان</span>
                    <div className="w-full h-20 bg-slate-100 rounded-lg flex items-center justify-center max-w-2xl">
                        مساحة إعلانية متاحة
                    </div>
                 </div>
            )}
        </div>
    );
};

export const PublicBlog: React.FC<PublicBlogProps> = ({ posts, adSettings, onNavigate, onViewPost, onNavigateCategory }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const recentPosts = posts.length > 0 ? posts.slice(1) : [];
  const trendingPosts = [...posts].sort((a, b) => b.views - a.views).slice(0, 4);

  // WebSite Schema
  const siteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "مزاد بلس",
      "url": window.location.href,
      "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.href}?q={search_term_string}`,
          "query-input": "required name=search_term_string"
      }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900" dir="rtl">
      
      <SEO 
        title="الرئيسية - أحدث المقالات التقنية" 
        description="منصة تدوين ذكية تقدم أحدث المقالات في مجال التكنولوجيا، الذكاء الاصطناعي، الاقتصاد، والصحة."
        schema={siteSchema}
      />

      {/* Modern Sticky Header */}
      <header 
        className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${
            scrolled ? 'bg-white/80 backdrop-blur-md border-slate-200 shadow-sm h-16' : 'bg-white border-transparent h-20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center space-x-8 space-x-reverse">
            <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => onNavigate('/')}
            >
              <Logo className="w-10 h-10 rounded-lg" />
              <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight flex items-center gap-1">
                <span className="text-slate-900">مزاد</span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">بلس</span>
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-1 space-x-reverse text-sm font-bold text-slate-600">
              <button onClick={() => onNavigate('/')} className="px-4 py-2 rounded-full hover:bg-slate-50 hover:text-blue-600 transition-all">الرئيسية</button>
              {['التكنولوجيا', 'الذكاء الاصطناعي', 'الاقتصاد'].map(cat => (
                  <button key={cat} onClick={() => onNavigateCategory(cat)} className="px-4 py-2 rounded-full hover:bg-slate-50 hover:text-blue-600 transition-all">{cat}</button>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            {/* Login button removed as requested */}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className={scrolled ? 'h-16' : 'h-20'}></div>

      {/* Header Ad */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
         <AdDisplay zone={adSettings.header} className="mb-6" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Immersive Hero Section */}
        {featuredPost ? (
          <section className="mb-16 group cursor-pointer relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[500px] md:h-[600px]" onClick={() => onViewPost(featuredPost)}>
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img 
                    src={featuredPost.imageUrl} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90"></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 right-0 w-full p-8 md:p-16 flex flex-col justify-end h-full z-10">
                <div className="max-w-3xl animate-fade-in-up">
                    <div className="flex items-center space-x-3 space-x-reverse mb-4">
                        <span className="bg-blue-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md shadow-lg shadow-blue-900/50">
                            {featuredPost.category}
                        </span>
                        <span className="text-slate-300 text-sm font-medium flex items-center">
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {featuredPost.date}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-4 drop-shadow-sm">
                        {featuredPost.title}
                    </h2>
                    <p className="text-lg text-slate-200 line-clamp-2 leading-relaxed md:w-3/4">
                        {featuredPost.excerpt}
                    </p>
                    
                    <div className="mt-8 flex items-center space-x-4 space-x-reverse">
                        <div className="flex items-center -space-x-2 space-x-reverse">
                             <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-white flex items-center justify-center font-bold text-slate-900 text-xs z-10">
                                {featuredPost.author[0]}
                             </div>
                        </div>
                        <span className="text-white font-bold text-sm">{featuredPost.author}</span>
                    </div>
                </div>
            </div>
          </section>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-16 text-center mb-16 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">مرحباً بك في مزاد بلس</h2>
            <p className="text-slate-600">جاري إعداد المحتوى...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-12">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
               <h3 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
                   <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                   أحدث المقالات
               </h3>
               <div className="flex gap-2">
                  {['الكل', 'شائع'].map((filter, i) => (
                      <button key={i} className={`text-sm font-bold px-3 py-1 rounded-full transition-colors ${i===0 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                          {filter}
                      </button>
                  ))}
               </div>
            </div>

            <div className="grid gap-10">
                {recentPosts.map(post => (
                <article key={post.id} className="group flex flex-col md:flex-row gap-8 bg-white rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 border border-slate-100">
                    <div className="md:w-1/3 h-64 md:h-auto rounded-2xl overflow-hidden cursor-pointer relative">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onClick={() => onViewPost(post)} />
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm text-slate-900">
                            {post.category}
                        </span>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {post.date}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                {post.views}
                            </span>
                        </div>
                        <h3 
                            className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors font-serif cursor-pointer leading-tight"
                            onClick={() => onViewPost(post)}
                        >
                            {post.title}
                        </h3>
                        <p className="text-slate-500 line-clamp-3 mb-6 leading-relaxed text-base">
                            {post.excerpt}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center space-x-2 space-x-reverse text-sm font-bold text-slate-800">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-blue-600 border border-slate-200">{post.author[0]}</div>
                                <span>{post.author}</span>
                            </div>
                            <button onClick={() => onViewPost(post)} className="group/btn flex items-center text-blue-600 text-sm font-bold">
                                <span>اقرأ المزيد</span>
                                <svg className="w-4 h-4 mr-1 transform group-hover/btn:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                        </div>
                    </div>
                </article>
                ))}
            </div>
            
            {/* Load More Button */}
            <div className="text-center pt-8">
                <button className="bg-white border border-slate-200 text-slate-600 px-8 py-3 rounded-full font-bold hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm">
                    عرض المزيد من المقالات
                </button>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
                
                {/* Sidebar Ad */}
                <AdDisplay zone={adSettings.sidebar} className="mb-8" />

                {/* Trending Widget */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-6 text-lg font-serif flex items-center">
                        <svg className="w-5 h-5 ml-2 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 3.258 2.37 4.12z" clipRule="evenodd" /></svg>
                        الأكثر قراءة
                    </h4>
                    <div className="space-y-6">
                        {trendingPosts.map((post, idx) => (
                            <div key={post.id} className="flex gap-4 group cursor-pointer" onClick={() => onViewPost(post)}>
                                <span className="text-2xl font-black text-slate-200 group-hover:text-blue-200 transition-colors font-serif">0{idx + 1}</span>
                                <div>
                                    <h5 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                                        {post.title}
                                    </h5>
                                    <span className="text-xs text-slate-400">{post.views} مشاهدة</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Widget */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4 text-lg font-serif">استكشف التصنيفات</h4>
                    <div className="flex flex-wrap gap-2">
                        {['التكنولوجيا', 'الذكاء الاصطناعي', 'الاقتصاد', 'الصحة', 'عام'].map(cat => (
                            <button 
                            key={cat} 
                            onClick={() => onNavigateCategory(cat)}
                            className="px-4 py-2 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-xl text-sm font-medium transition-all border border-slate-100"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Newsletter Widget */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-[50px] opacity-20 -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500 rounded-full blur-[50px] opacity-20 -ml-10 -mb-10"></div>
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h4 className="font-bold text-xl mb-2 font-serif">النشرة الأسبوعية</h4>
                        <p className="text-sm text-slate-300 mb-6 leading-relaxed">انضم لأكثر من 5000 مشترك واحصل على ملخص أسبوعي لأهم التطورات.</p>
                        <div className="space-y-3">
                            <input type="email" placeholder="عنوان بريدك الإلكتروني" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 text-center" />
                            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/50">
                                اشتراك مجاني
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer Ad */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <AdDisplay zone={adSettings.footer} />
      </div>

      {/* Modern Dark Footer */}
      <footer className="bg-slate-900 text-white mt-16 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <Logo className="w-12 h-12 rounded-xl" />
                        <h2 className="text-2xl font-serif font-bold flex items-center gap-1">
                            <span>مزاد</span>
                            <span className="text-blue-500">بلس</span>
                        </h2>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        منصة تدوين ذكية تعتمد على أحدث تقنيات الذكاء الاصطناعي لتقديم محتوى غني ودقيق يواكب تطلعات القارئ العربي.
                    </p>
                    <div className="flex space-x-4 space-x-reverse">
                        {['twitter', 'facebook', 'linkedin', 'instagram'].map(social => (
                            <a key={social} href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                                <span className="sr-only">{social}</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.063 3.791 9.253 8.625 9.882V14.93H8.028v-2.93h2.597V9.782c0-2.474 1.474-3.832 3.655-3.832 1.045 0 2.152.186 2.152.186v2.368h-1.212c-1.226 0-1.609.761-1.609 1.542v1.855h2.668l-.427 2.93h-2.241v6.952C18.209 21.253 22 17.063 22 12c0-5.523-4.477-10-10-10z"/></svg>
                            </a>
                        ))}
                    </div>
                </div>
                
                <div className="md:col-span-1">
                    <h3 className="text-lg font-bold mb-6 text-white border-b border-slate-700 pb-2 inline-block">روابط سريعة</h3>
                    <ul className="space-y-3 text-sm text-slate-400">
                        {['الرئيسية', 'من نحن', 'سياسة الخصوصية', 'شروط الاستخدام', 'اتصل بنا'].map(link => (
                            <li key={link}><a href="#" className="hover:text-blue-400 transition-colors flex items-center"><span className="ml-2 text-slate-600">›</span> {link}</a></li>
                        ))}
                    </ul>
                </div>

                <div className="md:col-span-2">
                     <h3 className="text-lg font-bold mb-6 text-white border-b border-slate-700 pb-2 inline-block">الأكثر بحثاً</h3>
                     <div className="flex flex-wrap gap-2">
                        {['تكنولوجيا', 'ذكاء اصطناعي', 'سيارات', 'عقارات', 'عملات رقمية', 'تجارة إلكترونية', 'صحة', 'رياضة'].map(tag => (
                            <span key={tag} className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg text-xs hover:bg-slate-700 hover:text-white cursor-pointer transition-colors">
                                {tag}
                            </span>
                        ))}
                     </div>
                </div>
            </div>
            
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة لـ مزاد بلس.</p>
                <div className="flex space-x-6 space-x-reverse mt-4 md:mt-0">
                    <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
                    <a href="#" className="hover:text-white transition-colors">شروط الخدمة</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};