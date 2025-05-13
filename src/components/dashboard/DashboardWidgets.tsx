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
  clearanceLevel?: number;
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
  const [clearanceLevel, setClearanceLevel] = useState(1);

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
    
    // Check user clearance level
    if (user?.clearanceLevel) {
      setClearanceLevel(user.clearanceLevel);
    }
    
    // Check if user has admin role
    if (user?.email === "shatteredobsidian@yahoo.com" || user?.clearanceLevel === 3) {
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
  }, [user]);

  // Filter tiles based on clearance level
  const getVisibleTiles = () => {
    // All users can see these tiles
    const level1Tiles = ['communications', 'training', 'certification'];
    
    // Level 2+ users can see these additional tiles
    const level2Tiles = ['aydoexpress', 'empyrion', 'shipmanagement', 'personnel'];
    
    // Level 3 (admin) users can see all tiles
    const level3Tiles = ['organization', 'finance', 'missions', 'regulations', 'resources'];
    
    if (clearanceLevel >= 3 || isAdmin) {
      return tiles; // Show all tiles for admin
    } else if (clearanceLevel >= 2) {
      return tiles.filter(tile => level1Tiles.includes(tile.id) || level2Tiles.includes(tile.id));
    } else {
      return tiles.filter(tile => level1Tiles.includes(tile.id));
    }
  };

  // Filter tiles based on user clearance level
  const filteredTiles = getVisibleTiles();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* User Status Card */}
      <motion.div
        className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isInitialized ? 1 : 0, y: isInitialized ? 0 : 10 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="w-full h-full bg-gradient-to-r from-[rgba(var(--mg-primary),0.3)] to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-sm bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.3)] flex items-center justify-center text-[rgba(var(--mg-primary),0.9)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="mg-subtitle text-xs tracking-wider">WELCOME BACK</div>
                  <div className="mg-title text-lg">{displayName.toUpperCase()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="mg-data-item">
                <div className="mg-subtitle text-xs tracking-wider">CLEARANCE LEVEL</div>
                <div className="mg-value text-lg font-mono">
                  <span className={`font-quantify ${
                    clearanceLevel === 3 ? 'text-green-400' : 
                    clearanceLevel === 2 ? 'text-blue-400' : 
                    'text-gray-400'
                  }`}>
                    {clearanceLevel}
                  </span>
                </div>
              </div>
              
              {/* Existing stats components */}
              {/* ... */}
              
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Dashboard Tiles */}
      {filteredTiles.map((tile, i) => (
        <motion.div
          key={tile.id}
          custom={i}
          variants={tileVariants}
          initial="hidden"
          animate={isInitialized ? "visible" : "hidden"}
          className="col-span-1"
        >
          <Link href={tile.path || '#'}>
            <div className={`mg-panel h-full relative bg-[rgba(var(--mg-panel-dark),0.4)] backdrop-blur-sm overflow-hidden group hover:bg-[rgba(var(--mg-panel-dark),0.6)] transition-all duration-300 ${tile.borderStyle || ''}`}>
              {/* Background Image */}
              {tile.image && (
                <div className="absolute inset-0 overflow-hidden opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <Image 
                    src={tile.image} 
                    alt={tile.title} 
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              {/* Tile Content */}
              <div className="p-5 relative z-10">
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 rounded-sm bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.3)] flex items-center justify-center text-[rgba(var(--mg-primary),0.9)] mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={tile.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mg-subtitle font-quantify tracking-wide text-[rgba(var(--mg-primary),0.9)]">{tile.title}</h3>
                    <div className="text-xs text-[rgba(var(--mg-text),0.7)]">{tile.description}</div>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
      
      {/* Access Denied Message if no tiles available */}
      {filteredTiles.length === 0 && (
        <motion.div
          className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-8 rounded-sm text-center">
            <div className="text-[rgba(var(--mg-error),0.8)] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mg-title text-xl mb-2">ACCESS DENIED</h3>
            <p className="mg-subtitle text-[rgba(var(--mg-text),0.7)]">
              Your clearance level is insufficient. Please contact an administrator for assistance.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}