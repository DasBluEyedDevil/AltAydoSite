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
  // borderStyle is no longer needed as mg-container handles borders
  // borderStyle?: string; 
  category?: 'subsidiary' | 'corporate' | 'training' | 'navigation';
  image?: string;
  requiredClearance?: number;
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
      description: 'Logistics & Cargo Operations',
      icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
      color: 'rgba(var(--mg-primary))', // Using theme variable
      // borderStyle: 'border-t-2 border-r border-b border-l-2', // Removed
      category: 'subsidiary',
      path: '/dashboard/subsidiaries/express',
      image: '/images/Aydo_Express.png'
    },
    {
      id: 'empyrion',
      title: 'EMPYRION INDUSTRIES',
      description: 'Mining & Salvage Operations',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'rgba(var(--mg-secondary))', // Using theme variable
      // borderStyle: 'border-t border-r-2 border-b-2 border-l', // Removed
      category: 'subsidiary',
      path: '/dashboard/subsidiaries/empyrion',
      image: '/images/Empyrion_Industries.png'
    },
    {
      id: 'organization',
      title: 'ORGANIZATION STRUCTURE',
      description: 'Ranks & Leadership',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'rgba(var(--mg-accent))', // Using theme variable
      // borderStyle: 'border-t-2 border-r-2 border-b border-l-2', // Removed
      category: 'corporate',
      path: '/dashboard/archives/hierarchy',
      image: '/images/Aydo_Corp_3x3k_RSI.png'
    },
    {
      id: 'training',
      title: 'TRAINING & CERTIFICATION',
      description: 'Career Development',
      icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
      color: 'rgba(var(--mg-primary))', // Using theme variable
      // borderStyle: 'border-t border-r-2 border-b-2 border-l', // Removed
      category: 'training',
      path: '/dashboard/promotion/training',
      image: '/images/Aydo_Corp_logo_employees.png'
    },
    {
      id: 'finance',
      title: 'FINANCE & PAYROLL',
      description: 'Salary & Compensation',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'rgba(var(--mg-secondary))', // Using theme variable
      // borderStyle: 'border-t-2 border-r border-b border-l', // Removed
      category: 'corporate',
      path: '/dashboard/finance',
      image: '/images/Aydo_Corp_logo_Gold.png',
      requiredClearance: 2
    },
    {
      id: 'missions',
      title: 'MISSION OPERATIONS',
      description: 'Events & Activities',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'rgba(var(--mg-primary))', // Using theme variable
      // borderStyle: 'border-t border-r border-b-2 border-l-2', // Removed
      category: 'corporate',
      path: '/dashboard/missions',
      image: '/images/Aydo_Corp_logo_Silver.png'
    },
    {
      id: 'corporate-history',
      title: 'CORPORATE ARCHIVES',
      description: 'History & Documentation',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      color: 'rgba(var(--mg-accent))', // Using theme variable
      // borderStyle: 'border-t border-r-2 border-b border-l-2', // Removed
      category: 'corporate',
      path: '/dashboard/archives/history',
      image: '/images/Board_member_tag.png'
    },
    {
      id: 'fleet',
      title: 'FLEET MANAGEMENT',
      description: 'Ships & Resources',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10l-8-4m8 4v10l-8 4m8 4l8-4',
      color: 'rgba(var(--mg-secondary))', // Using theme variable
      // borderStyle: 'border-t-2 border-r border-b-2 border-l', // Removed
      category: 'corporate',
      path: '/dashboard/fleet',
      image: '/images/Hull_E.jpg'
    },
    {
      id: 'personnel',
      title: 'PERSONNEL DATABASE',
      description: 'Member Profiles',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      color: 'rgba(var(--mg-primary))', // Using theme variable
      // borderStyle: 'border-t border-r border-b border-l-2', // Removed
      category: 'corporate',
      path: '/dashboard/employees',
      image: '/images/AydoOffice1.png'
    },
    {
      id: 'communications',
      title: 'COMMUNICATIONS',
      description: 'Messages & Alerts',
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
      color: 'rgba(var(--mg-accent))', // Using theme variable
      // borderStyle: 'border-t-2 border-r-2 border-b border-l', // Removed
      category: 'navigation',
      path: '/dashboard/communications',
      image: '/images/RSI_AYDO_Corp_image.png'
    },
    {
      id: 'logistics',
      title: 'LOGISTICS OPERATIONS',
      description: 'Routes & Planning',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      color: 'rgba(var(--mg-secondary))', // Using theme variable
      // borderStyle: 'border-t border-r border-b-2 border-l', // Removed
      category: 'navigation',
      path: '/dashboard/logistics',
      image: '/images/logisticsoffice.jpg'
    },
    {
      id: 'admin',
      title: 'ADMIN CONTROLS',
      description: 'System Management',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      color: 'rgba(var(--mg-danger))', // Using theme variable for admin
      // borderStyle: 'border-t border-r-2 border-b border-l', // Removed
      category: 'corporate',
      path: '/dashboard/admin',
      image: '/images/Aydo_Corp_logo_rel_gray_black.png',
      requiredClearance: 3
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
  
  // Filter tiles based on user clearance level
  const getVisibleTiles = () => {
    return tiles.filter(tile => {
      if (tile.requiredClearance) {
        return clearanceLevel >= tile.requiredClearance;
      }
      return true;
    });
  };

  return (
    <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
      
      <div className="flex items-center mb-4">
        <div className="h-5 w-5 relative mr-2">
          <Image 
            src="/images/Aydo_Corp_logo_employees.png" 
            alt="AydoCorp Employee Portal" 
            fill 
            className="object-contain"
          />
        </div>
        <h2 className="mg-title text-sm font-quantify tracking-wider">EMPLOYEE RESOURCES</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {getVisibleTiles().map((tile, i) => (
          <motion.div
            key={tile.id}
            custom={i}
            variants={tileVariants}
            initial="hidden"
            animate={isInitialized ? "visible" : "hidden"}
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(var(--mg-glow),0.5)', transition: { duration: 0.2 } }}
            // Removed tile.borderStyle from className string
            className={`mg-container holo-element relative rounded-sm overflow-hidden hover:border-[rgba(var(--mg-accent),0.7)] transition-all cursor-pointer`}
          >
            {/* The Link component should wrap the content, not be a separate sibling to the styling div if possible */}
            {/* For now, ensuring Link takes full space of the motion.div */}
            <Link href={tile.path || '#'} className="block h-full w-full p-3"> 
              {/* Removed inner div, Link itself will carry padding if needed or content will manage its spacing */}
              <>
                {tile.image && (
                  <div className="absolute inset-0 opacity-10 z-0"> {/* Ensure image is behind content */}
                    <Image
                      src={tile.image} 
                      alt={tile.title} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                )}
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center mb-2">
                    <div className="w-5 h-5 flex items-center justify-center bg-[rgba(var(--mg-primary),0.1)] rounded-sm mr-2">
                      {/* SVG stroke color now directly uses tile.color which should be a theme variable string */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke={tile.color || `rgba(var(--mg-accent))`}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tile.icon} />
                      </svg>
                    </div>
                    <h3 className="mg-title text-xs flex-grow">{tile.title}</h3>
                  </div>
                  
                  {tile.description && (
                    <p className="mg-text text-[10px] leading-tight mt-1 opacity-80">{tile.description}</p>
                  )}
                </div>
              </>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {/* Employee Status Panel */}
      {/* The main container for this section is already an mg-panel, so we don't need nested mg-panels unless for specific design reasons.
          Let's use MobiGlasPanel for individual stat items if they need distinct panel styling.
          The overall section title "EMPLOYEE STATUS" can use mg-title or mg-subtitle.
      */}
      <div className="mt-6 border-t border-[rgba(var(--mg-primary),0.15)] pt-4">
        <div className="flex items-center mb-3">
          <div className="w-4 h-4 flex items-center justify-center bg-[rgba(var(--mg-primary),0.1)] rounded-sm mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke={`rgba(var(--mg-text),0.9)`}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="mg-title text-sm tracking-wide">EMPLOYEE STATUS</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Using MobiGlasPanel for each status item */}
          <MobiGlasPanel className="p-2.5 holo-element hover:shadow-[0_0_10px_rgba(var(--mg-glow),0.3)] transition-shadow">
            <div className="mg-subtitle text-[10px] opacity-70 mb-0.5">ACTIVE DAYS</div>
            <div className="mg-title text-base text-[rgba(var(--mg-primary),1)]">{days}</div>
          </MobiGlasPanel>
          
          <MobiGlasPanel className="p-2.5 holo-element hover:shadow-[0_0_10px_rgba(var(--mg-glow),0.3)] transition-shadow">
            <div className="mg-subtitle text-[10px] opacity-70 mb-0.5">SERVICE HOURS</div>
            <div className="mg-title text-base text-[rgba(var(--mg-primary),1)]">{hours}</div>
          </MobiGlasPanel>
          
          <MobiGlasPanel className="p-2.5 holo-element hover:shadow-[0_0_10px_rgba(var(--mg-glow),0.3)] transition-shadow">
            <div className="mg-subtitle text-[10px] opacity-70 mb-0.5">REPUTATION</div>
            <div className="mg-title text-base text-[rgba(var(--mg-primary),1)]">{reputation}</div>
          </MobiGlasPanel>
          
          <MobiGlasPanel className="p-2.5 holo-element hover:shadow-[0_0_10px_rgba(var(--mg-glow),0.3)] transition-shadow">
            <div className="mg-subtitle text-[10px] opacity-70 mb-0.5">BALANCE (UEC)</div>
            <div className="mg-title text-base text-[rgba(var(--mg-primary),1)]">{balance}</div>
          </MobiGlasPanel>
        </div>
      </div>
    </div>
  );
}