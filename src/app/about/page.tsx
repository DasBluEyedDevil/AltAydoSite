'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Timeline Node Component
const TimelineNode = ({ 
  position, 
  year, 
  title, 
  subtitle, 
  content, 
  delay,
  leftPosition 
}: { 
  position: 'left' | 'right', 
  year: string, 
  title: string, 
  subtitle: string, 
  content: string,
  delay: number,
  leftPosition: string 
}) => {
  return (
    <div className="absolute" style={{ left: leftPosition, top: 0 }}>
      {/* Node */}
      <motion.div
        className="absolute left-0 top-[100px] w-4 h-4 rounded-full bg-[rgba(var(--mg-primary),0.15)] border border-[rgba(var(--mg-primary),0.5)] translate-x-[-50%] translate-y-[-50%] z-10"
        initial={{ scale: 0 }}
        whileInView={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        whileHover={{ 
          scale: 1.2, 
          backgroundColor: "rgba(var(--mg-primary),0.3)" 
        }}
      >
        <motion.div 
          className="absolute inset-[2px] rounded-full bg-[rgba(var(--mg-primary),0.3)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          viewport={{ once: true }}
        />
      </motion.div>
      
      {/* Content */}
      <motion.div
        className={`absolute w-60 ${position === 'left' ? 'right-5 text-right' : 'left-5'} ${position === 'left' ? 'top-[40px]' : 'top-[140px]'}`}
        initial={{ opacity: 0, y: position === 'left' ? -20 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.1 }}
        viewport={{ once: true }}
      >
        <div className="text-[rgba(var(--mg-primary),1)] text-xs font-quantify">{year} - {title}</div>
        <h3 className="text-sm font-bold text-[rgba(var(--mg-text),0.9)] my-1">{subtitle}</h3>
        <p className="text-xs text-[rgba(var(--mg-text),0.7)]">{content}</p>
      </motion.div>
      
      {/* Connection line */}
      <motion.div 
        className={`absolute h-[40px] w-[1px] bg-[rgba(var(--mg-primary),0.3)] ${position === 'left' ? 'top-[60px]' : 'top-[100px]'}`}
        style={{ left: 0, 
                transformOrigin: position === 'left' ? 'bottom center' : 'top center' }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.2 }}
        viewport={{ once: true }}
      />
    </div>
  );
};

