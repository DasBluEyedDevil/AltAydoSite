'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const images = [
  {
    src: '/images/RSI_AYDO_Corp_image.png',
    alt: 'AydoCorp Official Fleet',
    caption: 'AydoCorp Fleet Formation - Annual Corporate Showcase'
  },
  {
    src: '/images/Hull_E.jpg',
    alt: 'AydoExpress Logistics',
    caption: 'Hull-E Cargo Transport - Backbone of AydoExpress Operations'
  },
  {
    src: '/images/Prospector_-_Hovering_mining_on_cliffside_1.jpg',
    alt: 'Empyrion Industries Mining',
    caption: 'Empyrion Industries Prospector Mining Operations on Microtech'
  },
  {
    src: '/images/Reclaimer_-_Near_world_lookings_at_wreckage.jpg',
    alt: 'Salvage Operations',
    caption: 'Reclaimer Salvage Operation - Resource Recovery Division'
  },
  {
    src: '/images/logisticsoffice.jpg',
    alt: 'AydoCorp Logistics Office',
    caption: 'Corporate Headquarters - Logistics Command Center'
  },
  {
    src: '/images/Star_Citizen_Ships_510048_2560x1440.jpg',
    alt: 'Corporate Fleet Display',
    caption: 'AydoCorp Fleet Showcase - Annual Corporate Event'
  },
  {
    src: '/images/MISCFreelancer_Asteroids_122018-Min.png',
    alt: 'Freelancer Operations',
    caption: 'MISC Freelancer on Assignment - Asteroid Field Navigation'
  },
  {
    src: '/images/1_Taurus_CargoCapacity_ProposedFinal-Min.jpg',
    alt: 'Constellation Taurus',
    caption: 'Constellation Taurus - Medium Cargo Transport Operations'
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
      {/* The mg-panel already provides a top border effect via ::before, so the div below might be redundant or could be enhanced */}
      {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div> */}
      <div className="flex items-center mb-3"> {/* Increased mb slightly */}
        <div className="h-4 w-4 relative mr-2 opacity-80"> {/* Adjusted icon size and opacity */}
          <Image 
            src="/images/Aydo_Corp_logo_Silver.png" 
            alt="AydoCorp Logo" 
            fill 
            className="object-contain"
          />
        </div>
        <h2 className="mg-title text-xs uppercase tracking-wider">Corporate Showcase</h2> {/* Adjusted title */}
      </div>
      
      <div className="relative h-[350px] w-full overflow-hidden rounded-sm border border-[rgba(var(--mg-primary),0.1)]"> {/* Added subtle border to image area */}
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentIndex ? 1 : 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }} // Smoother transition
          >
            <div className="relative h-full w-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover" // Removed rounded-sm as parent has it
                priority={index === 0}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(var(--mg-panel-dark),0.9)] via-[rgba(var(--mg-panel-dark),0.5)] to-transparent p-4 pt-6">
                <div>
                  <h3 className="mg-subtitle text-sm tracking-wide">{image.alt}</h3>
                  <p className="mg-text text-xs opacity-80 mt-0.5">{image.caption}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Controls - Placed outside image area for better visibility if needed, or adjust styling */}
      <div className="absolute top-1/2 left-2 right-2 transform -translate-y-1/2 flex justify-between z-20">
        <button 
          className="mg-button rounded-full w-8 h-8 p-0 flex items-center justify-center hover:shadow-[0_0_8px_rgba(var(--mg-glow),0.5)]" // Made it smaller and round
          onClick={prevSlide}
          aria-label="Previous Slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          className="mg-button rounded-full w-8 h-8 p-0 flex items-center justify-center hover:shadow-[0_0_8px_rgba(var(--mg-glow),0.5)]" // Made it smaller and round
          onClick={nextSlide}
          aria-label="Next Slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-1.5 z-10"> {/* Adjusted spacing */}
        {images.map((_, index) => (
          <button
            key={index}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
              index === currentIndex ? 'w-5 bg-[rgba(var(--mg-accent),0.9)] shadow-[0_0_3px_rgba(var(--mg-accent),0.7)]' : 'w-2 bg-[rgba(var(--mg-text),0.4)] hover:bg-[rgba(var(--mg-text),0.6)]'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel; 