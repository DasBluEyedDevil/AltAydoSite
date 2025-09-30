"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import MobiGlasButton from '@/components/ui/mobiglas/MobiGlasButton';

const navItems = [
  { name: 'SERVICES', href: '/services' },
  { name: 'ABOUT', href: '/about' },
  { name: 'JOIN', href: '/join' },
  { name: 'CONTACT', href: '/contact' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 w-full z-40 border-b border-[rgba(var(--mg-primary),0.15)] bg-[rgba(0,10,20,0.85)] backdrop-blur-sm mt-0 pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href="/" className="flex items-center justify-center group">
              <motion.div 
                className="relative flex items-center justify-center"
                whileHover={{ scale: 1.03 }}
              >
                <Image
                  src="https://images.aydocorp.space/1758036690228.png"
                  alt="AydoCorp"
                  width={48}
                  height={48}
                  className="h-12 w-auto"
                />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <MobiGlasButton
                  variant="ghost"
                  size="sm"
                  className="text-xs tracking-wider font-quantify"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ x: 2 }}
                >
                  {item.name}
                </MobiGlasButton>
              </Link>
            ))}
            
            <div className="w-px h-5 bg-[rgba(var(--mg-primary),0.2)] mx-1"></div>
            
            {session ? (
              <div className="flex space-x-1 items-center">
                <Link href="/dashboard">
                  <MobiGlasButton
                    variant="primary"
                    size="sm"
                    className="text-xs tracking-wider font-quantify"
                    withScanline
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    EMPLOYEE PORTAL
                  </MobiGlasButton>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <MobiGlasButton
                  variant="primary"
                  size="sm"
                  className="text-xs tracking-wider font-quantify"
                  withScanline
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  LOGIN
                </MobiGlasButton>
              </Link>
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
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    <MobiGlasButton
                      variant="ghost"
                      size="sm"
                      fullWidth
                      className="text-xs font-quantify tracking-wider"
                      withCorners
                    >
                      {item.name}
                    </MobiGlasButton>
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: navItems.length * 0.05 }}
              >
                {session ? (
                  <div className="space-y-2">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <MobiGlasButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        className="text-xs font-quantify tracking-wider"
                        withScanline
                      >
                        EMPLOYEE PORTAL
                      </MobiGlasButton>
                    </Link>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <MobiGlasButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      className="text-xs font-quantify tracking-wider mt-4"
                      withScanline
                    >
                      LOGIN
                    </MobiGlasButton>
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