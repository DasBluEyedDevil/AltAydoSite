'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MobiGlasPanel } from '@/components/ui/mobiglas';
import MobiGlasButton from '../ui/mobiglas/MobiGlasButton';
import {
  PlannedMission,
  PlannedMissionValidationErrors,
  MissionLeader,
  MissionShip,
  LEADERSHIP_ROLES,
  shipDetailsToMissionShip
} from '@/types/PlannedMission';
import { MissionTemplate, ActivityType, OperationType } from '@/types/MissionTemplate';
import { shipDatabase, ShipDetails, getShipImagePath } from '@/types/ShipData';

// Icons
const SpaceIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
  </svg>
);

const GroundIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18M3 12l4-4m-4 4l4 4M21 12l-4-4m4 4l-4 4" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const ShipIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// Activity icons
const ACTIVITY_ICONS: Record<ActivityType, JSX.Element> = {
  'Mining': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  'Salvage': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  'Escort': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  'Transport': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  'Medical': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  'Combat': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
};

const ACTIVITIES: ActivityType[] = ['Mining', 'Salvage', 'Escort', 'Transport', 'Medical', 'Combat'];

interface Leader {
  id: string;
  aydoHandle: string;
  discordName?: string;
  discordId?: string;
  position?: string;
  division?: string;
  clearanceLevel: number;
  photo?: string;
}

