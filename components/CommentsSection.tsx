import React, { useState } from 'react';
import { Comment } from '../types';

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (author: string, content: string) => void;
  onReplyComment: (commentId: string, author: string, content: string) => void;
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyAuthor: string;
  setReplyAuthor: (val: string) => void;
  replyContent: string;
  setReplyContent: (val: string) => void;
  onReplySubmit: (e: React.FormEvent, parentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth = 0,
  replyingTo,
  setReplyingTo,
  replyAuthor,
  setReplyAuthor,
  replyContent,
  setReplyContent,
  onReplySubmit
}) => {
  return (
    <div className={`animate-fade-in ${depth > 0 ? 'mr-8 md:mr-12 mt-4 border-r-2 border-slate-100 pr-4' : ''}`}>
      <div className="flex items-start space-x-4 space-x-reverse group">
        <div className={`flex-shrink-0 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-sm border border-white 
          ${depth === 0 ? 'w-12 h-12 text-xl from-blue-500 to-indigo-600' : 'w-10 h-10 text-sm from-slate-400 to-slate-500'}`}>
          {comment.author[0]}
        </div>
        <div className="flex-1">
          <div className="bg-white p-5 rounded-2xl rounded-tr-none shadow-sm border border-slate-100 relative group-hover:shadow-md transition-all">
             {/* Tail for speech bubble effect */}
             <div className="absolute top-0 -right-2 w-4 h-4 bg-white border-t border-l border-slate-100 transform rotate-45"></div>
             
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-bold text-slate-900 text-base">{comment.author}</h5>
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{comment.date}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">{comment.content}</p>
          </div>
          
          <div className="flex items-center mt-2 space-x-4 space-x-reverse px-2">
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors flex items-center"
              >
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                {replyingTo === comment.id ? 'إلغاء الرد' : 'رد'}
              </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => onReplySubmit(e, comment.id)} className="mt-4 bg-slate-100 p-4 rounded-xl animate-fade-in">
               <h6 className="text-xs font-bold text-slate-500 mb-2">الرد على {comment.author}:</h6>
               <div className="flex gap-3 flex-col md:flex-row">
                 <input 
                    type="text" 
                    placeholder="اسمك"
                    className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none w-full md:w-1/3"
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    required
                 />
                 <input 
                    type="text" 
                    placeholder="اكتب ردك..."
                    className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none flex-1"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required
                 />
                 <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">إرسال</button>
               </div>
            </form>
          )}
        </div>
      </div>

      {/* Recursive Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4 mt-4">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              depth={depth + 1}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyAuthor={replyAuthor}
              setReplyAuthor={setReplyAuthor}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentsSection: React.FC<CommentsSectionProps> = ({ comments, onAddComment, onReplyComment }) => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // ID of comment being replied to

  // State for reply form
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (author.trim() && content.trim()) {
      onAddComment(author, content);
      setAuthor('');
      setContent('');
    }
  };

  const handleReplySubmit = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (replyAuthor.trim() && replyContent.trim()) {
      onReplyComment(parentId, replyAuthor, replyContent);
      setReplyingTo(null);
      setReplyAuthor('');
      setReplyContent('');
    }
  };

  return (
    <div className="bg-slate-50 rounded-3xl p-6 md:p-10 mt-12 border border-slate-100">
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
         <div className="flex items-center space-x-3 space-x-reverse">
            <h3 className="text-2xl font-bold text-slate-900 font-serif">المناقشات</h3>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}
            </span>
         </div>
      </div>
      
      {/* Main Comment Form */}
      <div className="flex gap-4 mb-12">
        <div className="hidden md:flex w-12 h-12 rounded-full bg-white border-2 border-slate-200 shadow-sm items-center justify-center text-slate-400">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">شارك برأيك في المقال</h4>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none transition-colors placeholder-slate-400 text-sm"
                placeholder="الاسم الكريم..."
                required
              />
            </div>
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none h-24 resize-none transition-colors placeholder-slate-400 text-sm"
                placeholder="ما رأيك في هذا الموضوع؟"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg hover:shadow-blue-900/30 flex items-center text-sm"
            >
              <span>نشر التعليق</span>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-8">
        {comments.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             </div>
             <p className="text-slate-500 font-medium">لا توجد تعليقات حتى الآن.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyAuthor={replyAuthor}
              setReplyAuthor={setReplyAuthor}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onReplySubmit={handleReplySubmit}
            />
          ))
        )}
      </div>
    </div>
  );
};