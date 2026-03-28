import React from "react";
import Footer from "../Footer/Footer";
import Navbar from "../NavBar/Navbar";
import { useTranslation } from "react-i18next";
import { Input } from "@heroui/react/input";
import { TextArea } from "@heroui/react/textarea";
import { Button } from "@heroui/react/button";
import { FaHome, FaPhoneAlt, FaFax, FaEnvelopeOpenText } from "react-icons/fa";

export default function About() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <section className="  py-20 bg-[var(--bg-color)] transition-colors duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-1/3">
            <div className={`content_left p-10 bg-[var(--card-bg)] rounded-[2.5rem] shadow-xl border border-[var(--border-color)] transition-all ${isAr ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-2xl">
                  <FaHome className="text-3xl text-[#0091ff]" />
                </div>
                <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">
                  {t('about.contact_info_title')}
                </h3>
              </div>
              <ul className="space-y-8 text-xl text-[var(--text-main)]">
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#0091ff]">
                    <FaPhoneAlt size={18} />
                  </div>
                  <span className="font-medium text-lg"><strong className="opacity-50">{t('about.phone')} :</strong> 08684254254</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#0091ff]">
                    <FaFax size={18} />
                  </div>
                  <span className="font-medium text-lg"><strong className="opacity-50">{t('about.fax')} :</strong> (+20)000222988</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#0091ff] mt-1">
                    <FaEnvelopeOpenText size={18} />
                  </div>
                  <span className="break-all font-medium text-lg leading-relaxed"><strong className="opacity-50">{t('about.email')} :</strong> contact@firstcare.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full lg:w-2/3 pb-5">
            <div className={`content_right p-8 lg:p-12 bg-[var(--card-bg)] rounded-[3rem] shadow-2xl border border-[var(--border-color)] transition-all ${isAr ? 'text-right' : 'text-left'}`}>
              <h3 className="text-4xl font-black mb-3 text-[#0076f7] tracking-tight">{t('about.contact_title')}</h3>
              <h4 className="text-2xl font-bold mb-4 text-[var(--text-main)]">{t('about.send_message_title')}</h4>
              <p className="text-[var(--text-muted)] mb-10 text-lg font-medium leading-relaxed">
                {t('about.send_message_desc')}
              </p>

              <form className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full space-y-2">
                    <label className="text-sm font-bold text-[var(--text-muted)] ml-2">{t('about.first_name')}</label>
                    <Input
                      isRequired
                      placeholder={t('about.first_name')}
                      variant="bordered"
                      className="w-full"
                      size="lg"
                      classNames={{
                        inputWrapper: "h-14 rounded-2xl bg-[var(--bg-color)] border-[var(--border-color)] hover:border-[#0091ff] transition-all",
                        input: "text-lg text-[var(--text-main)]"
                      }}
                    />
                  </div>
                  <div className="w-full space-y-2">
                    <label className="text-sm font-bold text-[var(--text-muted)] ml-2">{t('about.last_name')}</label>
                    <Input
                      isRequired
                      placeholder={t('about.last_name')}
                      variant="bordered"
                      className="w-full"
                      size="lg"
                      classNames={{
                        inputWrapper: "h-14 rounded-2xl bg-[var(--bg-color)] border-[var(--border-color)] hover:border-[#0091ff] transition-all",
                        input: "text-lg text-[var(--text-main)]"
                      }}
                    />
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <label className="text-sm font-bold text-[var(--text-muted)] ml-2">{t('about.email_name')}</label>
                  <Input
                    isRequired
                    type="email"
                    placeholder="john@example.com"
                    variant="bordered"
                    className="w-full"
                    size="lg"
                    classNames={{
                      inputWrapper: "h-14 rounded-2xl bg-[var(--bg-color)] border-[var(--border-color)] hover:border-[#0091ff] transition-all",
                      input: "text-lg text-[var(--text-main)]"
                    }}
                  />
                </div>

                <div className="w-full space-y-2">
                  <label className="text-sm font-bold text-[var(--text-muted)] ml-2">{t('about.message')}</label>
                  <TextArea
                    isRequired
                    placeholder="Describe how we can help..."
                    variant="bordered"
                    className="w-full"
                    minRows={5}
                    size="lg"
                    classNames={{
                      inputWrapper: "rounded-3xl bg-[var(--bg-color)] border-[var(--border-color)] hover:border-[#0091ff] transition-all p-4",
                      input: "text-lg text-[var(--text-main)]"
                    }}
                  />
                </div>

                <Button
                  color="primary"
                  size="lg"
                  type="submit"
                  className="w-full md:w-auto font-black px-14 h-16 text-xl bg-gradient-to-r from-[#0076f7] to-[#00c6ff] text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 transition-all rounded-2xl"
                >
                  {t('about.submit')}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </section>
  );
}
