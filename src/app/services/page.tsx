'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const services = [
  {
    title: 'Cargo Transport & Management',
    description: 'End-to-end cargo transportation services across all major systems, featuring real-time tracking and advanced security protocols.',
    image: '/images/starcitizen-hulla.webp',
  },
  {
    title: 'Executive & Personnel Transit',
    description: 'Premium transportation services with the highest standards of comfort and security for corporate personnel.',
    image: '/images/spacebg.jpg',
  },
  {
    title: 'Supply Chain Solutions',
    description: 'Comprehensive resource acquisition and logistics management tailored to your operational requirements.',
    image: '/images/AydoOffice1.png',
  },
  {
    title: 'Recovery & Assistance',
    description: 'Professional vessel recovery and assistance services, available continuously across all operational sectors.',
    image: '/images/Hull_E.jpg',
  },
  {
    title: 'Strategic Operations',
    description: 'Collaborative ventures and partnerships for complex logistics operations requiring multi-party coordination.',
    image: '/images/logisticsoffice.jpg',
  },
];

export default function Services() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [highlightedService, setHighlightedService] = useState<number | null>(null);
  const [scanMessages, setScanMessages] = useState<string[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning) {
      // Random technical-sounding messages to display during scanning
      const techMessages = [
        "Initializing quantum connection vectors...",
        "Parsing regional server nodes...",
        "Verifying service protocol integrity...",
        "Analyzing sector stability metrics...",
        "Syncing distributed cache partitions...",
        "Monitoring hyperspace bandwidth allocations...",
        "Establishing secure communication channels...",
        "Validating crypto-authentication protocols...",
        "Processing logistical capacity assessment...",
        "Calculating optimal service distribution..."
      ];
      
      // Add initial message
      setScanMessages([techMessages[0]]);
      
      interval = setInterval(() => {
        setScanProgress((prev) => {
          // Add a new message at certain progress points
          if (prev % 20 === 0 && prev < 100) {
            const messageIndex = Math.floor(prev / 10) + 1;
            if (messageIndex < techMessages.length) {
              setScanMessages(current => [...current, techMessages[messageIndex]]);
            }
          }
          
          if (prev >= 100) {
            clearInterval(interval);
            setScanComplete(true);
            setScanMessages(current => [...current, "Scan procedure completed successfully"]);
            return 100;
          }
          return prev + 1;
        });
        
        if (scanProgress < 100) {
          const serviceIndex = Math.floor((scanProgress / 100) * services.length);
          setHighlightedService(serviceIndex < services.length ? serviceIndex : null);
        } else {
          setHighlightedService(null);
        }
      }, 50);
    }
    
    return () => clearInterval(interval);
  }, [isScanning, scanProgress]);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanComplete(false);
    setHighlightedService(null);
    setScanMessages([]);
  };

  const resetScan = () => {
    setIsScanning(false);
    setScanProgress(0);
    setScanComplete(false);
    setHighlightedService(null);
    setScanMessages([]);
  };

  return (
    <>
      {/* Status Bar */}
      <div className="bg-black/80 border-b border-cyan-900/30 py-1 px-4 text-xs text-cyan-400/80 flex justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
          SYSTEM ONLINE
          <span className="text-gray-500 mx-4">|</span>
          USER ACCESS: <span className="text-cyan-400 ml-1">CIVILIAN</span>
        </div>
        <div className="flex items-center gap-2">
          QUANTUM LINK: <span className="text-green-500 ml-1">ACTIVE</span>
          <span className="ml-4 font-mono text-cyan-400/80">03:12 PM</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/starcitizen-hulla.webp"
            alt="AydoCorp Logistics Operations"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
          <div className="absolute inset-0 circuit-bg"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">SERVICE MANIFEST</h1>
            <p className="text-xl text-cyan-500 uppercase tracking-widest mb-4">OPERATIONAL CAPABILITIES</p>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
              Advanced logistics solutions for the modern interstellar enterprise
            </p>
            
            {!isScanning && !scanComplete ? (
              <button
                onClick={startScan}
                className="mx-auto px-8 py-3 bg-transparent border-2 border-cyan-500 text-cyan-400 font-bold rounded hover:bg-cyan-900/30 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  INITIALIZE SERVICE SCAN
                </span>
              </button>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Services Grid with Scan Feature */}
      {(isScanning || scanComplete) && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Advanced Scan Control Interface */}
            <div className="mb-12 p-6 border border-[rgba(var(--mg-primary),0.3)] bg-black/70 relative rounded-lg overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-blue-500/20 to-cyan-500/20"></div>
              
              {/* Decorative grid lines */}
              <div className="absolute inset-0 grid grid-cols-12 gap-4 opacity-20 pointer-events-none">
                {Array(12).fill(0).map((_, i) => (
                  <div key={`grid-col-${i}`} className="h-full w-px bg-cyan-500/30"></div>
                ))}
                {Array(6).fill(0).map((_, i) => (
                  <div key={`grid-row-${i}`} className="w-full h-px bg-cyan-500/30 absolute" style={{ top: `${i * 20}%` }}></div>
                ))}
              </div>
              
              {/* Scanning animation overlay */}
              {isScanning && !scanComplete && (
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="absolute top-0 h-full w-2 bg-cyan-400/30 blur-sm animate-scanline-vertical"
                    style={{ 
                      boxShadow: '0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.2)'
                    }}
                  ></div>
                </div>
              )}
              
              <div className="text-center relative z-10">
                <h3 className="text-2xl font-bold mb-4 text-cyan-400 flex items-center justify-center gap-2">
                  <span className={`inline-block h-3 w-3 rounded-full ${isScanning ? 'bg-cyan-400 animate-pulse' : scanComplete ? 'bg-green-400' : 'bg-gray-600'}`}></span>
                  Service Availability Scanner
                </h3>
                
                {scanComplete ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-green-400 font-bold text-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>SCAN COMPLETE - ALL SERVICES AVAILABLE</span>
                    </div>
                    <button
                      onClick={resetScan}
                      className="px-8 py-3 bg-transparent border-2 border-green-500 text-green-400 font-bold rounded hover:bg-green-900/30 transition-all duration-300"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        RESET SCANNER
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Advanced progress bar */}
                    <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden p-1 border border-cyan-900/50">
                      <div className="relative h-full">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-100"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                        {/* Progress markers */}
                        {[25, 50, 75].map((mark) => (
                          <div 
                            key={mark}
                            className="absolute top-0 bottom-0 w-px bg-gray-100/30"
                            style={{ left: `${mark}%` }}
                          ></div>
                        ))}
                        {/* Percentage indicator */}
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {scanProgress.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-cyan-400 font-mono flex items-center justify-center gap-2">
                      <span className="inline-block h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></span>
                      SCANNING: {scanProgress.toFixed(0)}% COMPLETE
                    </div>
                    
                    {/* Terminal-like message display */}
                    <div className="mt-4 p-3 bg-black/50 border border-cyan-900/50 rounded text-left h-32 overflow-y-auto font-mono text-sm">
                      <div className="flex items-center text-gray-400 mb-2">
                        <span className="text-green-400 mr-2">&gt;&gt;&gt;</span> Scan initialized at {new Date().toLocaleTimeString()}
                      </div>
                      {scanMessages.map((message, idx) => (
                        <div key={idx} className="text-gray-400 ml-4 mb-1">
                          <span className="text-cyan-400 mr-2">&gt;</span> {message}
                        </div>
                      ))}
                      {isScanning && !scanComplete && (
                        <div className="text-gray-400 inline-flex">
                          <span className="text-cyan-400 mr-2">&gt;</span> 
                          <span className="animate-pulse">_</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative group ${highlightedService === index ? 'ring-2 ring-cyan-500 scale-105 z-10' : ''} transition-all duration-300`}
                >
                  <div className="relative h-64 overflow-hidden rounded-lg">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent ${highlightedService === index ? 'bg-blue-900/30' : ''}`} />
                    
                    {/* Service card scan effect */}
                    {highlightedService === index && (
                      <div className="absolute inset-0 overflow-hidden">
                        {/* Horizontal scan line */}
                        <div className="absolute left-0 right-0 h-1 bg-cyan-400/50 blur-sm animate-pulse" 
                          style={{ 
                            top: '50%',
                            boxShadow: '0 0 10px rgba(34, 211, 238, 0.5), 0 0 20px rgba(34, 211, 238, 0.3)'
                          }}>
                        </div>
                        {/* Corner marker dots */}
                        <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-cyan-400 animate-ping"></div>
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-cyan-400 animate-ping" style={{ animationDelay: '0.3s' }}></div>
                        <div className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-cyan-400 animate-ping" style={{ animationDelay: '0.8s' }}></div>
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className={`text-2xl font-bold mb-2 ${highlightedService === index ? 'text-cyan-400' : ''}`}>{service.title}</h3>
                      <p className="text-gray-300">{service.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mg-container p-8 border border-[rgba(var(--mg-primary),0.3)] relative overflow-hidden"
          >
            {/* Content with futuristic design */}
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Submit your service request and let our team handle your logistics requirements with unmatched efficiency and reliability.
              </p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSekyn2ZhdU9czvQrcLSpo1b0wIzRX__DxLFk89L4Y0NZ8FiwQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-3 border border-cyan-500 text-base font-medium rounded-md text-white bg-transparent hover:bg-cyan-900/30 transition-all duration-300 group relative overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                <span className="relative z-10">Submit Service Request</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
} 