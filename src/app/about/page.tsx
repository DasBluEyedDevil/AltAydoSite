'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ErrorBoundary from '../../components/ErrorBoundary';
import AlliesSection from '../../components/AlliesSection';

// Timeline Node Component
const TimelineNode = ({ 
  year, 
  title, 
  subtitle, 
  content, 
  delay
}: { 
  year: string, 
  title: string, 
  subtitle: string, 
  content: string,
  delay: number
}) => {
  return (
    <motion.div 
      className="relative mb-12 pl-8 last:mb-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Node */}
      <div
        className="absolute left-0 top-0 w-3 h-3 rounded-full"
        style={{
          backgroundColor: "rgba(0, 215, 255, 0.8)",
          transform: "translateX(-50%)",
          marginTop: "6px"
        }}
      />

      {/* Vertical line */}
      <div 
        className="absolute left-0 top-0 w-[1px] h-full"
        style={{ 
          backgroundColor: "rgba(0, 215, 255, 0.3)",
          transform: "translateX(-50%)",
          height: "calc(100% + 12px)",
        }}
      />

      {/* Content */}
      <div>
        <div className="text-[rgba(var(--mg-primary),1)] text-sm font-quantify mb-1">{year} - {title}</div>
        <h3 className="text-base font-bold text-[rgba(var(--mg-text),0.9)] mb-2">{subtitle}</h3>
        <p className="text-sm text-[rgba(var(--mg-text),0.7)]">{content}</p>
      </div>
    </motion.div>
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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="mg-container p-0.5 group cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full w-full overflow-hidden">
        {/* Holo projection effect on hover */}
        <motion.div 
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(0, 215, 255, 0.15)"
          }}
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
          className="absolute inset-0 overflow-hidden"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute top-0 w-full h-1"
              style={{ 
                background: 'linear-gradient(to right, transparent, rgba(0, 215, 255, 0.4), transparent)'
              }}
              animate={{
                top: ['0%', '100%', '0%']
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
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
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(0, 215, 255, 0.1)",
                  borderColor: "rgba(0, 215, 255, 0.3)",
                  borderWidth: "1px"
                }}
                animate={{
                  boxShadow: isHovered 
                    ? [
                        "0 0 0px rgba(0, 215, 255, 0.2)", 
                        "0 0 10px rgba(0, 215, 255, 0.5)", 
                        "0 0 0px rgba(0, 215, 255, 0.2)"
                      ]
                    : "0 0 0px rgba(0, 215, 255, 0)"
                }}
                transition={{
                  duration: 2,
                  repeat: isHovered ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
            className="mt-4 pt-3"
            style={{
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: isHovered ? "rgba(0, 215, 255, 0.6)" : "rgba(0, 215, 255, 0.2)"
            }}
            transition={{ duration: 0.3 }}
          >
            <ul className="space-y-2 text-xs">
              {items.map((item, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.1 + (index * 0.1) }}
                >
                  <motion.span 
                    className="mr-2 mt-1 w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: "rgba(0, 215, 255, 0.7)"
                    }}
                    animate={{
                      scale: isHovered ? [1, 1.5, 1] : 1,
                      backgroundColor: isHovered 
                        ? [
                            "rgba(0, 215, 255, 0.7)", 
                            "rgba(30, 250, 255, 0.7)", 
                            "rgba(0, 215, 255, 0.7)"
                          ] 
                        : "rgba(0, 215, 255, 0.7)"
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
  const [isDataFeedActive, setIsDataFeedActive] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionComplete, setConnectionComplete] = useState(false);
  const [connectionMessages, setConnectionMessages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('subsidiaries');

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

  // Initialize data feed connection
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isDataFeedActive && !connectionComplete) {
      // Connection messages
      const techMessages = [
        "Establishing quantum relay link...",
        "Accessing corporate historical archives...",
        "Decrypting temporal data matrices...",
        "Synthesizing corporate evolution patterns...",
        "Mapping historical significance nodes...",
        "Reconstructing timeline interface...",
        "Validating data chronology...",
        "Rendering historical visualization..."
      ];

      // Add initial message
      setConnectionMessages([techMessages[0]]);

      interval = setInterval(() => {
        setConnectionProgress((prev) => {
          // Add a new message at certain progress points
          if (prev % 14 === 0 && prev < 100) {
            const messageIndex = Math.floor(prev / 14) + 1;
            if (messageIndex < techMessages.length) {
              setConnectionMessages(current => [...current, techMessages[messageIndex]]);
            }
          }

          if (prev >= 100) {
            clearInterval(interval);
            setConnectionComplete(true);
            setConnectionMessages(current => [...current, "Connection established successfully"]);
            return 100;
          }
          return prev + 1;
        });
      }, 40);
    }

    return () => clearInterval(interval);
  }, [isDataFeedActive, connectionProgress, connectionComplete]);

  const startDataFeed = () => {
    setIsDataFeedActive(true);
    setConnectionProgress(0);
    setConnectionComplete(false);
    setConnectionMessages([]);
  };

  // Parallax effect based on scroll position
  const parallaxOffset = (depth: number) => {
    return scrollPosition * depth;
  };

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md mx-auto p-6 border border-[rgba(var(--mg-primary),0.3)] rounded-lg bg-gray-900">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4 text-gray-400 text-sm">
            There was an error rendering the About page. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.5)] text-white rounded hover:bg-[rgba(var(--mg-primary),0.3)]"
          >
            Reload Page
          </button>
        </div>
      </div>
    }>
      <>
        {/* Status Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 bg-black/90 border-b border-[rgba(var(--mg-primary),0.2)] py-1.5 px-4 text-xs text-[rgba(var(--mg-primary),0.8)] flex justify-between backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[rgba(var(--mg-success),1)] animate-pulse"></span>
            <span className="mg-text text-xs tracking-wider">SYSTEM ONLINE</span>
            <span className="text-[rgba(var(--mg-text),0.5)] mx-4">|</span>
            <span className="text-[rgba(var(--mg-text),0.7)]">USER ACCESS:</span> <span className="text-[rgba(var(--mg-primary),0.9)] ml-1 mg-subtitle">CIVILIAN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[rgba(var(--mg-text),0.7)]">QUANTUM LINK:</span> <span className="text-[rgba(var(--mg-success),1)] ml-1">ACTIVE</span>
            <span className="ml-4 font-mono text-[rgba(var(--mg-text),0.8)]">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <section className="relative pt-24 pb-16">
          <div className="absolute inset-0 z-0">
            <Image
              src={require('@/lib/cdn').cdn('/images/logisticsoffice.jpg')}
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
              <motion.div 
                className="absolute w-full h-[1px]"
                style={{ 
                  top: 0,
                  backgroundColor: "rgba(0, 215, 255, 0.4)"
                }}
                animate={{
                  top: ['0%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div 
                className="absolute h-full w-[1px]"
                style={{ 
                  left: 0,
                  backgroundColor: "rgba(0, 215, 255, 0.4)"
                }}
                animate={{
                  left: ['0%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div 
                className="absolute w-full h-[1px]"
                style={{ 
                  bottom: 0,
                  backgroundColor: "rgba(0, 215, 255, 0.2)"
                }}
                animate={{
                  bottom: ['0%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  direction: "reverse"
                }}
              />
              <motion.div 
                className="absolute h-full w-[1px]"
                style={{ 
                  right: 0,
                  backgroundColor: "rgba(0, 215, 255, 0.2)"
                }}
                animate={{
                  right: ['0%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  direction: "reverse"
                }}
              />
            </div>
            <motion.div
              className="fixed inset-0 z-1 opacity-80 pointer-events-none"
              style={{ 
                y: parallaxOffset(-0.2),
                position: 'absolute'
              }}
            >
              {/* Removed the random dots that were appearing on plain black background */}
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
                        boxShadow: "0 0 15px rgba(0, 215, 255, 0.3)",
                        borderColor: "rgba(0, 215, 255, 0.6)" 
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
                    className="mt-8 flex items-center justify-center mx-auto px-6 py-3 text-sm relative group"
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "rgba(0, 215, 255, 0.6)",
                      backgroundColor: "rgba(0, 215, 255, 0.08)",
                      color: "rgba(0, 215, 255, 1)",
                      letterSpacing: "1px",
                      fontWeight: "500"
                    }}
                    whileHover={{ 
                      boxShadow: "0 0 20px rgba(0, 215, 255, 0.4)",
                      backgroundColor: "rgba(0, 215, 255, 0.15)" 
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      boxShadow: ["0 0 0px rgba(0, 215, 255, 0.2)", "0 0 15px rgba(0, 215, 255, 0.4)", "0 0 0px rgba(0, 215, 255, 0.2)"]
                    }}
                    transition={{ 
                      opacity: { delay: 1.5 },
                      boxShadow: { repeat: Infinity, duration: 2 }
                    }}
                    onClick={startDataFeed}
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,215,255,0.1)] via-[rgba(0,215,255,0.2)] to-[rgba(0,215,255,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Pulse effect around button */}
                    <div className="absolute -inset-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 rounded-sm bg-transparent border border-[rgba(0,215,255,0.6)]" 
                        style={{
                          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                        }}
                      ></div>
                    </div>

                    <motion.div
                      className="mr-3 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "rgba(0, 215, 255, 0.8)",
                        backgroundColor: "rgba(0, 215, 255, 0.2)"
                      }}
                      animate={{ 
                        boxShadow: [
                          "0 0 0px rgba(0, 215, 255, 0)",
                          "0 0 10px rgba(0, 215, 255, 0.8)",
                          "0 0 0px rgba(0, 215, 255, 0)"
                        ] 
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-1.5 h-1.5 bg-[rgba(0,215,255,1)] rounded-full"></div>
                    </motion.div>
                    <span className="font-quantify tracking-wider">INITIALIZE DATA FEED</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Data Connection Interface - Shows when button is clicked */}
        {isDataFeedActive && !connectionComplete && (
          <section className="py-8 bg-black relative">
            <div className="max-w-4xl mx-auto px-4">
              <div className="p-6 border border-[rgba(var(--mg-primary),0.3)] bg-black/70 relative rounded-lg overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-[rgba(var(--mg-primary),0.2)] to-[rgba(var(--mg-accent),0.2)]"></div>

                {/* Decorative grid lines */}
                <div className="absolute inset-0 grid grid-cols-12 gap-4 opacity-20 pointer-events-none">
                  {Array(12).fill(0).map((_, i) => (
                    <div key={`grid-col-${i}`} className="h-full w-px bg-[rgba(var(--mg-primary),0.3)]"></div>
                  ))}
                  {Array(6).fill(0).map((_, i) => (
                    <div key={`grid-row-${i}`} className="w-full h-px bg-[rgba(var(--mg-primary),0.3)] absolute" style={{ top: `${i * 20}%` }}></div>
                  ))}
                </div>

                {/* Scanning animation overlay */}
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="absolute top-0 h-full w-2 bg-[rgba(var(--mg-primary),0.3)] blur-sm"
                    style={{ 
                      boxShadow: '0 0 20px rgba(0, 215, 255, 0.5), 0 0 40px rgba(0, 215, 255, 0.3), 0 0 60px rgba(0, 215, 255, 0.2)',
                      animation: 'scanline-vertical 2s linear infinite'
                    }}
                  ></div>
                </div>

                <div className="text-center relative z-10">
                  <h3 className="text-xl font-bold mb-4 text-[rgba(var(--mg-primary),1)] flex items-center justify-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-[rgba(var(--mg-primary),1)] animate-pulse"></span>
                    Historical Data Connection
                  </h3>

                  <div className="space-y-4">
                    {/* Progress bar */}
                    <div className="w-full h-5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-[rgba(var(--mg-primary),0.3)]">
                      <div className="relative h-full">
                        <div 
                          className="h-full rounded-full transition-all duration-100"
                          style={{ 
                            width: `${connectionProgress}%`,
                            background: 'linear-gradient(to right, rgba(0, 215, 255, 0.6), rgba(0, 255, 200, 0.6))'
                          }}
                        ></div>
                        {/* Progress markers */}
                        {[25, 50, 75].map((mark) => (
                          <div 
                            key={mark}
                            className="absolute top-0 bottom-0 w-px bg-[rgba(var(--mg-text),0.3)]"
                            style={{ left: `${mark}%` }}
                          ></div>
                        ))}
                        {/* Percentage indicator */}
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-[rgba(var(--mg-text),1)]">
                          {connectionProgress.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="text-[rgba(var(--mg-primary),0.9)] font-mono flex items-center justify-center gap-2 text-sm">
                      <span className="inline-block h-2 w-2 bg-[rgba(var(--mg-primary),0.9)] rounded-full animate-pulse"></span>
                      ESTABLISHING CONNECTION: {connectionProgress.toFixed(0)}% COMPLETE
                    </div>

                    {/* Terminal-like message display */}
                    <div className="mt-4 p-3 bg-black/70 border border-[rgba(var(--mg-primary),0.3)] rounded text-left h-32 overflow-y-auto font-mono text-xs">
                      <div className="flex items-center text-[rgba(var(--mg-text),0.7)] mb-2">
                        <span className="text-[rgba(var(--mg-primary),0.9)] mr-2">&gt;&gt;&gt;</span> Feed initialization at {new Date().toLocaleTimeString()}
                      </div>
                      {connectionMessages.map((message, idx) => (
                        <div key={idx} className="text-[rgba(var(--mg-text),0.7)] ml-4 mb-1">
                          <span className="text-[rgba(var(--mg-primary),0.9)] mr-2">&gt;</span> {message}
                        </div>
                      ))}
                      <div className="text-[rgba(var(--mg-text),0.7)] inline-flex ml-4">
                        <span className="text-[rgba(var(--mg-primary),0.9)] mr-2">&gt;</span> 
                        <span className="animate-pulse">_</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Connection complete animation - shows briefly when connection finishes */}
        {connectionComplete && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.8 }}
              >
                <svg 
                  className="w-16 h-16 mx-auto text-[rgba(var(--mg-primary),1)]" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </motion.div>
              <motion.p 
                className="text-[rgba(var(--mg-primary),1)] mt-4 font-quantify tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                CONNECTION ESTABLISHED
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* History Section - Only shows when connection is complete */}
        {connectionComplete && (
          <section className="py-16 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 mg-grid-bg opacity-5"></div>
            <div className="absolute inset-0 circuit-bg opacity-10"></div>
            <div className="absolute inset-0 holo-noise opacity-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="mg-header text-center mb-16">
                  <motion.h2 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mg-title text-3xl font-quantify tracking-wider text-[rgba(var(--mg-primary),1)]"
                  >
                    CORPORATE TIMELINE
                    <motion.div 
                      className="w-full h-0.5 mt-2"
                      style={{
                        background: 'linear-gradient(to right, transparent, rgba(0, 215, 255, 0.6), transparent)'
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    ></motion.div>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-[rgba(var(--mg-text),0.7)] max-w-3xl mx-auto mt-4"
                  >
                    Trace the evolution of AydoCorp from its humble origins to its current position as an interstellar logistics powerhouse.
                  </motion.p>
                </div>

                {/* Interactive Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative">
                    <div className="relative border-l border-[rgba(var(--mg-primary),0.3)] ml-2 pl-6 py-6">
                      {/* Timeline nodes */}
                      <TimelineNode 
                        year="2911"
                        title="FOUNDING"
                        subtitle="Aydo City Delivery"
                        content="Christoff Revan establishes a small courier service in Aydo City on planet Green in the Ellis system, focusing on reliable local deliveries."
                        delay={0.1}
                      />

                      <TimelineNode 
                        year="2925"
                        title="EXPANSION"
                        subtitle="Planetary Coverage"
                        content="After years of consistent growth, operations expand to cover the entire planet Green, establishing regional hubs in major cities."
                        delay={0.2}
                      />

                      <TimelineNode 
                        year="2938"
                        title="MERGER"
                        subtitle="Aydo Amalgamated Industries"
                        content="Strategic merger with Seahorse Fisheries of Neo Taurii leads to the formation of Aydo Amalgamated Industries, expanding operations beyond logistics into resource management."
                        delay={0.3}
                      />

                      <TimelineNode 
                        year="2940"
                        title="FOUNDING"
                        subtitle="Aydo City Delivery"
                        content="The corporation had its humble beginnings as a small one-man delivery company founded by CEO Christoff Revan after his honorable discharge from the UEE Navy."
                        delay={0.4}
                      />

                      <TimelineNode 
                        year="2943"
                        title="First Expansion"
                        subtitle="Aydo Amalgamated Industries"
                        content="After a merger with Seahorse Fisheries based out of Neo Taurii on Kampos, Aydo City Delivery was renamed to Aydo Amalgamated Industries, marking the first significant expansion."
                        delay={0.5}
                      />

                      <TimelineNode 
                        year="2945"
                        title="INTERSTELLAR LAUNCH"
                        subtitle="First System Jump"
                        content="Acquisition of the first Hull-series freighter marks AydoCorp&apos;s entry into interstellar shipping, establishing routes to neighboring Stanton system."
                        delay={0.6}
                      />

                      <TimelineNode 
                        year="2945"
                        title="Corporate Formation"
                        subtitle="Aydo Intergalactic Corporation"
                        content="After acquiring multiple subsidiaries and expanding operations, the company transformed into the corporation now known as &apos;AydoCorp&apos;, serving many clients throughout human and alien space."
                        delay={0.7}
                      />

                      <TimelineNode 
                        year="2948"
                        title="INCORPORATION"
                        subtitle="Aydo Intergalactic Corporation"
                        content="Following rapid expansion and multiple acquisitions, the company officially becomes Aydo Intergalactic Corporation, establishing headquarters in a state-of-the-art facility in Aydo City."
                        delay={0.8}
                      />

                      <TimelineNode 
                        year="2948"
                        title="Security Partnership"
                        subtitle="Rogue Squadron Security"
                        content="Formed security partnership with Rogue Squadron to provide enhanced security for valuable shipments and escort services for high-profile transports."
                        delay={0.9}
                      />

                      <TimelineNode 
                        year="2951"
                        title="Present Day"
                        subtitle="Expanding Operations"
                        content="Today, AydoCorp continues to expand its reach across systems, with operations in both human and alien space, focusing on transportation, logistics, and resource consolidation."
                        delay={1.0}
                      />

                      {/* Present day indicator */}
                      <motion.div
                        className="relative mb-0 pl-0"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center">
                          <motion.div
                            className="w-3 h-3 rounded-full mr-4"
                            style={{ backgroundColor: "rgba(0, 215, 255, 0.8)" }}
                            animate={{ 
                              scale: [1, 1.2, 1],
                              boxShadow: [
                                '0 0 0 0 rgba(0, 215, 255, 0.4)',
                                '0 0 0 10px rgba(0, 215, 255, 0)',
                                '0 0 0 0 rgba(0, 215, 255, 0)'
                              ]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              repeatType: "loop"
                            }}
                          />
                          <div>
                            <div className="text-[rgba(var(--mg-primary),1)] text-sm font-quantify">PRESENT DAY</div>
                            <div className="text-[rgba(var(--mg-text),0.6)] text-xs">GALACTIC PRESENCE</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div>
                    <motion.div 
                      className="mg-container mb-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <div className="p-4">
                        <h2 className="mg-subtitle text-lg mb-3">CORPORATE HISTORY</h2>
                        <p className="text-sm text-[rgba(var(--mg-text),0.8)] leading-relaxed mb-4">
                          Over the years the company would grow and expand, what was once known as &quot;Aydo City Delivery&quot; eventually became &quot;Aydo Amalgamated Industries&quot; after a merger with Seahorse Fisheries, which was based out of Neo Taurii on Kampos.
                        </p>

                        <p className="text-sm text-[rgba(var(--mg-text),0.8)] leading-relaxed">
                          After acquiring multiple subsidiaries and having greater expansions, the company would transform into the corporation we now know as &quot;AydoCorp&quot;, serving many clients throughout human and even alien space.
                        </p>

                        <div className="flex items-center justify-between mt-4 text-[rgba(var(--mg-text),0.7)] text-xs">
                          <div className="flex items-center">
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-2"
                              animate={{ 
                                scale: [1, 1.3, 1],
                                opacity: [0.7, 1, 0.7]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            ></motion.div>
                            <span>HISTORICAL RECORD AUTHENTICATED</span>
                          </div>
                          <span className="text-[rgba(var(--mg-primary),0.9)]">CONFIDENCE: 98.7%</span>
                        </div>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-4">
                      <motion.div 
                        className="relative overflow-hidden rounded mg-container p-0.5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        <div className="h-48 relative">
                          <div className="relative w-full h-full">
                            <Image 
                              src={require('@/lib/cdn').cdn('/images/AydoOffice1.png')} 
                              alt="AydoCorp Headquarters" 
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                          <motion.div 
                            className="absolute inset-0 border border-[rgba(var(--mg-primary),0.4)]"
                            animate={{ 
                              boxShadow: [
                                'inset 0 0 0px rgba(0, 215, 255, 0.2)',
                                'inset 0 0 20px rgba(0, 215, 255, 0.4)',
                                'inset 0 0 0px rgba(0, 215, 255, 0.2)'
                              ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          ></motion.div>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50">
                            <p className="text-[rgba(var(--mg-primary),1)] text-xs text-center">
                              AydoCorp Headquarters - Aydo City, Planet Green, Ellis System
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="relative overflow-hidden rounded mg-container p-0.5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                        viewport={{ once: true }}
                      >
                        <motion.div 
                          className="relative h-48"
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="relative w-full h-full">
                            <Image 
                              src={require('@/lib/cdn').cdn('/images/hull_e.png')} 
                              alt="AydoCorp Fleet" 
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

                          {/* Animated scanning effect overlay */}
                          <motion.div 
                            className="absolute inset-0 overflow-hidden pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.2 }}
                          >
                            <motion.div 
                              className="absolute top-0 w-full h-1"
                              style={{ 
                                background: 'linear-gradient(to right, transparent, rgba(0, 215, 255, 0.4), transparent)'
                              }}
                              animate={{
                                top: ['0%', '100%', '0%']
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            />
                          </motion.div>

                          <div className="absolute bottom-0 left-0 w-full p-4">
                            <motion.h3 
                              className="text-base font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)]"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: 1.3 }}
                            >
                              CORPORATE FLEET
                            </motion.h3>

                            <div className="flex items-center justify-between mt-2 text-xs">
                              <div className="flex items-center">
                                <span className="text-[rgba(var(--mg-primary),0.9)] mr-1">VESSELS:</span>
                                <motion.span 
                                  className="text-[rgba(var(--mg-accent),1)]"
                                  animate={{ 
                                    textShadow: [
                                      '0 0 5px rgba(0, 215, 255, 0.5)',
                                      '0 0 10px rgba(0, 215, 255, 0.8)',
                                      '0 0 5px rgba(0, 215, 255, 0.5)'
                                    ]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  48
                                </motion.span>
                              </div>

                              <div className="flex items-center">
                                <span className="text-[rgba(var(--mg-primary),0.9)] mr-1">SYSTEMS:</span>
                                <motion.span 
                                  className="text-[rgba(var(--mg-accent),1)]"
                                  animate={{ 
                                    textShadow: [
                                      '0 0 5px rgba(0, 215, 255, 0.5)',
                                      '0 0 10px rgba(0, 215, 255, 0.8)',
                                      '0 0 5px rgba(0, 215, 255, 0.5)'
                                    ]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                >
                                  15+
                                </motion.span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Our Focus Section */}
        {connectionComplete && (
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
                      ? 'rgba(0, 215, 255, 0.5)' 
                      : i % 3 === 1 
                        ? 'rgba(30, 250, 255, 0.5)' 
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
              <motion.div 
                className="absolute w-full h-[1px]"
                style={{ 
                  top: 0,
                  backgroundColor: "rgba(0, 215, 255, 0.2)"
                }}
                animate={{
                  top: ['0%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div 
                className="absolute h-full w-[1px]"
                style={{ 
                  right: 0,
                  backgroundColor: "rgba(0, 215, 255, 0.2)"
                }}
                animate={{
                  right: ['0%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
                <div className="mg-header text-center mb-10">
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mg-title text-3xl font-quantify tracking-wider text-[rgba(var(--mg-primary),1)]"
                  >
                    <motion.span 
                      initial={{ filter: "blur(8px)" }}
                      animate={{ filter: "blur(0px)" }}
                      transition={{ duration: 0.8 }}
                    >
                      OPERATIONAL DIRECTIVES
                    </motion.span>
                    <motion.div 
                      className="w-full h-0.5 mt-2 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.6)] to-transparent"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    ></motion.div>
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-[rgba(var(--mg-text),0.7)] max-w-3xl mx-auto mt-4"
                  >
                    At AydoCorp, our operational goals are guided by these key directives that shape our approach to interstellar logistics and corporate conduct.
                  </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Card 1 */}
                  <DirectiveCard 
                    icon={<path d="M13 10V3L4 14h7v7l9-11h-7z" />}
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
                    icon={<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
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
                    icon={<path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
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
        )}

        {/* Call to Action Section */}
        {connectionComplete && (
          <section className="py-16 bg-black relative overflow-hidden">
            <div className="absolute inset-0 mg-grid-bg opacity-5"></div>
            <div className="absolute inset-0 holo-noise opacity-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mg-container p-8 border border-[rgba(var(--mg-primary),0.3)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[rgba(var(--mg-primary),0.6)]"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[rgba(var(--mg-primary),0.6)]"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[rgba(var(--mg-primary),0.6)]"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[rgba(var(--mg-primary),0.6)]"></div>

                <div className="text-center relative z-10">
                  <h2 className="text-2xl md:text-3xl font-quantify tracking-wider text-[rgba(var(--mg-primary),1)] mb-4">JOIN THE AYDOCORP TEAM</h2>
                  <p className="text-[rgba(var(--mg-text),0.8)] mb-8 max-w-3xl mx-auto">
                    Explore career opportunities with AydoCorp and become part of our interstellar logistics family. We&apos;re always looking for talented individuals who share our passion for excellence.
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
        )}

        {/* Tab-based Content - Add this after the initial about section */}
        <section className="py-16 bg-black relative">
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="mg-container p-0.5 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 holo-noise opacity-10"></div>
                <div className="absolute inset-0 circuit-bg opacity-5"></div>
                <div className="absolute inset-0 mg-grid-bg opacity-5"></div>
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(var(--mg-primary),0.1)]"></div>
              </div>

              {/* Content container */}
              <div className="relative z-10 bg-black/80 p-6">
                {/* Tab navigation */}
                <div className="flex flex-wrap border-b border-[rgba(var(--mg-primary),0.3)] mb-8">
                  <button
                    onClick={() => setActiveTab('subsidiaries')}
                    className={`px-6 py-3 text-sm transition-colors duration-300 mr-2 ${
                      activeTab === 'subsidiaries'
                        ? 'text-[rgba(var(--mg-primary),1)] border-b-2 border-[rgba(var(--mg-primary),1)]'
                        : 'text-[rgba(var(--mg-text),0.7)] hover:text-[rgba(var(--mg-text),0.9)]'
                    }`}
                  >
                    SUBSIDIARIES
                  </button>
                  <button
                    onClick={() => setActiveTab('operations')}
                    className={`px-6 py-3 text-sm transition-colors duration-300 mr-2 ${
                      activeTab === 'operations'
                        ? 'text-[rgba(var(--mg-primary),1)] border-b-2 border-[rgba(var(--mg-primary),1)]'
                        : 'text-[rgba(var(--mg-text),0.7)] hover:text-[rgba(var(--mg-text),0.9)]'
                    }`}
                  >
                    OPERATIONS
                  </button>
                  <button
                    onClick={() => setActiveTab('leadership')}
                    className={`px-6 py-3 text-sm transition-colors duration-300 ${
                      activeTab === 'leadership'
                        ? 'text-[rgba(var(--mg-primary),1)] border-b-2 border-[rgba(var(--mg-primary),1)]'
                        : 'text-[rgba(var(--mg-text),0.7)] hover:text-[rgba(var(--mg-text),0.9)]'
                    }`}
                  >
                    LEADERSHIP
                  </button>
                </div>

                {/* Tab content */}
                <div className="min-h-[400px]">
                  {/* Subsidiaries Tab */}
                  {activeTab === 'subsidiaries' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <p className="text-[rgba(var(--mg-text),0.8)] mb-6 leading-relaxed">
                        The subsidiaries at AydoCorp are subsets of the organization designed to cater to specific gameplay loops and career paths. Our goal with subsidiaries is to always keep the feeling of a tight-knit community even as the organization grows. Being part of a subsidiary means you focus on the gameplay you enjoy most while having value within a smaller group of members, all while still having the support of AydoCorp at large.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* AydoExpress */}
                        <div className="mg-container p-0.5">
                          <div className="relative p-4 bg-[rgba(var(--mg-background),0.8)]">
                            <div className="flex items-center mb-4">
                              <div className="relative w-16 h-16">
                                <Image 
                                  src={require('@/lib/cdn').cdn('/images/Aydo_Express.png')} 
                                  alt="AydoExpress Logo" 
                                  width={64}
                                  height={64}
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <h3 className="mg-title text-xl">AYDO EXPRESS</h3>
                                <div className="mg-subtitle text-xs">LOGISTICS & TRANSPORT DIVISION</div>
                              </div>
                            </div>

                            <p className="text-sm text-[rgba(var(--mg-text),0.8)] mb-4">
                              The bread and butter of the organization, AydoExpress deals with cargo hauling and personnel transport. Gameplay offered includes trading, deliveries, transport, and general hauling operations that are critical to the organization&apos;s function.
                            </p>

                            <div className="relative mt-4 overflow-hidden rounded-md h-48">
                              <div className="relative w-full h-full">
                                <Image 
                                  src={require('@/lib/cdn').cdn('/images/hull_e.png')} 
                                  alt="AydoExpress Fleet" 
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50">
                                <p className="text-[rgba(var(--mg-primary),1)] text-xs text-center">
                                  AydoExpress Transport Vessel
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Empyrion Industries */}
                        <div className="mg-container p-0.5">
                          <div className="relative p-4 bg-[rgba(var(--mg-background),0.8)]">
                            <div className="flex items-center mb-4">
                              <div className="relative w-16 h-16">
                                <Image 
                                  src={require('@/lib/cdn').cdn('/images/Empyrion_Industries.png')} 
                                  alt="Empyrion Industries Logo" 
                                  width={64}
                                  height={64}
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <h3 className="mg-title text-xl">EMPYRION INDUSTRIES</h3>
                                <div className="mg-subtitle text-xs">RESOURCE & INDUSTRIAL DIVISION</div>
                              </div>
                            </div>

                            <p className="text-sm text-[rgba(var(--mg-text),0.8)] mb-4">
                              Keeping the coffers full, Empyrion Industries deals with industrial gameplay to sustain the organization with resources and profits. Gameplay offered includes mining and salvaging operations, as well as refueling and resource processing.
                            </p>

                            <div className="relative mt-4 overflow-hidden rounded-md h-48">
                              <div className="relative w-full h-full">
                                <Image 
                                  src={require('@/lib/cdn').cdn('/images/reclaimer.png')} 
                                  alt="Empyrion Industries Operations" 
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50">
                                <p className="text-[rgba(var(--mg-primary),1)] text-xs text-center">
                                  Empyrion Industries Salvage Vessel
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Operations Tab */}
                  {activeTab === 'operations' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      <DirectiveCard
                        icon={<path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h2a2 2 0 002-2v-1a2 2 0 012-2h1.945M5 20h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" />}
                        title="Transport & Shipping"
                        description="Safe transportation of goods throughout human and alien space"
                        items={[
                          "Regular shipments of cargo on behalf of client companies",
                          "Secure transport with onboard security for all large shipments",
                          "Top-of-the-line fighter craft escorts for valuable commodities",
                          "Service routes throughout Sol-Terra trading sectors",
                          "Operations in Xi'an and Banu systems"
                        ]}
                        delay={0.1}
                      />

                      <DirectiveCard
                        icon={<path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                        title="Resource Consolidation"
                        description="Enhanced efficiency for client business operations"
                        items={[
                          "Supervision of client operations for better cohesion",
                          "Resource management and allocation services",
                          "Logistical planning and implementation",
                          "Operational efficiency consulting",
                          "Supply chain management and optimization"
                        ]}
                        delay={0.2}
                      />

                      <DirectiveCard
                        icon={<path d="M12 14l9-5-9-5-9 5 9 5z" />}
                        title="Personnel Transport"
                        description="Safe and speedy transport services for staff and clients"
                        items={[
                          "Transportation for all AIC staff and client employees",
                          "Private charter services available upon request",
                          "Civilian transport on cargo vessels (space available basis)",
                          "VIP transportation with enhanced security measures",
                          "Interspecies cultural liaison services for alien space travel"
                        ]}
                        delay={0.3}
                      />
                    </motion.div>
                  )}

                  {/* Leadership Tab */}
                  {activeTab === 'leadership' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      {/* CEO positioned at top-middle */}
                      <div className="flex justify-center mb-6">
                        <div className="mg-container p-0.5 w-full max-w-md">
                          <div className="relative p-4 bg-[rgba(var(--mg-background),0.8)]">
                            <div className="relative w-32 h-auto aspect-[3/1]">
                              <Image
                                src={require('@/lib/cdn').cdn('/images/Board_member_tag.png')}
                                alt="Board Member"
                                width={128}
                                height={42}
                                className="w-full h-auto"
                              />
                            </div>

                            <div className="text-center mb-4">
                              <h3 className="mg-title text-xl">CHRISTOFF REVAN</h3>
                              <div className="mg-subtitle text-xs">CHIEF EXECUTIVE OFFICER</div>
                            </div>

                            <p className="text-sm text-[rgba(var(--mg-text),0.8)] mb-4">
                              Hailing from Neo Taurii, Christoff served with distinction in the UEE Navy before founding what would become AydoCorp. A visionary leader who expanded a small delivery service into an intergalactic corporation.
                            </p>

                            <div className="text-xs text-[rgba(var(--mg-text),0.6)] mt-4 pt-4 border-t border-[rgba(var(--mg-primary),0.2)]">
                              <div className="flex justify-between mb-1">
                                <span>Handle</span>
                                <span>Udon</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>Origin</span>
                                <span>Kampos, Ellis System</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Prior Service</span>
                                <span>UEE Navy</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Other three executives in a row below */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* CMO */}
                        <div className="mg-container p-0.5">
                          <div className="relative p-4 bg-[rgba(var(--mg-background),0.8)]">
                            <div className="relative w-32 h-auto aspect-[3/1]">
                              <Image
                                src={require('@/lib/cdn').cdn('/images/Board_member_tag.png')}
                                alt="Board Member"
                                width={128}
                                height={42}
                                className="w-full h-auto"
                              />
                            </div>

                            <div className="text-center mb-4">
                              <h3 className="mg-title text-xl">ZANE MAKAY</h3>
                              <div className="mg-subtitle text-xs">CHIEF MARKETING OFFICER</div>
                            </div>

                            <p className="text-sm text-[rgba(var(--mg-text),0.8)] mb-4">
                              A former UEE Army dropship pilot with experience flying the Hercules M2 and Anvil Valkyrie. Known for his friendly nature and insightful ideas that quickly elevated him to his executive position.
                            </p>

                            <div className="text-xs text-[rgba(var(--mg-text),0.6)] mt-4 pt-4 border-t border-[rgba(var(--mg-primary),0.2)]">
                              <div className="flex justify-between mb-1">
                                <span>Handle</span>
                                <span>Noodles</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>Origin</span>
                                <span>Delamar, Nix System</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Prior Service</span>
                                <span>UEE Army</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* COO */}
                        <div className="mg-container p-0.5">
                          <div className="relative p-4 bg-[rgba(var(--mg-background),0.8)]">
                            <div className="relative w-32 h-auto aspect-[3/1]">
                              <Image
                                src={require('@/lib/cdn').cdn('/images/Board_member_tag.png')}
                                alt="Board Member"
                                width={128}
                                height={42}
                                className="w-full h-auto"
                              />
                            </div>

                            <div className="text-center mb-4">
                              <h3 className="mg-title text-xl">KAIBO ZABER</h3>
                              <div className="mg-subtitle text-xs">CHIEF OPERATIONS OFFICER</div>
                            </div>

                            <p className="text-sm text-[rgba(var(--mg-text),0.8)] mb-4">
                              A UEE Navy veteran and former privateer providing security and medical services. Known for his perseverance and experience leading groups of spacecraft in tense situations.
                            </p>

                            <div className="text-xs text-[rgba(var(--mg-text),0.6)] mt-4 pt-4 border-t border-[rgba(var(--mg-primary),0.2)]">
                              <div className="flex justify-between mb-1">
                                <span>Handle</span>
                                <span>Kaibo_Z</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>Origin</span>
                                <span>Gen, Terra System</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Prior Service</span>
                                <span>UEE Navy, Privateer</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CSO */}
                        <div className="mg-container p-0.5">
                          <div className="relative p-4 bg-[rgba(var(--mg-background),0.8)]">
                            <div className="relative w-32 h-auto aspect-[3/1]">
                              <Image
                                src={require('@/lib/cdn').cdn('/images/Board_member_tag.png')}
                                alt="Board Member"
                                width={128}
                                height={42}
                                className="w-full h-auto"
                              />
                            </div>

                            <div className="text-center mb-4">
                              <h3 className="mg-title text-xl">CHRISTUS SANCTUS</h3>
                              <div className="mg-subtitle text-xs">CHIEF SAFETY OFFICER</div>
                            </div>

                            <p className="text-sm text-[rgba(var(--mg-text),0.8)] mb-4">
                              Former Chief Medical Officer aboard the exploration vessel &quot;Rasalas,&quot; with extensive experience in emergency response. Known for exceptional medical skills and ability to remain calm under extreme pressure.
                            </p>

                            <div className="text-xs text-[rgba(var(--mg-text),0.6)] mt-4 pt-4 border-t border-[rgba(var(--mg-primary),0.2)]">
                              <div className="flex justify-between mb-1">
                                <span>Handle</span>
                                <span>Devil</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>Origin</span>
                                <span>Helios, Crusader</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Prior Service</span>
                                <span>Medical Officer, &quot;Rasalas&quot;</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Alliances Section */}
        <AlliesSection />
      </>
    </ErrorBoundary>
  );
} 
