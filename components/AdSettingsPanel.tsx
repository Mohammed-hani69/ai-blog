import React from 'react';
import { AdSettings, AdZone } from '../types';

interface AdSettingsPanelProps {
  settings: AdSettings;
  onSave: (newSettings: AdSettings) => void;
}

export const AdSettingsPanel: React.FC<AdSettingsPanelProps> = ({ settings, onSave }) => {
  
  const handleZoneChange = (zoneKey: keyof AdSettings, field: keyof AdZone, value: any) => {
    const updatedSettings = {
      ...settings,
      [zoneKey]: {
        ...settings[zoneKey],
        [field]: value
      }
    };
    onSave(updatedSettings);
  };

  const handleAdsTxtChange = (content: string) => {
      onSave({
          ...settings,
          adsTxtContent: content
      });
  };

  const downloadAdsTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([settings.adsTxtContent || ""], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "ads.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderZoneInput = (key: keyof AdSettings, label: string, description: string) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
           <h3 className="font-bold text-lg text-slate-800">{label}</h3>
           <p className="text-xs text-slate-500">{description}</p>
        </div>
        {key !== 'adsTxtContent' && ( // Type guard logic simplified
             <label className="relative inline-flex items-center cursor-pointer">
             <input 
               type="checkbox" 
               className="sr-only peer"
               checked={(settings[key] as AdZone).enabled}
               onChange={(e) => handleZoneChange(key, 'enabled', e.target.checked)}
             />
             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
             <span className="mr-3 text-sm font-medium text-slate-700">{(settings[key] as AdZone).enabled ? 'مفعل' : 'معطل'}</span>
           </label>
        )}
      </div>
      
      <div className={`transition-opacity duration-300 ${(settings[key] as AdZone).enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <label className="block text-sm font-bold text-slate-700 mb-2">كود الإعلان (HTML/Script)</label>
        <textarea
          value={(settings[key] as AdZone).code}
          onChange={(e) => handleZoneChange(key, 'code', e.target.value)}
          placeholder="<!-- ضع كود AdSense أو HTML هنا -->"
          className="w-full h-32 px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs dir-ltr text-left"
          dir="ltr"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">إدارة الإعلانات (Monetization)</h2>
        <p className="text-slate-500 mt-1">تحكم في أماكن ظهور إعلانات Google AdSense أو أي إعلانات HTML مخصصة.</p>
      </div>

      {/* Ads.txt Manager */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
             <div>
                <h3 className="font-bold text-lg text-amber-900 flex items-center">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    ملف ads.txt
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                    هذا الملف ضروري جداً لقبول موقعك في AdSense ولحماية أرباحك.
                </p>
             </div>
             <button 
                onClick={downloadAdsTxt}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 flex items-center whitespace-nowrap"
             >
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                تحميل ملف ads.txt
             </button>
          </div>
          
          <label className="block text-xs font-bold text-amber-800 mb-2">محتوى الملف (انسخ البيانات من حساب أدسنس وألصقها هنا):</label>
          <textarea
            value={settings.adsTxtContent || ''}
            onChange={(e) => handleAdsTxtChange(e.target.value)}
            placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
            className="w-full h-32 px-4 py-3 rounded-lg bg-white border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm dir-ltr text-left text-slate-700"
            dir="ltr"
          />
          <div className="mt-3 text-xs text-amber-700">
             <strong>تعليمات:</strong> بعد حفظ البيانات هنا، اضغط على زر "تحميل ملف ads.txt" ثم قم برفع الملف الذي تم تحميله إلى المجلد الرئيسي (public_html أو root) لدى شركة الاستضافة الخاصة بك.
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {renderZoneInput('header', 'إعلان الهيدر (Header)', 'يظهر في أعلى جميع الصفحات أسفل القائمة الرئيسية.')}
         {renderZoneInput('footer', 'إعلان الفوتر (Footer)', 'يظهر في أسفل جميع الصفحات قبل حقوق النشر.')}
         {renderZoneInput('sidebar', 'الشريط الجانبي (Sidebar)', 'يظهر في القائمة الجانبية في الصفحة الرئيسية.')}
         {renderZoneInput('articleTop', 'أعلى المقال', 'يظهر مباشرة قبل محتوى المقال وتحت العنوان.')}
         {renderZoneInput('articleMiddle', 'وسط المقال (In-Article)', 'يظهر تلقائياً في منتصف نص المقال بين الفقرات.')}
         {renderZoneInput('articleBottom', 'أسفل المقال', 'يظهر بعد نهاية المحتوى وقبل التعليقات.')}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-sm text-blue-800 flex items-start space-x-3 space-x-reverse">
         <svg className="w-6 h-6 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         <p>
            <strong>ملاحظة هامة:</strong> عند استخدام Google AdSense، تأكد من أن حسابك مفعل وأنك قمت بإضافة ملف `ads.txt` إذا لزم الأمر. قد تستغرق الإعلانات بضع دقائق للظهور بعد التفعيل. بالنسبة لإعلان "وسط المقال"، سيقوم النظام تلقائياً بحساب عدد الفقرات وزرع الكود في المنتصف.
         </p>
      </div>
    </div>
  );
};