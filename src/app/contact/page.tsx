'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact() {
  const [time, setTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('ESTABLISHING');
  const [isScanning, setIsScanning] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('ACTIVE');
    }, 1500);
    
    return () => clearInterval(timer);
  }, []);

  // Function to format the current time in MobiGlas format
  const formatMobiTime = (date: Date) => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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
      <section className="relative pt-28 pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/AydoOffice1.png"
            alt="Contact AydoCorp"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
          <div className="absolute inset-0 circuit-bg"></div>
          
          {/* Holographic grid overlay */}
          <div className="absolute inset-0 mg-grid-bg"></div>
          
          {/* Scan lines effect */}
          <div className="absolute inset-0 animate-scanline opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mb-6 relative inline-block">
              <motion.div 
                className="absolute -inset-1 rounded-full"
                style={{ background: 'rgba(var(--mg-primary), 0.1)' }}
                animate={{ 
                  boxShadow: [
                    '0 0 0px rgba(var(--mg-primary), 0.3)',
                    '0 0 20px rgba(var(--mg-primary), 0.5)',
                    '0 0 0px rgba(var(--mg-primary), 0.3)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative z-10">
                <button 
                  onClick={() => setIsScanning(!isScanning)} 
                  className="mg-button flex items-center gap-2 py-2"
                >
                  <span className="text-[rgba(var(--mg-primary),1)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span>INITIATE CONTACT PROTOCOL</span>
                </button>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-quantify">
              <span className="mg-title">CONTACT AYDOCORP</span>
            </h1>
            
            <div className="relative mb-8 mx-auto max-w-3xl">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded blur-sm"></div>
              <p className="text-xl text-gray-300 relative bg-black/50 p-3 rounded">
                <span className="mg-text">Establish direct communication with our operations team for inquiries about services, partnerships, or joining AydoCorp</span>
              </p>
            </div>
            
            {/* Connection status indicators */}
            <div className="flex justify-center gap-4 text-xs mt-4">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="h-1.5 w-1.5 rounded-full bg-[rgba(var(--mg-primary),0.8)]"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1] 
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[rgba(var(--mg-text),0.8)]">OUTGOING TRANSMISSION</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div 
                  className="h-1.5 w-1.5 rounded-full bg-[rgba(var(--mg-success),0.8)]"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1] 
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <span className="text-[rgba(var(--mg-text),0.8)]">RECEIVING SIGNAL</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Scanning animation */}
          <AnimatePresence>
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-12 overflow-hidden"
              >
                <div className="mg-container p-4 relative overflow-hidden mb-12">
                  <div className="absolute inset-0 holo-noise opacity-20"></div>
                  <div className="animate-scanline absolute inset-0 pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-quantify text-[rgba(var(--mg-primary),0.9)]">COMM-LINK DIAGNOSTIC</h3>
                    <motion.button 
                      onClick={() => setIsScanning(false)}
                      className="text-[rgba(var(--mg-text),0.7)] hover:text-[rgba(var(--mg-primary),1)] transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="w-1/3">
                      <div className="mb-4">
                        <div className="text-xs text-[rgba(var(--mg-text),0.6)] mb-1">SIGNAL STRENGTH</div>
                        <div className="h-2 bg-[rgba(var(--mg-dark),0.5)] rounded-sm overflow-hidden">
                          <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "94%" }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[rgba(var(--mg-primary),0.7)] to-[rgba(var(--mg-accent),0.9)]"
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-[rgba(var(--mg-text),0.7)]">0%</span>
                          <span className="text-[rgba(var(--mg-primary),0.9)]">94%</span>
                          <span className="text-[rgba(var(--mg-text),0.7)]">100%</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-xs text-[rgba(var(--mg-text),0.6)] mb-1">ENCRYPTION</div>
                        <div className="h-2 bg-[rgba(var(--mg-dark),0.5)] rounded-sm overflow-hidden">
                          <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[rgba(var(--mg-success),0.7)] to-[rgba(var(--mg-success),0.9)]"
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-[rgba(var(--mg-text),0.7)]">DISABLED</span>
                          <span className="text-[rgba(var(--mg-success),0.9)]">ACTIVE</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-2/3 relative border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-dark),0.2)] rounded-sm p-3">
                      <div className="text-xs text-[rgba(var(--mg-text),0.6)] mb-2">SYSTEM LOG</div>
                      <div className="font-mono text-xs text-[rgba(var(--mg-text),0.8)] space-y-1 h-32 overflow-y-auto">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          &gt; Initializing communication protocol v3.82
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          &gt; Establishing connection to nearest comm relay...
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.0 }}
                        >
                          &gt; Connection established
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.4 }}
                        >
                          &gt; Encrypting data channels...
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.8 }}
                        >
                          &gt; Performing security handshake with AydoCorp servers...
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 2.2 }}
                        >
                          &gt; Verifying authentication credentials...
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 2.6 }}
                          className="text-[rgba(var(--mg-success),0.9)]"
                        >
                          &gt; SUCCESS: Secure connection to AydoCorp headquarters established
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 3.0 }}
                        >
                          &gt; Ready to transmit message...
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mg-container p-0.5"
            >
              <div className="relative bg-[rgba(var(--mg-dark),0.4)] p-8 h-full">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[rgba(var(--mg-primary),0.6)]"></div>
                <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-[rgba(var(--mg-primary),0.6)]"></div>
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-[rgba(var(--mg-primary),0.6)]"></div>
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-[rgba(var(--mg-primary),0.6)]"></div>
                
                {/* Scanning effect */}
                <motion.div 
                  className="absolute top-0 w-full h-1 opacity-20"
                  style={{ 
                    background: 'linear-gradient(to right, transparent, rgba(var(--mg-primary), 1), transparent)'
                  }}
                  animate={{
                    top: ['0%', '100%', '0%']
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              
                <h2 className="text-2xl font-bold mb-6 mg-title">MESSAGE TRANSMISSION</h2>
                <form className="space-y-6" action="mailto:aydocorp@gmail.com" method="post">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[rgba(var(--mg-text),0.8)] mb-2 font-quantify">
                      NAME
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[rgba(var(--mg-text),0.8)] mb-2 font-quantify">
                      COMM RELAY ID
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[rgba(var(--mg-text),0.8)] mb-2 font-quantify">
                      SUBJECT
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[rgba(var(--mg-text),0.8)] mb-2 font-quantify">
                      MESSAGE CONTENTS
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full px-4 py-2 bg-[rgba(var(--mg-background),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.5)] transition-all mg-input"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 mg-button group relative overflow-hidden"
                  >
                    <motion.span 
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-[rgba(var(--mg-primary),0.3)] to-[rgba(var(--mg-accent),0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{ 
                        background: [
                          'linear-gradient(90deg, rgba(var(--mg-primary),0.3) 0%, rgba(var(--mg-accent),0.3) 100%)',
                          'linear-gradient(90deg, rgba(var(--mg-accent),0.3) 0%, rgba(var(--mg-primary),0.3) 100%)',
                          'linear-gradient(90deg, rgba(var(--mg-primary),0.3) 0%, rgba(var(--mg-accent),0.3) 100%)'
                        ]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2 font-quantify">
                      <span>TRANSMIT MESSAGE</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </button>
                </form>
                
                <div className="absolute bottom-2 right-2 text-[rgba(var(--mg-text),0.4)] text-xs">
                  TRANSMISSION PROTOCOL v3.82
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div className="mg-container p-0.5">
                <div className="relative bg-[rgba(var(--mg-dark),0.4)] p-6 h-full">
                  {/* Holographic effect */}
                  <div className="absolute inset-0 opacity-20 holo-noise"></div>
                  
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[rgba(var(--mg-primary),0.6)]"></div>
                  <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-[rgba(var(--mg-primary),0.6)]"></div>
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-[rgba(var(--mg-primary),0.6)]"></div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-[rgba(var(--mg-primary),0.6)]"></div>
                  
                  <h2 className="text-2xl font-bold mb-6 mg-title">COMM CHANNELS</h2>
                  
                  <div className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-[rgba(var(--mg-primary),0.05)] to-[rgba(var(--mg-accent),0.05)] opacity-0 group-hover:opacity-100 rounded-sm blur-sm transition-opacity"></div>
                      <div className="relative overflow-hidden border border-[rgba(var(--mg-primary),0.3)] rounded-sm p-4 bg-[rgba(var(--mg-background),0.4)] group-hover:border-[rgba(var(--mg-primary),0.6)] transition-all">
                        {/* Connection lines animation for discord */}
                        <div className="absolute inset-0 flex flex-col justify-between opacity-10 group-hover:opacity-20 transition-opacity">
                          {[0, 1, 2, 3, 4].map((index) => (
                            <motion.div 
                              key={index}
                              className="h-px w-full bg-[rgba(var(--mg-primary),1)]"
                              initial={{ width: "0%" }}
                              animate={{ width: ["0%", "100%", "0%"] }}
                              transition={{ 
                                duration: 3, 
                                delay: index * 0.5, 
                                repeat: Infinity,
                                repeatType: "loop" 
                              }}
                            />
                          ))}
                        </div>
                      
                        <div className="flex items-center mb-3">
                          <motion.div 
                            className="h-8 w-8 rounded-full flex items-center justify-center bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.3)] mr-3"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),1)]" viewBox="0 0 127.14 96.36">
                              <path fill="currentColor" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                            </svg>
                          </motion.div>
                          <h3 className="text-lg font-semibold mg-subtitle">DISCORD RELAY</h3>
                        </div>
                        <a
                          href="https://discord.gg/aydocorp"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[rgba(var(--mg-primary),0.9)] hover:text-[rgba(var(--mg-accent),1)] transition-colors flex items-center group-hover:translate-x-1 transition-transform"
                        >
                          <span>Join our Discord Server</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative group"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-[rgba(var(--mg-primary),0.05)] to-[rgba(var(--mg-accent),0.05)] opacity-0 group-hover:opacity-100 rounded-sm blur-sm transition-opacity"></div>
                      <div className="relative overflow-hidden border border-[rgba(var(--mg-primary),0.3)] rounded-sm p-4 bg-[rgba(var(--mg-background),0.4)] group-hover:border-[rgba(var(--mg-primary),0.6)] transition-all">
                        {/* Scanning effect */}
                        <motion.div 
                          className="absolute top-0 left-0 w-full h-2 opacity-10 group-hover:opacity-20"
                          style={{ 
                            background: 'linear-gradient(to right, transparent, rgba(var(--mg-primary), 1), transparent)'
                          }}
                          animate={{
                            top: ['0%', '100%', '0%']
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      
                        <div className="flex items-center mb-3">
                          <motion.div 
                            className="h-8 w-8 rounded-full flex items-center justify-center bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.3)] mr-3"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </motion.div>
                          <h3 className="text-lg font-semibold mg-subtitle">QUANTUM MAIL</h3>
                        </div>
                        <a
                          href="mailto:aydocorp@gmail.com"
                          className="text-[rgba(var(--mg-primary),0.9)] hover:text-[rgba(var(--mg-accent),1)] transition-colors flex items-center group-hover:translate-x-1 transition-transform"
                        >
                          <span>aydocorp@gmail.com</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="mg-container p-0.5">
                <div className="relative bg-[rgba(var(--mg-dark),0.4)] p-6 h-full">
                  {/* Data stream effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="data-stream opacity-10"></div>
                  </div>
                  
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[rgba(var(--mg-primary),0.6)]"></div>
                  <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-[rgba(var(--mg-primary),0.6)]"></div>
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-[rgba(var(--mg-primary),0.6)]"></div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-[rgba(var(--mg-primary),0.6)]"></div>
                  
                  <h2 className="text-2xl font-bold mb-6 mg-title">QUICK ACCESS</h2>
                  
                  <div className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative group"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-[rgba(var(--mg-primary),0.05)] to-[rgba(var(--mg-accent),0.05)] opacity-0 group-hover:opacity-100 rounded-sm blur-sm transition-opacity"></div>
                      <div className="relative overflow-hidden border border-[rgba(var(--mg-primary),0.3)] rounded-sm p-4 bg-[rgba(var(--mg-background),0.4)] group-hover:border-[rgba(var(--mg-primary),0.6)] transition-all">
                        {/* Pulse effect */}
                        <motion.div 
                          className="absolute inset-0 bg-[rgba(var(--mg-primary),0.05)]"
                          animate={{ 
                            opacity: [0, 0.05, 0]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity 
                          }}
                        />
                      
                        <div className="flex items-center mb-3">
                          <motion.div 
                            className="h-8 w-8 rounded-full flex items-center justify-center bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.3)] mr-3"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </motion.div>
                          <h3 className="text-lg font-semibold mg-subtitle">SERVICE REQUEST</h3>
                        </div>
                        <a
                          href="https://docs.google.com/forms/d/e/1FAIpQLSekyn2ZhdU9czvQrcLSpo1b0wIzRX__DxLFk89L4Y0NZ8FiwQ/viewform"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[rgba(var(--mg-primary),0.9)] hover:text-[rgba(var(--mg-accent),1)] transition-colors flex items-center group-hover:translate-x-1 transition-transform"
                        >
                          <span>Submit a Service Request</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative group"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-[rgba(var(--mg-primary),0.05)] to-[rgba(var(--mg-accent),0.05)] opacity-0 group-hover:opacity-100 rounded-sm blur-sm transition-opacity"></div>
                      <div className="relative overflow-hidden border border-[rgba(var(--mg-primary),0.3)] rounded-sm p-4 bg-[rgba(var(--mg-background),0.4)] group-hover:border-[rgba(var(--mg-primary),0.6)] transition-all">
                        {/* Grid background */}
                        <div className="absolute inset-0 mg-grid-bg opacity-20"></div>
                      
                        <div className="flex items-center mb-3">
                          <motion.div 
                            className="h-8 w-8 rounded-full flex items-center justify-center bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.3)] mr-3"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          </motion.div>
                          <h3 className="text-lg font-semibold mg-subtitle">RSI ORGANIZATION</h3>
                        </div>
                        <a
                          href="https://robertsspaceindustries.com/orgs/AYDOCORP"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[rgba(var(--mg-primary),0.9)] hover:text-[rgba(var(--mg-accent),1)] transition-colors flex items-center group-hover:translate-x-1 transition-transform"
                        >
                          <span>View our RSI Page</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 mg-grid-bg"></div>
          <div className="absolute inset-0 hex-grid opacity-10"></div>
          <div className="absolute inset-0 animate-scanline-vertical opacity-5"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mg-container p-0.5 mt-8"
          >
            <div className="relative bg-[rgba(var(--mg-dark),0.4)] p-8">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[rgba(var(--mg-primary),0.6)]"></div>
              <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-[rgba(var(--mg-primary),0.6)]"></div>
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-[rgba(var(--mg-primary),0.6)]"></div>
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-[rgba(var(--mg-primary),0.6)]"></div>
              
              {/* Scanning effect */}
              <motion.div 
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="absolute -inset-1 rounded-full w-6 h-6"
                  style={{ 
                    background: 'radial-gradient(circle, rgba(var(--mg-primary), 0.4) 0%, transparent 70%)'
                  }}
                  animate={{
                    top: ['0%', '100%', '0%'],
                    left: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.div>
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-quantify">HEADQUARTERS LOCATION</h2>
                <p className="text-xl text-[rgba(var(--mg-text),0.8)] mb-6">Our operations are based in the Stanton system</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[rgba(var(--mg-primary),0.2)] to-[rgba(var(--mg-accent),0.2)] rounded blur-sm"></div>
                  <div className="relative bg-[rgba(var(--mg-background),0.8)] p-4 rounded">
                    <h3 className="text-lg font-bold mb-3 mg-subtitle">PRIMARY HUB</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),0.9)] mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="text-[rgba(var(--mg-text),0.9)]">ArcCorp (Area18)</p>
                          <p className="text-[rgba(var(--mg-text),0.6)] text-sm">Central Business District</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),0.9)] mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <div>
                          <p className="text-[rgba(var(--mg-text),0.9)]">Logistics Tower</p>
                          <p className="text-[rgba(var(--mg-text),0.6)] text-sm">Floors 42-47</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),0.9)] mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-[rgba(var(--mg-text),0.9)]">Hours of Operation</p>
                          <p className="text-[rgba(var(--mg-text),0.6)] text-sm">24/7 Remote Support</p>
                          <p className="text-[rgba(var(--mg-text),0.6)] text-sm">09:00-18:00 (ArcCorp Standard Time)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[rgba(var(--mg-primary),0.2)] to-[rgba(var(--mg-accent),0.2)] rounded blur-sm"></div>
                  <div className="relative bg-[rgba(var(--mg-background),0.8)] p-4 rounded h-full">
                    <h3 className="text-lg font-bold mb-3 mg-subtitle">REGIONAL OFFICES</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center mb-1">
                          <motion.span 
                            className="inline-block w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-2"
                            animate={{ 
                              opacity: [0.5, 1, 0.5],
                              scale: [1, 1.2, 1] 
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <p className="text-[rgba(var(--mg-text),0.9)] font-semibold">Crusader (Orison)</p>
                        </div>
                        <p className="text-[rgba(var(--mg-text),0.6)] text-sm pl-4">Shipping & Fleet Operations</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-1">
                          <motion.span 
                            className="inline-block w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-2"
                            animate={{ 
                              opacity: [0.5, 1, 0.5],
                              scale: [1, 1.2, 1] 
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          />
                          <p className="text-[rgba(var(--mg-text),0.9)] font-semibold">Hurston (Lorville)</p>
                        </div>
                        <p className="text-[rgba(var(--mg-text),0.6)] text-sm pl-4">Resource Acquisition Division</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-1">
                          <motion.span 
                            className="inline-block w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-2"
                            animate={{ 
                              opacity: [0.5, 1, 0.5],
                              scale: [1, 1.2, 1] 
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                          />
                          <p className="text-[rgba(var(--mg-text),0.9)] font-semibold">microTech (New Babbage)</p>
                        </div>
                        <p className="text-[rgba(var(--mg-text),0.6)] text-sm pl-4">Technology & R&D Center</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer with Mobiglas UI */}
      <footer className="py-8 bg-[rgba(var(--mg-background),0.7)] relative border-t border-[rgba(var(--mg-primary),0.3)]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-20"></div>
          <motion.div 
            className="absolute top-0 w-full h-0.5"
            style={{ 
              background: 'linear-gradient(to right, transparent, rgba(var(--mg-primary), 0.7), transparent)'
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-lg font-bold mg-title mb-2">AYDOCORP LOGISTICS</div>
              <p className="text-[rgba(var(--mg-text),0.6)] text-sm">Moving the &apos;verse forward, one shipment at a time</p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="text-[rgba(var(--mg-text),0.7)] text-sm mb-1 font-quantify">SYSTEM STATUS</div>
              <div className="flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-[rgba(var(--mg-success),1)] mr-2"></span>
                <span className="text-[rgba(var(--mg-text),0.9)] text-sm">All systems operational</span>
              </div>
              <div className="text-[rgba(var(--mg-text),0.5)] text-xs mt-4">
                © 2954 AydoCorp. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
} 