'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionResponse, MissionParticipant } from '@/types/Mission';
import Image from 'next/image';
import { getShipByName, getDirectImagePath } from '@/types/ShipData';
import { LOCATION_OPTIONS } from '@/data/StarCitizenLocations';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface UserShip {
  shipId: string;
  name: string;
  type: string;
  manufacturer: string;
  image: string;
  crewRequirement: number;
  ownerId: string;
  ownerName: string;
  isGroundSupport?: boolean;
  missionRole?: string;
  equipment?: string;
  size?: string;
  length?: number;
  beam?: number;
  height?: number;
  cargoCapacity?: number;
  speedSCM?: number;
  speedBoost?: number;
  status?: string;
  role?: string;
}

interface User {
  userId: string;
  name: string;
  ships: UserShip[];
}

interface CrewAssignment {
  userId: string;
  userName: string;
  shipId: string;
  shipName: string;
  shipType: string;
  manufacturer: string;
  image: string;
  crewRequirement: number;
  role: string;
  isGroundSupport: boolean;
}

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  text: string;
  shipId: string | null;
}

interface MissionFormProps {
  mission?: MissionResponse | null;
  onSave: (m: MissionResponse) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

type TabId = 'basic' | 'personnel' | 'vessels';

// =============================================================================
// MISSION TYPE OPTIONS
// =============================================================================

const MISSION_TYPES = [
  'Cargo Haul',
  'Salvage Operation',
  'Bounty Hunting',
  'Exploration',
  'Reconnaissance',
  'Medical Support',
  'Combat Patrol',
  'Escort Duty',
  'Mining Expedition'
];

const MISSION_STATUSES = [
  'Planning',
  'Briefing',
  'In Progress',
  'Debriefing',
  'Completed',
  'Archived',
  'Cancelled'
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function createEmptyFormData(): Partial<MissionResponse> {
  return {
    id: `mission-${Date.now()}`,
    name: '',
    type: 'Cargo Haul',
    scheduledDateTime: new Date().toISOString(),
    status: 'Planning',
    briefSummary: '',
    details: '',
    location: '',
    leaderId: '',
    leaderName: '',
    images: [],
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function transformApiUser(apiUser: any): User {
  return {
    userId: apiUser.id,
    name: apiUser.aydoHandle,
    ships: (apiUser.ships || []).map((ship: any) => {
      const shipName = ship.name || 'Unnamed Ship';
      const shipType = ship.type || shipName;
      const details = getShipByName(shipName) ||
        (shipType !== shipName ? getShipByName(shipType) : null);
      const img = getDirectImagePath(shipName);

      if (details) {
        return {
          shipId: ship.id || `ship-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: shipName,
          type: shipType,
          manufacturer: ship.manufacturer || details.manufacturer,
          image: ship.image || img,
          crewRequirement: ship.crewRequirement || details.crewRequirement,
          ownerId: apiUser.id,
          ownerName: apiUser.aydoHandle,
          size: details.size,
          role: details.role?.join(', '),
          cargoCapacity: details.cargoCapacity,
          length: details.length,
          beam: details.beam,
          height: details.height,
          speedSCM: details.speedSCM,
          speedBoost: details.speedBoost,
          status: details.status
        } as UserShip;
      }

      return {
        shipId: ship.id || `ship-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: shipName,
        type: shipType,
        manufacturer: ship.manufacturer || 'Unknown Manufacturer',
        image: ship.image || img,
        crewRequirement: ship.crewRequirement || 1,
        ownerId: apiUser.id,
        ownerName: apiUser.aydoHandle,
        size: ship.size || 'Medium',
        role: ship.role || 'Multipurpose',
        cargoCapacity: ship.cargoCapacity || 0,
        length: ship.length || 0,
        beam: ship.beam || 0,
        height: ship.height || 0,
        speedSCM: ship.speedSCM || 0,
        status: 'Flight Ready'
      } as UserShip;
    })
  };
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const TabButton: React.FC<{
  id: TabId;
  label: string;
  activeTab: TabId;
  onClick: (id: TabId) => void;
}> = ({ id, label, activeTab, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(id)}
    className={`py-3 px-6 font-quantify tracking-wider text-sm relative ${
      activeTab === id
        ? 'text-[rgba(var(--mg-primary),1)] bg-[rgba(var(--mg-primary),0.1)]'
        : 'text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-primary),0.85)]'
    }`}
  >
    {label}
    {activeTab === id && (
      <motion.div
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[rgba(var(--mg-primary),0.8)]"
      />
    )}
  </button>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const MissionForm: React.FC<MissionFormProps> = ({
  mission,
  onSave,
  onCancel,
  onDelete
}) => {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [formData, setFormData] = useState<Partial<MissionResponse>>(createEmptyFormData());
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [crewAssignments, setCrewAssignments] = useState<CrewAssignment[]>([]);
  const [selectedShips, setSelectedShips] = useState<UserShip[]>([]);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [assignmentsFinalized, setAssignmentsFinalized] = useState(false);
  const [imageUploadUrl, setImageUploadUrl] = useState('');

  // Ship multi-select filters
  const [shipManufacturerFilter, setShipManufacturerFilter] = useState<string>('');
  const [shipSearchFilter, setShipSearchFilter] = useState<string>('');
  const [pendingShipSelections, setPendingShipSelections] = useState<Set<string>>(new Set());

  // ---------------------------------------------------------------------------
  // DERIVED STATE
  // ---------------------------------------------------------------------------
  const allShips = useMemo(() =>
    users.flatMap(u => u.ships.map(s => ({ ...s, ownerId: u.userId, ownerName: u.name }))),
    [users]
  );

  const manufacturers = useMemo(() =>
    Array.from(new Set(allShips.map(s => s.manufacturer).filter(Boolean))).sort(),
    [allShips]
  );

  const filteredShips = useMemo(() =>
    allShips.filter(s => {
      const matchesMfr = !shipManufacturerFilter || s.manufacturer === shipManufacturerFilter;
      const matchesSearch = !shipSearchFilter ||
        s.name.toLowerCase().includes(shipSearchFilter.toLowerCase()) ||
        s.type.toLowerCase().includes(shipSearchFilter.toLowerCase());
      return matchesMfr && matchesSearch;
    }),
    [allShips, shipManufacturerFilter, shipSearchFilter]
  );

  const unassignedCrew = useMemo(() =>
    selectedUsers.filter(u => !crewAssignments.some(a => a.userId === u.userId)),
    [selectedUsers, crewAssignments]
  );

  const groundSupportCrew = crewAssignments.filter(a => a.isGroundSupport);

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  // Initialize form data from mission prop
  useEffect(() => {
    if (mission) {
      setFormData({ ...mission });

      if (mission.participants?.length) {
        // Extract crew assignments from participants
        const assignments = mission.participants
          .filter(p => p.roles?.length)
          .map(p => ({
            userId: p.userId,
            userName: p.userName,
            shipId: p.shipId || '',
            shipName: p.shipName || '',
            shipType: p.shipType || '',
            manufacturer: p.manufacturer || '',
            image: p.image || '',
            crewRequirement: p.crewRequirement || 0,
            role: p.roles![0],
            isGroundSupport: !!p.isGroundSupport
          }));
        setCrewAssignments(assignments);

        // Extract unique ships from participants
        const ships = mission.participants
          .filter(p => p.shipId && p.shipName)
          .map(p => ({
            shipId: p.shipId!,
            name: p.shipName!,
            type: p.shipType || p.shipName!,
            manufacturer: p.manufacturer || '',
            image: p.image || '',
            crewRequirement: p.crewRequirement || 0,
            ownerId: p.userId,
            ownerName: p.userName
          }));
        // Deduplicate ships by shipId
        setSelectedShips([...new Map(ships.map(s => [s.shipId, s])).values()]);
      }
    } else {
      setFormData(createEmptyFormData());
      setSelectedUsers([]);
      setSelectedShips([]);
      setCrewAssignments([]);
    }
  }, [mission]);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/users');
        if (!res.ok) {
          console.error('Users fetch failed');
          setLoading(false);
          return;
        }
        const raw = await res.json();
        const apiUsers = Array.isArray(raw) ? raw : (raw?.items ?? []);
        const transformed: User[] = apiUsers.map(transformApiUser);
        setUsers(transformed);
      } catch (e) {
        console.error('Error fetching users:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const flash = (type: StatusMessage['type'], text: string, shipId: string | null = null) => {
    setStatusMessage({ type, text, shipId });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // User management
  const addUser = (u: User) => {
    if (!selectedUsers.some(x => x.userId === u.userId)) {
      setSelectedUsers([...selectedUsers, u]);
    }
  };

  const removeUser = (id: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.userId !== id));
    setCrewAssignments(crewAssignments.filter(a => a.userId !== id));
  };

  // Ship management
  const addShip = (ship: UserShip) => {
    const s = {
      ...ship,
      shipId: ship.shipId || `ship-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };
    if (selectedShips.some(x => x.shipId === s.shipId)) return;
    setSelectedShips([...selectedShips, s]);
    flash('success', `Added ${s.name} to mission vessels`, s.shipId);
  };

  const removeShip = (id: string) => {
    setSelectedShips(selectedShips.filter(s => s.shipId !== id));
    setCrewAssignments(crewAssignments.filter(a => a.shipId !== id));
  };

  const toggleShipSelection = (shipId: string) => {
    setPendingShipSelections(prev => {
      const next = new Set(prev);
      if (next.has(shipId)) {
        next.delete(shipId);
      } else {
        next.add(shipId);
      }
      return next;
    });
  };

  const addSelectedShipsToMission = () => {
    const shipsToAdd = allShips.filter(
      s => pendingShipSelections.has(s.shipId) && !selectedShips.some(ss => ss.shipId === s.shipId)
    );
    if (shipsToAdd.length > 0) {
      setSelectedShips([...selectedShips, ...shipsToAdd]);
      flash('success', `Added ${shipsToAdd.length} ship(s) to mission`);
    }
    setPendingShipSelections(new Set());
  };

  const isShipInMission = (shipId: string) => selectedShips.some(s => s.shipId === shipId);

  // Crew assignment
  const assignCrewToShip = (
    userId: string,
    userName: string,
    shipId: string,
    shipName: string,
    shipType: string,
    role: string,
    manufacturer = '',
    image = '',
    isGroundSupport = false,
    crewRequirement = 0
  ) => {
    // Handle ground support
    if (shipId === 'ground-support-temp') {
      isGroundSupport = true;
      shipId = '';
      shipName = 'Ground Support';
      shipType = 'Ground Support';
    }

    const removing = !shipId && !shipName && !shipType && !role;

    if (!shipId && !removing && !isGroundSupport) return;

    // Validate ship exists in mission (unless removing or ground support)
    if (!removing && shipId && !isGroundSupport && !selectedShips.some(s => s.shipId === shipId)) {
      flash('error', 'Error: Ship not found.');
      return;
    }

    // Remove assignment
    if (removing) {
      setCrewAssignments(crewAssignments.filter(a => a.userId !== userId));
      flash('success', `${userName} removed from crew assignments`);
      return;
    }

    const existing = crewAssignments.find(a => a.userId === userId);
    const msg = isGroundSupport
      ? (existing ? `${userName} reassigned as Ground Support (${role})` : `${userName} assigned as Ground Support (${role})`)
      : (existing ? `${userName} reassigned to ${shipName}` : `${userName} assigned to ${shipName} as ${role}`);

    const updated = [
      ...crewAssignments.filter(a => a.userId !== userId),
      {
        userId,
        userName,
        shipId,
        shipName,
        shipType,
        manufacturer,
        image,
        crewRequirement,
        role,
        isGroundSupport
      }
    ];
    setCrewAssignments(updated);
    flash('success', msg, isGroundSupport ? null : shipId);
  };

  const getShipCrew = (id: string) =>
    crewAssignments.filter(a => a.shipId === id && !a.isGroundSupport);

  // Image management
  const handleImageUpload = () => {
    if (!imageUploadUrl.trim()) return;
    updateFormData('images', [...(formData.images || []), imageUploadUrl.trim()]);
    setImageUploadUrl('');
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.type || !formData.scheduledDateTime || !formData.status) {
      alert('Fill required fields');
      return;
    }

    // Ensure assignments are finalized before saving
    if (crewAssignments.length && !assignmentsFinalized && activeTab === 'vessels') {
      flash('error', 'Finalize crew assignments before saving');
      return;
    }

    // Build participants from selected users and assignments
    const participants: MissionParticipant[] = selectedUsers.map(u => {
      const a = crewAssignments.find(c => c.userId === u.userId);
      return {
        userId: u.userId,
        userName: u.name,
        shipId: a?.shipId || undefined,
        shipName: a?.shipName || undefined,
        shipType: a?.shipType || undefined,
        manufacturer: a?.manufacturer || undefined,
        image: a?.image || undefined,
        crewRequirement: a?.crewRequirement || undefined,
        isGroundSupport: a?.isGroundSupport || false,
        roles: a ? [a.role] : []
      };
    });

    onSave({ ...(formData as MissionResponse), participants });
  };

  const handleDeleteMission = () => {
    if (mission?.id && onDelete) {
      onDelete(mission.id);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col space-y-6"
    >
      {/* Header */}
      <motion.div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="mg-button-secondary p-2"
          aria-label="Back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h1 className="mg-title text-3xl font-quantify tracking-wider flex-grow">
          {mission ? 'EDIT MISSION' : 'NEW MISSION'}
        </h1>
      </motion.div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-primary),0.15)] rounded-sm overflow-hidden"
      >
        {/* Tab Navigation */}
        <div className="flex border-b border-[rgba(var(--mg-primary),0.15)]">
          <TabButton id="basic" label="MISSION DETAILS" activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="personnel" label="PERSONNEL" activeTab={activeTab} onClick={setActiveTab} />
          <TabButton id="vessels" label="VESSEL ASSIGNMENTS" activeTab={activeTab} onClick={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Basic Details Tab */}
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Mission Name */}
                <div>
                  <label className="block text-sm mb-1">Mission Name *</label>
                  <input
                    className="mg-input w-full"
                    value={formData.name || ''}
                    onChange={e => updateFormData('name', e.target.value)}
                    required
                  />
                </div>

                {/* Type, Date, Status, Location Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-1">Mission Type *</label>
                    <select
                      className="mg-input w-full"
                      value={formData.type || 'Cargo Haul'}
                      onChange={e => updateFormData('type', e.target.value)}
                    >
                      {MISSION_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Scheduled Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="mg-input w-full"
                      value={new Date(formData.scheduledDateTime || '').toISOString().slice(0, 16)}
                      onChange={e => updateFormData(
                        'scheduledDateTime',
                        e.target.value ? new Date(e.target.value).toISOString() : null
                      )}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Mission Status *</label>
                    <select
                      className="mg-input w-full"
                      value={formData.status || 'Planning'}
                      onChange={e => updateFormData('status', e.target.value)}
                    >
                      {MISSION_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Starting Location *</label>
                    <select
                      className="mg-input w-full"
                      value={formData.location || ''}
                      onChange={e => updateFormData('location', e.target.value)}
                      required
                    >
                      <option value="">Select location...</option>
                      {LOCATION_OPTIONS.map(loc => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mission Details */}
                <div>
                  <label className="block text-sm mb-1">Mission Details</label>
                  <textarea
                    className="mg-input w-full min-h-[120px]"
                    value={formData.details || ''}
                    onChange={e => updateFormData('details', e.target.value)}
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm mb-2">Mission Images</label>
                  {formData.images?.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {formData.images.map((img, i) => (
                        <div
                          key={i}
                          className="relative aspect-video border border-[rgba(var(--mg-primary),0.25)] rounded-sm overflow-hidden"
                        >
                          <Image src={img} alt={`Mission ${i + 1}`} fill className="object-cover" />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500/80 p-1 rounded"
                            onClick={() => updateFormData(
                              'images',
                              formData.images!.filter((_, idx) => idx !== i)
                            )}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex">
                    <input
                      className="mg-input flex-grow rounded-l-sm"
                      placeholder="Image URL"
                      value={imageUploadUrl}
                      onChange={e => setImageUploadUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      className="mg-button-secondary px-4 rounded-r-sm"
                      disabled={!imageUploadUrl.trim()}
                      onClick={handleImageUpload}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Personnel Tab */}
            {activeTab === 'personnel' && (
              <motion.div
                key="personnel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Search Personnel */}
                <div>
                  <label className="block text-sm mb-1">Add Personnel</label>
                  <input
                    className="mg-input w-full"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="mt-2 max-h-52 overflow-y-auto border border-[rgba(var(--mg-primary),0.2)] rounded-sm bg-[rgba(var(--mg-panel-dark),0.6)]">
                      {loading ? (
                        <div className="p-3 text-sm">Searching...</div>
                      ) : (
                        users
                          .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map(u => (
                            <button
                              key={u.userId}
                              type="button"
                              disabled={selectedUsers.some(su => su.userId === u.userId)}
                              onClick={() => addUser(u)}
                              className={`block w-full text-left px-3 py-2 border-b last:border-b-0 border-[rgba(var(--mg-primary),0.1)] hover:bg-[rgba(var(--mg-primary),0.1)] ${
                                selectedUsers.some(s => s.userId === u.userId)
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              {u.name}
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Personnel */}
                <div>
                  <label className="block text-sm mb-2">Mission Personnel</label>
                  {selectedUsers.length === 0 ? (
                    <div className="mg-panel p-4 text-sm opacity-70">
                      No personnel assigned
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedUsers.map(u => (
                        <div
                          key={u.userId}
                          className="mg-panel p-3 flex justify-between items-center border border-[rgba(var(--mg-primary),0.15)] rounded-sm"
                        >
                          <span className="text-sm">{u.name}</span>
                          <button
                            type="button"
                            onClick={() => removeUser(u.userId)}
                            className="text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-error),0.9)]"
                            aria-label="Remove"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Vessel Assignments Tab */}
            {activeTab === 'vessels' && (
              <motion.div
                key="vessels"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Status Message */}
                {statusMessage && (
                  <div
                    className={`px-4 py-2 rounded-sm text-sm border ${
                      statusMessage.type === 'success'
                        ? 'border-[rgba(var(--mg-success),0.4)] bg-[rgba(var(--mg-success),0.1)]'
                        : statusMessage.type === 'error'
                        ? 'border-[rgba(var(--mg-error),0.4)] bg-[rgba(var(--mg-error),0.1)]'
                        : 'border-[rgba(var(--mg-primary),0.4)] bg-[rgba(var(--mg-primary),0.1)]'
                    }`}
                  >
                    {statusMessage.text}
                  </div>
                )}

                {/* Finalization Banner */}
                {crewAssignments.length > 0 && (
                  <div
                    className={`px-4 py-2 rounded-sm text-xs flex justify-between items-center border ${
                      assignmentsFinalized
                        ? 'border-[rgba(var(--mg-success),0.4)] bg-[rgba(var(--mg-success),0.1)]'
                        : 'border-[rgba(var(--mg-warning),0.4)] bg-[rgba(var(--mg-warning),0.1)]'
                    }`}
                  >
                    <span>
                      {assignmentsFinalized
                        ? 'Crew assignments finalized'
                        : 'Crew assignments need finalization'}
                    </span>
                    {!assignmentsFinalized && (
                      <button
                        type="button"
                        className="mg-button-primary py-1 px-2"
                        onClick={() => {
                          setAssignmentsFinalized(true);
                          flash('success', 'Assignments finalized');
                        }}
                      >
                        Finalize
                      </button>
                    )}
                  </div>
                )}

                {/* Ship Selection */}
                <div>
                  <div className="mb-3">
                    <label className="text-sm block mb-2">Add Vessels</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <select
                        className="mg-input text-xs flex-1 min-w-[140px]"
                        value={shipManufacturerFilter}
                        onChange={e => setShipManufacturerFilter(e.target.value)}
                      >
                        <option value="">All Manufacturers</option>
                        {manufacturers.map(mfr => (
                          <option key={mfr} value={mfr}>{mfr}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        className="mg-input text-xs flex-1 min-w-[140px]"
                        placeholder="Search ships..."
                        value={shipSearchFilter}
                        onChange={e => setShipSearchFilter(e.target.value)}
                      />
                      {pendingShipSelections.size > 0 && (
                        <button
                          type="button"
                          className="mg-button text-xs px-3"
                          onClick={addSelectedShipsToMission}
                        >
                          Add Selected ({pendingShipSelections.size})
                        </button>
                      )}
                    </div>

                    {/* Ship List */}
                    <div className="max-h-40 overflow-y-auto border border-[rgba(var(--mg-primary),0.2)] rounded-sm bg-[rgba(var(--mg-panel-dark),0.4)]">
                      {filteredShips.length === 0 ? (
                        <div className="p-3 text-xs opacity-70">No ships match filters</div>
                      ) : (
                        filteredShips.map(s => {
                          const inMission = isShipInMission(s.shipId);
                          const isPending = pendingShipSelections.has(s.shipId);
                          return (
                            <div
                              key={s.shipId}
                              className={`flex items-center gap-2 px-3 py-2 border-b last:border-b-0 border-[rgba(var(--mg-primary),0.1)] cursor-pointer ${
                                inMission
                                  ? 'opacity-50 bg-[rgba(var(--mg-success),0.1)]'
                                  : isPending
                                  ? 'bg-[rgba(var(--mg-primary),0.15)]'
                                  : 'hover:bg-[rgba(var(--mg-primary),0.1)]'
                              }`}
                              onClick={() => !inMission && toggleShipSelection(s.shipId)}
                            >
                              <input
                                type="checkbox"
                                checked={isPending || inMission}
                                disabled={inMission}
                                onChange={() => !inMission && toggleShipSelection(s.shipId)}
                                className="w-4 h-4"
                                onClick={e => e.stopPropagation()}
                              />
                              <span className="text-xs flex-1">
                                {s.name}{' '}
                                <span className="opacity-70">({s.ownerName})</span>
                              </span>
                              {inMission && (
                                <span className="text-[10px] text-[rgba(var(--mg-success),0.8)]">
                                  Added
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Selected Ships with Crew */}
                  {selectedShips.length === 0 ? (
                    <div className="mg-panel p-4 text-sm opacity-70">No vessels selected</div>
                  ) : (
                    <div className="space-y-4">
                      {selectedShips.map(ship => (
                        <div
                          key={ship.shipId}
                          className="mg-panel border border-[rgba(var(--mg-primary),0.2)] rounded-sm p-3"
                        >
                          {/* Ship Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex">
                              <div className="w-40 h-28 relative mr-3 border border-[rgba(var(--mg-primary),0.2)] rounded-sm overflow-hidden">
                                <Image
                                  src={ship.image}
                                  alt={ship.name}
                                  fill
                                  className="object-contain"
                                  sizes="160px"
                                  onError={e => {
                                    const t = e.target as HTMLImageElement;
                                    if (t.dataset.retried === 'y') {
                                      t.src = '/images/ship-placeholder.jpg';
                                    } else {
                                      t.dataset.retried = 'y';
                                      t.src = getDirectImagePath(ship.name);
                                    }
                                  }}
                                />
                              </div>
                              <div className="text-xs space-y-1">
                                <p className="text-sm font-medium">{ship.name}</p>
                                <p className="opacity-70">Owner: {ship.ownerName}</p>
                                <p className="opacity-70">Crew: {ship.crewRequirement || 'N/A'}</p>
                                {ship.role && <p className="opacity-70">Role: {ship.role}</p>}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeShip(ship.shipId)}
                              className="text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-error),0.9)]"
                              aria-label="Remove ship"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Assigned Crew */}
                          <div className="mt-3 space-y-2">
                            {getShipCrew(ship.shipId).length === 0 ? (
                              <p className="text-xs opacity-70">No crew assigned</p>
                            ) : (
                              getShipCrew(ship.shipId).map(c => (
                                <div
                                  key={c.userId}
                                  className="flex justify-between items-center bg-[rgba(var(--mg-panel-dark),0.3)] p-2 rounded-sm"
                                >
                                  <span className="text-xs">
                                    {c.userName}
                                    <span className="ml-2 px-2 py-0.5 border border-[rgba(var(--mg-primary),0.3)] rounded-sm">
                                      {c.role}
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => assignCrewToShip(c.userId, c.userName, '', '', '', '')}
                                    className="text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-error),0.9)]"
                                    aria-label="Remove crew"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={1.5}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Quick Assign Buttons */}
                          {unassignedCrew.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {unassignedCrew.slice(0, 3).map(u => (
                                <button
                                  key={u.userId}
                                  type="button"
                                  className="text-[10px] px-2 py-1 border border-[rgba(var(--mg-primary),0.3)] rounded-sm hover:bg-[rgba(var(--mg-primary),0.1)]"
                                  onClick={() =>
                                    assignCrewToShip(
                                      u.userId,
                                      u.name,
                                      ship.shipId,
                                      ship.name,
                                      ship.type,
                                      'Crew'
                                    )
                                  }
                                >
                                  + {u.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ground Support Section */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Ground Support</h3>
                  <div className="space-y-2">
                    {groundSupportCrew.length === 0 && (
                      <p className="text-xs opacity-70">None assigned</p>
                    )}
                    {groundSupportCrew.map(c => (
                      <div
                        key={c.userId}
                        className="flex justify-between items-center bg-[rgba(var(--mg-panel-dark),0.3)] p-2 rounded-sm"
                      >
                        <span className="text-xs">
                          {c.userName}
                          <span className="ml-2 px-2 py-0.5 border border-[rgba(var(--mg-success),0.4)] rounded-sm">
                            {c.role}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => assignCrewToShip(c.userId, c.userName, '', '', '', '')}
                          className="text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-error),0.9)]"
                          aria-label="Remove ground support"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Quick Assign Ground Support */}
                  {unassignedCrew.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {unassignedCrew.slice(0, 3).map(u => (
                        <button
                          key={u.userId}
                          type="button"
                          className="text-[10px] px-2 py-1 border border-[rgba(var(--mg-success),0.4)] rounded-sm hover:bg-[rgba(var(--mg-success),0.1)]"
                          onClick={() =>
                            assignCrewToShip(
                              u.userId,
                              u.name,
                              'ground-support-temp',
                              'Ground Support',
                              'Ground Support',
                              'Support',
                              '',
                              '',
                              true
                            )
                          }
                        >
                          + {u.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Unassigned Personnel */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Unassigned Personnel</h3>
                  {unassignedCrew.length === 0 ? (
                    <p className="text-xs opacity-70">All personnel assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {unassignedCrew.map(u => (
                        <span
                          key={u.userId}
                          className="text-[10px] px-2 py-1 border border-[rgba(var(--mg-primary),0.3)] rounded-sm"
                        >
                          {u.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 border-t border-[rgba(var(--mg-primary),0.2)] flex justify-between bg-[rgba(var(--mg-panel-dark),0.5)]">
          <div className="flex gap-3">
            <button
              type="button"
              className="mg-button-secondary px-6"
              onClick={onCancel}
            >
              CANCEL
            </button>
            {mission && onDelete && (
              <button
                type="button"
                className="mg-button-error px-6"
                onClick={handleDeleteMission}
              >
                DELETE MISSION
              </button>
            )}
          </div>
          <button type="submit" className="mg-button px-6">
            {mission ? 'UPDATE MISSION' : 'CREATE MISSION'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default MissionForm;
