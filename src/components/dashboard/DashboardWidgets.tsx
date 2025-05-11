'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Animation variants for tiles
const tileVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  })
};

interface UserData {
  name?: string;
  email?: string;
  picture?: string;
}

interface DashboardWidgetsProps {
  user?: UserData;
}

interface TileData {
  id: string;
  title: string;
  icon: string;
  color: string;
  size?: 'normal' | 'large';
  path?: string;
  description?: string;
  borderStyle?: string;
  category?: 'subsidiary' | 'corporate' | 'training' | 'navigation';
  image?: string;
}

export default function DashboardWidgets({ user }: DashboardWidgetsProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Get username from email - handle special cases
  const getUsernameFromEmail = (email: string | undefined): string => {
    if (!email) return "EMPLOYEE";
    
    // Special case for shatteredobsidian@yahoo.com
    if (email === "shatteredobsidian@yahoo.com") return "Devil";
    
    // Extract username part before @ symbol
    const username = email.split('@')[0];
    
    // Try to extract a name-like part from the username
    // This handles cases like "john.doe" or "john_doe" or "johndoe123"
    const nameParts = username.split(/[._-]/);
    if (nameParts.length > 1) {
      // Use the last part if there are multiple parts (e.g., john.doe -> doe)
      const lastPart = nameParts[nameParts.length - 1];
      // Capitalize first letter
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }
    
    // If no separators, just use the username and capitalize it
    return username.charAt(0).toUpperCase() + username.slice(1).replace(/[0-9]/g, '');
  };
  
  const displayName = getUsernameFromEmail(user?.email);
  
  // Keep existing state variables
  const [balance, setBalance] = useState("260,000");
  const [reputation, setReputation] = useState(14);
  const [days, setDays] = useState(37);
  const [hours, setHours] = useState(51);
  const [shipStatus, setShipStatus] = useState(94);
  const [shield, setShield] = useState(98);
  const [health, setHealth] = useState(83);
  const [oxygen, setOxygen] = useState(45);
  const [fuel, setFuel] = useState(78);
  const [thrust, setThrust] = useState(95);
  const [ammo, setAmmo] = useState(4);
  const [cpu, setCpu] = useState(61);
  
  // Define tiles aligned with AydoCorp's organizational structure
  const tiles: TileData[] = [
    {
      id: 'aydoexpress',
      title: 'AYDO EXPRESS',
      description: 'Logistics & Cargo',
      icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
      color: 'rgba(0, 210, 255, 0.8)',
      borderStyle: 'border-t-2 border-r border-b border-l-2',
      category: 'subsidiary',
      path: '/subsidiaries/express',
      image: '/images/Aydo_Express.png'
    },
    {
      id: 'empyrion',
      title: 'EMPYRION INDUSTRIES',
      description: 'Mining & Salvage',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'rgba(200, 220, 255, 0.8)',
      borderStyle: 'border-t border-r-2 border-b-2 border-l',
      category: 'subsidiary',
      path: '/subsidiaries/empyrion',
      image: '/images/Empyrion_Industries.png'
    },
    {
      id: 'organization',
      title: 'ORGANIZATION MANAGER',
      description: 'Ranks & Structure',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'rgba(0, 230, 255, 0.8)',
      borderStyle: 'border-t-2 border-r-2 border-b border-l-2',
      category: 'corporate',
      path: '/organization',
      image: '/images/aydocorp-logo.png'
    },
    {
      id: 'training',
      title: 'TRAINING COURSES',
      description: 'Intern & Employee',
      icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
      color: 'rgba(0, 190, 255, 0.8)',
      borderStyle: 'border-t border-r-2 border-b-2 border-l',
      category: 'training',
      path: '/training',
      image: '/images/Aydo_Corp_logo_employees.png'
    },
    {
      id: 'finance',
      title: 'FINANCE & ACCOUNTING',
      description: 'Salary & Earnings',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'rgba(140, 200, 255, 0.8)',
      borderStyle: 'border-t-2 border-r border-b border-l',
      category: 'corporate',
      path: '/finance',
      image: '/images/Aydo_Corp_logo_Gold.png'
    },
    {
      id: 'missions',
      title: 'MISSION MANAGEMENT',
      description: 'Operations & Events',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'rgba(0, 180, 255, 0.8)',
      borderStyle: 'border-t border-r border-b-2 border-l-2',
      category: 'corporate',
      path: '/missions',
      image: '/images/Aydo_Corp_logo_Silver.png'
    },
    {
      id: 'certification',
      title: 'CERTIFICATIONS',
      description: 'Skills & Specialties',
      icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'rgba(100, 220, 255, 0.8)',
      borderStyle: 'border-t border-r-2 border-b border-l-2',
      category: 'training',
      path: '/certifications',
      image: '/images/Board_member_tag.png'
    },
    {
      id: 'resources',
      title: 'RESOURCE MANAGEMENT',
      description: 'Inventory & Assets',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10l-8-4m8 4v10l-8 4m8 4l8-4',
      color: 'rgba(60, 180, 255, 0.8)',
      borderStyle: 'border-t-2 border-r border-b-2 border-l',
      category: 'corporate',
      path: '/resources',
      image: '/images/logisticsoffice.jpg'
    },
    {
      id: 'personnel',
      title: 'PERSONNEL DATABASE',
      description: 'Member Profiles',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      color: 'rgba(0, 200, 255, 0.8)',
      borderStyle: 'border-t border-r border-b border-l-2',
      category: 'corporate',
      path: '/personnel',
      image: '/images/Aydo_Corp_3x3k_RSI.png'
    },
    {
      id: 'communications',
      title: 'COMMUNICATIONS',
      description: 'Messages & Alerts',
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      color: 'rgba(120, 210, 255, 0.8)',
      borderStyle: 'border-t-2 border-r-2 border-b border-l',
      category: 'navigation',
      path: '/communications',
      image: '/images/RSI_AYDO_Corp_image.png'
    },
    {
      id: 'shipmanagement',
      title: 'SHIP MANAGEMENT',
      description: 'Fleet & Operations',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      color: 'rgba(80, 190, 255, 0.8)',
      borderStyle: 'border-t border-r border-b-2 border-l',
      category: 'navigation',
      path: '/ships',
      image: '/images/Hull_E.jpg'
    },
    {
      id: 'regulations',
      title: 'REGULATIONS & POLICIES',
      description: 'Guidelines & Rules',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'rgba(0, 160, 230, 0.8)',
      borderStyle: 'border-t border-r-2 border-b border-l',
      category: 'corporate',
      path: '/regulations',
      image: '/images/Aydo_Corp_logo_rel_gray_black.png'
    },
  ];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 300);
    
    // Check if user has admin role (will be properly implemented with Auth0 integration)
    // For now, we'll add a placeholder check for the demo
    if (user?.email === "shatteredobsidian@yahoo.com") {
      setIsAdmin(true);
    }
    
    // Update random stats every 5 seconds to simulate changing data
    const statsTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        setCpu(Math.floor(Math.random() * 20) + 50);
        setShipStatus(Math.floor(Math.random() * 10) + 90);
        setShield(Math.floor(Math.random() * 10) + 90);
        setFuel(Math.floor(Math.random() * 20) + 70);
        setOxygen(Math.floor(Math.random() * 20) + 40);
        setHours(prevHours => (prevHours + 1) % 60);
      }
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(statsTimer);
    };
  }, [user?.email]);  // Added user?.email as dependency
  
  return (
    <div className="relative">
      {/* Top Status Bar */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="text-xs text-gray-400 font-['Quantify']">SYSTEM STATUS: ONLINE</div>
        <div className="text-xs text-gray-400 font-['Quantify'] flex items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-2 animate-pulse"></div>
          SECURE CONNECTION
        </div>
      </div>
      
      {/* User Info Section */}
      <div className="relative mb-5">
        {/* Centered Logo - Positioned absolutely to break from parent height constraints */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 mt-1.5">
          <img 
            src="/images/Aydo_Corp_3x3k_RSI.png" 
            alt="AydoCorp" 
            className="h-48 object-contain"
            style={{ filter: 'drop-shadow(0 0 14px rgba(0, 180, 230, 0.8))' }} 
          />
        </div>
        
        {/* User info and rank info container - reduced height */}
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center">
            <div className="relative w-14 h-14 mr-3">
              <div className="absolute inset-0 rounded-full border-2 border-[rgba(var(--mg-primary),0.4)] flex items-center justify-center overflow-hidden">
                <Image 
                  src={user?.picture || "/images/aydocorp-logo-small.png"} 
                  alt="User" 
                  width={56} 
                  height={56}
                  className="rounded-full"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">WELCOME</div>
              <div className="text-base font-light text-[rgba(var(--mg-primary),1)]">{displayName}</div>
            </div>
          </div>

          {/* Empty div for centering - to ensure logo stays centered */}
          <div className="flex-grow"></div>

          <div className="text-right">
            <div className="flex justify-end items-center text-xs mb-1">
              <span className="text-gray-400 mr-1.5 font-['Quantify']">RANK</span>
              <span className="text-[rgba(var(--mg-primary),0.9)]">SENIOR EMPLOYEE</span>
            </div>
            <div className="flex justify-end items-center text-xs mb-1">
              <span className="text-gray-400 mr-1.5 font-['Quantify']">DIVISION</span>
              <span className="text-[rgba(var(--mg-primary),0.9)]">AYDO EXPRESS</span>
            </div>
            <div className="flex justify-end items-center text-xs">
              <span className="text-gray-400 mr-1.5 font-['Quantify']">CLEARANCE</span>
              <span className="text-[rgba(var(--mg-primary),0.9)]">LEVEL 3</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subsidiaries Section */}
      <div className="mb-6">
        <h2 className="text-lg text-[rgba(var(--mg-primary),1)] font-['Quantify'] mb-4 pb-1 border-b border-[rgba(var(--mg-primary),0.3)]">
          ORGANIZATION SUBSIDIARIES
          <div className="float-right text-xs text-gray-400 mt-1">CLEARANCE LEVEL 3 REQUIRED</div>
        </h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          {tiles
            .filter(tile => tile.category === 'subsidiary')
            .map((tile, index) => (
              <motion.div
                key={tile.id}
                custom={index}
                initial="hidden"
                animate={isInitialized ? "visible" : "hidden"}
                variants={tileVariants}
                className="relative"
              >
                <Link href={tile.path || "#"} className="block">
                  <div 
                    className={`flex flex-col h-44 rounded bg-black/40 border-l-2 border-r-2 border-t border-b border-[rgba(var(--mg-primary),0.3)] backdrop-blur-sm hover:bg-[rgba(var(--mg-primary),0.15)] transition-colors cursor-pointer hover:shadow-lg group`}
                    style={{ boxShadow: `0 0 15px 0 ${tile.color.replace('0.8', '0.15')}` }}
                  >
                    {/* Top header bar with glow effect */}
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.8)] to-transparent"></div>
                    
                    <div className="flex items-start justify-between p-3">
                      <div>
                        <div className="text-sm font-medium text-[rgba(var(--mg-primary),1)] tracking-wider mb-1 font-['Quantify']">
                          {tile.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {tile.description}
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 border border-[rgba(var(--mg-primary),0.2)] group-hover:border-[rgba(var(--mg-primary),0.5)] transition-colors">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="w-6 h-6" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke={tile.color}
                          strokeWidth={1.2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={tile.icon} />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex-grow flex items-end justify-center relative p-3">
                      {/* Decorative grid lines */}
                      <div className="absolute inset-0 grid grid-cols-8 gap-px pointer-events-none opacity-20">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div key={i} className="border-t border-l border-[rgba(var(--mg-primary),0.5)]"></div>
                        ))}
                      </div>
                      
                      {tile.image && (
                        <div className="relative h-24 w-full opacity-80 hover:opacity-100 transition-opacity z-10">
                          <Image
                            src={tile.image}
                            alt={tile.title}
                            width={120}
                            height={70}
                            className="object-contain mx-auto hologram-projection"
                            unoptimized
                          />
                        </div>
                      )}
                      
                      {/* Status indicator */}
                      <div className="absolute bottom-2 right-2 flex items-center text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-1 animate-pulse"></div>
                        <span className="text-gray-400">OPERATIONAL</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>
      </div>
      
      {/* Corporate Section */}
      <div className="mb-6">
        <h2 className="text-lg text-[rgba(var(--mg-primary),1)] font-['Quantify'] mb-4 pb-1 border-b border-[rgba(var(--mg-primary),0.3)]">
          CORPORATE MANAGEMENT
          <div className="float-right text-xs text-gray-400 mt-1">CLEARANCE LEVEL 2 REQUIRED</div>
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {tiles
            .filter(tile => tile.category === 'corporate')
            .map((tile, index) => (
              <motion.div
                key={tile.id}
                custom={index}
                initial="hidden"
                animate={isInitialized ? "visible" : "hidden"}
                variants={tileVariants}
                className="relative"
              >
                <Link href={tile.path || "#"} className="block">
                  <div 
                    className={`flex flex-col h-40 rounded bg-black/40 border border-t-2 border-[rgba(var(--mg-primary),0.3)] backdrop-blur-sm hover:bg-[rgba(var(--mg-primary),0.15)] transition-colors cursor-pointer hover:shadow-lg group`}
                    style={{ boxShadow: `0 0 15px 0 ${tile.color.replace('0.8', '0.15')}` }}
                  >
                    <div className="flex items-start justify-between p-3">
                      <div>
                        <div className="text-sm font-medium text-[rgba(var(--mg-primary),1)] tracking-wider mb-1 font-['Quantify']">
                          {tile.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {tile.description}
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-[rgba(var(--mg-primary),0.2)] group-hover:border-[rgba(var(--mg-primary),0.5)] transition-colors">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="w-5 h-5" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke={tile.color}
                          strokeWidth={1.2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={tile.icon} />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex-grow flex items-end justify-center relative p-2">
                      {/* Decorative grid lines */}
                      <div className="absolute inset-0 grid grid-cols-8 gap-px pointer-events-none opacity-20">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="border-t border-l border-[rgba(var(--mg-primary),0.5)]"></div>
                        ))}
                      </div>
                      
                      {tile.image && (
                        <div className="relative h-20 w-full opacity-80 hover:opacity-100 transition-opacity z-10">
                          <Image
                            src={tile.image}
                            alt={tile.title}
                            width={80}
                            height={50}
                            className="object-contain mx-auto hologram-projection"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom accent line */}
                    <div className="h-1 w-full bg-gradient-to-r from-[rgba(var(--mg-primary),0.1)] via-[rgba(var(--mg-primary),0.4)] to-[rgba(var(--mg-primary),0.1)]"></div>
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>
      </div>
      
      {/* Training & Navigation */}
      <div className="mb-6">
        <h2 className="text-lg text-[rgba(var(--mg-primary),1)] font-['Quantify'] mb-4 pb-1 border-b border-[rgba(var(--mg-primary),0.3)]">
          TRAINING & OPERATIONS
          <div className="float-right text-xs text-gray-400 mt-1">CLEARANCE LEVEL 1 REQUIRED</div>
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {tiles
            .filter(tile => tile.category === 'training' || tile.category === 'navigation')
            .map((tile, index) => (
              <motion.div
                key={tile.id}
                custom={index}
                initial="hidden"
                animate={isInitialized ? "visible" : "hidden"}
                variants={tileVariants}
                className="relative"
              >
                <Link href={tile.path || "#"} className="block">
                  <div 
                    className={`flex flex-col h-40 rounded bg-black/40 border-b-2 border-r border-[rgba(var(--mg-primary),0.3)] backdrop-blur-sm hover:bg-[rgba(var(--mg-primary),0.15)] transition-colors cursor-pointer hover:shadow-lg group`}
                    style={{ boxShadow: `0 0 15px 0 ${tile.color.replace('0.8', '0.15')}` }}
                  >
                    <div className="flex items-start justify-between p-3">
                      <div>
                        <div className="text-sm font-medium text-[rgba(var(--mg-primary),1)] tracking-wider mb-1 font-['Quantify']">
                          {tile.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {tile.description}
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-[rgba(var(--mg-primary),0.2)] group-hover:border-[rgba(var(--mg-primary),0.5)] transition-colors">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="w-5 h-5" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke={tile.color}
                          strokeWidth={1.2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d={tile.icon} />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex-grow flex items-end justify-center relative p-2">
                      {/* Decorative grid lines */}
                      <div className="absolute inset-0 grid grid-cols-8 gap-px pointer-events-none opacity-20">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="border-t border-l border-[rgba(var(--mg-primary),0.5)]"></div>
                        ))}
                      </div>
                      
                      {tile.image && (
                        <div className="relative h-20 w-full opacity-80 hover:opacity-100 transition-opacity z-10">
                          <Image
                            src={tile.image}
                            alt={tile.title}
                            width={80}
                            height={50}
                            className="object-contain mx-auto hologram-projection"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}