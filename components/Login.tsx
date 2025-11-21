import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('admin@omniblog.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      onLogin();
    } else {
      setError('بيانات الدخول غير صحيحة (جرب admin/admin)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      <div className="mb-8 text-center cursor-pointer" onClick={onBack}>
        <h1 className="text-4xl font-serif font-bold tracking-wider text-slate-900">Omni<span className="text-blue-600">Blog</span></h1>
        <p className="text-sm text-slate-500 mt-2">نظام الإدارة الذكي</p>
      </div>
      
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">تسجيل الدخول</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-left dir-ltr"
              placeholder="name@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-left dir-ltr"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 ml-2" />
              تذكرني
            </label>
            <a href="#" className="text-blue-600 hover:underline">نسيت كلمة المرور؟</a>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
          >
            دخول للوحة التحكم
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
             &larr; العودة للمدونة
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs">
        محمي بواسطة Gemini AI Security
      </p>
    </div>
  );
};