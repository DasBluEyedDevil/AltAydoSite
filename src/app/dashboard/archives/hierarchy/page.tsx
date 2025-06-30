'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Enhanced PersonCard component with improved interactivity
interface PersonCardProps {
  title: string;
  loreName: string;
  handle: string;
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
          <div className="text-xs text-[rgba(var(--mg-text),0.6)] mb-1">
            {title}
          </div>
          <div className="text-lg font-quantify tracking-wider text-center text-[rgba(var(--mg-primary),0.9)] mb-2">
            {loreName}
          </div>
          <div className="text-sm text-[rgba(var(--mg-accent),0.8)] font-mono">
            @{handle}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Search and Filter component
const SearchBar: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}> = ({ searchTerm, onSearchChange, selectedFilter, onFilterChange }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.3)] rounded-lg backdrop-blur-sm"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search personnel, roles, or handles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 bg-[rgba(var(--mg-panel-dark),0.8)] border border-[rgba(var(--mg-primary),0.4)] rounded-md text-[rgba(var(--mg-text),0.9)] placeholder-[rgba(var(--mg-text),0.5)] focus:outline-none focus:border-[rgba(var(--mg-primary),0.8)] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Executive', 'Board', 'Directors', 'Managers'].map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                selectedFilter === filter
                  ? 'bg-[rgba(var(--mg-primary),0.8)] text-black'
                  : 'bg-[rgba(var(--mg-panel-dark),0.6)] text-[rgba(var(--mg-text),0.7)] hover:bg-[rgba(var(--mg-primary),0.2)]'
              }`}
            >
              {filter}
            </button>
          ))}
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
    { id: 'overview', label: 'Organization Overview', icon: '🏢' },
    { id: 'hierarchy', label: 'Detailed Hierarchy', icon: '📋' },
    { id: 'subsidiaries', label: 'Subsidiaries', icon: '🏭' },
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('overview');
  const [highlightedConnections, setHighlightedConnections] = useState<string[]>([]);

  // Define all personnel data
  const personnel = useMemo(() => [
    { id: 'ceo', title: 'Chief Executive Officer', loreName: 'Christoff Revan', handle: 'Udon', level: 'executive' as const, category: 'Executive' },
    { id: 'cmo', title: 'Chief Marketing Officer', loreName: 'Zane Makay', handle: 'Noodles', level: 'board' as const, category: 'Board' },
    { id: 'coo', title: 'Chief Operations Officer', loreName: 'Kaibo Zaber', handle: 'Kaibo_Z', level: 'board' as const, category: 'Board' },
    { id: 'cso', title: 'Chief Security Officer', loreName: 'Christus Sanctus', handle: 'Devil', level: 'board' as const, category: 'Board' },
    { id: 'express-dir', title: 'Director - AydoExpress', loreName: 'Darren Express', handle: 'Delta_Dart_42', level: 'director' as const, category: 'Directors' },
    { id: 'empyrion-dir', title: 'Director - Empyrion Industries', loreName: 'Stephanie Carder', handle: 'RamboSteph', level: 'director' as const, category: 'Directors' },
    { id: 'security-dir', title: 'Director - Midnight Security', loreName: 'Marcus Green', handle: 'MR-GR33N', level: 'director' as const, category: 'Directors' },
    { id: 'express-mgr', title: 'AydoExpress Manager', loreName: 'Alex Delivery', handle: 'Alex_D', level: 'manager' as const, category: 'Managers' },
    { id: 'empyrion-mgr', title: 'Empyrion Manager', loreName: 'Archie Zero', handle: 'ArcZeroNine', level: 'manager' as const, category: 'Managers' },
    { id: 'security-mgr', title: 'Security Manager', loreName: 'Devon Shield', handle: 'Shield_GS', level: 'manager' as const, category: 'Managers' }
  ], []);

  // Filter personnel based on search and filter
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(person => {
      const matchesSearch = searchTerm === '' || 
        person.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.loreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.handle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedFilter === 'All' || person.category === selectedFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [personnel, searchTerm, selectedFilter]);

  const renderOverviewTab = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <CollapsibleSection title="Executive Leadership" defaultOpen={true}>
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            <PersonCard 
              title="Chief Executive Officer"
              loreName="Christoff Revan" 
              handle="Udon"
              level="executive"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Board of Directors" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PersonCard 
            title="Chief Marketing Officer"
            loreName="Zane Makay" 
            handle="Noodles"
            level="board"
          />
          <PersonCard 
            title="Chief Operations Officer"
            loreName="Kaibo Zaber" 
            handle="Kaibo_Z"
            level="board"
          />
          <PersonCard 
            title="Chief Security Officer"
            loreName="Christus Sanctus" 
            handle="Devil"
            level="board"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Subsidiary Directors" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PersonCard 
            title="Director - AydoExpress"
            loreName="Darren Express" 
            handle="Delta_Dart_42"
            level="director"
          />
          <PersonCard 
            title="Director - Empyrion Industries"
            loreName="Stephanie Carder" 
            handle="RamboSteph"
            level="director"
          />
          <PersonCard 
            title="Director - Midnight Security"
            loreName="Marcus Green" 
            handle="MR-GR33N"
            level="director"
          />
        </div>
      </CollapsibleSection>
    </motion.div>
  );

  const renderHierarchyTab = () => (
    <motion.div
      key="hierarchy"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Detailed organizational chart with connection lines */}
      <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-8 rounded-lg relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
        
        <h2 className="mg-subtitle text-xl mb-8 text-center">Complete Organizational Structure</h2>
        
        <div className="space-y-8">
          {/* CEO Level */}
          <div className="flex justify-center">
            <div className="w-64">
              <PersonCard 
                title="Chief Executive Officer"
                loreName="Christoff Revan" 
                handle="Udon"
                level="executive"
              />
            </div>
          </div>
          
          {/* Connection line to board */}
          <div className="flex justify-center">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 32 }}
              className="w-px bg-gradient-to-b from-[rgba(var(--mg-primary),0.8)] to-[rgba(var(--mg-primary),0.4)]"
            />
          </div>
          
          {/* Board Level */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              <PersonCard 
                title="Chief Marketing Officer"
                loreName="Zane Makay" 
                handle="Noodles"
                level="board"
              />
              <div className="text-center text-xs text-[rgba(var(--mg-text),0.5)]">
                Marketing & Communications
              </div>
            </div>
            
            <div className="space-y-4">
              <PersonCard 
                title="Chief Operations Officer"
                loreName="Kaibo Zaber" 
                handle="Kaibo_Z"
                level="board"
              />
              <div className="text-center text-xs text-[rgba(var(--mg-text),0.5)]">
                Subsidiary Operations
              </div>
              
              {/* Connection line to subsidiaries */}
              <div className="flex justify-center">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 32 }}
                  className="w-px bg-gradient-to-b from-[rgba(var(--mg-primary),0.8)] to-[rgba(var(--mg-primary),0.4)]"
                />
              </div>
              
              {/* Subsidiary Directors under COO */}
              <div className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <PersonCard 
                    title="Director - AydoExpress"
                    loreName="Darren Express" 
                    handle="Delta_Dart_42"
                    level="director"
                  />
                  <PersonCard 
                    title="Director - Empyrion Industries"
                    loreName="Stephanie Carder" 
                    handle="RamboSteph"
                    level="director"
                  />
                  <PersonCard 
                    title="Director - Midnight Security"
                    loreName="Marcus Green" 
                    handle="MR-GR33N"
                    level="director"
                  />
                </div>
                
                {/* Connection to managers */}
                <div className="flex justify-center">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 24 }}
                    className="w-px bg-gradient-to-b from-[rgba(var(--mg-primary),0.6)] to-[rgba(var(--mg-primary),0.2)]"
                  />
                </div>
                
                {/* Subsidiary Managers */}
                <div className="grid gap-3">
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-3 bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.3)] rounded-lg hover:border-[rgba(var(--mg-primary),0.6)] transition-colors"
                    >
                      <div className="text-[rgba(var(--mg-text),0.9)] font-semibold">AydoExpress Manager</div>
                      <div className="text-[rgba(var(--mg-primary),0.8)]">Alex Delivery</div>
                      <div className="text-[rgba(var(--mg-accent),0.6)]">@Alex_D</div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-3 bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.3)] rounded-lg hover:border-[rgba(var(--mg-primary),0.6)] transition-colors"
                    >
                      <div className="text-[rgba(var(--mg-text),0.9)] font-semibold">Empyrion Manager</div>
                      <div className="text-[rgba(var(--mg-primary),0.8)]">Archie Zero</div>
                      <div className="text-[rgba(var(--mg-accent),0.6)]">@ArcZeroNine</div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-3 bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.3)] rounded-lg hover:border-[rgba(var(--mg-primary),0.6)] transition-colors"
                    >
                      <div className="text-[rgba(var(--mg-text),0.9)] font-semibold">Security Manager</div>
                      <div className="text-[rgba(var(--mg-primary),0.8)]">Devon Shield</div>
                      <div className="text-[rgba(var(--mg-accent),0.6)]">@Shield_GS</div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <PersonCard 
                title="Chief Security Officer"
                loreName="Christus Sanctus" 
                handle="Devil"
                level="board"
              />
              <div className="text-center text-xs text-[rgba(var(--mg-text),0.5)]">
                Corporate Security & Compliance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-lg relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
          
          <h2 className="mg-subtitle text-lg mb-6">Corporate Rank Structure</h2>
          
          <div className="space-y-3">
            {[
              { rank: "Board Member", level: "Executive", color: "bg-yellow-400/80" },
              { rank: "Director", level: "Senior Leadership", color: "bg-purple-400/80" },
              { rank: "Manager", level: "Management", color: "bg-green-400/80" },
              { rank: "Supervisor", level: "Team Lead", color: "bg-blue-400/80" },
              { rank: "Senior Employee", level: "Experienced", color: "bg-cyan-400/80" },
              { rank: "Employee", level: "Standard", color: "bg-gray-400/80" },
              { rank: "Intern/Freelancer", level: "Entry Level", color: "bg-slate-400/80" }
            ].map((item, i) => (
              <motion.div
                key={item.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3 bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.3)] rounded-lg hover:border-[rgba(var(--mg-primary),0.6)] transition-all"
              >
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${item.color} mr-3 shadow-lg`}></div>
                  <span className="mg-text font-semibold">{item.rank}</span>
                </div>
                <span className="text-xs text-[rgba(var(--mg-text),0.6)]">{item.level}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-lg relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
          
          <h2 className="mg-subtitle text-lg mb-6">Reporting Structure</h2>
          
          <div className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-4 border-yellow-400/60 rounded-lg"
            >
              <h3 className="text-sm font-semibold text-yellow-400/90 mb-2">Board Members</h3>
              <p className="text-xs text-[rgba(var(--mg-text),0.7)]">Report directly to CEO. Responsible for strategic oversight of their respective divisions.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-4 border-purple-400/60 rounded-lg"
            >
              <h3 className="text-sm font-semibold text-purple-400/90 mb-2">Subsidiary Directors</h3>
              <p className="text-xs text-[rgba(var(--mg-text),0.7)]">Report to COO. Manage day-to-day operations of AydoExpress, Empyrion Industries, and Midnight Security.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-4 border-green-400/60 rounded-lg"
            >
              <h3 className="text-sm font-semibold text-green-400/90 mb-2">Managers & Staff</h3>
              <p className="text-xs text-[rgba(var(--mg-text),0.7)]">Report through subsidiary chain of command. Handle operational tasks and team management.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderSubsidiariesTab = () => (
    <motion.div
      key="subsidiaries"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-6 rounded-lg relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
        
        <h2 className="mg-subtitle text-xl mb-6">Subsidiary Organizations</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AydoExpress */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center mb-6 p-4 bg-[rgba(var(--mg-panel-dark),0.6)] rounded-lg border border-[rgba(0,210,255,0.4)]">
              <div className="h-12 w-12 relative mr-4 rounded-lg overflow-hidden bg-[rgba(0,210,255,0.1)] flex items-center justify-center">
                <Image 
                  src="/images/Aydo_Express.png" 
                  alt="AydoExpress Logo" 
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="mg-subtitle text-lg text-[rgba(0,210,255,0.9)]">AydoExpress</h3>
                <p className="text-xs text-[rgba(var(--mg-text),0.6)]">Transportation & Logistics</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {[
                "Director", "Subdirector", "Manager", "Supervisor", 
                "Loadmaster", "Senior Service Agent", "Service Agent", "Associate", "Trainee"
              ].map((rank, i) => (
                <motion.div 
                  key={rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ x: 4 }}
                  className="flex items-center p-3 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-2 border-[rgba(0,210,255,0.6)] rounded-lg hover:bg-[rgba(var(--mg-panel-dark),0.7)] transition-all"
                >
                  <span className="mg-text text-sm">{rank}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Empyrion Industries */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center mb-6 p-4 bg-[rgba(var(--mg-panel-dark),0.6)] rounded-lg border border-[rgba(200,220,255,0.4)]">
              <div className="h-12 w-12 relative mr-4 rounded-lg overflow-hidden bg-[rgba(200,220,255,0.1)] flex items-center justify-center">
                <Image 
                  src="/images/Empyrion_Industries.png" 
                  alt="Empyrion Industries Logo" 
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="mg-subtitle text-lg text-[rgba(200,220,255,0.9)]">Empyrion Industries</h3>
                <p className="text-xs text-[rgba(var(--mg-text),0.6)]">Manufacturing & Engineering</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {[
                "Director", "Subdirector", "Manager", "Supervisor",
                "Journeyman", "Senior Specialist", "Specialist", "Technician", "Initiate"
              ].map((rank, i) => (
                <motion.div 
                  key={rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ x: 4 }}
                  className="flex items-center p-3 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-2 border-[rgba(200,220,255,0.6)] rounded-lg hover:bg-[rgba(var(--mg-panel-dark),0.7)] transition-all"
                >
                  <span className="mg-text text-sm">{rank}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Midnight Security */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center mb-6 p-4 bg-[rgba(var(--mg-panel-dark),0.6)] rounded-lg border border-[rgba(120,140,180,0.4)]">
              <div className="h-12 w-12 relative mr-4 rounded-lg overflow-hidden bg-[rgba(120,140,180,0.1)] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[rgba(120,140,180,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.141 13.669 2.931 18.16 5.25 21.15c1.094 1.39 2.362 2.393 3.75 2.85" />
                </svg>
              </div>
              <div>
                <h3 className="mg-subtitle text-lg text-[rgba(120,140,180,0.9)]">Midnight Security</h3>
                <p className="text-xs text-[rgba(var(--mg-text),0.6)]">Security & Risk Management</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {[
                "Director", "Vice Director", "Risk Manager", "Security Supervisor",
                "Compliance Officer", "Compliance Agent", "Security Specialist", "Security Associate", "Observer"
              ].map((rank, i) => (
                <motion.div 
                  key={rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ x: 4 }}
                  className="flex items-center p-3 bg-[rgba(var(--mg-panel-dark),0.5)] border-l-2 border-[rgba(120,140,180,0.6)] rounded-lg hover:bg-[rgba(var(--mg-panel-dark),0.7)] transition-all"
                >
                  <span className="mg-text text-sm">{rank}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(0,210,255,0.3)] rounded-lg text-center"
        >
          <h3 className="text-2xl font-quantify text-[rgba(0,210,255,0.9)] mb-2">3</h3>
          <p className="text-sm text-[rgba(var(--mg-text),0.7)]">Active Subsidiaries</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-primary),0.3)] rounded-lg text-center"
        >
          <h3 className="text-2xl font-quantify text-[rgba(var(--mg-primary),0.9)] mb-2">27</h3>
          <p className="text-sm text-[rgba(var(--mg-text),0.7)]">Total Rank Positions</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-accent),0.3)] rounded-lg text-center"
        >
          <h3 className="text-2xl font-quantify text-[rgba(var(--mg-accent),0.9)] mb-2">10</h3>
          <p className="text-sm text-[rgba(var(--mg-text),0.7)]">Leadership Roles</p>
        </motion.div>
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
            subsidiary management, and reporting relationships across all divisions.
          </p>
        </motion.div>

        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        <NavigationTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'hierarchy' && renderHierarchyTab()}
          {activeTab === 'subsidiaries' && renderSubsidiariesTab()}
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