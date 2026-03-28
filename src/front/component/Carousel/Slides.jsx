import React from "react";
import { Link } from "react-router-dom";
import img1 from '../../images/Conversational.png';
import img2 from '../../images/Male_Doctor-512.png';
import img4 from '../../images/chatbot-health-care-.png';
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function Slides() {
  const { t, i18n } = useTranslation();

  const slidesData = [
    {
      title: t('slides.slide0.title'),
      text: t('slides.slide0.text'),
      linkText: t('slides.slide0.linkText'),
      linkTo: `/${i18n.language}/Prediction`,
      img: img1
    },
    {
      title: t('slides.slide1.title'),
      text: t('slides.slide1.text'),
      linkText: t('slides.slide1.linkText'),
      linkTo: `/${i18n.language}`,
      img: img2
    },
    {
      title: t('slides.slide2.title'),
      text: t('slides.slide2.text'),
      linkText: t('slides.slide2.linkText'),
      linkTo: `/${i18n.language}/FirstAid`,
      img: img4
    }
  ];

  return (
    <div className="bg-[var(--bg-color)] pt-10 flex items-center transition-colors duration-300" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 relative">
        <div className="w-full">
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            modules={[Autoplay, Navigation]}
            className="mySwiper"
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
            key={i18n.language}
          >
            {slidesData.map((slide, index) => (
              <SwiperSlide key={index}>
                <div className="px-4 py-12">
                  <div className="bg-[var(--card-bg)] rounded-[3rem] p-10 lg:p-16 shadow-xl border border-[var(--border-color)] flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0091ff]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    {/* Text Content */}
                    <div className={`flex-1 text-center lg:text-left ${i18n.language === 'ar' ? 'lg:text-right' : ''}`}>
                      <h2 className="text-4xl lg:text-6xl font-black text-[var(--text-main)] mb-6 leading-tight tracking-tighter">
                        {slide.title}
                      </h2>
                      <p className="text-lg lg:text-xl text-[var(--text-muted)] mb-10 leading-relaxed font-medium">
                        {slide.text}
                      </p>
                      <Link
                        to={slide.linkTo}
                        className="inline-block px-12 py-4 bg-gradient-to-r from-[#0076f7] to-[#00c6ff] text-white text-xl font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:scale-105 transition-all no-underline"
                      >
                        {slide.linkText}
                      </Link>
                    </div>

                    {/* Image */}
                    <div className="flex-1 w-full max-w-md transform hover:scale-105 transition-all duration-500">
                      <img
                        src={slide.img}
                        alt={slide.title}
                        className="w-full h-auto drop-shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
