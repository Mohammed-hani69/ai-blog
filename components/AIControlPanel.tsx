
import React from 'react';
import { AISettings, AIState } from '../types';
import { AIStatusTerminal } from './AIStatusTerminal';

interface AIControlPanelProps {
  settings: AISettings;
  onSettingsChange: (settings: AISettings) => void;
  onStartAI: () => void;
  onSaveAndStart: () => void;
  aiState: AIState;
  logs: any[];
  progress?: { current: number; total: number };
}

export const AIControlPanel: React.FC<AIControlPanelProps> = ({
  settings,
  onSettingsChange,
  onSaveAndStart,
  aiState,
  logs,
  progress
}) => {
  const handleChange = (field: keyof AISettings, value: any) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  const isRunning = aiState !== AIState.IDLE && aiState !== AIState.COMPLETE && aiState !== AIState.ERROR;
  const isWaiting = aiState === AIState.WAITING;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">الطيار الآلي (AI Autopilot)</h2>
           <p className="text-slate-500 mt-1">قم بإعداد الوكيل الذكي لجدولة ونشر المحتوى تلقائياً على مدار اليوم.</p>
        </div>
        <div className="flex items-center gap-4">
          {isRunning && progress && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm border border-blue-100">
                  جاري معالجة المقال {progress.current} من {progress.total}
              </div>
          )}
          <button
            onClick={onSaveAndStart}
            disabled={isRunning}
            className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center space-x-2 space-x-reverse ${
              isRunning 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-900/30 hover:-translate-y-1'
            }`}
          >
            {isRunning ? (
              <>
                {isWaiting ? (
                   <svg className="w-5 h-5 ml-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                   <svg className="animate-spin h-5 w-5 text-white ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                )}
                 <span>{isWaiting ? 'انتظار الموعد...' : 'جاري العمل...'}</span>
              </>
            ) : (
              <>
                 <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                 <span>حفظ الإعدادات وبدء التشغيل</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
           <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center">
                 <svg className="w-5 h-5 ml-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 إعدادات التوليد
              </h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                 <label className="block text-sm font-bold text-slate-700 mb-2">المجال (Niche)</label>
                 <input 
                    type="text" 
                    value={settings.niche}
                    onChange={(e) => handleChange('niche', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="مثال: الذكاء الاصطناعي، الطبخ، الرياضة..."
                 />
                 <p className="text-xs text-slate-400 mt-1">سيتمحور محتوى المدونة بالكامل حول هذا المجال.</p>
              </div>

              <div className="col-span-2">
                 <label className="block text-sm font-bold text-slate-700 mb-2">الكلمات المفتاحية المستهدفة</label>
                 <textarea 
                    value={settings.keywords}
                    onChange={(e) => handleChange('keywords', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                    placeholder="مثال: تعلم الآلة، الروبوتات، مستقبل العمل..."
                 />
              </div>

              <div className="col-span-2">
                 <label className="block text-sm font-bold text-slate-700 mb-2">تعليمات نمط الصور (Image Instructions)</label>
                 <textarea 
                    value={settings.imageStyle}
                    onChange={(e) => handleChange('imageStyle', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                    placeholder="مثال: صورة واقعية بجودة سينمائية 4K، إضاءة درامية، ألوان زاهية..."
                 />
                 <p className="text-xs text-slate-400 mt-1">سيقوم الذكاء الاصطناعي باتباع هذا النمط عند توليد الصور لكل مقال.</p>
              </div>
              
              <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">عدد المقالات في اليوم</label>
                    <span className="text-xl font-bold text-blue-600 bg-white px-3 py-1 rounded shadow-sm border border-blue-100">{settings.articlesPerDay}</span>
                 </div>
                 <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={settings.articlesPerDay}
                    onChange={(e) => handleChange('articlesPerDay', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
                 <div className="flex justify-between text-xs text-slate-400 mt-2">
                     <span>1 مقال</span>
                     <span>5 مقالات</span>
                     <span>10 مقالات</span>
                 </div>
                 <p className="text-xs text-slate-500 mt-3">
                     سيقوم النظام بتوزيع هذه المقالات على مدار 24 ساعة (مثلاً: مقال كل {(24 / settings.articlesPerDay).toFixed(1)} ساعة).
                 </p>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">لغة المحتوى</label>
                 <select 
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                    <option value="Arabic">العربية</option>
                    <option value="English">English</option>
                 </select>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">جودة الصور (Gemini Pro)</label>
                 <select 
                    value={settings.imageQuality}
                    onChange={(e) => handleChange('imageQuality', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                    <option value="1K">1K Standard</option>
                    <option value="2K">2K High Def</option>
                    <option value="4K">4K Ultra HD</option>
                 </select>
              </div>
              
              <div className="col-span-2 border-t border-slate-100 pt-4 flex items-center justify-between">
                 <div>
                    <label className="font-bold text-slate-700 block">النشر التلقائي</label>
                    <p className="text-xs text-slate-400">نشر المقال مباشرة بعد التوليد دون مراجعة.</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.autoPublish}
                      onChange={(e) => handleChange('autoPublish', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                 </label>
              </div>
           </div>
        </div>

        {/* Status Terminal */}
        <div className="lg:col-span-1">
           <div className="sticky top-24">
              <h3 className="font-bold text-lg text-slate-800 mb-4">سجل العمليات</h3>
              <AIStatusTerminal logs={logs} currentState={aiState} />
              
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-xs text-blue-800 leading-relaxed">
                 <strong>ملاحظة:</strong> سيتم جدولة المقالات وتوزيعها زمنياً لضمان نشر مستمر.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
