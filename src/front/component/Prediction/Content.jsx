import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/react/button";

function Content({
  keys,
  onHandleSubmit,
  onHandleCheckbox,
  predictionHandle,
  match,
  posts,
  isLoading,
  getIsChecked
}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  function generateId() {
    return (
      Math.random().toString(36).substring(2) +
      new Date().getTime().toString(36)
    );
  }
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-[var(--bg-color)] transition-all duration-300">
      {/* Search Header */}
      <div className="p-8 pb-4 bg-[var(--card-bg)] border-b border-[var(--border-color)] sticky top-0 z-20 shadow-sm transition-all">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-black text-[var(--text-main)] capitalize flex items-center gap-3">
             <span className="w-2 h-8 bg-[#0091ff] rounded-full"></span>
            {match.params.key}
          </h2>
          <Button 
            isLoading={isLoading}
            isDisabled={isLoading}
            className="px-10 h-14 bg-gradient-to-r from-[#0076f7] to-[#00c6ff] text-white text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 transition-all" 
            onClick={predictionHandle}
          >
            {isLoading ? (isAr ? "جاري المعالجة..." : "Processing...") : t('predict.predict_button')}
          </Button>
        </div>
      </div>

      {/* Symptoms Grid */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 pb-10">
          {keys[match.params.key].map((el, index) => {
            const isChecked = getIsChecked(el);
            return (
              <div 
                key={index + generateId()}
                className={`group relative p-6 rounded-[2rem] bg-[var(--card-bg)] border transition-all duration-400 cursor-pointer
                  ${isChecked 
                    ? 'border-[#0091ff] shadow-[0_20px_40px_rgba(0,145,255,0.15)] ring-1 ring-[#0091ff]/30' 
                    : 'border-[var(--border-color)] hover:border-[#0091ff]/50 hover:shadow-xl shadow-sm'}`}
                onClick={() => onHandleCheckbox({ value: el, checked: !isChecked })}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 shrink-0
                    ${isChecked ? 'bg-[#0091ff] border-[#0091ff] scale-110' : 'border-[var(--border-color)] bg-transparent opacity-50'}`}>
                    {isChecked && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-lg font-bold transition-colors ${isChecked ? 'text-[#0091ff]' : 'text-[var(--text-main)] opacity-80 group-hover:opacity-100'}`}>
                    {el}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Content;
