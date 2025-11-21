import React, { useState } from 'react';

interface ManualEditorProps {
  onPublish: (title: string, content: string, category: string) => void;
}

export const ManualEditor: React.FC<ManualEditorProps> = ({ onPublish }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('عام');
  const [content, setContent] = useState('<p>اكتب محتوى المقال هنا...</p>\n\n<h2>عنوان فرعي</h2>\n<p>تفاصيل إضافية...</p>');
  const [isPreview, setIsPreview] = useState(false);

  const categories = ['التكنولوجيا', 'الذكاء الاصطناعي', 'الاقتصاد', 'الصحة', 'نمط الحياة', 'عام'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[calc(100vh-140px)] flex flex-col animate-fade-in">
       {/* Toolbar */}
       <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex space-x-2 space-x-reverse bg-slate-200 p-1 rounded-lg">
             <button
                onClick={() => setIsPreview(false)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${!isPreview ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                تحرير (Code)
             </button>
             <button
                onClick={() => setIsPreview(true)}
                 className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${isPreview ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                معاينة (Live)
             </button>
          </div>
          <button
             onClick={() => onPublish(title, content, category)}
             className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse shadow-lg shadow-green-900/20"
          >
             <span>نشر المقال</span>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          </button>
       </div>

       {/* Editor / Preview Area */}
       <div className="flex-1 bg-slate-50 overflow-y-auto">
          {!isPreview ? (
             <div className="max-w-5xl mx-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">عنوان المقال</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 text-lg font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-300 transition-all"
                        placeholder="أدخل عنواناً جذاباً..."
                    />
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">التصنيف</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3.5 text-base font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
                   <div className="flex justify-between items-center mb-2">
                     <label className="block text-sm font-bold text-slate-700">المحتوى (HTML)</label>
                     <span className="text-xs font-mono text-slate-400 dir-ltr">&lt;html&gt; mode</span>
                   </div>
                   <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="flex-1 w-full font-mono text-sm px-4 py-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-900 text-green-400 selection:bg-green-900"
                      placeholder="<p>ابدأ الكتابة هنا...</p>"
                      dir="ltr"
                   />
                </div>
                
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start space-x-3 space-x-reverse">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p>نصيحة: يمكنك استخدام وسوم HTML القياسية لتنسيق المحتوى يدوياً لضمان الدقة في العرض.</p>
                </div>
             </div>
          ) : (
             <div className="max-w-4xl mx-auto my-8 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden min-h-[600px]">
                {/* Browser Header Mockup */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center space-x-2 space-x-reverse">
                    <div className="flex space-x-1.5 space-x-reverse">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 bg-white h-6 rounded text-center text-xs text-slate-400 leading-6 mx-4 truncate">
                        {title ? `https://omniblog.com/posts/${title.substring(0,10)}...` : 'https://omniblog.com/new-post'}
                    </div>
                </div>
                
                {/* Content Render */}
                <div className="p-12">
                   <article className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-blue-600">
                      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight font-serif">{title || "عنوان المقال (مسودة)"}</h1>
                      <div className="flex items-center space-x-2 space-x-reverse mb-8">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{category}</span>
                      </div>
                      <div className="border-b border-slate-100 pb-8 mb-8 flex items-center space-x-3 space-x-reverse text-sm text-slate-500">
                           <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                           <span>بواسطة: المحرر اليدوي</span>
                           <span>•</span>
                           <span>{new Date().toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                   </article>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};