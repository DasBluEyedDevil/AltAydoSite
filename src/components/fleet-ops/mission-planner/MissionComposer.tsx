'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MissionParticipant, MissionResponse } from '@/types/Mission';
import { getShipByName, getDirectImagePath, ShipDetails } from '@/types/ShipData';
import { loadShipDatabase } from '@/lib/ship-data';
import { LOCATION_OPTIONS } from '@/data/StarCitizenLocations';
import { motion, AnimatePresence } from 'framer-motion';
import ShipImage from '@/components/mission/ShipImage';
import AccordionSection from '@/components/mission/AccordionSection';

// Local types aligned with MissionForm
interface UserShip { 
  shipId: string; name: string; type: string; manufacturer: string; image: string; crewRequirement: number; ownerId: string; ownerName: string; 
  isGroundSupport?: boolean; missionRole?: string; equipment?: string; size?: string; length?: number; beam?: number; height?: number; cargoCapacity?: number; speedSCM?: number; speedBoost?: number; status?: string; role?: string; 
}
interface User { userId: string; name: string; ships: UserShip[]; }
interface CrewAssignment { userId: string; userName: string; shipId: string; shipName: string; shipType: string; manufacturer: string; image: string; crewRequirement: number; role: string; isGroundSupport: boolean; }

interface MissionComposerProps {
  mission?: MissionResponse | null;
  onSave: (m: MissionResponse) => void;
  onCancel: () => void;
  // Child-to-parent state reporting for header CTA logic and focus handling
  onState?: (s: { canSave: boolean; status?: string; firstInvalidId?: string | null }) => void;
}

// Pure helpers exported for tests
export const prepareParticipants = (
  selectedUsers: User[],
  crewAssignments: CrewAssignment[]
): MissionParticipant[] =>
  selectedUsers.map(u => {
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
      isGroundSupport: !!a?.isGroundSupport,
      roles: a ? [a.role] : []
    } as MissionParticipant;
  });

export const computeCanSave = (
  formData: Partial<MissionResponse>,
  selectedShips: UserShip[],
  getShipCrew: (id: string) => CrewAssignment[]
) => {
  const hasOverview = !!formData.name && !!formData.type && !!formData.scheduledDateTime;
  const shipsOk = selectedShips.every(s => (getShipCrew(s.shipId).length) <= (s.crewRequirement || Number.POSITIVE_INFINITY));
  return hasOverview && shipsOk;
};

