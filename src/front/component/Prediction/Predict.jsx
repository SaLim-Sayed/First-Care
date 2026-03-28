import Navbar from "../NavBar/Navbar";
import { Link } from "react-router-dom";
import Footer from "../Footer/Footer";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/react/button";

function Predict({ prediction }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-[var(--bg-color)] pt-20 pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header Action */}
        <div className="mb-8 flex justify-between items-center bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-color)] shadow-lg">
          <Link to={`/${i18n.language}/Prediction/`} className="no-underline">
            <Button 
              size="lg" 
              variant="flat"
              className="px-8 font-extrabold text-[#0076f7] bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all"
            >
              ← {t('predict.repredict')}
            </Button>
          </Link>
          <div className="text-[var(--text-muted)] font-bold hidden sm:block">
            {isAr ? 'نتائج الفحص الذكي' : 'Smart Diagnosis Results'}
          </div>
        </div>

        {/* Prediction Main Card */}
        <div className="bg-[var(--card-bg)] rounded-[2.5rem] p-8 lg:p-12 shadow-xl border border-[var(--border-color)] mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0091ff]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <span className="inline-block px-4 py-1 bg-blue-50 text-[#0076f7] rounded-full text-sm font-black mb-4 border border-blue-100 uppercase tracking-wider">
            {isAr ? 'التشخيص المقترح' : 'Suggested Diagnosis'}
          </span>
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 drop-shadow-sm">
            {isAr ? prediction.prediction_in_arabic : prediction.prediction}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0091ff] shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{isAr ? 'الدقة' : 'Accuracy'}</div>
                <div className="text-gray-900 font-black tracking-tight">AI Generated</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Precautions Section */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl">
            <h3 className="text-2xl font-black mb-6 text-emerald-500 flex items-center gap-3">
              <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
              {isAr ? 'الاحتياطات اللازمة' : 'Recommended Precautions'}
            </h3>
            <ul className="space-y-4">
              {[prediction.precaution_1, prediction.precaution_2, prediction.precaution_3, prediction.precaution_4].map((prev, idx) => {
                const text = isAr ? prediction?.[`precaution_${idx+1}_in_arabic`] : prediction?.[`precaution_${idx+1}`];
                if (!text || text === "NaN") return null;
                return (
                  <li key={idx} className="flex gap-4 items-start bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <div className="mt-1 w-6 h-6 shrink-0 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                      {idx + 1}
                    </div>
                    <span className="text-gray-700 font-bold leading-relaxed">{text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-8">
            {/* Warning Box */}
            <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-8 shadow-lg">
               <div className="flex items-center gap-3 mb-4 text-rose-500">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 <h3 className="text-xl font-black uppercase tracking-tight">{isAr ? 'تنبيه هام' : 'Important Notice'}</h3>
               </div>
               <p className="text-rose-900 font-bold leading-relaxed">
                 {isAr ? prediction.warning : prediction.warning}
               </p>
            </div>

            {/* Causes Card */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl">
              <h3 className="text-xl font-black mb-4 text-[#0076f7] flex items-center gap-2">
                {t('predict.causes')}
              </h3>
              <p className="text-gray-600 leading-relaxed font-bold capitalize">
                {isAr ? prediction.Causes_in_arabic : prediction.Causes}
              </p>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="mt-8 bg-white rounded-[2rem] p-8 lg:p-12 border border-blue-100 shadow-xl relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
             <span className="px-3 py-1 bg-[#0091ff] text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em]">{t('predict.overview')}</span>
          </h3>
          <p className="text-xl text-gray-600 leading-relaxed font-bold italic">
             "{isAr ? prediction.Overview_in_arabic : prediction.Overview}"
          </p>
          
          <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4">
             <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 w-full">
               <h4 className="text-amber-600 font-extrabold mb-2 flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {isAr ? 'عوامل الخطر' : 'Risk Factors'}
               </h4>
               <p className="text-amber-800/80 text-base font-bold capitalize">
                 {isAr ? prediction.Risk_Factors_in_arabic : prediction.Risk_Factors}
               </p>
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Predict;
