import React from "react";
import { Route, NavLink, Switch, useLocation } from "react-router-dom";
import Navbar from "../NavBar/Navbar";
import Footer from "../Footer/Footer";
import Content from "./Content";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/react/button";

function List({
  keys,
  onHandleCheckbox,
  onHandleSubmit,
  predictionHandle,
  prediction,
  isLoading,
  posts,
  getIsChecked,
  match
}) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isAr = i18n.language === 'ar';

  function generateId() {
    return (
      Math.random().toString(36).substring(2) +
      new Date().getTime().toString(36)
    );
  }
  return (
    <div className="min-h-screen bg-[var(--bg-color)] pt-20 pb-10 transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 h-full">
        <div className="flex flex-col lg:flex-row gap-8 h-full">

          {/* Sidebar: Body Parts */}
          <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0 h-fit lg:sticky lg:top-28 z-30">
            <div className="w-full h-full bg-[var(--card-bg)] rounded-3xl p-5 lg:p-6 shadow-xl border border-[var(--border-color)] flex flex-col transition-all duration-300">
              <div className="mb-4 lg:mb-6 flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-black text-[var(--text-main)] flex items-center gap-2 lg:gap-3">
                  <span className="w-1.5 h-6 bg-[#0091ff] rounded-full"></span>
                  {t('predict.body_parts')}
                </h2>
              </div>
              <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-4 lg:pb-0 pr-2 custom-scrollbar snap-x lg:snap-none">
                {Object.keys(keys).map((el) => {
                  const isActive = location.pathname.includes(encodeURIComponent(el));
                  return (
                    <NavLink
                      key={el}
                      className="no-underline transition-all group shrink-0 lg:shrink snap-start"
                      to={`${match.url}/${el}`}
                    >
                      <Button
                        className={`justify-center lg:justify-start text-sm lg:text-base font-bold px-5 py-3 lg:p-4 w-auto lg:w-full rounded-2xl border transition-all h-auto
                          ${isActive
                            ? 'bg-[#0091ff] text-white border-[#0091ff] shadow-lg shadow-blue-500/20'
                            : 'bg-transparent text-[var(--text-muted)] border-[var(--border-color)] hover:border-[#0091ff] hover:text-[#0091ff] hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                          }`}
                      >
                        <span className="whitespace-nowrap">{el}</span>
                      </Button>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content: Symptoms Grid */}
          <main className="flex-grow">
            <Switch>
              <Route
                path={`${match.path}/:key`}
                render={(props) => (
                  <Content
                    keys={keys}
                    onHandleCheckbox={onHandleCheckbox}
                    onHandleSubmit={onHandleSubmit}
                    predictionHandle={predictionHandle}
                    prediction={prediction}
                    isLoading={isLoading}
                    posts={posts}
                    getIsChecked={getIsChecked}
                    {...props}
                  />
                )}
              />
              {/* Default Message if no category selected */}
              <Route exact path={match.path}>
                <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-[var(--card-bg)] rounded-3xl border border-dashed border-[var(--border-color)] p-10 transition-all">
                  <div className="w-24 h-24 bg-[var(--bg-color)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-color)]">
                    <svg className="w-12 h-12 text-[#0091ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl text-[var(--text-main)] font-bold mb-2">
                    {isAr ? 'برجاء اختيار عضو من القائمة' : 'Please select a body part from the sidebar'}
                  </h3>
                  <p className="text-[var(--text-muted)]">
                    {isAr ? 'اختر العضو الذي تشعر فيه بالأعراض للبدء في التشخيص' : 'Select where you feel symptoms to begin your diagnosis.'}
                  </p>
                </div>
              </Route>
            </Switch>
          </main>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default List;
