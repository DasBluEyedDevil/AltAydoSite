'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cdn } from '@/lib/cdn';
import { motion } from 'framer-motion';

interface AboutHeroProps {
  time: Date;
  scrollPosition: number;
  onInitializeDataFeed: () => void;
}

export default function AboutHero({ time, scrollPosition, onInitializeDataFeed }: AboutHeroProps) {
  // Parallax effect based on scroll position
  const parallaxOffset = (depth: number) => {
    return scrollPosition * depth;
  };

  return (
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
            src={cdn('/images/logisticsoffice.jpg')}
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
                  onClick={onInitializeDataFeed}
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
    </>
  );
}