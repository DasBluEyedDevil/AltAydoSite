'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced PersonCard component with improved interactivity
interface PersonCardProps {
  title: string;
  loreName?: string;
  handle?: string;
  isFlippable?: boolean;
  className?: string;
  level?: 'executive' | 'board' | 'director' | 'manager' | 'staff';
  onHover?: (isHovered: boolean) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({
  title,
  loreName,
  handle,
  isFlippable = true,
  className = "",
  level = 'staff',
  onHover
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isFlippable) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  const levelColors = {
    executive: 'from-yellow-400/20 to-amber-500/20 border-yellow-400/60',
    board: 'from-blue-400/20 to-cyan-500/20 border-blue-400/60',
    director: 'from-purple-400/20 to-violet-500/20 border-purple-400/60',
    manager: 'from-green-400/20 to-emerald-500/20 border-green-400/60',
    staff: 'from-gray-400/20 to-slate-500/20 border-gray-400/60'
  };

  return (
    <motion.div 
      className={`relative w-full h-36 cursor-pointer ${className}`} 
      style={{ perspective: '1000px' }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute w-full h-full"
        onClick={handleClick}
        style={{ 
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isFlipped ? 'rotateY(180deg)' : '',
        }}
      >
        {/* Front of card */}
        <div 
          className={`absolute w-full h-full flex flex-col justify-center items-center p-4 bg-gradient-to-br ${levelColors[level]} backdrop-blur-sm rounded-lg shadow-lg transition-all duration-300 ${
            isHovered ? 'shadow-xl shadow-[rgba(var(--mg-primary),0.3)]' : ''
          }`}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="text-sm font-quantify tracking-wider text-center text-[rgba(var(--mg-primary),0.9)] leading-tight mb-2">
            {title}
          </div>
          {isFlippable && (
            <div className="text-xs text-[rgba(var(--mg-text),0.6)] flex items-center gap-1">
              <span>Click for details</span>
              <motion.div
                animate={{ rotate: isHovered ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ↻
              </motion.div>
            </div>
          )}
          {/* Level indicator */}
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)]"></div>
        </div>

        {/* Back of card */}
        <div 
          className={`absolute w-full h-full p-4 bg-gradient-to-br ${levelColors[level]} backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-center items-center`}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="text-xs text-[rgba(var(--mg-text),0.6)] mb-1">{title}</div>
          <div className="text-sm text-[rgba(var(--mg-text),0.7)] mb-2">
            Assigned:
          </div>
          <div className="text-lg font-quantify tracking-wider text-center text-[rgba(var(--mg-primary),0.9)] mb-1">
            {loreName ?? 'DynamicData'}
          </div>
          {handle && (
            <div className="text-sm text-[rgba(var(--mg-accent),0.8)] font-mono">@{handle}</div>
          )}
          {/* TODO: Implement API call to fetch user profiles for this position.
             This is the injection point where profile display data should be bound
             to the back side of the tile. */}
        </div>
      </div>
    </motion.div>
  );
};



// Navigation Tabs component
const NavigationTabs: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'hierarchy', label: 'Corporate Hierarchy', icon: '📋' },
    { id: 'crew', label: 'Crew Hierarchy', icon: '🧑\u200d🚀' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-8"
    >
      <div className="flex flex-wrap gap-2 p-1 bg-[rgba(var(--mg-panel-dark),0.6)] rounded-lg border border-[rgba(var(--mg-primary),0.3)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[rgba(var(--mg-primary),0.8)] text-black shadow-lg'
                : 'text-[rgba(var(--mg-text),0.7)] hover:bg-[rgba(var(--mg-primary),0.2)] hover:text-[rgba(var(--mg-text),0.9)]'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// Collapsible Section component
const CollapsibleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  level?: number;
}> = ({ title, children, defaultOpen = true, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`mb-6 ${level > 0 ? 'ml-4' : ''}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-primary),0.4)] rounded-lg hover:bg-[rgba(var(--mg-panel-dark),0.6)] transition-colors"
      >
        <h3 className="text-lg font-quantify text-[rgba(var(--mg-primary),0.9)]">{title}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[rgba(var(--mg-primary),0.8)]"
        >
          ▶
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-l border-r border-b border-[rgba(var(--mg-primary),0.4)] rounded-b-lg bg-[rgba(var(--mg-panel-dark),0.2)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function HierarchyChartPage() {
  const [activeTab, setActiveTab] = useState('hierarchy');
  // Connection rendering (Corporate chart)
  const corpRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const corpContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [corpPaths, setCorpPaths] = React.useState<Array<{ id: string; d: string }>>([]);

  // Connection rendering (Crew chart)
  const crewRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const crewContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [crewPaths, setCrewPaths] = React.useState<Array<{ id: string; d: string }>>([]);

  const setCorpRef = (id: string) => (el: HTMLDivElement | null) => {
    corpRefs.current[id] = el;
  };

  const setCrewRef = (id: string) => (el: HTMLDivElement | null) => {
    crewRefs.current[id] = el;
  };

  const recalcCorpConnections = React.useCallback(() => {
    if (activeTab !== 'hierarchy') return;
    const container = corpContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const getBottomCenter = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - containerRect.left + r.width / 2, y: r.bottom - containerRect.top };
    };
    const getTopCenter = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - containerRect.left + r.width / 2, y: r.top - containerRect.top };
    };

    // Corporate hierarchy mapping (aligned to provided JSON)
    const tree: Record<string, string[]> = {
      // Executive
      ceo: ['cmo', 'coo', 'cso'], // CEO connects to all chiefs
      cmo: [],
      coo: ['eiDir', 'aeDir', 'msDir'], // COO connects to directors
      cso: [],

      // Directors
      eiDir: ['mgrMining', 'mgrSalvage'],
      aeDir: ['sectorRouteMgr'],
      msDir: ['squadLeader'],

      // Managers
      mgrMining: ['miner'],
      mgrSalvage: ['salvager'],
      sectorRouteMgr: ['loadMaster', 'capitalHauler'],
      squadLeader: ['securityPilot'],

      // Senior Employees
      loadMaster: ['hauler'],
      capitalHauler: ['hauler'],

      // Employees
      miner: ['loader'],
      salvager: ['loader'],
      hauler: ['loader'],
      securityPilot: ['gunman', 'turretman'],

      // Interns/Freelancers
      loader: [],
      gunman: [],
      turretman: [],
    };

    const pairs: Array<[string, string]> = [];
    Object.entries(tree).forEach(([p, children]) => {
      children.forEach((c) => pairs.push([p, c]));
    });

    const paths: Array<{ id: string; d: string }> = [];
    // Track connections to handle convergence cases
    const connectionMap = new Map<string, number>();
    
    for (let i = 0; i < pairs.length; i++) {
      const [fromId, toId] = pairs[i];
      const fromEl = corpRefs.current[fromId] as HTMLElement | null;
      const toEl = corpRefs.current[toId] as HTMLElement | null;
      if (!fromEl || !toEl) continue;
      
      const s = getBottomCenter(fromEl);
      const t = getTopCenter(toEl);
      const dy = t.y - s.y;
      const dx = Math.abs(t.x - s.x);
      
      // Handle convergence: if multiple arrows point to same target, offset them slightly
      const connectionKey = toId;
      const connectionCount = connectionMap.get(connectionKey) || 0;
      connectionMap.set(connectionKey, connectionCount + 1);
      
      // Apply small horizontal offset for multiple connections to same target
      const horizontalOffset = connectionCount > 0 ? (connectionCount % 2 === 0 ? 8 : -8) * Math.floor(connectionCount / 2 + 1) : 0;
      
      // Improved center alignment with adaptive offset based on distance
      const offset = Math.max(50, Math.min(180, Math.abs(dy) * 0.6 + dx * 0.2));
      
      // Enhanced curve calculation for better center alignment with convergence handling
      const adjustedTargetX = t.x + horizontalOffset;
      const d = `M ${s.x} ${s.y} C ${s.x} ${s.y + offset} ${adjustedTargetX} ${t.y - offset} ${adjustedTargetX} ${t.y}`;
      paths.push({ id: `${fromId}-${toId}-${i}`, d });
    }
    setCorpPaths(paths);
  }, [activeTab]);

  React.useLayoutEffect(() => {
    recalcCorpConnections();
  }, [recalcCorpConnections]);

  React.useEffect(() => {
    if (activeTab !== 'hierarchy') return;
    const ro = new ResizeObserver(() => recalcCorpConnections());
    if (corpContainerRef.current) ro.observe(corpContainerRef.current);
    window.addEventListener('resize', recalcCorpConnections);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recalcCorpConnections);
    };
  }, [activeTab, recalcCorpConnections]);

  // Improve reliability of corporate connectors after layout/scroll
  React.useEffect(() => {
    if (activeTab !== 'hierarchy') return;
    const raf = requestAnimationFrame(() => recalcCorpConnections());
    const t1 = setTimeout(() => recalcCorpConnections(), 50);
    const t2 = setTimeout(() => recalcCorpConnections(), 250);
    const t3 = setTimeout(() => recalcCorpConnections(), 600);
    const onScroll = () => recalcCorpConnections();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('scroll', onScroll);
    };
  }, [activeTab, recalcCorpConnections]);

  const recalcCrewConnections = React.useCallback(() => {
    if (activeTab !== 'crew') return;
    const container = crewContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const getBottomCenter = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - containerRect.left + r.width / 2, y: r.bottom - containerRect.top };
    };
    const getTopCenter = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - containerRect.left + r.width / 2, y: r.top - containerRect.top };
    };

    // Ship crew hierarchy mapping (merged Engineer and Engineer-In-Training)
    const tree: Record<string, string[]> = {
      capCaptain: ['mcCaptain'],
      mcCaptain: ['flightDeck', 'crewChief'],
      flightDeck: ['engineer'],
      crewChief: ['engineer'],
      engineer: ['engineerIT'],
      engineerIT: [],
    };

    const pairs: Array<[string, string]> = [];
    Object.entries(tree).forEach(([p, children]) => {
      children.forEach((c) => pairs.push([p, c]));
    });

    const paths: Array<{ id: string; d: string }> = [];
    // Track connections to handle convergence cases
    const connectionMap = new Map<string, number>();
    
    for (let i = 0; i < pairs.length; i++) {
      const [fromId, toId] = pairs[i];
      const fromEl = crewRefs.current[fromId] as HTMLElement | null;
      const toEl = crewRefs.current[toId] as HTMLElement | null;
      if (!fromEl || !toEl) continue;
      
      const s = getBottomCenter(fromEl);
      const t = getTopCenter(toEl);
      const dy = t.y - s.y;
      const dx = Math.abs(t.x - s.x);
      
      // Handle convergence: if multiple arrows point to same target, offset them
      const connectionKey = toId;
      const connectionCount = connectionMap.get(connectionKey) || 0;
      connectionMap.set(connectionKey, connectionCount + 1);
      
      // Apply horizontal offset for multiple connections to same target
      const horizontalOffset = connectionCount > 0 ? (connectionCount % 2 === 0 ? 15 : -15) * Math.floor(connectionCount / 2 + 1) : 0;
      
      // Improved center alignment with adaptive offset based on distance
      const offset = Math.max(50, Math.min(180, Math.abs(dy) * 0.6 + dx * 0.2));
      
      // Enhanced curve calculation for better center alignment with convergence handling
      const adjustedTargetX = t.x + horizontalOffset;
      const d = `M ${s.x} ${s.y} C ${s.x} ${s.y + offset} ${adjustedTargetX} ${t.y - offset} ${adjustedTargetX} ${t.y}`;
      paths.push({ id: `${fromId}-${toId}-${i}`, d });
    }
    setCrewPaths(paths);
  }, [activeTab]);

  React.useLayoutEffect(() => {
    recalcCrewConnections();
  }, [recalcCrewConnections]);

  React.useEffect(() => {
    if (activeTab !== 'crew') return;
    const ro = new ResizeObserver(() => recalcCrewConnections());
    if (crewContainerRef.current) ro.observe(crewContainerRef.current);
    window.addEventListener('resize', recalcCrewConnections);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recalcCrewConnections);
    };
  }, [activeTab, recalcCrewConnections]);

  // Ensure connectors appear after layout settles when switching to crew
  React.useEffect(() => {
    if (activeTab !== 'crew') return;
    const raf = requestAnimationFrame(() => recalcCrewConnections());
    const t1 = setTimeout(() => recalcCrewConnections(), 50);
    const t2 = setTimeout(() => recalcCrewConnections(), 250);
    const t3 = setTimeout(() => recalcCrewConnections(), 600);
    const t4 = setTimeout(() => recalcCrewConnections(), 1200);
    const onScroll = () => recalcCrewConnections();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('scroll', onScroll);
    };
  }, [activeTab, recalcCrewConnections]);

  // Corporate hierarchy (primary)
  const renderHierarchyTab = () => (
    <motion.div
      key="hierarchy"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      {/* Corporate hierarchy with floating leadership level containers */}
      <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.45)] p-6 sm:p-8 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>

        <h2 className="mg-subtitle text-xl mb-8 text-center">Corporate Hierarchy</h2>

        <div ref={corpContainerRef} className="relative max-w-[1500px] mx-auto flex flex-col gap-20">
          {/* SVG connectors overlay */}
          <svg className="pointer-events-none absolute inset-0 z-0" width="100%" height="100%">
            <defs>
              <linearGradient id="hierarchyLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0,255,255,0.65)" />
                <stop offset="50%" stopColor="rgba(0,255,255,0.45)" />
                <stop offset="100%" stopColor="rgba(0,255,255,0.25)" />
              </linearGradient>
              <marker id="hierarchyArrow" viewBox="0 0 12 10" refX="12" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                <path d="M 0 2 L 12 5 L 0 8 z" fill="rgba(0,255,255,0.7)" stroke="rgba(0,255,255,0.3)" strokeWidth="0.5"/>
              </marker>
              <filter id="hierarchyGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="rgba(0,255,255,0.4)" />
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(0,255,255,0.2)" />
              </filter>
            </defs>
            {corpPaths.map((p) => (
              <motion.path
                key={p.id}
                d={p.d}
                fill="none"
                stroke="url(#hierarchyLine)"
                strokeWidth={2.5}
                strokeLinecap="round"
                markerEnd="url(#hierarchyArrow)"
                filter="url(#hierarchyGlow)"
                style={{ opacity: 0.8 }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            ))}
          </svg>
          {/* Executive Level */}
          <div className="relative p-6 sm:p-8 rounded-xl bg-[rgba(var(--mg-primary),0.04)] border border-[rgba(var(--mg-primary),0.25)] shadow-[0_0_40px_rgba(0,255,255,0.05)]">
            <div className="absolute -top-3 left-4 px-2 py-1 rounded-md bg-[rgba(var(--mg-primary),0.15)] border border-[rgba(var(--mg-primary),0.4)] text-[10px] tracking-widest font-quantify text-[rgba(var(--mg-primary),0.9)]">EXECUTIVE</div>
            <div className="flex flex-col items-center gap-12">
              <div className="flex justify-center">
                <div className="w-64 relative z-10" ref={setCorpRef('ceo')}>
                  <PersonCard title="Chief Executive Officer" level="executive" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-16 justify-items-center">
                <div className="w-64 relative z-10" ref={setCorpRef('cmo')}>
                  <PersonCard title="Chief Marketing Officer" level="board" />
                </div>
                <div className="w-64 relative z-10" ref={setCorpRef('coo')}>
                  <PersonCard title="Chief Operations Officer" level="board" />
                </div>
                <div className="w-64 relative z-10" ref={setCorpRef('cso')}>
                  <PersonCard title="Chief Safety Officer" level="board" />
                </div>
              </div>
            </div>
          </div>

          {/* Director Level */}
          <div className="relative p-6 sm:p-8 rounded-xl bg-[rgba(var(--mg-primary),0.04)] border border-[rgba(var(--mg-primary),0.25)] shadow-[0_0_40px_rgba(0,255,255,0.05)]">
            <div className="absolute -top-3 left-4 px-2 py-1 rounded-md bg-[rgba(var(--mg-primary),0.15)] border border-[rgba(var(--mg-primary),0.4)] text-[10px] tracking-widest font-quantify text-[rgba(var(--mg-primary),0.9)]">DIRECTOR</div>
            <div className="grid grid-cols-3 gap-16 justify-items-center">
              <div className="w-64 relative z-10" ref={setCorpRef('eiDir')}>
                <PersonCard title="Empyrion Industries Director" level="director" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('aeDir')}>
                <PersonCard title="AydoExpress Director" level="director" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('msDir')}>
                <PersonCard title="Midnight Security Director" level="director" />
              </div>
            </div>
          </div>

          {/* Manager Level */}
          <div className="relative p-6 sm:p-8 rounded-xl bg-[rgba(var(--mg-primary),0.04)] border border-[rgba(var(--mg-primary),0.25)] shadow-[0_0_40px_rgba(0,255,255,0.05)]">
            <div className="absolute -top-3 left-4 px-2 py-1 rounded-md bg-[rgba(var(--mg-primary),0.15)] border border-[rgba(var(--mg-primary),0.4)] text-[10px] tracking-widest font-quantify text-[rgba(var(--mg-primary),0.9)]">MANAGER</div>
            <div className="grid grid-cols-4 gap-16 justify-items-center">
              <div className="w-64 relative z-10" ref={setCorpRef('mgrMining')}>
                <PersonCard title="Mining Manager" level="manager" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('mgrSalvage')}>
                <PersonCard title="Salvage Manager" level="manager" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('sectorRouteMgr')}>
                <PersonCard title="Sector Route Manager" level="manager" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('squadLeader')}>
                <PersonCard title="Squadron Leader" level="manager" />
              </div>
            </div>
          </div>

          {/* Senior Employee Level */}
          <div className="relative p-6 sm:p-8 rounded-xl bg-[rgba(var(--mg-primary),0.04)] border border-[rgba(var(--mg-primary),0.25)] shadow-[0_0_40px_rgba(0,255,255,0.05)]">
            <div className="absolute -top-3 left-4 px-2 py-1 rounded-md bg-[rgba(var(--mg-primary),0.15)] border border-[rgba(var(--mg-primary),0.4)] text-[10px] tracking-widest font-quantify text-[rgba(var(--mg-primary),0.9)]">SENIOR EMPLOYEE</div>
            <div className="max-w-xl mx-auto flex items-center justify-center gap-16">
              <div className="w-64 relative z-10" ref={setCorpRef('loadMaster')}>
                <PersonCard title="Load Master" level="staff" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('capitalHauler')}>
                <PersonCard title="Capital Hauler" level="staff" />
              </div>
            </div>
          </div>

          {/* Employee Level */}
          <div className="relative p-6 sm:p-8 rounded-xl bg-[rgba(var(--mg-primary),0.04)] border border-[rgba(var(--mg-primary),0.25)] shadow-[0_0_40px_rgba(0,255,255,0.05)]">
            <div className="absolute -top-3 left-4 px-2 py-1 rounded-md bg-[rgba(var(--mg-primary),0.15)] border border-[rgba(var(--mg-primary),0.4)] text-[10px] tracking-widest font-quantify text-[rgba(var(--mg-primary),0.9)]">EMPLOYEE</div>
            <div className="grid grid-cols-4 gap-16 justify-items-center">
              <div className="w-64 relative z-10" ref={setCorpRef('miner')}>
                <PersonCard title="Miner" level="staff" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('salvager')}>
                <PersonCard title="Salvager" level="staff" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('hauler')}>
                <PersonCard title="Hauler" level="staff" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('securityPilot')}>
                <PersonCard title="Security Pilot" level="staff" />
              </div>
            </div>
          </div>

          {/* Intern/Freelancer Level */}
          <div className="relative p-6 sm:p-8 rounded-xl bg-[rgba(var(--mg-primary),0.04)] border border-[rgba(var(--mg-primary),0.25)] shadow-[0_0_40px_rgba(0,255,255,0.05)]">
            <div className="absolute -top-3 left-4 px-2 py-1 rounded-md bg-[rgba(var(--mg-primary),0.15)] border border-[rgba(var(--mg-primary),0.4)] text-[10px] tracking-widest font-quantify text-[rgba(var(--mg-primary),0.9)]">INTERN / FREELANCER</div>
            <div className="grid grid-cols-3 gap-16 justify-items-center">
              <div className="w-64 relative z-10" ref={setCorpRef('loader')}>
                <PersonCard title="Loader" level="staff" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('gunman')}>
                <PersonCard title="Gunman" level="staff" />
              </div>
              <div className="w-64 relative z-10" ref={setCorpRef('turretman')}>
                <PersonCard title="Turretman" level="staff" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Crew hierarchy (secondary)
  const renderCrewTab = () => (
    <motion.div
      key="crew"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.45)] p-6 sm:p-8 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>

        <h2 className="mg-subtitle text-xl mb-8 text-center">Ship Crew</h2>

        <div ref={crewContainerRef} className="relative max-w-4xl mx-auto flex flex-col gap-16">
          {/* SVG connectors overlay */}
          <svg className="pointer-events-none absolute inset-0 z-0" width="100%" height="100%">
            <defs>
              <linearGradient id="crewHierarchyLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0,255,255,0.65)" />
                <stop offset="50%" stopColor="rgba(0,255,255,0.45)" />
                <stop offset="100%" stopColor="rgba(0,255,255,0.25)" />
              </linearGradient>
              <marker id="crewHierarchyArrow" viewBox="0 0 12 10" refX="12" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                <path d="M 0 2 L 12 5 L 0 8 z" fill="rgba(0,255,255,0.7)" stroke="rgba(0,255,255,0.3)" strokeWidth="0.5"/>
              </marker>
              <filter id="crewHierarchyGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="rgba(0,255,255,0.4)" />
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="rgba(0,255,255,0.2)" />
              </filter>
            </defs>
            {crewPaths.map((p) => (
              <motion.path
                key={p.id}
                d={p.d}
                fill="none"
                stroke="url(#crewHierarchyLine)"
                strokeWidth={2.5}
                strokeLinecap="round"
                markerEnd="url(#crewHierarchyArrow)"
                filter="url(#crewHierarchyGlow)"
                style={{ opacity: 0.8 }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            ))}
          </svg>
          {/* Row 1 */}
          <div className="h-36 flex items-center justify-center relative z-10">
            <div className="w-64 relative" ref={setCrewRef('capCaptain')}>
              <PersonCard title="Capital Ship Captain" level="executive" />
            </div>
          </div>



          {/* Row 2 */}
          <div className="h-36 flex items-center justify-center relative z-10">
            <div className="w-64 relative" ref={setCrewRef('mcCaptain')}>
              <PersonCard title="Multi-Crew Ship Captain" level="board" />
            </div>
          </div>

          {/* Row 3: branch to two columns */}
          <div className="h-36 relative z-10">
            <div className="flex items-start justify-center gap-16 relative">
              <div className="w-64 relative" ref={setCrewRef('flightDeck')}>
                <PersonCard title="Flight Deck Officer" level="manager" />
              </div>
              <div className="w-64 relative" ref={setCrewRef('crewChief')}>
                <PersonCard title="Crew Chief" level="manager" />
              </div>
            </div>
          </div>

          {/* Row 4: single Engineer (merged) */}
          <div className="h-36 flex items-center justify-center relative z-10">
            <div className="w-64 relative" ref={setCrewRef('engineer')}>
              <PersonCard title="Engineer" level="staff" />
            </div>
          </div>

          {/* Row 5: EITs under each Engineer */}
          <div className="h-36 flex items-start justify-center relative z-10">
            <div className="w-64" ref={setCrewRef('engineerIT')}>
              <PersonCard title="Engineer-In-Training" level="staff" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black bg-opacity-95 p-6 relative">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-holo-grid bg-[length:50px_50px] opacity-5 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[rgba(var(--mg-primary),0.02)] to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="mg-title text-2xl sm:text-3xl lg:text-4xl mb-4">AydoCorp Hierarchy Chart</h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.7)] to-transparent mb-4"></div>
          <p className="text-[rgba(var(--mg-text),0.7)] max-w-2xl">
            Interactive organizational structure displaying AydoCorp&apos;s leadership hierarchy, 
            corporate reporting relationships, and ship crew composition.
          </p>
        </motion.div>

        <NavigationTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'hierarchy' && renderHierarchyTab()}
          {activeTab === 'crew' && renderCrewTab()}
        </AnimatePresence>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-xs text-[rgba(var(--mg-text),0.6)]"
        >
          AYDO INTERGALACTIC CORPORATION - INTERACTIVE CORPORATE ARCHIVES SYSTEM
        </motion.div>
      </div>
    </div>
  );
} 