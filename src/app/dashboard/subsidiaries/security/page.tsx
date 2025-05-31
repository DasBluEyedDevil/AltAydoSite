'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function MidnightSecurityPage() {
  return (
    <div className="min-h-screen bg-black bg-opacity-95 p-6 relative">
      {/* Holographic background effects */}
      <div className="absolute inset-0 bg-holo-grid bg-[length:50px_50px] opacity-5 pointer-events-none"></div>
      <div className="hexagon-bg absolute inset-0 opacity-5 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard/subsidiaries" className="inline-flex items-center text-sm text-[rgba(var(--mg-text),0.7)] hover:text-[rgba(var(--mg-primary),0.9)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Subsidiaries
          </Link>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center"
        >
          <div className="h-16 w-16 relative mr-4">
            <Image 
              src="/images/Aydo_Corp_logo_employees.png" 
              alt="Midnight Security Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="mg-title text-2xl sm:text-3xl lg:text-4xl mb-2">Midnight Security</h1>
            <div className="text-[rgba(var(--mg-primary),0.8)] font-quantify">&ldquo;Protecting Assets, Ensuring Future.&rdquo;</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-sm relative mb-8"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(120,140,180,0.6)] to-transparent"></div>
          
          <h2 className="mg-subtitle text-xl mb-6">Overview</h2>
          
          <div className="mg-text space-y-6">
            <p>
              Midnight Security is AydoCorp&apos;s internal security and risk management division. Founded in 2951 as the corporation expanded its operations into more contested regions, Midnight Security has evolved from a small team of hired guards into a professional security force responsible for protecting all AydoCorp assets, personnel, and operations across the universe.
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-sm relative mb-8"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(120,140,180,0.6)] to-transparent"></div>
          
          <h2 className="mg-subtitle text-xl mb-6">Lore Summary</h2>
          
          <div className="mg-text space-y-6">
            <p>
              Midnight Security began as a necessary response to increased pirate activity in sectors where AydoExpress was conducting regular operations. After several costly raids on company transports, CEO Christoff Revan authorized the formation of a dedicated security division with former UEE Navy Lieutenant Commander Elena Kresh at its helm.
            </p>
            
            <p>
              Under Kresh&apos;s leadership, Midnight Security has grown from a reactive defense force into a proactive security organization that provides comprehensive protection for all AydoCorp subsidiaries. Their operations include convoy protection, installation security, threat assessment, and emergency response protocols.
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-sm relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(120,140,180,0.6)] to-transparent"></div>
          
          <h2 className="mg-subtitle text-xl mb-6">Operations Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ul className="space-y-3">
                {[
                  "Convoy escort and protection",
                  "Asset and installation security",
                  "Threat assessment and intelligence",
                  "Personnel protection",
                  "Emergency response and evacuation"
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                    className="flex items-start"
                  >
                    <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center bg-[rgba(120,140,180,0.2)] rounded-full mr-3 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-[rgba(120,140,180,0.8)]"></div>
                    </div>
                    <span className="mg-text">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="mg-subtitle text-lg mb-4">Fleet Includes</h3>
              <p className="mg-text">
                Redeemer, Cutlass Black, Vanguard Sentinel, Gladius, and other combat-focused ships for escort and response duties.
              </p>
            </div>
          </div>
          
          {/* Animated data stream */}
          <div className="absolute inset-x-0 bottom-0 h-px">
            <motion.div 
              className="h-full bg-gradient-to-r from-transparent via-[rgba(120,140,180,0.8)] to-transparent"
              animate={{ 
                x: ['-100%', '100%'] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        </motion.div>
        
        <div className="mt-6 text-center text-xs text-[rgba(var(--mg-text),0.6)]">
          AYDO INTERGALACTIC CORPORATION - SUBSIDIARIES
        </div>
      </div>
    </div>
  );
} 