// Directive Card Component
const DirectiveCard = ({ 
  icon, 
  title, 
  description, 
  items, 
  delay 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  items: string[],
  delay: number 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="mg-container p-0.5 group cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full w-full overflow-hidden">
        {/* Holo projection effect on hover */}
        <motion.div 
          className="absolute inset-0 bg-[rgba(var(--mg-primary),0.15)]"
          animate={{ 
            opacity: isHovered ? 0.2 : 0,
            height: isHovered ? "100%" : "0%"
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Animated border */}
        <div className="absolute inset-px z-10 bg-transparent border border-[rgba(var(--mg-primary),0.3)] group-hover:border-[rgba(var(--mg-primary),0.6)] transition-colors duration-300"></div>
        
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-5 h-5 z-10">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
          <div className="absolute top-0 left-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
        </div>
        <div className="absolute top-0 right-0 w-5 h-5 z-10">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
          <div className="absolute top-0 right-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-5 h-5 z-10">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
          <div className="absolute bottom-0 left-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-5 h-5 z-10">
          <div className="absolute bottom-0 right-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
          <div className="absolute bottom-0 right-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
        </div>
        
        {/* Scanning effect */}
        <motion.div 
          className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <motion.div 
            className="absolute top-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.5)]"
            animate={{
              top: isHovered ? ["0%", "100%", "0%"] : "0%"
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
        
        {/* Inner content */}
        <div className="relative z-0 h-full p-6 bg-[rgba(var(--mg-background),0.5)]">
          <div className="flex items-start mb-4">
            <motion.div 
              className="mr-3 mt-1"
              animate={{ 
                rotate: isHovered ? [0, 5, 0, -5, 0] : 0
              }}
              transition={{ duration: 5, repeat: isHovered ? Infinity : 0 }}
            >
              <motion.div 
                className="w-10 h-10 rounded-full bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.3)] flex items-center justify-center"
                animate={{
                  boxShadow: isHovered 
                    ? ["0 0 0px rgba(var(--mg-primary), 0.2)", 
                       "0 0 10px rgba(var(--mg-primary), 0.5)", 
                       "0 0 0px rgba(var(--mg-primary), 0.2)"]
                    : "0 0 0px rgba(var(--mg-primary), 0)"
                }}
                transition={{
                  duration: 2,
                  repeat: isHovered ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {icon}
                </svg>
              </motion.div>
            </motion.div>
            <div>
              <h3 className="mg-text text-lg font-bold mb-2">{title}</h3>
              <p className="text-sm text-[rgba(var(--mg-text),0.7)]">
                {description}
              </p>
            </div>
          </div>
          
          <motion.div 
            className="mt-4 pt-3 border-t border-[rgba(var(--mg-primary),0.2)]"
            animate={{
              borderTopColor: isHovered 
                ? "rgba(var(--mg-primary),0.6)" 
                : "rgba(var(--mg-primary),0.2)"
            }}
            transition={{ duration: 0.3 }}
          >
            <ul className="space-y-2 text-xs">
              {items.map((item, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -5 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.1 + (index * 0.1) }}
                  viewport={{ once: true }}
                >
                  <motion.span 
                    className="mr-2 mt-1 w-1.5 h-1.5 bg-[rgba(var(--mg-primary),0.7)] rounded-full"
                    animate={{
                      scale: isHovered ? [1, 1.5, 1] : 1,
                      backgroundColor: isHovered 
                        ? ["rgba(var(--mg-primary),0.7)", "rgba(var(--mg-accent),0.7)", "rgba(var(--mg-primary),0.7)"] 
                        : "rgba(var(--mg-primary),0.7)"
                    }}
                    transition={{
                      duration: 2,
                      repeat: isHovered ? Infinity : 0,
                      delay: index * 0.2
                    }}
                  ></motion.span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default function About() {
  const [time, setTime] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Parallax effect based on scroll position
  const parallaxOffset = (depth: number) => {
    return scrollPosition * depth;
  };

  return (
    <>
      {/* Status Bar */}
      <div className="bg-black/80 border-b border-[rgba(var(--mg-primary),0.3)] py-1.5 px-4 text-xs text-[rgba(var(--mg-primary),0.8)] flex justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="mg-text font-quantify tracking-wider">MOBIGLAS SYSTEM</span>
          <span className="text-[rgba(var(--mg-text),0.5)] mx-4">|</span>
          <span className="mg-text">ACCESS LEVEL:</span> <span className="text-[rgba(var(--mg-primary),1)] ml-1 font-bold">CIVILIAN</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[rgba(var(--mg-accent),0.9)]">QUANTUM LINK</span>
          </div>
          <span className="font-mono text-[rgba(var(--mg-primary),1)]">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/logisticsoffice.jpg"
            alt="AydoCorp Office"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>
          
          {/* Enhanced grid backgrounds and effects */}
          <div className="absolute inset-0 circuit-bg opacity-10"></div>
          <div className="absolute inset-0 mg-grid-bg opacity-10"></div>
          
          {/* Holographic particle effects */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div 
                key={i}
                className="absolute w-1 h-1 bg-[rgba(var(--mg-primary),0.6)] rounded-full"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  opacity: 0
                }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0] 
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
          
          {/* Animated scan lines */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.4)] animate-scanline"></div>
            <div className="absolute left-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.4)] animate-scanline-vertical"></div>
            <div className="absolute bottom-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.2)] animate-scanline-reverse"></div>
            <div className="absolute right-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.2)] animate-scanline-vertical-reverse"></div>
          </div>
          <motion.div
            className="fixed inset-0 z-1 opacity-80 pointer-events-none"
            style={{ y: parallaxOffset(-0.2) }}
          >
            <div className="absolute w-2 h-2 bg-white rounded-full top-[15%] left-[10%] opacity-30"></div>
            <div className="absolute w-1 h-1 bg-white rounded-full top-[25%] left-[30%] opacity-40"></div>
            <div className="absolute w-3 h-3 bg-[rgba(var(--mg-primary),1)] rounded-full top-[35%] left-[75%] opacity-20"></div>
            <div className="absolute w-2 h-2 bg-white rounded-full top-[50%] left-[55%] opacity-30"></div>
            <div className="absolute w-1 h-1 bg-[rgba(var(--mg-accent),1)] rounded-full top-[65%] left-[35%] opacity-25"></div>
            <div className="absolute w-2 h-2 bg-white rounded-full top-[80%] left-[85%] opacity-35"></div>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mg-container p-0.5 relative overflow-hidden border-[rgba(var(--mg-primary),0.2)] max-w-6xl mx-auto"
          >
            {/* Holographic boot-up sequence */}
            <motion.div
              className="absolute inset-0 bg-[rgba(var(--mg-primary),0.05)]"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Holographic flicker effect */}
            <motion.div 
              className="absolute inset-0 bg-[rgba(var(--mg-primary),0.1)]"
              animate={{ opacity: [0.3, 0.1, 0.3, 0.2, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="mg-grid-bg"></div>
              <div className="holo-noise"></div>
              <div className="holo-scan"></div>
              <div className="line-noise opacity-5"></div>
            </div>
            
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[rgba(var(--mg-primary),0.6)]"></div>
            
            {/* Content */}
            <div className="relative z-10 p-8">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-2 flex flex-wrap justify-center"
              >
                <motion.span 
                  className="mg-title text-2xl md:text-4xl tracking-wider text-[rgba(var(--mg-primary),1)]"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  CORPORATE
                </motion.span>
                <span className="mg-title text-2xl md:text-4xl tracking-wider text-[rgba(var(--mg-text),0.9)] mx-2">
                  BACKGROUND
                </span>
                <motion.span 
                  className="mg-title text-2xl md:text-4xl tracking-wider text-[rgba(var(--mg-accent),0.9)]"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  DATABASE
                </motion.span>
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mg-subtitle text-base md:text-lg opacity-90 tracking-widest mb-6 text-center"
              >
                <span className="mg-flicker inline-block bg-gradient-to-r from-[rgba(var(--mg-primary),0.9)] via-[rgba(var(--mg-accent),0.8)] to-[rgba(var(--mg-primary),0.9)] bg-clip-text text-transparent">
                  FROM PLANETARY COURIER TO INTERSTELLAR POWERHOUSE
                </span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-center max-w-3xl mx-auto"
              >
                <p className="text-[rgba(var(--mg-text),0.8)] mb-6">
                  Discover the journey of Aydo Intergalactic Corporation, from its humble beginnings to becoming a leader in interstellar logistics and transportation services.
                </p>
                
                <div className="mg-signal-indicator mt-4 flex justify-center">
                  <motion.div 
                    className="inline-flex items-center px-3 py-1 border border-[rgba(var(--mg-primary),0.3)] bg-[rgba(var(--mg-primary),0.05)]"
                    whileHover={{ 
                      boxShadow: "0 0 15px rgba(var(--mg-primary), 0.3)",
                      borderColor: "rgba(var(--mg-primary), 0.6)" 
                    }}
                  >
                    <span className="mr-2 h-2 w-2 bg-[rgba(var(--mg-primary),0.8)] animate-ping"></span>
                    <motion.span 
                      className="text-xs text-[rgba(var(--mg-primary),0.9)]"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      DATA INTEGRITY: 100%
                    </motion.span>
                  </motion.div>
                </div>
                
                {/* Interactive scan button */}
                <motion.button
                  className="mt-6 flex items-center mx-auto px-4 py-2 border border-[rgba(var(--mg-primary),0.4)] bg-[rgba(var(--mg-primary),0.05)] text-xs text-[rgba(var(--mg-primary),0.9)]"
                  whileHover={{ 
                    boxShadow: "0 0 15px rgba(var(--mg-primary), 0.3)",
                    backgroundColor: "rgba(var(--mg-primary), 0.1)" 
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <motion.div
                    className="mr-2 w-3 h-3 rounded-full border border-[rgba(var(--mg-primary),0.6)]"
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(var(--mg-primary), 0)",
                                  "0 0 8px rgba(var(--mg-primary), 0.8)",
                                  "0 0 0px rgba(var(--mg-primary), 0)"] 
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  INITIALIZE DATA SCAN
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 mg-grid-bg opacity-5"></div>
        <div className="absolute inset-0 circuit-bg opacity-10"></div>
        <div className="absolute inset-0 holo-noise opacity-10"></div>
        
        {/* Interactive line elements */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[rgba(var(--mg-primary),0.2)]"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.3)] to-transparent animate-scan-horizontal-slow"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="mg-header text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mg-title text-3xl font-quantify tracking-wider text-[rgba(var(--mg-primary),1)]"
              >
                CORPORATE TIMELINE
                <motion.div 
                  className="w-full h-0.5 mt-2 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.6)] to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                ></motion.div>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-[rgba(var(--mg-text),0.7)] max-w-3xl mx-auto mt-4"
              >
                Trace the evolution of AydoCorp from its humble origins to its current position as an interstellar logistics powerhouse.
              </motion.p>
            </div>
            
            {/* Interactive Timeline */}
            <div className="relative">
              {/* Timeline track */}
              <div className="absolute left-0 right-0 top-[100px] h-1 bg-[rgba(var(--mg-primary),0.15)]"></div>
              
              {/* Timeline events */}
              <div className="relative pt-[100px] pb-20">
                {/* First node */}
                <TimelineNode 
                  position="left"
                  year="2911"
                  title="FOUNDING"
                  subtitle="Aydo City Delivery"
                  content="Christoff Revan establishes a small courier service in Aydo City on planet Green in the Ellis system, focusing on reliable local deliveries."
                  delay={0.1}
                  leftPosition="10%"
                />
                
                {/* Second node */}
                <TimelineNode 
                  position="right"
                  year="2925"
                  title="EXPANSION"
                  subtitle="Planetary Coverage"
                  content="After years of consistent growth, operations expand to cover the entire planet Green, establishing regional hubs in major cities."
                  delay={0.2}
                  leftPosition="28%"
                />
                
                {/* Third node */}
                <TimelineNode 
                  position="left"
                  year="2938"
                  title="MERGER"
                  subtitle="Aydo Amalgamated Industries"
                  content="Strategic merger with Seahorse Fisheries of Neo Taurii leads to the formation of Aydo Amalgamated Industries, expanding operations beyond logistics into resource management."
                  delay={0.3}
                  leftPosition="45%"
                />
                
                {/* Fourth node */}
                <TimelineNode 
                  position="right"
                  year="2945"
                  title="INTERSTELLAR LAUNCH"
                  subtitle="First System Jump"
                  content="Acquisition of the first Hull-series freighter marks AydoCorp's entry into interstellar shipping, establishing routes to neighboring Stanton system."
                  delay={0.4}
                  leftPosition="62%"
                />
                
                {/* Fifth node */}
                <TimelineNode 
                  position="left"
                  year="2948"
                  title="INCORPORATION"
                  subtitle="Aydo Intergalactic Corporation"
                  content="Following rapid expansion and multiple acquisitions, the company officially becomes Aydo Intergalactic Corporation, establishing headquarters in a state-of-the-art facility in Aydo City."
                  delay={0.5}
                  leftPosition="80%"
                />
                
                {/* Present day indicator */}
                <div className="absolute right-0 top-[100px] translate-y-[-50%]">
                  <motion.div
                    className="w-3 h-3 rounded-full bg-[rgba(var(--mg-primary),0.8)] relative z-10"
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(var(--mg-primary), 0.2)",
                                 "0 0 15px rgba(var(--mg-primary), 0.8)",
                                 "0 0 0px rgba(var(--mg-primary), 0.2)"] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute top-5 right-0 text-right"
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-[rgba(var(--mg-primary),1)] text-sm font-quantify">PRESENT DAY</div>
                    <div className="text-[rgba(var(--mg-text),0.6)] text-xs">GALACTIC PRESENCE</div>
                  </motion.div>
                </div>
                
                {/* Timeline progress */}
                <motion.div 
                  className="absolute left-0 top-[100px] h-1 bg-[rgba(var(--mg-primary),0.6)]"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  viewport={{ once: true }}
                />
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: true }}
              className="mg-container p-0.5 border border-[rgba(var(--mg-primary),0.3)] mt-16 relative overflow-hidden"
            >
              {/* Corner elements */}
              <div className="absolute top-0 left-0 w-8 h-8">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-[rgba(var(--mg-primary),0.8)]"></div>
                <div className="absolute top-0 left-0 h-full w-0.5 bg-[rgba(var(--mg-primary),0.8)]"></div>
              </div>
              <div className="absolute top-0 right-0 w-8 h-8">
                <div className="absolute top-0 right-0 w-full h-0.5 bg-[rgba(var(--mg-primary),0.8)]"></div>
                <div className="absolute top-0 right-0 h-full w-0.5 bg-[rgba(var(--mg-primary),0.8)]"></div>
              </div>
              <div className="absolute bottom-0 left-0 w-8 h-8">
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[rgba(var(--mg-primary),0.8)]"></div>
                <div className="absolute bottom-0 left-0 h-full w-0.5 bg-[rgba(var(--mg-primary),0.8)]"></div>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8">
                <div className="absolute bottom-0 right-0 w-full h-0.5 bg-[rgba(var(--mg-primary),0.8)]"></div>
                <div className="absolute bottom-0 right-0 h-full w-0.5 bg-[rgba(var(--mg-primary),0.8)]"></div>
              </div>
              
              <div className="relative overflow-hidden rounded">
                <div className="relative h-64 md:h-80">
                  <Image
                    src="/images/Hull_E.jpg"
                    alt="AydoCorp Fleet"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                  
                  {/* Data readout overlay */}
                  <motion.div 
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    {/* Data points */}
                    <motion.div 
                      className="absolute top-[20%] left-[30%]"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-3 h-3 rounded-full border-2 border-[rgba(var(--mg-primary),0.6)]" />
                      <div className="absolute w-32 h-0.5 bg-[rgba(var(--mg-primary),0.3)]" style={{ transform: 'rotate(45deg)', transformOrigin: 'left center' }} />
                      <div className="absolute top-8 left-8 text-xs text-[rgba(var(--mg-primary),0.8)]">BRIDGE</div>
                    </motion.div>
                    
                    <motion.div 
                      className="absolute top-[40%] left-[60%]"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-3 h-3 rounded-full border-2 border-[rgba(var(--mg-primary),0.6)]" />
                      <div className="absolute w-32 h-0.5 bg-[rgba(var(--mg-primary),0.3)]" style={{ transform: 'rotate(-45deg)', transformOrigin: 'left center' }} />
                      <div className="absolute top-8 left-8 text-xs text-[rgba(var(--mg-primary),0.8)]">CARGO BAY</div>
                    </motion.div>
                  </motion.div>
                  
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <h3 className="text-lg font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)]">CORPORATE FLEET</h3>
                    <p className="text-sm text-[rgba(var(--mg-text),0.8)]">
                      From humble beginnings with a single shuttle to a diverse fleet of specialized vessels, AydoCorp's growth reflects our commitment to excellence in interstellar logistics.
                    </p>
                    
                    <motion.div 
                      className="mt-2 flex items-center"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      viewport={{ once: true }}
                    >
                      <span className="text-xs text-[rgba(var(--mg-primary),0.9)] mr-2">VESSEL COUNT:</span>
                      <span className="text-xs text-[rgba(var(--mg-accent),1)]">48</span>
                      <span className="mx-2 h-3 w-px bg-[rgba(var(--mg-primary),0.4)]"></span>
                      <span className="text-xs text-[rgba(var(--mg-primary),0.9)] mr-2">SYSTEMS COVERED:</span>
                      <span className="text-xs text-[rgba(var(--mg-accent),1)]">15+</span>
                    </motion.div>
                  </div>
                  
                  {/* Scanning effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent animate-scan-horizontal"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Focus Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 mg-grid-bg opacity-5"></div>
        <div className="absolute inset-0 circuit-bg opacity-10"></div>
        <div className="absolute inset-0 holo-noise opacity-10"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div 
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: i % 3 === 0 
                  ? 'rgba(var(--mg-primary), 0.5)' 
                  : i % 3 === 1 
                    ? 'rgba(var(--mg-accent), 0.5)' 
                    : 'rgba(255, 255, 255, 0.5)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
        
        {/* Animated scan lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.2)] animate-scanline"></div>
          <div className="absolute right-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.2)] animate-scanline-vertical-reverse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mg-header text-center mb-10">
              <motion.h2 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mg-title text-3xl font-quantify tracking-wider text-[rgba(var(--mg-primary),1)]"
              >
                <motion.span 
                  initial={{ filter: "blur(8px)" }}
                  whileInView={{ filter: "blur(0px)" }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  OPERATIONAL DIRECTIVES
                </motion.span>
                <motion.div 
                  className="w-full h-0.5 mt-2 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.6)] to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                ></motion.div>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-[rgba(var(--mg-text),0.7)] max-w-3xl mx-auto mt-4"
              >
                At AydoCorp, our operational goals are guided by these key directives that shape our approach to interstellar logistics and corporate conduct.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <DirectiveCard 
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                title="Logistics Excellence"
                description="Providing comprehensive logistics solutions across the Star Citizen universe, ensuring cargo reaches its destination safely and efficiently."
                items={[
                  "Real-time cargo tracking",
                  "Multi-system route optimization",
                  "99.7% delivery success rate"
                ]}
                delay={0.1}
              />
              
              {/* Card 2 */}
              <DirectiveCard 
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
                title="Community First"
                description="Building a cohesive community of professionals guided by our CEO's philosophy that it's better to play together."
                items={[
                  "Collaborative work culture",
                  "Cross-divisional teams",
                  "Employee advancement programs"
                ]}
                delay={0.2}
              />
              
              {/* Card 3 */}
              <DirectiveCard 
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
                title="Innovation"
                description="Pushing boundaries in space logistics through our specialized divisions and research initiatives."
                items={[
                  "Racing team technology transfer",
                  "Advanced navigation systems",
                  "R&D investment in quantum tech"
                ]}
                delay={0.3}
              />
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 mg-grid-bg opacity-5"></div>
        <div className="absolute inset-0 holo-noise opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mg-container p-8 border border-[rgba(var(--mg-primary),0.3)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[rgba(var(--mg-primary),0.6)]"></div>
            
            <div className="text-center relative z-10">
              <h2 className="text-2xl md:text-3xl font-quantify tracking-wider text-[rgba(var(--mg-primary),1)] mb-4">JOIN THE AYDOCORP TEAM</h2>
              <p className="text-[rgba(var(--mg-text),0.8)] mb-8 max-w-3xl mx-auto">
                Explore career opportunities with AydoCorp and become part of our interstellar logistics family. We're always looking for talented individuals who share our passion for excellence.
              </p>
              <Link href="/join">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="mg-button py-2.5 px-8 text-sm"
                >
                  VIEW AVAILABLE POSITIONS
                </motion.button>
              </Link>
            </div>
            
            {/* Animated scan line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent animate-scan-horizontal"></div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
} 