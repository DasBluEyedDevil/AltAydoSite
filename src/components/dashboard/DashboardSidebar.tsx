'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  children?: NavItem[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    name: 'Corporate Archives',
    href: '/dashboard/archives',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    children: [
      {
        name: 'Corporate History',
        href: '/dashboard/archives/history',
        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
      },
      {
        name: 'Hierarchy Chart',
        href: '/dashboard/archives/hierarchy',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
      },
      {
        name: 'Subsidiaries',
        href: '/dashboard/archives/subsidiaries',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
      },
      {
        name: 'Resources',
        href: '/dashboard/archives/resources',
        icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
      }
    ]
  },
  {
    name: 'Subsidiaries',
    href: '/dashboard/subsidiaries',
    icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
    children: [
      {
        name: 'AydoExpress',
        href: '/dashboard/subsidiaries/express',
        icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
        badge: 'Logistics'
      },
      {
        name: 'Empyrion Industries',
        href: '/dashboard/subsidiaries/empyrion',
        icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
        badge: 'Mining'
      }
    ]
  },
  {
    name: 'Career Development',
    href: '/dashboard/promotion',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    children: [
      {
        name: 'Training Guides',
        href: '/dashboard/promotion/training',
        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
      },
      {
        name: 'Certifications',
        href: '/dashboard/promotion/certifications',
        icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
      },
      {
        name: 'Rank Advancement',
        href: '/dashboard/promotion/ranks',
        icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
      }
    ]
  },
  {
    name: 'Operations',
    href: '/dashboard/operations',
    icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z',
    children: [
      {
        name: 'Fleet Management',
        href: '/dashboard/operations/fleet',
        icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'
      },
      {
        name: 'Logistics Routes',
        href: '/dashboard/operations/routes',
        icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
      },
      {
        name: 'Mission Planning',
        href: '/dashboard/operations/missions',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
      }
    ]
  },
  {
    name: 'Employee Database',
    href: '/dashboard/employees',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    name: 'Events Calendar',
    href: '/dashboard/events',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  {
    name: 'Communications',
    href: '/dashboard/communications',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    badge: 'New'
  }
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (name: string) => {
    if (expandedItems.includes(name)) {
      setExpandedItems(expandedItems.filter(item => item !== name));
    } else {
      setExpandedItems([...expandedItems, name]);
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  const isExpanded = (name: string) => {
    return expandedItems.includes(name) || navItems.some(item => 
      item.name === name && 
      item.children?.some(child => pathname.startsWith(child.href))
    );
  };

  return (
    <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] rounded-sm h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-[rgba(var(--mg-primary),0.15)] flex items-center">
        <div className="h-6 w-6 relative mr-2">
          <Image 
            src="/images/Aydo_Corp_logo_employees.png" 
            alt="AydoCorp Logo" 
            fill 
            className="object-contain"
          />
        </div>
        <h2 className="mg-subtitle text-sm tracking-wider">EMPLOYEE PORTAL</h2>
      </div>
      
      <div className="p-2 flex-grow overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              {item.children ? (
                <div className="space-y-1">
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-left text-sm ${
                      isActive(item.href)
                        ? 'bg-[rgba(var(--mg-primary),0.15)] text-[rgba(var(--mg-primary),0.9)]'
                        : 'hover:bg-[rgba(var(--mg-panel-dark),0.5)]'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={item.icon} />
                      </svg>
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="ml-2 px-1.5 py-0.5 text-[9px] font-medium bg-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),0.9)] rounded-sm">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transition-transform ${isExpanded(item.name) ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isExpanded(item.name) && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 space-y-1"
                    >
                      {item.children.map((child) => (
                        <li key={child.name}>
                          <Link href={child.href}>
                            <div
                              className={`flex items-center px-3 py-2 rounded-sm text-sm ${
                                isActive(child.href)
                                  ? 'bg-[rgba(var(--mg-primary),0.15)] text-[rgba(var(--mg-primary),0.9)]'
                                  : 'hover:bg-[rgba(var(--mg-panel-dark),0.5)]'
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={child.icon} />
                              </svg>
                              <span>{child.name}</span>
                              {child.badge && (
                                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-medium bg-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),0.9)] rounded-sm">
                                  {child.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </div>
              ) : (
                <Link href={item.href}>
                  <div
                    className={`flex items-center px-3 py-2 rounded-sm text-sm ${
                      isActive(item.href)
                        ? 'bg-[rgba(var(--mg-primary),0.15)] text-[rgba(var(--mg-primary),0.9)]'
                        : 'hover:bg-[rgba(var(--mg-panel-dark),0.5)]'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={item.icon} />
                    </svg>
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-[9px] font-medium bg-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),0.9)] rounded-sm">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-3 border-t border-[rgba(var(--mg-primary),0.15)] text-center">
        <div className="text-xs text-[rgba(var(--mg-text),0.6)]">
          AYDO INTERGALACTIC CORPORATION
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar; 