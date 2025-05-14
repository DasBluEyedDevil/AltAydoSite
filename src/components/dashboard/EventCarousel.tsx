'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const images = [
  {
    src: '/images/Reclaimer_-_Near_world_lookings_at_wreckage.jpg',
    alt: 'AydoCorp Salvage Operation',
    caption: 'Reclaimer Salvage Operation in Progress'
  },
  {
    src: '/images/Star_Citizen_Ships_510048_2560x1440.jpg',
    alt: 'AydoCorp Fleet Display',
    caption: 'Corporate Fleet Showcase Event'
  },
  {
    src: '/images/Hull_E.jpg',
    alt: 'AydoExpress Cargo Transport',
    caption: 'Hull E Cargo Transport Mission'
  },
  {
    src: '/images/Prospector_-_Hovering_mining_on_cliffside_1.jpg',
    alt: 'Empyrion Mining Operation',
    caption: 'Prospector Mining Operation on Microtech'
  }
];

const EventCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
      
      <div className="relative h-[300px] w-full overflow-hidden">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentIndex ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative h-full w-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover rounded-sm"
                priority={index === 0}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="text-white">
                  <h3 className="font-quantify text-sm tracking-wide text-[rgba(var(--mg-primary),0.9)]">{image.alt}</h3>
                  <p className="text-xs text-[rgba(var(--mg-text),0.8)]">{image.caption}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Controls */}
      <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between px-2">
        <button 
          className="mg-btn-icon p-1 bg-black/30 hover:bg-black/50 rounded-full"
          onClick={prevSlide}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          className="mg-btn-icon p-1 bg-black/30 hover:bg-black/50 rounded-full"
          onClick={nextSlide}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex ? 'w-6 bg-[rgba(var(--mg-primary),0.9)]' : 'w-2 bg-white/30'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel; 