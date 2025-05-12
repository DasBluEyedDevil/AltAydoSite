"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const navItems = [
  { name: 'SERVICES', href: '/#services' },
  { name: 'ABOUT', href: '/#about' },
  { name: 'JOIN', href: '/#join' },
  { name: 'CONTACT', href: '/contact' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 w-full z-40 border-b border-[rgba(var(--mg-primary),0.15)] bg-[rgba(0,10,20,0.85)] backdrop-blur-sm mt-0 pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.03 }}
              >
                <motion.span 
                  className="text-xl font-bold font-quantify mg-title"
                  animate={{ 
                    textShadow: ['0 0 6px rgba(var(--mg-primary), 0.5)', '0 0 2px rgba(var(--mg-primary), 0.3)', '0 0 6px rgba(var(--mg-primary), 0.5)']
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  AYDO
                </motion.span>
                <span className="ml-0.5 text-xl font-light text-[rgba(var(--mg-text),0.8)] font-quantify">CORP</span>
                <motion.span 
                  className="absolute -bottom-1 left-0 h-[1px] bg-[rgba(var(--mg-primary),0.5)]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                onHoverStart={() => setActiveItem(item.name)}
                onHoverEnd={() => setActiveItem(null)}
                whileHover={{ x: 2 }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  className="mg-nav-item text-xs tracking-wider font-quantify holo-element rounded-none relative group"
                >
                  <span className="relative inline-block z-10">
                    {item.name}
                    <AnimatePresence>
                      {activeItem === item.name && (
                        <motion.span 
                          className="absolute -bottom-0.5 left-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.8)] to-transparent"
                          initial={{ width: '0%', opacity: 0 }}
                          animate={{ width: '100%', opacity: 1 }}
                          exit={{ width: '0%', opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </AnimatePresence>
                  </span>
                  
                  {/* Animated corner borders */}
                  <motion.span 
                    className="absolute top-0 left-0 w-[6px] h-[6px] border-t border-l border-[rgba(var(--mg-primary),0)]"
                    initial={{ borderColor: 'rgba(var(--mg-primary),0)' }}
                    animate={activeItem === item.name ? { 
                      borderColor: 'rgba(var(--mg-primary),0.8)',
                      boxShadow: '0 0 5px rgba(var(--mg-primary),0.5)'
                    } : {}}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span 
                    className="absolute top-0 right-0 w-[6px] h-[6px] border-t border-r border-[rgba(var(--mg-primary),0)]"
                    initial={{ borderColor: 'rgba(var(--mg-primary),0)' }}
                    animate={activeItem === item.name ? { 
                      borderColor: 'rgba(var(--mg-primary),0.8)',
                      boxShadow: '0 0 5px rgba(var(--mg-primary),0.5)'
                    } : {}}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span 
                    className="absolute bottom-0 left-0 w-[6px] h-[6px] border-b border-l border-[rgba(var(--mg-primary),0)]"
                    initial={{ borderColor: 'rgba(var(--mg-primary),0)' }}
                    animate={activeItem === item.name ? { 
                      borderColor: 'rgba(var(--mg-primary),0.8)',
                      boxShadow: '0 0 5px rgba(var(--mg-primary),0.5)'
                    } : {}}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span 
                    className="absolute bottom-0 right-0 w-[6px] h-[6px] border-b border-r border-[rgba(var(--mg-primary),0)]" 
                    initial={{ borderColor: 'rgba(var(--mg-primary),0)' }}
                    animate={activeItem === item.name ? { 
                      borderColor: 'rgba(var(--mg-primary),0.8)',
                      boxShadow: '0 0 5px rgba(var(--mg-primary),0.5)'
                    } : {}}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.div>
            ))}
            
            <div className="w-px h-5 bg-[rgba(var(--mg-primary),0.2)] mx-1"></div>
            
            {session ? (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mg-highlight"
              >
                <Link
                  href="/dashboard"
                  className="mg-button py-1 px-3 text-xs flex items-center justify-center group"
                >
                  <span className="relative z-10 tracking-wider font-quantify">COMMAND CENTER</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="radar-sweep"></div>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mg-highlight"
              >
                <Link
                  href="/login"
                  className="mg-button py-1 px-3 text-xs flex items-center justify-center group"
                >
                  <span className="relative z-10 tracking-wider font-quantify">LOGIN</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="radar-sweep"></div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="mg-button p-1 w-8 h-8 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <span className="sr-only">Open main menu</span>
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="h-4 w-4 text-[rgba(var(--mg-text),1)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 mg-container backdrop-blur-md border-none mg-glow">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="mg-nav-item block py-1 text-xs font-quantify tracking-wider holo-element relative group"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="relative inline-block z-10">
                      {item.name}
                    </span>
                    
                    {/* Animated corner borders */}
                    <motion.span 
                      className="absolute top-0 left-0 w-[6px] h-[6px] border-t border-l border-[rgba(var(--mg-primary),0.4)]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 + 0.1 }}
                    />
                    <motion.span 
                      className="absolute top-0 right-0 w-[6px] h-[6px] border-t border-r border-[rgba(var(--mg-primary),0.4)]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 + 0.2 }}
                    />
                    <motion.span 
                      className="absolute bottom-0 left-0 w-[6px] h-[6px] border-b border-l border-[rgba(var(--mg-primary),0.4)]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 + 0.3 }}
                    />
                    <motion.span 
                      className="absolute bottom-0 right-0 w-[6px] h-[6px] border-b border-r border-[rgba(var(--mg-primary),0.4)]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 + 0.4 }}
                    />
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: navItems.length * 0.05 }}
              >
                {session ? (
                  <Link
                    href="/dashboard"
                    className="mg-button block w-full text-center mt-4 text-xs font-quantify tracking-wider"
                    onClick={() => setIsOpen(false)}
                  >
                    COMMAND CENTER
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="mg-button block w-full text-center mt-4 text-xs font-quantify tracking-wider"
                    onClick={() => setIsOpen(false)}
                  >
                    LOGIN
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 