import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBars, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import { Button } from "@heroui/react/button";
import { TbWorld } from "react-icons/tb";
import { useTheme } from "../../context/ThemeContext";

export default function _Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isAr = i18n.language === 'ar';

  const getPathForLang = (lng) => {
    const currentPath = location.pathname;
    // Replace "/en" or "/ar" at the start of the path
    if (currentPath.match(/^\/(en|ar)(\/|$)/)) {
      return currentPath.replace(/^\/(en|ar)/, `/${lng}`);
    }
    // Prefix if no language present
    return `/${lng}${currentPath === '/' ? '' : currentPath}`;
  };

  const isActive = (path) => {
    // Exact match for Home to prevent matching all base routes
    const isHome = path.endsWith('/en') || path.endsWith('/ar');
    if (isHome) {
      return location.pathname === path || location.pathname === `${path}/`;
    }
    return location.pathname.startsWith(path);
  };

  const getTabClass = (path) => {
    return `block py-3 lg:py-0 border-b border-gray-100 dark:border-slate-800 lg:border-none no-underline font-semibold transition-all ${isActive(path)
      ? 'text-[var(--text-active)] scale-105'
      : 'text-[var(--text-muted)] hover:text-[var(--text-active)]'
      }`;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[var(--nav-bg)] backdrop-blur-md shadow-sm border-b border-[var(--border-color)]" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center flex-wrap py-4">
          <Link to={`/${i18n.language}`} className="flex items-center no-underline">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-[#0076f7]">First</span>
              <span className="text-[var(--text-main)] ml-1">Care</span>
            </span>
          </Link>

          <div className="lg:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#0076f7] transition-all"
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--text-main)] hover:text-[#0fbdb4] focus:outline-none transition-colors">
              {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>

          <div className={`${isOpen ? 'flex' : 'hidden'} lg:flex lg:items-center w-full lg:w-auto flex-col lg:flex-row mt-2 lg:mt-0 pb-4 lg:pb-0`}>
            <div className={`flex flex-col lg:flex-row lg:gap-8 ${isAr ? 'lg:pl-8' : 'lg:pr-8'}`}>
              <Link className={getTabClass(`/${i18n.language}`)} to={`/${i18n.language}`}>{t('navbar.home')}</Link>
              <Link className={getTabClass(`/${i18n.language}/Prediction`)} to={`/${i18n.language}/Prediction`}>{t('navbar.diagnoses')}</Link>
              <Link className={getTabClass(`/${i18n.language}/FirstAid`)} to={`/${i18n.language}/FirstAid`}>{t('navbar.first_aid')}</Link>
              <Link className={getTabClass(`/${i18n.language}/Doctors`)} to={`/${i18n.language}/Doctors`}>{isAr ? 'أطبــاء' : 'Doctors'}</Link>
              <Link className={getTabClass(`/${i18n.language}/About`)} to={`/${i18n.language}/About`}>{t('navbar.contact_us')}</Link>
            </div>

            <div className={`flex mt-6 lg:mt-0 items-center justify-center lg:justify-start gap-4 ${isAr ? 'lg:mr-auto' : 'lg:ml-auto'}`}>
              <button
                onClick={toggleTheme}
                className="hidden lg:flex p-3 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#0076f7] hover:bg-blue-100 dark:hover:bg-slate-700 transition-all border border-blue-100 dark:border-slate-700"
              >
                {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
              </button>

              <div className="flex gap-2">
                <Link onClick={() => i18n.changeLanguage('en')} className="text-[#0076f7] font-bold no-underline flex ltr:hidden items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 transition-all" to={getPathForLang('en')}>
                  <TbWorld className="text-xl" /> <span className="text-sm">EN</span>
                </Link>
                <Link onClick={() => i18n.changeLanguage('ar')} className="text-[#0076f7] font-bold no-underline flex rtl:hidden items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 transition-all" to={getPathForLang('ar')}>
                  <TbWorld className="text-xl" /> <span className="text-sm">ع</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
