'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination as SwiperPagination, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';

export default function HeroBanner({ banners, isLoading }) {
  if (isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="rounded-xl overflow-hidden shadow-md"
    >
      <Swiper
        modules={[Autoplay, Navigation, SwiperPagination, EffectFade]}
        effect="fade"
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          el: '.swiper-pagination',
          clickable: true,
          dynamicBullets: true,
        }}
        loop={true}
        className="w-full h-64 md:h-80"
      >
        {banners.map((book, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={
                  book.image_url ||
                  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f'
                }
                alt={book.title}
                className="w-full h-full object-cover"
              />

              {/* overlay */}
              <div className="absolute inset-0 bg-black/45"></div>

              {/* content */}
              <div className="absolute inset-0 flex items-center">
                <div className="px-10 md:px-16 max-w-xl">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                    {book.title}
                  </h2>

                  <p className="text-white/90 text-lg mb-6 line-clamp-2">
                    {book.description ||
                      'Khám phá ngay cuốn sách nổi bật này'}
                  </p>

                  <Link href={`/products/${book.id}`}>
                    <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">
                      Xem Chi Tiết
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        <button className="swiper-button-prev !text-white !top-1/2 !-translate-y-1/2 !left-4 !w-10 !h-10 !after:!text-lg after:!font-bold hover:!bg-black/20 rounded-full transition"></button>
        <button className="swiper-button-next !text-white !top-1/2 !-translate-y-1/2 !right-4 !w-10 !h-10 !after:!text-lg after:!font-bold hover:!bg-black/20 rounded-full transition"></button>
        <div className="swiper-pagination !bottom-4 !w-auto !left-1/2 !-translate-x-1/2"></div>
      </Swiper>
    </motion.div>
  );
}