interface MissionPlannerFormProps {
  formData: Partial<PlannedMission>;
  errors: PlannedMissionValidationErrors;
  isLoading: boolean;
  isEditing: boolean;
  templates: MissionTemplate[];
  onInputChange: (field: keyof PlannedMission, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onPublishToDiscord?: () => void;
}

const MissionPlannerForm: React.FC<MissionPlannerFormProps> = ({
  formData,
  errors,
  isLoading,
  isEditing,
  templates,
  onInputChange,
  onSave,
  onCancel,
  onPublishToDiscord
}) => {
  // State for ship search
  const [shipSearch, setShipSearch] = useState('');
  const [showShipDropdown, setShowShipDropdown] = useState(false);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');

  // Get unique manufacturers and sizes from ship database
  const manufacturers = useMemo(() => {
    const unique = [...new Set(shipDatabase.map(s => s.manufacturer))];
    return unique.sort();
  }, []);

  const sizes = useMemo(() => {
    const unique = [...new Set(shipDatabase.map(s => s.size).filter(Boolean))] as string[];
    return unique;
  }, []);

  // Fetch leaders on mount
  useEffect(() => {
    async function fetchLeaders() {
      try {
        const res = await fetch('/api/users/leaders');
        if (res.ok) {
          const data = await res.json();
          setLeaders(data.leaders || []);
        }
      } catch (error) {
        console.error('Error fetching leaders:', error);
      } finally {
        setLoadingLeaders(false);
      }
    }
    fetchLeaders();
  }, []);

  // Filter ships based on search and filters
  const filteredShips = useMemo(() => {
    let filtered = shipDatabase;

    // Filter by manufacturer
    if (selectedManufacturer !== 'all') {
      filtered = filtered.filter(ship => ship.manufacturer === selectedManufacturer);
    }

    // Filter by size
    if (selectedSize !== 'all') {
      filtered = filtered.filter(ship => ship.size === selectedSize);
    }

    // Filter by search
    if (shipSearch) {
      const search = shipSearch.toLowerCase();
      filtered = filtered.filter(ship =>
        ship.name.toLowerCase().includes(search) ||
        ship.manufacturer.toLowerCase().includes(search) ||
        ship.role?.some(r => r.toLowerCase().includes(search))
      );
    }

    return filtered.slice(0, 30);
  }, [shipSearch, selectedManufacturer, selectedSize]);

  // Initialize ships array if empty
  useEffect(() => {
    if (!formData.ships) {
      onInputChange('ships', []);
    }
  }, []);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onInputChange('templateId', template.id);
      onInputChange('templateName', template.name);
      onInputChange('operationType', template.operationType);
      onInputChange('primaryActivity', template.primaryActivity);
      onInputChange('secondaryActivity', template.secondaryActivity);
      onInputChange('tertiaryActivity', template.tertiaryActivity);
      onInputChange('equipmentNotes', template.requiredEquipment);
    }
  };

  // Add ship to roster
  const addShip = (ship: ShipDetails) => {
    const ships = [...(formData.ships || [])];
    const existingIndex = ships.findIndex(s => s.shipName === ship.name);

    if (existingIndex >= 0) {
      // Increment quantity
      ships[existingIndex] = {
        ...ships[existingIndex],
        quantity: ships[existingIndex].quantity + 1
      };
    } else {
      // Add new ship
      ships.push(shipDetailsToMissionShip(ship));
    }

    onInputChange('ships', ships);
    setShowShipDropdown(false);
    setShipSearch('');
  };

  // Remove ship from roster
  const removeShip = (shipIndex: number) => {
    const ships = (formData.ships || []).filter((_, i) => i !== shipIndex);
    onInputChange('ships', ships);
  };

  // Update ship quantity
  const updateShipQuantity = (shipIndex: number, quantity: number) => {
    if (quantity < 1) return;
    const ships = [...(formData.ships || [])];
    ships[shipIndex] = { ...ships[shipIndex], quantity };
    onInputChange('ships', ships);
  };

  // Update ship notes
  const updateShipNotes = (shipIndex: number, notes: string) => {
    const ships = [...(formData.ships || [])];
    ships[shipIndex] = { ...ships[shipIndex], notes };
    onInputChange('ships', ships);
  };

  // Calculate total estimated crew
  const estimatedCrew = useMemo(() => {
    return (formData.ships || []).reduce((total, ship) => {
      const shipData = shipDatabase.find(sd => sd.name === ship.shipName);
      return total + (shipData?.crewRequirement || 1) * ship.quantity;
    }, 0);
  }, [formData.ships]);

  // Add leader
  const addLeader = () => {
    const newLeaders = [...(formData.leaders || [])];
    newLeaders.push({
      userId: '',
      aydoHandle: '',
      role: 'Mission Commander'
    });
    onInputChange('leaders', newLeaders);
  };

  // Update leader
  const updateLeader = (index: number, field: keyof MissionLeader, value: string) => {
    const newLeaders = [...(formData.leaders || [])];

    if (field === 'userId') {
      // Find the leader data
      const leader = leaders.find(l => l.id === value);
      if (leader) {
        newLeaders[index] = {
          ...newLeaders[index],
          userId: leader.id,
          aydoHandle: leader.aydoHandle,
          discordId: leader.discordId || undefined
        };
      }
    } else {
      newLeaders[index] = { ...newLeaders[index], [field]: value };
    }

    onInputChange('leaders', newLeaders);
  };

  // Remove leader
  const removeLeader = (index: number) => {
    const newLeaders = formData.leaders?.filter((_, i) => i !== index) || [];
    onInputChange('leaders', newLeaders);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <MobiGlasPanel
        title={isEditing ? 'Edit Mission' : 'Plan New Mission'}
        rightContent={
          <div className="flex items-center gap-2">
            <RocketIcon />
            <span className="text-sm text-[rgba(var(--mg-text),0.7)]">Mission Planner</span>
          </div>
        }
      >
        <div className="text-[rgba(var(--mg-text),0.7)]">
          Create a detailed mission plan by selecting specific ships from the compendium,
          assigning leaders, and setting the mission details. Publish to Discord when ready.
        </div>
      </MobiGlasPanel>

      {/* Template Selection (Optional) */}
      {templates.length > 0 && (
        <MobiGlasPanel title="Start from Template (Optional)">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.slice(0, 8).map(template => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-3 rounded border text-left transition-all ${
                  formData.templateId === template.id
                    ? 'border-[rgba(var(--mg-primary),0.8)] bg-[rgba(var(--mg-primary),0.1)]'
                    : 'border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.3)] hover:border-[rgba(var(--mg-primary),0.4)]'
                }`}
              >
                <div className="text-sm font-medium text-[rgba(var(--mg-text),0.9)] truncate">
                  {template.name}
                </div>
                <div className="text-xs text-[rgba(var(--mg-text),0.5)] mt-1">
                  {template.primaryActivity}
                </div>
              </motion.button>
            ))}
          </div>
        </MobiGlasPanel>
      )}

      {/* Basic Info */}
      <MobiGlasPanel title="Mission Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission Name */}
          <div className="md:col-span-2">
            <label className="mg-subtitle block mb-2">MISSION NAME *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => onInputChange('name', e.target.value)}
              className={`mg-input w-full text-lg ${errors.name ? 'border-[rgba(var(--mg-danger),0.5)]' : ''}`}
              placeholder="Operation Thunderstrike"
              maxLength={100}
            />
            {errors.name && (
              <div className="text-[rgba(var(--mg-danger),0.8)] text-sm mt-1">{errors.name}</div>
            )}
          </div>

          {/* Date/Time */}
          <div>
            <label className="mg-subtitle block mb-2">SCHEDULED DATE & TIME *</label>
            <input
              type="datetime-local"
              value={formData.scheduledDateTime ? formData.scheduledDateTime.slice(0, 16) : ''}
              onChange={(e) => onInputChange('scheduledDateTime', new Date(e.target.value).toISOString())}
              className={`mg-input w-full ${errors.scheduledDateTime ? 'border-[rgba(var(--mg-danger),0.5)]' : ''}`}
            />
            {errors.scheduledDateTime && (
              <div className="text-[rgba(var(--mg-danger),0.8)] text-sm mt-1">{errors.scheduledDateTime}</div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="mg-subtitle block mb-2">ESTIMATED DURATION</label>
            <select
              value={formData.duration || ''}
              onChange={(e) => onInputChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
              className="mg-input w-full"
            >
              <option value="">Not specified</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
              <option value="360">6 hours</option>
            </select>
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label className="mg-subtitle block mb-2">LOCATION / SYSTEM</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => onInputChange('location', e.target.value)}
              className="mg-input w-full"
              placeholder="e.g., Stanton System - Hurston"
              maxLength={100}
            />
          </div>
        </div>
      </MobiGlasPanel>

      {/* Operation Type - Visual Selection */}
      <MobiGlasPanel title="Operation Type">
        <div className="grid grid-cols-2 gap-4">
          {(['Space Operations', 'Ground Operations'] as OperationType[]).map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onInputChange('operationType', type)}
              className={`p-6 rounded-lg border-2 flex flex-col items-center gap-3 transition-all ${
                formData.operationType === type
                  ? 'border-[rgba(var(--mg-primary),0.8)] bg-[rgba(var(--mg-primary),0.15)]'
                  : 'border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.3)] hover:border-[rgba(var(--mg-primary),0.4)]'
              }`}
            >
              <div className={`${formData.operationType === type ? 'text-[rgba(var(--mg-primary),1)]' : 'text-[rgba(var(--mg-text),0.6)]'}`}>
                {type === 'Space Operations' ? <SpaceIcon /> : <GroundIcon />}
              </div>
              <span className={`font-medium ${formData.operationType === type ? 'text-[rgba(var(--mg-primary),1)]' : 'text-[rgba(var(--mg-text),0.8)]'}`}>
                {type}
              </span>
            </motion.button>
          ))}
        </div>
      </MobiGlasPanel>

      {/* Activities - Visual Badge Selection */}
      <MobiGlasPanel title="Mission Activities">
        <div className="space-y-4">
          <div className="text-[rgba(var(--mg-text),0.6)] text-sm">
            Select primary and optional secondary/tertiary activities
          </div>

          {/* Primary Activity */}
          <div>
            <label className="mg-subtitle block mb-3">PRIMARY ACTIVITY *</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITIES.map((activity) => (
                <motion.button
                  key={activity}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onInputChange('primaryActivity', activity)}
                  className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all ${
                    formData.primaryActivity === activity
                      ? 'border-[rgba(var(--mg-primary),0.8)] bg-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),1)]'
                      : 'border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.3)] text-[rgba(var(--mg-text),0.7)] hover:border-[rgba(var(--mg-primary),0.4)]'
                  }`}
                  disabled={activity === formData.secondaryActivity || activity === formData.tertiaryActivity}
                >
                  {ACTIVITY_ICONS[activity]}
                  <span>{activity}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Secondary Activity */}
          <div>
            <label className="mg-subtitle block mb-3">SECONDARY ACTIVITY</label>
            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onInputChange('secondaryActivity', undefined)}
                className={`px-4 py-2 rounded-full border transition-all ${
                  !formData.secondaryActivity
                    ? 'border-[rgba(var(--mg-text),0.4)] bg-[rgba(var(--mg-panel-dark),0.4)] text-[rgba(var(--mg-text),0.7)]'
                    : 'border-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-text),0.5)]'
                }`}
              >
                None
              </motion.button>
              {ACTIVITIES.filter(a => a !== formData.primaryActivity && a !== formData.tertiaryActivity).map((activity) => (
                <motion.button
                  key={activity}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onInputChange('secondaryActivity', activity)}
                  className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all ${
                    formData.secondaryActivity === activity
                      ? 'border-[rgba(var(--mg-secondary),0.8)] bg-[rgba(var(--mg-secondary),0.2)] text-[rgba(var(--mg-secondary),1)]'
                      : 'border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.3)] text-[rgba(var(--mg-text),0.7)] hover:border-[rgba(var(--mg-primary),0.4)]'
                  }`}
                >
                  {ACTIVITY_ICONS[activity]}
                  <span>{activity}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </MobiGlasPanel>

      {/* Leadership */}
      <MobiGlasPanel
        title="Leadership"
        rightContent={
          <MobiGlasButton
            onClick={addLeader}
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon />}
          >
            Add Leader
          </MobiGlasButton>
        }
      >
        <div className="space-y-4">
          <div className="text-[rgba(var(--mg-text),0.6)] text-sm">
            Assign unit leaders for this mission
          </div>

          {formData.leaders && formData.leaders.length > 0 ? (
            <div className="space-y-3">
              {formData.leaders.map((leader, index) => (
                <motion.div
                  key={index}
                  className="border border-[rgba(var(--mg-primary),0.2)] rounded p-4 bg-[rgba(var(--mg-panel-dark),0.3)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="mg-subtitle block mb-1 text-xs">ROLE</label>
                      <select
                        value={leader.role}
                        onChange={(e) => updateLeader(index, 'role', e.target.value)}
                        className="mg-input w-full text-sm"
                      >
                        {LEADERSHIP_ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mg-subtitle block mb-1 text-xs">LEADER</label>
                      <select
                        value={leader.userId}
                        onChange={(e) => updateLeader(index, 'userId', e.target.value)}
                        className="mg-input w-full text-sm"
                        disabled={loadingLeaders}
                      >
                        <option value="">Select Leader...</option>
                        {leaders.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.aydoHandle} {l.position ? `(${l.position})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <button
                        onClick={() => removeLeader(index)}
                        className="mg-btn-icon text-[rgba(var(--mg-danger),0.8)] hover:text-[rgba(var(--mg-danger),1)]"
                        title="Remove Leader"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[rgba(var(--mg-text),0.5)]">
              No leaders assigned. Click "Add Leader" to assign mission leadership.
            </div>
          )}
        </div>
      </MobiGlasPanel>

      {/* Ship Roster */}
      <MobiGlasPanel
        title="Ship Roster"
        rightContent={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[rgba(var(--mg-text),0.7)]">
              <ShipIcon />
              <span>Est. Crew: <strong className="text-[rgba(var(--mg-primary),1)]">{estimatedCrew}</strong></span>
            </div>
            <div className="relative">
              <MobiGlasButton
                onClick={() => setShowShipDropdown(!showShipDropdown)}
                variant="primary"
                size="sm"
                leftIcon={<PlusIcon />}
                rightIcon={<ChevronDownIcon />}
              >
                Add Ship
              </MobiGlasButton>

              {/* Ship Selection Dropdown */}
              <AnimatePresence>
                {showShipDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-96 max-h-[500px] overflow-hidden bg-[rgba(var(--mg-panel-dark),0.98)] border border-[rgba(var(--mg-primary),0.3)] rounded-lg shadow-xl z-50 flex flex-col"
                  >
                    {/* Filters */}
                    <div className="p-3 border-b border-[rgba(var(--mg-primary),0.2)] space-y-2">
                      {/* Search */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(var(--mg-text),0.5)]">
                          <SearchIcon />
                        </div>
                        <input
                          type="text"
                          value={shipSearch}
                          onChange={(e) => setShipSearch(e.target.value)}
                          className="mg-input w-full pl-10 text-sm"
                          placeholder="Search ships..."
                          autoFocus
                        />
                      </div>

                      {/* Manufacturer & Size Filters */}
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={selectedManufacturer}
                          onChange={(e) => setSelectedManufacturer(e.target.value)}
                          className="mg-input text-xs"
                        >
                          <option value="all">All Manufacturers</option>
                          {manufacturers.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="mg-input text-xs"
                        >
                          <option value="all">All Sizes</option>
                          {sizes.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Ship List */}
                    <div className="flex-1 overflow-auto p-2 space-y-1">
                      {filteredShips.length > 0 ? (
                        filteredShips.map(ship => (
                          <button
                            key={ship.name}
                            onClick={() => addShip(ship)}
                            className="w-full flex items-center gap-3 p-2 rounded hover:bg-[rgba(var(--mg-primary),0.1)] transition-colors text-left"
                          >
                            <div className="w-20 h-12 relative rounded overflow-hidden bg-[rgba(var(--mg-panel-dark),0.5)] flex-shrink-0">
                              <Image
                                src={ship.image}
                                alt={ship.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-[rgba(var(--mg-text),0.9)] truncate">
                                {ship.name}
                              </div>
                              <div className="text-xs text-[rgba(var(--mg-text),0.5)]">
                                {ship.manufacturer} • {ship.size || 'Unknown'}
                              </div>
                              {ship.role && (
                                <div className="text-xs text-[rgba(var(--mg-primary),0.7)] truncate">
                                  {ship.role.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-[rgba(var(--mg-text),0.5)] flex-shrink-0">
                              {ship.crewRequirement || 1} crew
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8 text-[rgba(var(--mg-text),0.5)]">
                          No ships found matching your criteria
                        </div>
                      )}
                    </div>

                    {/* Close button */}
                    <div className="p-2 border-t border-[rgba(var(--mg-primary),0.2)]">
                      <button
                        onClick={() => setShowShipDropdown(false)}
                        className="w-full mg-btn-sm text-center"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="text-[rgba(var(--mg-text),0.6)] text-sm">
            Select the specific ships for this mission from the compendium
          </div>

          {/* Ship Cards Grid */}
          {formData.ships && formData.ships.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.ships.map((ship, shipIndex) => (
                <motion.div
                  key={`${ship.shipName}-${shipIndex}`}
                  className="relative rounded-lg border border-[rgba(var(--mg-primary),0.3)] bg-[rgba(var(--mg-panel-dark),0.4)] overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                >
                  {/* Ship Image */}
                  <div className="aspect-video relative">
                    <Image
                      src={ship.image}
                      alt={ship.shipName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {/* Quantity Controls */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-[rgba(0,0,0,0.8)] rounded px-2 py-1">
                      <button
                        onClick={() => updateShipQuantity(shipIndex, ship.quantity - 1)}
                        className="text-sm hover:text-[rgba(var(--mg-primary),1)] px-1"
                        disabled={ship.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="text-sm font-bold min-w-[20px] text-center">x{ship.quantity}</span>
                      <button
                        onClick={() => updateShipQuantity(shipIndex, ship.quantity + 1)}
                        className="text-sm hover:text-[rgba(var(--mg-primary),1)] px-1"
                      >
                        +
                      </button>
                    </div>
                    {/* Remove Button */}
                    <button
                      onClick={() => removeShip(shipIndex)}
                      className="absolute top-2 left-2 p-1.5 bg-[rgba(var(--mg-danger),0.8)] rounded hover:bg-[rgba(var(--mg-danger),1)] transition-colors"
                    >
                      <TrashIcon />
                    </button>
                    {/* Size Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-[rgba(0,0,0,0.8)] rounded text-xs">
                      {ship.size}
                    </div>
                  </div>
                  {/* Ship Info */}
                  <div className="p-3">
                    <div className="text-sm font-medium text-[rgba(var(--mg-text),0.9)] truncate">
                      {ship.shipName}
                    </div>
                    <div className="text-xs text-[rgba(var(--mg-text),0.5)] mb-2">
                      {ship.manufacturer}
                    </div>
                    {/* Notes Input */}
                    <input
                      type="text"
                      value={ship.notes || ''}
                      onChange={(e) => updateShipNotes(shipIndex, e.target.value)}
                      className="mg-input w-full text-xs"
                      placeholder="Notes (e.g., Lead ship)"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-[rgba(var(--mg-primary),0.2)] rounded-lg">
              <ShipIcon />
              <div className="text-[rgba(var(--mg-text),0.5)] mt-2">
                No ships assigned. Click "Add Ship" to select vessels from the compendium.
              </div>
            </div>
          )}

          {errors.ships && (
            <div className="text-[rgba(var(--mg-danger),0.8)] text-sm">{errors.ships}</div>
          )}
        </div>
      </MobiGlasPanel>

      {/* Mission Briefing */}
      <MobiGlasPanel title="Mission Briefing">
        <div className="space-y-4">
          {/* Objectives */}
          <div>
            <label className="mg-subtitle block mb-2">OBJECTIVES</label>
            <textarea
              value={formData.objectives || ''}
              onChange={(e) => onInputChange('objectives', e.target.value)}
              className={`mg-input w-full h-24 resize-vertical ${errors.objectives ? 'border-[rgba(var(--mg-danger),0.5)]' : ''}`}
              placeholder="What are we trying to accomplish?"
              maxLength={1000}
            />
          </div>

          {/* Full Briefing */}
          <div>
            <label className="mg-subtitle block mb-2">DETAILED BRIEFING</label>
            <textarea
              value={formData.briefing || ''}
              onChange={(e) => onInputChange('briefing', e.target.value)}
              className="mg-input w-full h-40 resize-vertical"
              placeholder="Detailed mission plan, strategy, and instructions..."
              maxLength={5000}
            />
            <div className="text-xs text-[rgba(var(--mg-text),0.5)] mt-1">
              {(formData.briefing || '').length}/5000 characters
            </div>
          </div>

          {/* Equipment Notes */}
          <div>
            <label className="mg-subtitle block mb-2">EQUIPMENT RECOMMENDATIONS</label>
            <textarea
              value={formData.equipmentNotes || ''}
              onChange={(e) => onInputChange('equipmentNotes', e.target.value)}
              className="mg-input w-full h-24 resize-vertical"
              placeholder="Recommended gear, weapons, armor, etc."
              maxLength={2000}
            />
          </div>
        </div>
      </MobiGlasPanel>

      {/* Action Buttons */}
      <MobiGlasPanel title="Actions">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            {formData.status === 'DRAFT' && isEditing && onPublishToDiscord && (
              <MobiGlasButton
                onClick={onPublishToDiscord}
                variant="secondary"
                size="md"
                disabled={isLoading}
                leftIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
                  </svg>
                }
              >
                Publish to Discord
              </MobiGlasButton>
            )}
          </div>
          <div className="flex gap-3">
            <MobiGlasButton
              onClick={onCancel}
              variant="secondary"
              size="md"
              disabled={isLoading}
            >
              Cancel
            </MobiGlasButton>
            <MobiGlasButton
              onClick={onSave}
              variant="primary"
              size="md"
              disabled={isLoading}
              isLoading={isLoading}
              withGlow={!isLoading}
            >
              {isEditing ? 'Update Mission' : 'Save Draft'}
            </MobiGlasButton>
          </div>
        </div>
      </MobiGlasPanel>
    </div>
  );
};

export default MissionPlannerForm;
