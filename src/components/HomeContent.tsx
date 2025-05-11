"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface HomeContentProps {
  isLoggedIn: boolean;
  userName?: string;
}

export default function HomeContent({ isLoggedIn, userName }: HomeContentProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState({
    integrity: 98.7,
    quantumLink: 100,
    security: isLoggedIn ? 100 : 50,
  });
  const [time, setTime] = useState(new Date());

  // Animation for system scan effect
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Update clock
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Simulate system scan
  const initiateSystemScan = () => {
    if (scanning) return;
    
    setScanning(true);
    
    // Simulate scan progress
    const origIntegrity = systemStatus.integrity;
    const origQuant = systemStatus.quantumLink;
    const origSec = systemStatus.security;
    
    // Reset values temporarily
    setSystemStatus({
      integrity: 0,
      quantumLink: 0,
      security: 0
    });
    
    // Animate them back up with delays
    setTimeout(() => {
      setSystemStatus(prev => ({ ...prev, integrity: origIntegrity/2 }));
      
      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, integrity: origIntegrity, quantumLink: origQuant/2 }));
        
        setTimeout(() => {
          setSystemStatus(prev => ({ ...prev, quantumLink: origQuant, security: origSec/2 }));
          
          setTimeout(() => {
            setSystemStatus({ integrity: origIntegrity, quantumLink: origQuant, security: origSec });
            setScanning(false);
          }, 400);
        }, 300);
      }, 300);
    }, 300);
  };

  // Calculate parallax movement based on mouse position
  const calculateParallax = (depth: number = 1) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const moveX = (mousePosition.x - centerX) / centerX * 10 * depth;
    const moveY = (mousePosition.y - centerY) / centerY * 6 * depth;
    
    return { x: moveX, y: moveY };
  };

  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[90vh] flex flex-col items-center justify-center py-8 overflow-hidden"
    >
      {/* System clock */}
      <div className="fixed top-24 right-6 z-30">
        <div className="mg-container p-2 text-sm">
          <div className="mg-flicker text-[rgba(var(--mg-primary),0.9)]">
            {time.toLocaleTimeString()} | {time.toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {/* Main holographic display */}
      <div className="relative z-20 container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-6xl mx-auto"
        >
          <div className="mg-container relative overflow-hidden border-[rgba(var(--mg-primary),0.2)]">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="mg-grid-bg"></div>
              <div className="holo-noise"></div>
              <div className="holo-scan"></div>
              <div className="line-noise"></div>
            </div>
            
            {/* Minimal corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-[rgba(var(--mg-primary),0.6)]"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-[rgba(var(--mg-primary),0.6)]"></div>
            
            {/* Content */}
            <div className="relative z-10 p-4">
              {!isLoggedIn ? (
                <div className="py-8">
                  {/* Top header section */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ 
                      x: calculateParallax(0.3).x,
                      y: calculateParallax(0.3).y 
                    }}
                    className="text-center mb-8"
                  >
                    <div className="inline-block">
                      <h1 className="mg-title text-4xl md:text-5xl mb-2 tracking-wider">
                        AYDO<span className="opacity-80">CORP</span>
                      </h1>
                      
                      <div className="mg-subtitle text-base md:text-lg opacity-90 tracking-widest">
                        <span className="mg-flicker">MOBIGLASS INTERFACE</span>
                        <span className="ml-2 opacity-60 text-xs">[v3.9.4]</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Main interface */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Left system panel */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="col-span-12 md:col-span-3"
                    >
                      <div className="mg-container p-2 h-full relative">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div className="radar-sweep opacity-5"></div>
                        </div>
                        
                        <div className="mg-header text-xs text-center">
                          <div className="mg-subtitle">SYSTEM STATUS</div>
                        </div>
                        
                        <div className="p-3 space-y-4">
                          <motion.button 
                            onClick={initiateSystemScan}
                            disabled={scanning}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="mg-button text-xs w-full flex items-center justify-center"
                          >
                            <div className={`w-2 h-2 ${scanning ? 'bg-[rgba(var(--mg-warning),1)] animate-pulse' : 'bg-[rgba(var(--mg-primary),0.8)]'} rounded-full mr-2`}></div>
                            {scanning ? 'SCANNING...' : 'INITIALIZE SCAN'}
                          </motion.button>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-[rgba(var(--mg-text),0.7)]">INTEGRITY</span>
                              <span className="text-[rgba(var(--mg-primary),1)]">{systemStatus.integrity.toFixed(1)}%</span>
                            </div>
                            <motion.div 
                              className="w-full bg-[rgba(var(--mg-primary),0.1)] h-1"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div 
                                className="bg-[rgba(var(--mg-primary),0.8)] h-1" 
                                initial={{ width: 0 }}
                                animate={{ width: `${systemStatus.integrity}%` }}
                                transition={{ duration: 0.5 }}
                              ></motion.div>
                            </motion.div>
                            
                            <div className="flex justify-between text-xs mt-3">
                              <span className="text-[rgba(var(--mg-text),0.7)]">QUANTUM LINK</span>
                              <span className="text-[rgba(var(--mg-success),1)]">{systemStatus.quantumLink}%</span>
                            </div>
                            <motion.div 
                              className="w-full bg-[rgba(var(--mg-primary),0.1)] h-1"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <motion.div 
                                className="bg-[rgba(var(--mg-success),0.8)] h-1" 
                                initial={{ width: 0 }}
                                animate={{ width: `${systemStatus.quantumLink}%` }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                              ></motion.div>
                            </motion.div>
                            
                            <div className="flex justify-between text-xs mt-3">
                              <span className="text-[rgba(var(--mg-text),0.7)]">SECURITY</span>
                              <span className="text-[rgba(var(--mg-warning),1)]">
                                {systemStatus.security < 100 ? 'AUTH REQ' : 'SECURE'}
                              </span>
                            </div>
                            <motion.div 
                              className="w-full bg-[rgba(var(--mg-primary),0.1)] h-1"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              <motion.div 
                                className="bg-[rgba(var(--mg-warning),0.8)] h-1" 
                                initial={{ width: 0 }}
                                animate={{ width: `${systemStatus.security}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                              ></motion.div>
                            </motion.div>
                            
                            <div className="text-[rgba(var(--mg-text),0.4)] text-[10px] mt-4 mg-flicker">
                              SYS ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Central terminal */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      style={{ 
                        x: calculateParallax(0.2).x,
                        y: calculateParallax(0.2).y 
                      }}
                      className="col-span-12 md:col-span-6 relative"
                    >
                      <div className="mg-container h-full">
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <div className="hexagon-bg opacity-5"></div>
                        </div>
                        
                        <div className="p-6 flex flex-col items-center justify-center">
                          <motion.div 
                            className="w-32 h-32 md:w-40 md:h-40 relative mb-6"
                            animate={{ 
                              boxShadow: ['0 0 10px rgba(var(--mg-primary), 0.3)', '0 0 20px rgba(var(--mg-primary), 0.5)', '0 0 10px rgba(var(--mg-primary), 0.3)']
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity,
                              ease: "easeInOut" 
                            }}
                          >
                            <div className="absolute inset-0 border-2 border-[rgba(var(--mg-primary),0.3)] flex items-center justify-center overflow-hidden rounded-full">
                              <div className="radar-sweep"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-[rgba(var(--mg-primary),1)]">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                          
                          <div className="mg-text text-sm mb-6 text-center max-w-md">
                            <div className="mg-subtitle mb-2">BIOMETRIC VERIFICATION REQUIRED</div>
                            <p className="text-xs leading-relaxed text-[rgba(var(--mg-text),0.7)]">
                              Mobiglass interface requires secure authentication. All activities are logged and monitored.
                            </p>
                          </div>
                          
                          <div className="w-full max-w-xs space-y-3">
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                              <Link 
                                href="/auth/login" 
                                className="mg-button block w-full text-center group"
                              >
                                <div className="radar-sweep opacity-0 group-hover:opacity-20"></div>
                                ACCESS TERMINAL
                              </Link>
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                              <Link 
                                href="/auth/login?screen_hint=signup" 
                                className="mg-button block w-full text-center"
                              >
                                REGISTER NEW IMPLANT
                              </Link>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Right system menu */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="col-span-12 md:col-span-3"
                    >
                      <div className="mg-container h-full">
                        <div className="mg-header text-xs text-center">
                          <div className="mg-subtitle">NAVIGATION</div>
                        </div>
                        
                        <div className="p-3">
                          <ul className="space-y-2">
                            {[
                              { title: 'ABOUT US', path: '/about', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                              { title: 'SERVICES', path: '/services', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
                              { title: 'JOIN US', path: '/join', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
                              { title: 'CONTACT', path: '/contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
                            ].map((item, idx) => (
                              <li key={idx}>
                                <motion.div 
                                  whileHover={{ x: 3 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Link 
                                    href={item.path} 
                                    className="mg-nav-item text-xs flex items-center py-2 holo-element"
                                    onMouseEnter={() => setActivePanel(item.title)}
                                    onMouseLeave={() => setActivePanel(null)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-[rgba(var(--mg-primary),0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={item.icon} />
                                    </svg>
                                    <span className="relative">
                                      {item.title}
                                      <AnimatePresence>
                                        {activePanel === item.title && (
                                          <motion.span
                                            className="absolute -bottom-1 left-0 h-px bg-[rgba(var(--mg-primary),0.8)]"
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            exit={{ width: '0%' }}
                                            transition={{ duration: 0.2 }}
                                          ></motion.span>
                                        )}
                                      </AnimatePresence>
                                    </span>
                                  </Link>
                                </motion.div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  {/* Logged in view */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                  >
                    <h1 className="mg-title text-3xl md:text-4xl mb-1">WELCOME, COMMANDER</h1>
                    <div className="mg-subtitle text-lg mb-2 opacity-90">{userName}</div>
                    
                    <motion.div 
                      className="mg-container inline-block px-5 py-2 my-2"
                      animate={{ 
                        boxShadow: ['0 0 5px rgba(var(--mg-success), 0.3)', '0 0 15px rgba(var(--mg-success), 0.5)', '0 0 5px rgba(var(--mg-success), 0.3)']
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                    >
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-[rgba(var(--mg-success),1)] rounded-full mr-2 animate-pulse"></div>
                        <span className="mg-text">ACCESS GRANTED • LEVEL 4</span>
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Link
                      href="/dashboard"
                      className="mg-container p-4 hover:shadow-mg transition-all duration-300 group"
                    >
                      <div className="mg-header text-center text-xs">
                        <h3 className="mg-subtitle">COMMAND CENTER</h3>
                      </div>
                      <div className="p-4 text-center">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 flex items-center justify-center relative">
                            <div className="absolute inset-0 radar-sweep opacity-0 group-hover:opacity-30"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[rgba(var(--mg-primary),0.9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 17V7m0 0L3 12m6-5l6 5M15 7v10m0 0l6-5m-6 5l-6-5" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-3 mg-text text-xs">Operations Access</div>
                      </div>
                    </Link>
                    
                    <Link
                      href="/api/auth/logout"
                      className="mg-container p-4 hover:shadow-mg transition-all duration-300 group"
                    >
                      <div className="mg-header text-center text-xs">
                        <h3 className="mg-subtitle">SECURE LOGOUT</h3>
                      </div>
                      <div className="p-4 text-center">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 flex items-center justify-center relative">
                            <div className="absolute inset-0 radar-sweep opacity-0 group-hover:opacity-30"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[rgba(var(--mg-warning),0.9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-3 mg-text text-xs">End Session</div>
                      </div>
                    </Link>
                    
                    <motion.div 
                      className="mg-container p-4 col-span-2 md:col-span-1"
                      animate={{ 
                        boxShadow: ['0 0 10px rgba(var(--mg-primary), 0.1)', '0 0 15px rgba(var(--mg-primary), 0.2)', '0 0 10px rgba(var(--mg-primary), 0.1)']
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="mg-header text-center text-xs">
                        <h3 className="mg-subtitle">SYSTEM STATUS</h3>
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-[rgba(var(--mg-text),0.7)]">System</span>
                          <span className="text-[rgba(var(--mg-success),1)]">ONLINE</span>
                        </div>
                        <div className="w-full bg-[rgba(var(--mg-primary),0.1)] h-px">
                          <motion.div 
                            className="bg-[rgba(var(--mg-success),0.8)] h-px" 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.8 }}
                          ></motion.div>
                        </div>
                        
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-[rgba(var(--mg-text),0.7)]">Connection</span>
                          <span className="text-[rgba(var(--mg-primary),1)]">SECURE</span>
                        </div>
                        <div className="w-full bg-[rgba(var(--mg-primary),0.1)] h-px">
                          <motion.div 
                            className="bg-[rgba(var(--mg-primary),0.8)] h-px" 
                            initial={{ width: 0 }}
                            animate={{ width: '92%' }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          ></motion.div>
                        </div>
                        
                        <div className="text-[rgba(var(--mg-text),0.4)] text-[10px] mt-3 mg-flicker">
                          SESSION ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 