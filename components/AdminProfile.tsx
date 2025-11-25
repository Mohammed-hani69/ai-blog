import React, { useState, useEffect } from 'react';
import { isBackendConfigured } from '../services/backendClient';
import { migrateLocalToBackend } from '../services/storage';
import { AdminProfile } from '../types';

interface AdminProfileProps {
  profile: AdminProfile;
  onSave: (newProfile: AdminProfile) => void;
}

export const AdminProfilePanel: React.FC<AdminProfileProps> = ({ profile, onSave }) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState(profile.password);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setPassword(profile.password);
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setMessage({ text: 'جميع الحقول مطلوبة', type: 'error' });
      return;
    }
    
    onSave({ ...profile, name, email, password });
    setMessage({ text: 'تم تحديث البيانات بنجاح', type: 'success' });
    
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">الملف الشخصي للمدير</h2>
        <p className="text-slate-500 mt-1">تعديل بيانات الدخول والمعلومات الشخصية للأدمن.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          {message && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
               <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl font-bold border-2 border-dashed border-slate-300">
                  {name ? name[0].toUpperCase() : 'A'}
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-800">صورة الملف الشخصي</h3>
                  <p className="text-xs text-slate-500 mb-3">يتم توليد الصورة تلقائياً بناءً على الاسم</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="اسم المدير"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني (اسم المستخدم)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left dir-ltr"
                  placeholder="admin@example.com"
                />
                <p className="text-xs text-slate-400 mt-1">يستخدم هذا البريد لتسجيل الدخول.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
                <input
                  type="text" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left dir-ltr font-mono"
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-400 mt-1">تأكد من اختيار كلمة مرور قوية.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center"
              >
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3 space-x-reverse">
         <svg className="w-6 h-6 text-yellow-600 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
         <div>
            <h4 className="font-bold text-yellow-800 text-sm">تنبيه أمني</h4>
            <p className="text-yellow-700 text-xs mt-1">
               تغيير البريد الإلكتروني أو كلمة المرور سيؤدي إلى تسجيل خروجك في الجلسة القادمة. يرجى حفظ البيانات الجديدة في مكان آمن.
            </p>
         </div>
      </div>
      {isBackendConfigured() && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start space-x-3 space-x-reverse">
          <div>
            <h4 className="font-bold text-emerald-800 mb-2">قاعدة بيانات مشتركة متاحة (Supabase)</h4>
            <p className="text-emerald-700 text-xs mb-3">يمكنك نقل المقالات المخزنة محلياً إلى Supabase لعرضها للعامة.</p>
              <button
              onClick={async () => {
                const res = await migrateLocalToBackend();
                if (res) {
                  setMessage({ text: `تم ترحيل ${res.migrated} مقالاً إلى Supabase.`, type: 'success' });
                } else {
                  setMessage({ text: 'فشل الترحيل أو Supabase غير مفعّل.', type: 'error' });
                }
                setTimeout(() => setMessage(null), 5000);
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700"
            >
              ترحيل المقالات المحلية
            </button>
          </div>
        </div>
      )}
    </div>
  );
};