const MissionComposer: React.FC<MissionComposerProps> = ({ mission, onSave, onCancel, onState }) => {
  // Section state
  const [openSection, setOpenSection] = useState<'overview'|'personnel'|'vessels'|'review'|null>(null);

  // Form + data states (ported from MissionForm)
  const [formData, setFormData] = useState<Partial<MissionResponse>>({ id:'', name:'', type:'Cargo Haul', scheduledDateTime:new Date().toISOString(), status:'Planning', briefSummary:'', details:'', location:'', leaderId:'', leaderName:'', images:[], participants:[], createdAt:'', updatedAt:'' });
  const [users,setUsers]=useState<User[]>([]);
  const [selectedUsers,setSelectedUsers]=useState<User[]>([]);
  const [searchTerm,setSearchTerm]=useState('');
  const [,setLoading]=useState(false);
  const [crewAssignments,setCrewAssignments]=useState<CrewAssignment[]>([]);
  const [selectedShips,setSelectedShips]=useState<UserShip[]>([]);
  // Ship multi-select state
  const [shipManufacturerFilter,setShipManufacturerFilter]=useState<string>('');
  const [shipSearchFilter,setShipSearchFilter]=useState<string>('');
  const [pendingShipSelections,setPendingShipSelections]=useState<Set<string>>(new Set());

  // Ship database state
  const [shipDatabase, setShipDatabase] = useState<ShipDetails[]>([]);
  const [shipsLoading, setShipsLoading] = useState(true);

  // Initialize from mission
  useEffect(()=>{
    if(mission){
      setFormData({...mission});
      if(mission.participants?.length){
        const assignments = mission.participants.filter(p=>p.roles?.length).map(p=>({ userId:p.userId,userName:p.userName, shipId:p.shipId||'', shipName:p.shipName||'', shipType:p.shipType||'', manufacturer:p.manufacturer||'', image:p.image||'', crewRequirement:p.crewRequirement||0, role:p.roles![0], isGroundSupport:!!p.isGroundSupport }));
        setCrewAssignments(assignments);
        const ships = mission.participants.filter(p=>p.shipId&&p.shipName).map(p=>({ shipId:p.shipId!, name:p.shipName!, type:p.shipType||p.shipName!, manufacturer:p.manufacturer||'', image:p.image||'', crewRequirement:p.crewRequirement||0, ownerId:p.userId, ownerName:p.userName }));
        setSelectedShips([...new Map(ships.map(s=>[s.shipId,s])).values()]);
      }
      setOpenSection('review');
    } else {
      setFormData({ id:`mission-${Date.now()}`, name:'', type:'Cargo Haul', scheduledDateTime:new Date().toISOString(), status:'Planning', briefSummary:'', details:'', location:'', leaderId:'', leaderName:'', images:[], participants:[], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() });
      setSelectedUsers([]); setSelectedShips([]); setCrewAssignments([]);
      setOpenSection('overview');
    }
  },[mission]);

  // Load ship database
  useEffect(() => {
    loadShipDatabase()
      .then(setShipDatabase)
      .catch(console.error)
      .finally(() => setShipsLoading(false));
  }, []);

  // Fetch users (ported)
  useEffect(()=>{ const fetchUsers=async()=>{ try{ setLoading(true); const res=await fetch('/api/users'); if(!res.ok){ console.error('Users fetch failed'); setLoading(false);return;} const raw=await res.json(); const apiUsers=Array.isArray(raw)?raw:(raw?.items??[]); const transformed:User[]=apiUsers.map((u:any)=>({ userId:u.id, name:u.aydoHandle, ships:(u.ships||[]).map((ship:any)=>{ const shipName=ship.name||'Unnamed Ship'; const shipType=ship.type||shipName; const details=getShipByName(shipName)|| (shipType!==shipName?getShipByName(shipType):null); const img=getDirectImagePath(shipName); if(details){ return { shipId:ship.id||`ship-${Date.now()}-${Math.random().toString(36).slice(2)}`, name:shipName, type:shipType, manufacturer:ship.manufacturer||details.manufacturer, image:ship.image||img, crewRequirement:ship.crewRequirement||details.crewRequirement, ownerId:u.id, ownerName:u.aydoHandle, size:details.size, role:details.role?.join(', '), cargoCapacity:details.cargoCapacity, length:details.length, beam:details.beam, height:details.height, speedSCM:details.speedSCM, speedBoost:details.speedBoost, status:details.status } as UserShip; } return { shipId:ship.id||`ship-${Date.now()}-${Math.random().toString(36).slice(2)}`, name:shipName, type:shipType, manufacturer:ship.manufacturer||'Unknown Manufacturer', image:ship.image||img, crewRequirement:ship.crewRequirement||1, ownerId:u.id, ownerName:u.aydoHandle, size:ship.size||'Medium', role:ship.role||'Multipurpose', cargoCapacity:ship.cargoCapacity||0, length:ship.length||0, beam:ship.beam||0, height:ship.height||0, speedSCM:ship.speedSCM||0, status:'Flight Ready' } as UserShip; }) })); setUsers(transformed);}catch(e){console.error(e);}finally{setLoading(false);} }; fetchUsers(); },[]);

  const updateFormData=(f:string,v:any)=>setFormData(p=>({...p,[f]:v,updatedAt:new Date().toISOString()}));
  const addUser=(u:User)=>!selectedUsers.some(x=>x.userId===u.userId)&&setSelectedUsers([...selectedUsers,u]);
  const removeUser=(id:string)=>{ setSelectedUsers(selectedUsers.filter(u=>u.userId!==id)); setCrewAssignments(crewAssignments.filter(a=>a.userId!==id)); };
  const addShip=(ship:UserShip)=>{ const s={...ship,shipId:ship.shipId||`ship-${Date.now()}-${Math.random().toString(36).slice(2)}`}; if(selectedShips.some(x=>x.shipId===s.shipId))return; setSelectedShips([...selectedShips,s]); };
  const removeShip=(id:string)=>{ setSelectedShips(selectedShips.filter(s=>s.shipId!==id)); setCrewAssignments(crewAssignments.filter(a=>a.shipId!==id)); };

  const assignCrewToShip=(userId:string,userName:string,shipId:string,shipName:string,shipType:string,role:string,manufacturer='',image='',isGroundSupport=false,crewRequirement=0)=>{
    if(shipId==='ground-support-temp'){isGroundSupport=true;shipId='';shipName='Ground Support';shipType='Ground Support';}
    const removing=!shipId&&!shipName&&!shipType&&!role;
    if(!shipId&&!removing&&!isGroundSupport)return;
    if(!removing&&shipId&&!isGroundSupport && !selectedShips.some(s=>s.shipId===shipId)){return;}
    if(removing){ setCrewAssignments(crewAssignments.filter(a=>a.userId!==userId)); return;}
    const updated=[...crewAssignments.filter(a=>a.userId!==userId),{userId,userName,shipId,shipName,shipType,manufacturer,image,crewRequirement,role,isGroundSupport}];
    setCrewAssignments(updated);
  };

  const getShipCrew=(id:string)=>crewAssignments.filter(a=>a.shipId===id&&!a.isGroundSupport);
  // Validity and reporting to parent
  const canSave = computeCanSave(formData, selectedShips, getShipCrew);
  useEffect(()=>{ onState?.({ canSave, status: formData.status, firstInvalidId: !canSave ? ( !formData.name ? 'mission-name' : (!formData.type ? 'mission-type' : (!formData.scheduledDateTime ? 'mission-datetime' : null) ) ) : null }); },[canSave, formData.status, formData.name, formData.type, formData.scheduledDateTime, onState]);

  // Save handler invoked by parent via custom event as well as local CTA
  useEffect(()=>{
    const handler = () => handleSubmit();
    window.addEventListener('mission-composer:save', handler);
    return () => window.removeEventListener('mission-composer:save', handler);
  });

  const handleSubmit=()=>{
    if(!canSave){
      // auto-open first invalid section
      if(!formData.name || !formData.type || !formData.scheduledDateTime){ setOpenSection('overview'); }
      return;
    }
    const participants = prepareParticipants(selectedUsers, crewAssignments);
    onSave({...(formData as MissionResponse), participants});
  };

  // Error badges
  const overviewErrors = (!formData.name ? 1 : 0) + (!formData.type ? 1 : 0) + (!formData.scheduledDateTime ? 1 : 0);
  const vesselsErrors = selectedShips.reduce((acc, s)=>{ const count = getShipCrew(s.shipId).length; const req = s.crewRequirement || Number.POSITIVE_INFINITY; return acc + (count>req ? 1 : 0); }, 0);
  const personnelErrors = 0; // not enforcing strict mapping

  // UI helpers

  const missionTypes = ['Cargo Haul','Salvage Operation','Bounty Hunting','Exploration','Reconnaissance','Medical Support','Combat Patrol','Escort Duty','Mining Expedition'];
  const statuses = ['Planning','Briefing','In Progress','Debriefing','Completed','Archived','Cancelled'];
  const roleOptions = ['Pilot','Co-Pilot','Gunner','Engineer','Medic','Navigator','Crew','Support'];
  const nameWithType = (name: string, type?: string) => (type && type !== name ? `${name} (${type})` : name);

  const goToSection = (s: 'overview'|'personnel'|'vessels'|'review') => {
    setOpenSection(s);
    // Focus and scroll to header for accessibility guidance
    setTimeout(() => {
      const header = document.getElementById(`${s}-header`) as HTMLButtonElement | null;
      if (header) {
        header.focus();
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  // Aggregate all ships for selection in Vessels
  const allShips: UserShip[] = useMemo(()=> users.flatMap(u=>u.ships),[users]);

  // Get unique manufacturers for filter dropdown
  const manufacturers: string[] = useMemo(() => {
    const mfrs = new Set(allShips.map(s => s.manufacturer).filter(Boolean));
    return Array.from(mfrs).sort();
  }, [allShips]);

  // Filter available ships based on manufacturer and search
  const filteredShips: UserShip[] = useMemo(() => {
    return allShips.filter(s => {
      const matchesMfr = !shipManufacturerFilter || s.manufacturer === shipManufacturerFilter;
      const matchesSearch = !shipSearchFilter ||
        s.name.toLowerCase().includes(shipSearchFilter.toLowerCase()) ||
        s.type.toLowerCase().includes(shipSearchFilter.toLowerCase());
      return matchesMfr && matchesSearch;
    });
  }, [allShips, shipManufacturerFilter, shipSearchFilter]);

  // Toggle ship selection for multi-select
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

  // Add all pending selections to mission
  const addSelectedShips = () => {
    const shipsToAdd = allShips.filter(s => pendingShipSelections.has(s.shipId) && !selectedShips.some(ss => ss.shipId === s.shipId));
    if (shipsToAdd.length > 0) {
      setSelectedShips([...selectedShips, ...shipsToAdd]);
    }
    setPendingShipSelections(new Set());
  };

  // Check if a ship is already in mission
  const isShipInMission = (shipId: string) => selectedShips.some(s => s.shipId === shipId);

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div>
        <AccordionSection id="overview" step={1} title="Overview" isOpen={openSection==='overview'} onToggle={()=> setOpenSection(prev => prev==='overview'? null : 'overview')} errorCount={overviewErrors} />
        <AnimatePresence>
          {openSection==='overview' && (
            <motion.div id="overview-panel" role="region" aria-labelledby="overview-header" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="p-4 border border-[rgba(var(--mg-primary),0.15)] bg-[rgba(var(--mg-panel-dark),0.4)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mission-name" className="block text-sm mg-text-secondary mb-1">Mission Name</label>
                  <input id="mission-name" aria-invalid={!formData.name} value={formData.name||''} onChange={e=>updateFormData('name', e.target.value)} className="w-full bg-transparent border border-[rgba(var(--mg-primary),0.3)] p-2 outline-none" />
                </div>
                <div>
                  <label htmlFor="mission-type" className="block text-sm mg-text-secondary mb-1">Type</label>
                  <select id="mission-type" aria-invalid={!formData.type} value={formData.type||''} onChange={e=>updateFormData('type', e.target.value)} className="w-full bg-transparent border border-[rgba(var(--mg-primary),0.3)] p-2 outline-none">
                    <option value="" className="bg-black">Select type</option>
                    {missionTypes.map(t=> <option key={t} value={t} className="bg-black">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="mission-status" className="block text-sm mg-text-secondary mb-1">Status</label>
                  <select id="mission-status" value={formData.status||''} onChange={e=>updateFormData('status', e.target.value)} className="w-full bg-transparent border border-[rgba(var(--mg-primary),0.3)] p-2 outline-none">
                    {statuses.map(s=> <option key={s} value={s} className="bg-black">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="mission-datetime" className="block text-sm mg-text-secondary mb-1">Scheduled Date/Time</label>
                  <input id="mission-datetime" type="datetime-local" aria-invalid={!formData.scheduledDateTime} value={formData.scheduledDateTime? new Date(formData.scheduledDateTime).toISOString().slice(0,16): ''} onChange={e=>updateFormData('scheduledDateTime', new Date(e.target.value).toISOString())} className="w-full bg-transparent border border-[rgba(var(--mg-primary),0.3)] p-2 outline-none" />
                </div>
                <div>
                  <label htmlFor="mission-location" className="block text-sm mg-text-secondary mb-1">Location</label>
                  <select id="mission-location" value={formData.location||''} onChange={e=>updateFormData('location', e.target.value)} className="w-full bg-transparent border border-[rgba(var(--mg-primary),0.3)] p-2 outline-none">
                    <option value="" className="bg-black">Select location...</option>
                    {LOCATION_OPTIONS.map(loc => (
                      <option key={loc.value} value={loc.value} className="bg-black">
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="mission-brief" className="block text-sm mg-text-secondary mb-1">Brief Summary</label>
                  <textarea id="mission-brief" value={formData.briefSummary||''} onChange={e=>updateFormData('briefSummary', e.target.value)} className="w-full bg-transparent border border-[rgba(var(--mg-primary),0.3)] p-2 outline-none" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {openSection==='overview' && (
          <div className="flex justify-end mt-2">
            <button className="text-xs underline" onClick={()=>goToSection('personnel')}>Next: Personnel</button>
          </div>
        )}
      </div>

      {/* Personnel */}
      <div>
        <AccordionSection id="personnel" step={2} title="Personnel" isOpen={openSection==='personnel'} onToggle={()=> setOpenSection(prev => prev==='personnel'? null : 'personnel')} errorCount={personnelErrors} />
        <AnimatePresence>
          {openSection==='personnel' && (
            <motion.div id="personnel-panel" role="region" aria-labelledby="personnel-header" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="p-4 border border-[rgba(var(--mg-primary),0.15)] bg-[rgba(var(--mg-panel-dark),0.4)] space-y-4">
              <div className="flex items-center space-x-2">
                <input aria-label="Search users" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="flex-1 bg-transparent border border-[rgba(var(--mg-primary),0.3)] p-2 outline-none" placeholder="Search users" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm mg-text-secondary mb-2">Directory</h4>
                  <div className="max-h-56 overflow-y-auto space-y-2">
                    {users.filter(u=>u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(u=> (
                      <div key={u.userId} className="flex items-center justify-between border border-[rgba(var(--mg-primary),0.2)] p-2">
                        <span className="text-sm">{u.name}</span>
                        <button className="text-xs underline" onClick={()=>addUser(u)}>Add</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm mg-text-secondary mb-2">Selected</h4>
                  <div className="space-y-2">
                    {selectedUsers.map(u=>{
                      return (
                        <div key={u.userId} className="border border-[rgba(var(--mg-primary),0.2)] p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{u.name}</span>
                            <div className="space-x-2">
                              <button className="text-xs underline" onClick={()=>removeUser(u.userId)}>Remove User</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {openSection==='personnel' && (
          <div className="flex justify-end mt-2">
            <button className="text-xs underline" onClick={()=>goToSection('vessels')}>Next: Vessels</button>
          </div>
        )}
      </div>

      {/* Vessels */}
      <div>
        <AccordionSection id="vessels" step={3} title="Vessels" isOpen={openSection==='vessels'} onToggle={()=> setOpenSection(prev => prev==='vessels'? null : 'vessels')} errorCount={vesselsErrors} />
        <AnimatePresence>
          {openSection==='vessels' && (
            <motion.div id="vessels-panel" role="region" aria-labelledby="vessels-header" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="p-4 border border-[rgba(var(--mg-primary),0.15)] bg-[rgba(var(--mg-panel-dark),0.4)] space-y-4">
              <div className="text-base md:text-lg font-semibold mg-text-secondary">Add vessels to this mission, then assign crew to each ship below.</div>
              <div>
                <h4 className="text-lg md:text-xl font-semibold mg-text-secondary mb-3">Available Ships</h4>
                {/* Filters - Persistent across selections */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <select
                    value={shipManufacturerFilter}
                    onChange={e => setShipManufacturerFilter(e.target.value)}
                    className="bg-transparent border border-[rgba(var(--mg-primary),0.3)] p-2 text-sm outline-none min-w-[160px]"
                  >
                    <option value="" className="bg-black">All Manufacturers</option>
                    {manufacturers.map(mfr => (
                      <option key={mfr} value={mfr} className="bg-black">{mfr}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={shipSearchFilter}
                    onChange={e => setShipSearchFilter(e.target.value)}
                    placeholder="Search ships..."
                    className="bg-transparent border border-[rgba(var(--mg-primary),0.3)] p-2 text-sm outline-none flex-1 min-w-[150px]"
                  />
                  {pendingShipSelections.size > 0 && (
                    <button
                      className="mg-button text-xs px-3 py-2"
                      onClick={addSelectedShips}
                    >
                      Add Selected ({pendingShipSelections.size})
                    </button>
                  )}
                </div>
                {/* Ship list with checkboxes for multi-select */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                  {filteredShips.map(s => {
                    const inMission = isShipInMission(s.shipId);
                    const isPending = pendingShipSelections.has(s.shipId);
                    return (
                      <div
                        key={`${s.shipId}-${s.ownerId}`}
                        className={`flex items-center gap-2 border p-2 cursor-pointer transition-colors ${
                          inMission
                            ? 'border-[rgba(var(--mg-success),0.4)] bg-[rgba(var(--mg-success),0.1)] opacity-60'
                            : isPending
                              ? 'border-[rgba(var(--mg-primary),0.6)] bg-[rgba(var(--mg-primary),0.15)]'
                              : 'border-[rgba(var(--mg-primary),0.2)] hover:border-[rgba(var(--mg-primary),0.4)]'
                        }`}
                        onClick={() => !inMission && toggleShipSelection(s.shipId)}
                      >
                        <input
                          type="checkbox"
                          checked={isPending || inMission}
                          disabled={inMission}
                          onChange={() => !inMission && toggleShipSelection(s.shipId)}
                          className="w-4 h-4 accent-[rgba(var(--mg-primary),1)]"
                          onClick={e => e.stopPropagation()}
                        />
                        <ShipImage model={s.name || s.type} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{nameWithType(s.name, s.type)}</div>
                          <div className="text-[10px] opacity-70">{s.manufacturer} | Crew: {s.crewRequirement||0}</div>
                        </div>
                        {inMission && <span className="text-[10px] text-[rgba(var(--mg-success),0.8)]">Added</span>}
                      </div>
                    );
                  })}
                </div>
                {filteredShips.length === 0 && (
                  <div className="text-sm opacity-70 text-center py-4">No ships match your filters</div>
                )}
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-semibold mg-text-secondary mb-3">Mission Vessels</h4>
                <div className="space-y-2">
                  {selectedShips.map(s=>{
                    const crew = getShipCrew(s.shipId);
                    const tally = `${crew.length}/${s.crewRequirement || '∞'}`;
                    const over = (s.crewRequirement || Number.POSITIVE_INFINITY) < crew.length;
                    return (
                      <div key={s.shipId} className={`border p-2 ${over? 'border-[rgba(var(--mg-danger),0.5)]':'border-[rgba(var(--mg-primary),0.2)]'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ShipImage model={s.name || s.type} size="sm" />
                            <div>
                              <div className="text-sm">{nameWithType(s.name, s.type)}</div>
                              <div className={`text-[10px] ${over? 'text-[rgba(var(--mg-danger),0.85)]':'opacity-70'}`}>Crew: {tally}</div>
                            </div>
                          </div>
                          <button className="text-xs underline" onClick={()=>removeShip(s.shipId)}>Remove</button>
                        </div>
                        {/* Crew assignments with role selector */}
                        <div className="pt-3 mt-3 border-t border-[rgba(var(--mg-primary),0.15)]">
                          <div className="text-sm md:text-base font-semibold mb-2">Crew Assignments</div>
                          <div className="space-y-2">
                          {crew.map(c => (
                            <div key={c.userId} className="flex items-center justify-between gap-2 border border-[rgba(var(--mg-primary),0.2)] p-2">
                              <div className="text-xs">{c.userName}</div>
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] mg-text-secondary">Role</label>
                                <select
                                  className="bg-transparent border border-[rgba(var(--mg-primary),0.3)] p-1 text-xs"
                                  value={c.role}
                                  onChange={e=>{
                                    const role = e.target.value;
                                    assignCrewToShip(c.userId, c.userName, s.shipId, s.name, s.type, role, s.manufacturer||'', s.image||'', false, s.crewRequirement||0);
                                  }}
                                >
                                  {roleOptions.map(r => <option key={r} value={r} className="bg-black">{r}</option>)}
                                </select>
                                <button className="text-xs underline" onClick={()=>assignCrewToShip(c.userId,c.userName,'', '', '', '')}>Remove</button>
                              </div>
                            </div>
                          ))}
                          </div>
                        </div>
                        {/* Quick assign: list unassigned crew */}
                        <div className="pt-3 mt-3 border-t border-[rgba(var(--mg-primary),0.15)]">
                          <div className="text-sm md:text-base font-semibold mb-2">Assign from Unassigned</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedUsers.filter(u=>!crewAssignments.some(a=>a.userId===u.userId && !a.isGroundSupport)).map(u=> (
                              <button key={u.userId} className="text-xs underline" onClick={()=>assignCrewToShip(u.userId,u.name,s.shipId,s.name,s.type,'Crew')}>{u.name}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {openSection==='vessels' && (
          <div className="flex justify-end mt-2">
            <button className="text-xs underline" onClick={()=>goToSection('review')}>Next: Review</button>
          </div>
        )}
      </div>

      {/* Review */}
      <div>
        <AccordionSection id="review" step={4} title="Review" isOpen={openSection==='review'} onToggle={()=> setOpenSection(prev => prev==='review'? null : 'review')} errorCount={overviewErrors + vesselsErrors + personnelErrors} />
        <AnimatePresence>
          {openSection==='review' && (
            <motion.div id="review-panel" role="region" aria-labelledby="review-header" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="p-4 border border-[rgba(var(--mg-primary),0.15)] bg-[rgba(var(--mg-panel-dark),0.4)] space-y-4">
              <div className="mg-text">
                <div className="text-sm">Participants: {prepareParticipants(selectedUsers, crewAssignments).length}</div>
                <div className="text-sm">Vessels: {selectedShips.length}</div>
              </div>
              {/* Fleet thumbnails */}
              {selectedShips.length > 0 && (
                <div>
                  <h4 className="text-sm mg-text-secondary mb-2">Fleet</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedShips.map(s => (
                      <div key={`rev-${s.shipId}`} className="flex items-center gap-3 border border-[rgba(var(--mg-primary),0.15)] p-2">
                        <ShipImage model={s.name || s.type} size="sm" />
                        <div className="min-w-0">
                          <div className="text-sm truncate">{s.name}</div>
                          <div className="text-[10px] opacity-70">{getShipCrew(s.shipId).length}/{s.crewRequirement || '∞'} crew</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(overviewErrors>0 || vesselsErrors>0) && (
                <div className="text-xs">
                  <div className="mb-1 mg-text-secondary">Validation</div>
                  <ul className="list-disc ml-5">
                    {overviewErrors>0 && <li><button className="underline" onClick={()=>setOpenSection('overview')}>Overview incomplete</button></li>}
                    {vesselsErrors>0 && <li><button className="underline" onClick={()=>setOpenSection('vessels')}>One or more vessels are over crew capacity</button></li>}
                  </ul>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button className="text-xs underline" onClick={onCancel}>Close</button>
                <button className={`text-xs underline ${!canSave? 'opacity-50 cursor-not-allowed':''}`} onClick={()=> canSave ? handleSubmit() : setOpenSection('overview')}>Save</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MissionComposer;
