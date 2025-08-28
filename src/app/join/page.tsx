'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const benefits = [
  {
    title: 'Career Development',
    description: 'Access to advanced training programs, professional certifications, and clear advancement pathways within our organization.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  },
  {
    title: 'Corporate Culture',
    description: 'Join a dynamic team of professionals dedicated to excellence in interstellar logistics and transportation.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    title: 'Advanced Resources',
    description: 'Work with cutting-edge technology and infrastructure supporting our interstellar operations.',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  {
    title: 'Operational Experience',
    description: 'Gain hands-on experience in various aspects of interstellar logistics and transportation.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
];

export default function Join() {
  const [time, setTime] = useState(new Date());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Status Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
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
      <section className="relative pt-20 pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src={require('@/lib/cdn').cdn('/images/spacebg.png')}
            alt="AydoCorp Operations"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
          <div className="absolute inset-0 circuit-bg"></div>
          
          {/* MobiGlas Grid */}
          <div className="absolute inset-0 mg-grid-bg"></div>
          
          {/* Animated scan line */}
          <motion.div 
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.7)] to-transparent"
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div 
              className="mb-4 inline-block"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="mg-container p-0.5 inline-block">
                <div className="bg-[rgba(var(--mg-dark),0.4)] px-8 py-2">
                  <h1 className="mg-title text-4xl sm:text-5xl font-bold mb-2">JOIN OUR TEAM</h1>
                  
                  {/* Animated underline */}
                  <motion.div 
                    className="h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.8)] to-transparent mx-auto"
                    initial={{ width: "0%" }}
                    animate={{ width: "80%" }}
                    transition={{ duration: 1.2, delay: 1 }}
                  />
                </div>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-xl text-[rgba(var(--mg-text),0.9)] max-w-3xl mx-auto mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Build your career with a leader in interstellar logistics and transportation
            </motion.p>
            
            {/* Scanning effect text */}
            <motion.div
              className="mt-6 text-[rgba(var(--mg-primary),0.8)] text-sm font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <span className="mg-flicker inline-block">ACCESSING RECRUITMENT DATABASE...</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-b from-black to-[rgba(var(--mg-background),0.7)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="mg-container inline-block p-0.5 mb-4">
              <div className="bg-[rgba(var(--mg-dark),0.4)] px-6 py-1">
                <h2 className="mg-title text-2xl font-bold">WHY CHOOSE AYDOCORP?</h2>
              </div>
            </div>
            
            <motion.div 
              className="h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.3)] to-transparent mx-auto mt-2 mb-6"
              initial={{ width: "0%" }}
              whileInView={{ width: "60%" }}
              transition={{ duration: 1.2, delay: 0.3 }}
              viewport={{ once: true }}
            />
            
            <p className="text-[rgba(var(--mg-text),0.8)] max-w-2xl mx-auto">
              Join an elite team of professionals making their mark across the universe with cutting-edge technology and visionary leadership.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => {
              const isHovered = hoveredIndex === index;
              
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="mg-container p-0.5 group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative h-full bg-[rgba(var(--mg-background),0.5)] backdrop-blur-sm overflow-hidden">
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
                                        
                    {/* Inner content */}
                    <div className="p-6 relative z-0">
                      <div className="flex items-start mb-4">
                        <motion.div 
                          className="mr-4 mt-1"
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
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-5 w-5 text-[rgba(var(--mg-primary),1)]" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor" 
                              strokeWidth="1.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} />
                            </svg>
                          </motion.div>
                        </motion.div>
                        
                        <div>
                          <h3 className="mg-subtitle text-lg font-bold mb-2">{benefit.title}</h3>
                          <p className="text-sm text-[rgba(var(--mg-text),0.7)]">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                      
                      <motion.div
                        className="mt-3 pt-3 text-xs text-[rgba(var(--mg-text),0.6)]"
                        style={{
                          borderTopWidth: "1px",
                          borderTopStyle: "solid",
                          borderTopColor: isHovered ? "rgba(0, 215, 255, 0.6)" : "rgba(0, 215, 255, 0.2)"
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="mg-flicker">{isHovered ? "// ACCESSING DETAILS" : "// HOVER FOR MORE INFO"}</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Corporate Vision Section */}
      <section className="py-16 bg-gradient-to-b from-[rgba(var(--mg-background),0.7)] to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mg-container p-0.5"
            >
              <div className="bg-[rgba(var(--mg-dark),0.5)] p-6 relative overflow-hidden">
                {/* Top scan line */}
                <motion.div 
                  className="absolute left-0 right-0 h-[1px] bg-[rgba(var(--mg-primary),0.6)]"
                  animate={{
                    top: ["0%", "100%"],
                    opacity: [0.6, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                {/* Header with decorative elements */}
                <div className="mb-6 flex items-center">
                  <div className="w-2 h-2 bg-[rgba(var(--mg-primary),0.8)] mr-3"></div>
                  <h2 className="mg-title text-2xl font-bold">OUR VISION</h2>
                  <div className="flex-grow ml-3 h-[1px] bg-gradient-to-r from-[rgba(var(--mg-primary),0.8)] to-transparent"></div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[rgba(var(--mg-text),0.8)] mb-4 relative">
                    <span className="text-[rgba(var(--mg-primary),1)] mr-2 font-mono">{'>'}</span>
                    At AydoCorp, we&apos;re committed to pushing the boundaries of what&apos;s possible in interstellar logistics. Our vision extends beyond traditional transportation to creating comprehensive logistics networks that connect the furthest reaches of known space.
                  </p>
                  
                  <motion.div 
                    className="h-[1px] w-3/4 bg-[rgba(var(--mg-primary),0.3)]"
                    initial={{ width: 0 }}
                    whileInView={{ width: "75%" }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  />
                  
                  <p className="text-[rgba(var(--mg-text),0.8)] relative">
                    <span className="text-[rgba(var(--mg-primary),1)] mr-2 font-mono">{'>'}</span>
                    Whether you&apos;re an experienced logistics professional or new to the field, we provide the training, resources, and support needed to help you succeed in your career with us.
                  </p>
                  
                  {/* Interactive elements */}
                  <div className="mt-8 space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-[rgba(var(--mg-text),0.7)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-success),0.8)]"></div>
                      <span>EXPERIENCED LEADERSHIP</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-[rgba(var(--mg-text),0.7)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-success),0.8)]"></div>
                      <span>CUTTING-EDGE TECHNOLOGY</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-[rgba(var(--mg-text),0.7)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-success),0.8)]"></div>
                      <span>COMPREHENSIVE TRAINING</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-[rgba(var(--mg-text),0.7)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-success),0.8)]"></div>
                      <span>INTERSTELLAR OPPORTUNITIES</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-64 md:h-96"
            >
              <div className="absolute inset-0">
                <motion.div 
                  className="absolute inset-0 mg-container p-0.5 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-full">
                    {/* The image container */}
                    <div className="absolute inset-0 overflow-hidden">
                      <Image
                        src={require('@/lib/cdn').cdn('/images/sc_banner_crusader.png')}
                        alt="AydoCorp Operations"
                        fill
                        className="object-cover scale-[1.02] hologram-projection"
                      />
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(var(--mg-primary),0.2)] to-transparent opacity-70"></div>
                    </div>
                    
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-12 h-12 z-10 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
                      <div className="absolute top-0 left-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
                    </div>
                    <div className="absolute top-0 right-0 w-12 h-12 z-10 pointer-events-none">
                      <div className="absolute top-0 right-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
                      <div className="absolute top-0 right-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 z-10 pointer-events-none">
                      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
                      <div className="absolute bottom-0 left-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 z-10 pointer-events-none">
                      <div className="absolute bottom-0 right-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
                      <div className="absolute bottom-0 right-0 h-full w-[1px] bg-[rgba(var(--mg-primary),0.8)]"></div>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[rgba(var(--mg-success),1)] animate-pulse"></div>
                      <span className="text-xs text-[rgba(var(--mg-text),0.9)] mg-subtitle">IMAGE ARCHIVE | CORPORATE HQ</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mg-container p-0.5 relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 mg-grid-bg opacity-30"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[rgba(var(--mg-primary),0.03)] to-transparent"></div>
            </div>
            
            {/* Animated scan lines */}
            <motion.div 
              className="absolute left-0 right-0 h-[1px] bg-[rgba(var(--mg-primary),0.5)]"
              animate={{
                top: ["0%", "100%"],
                opacity: [0.5, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <motion.div 
              className="absolute top-0 bottom-0 w-[1px] bg-[rgba(var(--mg-primary),0.5)]"
              animate={{
                left: ["0%", "100%"],
                opacity: [0.5, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Content */}
            <div className="relative z-10 p-10 bg-[rgba(var(--mg-dark),0.7)] backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="mg-title text-3xl font-bold mb-2">READY TO BEGIN YOUR JOURNEY?</h2>
                <motion.div 
                  className="h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.8)] to-transparent mx-auto"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "40%" }}
                  transition={{ duration: 1, delay: 0.3 }}
                  viewport={{ once: true }}
                />
              </motion.div>
              
              <motion.p 
                className="text-lg text-[rgba(var(--mg-text),0.9)] mb-8 max-w-3xl mx-auto mt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Take the first step towards a rewarding career in interstellar logistics. Connect with our recruitment team today.
              </motion.p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
                {/* Contact Recruitment Button */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <a
                    href="/join/recruitment-info"
                    className="mg-button inline-flex items-center px-8 py-3 text-base relative overflow-hidden group z-10"
                  >
                    {/* Button background animation */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-[rgba(var(--mg-primary),0.1)]"></div>
                      <div className="absolute inset-0 ">
                        <motion.div 
                          className="absolute top-0 w-full h-1"
                          style={{ 
                            background: 'linear-gradient(to right, transparent, rgba(0, 215, 255, 0.3), transparent)'
                          }}
                          initial={{ top: '-100%' }}
                          animate={{ top: ['0%', '100%'] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: 'loop',
                            ease: "linear",
                            repeatDelay: 0.5
                          }}
                        />
                      </div>
                    </div>
                    
                    <span className="relative z-10 mg-text font-quantify tracking-wider">CONTACT RECRUITMENT</span>
                    
                    {/* Icon */}
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2 text-[rgba(var(--mg-primary),0.9)]" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </motion.svg>
                  </a>
                  
                  {/* Corner Decorations */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[rgba(var(--mg-primary),0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[rgba(var(--mg-primary),0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[rgba(var(--mg-primary),0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[rgba(var(--mg-primary),0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>
                
                {/* View Corporate Profile Button */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mg-button inline-flex items-center px-8 py-3 text-base relative overflow-hidden group z-10"
                  >
                    {/* Button background animation */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-[rgba(var(--mg-primary),0.1)]"></div>
                      <div className="absolute inset-0 ">
                        <motion.div 
                          className="absolute top-0 w-full h-1"
                          style={{ 
                            background: 'linear-gradient(to right, transparent, rgba(0, 215, 255, 0.3), transparent)'
                          }}
                          initial={{ top: '-100%' }}
                          animate={{ top: ['0%', '100%'] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: 'loop',
                            ease: "linear",
                            repeatDelay: 0.5
                          }}
                        />
                      </div>
                    </div>
                    
                    <span className="relative z-10 mg-text font-quantify tracking-wider">VIEW CORPORATE PROFILE</span>
                    
                    {/* Icon */}
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2 text-[rgba(var(--mg-primary),0.9)]" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      animate={{ 
                        rotate: [0, 10, 0, -10, 0] 
                      }}
                      transition={{ 
                        duration: 5, 
                        repeat: Infinity,
                        repeatType: 'loop'
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </motion.svg>
                  </a>
                  
                  {/* Corner Decorations */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[rgba(var(--mg-primary),0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[rgba(var(--mg-primary),0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[rgba(var(--mg-primary),0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[rgba(var(--mg-primary),0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>
              </div>
              
              {/* System Status */}
              <motion.div
                className="mt-12 text-xs text-[rgba(var(--mg-text),0.6)] font-mono"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="inline-block px-4 py-1 border border-[rgba(var(--mg-primary),0.3)] mg-flicker">
                  RECRUITMENT SYSTEM STATUS: <span className="text-[rgba(var(--mg-success),1)]">ONLINE</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
} 