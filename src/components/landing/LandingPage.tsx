"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import AboutSection from './AboutSection';
import JoinUsSection from './JoinUsSection';

interface LandingPageProps {
  isLoggedIn: boolean;
}

export default function LandingPage({ isLoggedIn }: LandingPageProps) {
  const [activePage, setActivePage] = useState('hero');
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
      
      // Update active section based on scroll position
      const sections = ['join', 'about', 'services', 'hero'];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the section is in view (with some offset to favor the one mostly in view)
          if (rect.top <= 200) {
            setActivePage(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax effect based on scroll position
  const parallaxOffset = (depth: number) => {
    return scrollPosition * depth;
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-b from-[rgba(0,20,40,0.9)] to-[rgba(0,10,20,0.95)] z-0"></div>
      <div className="fixed inset-0 hexagon-bg opacity-10 pointer-events-none z-0"></div>
      <div className="fixed inset-0 mg-grid-bg z-0"></div>
      
      {/* Space background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <Image
          src="/images/spacebg.jpg"
          alt="Space Background"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      
      {/* Parallax Stars - these move slower than the scroll */}
      <motion.div 
        className="fixed inset-0 z-1 opacity-80 pointer-events-none"
        style={{ y: parallaxOffset(-0.2) }}
      >
        <div className="absolute w-2 h-2 bg-white rounded-full top-[10%] left-[5%] opacity-30"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[15%] left-[25%] opacity-40"></div>
        <div className="absolute w-3 h-3 bg-[rgba(var(--mg-primary),1)] rounded-full top-[25%] left-[80%] opacity-20"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-[40%] left-[60%] opacity-30"></div>
        <div className="absolute w-1 h-1 bg-[rgba(var(--mg-accent),1)] rounded-full top-[55%] left-[40%] opacity-25"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-[70%] left-[90%] opacity-35"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[85%] left-[15%] opacity-40"></div>
        <div className="absolute w-2 h-2 bg-[rgba(var(--mg-primary),1)] rounded-full top-[95%] left-[65%] opacity-20"></div>
      </motion.div>

      {/* Employee Console Button - Fixed Position - REMOVING DUPLICATE BUTTON */}
      {/* This button is already in the Navigation component */}
      
      <div className="relative z-10">
        {/* Main Content */}
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <JoinUsSection />
        
        {/* Navigation Dots */}
        <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 space-y-6 hidden md:block">
          {['hero', 'services', 'about', 'join'].map((section) => (
            <button
              key={section}
              onClick={() => {
                document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
                setActivePage(section);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 flex items-center justify-center ${
                activePage === section 
                  ? 'bg-[rgba(var(--mg-primary),0.8)] scale-110' 
                  : 'border border-[rgba(var(--mg-primary),0.4)] bg-transparent'
              }`}
              aria-label={`Navigate to ${section} section`}
            >
              <span className={`absolute w-1 h-1 rounded-full bg-[rgba(var(--mg-primary),1)] ${
                activePage === section ? 'opacity-100' : 'opacity-0'
              }`}></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 