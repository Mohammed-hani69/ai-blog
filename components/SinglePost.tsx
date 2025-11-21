import React, { useEffect, useMemo } from 'react';
import { BlogPost, AdSettings } from '../types';
import { CommentsSection } from './CommentsSection';
import { AdDisplay } from './PublicBlog';

interface SinglePostProps {
  post: BlogPost;
  adSettings: AdSettings;
  onBack: () => void;
  onNavigateCategory: (category: string) => void;
  onAddComment: (author: string, content: string) => void;
  onReplyComment: (commentId: string, author: string, content: string) => void;
}

export const SinglePost: React.FC<SinglePostProps> = ({ post, adSettings, onBack, onNavigateCategory, onAddComment, onReplyComment }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Logic to inject ad into the middle of the content
  const contentWithAd = useMemo(() => {
    if (!adSettings.articleMiddle.enabled) return post.content;

    // Split by closing paragraph tag
    const paragraphs = post.content.split('</p>');
    if (paragraphs.length <= 2) return post.content; // Too short to split

    const middleIndex = Math.floor(paragraphs.length / 2);
    
    // Create the ad HTML string
    const adHtml = `
      </p>
      <div class="w-full flex justify-center items-center my-8 overflow-hidden">
        ${adSettings.articleMiddle.code || '<div class="w-full h-20 bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm">إعلان وسط المقال</div>'}
      </div>
      <p>`; // We need to re-open the paragraph tag for the next chunk if the split removed it conceptually, but actually split removes </p>, so we just need to close the previous one properly and open new context if needed, or just insert the div between blocks.
      
    // Actually, split removes the delimiter. So:
    // p1 </p> p2 </p> p3
    // becomes [p1, p2, p3]
    // We want: p1 </p> AD </p> p2 </p> p3 ( Wait, no)
    
    // Correct reconstruction:
    // We join them back with </p>. But at middleIndex, we insert </p> AD <p (if necessary)
    
    // Easier approach: Insert the ad component into the array, then join.
    // Since paragraphs content doesn't have the closing tag, we add it back during join.
    
    const adString = `
       <div class="w-full flex justify-center items-center my-8 overflow-hidden clear-both">
         ${adSettings.articleMiddle.code || '<div class="w-full h-24 bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm">إعلان وسط المقال</div>'}
       </div>
    `;

    // Insert after the middle paragraph
    paragraphs.splice(middleIndex, 0, adString);
    
    // Join back. Note that the split removed '</p>', so we must put it back between valid paragraphs.
    // However, our adString is a DIV, not a P.
    // The original string was: <p>text</p><p>text</p>
    // Split results: ["<p>text", "<p>text", ""] (if ends with empty)
    
    return paragraphs.join('</p>');

  }, [post.content, adSettings.articleMiddle]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900" dir="rtl">
      {/* Header */}
      <header className="border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            <span className="font-bold">العودة للمقالات</span>
          </button>
          
          <h1 className="text-xl font-serif font-bold tracking-tight">
            Omni<span className="text-blue-600">Blog</span>
          </h1>
        </div>
      </header>

      {/* Header Ad */}
      <div className="max-w-4xl mx-auto px-4">
         <AdDisplay zone={adSettings.header} className="my-6" />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
           <div className="flex flex-wrap items-center gap-2 mb-4">
              <button 
                 onClick={() => onNavigateCategory(post.category)}
                 className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-200 hover:bg-blue-200 transition-colors"
              >
                  {post.category}
              </button>
              {post.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 text-slate-500 text-xs bg-slate-100 rounded-md">
                      #{tag}
                  </span>
              ))}
           </div>
           <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight font-serif mb-6">
            {post.title}
           </h1>
           <div className="flex items-center space-x-4 space-x-reverse text-slate-500 text-sm border-b border-slate-100 pb-8">
              <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {post.author[0]}
                  </div>
                  <span className="font-semibold text-slate-900">{post.author}</span>
              </div>
              <span>•</span>
              <span>{post.date}</span>
              <span>•</span>
              <span className="flex items-center">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {post.views} مشاهدة
              </span>
           </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-2xl overflow-hidden shadow-lg mb-10 aspect-video animate-fade-in">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
        
        {/* Top Ad */}
        <AdDisplay zone={adSettings.articleTop} className="mb-8" />

        {/* Main Content */}
        <article className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl">
            <div dangerouslySetInnerHTML={{ __html: contentWithAd }} />
        </article>

        {/* Bottom Ad */}
        <AdDisplay zone={adSettings.articleBottom} className="mt-10" />

        {/* Bottom Actions */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center">
            <div className="flex space-x-4 space-x-reverse">
                <button className="flex items-center space-x-2 space-x-reverse text-slate-500 hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                    <span>أعجبني</span>
                </button>
            </div>
        </div>
        
        {/* Comments Section */}
        <CommentsSection 
            comments={post.comments} 
            onAddComment={onAddComment} 
            onReplyComment={onReplyComment}
        />
      </main>

      {/* Footer Ad */}
      <div className="max-w-4xl mx-auto px-4">
         <AdDisplay zone={adSettings.footer} />
      </div>

      <footer className="bg-slate-50 border-t border-slate-200 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} جميع الحقوق محفوظة لـ OmniBlog.
        </div>
      </footer>
    </div>
  );
};