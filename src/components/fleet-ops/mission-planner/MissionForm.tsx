import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionResponse, MissionType, MissionStatus, MissionParticipant } from '@/types/Mission';
import Image from 'next/image';
import { getShipByName, getShipsByType, getShipImagePath, getDirectImagePath, ShipDetails } from '@/types/ShipData';

// Updated ship interface to match requirements and Star Citizen ship data
interface UserShip {
  shipId: string;
  name: string;
  type: string;
  manufacturer: string;
  image: string;
  crewRequirement: number;
  ownerId: string; // Added to track ship ownership
  ownerName: string; // Added to display ship owner
  isGroundSupport?: boolean;
  missionRole?: string;
  equipment?: string;
  size?: string; // Small, Medium, Large
  length?: number; // Length in meters
  beam?: number; // Width in meters 
  height?: number; // Height in meters
  mass?: number; // Mass in kg
  cargoCapacity?: number; // Cargo capacity in SCU
  speedSCM?: number; // Standard Combat Maneuvering speed
  speedBoost?: number; // Boost speed
  status?: string; // Flight Ready, In Production, etc.
  showDetails?: boolean; // Added to track whether details are expanded
  role?: string;
}

// User interface
interface User {
  userId: string;
  name: string;
  ships: UserShip[];
}

// Crew assignment interface
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

// Status message interface
interface StatusMessage {
  type: 'success' | 'error' | 'info';
  text: string;
  shipId: string | null;
}

interface MissionFormProps {
  mission?: MissionResponse | null;
  onSave: (mission: MissionResponse) => void;
  onCancel: () => void;
  onDelete?: (missionId: string) => void;
}

const MissionForm: React.FC<MissionFormProps> = ({
  mission,
  onSave,
  onCancel,
  onDelete
}) => {
  // Tab navigation for form sections
  const [activeTab, setActiveTab] = useState<'basic' | 'personnel' | 'vessels'>('basic');
  
  // Basic mission info state
  const [formData, setFormData] = useState<Partial<MissionResponse>>({
    id: '',
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
    createdAt: '',
    updatedAt: ''
  });
  
  // Personnel and ship assignment states
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableShips, setAvailableShips] = useState<UserShip[]>([]);
  const [crewAssignments, setCrewAssignments] = useState<CrewAssignment[]>([]);
  const [selectedShips, setSelectedShips] = useState<UserShip[]>([]);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [showVesselSelector, setShowVesselSelector] = useState(false);
  const [customRole, setCustomRole] = useState('');
  const [imageUploadUrl, setImageUploadUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [assignmentsFinalized, setAssignmentsFinalized] = useState<boolean>(false);

  // Common mission roles
  const COMMON_ROLES = [
    'Commander', 'Pilot', 'Co-Pilot', 'Gunner', 'Engineer',
    'Medical Officer', 'Security', 'Cargo Specialist', 'Scout',
    'Salvage Specialist', 'Mining Lead', 'Combat Support',
    'Operations Lead', 'Navigation Officer', 'Ground Forces'
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // Initialize form data from mission prop
  useEffect(() => {
    if (mission) {
      setFormData({
        ...mission
      });
      
      // Initialize selected users from participants
      if (mission.participants && mission.participants.length > 0) {
        const userIds = mission.participants.map(p => p.userId);
        const missionUsers = users.filter(user => userIds.includes(user.userId));
        setSelectedUsers(missionUsers);
        
        // Set up crew assignments from participants
        const assignments: CrewAssignment[] = mission.participants
          .filter(p => p.shipId && p.shipName && p.roles && p.roles.length > 0)
          .map(p => ({
            userId: p.userId,
            userName: p.userName,
            shipId: p.shipId || '',
            shipName: p.shipName || '',
            shipType: p.shipType || '',
            manufacturer: p.manufacturer || '',
            image: p.image || '',
            crewRequirement: p.crewRequirement || 0,
            role: p.roles[0] || '',
            isGroundSupport: p.isGroundSupport || false
          }));
        
        setCrewAssignments(assignments);
        
        // Collect selected ships
        const ships = mission.participants
          .filter(p => p.shipId && p.shipName)
          .map(p => ({
            shipId: p.shipId || '',
            name: p.shipName || '',
            type: p.shipType || '',
            manufacturer: p.manufacturer || '',
            image: p.image || '',
            crewRequirement: p.crewRequirement || 0,
            ownerId: p.userId,
            ownerName: p.userName
          }));
        
        setSelectedShips([...new Map(ships.map(ship => [ship.shipId, ship])).values()]);
      }
    } else {
      // Reset form for new mission
      setFormData({
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
      });
      setSelectedUsers([]);
      setSelectedShips([]);
      setCrewAssignments([]);
    }
  }, [mission, users]);

  // Fetch users with their ships
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.status}`);
        }
        
        const apiUsers = await response.json();
        
        // Transform API users to the expected format
        const transformedUsers: User[] = apiUsers.map((apiUser: any) => ({
          userId: apiUser.id,
          name: apiUser.aydoHandle,
          ships: apiUser.ships ? apiUser.ships.map((ship: any) => {
            console.log(`Processing ship from API: ${JSON.stringify(ship)}`);
            
            // Get the ship name and type - ensure type is not undefined
            const shipName = ship.name || 'Unnamed Ship';
            // For ships, the type should be the same as the name unless specifically provided
            const shipType = ship.type || shipName; 
            
            // Look up in the ship database by name first
            const shipDetailsFromDB = getShipByName(shipName);
            console.log(`Looking up ship by name "${shipName}": ${shipDetailsFromDB ? 'Found' : 'Not found'}`);
            
            // If not found by name, try by type
            let shipDetails = shipDetailsFromDB;
            if (!shipDetails && shipType !== shipName) {
              shipDetails = getShipByName(shipType);
              console.log(`Looking up ship by type "${shipType}": ${shipDetails ? 'Found' : 'Not found'}`);
            }
            
            // Format image path directly
            const imagePath = getDirectImagePath(shipName);
            console.log(`Using image path: ${imagePath}`);
            
            // If we have ship details, use them. Otherwise create a default ship with available data
            if (shipDetails) {
              console.log(`Enriching ${shipName} with data from database`);
              return {
                shipId: ship.id || `ship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: shipName,
                type: shipType,
                manufacturer: ship.manufacturer || shipDetails.manufacturer,
                image: ship.image || imagePath,
                crewRequirement: ship.crewRequirement || shipDetails.crewRequirement,
                ownerId: apiUser.id,
                ownerName: apiUser.aydoHandle,
                size: shipDetails.size,
                role: shipDetails.role?.join(", "),
                cargoCapacity: shipDetails.cargoCapacity,
                length: shipDetails.length,
                beam: shipDetails.beam,
                height: shipDetails.height,
                speedSCM: shipDetails.speedSCM,
                speedBoost: shipDetails.speedBoost,
                status: shipDetails.status
              };
            } else {
              // For ships not in the database, create a reasonable default
              console.log(`No ship details found in database for ${shipName}, using defaults`);
              return {
                shipId: ship.id || `ship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: shipName,
                type: shipType,
                manufacturer: ship.manufacturer || "Unknown Manufacturer",
                image: ship.image || imagePath,
                crewRequirement: ship.crewRequirement || 1,
                ownerId: apiUser.id,
                ownerName: apiUser.aydoHandle,
                // Default values for ships not in database
                size: ship.size || "Medium",
                role: ship.role || "Multipurpose",
                cargoCapacity: ship.cargoCapacity || 0,
                length: ship.length || 0,
                beam: ship.beam || 0,
                height: ship.height || 0,
                speedSCM: ship.speedSCM || 0,
                status: "Flight Ready"
              };
            }
          }) : []
        }));
        
        setUsers(transformedUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.type || !formData.scheduledDateTime || !formData.status) {
      alert('Please fill out all required fields');
      return;
    }
    
    // Check if we have crew assignments that need to be finalized
    if (crewAssignments.length > 0 && !assignmentsFinalized && activeTab === 'vessels') {
      setStatusMessage({
        type: 'error',
        text: 'Please finalize your crew assignments before saving the mission',
        shipId: null
      });
      setTimeout(() => setStatusMessage(null), 5000);
      return;
    }
    
    // Prepare participants data from selected users and ship assignments
    const participants: MissionParticipant[] = selectedUsers.map(user => {
      // Find any ship assignments for this user
      const assignment = crewAssignments.find(a => a.userId === user.userId);
      
      return {
        userId: user.userId,
        userName: user.name,
        shipId: assignment?.shipId,
        shipName: assignment?.shipName,
        shipType: assignment?.shipType,
        manufacturer: assignment?.manufacturer,
        image: assignment?.image,
        crewRequirement: assignment?.crewRequirement,
        isGroundSupport: assignment?.isGroundSupport || false,
        roles: assignment ? [assignment.role] : []
      };
    });
    
    // Create final mission data
    const finalMissionData: MissionResponse = {
      ...(formData as MissionResponse),
      participants
    };
    
    onSave(finalMissionData);
  };

  // Handle mission deletion
  const handleDeleteMission = () => {
    if (mission && mission.id && onDelete) {
      onDelete(mission.id);
    }
  };

  // Format date for the datetime-local input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  // Add user to selected users
  const addUser = (user: User) => {
    if (!selectedUsers.some(u => u.userId === user.userId)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Remove user from selected users
  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.userId !== userId));
    // Also remove any crew assignments for this user
    setCrewAssignments(crewAssignments.filter(a => a.userId !== userId));
  };

  // Add ship to selected ships
  const addShip = (ship: UserShip) => {
    // Make sure the ship has a valid ID
    const shipWithId = {
      ...ship,
      shipId: ship.shipId || `ship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log(`Adding ship: ${shipWithId.name} (${shipWithId.type})`);
    
    // Look up in the ship database by name first
    let shipDetails = getShipByName(shipWithId.name);
    console.log(`Looking up ship by name "${shipWithId.name}": ${shipDetails ? 'Found' : 'Not found'}`);
    
    // If not found by name, try by type
    if (!shipDetails && shipWithId.type) {
      shipDetails = getShipByName(shipWithId.type);
      console.log(`Looking up ship by type "${shipWithId.type}": ${shipDetails ? 'Found' : 'Not found'}`);
    }
    
    // Format the image path directly
    const imagePath = getDirectImagePath(shipWithId.name);
    console.log(`Using image path: ${imagePath}`);
    
    // Create enriched ship object
    let enrichedShip: UserShip;
    
    // If ship details found, enrich with database data
    if (shipDetails) {
      console.log(`Enriching ${shipWithId.name} with data from database`);
      enrichedShip = {
        ...shipWithId,
        manufacturer: shipWithId.manufacturer || shipDetails.manufacturer,
        type: shipWithId.type || shipDetails.type,
        size: shipWithId.size || shipDetails.size,
        role: shipWithId.role || shipDetails.role?.join(", ") || "",
        crewRequirement: shipWithId.crewRequirement || shipDetails.crewRequirement,
        cargoCapacity: shipWithId.cargoCapacity || shipDetails.cargoCapacity,
        length: shipWithId.length || shipDetails.length,
        beam: shipWithId.beam || shipDetails.beam,
        height: shipWithId.height || shipDetails.height,
        speedSCM: shipWithId.speedSCM || shipDetails.speedSCM,
        speedBoost: shipWithId.speedBoost || shipDetails.speedBoost,
        status: shipWithId.status || shipDetails.status,
        image: shipWithId.image || imagePath
      };
    } else {
      // For ships not in the database, create a reasonable default
      console.log(`No ship details found in database for ${shipWithId.name}, using defaults`);
      enrichedShip = {
        ...shipWithId,
        manufacturer: shipWithId.manufacturer || "Unknown Manufacturer",
        type: shipWithId.type || shipWithId.name,
        size: shipWithId.size || "Medium",
        role: shipWithId.role || "Multipurpose",
        crewRequirement: shipWithId.crewRequirement || 1,
        cargoCapacity: shipWithId.cargoCapacity || 0,
        length: shipWithId.length || 0,
        beam: shipWithId.beam || 0,
        height: shipWithId.height || 0,
        speedSCM: shipWithId.speedSCM || 0,
        status: "Flight Ready",
        image: shipWithId.image || imagePath
      };
    }
    
    if (!selectedShips.some(s => s.shipId === enrichedShip.shipId)) {
      setSelectedShips([...selectedShips, enrichedShip]);
      
      // Add status message for visual feedback
      setStatusMessage({
        type: 'success',
        text: `Added ${enrichedShip.name} to mission vessels`,
        shipId: enrichedShip.shipId
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Remove ship from selected ships
  const removeShip = (shipId: string) => {
    setSelectedShips(selectedShips.filter(s => s.shipId !== shipId));
    // Also remove any crew assignments to this ship
    setCrewAssignments(crewAssignments.filter(a => a.shipId !== shipId));
  };

  // Update the assignCrewToShip function to improve tracking of assignments
  const assignCrewToShip = (
    userId: string, 
    userName: string, 
    shipId: string, 
    shipName: string, 
    shipType: string, 
    role: string, 
    manufacturer: string = '', 
    image: string = '',
    isGroundSupport: boolean = false,
    crewRequirement: number = 0
  ) => {
    // Special handling for ground-support-temp - convert to proper ground support format
    if (shipId === 'ground-support-temp') {
      isGroundSupport = true;
      shipId = ''; // Clear the temporary ID
      shipName = 'Ground Support';
      shipType = 'Ground Support';
      console.log('Converting to ground support assignment', { userId, userName, isGroundSupport });
    }
    
    // Only allow empty shipId when explicitly removing an assignment or for ground support
    const isRemovingAssignment = shipId === '' && shipName === '' && shipType === '' && role === '';
    
    // If shipId is empty and we're not explicitly removing or ground support, log an error and return
    if (!shipId && !isRemovingAssignment && !isGroundSupport) {
      console.error('Invalid assignment: shipId is empty but not explicitly removing assignment');
      return;
    }
    
    // If we're adding an assignment, verify the ship exists in selectedShips (unless ground support)
    if (!isRemovingAssignment && shipId && !isGroundSupport) {
      const shipExists = selectedShips.some(s => s.shipId === shipId);
      if (!shipExists) {
        console.error(`Cannot assign crew: Ship with ID ${shipId} not found in selected ships`);
        setStatusMessage({
          type: 'error',
          text: `Error: Ship not found. Please try again.`,
          shipId: null
        });
        setTimeout(() => setStatusMessage(null), 3000);
        return;
      }
    }
    
    console.log('Current crewAssignments:', JSON.stringify(crewAssignments.map(a => ({
      userId: a.userId,
      userName: a.userName,
      shipId: a.shipId,
      shipName: a.shipName,
      role: a.role,
      isGroundSupport: a.isGroundSupport
    }))));
    
    // If shipId is empty, we're removing the assignment
    if (isRemovingAssignment) {
      // Remove any existing assignment for this user
      const updatedAssignments = crewAssignments.filter(a => a.userId !== userId);
      console.log(`Removed crew assignment for ${userName}`);
      console.log('Updated assignments after removal:', updatedAssignments.length);
      setCrewAssignments(updatedAssignments);
      
      // Show a temporary status message
      setStatusMessage({
        type: 'success',
        text: `${userName} removed from crew assignments`,
        shipId: null
      });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    
    // Check if user is already assigned to a different ship
    const existingAssignment = crewAssignments.find(a => a.userId === userId);
    
    // Prepare message text based on ground support or ship assignment
    let messageText = '';
    if (isGroundSupport) {
      messageText = existingAssignment 
        ? `${userName} reassigned as Ground Support with role: ${role}` 
        : `${userName} assigned as Ground Support with role: ${role}`;
    } else {
      messageText = existingAssignment 
        ? `${userName} reassigned from ${existingAssignment.shipName} to ${shipName}` 
        : `${userName} assigned to ${shipName} as ${role}`;
    }
    
    // Show status message
    setStatusMessage({
      type: 'success',
      text: messageText,
      shipId: isGroundSupport ? null : shipId
    });
    
    // Create a copy of the current assignments, excluding this user
    const updatedAssignments = [...crewAssignments.filter(a => a.userId !== userId)];
    
    // Create the new assignment
    const newAssignment: CrewAssignment = {
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
    };
    
    // Add the new assignment
    updatedAssignments.push(newAssignment);
    setCrewAssignments(updatedAssignments);
    
    console.log(`Assigned ${userName} to ${isGroundSupport ? 'Ground Support' : shipName} as ${role}`);
    console.log('Updated assignments after adding:', updatedAssignments.length);
    
    // Clear the status message after a delay
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!imageUploadUrl.trim()) return;
    
    // Check if the input is a URL
    if (imageUploadUrl.startsWith('http')) {
      // Just add the URL directly to the images array
      const newImages = [...(formData.images || []), imageUploadUrl];
      updateFormData('images', newImages);
      setImageUploadUrl('');
      return;
    }
    
    // If not a URL, try to use a local image ID or fallback to direct URL use
    try {
      // For now, just add the URL directly as fallback
      const newImages = [...(formData.images || []), imageUploadUrl];
      updateFormData('images', newImages);
      setImageUploadUrl('');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again or use a direct URL.');
    }
  };

  // Update a ship property
  const updateShipProperty = (shipId: string, property: string, value: any) => {
    const updatedShips = selectedShips.map(s => 
      s.shipId === shipId 
        ? {...s, [property]: value} 
        : s
    );
    setSelectedShips(updatedShips);
  };

  // Enrich ship data with Star Citizen wiki information
  const enrichShipData = (ship: UserShip): UserShip => {
    console.log(`Enriching ship data for: ${ship.name} (Type: ${ship.type})`);

    // First try to find by exact name
    let shipDetails = getShipByName(ship.name);
    
    // If not found by name, try by type
    if (!shipDetails) {
      shipDetails = getShipByName(ship.type);
    }
    
    // If still not found, try searching in types
    if (!shipDetails) {
      const typeMatches = getShipsByType(ship.type);
      if (typeMatches.length > 0) {
        shipDetails = typeMatches[0];
      }
    }
    
    // Format the image path directly the same way it's used in userprofile
    const formattedImageName = (ship.type || ship.name).toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[\.']/g, '')
      .replace(/\//g, '_')
      .replace(/[āáàäâã]/g, 'a')
      .replace(/[ēéèëê]/g, 'e')
      .replace(/[īíìïî]/g, 'i')
      .replace(/[ōóòöôõ]/g, 'o')
      .replace(/[ūúùüû]/g, 'u')
      .replace(/[ÿý]/g, 'y');
    
    const imagePath = `/images/${formattedImageName}.png`;
    console.log(`Using direct image path: ${imagePath}`);
    
    if (shipDetails) {
      console.log(`Found ship details in database: ${shipDetails.name}`);
      console.log(`Details: ${shipDetails.manufacturer}, ${shipDetails.size}, ${shipDetails.role?.join(',')}`);
      
      return { 
        ...ship, 
        manufacturer: ship.manufacturer || shipDetails.manufacturer,
        crewRequirement: ship.crewRequirement || shipDetails.crewRequirement,
        size: ship.size || shipDetails.size,
        cargoCapacity: ship.cargoCapacity || shipDetails.cargoCapacity,
        speedSCM: ship.speedSCM || shipDetails.speedSCM,
        speedBoost: ship.speedBoost || shipDetails.speedBoost,
        length: ship.length || shipDetails.length,
        beam: ship.beam || shipDetails.beam,
        height: ship.height || shipDetails.height,
        image: imagePath,
        role: shipDetails.role?.join(", ") || ""
      };
    }
    
    // If not found, return with default values and our direct path
    console.warn(`No ship details found in database for: ${ship.name} (Type: ${ship.type})`);
    
    return {
      ...ship,
      manufacturer: ship.manufacturer || 'Unknown',
      crewRequirement: ship.crewRequirement || 1,
      size: ship.size || 'Medium',
      image: imagePath
    };
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="mg-button-secondary p-2 rounded-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="mg-title text-3xl font-quantify tracking-wider flex-grow">
          {mission ? 'EDIT MISSION' : 'NEW MISSION'}
        </h1>
      </motion.div>

      {/* Form Container */}
      <motion.div variants={itemVariants}>
        <form onSubmit={handleSubmit} className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-primary),0.15)] rounded-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-[rgba(var(--mg-primary),0.15)]">
            <button
              type="button"
              className={`py-3 px-6 font-quantify tracking-wider text-sm transition-colors relative ${
                activeTab === 'basic'
                  ? 'text-[rgba(var(--mg-primary),1)] bg-[rgba(var(--mg-primary),0.1)]'
                  : 'text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-primary),0.8)]'
              }`}
              onClick={() => setActiveTab('basic')}
            >
              MISSION DETAILS
              {activeTab === 'basic' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[rgba(var(--mg-primary),0.8)]"
                />
              )}
            </button>
            
            <button
              type="button"
              className={`py-3 px-6 font-quantify tracking-wider text-sm transition-colors relative ${
                activeTab === 'personnel'
                  ? 'text-[rgba(var(--mg-primary),1)] bg-[rgba(var(--mg-primary),0.1)]'
                  : 'text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-primary),0.8)]'
              }`}
              onClick={() => setActiveTab('personnel')}
            >
              PERSONNEL
              {activeTab === 'personnel' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[rgba(var(--mg-primary),0.8)]"
                />
              )}
            </button>
            
            <button
              type="button"
              className={`py-3 px-6 font-quantify tracking-wider text-sm transition-colors relative ${
                activeTab === 'vessels'
                  ? 'text-[rgba(var(--mg-primary),1)] bg-[rgba(var(--mg-primary),0.1)]'
                  : 'text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-primary),0.8)]'
              }`}
              onClick={() => setActiveTab('vessels')}
            >
              VESSEL ASSIGNMENTS
              {activeTab === 'vessels' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[rgba(var(--mg-primary),0.8)]"
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <BasicInfoTab 
                  formData={formData} 
                  updateFormData={updateFormData} 
                  imageUploadUrl={imageUploadUrl}
                  setImageUploadUrl={setImageUploadUrl}
                  handleImageUpload={handleImageUpload}
                />
              )}
              
              {activeTab === 'personnel' && (
                <PersonnelTab 
                  users={users} 
                  selectedUsers={selectedUsers}
                  addUser={addUser}
                  removeUser={removeUser}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  loading={loading}
                />
              )}
              
              {activeTab === 'vessels' && (
                <VesselAssignmentTab 
                  selectedUsers={selectedUsers}
                  selectedShips={selectedShips}
                  addShip={addShip}
                  removeShip={removeShip}
                  setSelectedShips={setSelectedShips}
                  crewAssignments={crewAssignments}
                  assignCrewToShip={assignCrewToShip}
                  commonRoles={COMMON_ROLES}
                  statusMessage={statusMessage}
                  setStatusMessage={setStatusMessage}
                  assignmentsFinalized={assignmentsFinalized}
                  setAssignmentsFinalized={setAssignmentsFinalized}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 border-t border-[rgba(var(--mg-primary),0.2)] flex justify-between bg-[rgba(var(--mg-panel-dark),0.5)]">
            <div className="flex space-x-3">
              <button
                type="button"
                className="mg-button-secondary py-2 px-6 text-sm font-quantify tracking-wider"
                onClick={onCancel}
              >
                CANCEL
              </button>

              {mission && onDelete && (
                <button
                  type="button"
                  className="mg-button-error py-2 px-6 text-sm font-quantify tracking-wider"
                  onClick={handleDeleteMission}
                >
                  DELETE MISSION
                </button>
              )}
            </div>

            <button
              type="submit"
              className="mg-button py-2 px-6 text-sm font-quantify tracking-wider"
            >
              {mission ? 'UPDATE MISSION' : 'CREATE MISSION'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Tab Component Interfaces
interface BasicInfoTabProps {
  formData: Partial<MissionResponse>;
  updateFormData: (field: string, value: any) => void;
  imageUploadUrl: string;
  setImageUploadUrl: (url: string) => void;
  handleImageUpload: () => void;
}

interface PersonnelTabProps {
  users: User[];
  selectedUsers: User[];
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loading: boolean;
}

interface VesselAssignmentTabProps {
  selectedUsers: User[];
  selectedShips: UserShip[];
  addShip: (ship: UserShip) => void;
  removeShip: (shipId: string) => void;
  setSelectedShips: (ships: UserShip[]) => void;
  crewAssignments: CrewAssignment[];
  assignCrewToShip: (userId: string, userName: string, shipId: string, shipName: string, shipType: string, role: string, manufacturer?: string, image?: string, isGroundSupport?: boolean, crewRequirement?: number) => void;
  commonRoles: string[];
  statusMessage: StatusMessage | null;
  setStatusMessage: (message: StatusMessage | null) => void;
  assignmentsFinalized: boolean;
  setAssignmentsFinalized: (finalized: boolean) => void;
}

// Tab Components
const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ 
  formData, 
  updateFormData, 
  imageUploadUrl, 
  setImageUploadUrl,
  handleImageUpload
}) => {
  // Format date for the datetime-local input
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Mission Name */}
      <div>
        <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
          Mission Name *
        </label>
        <input
          type="text"
          className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
          value={formData.name || ''}
          onChange={(e) => updateFormData('name', e.target.value)}
          required
          placeholder="Enter mission name"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission Type */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Mission Type *
          </label>
          <select
            className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
            value={formData.type || 'Cargo Haul'}
            onChange={(e) => updateFormData('type', e.target.value)}
            required
          >
            <option value="Cargo Haul">Cargo Haul</option>
            <option value="Salvage Operation">Salvage Operation</option>
            <option value="Bounty Hunting">Bounty Hunting</option>
            <option value="Exploration">Exploration</option>
            <option value="Reconnaissance">Reconnaissance</option>
            <option value="Medical Support">Medical Support</option>
            <option value="Combat Patrol">Combat Patrol</option>
            <option value="Escort Duty">Escort Duty</option>
            <option value="Mining Expedition">Mining Expedition</option>
          </select>
        </div>
        
        {/* Scheduled Date & Time */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Scheduled Date & Time *
          </label>
          <div className="relative mg-datetime-wrapper">
            <input
              type="datetime-local"
              className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
              value={formatDateForInput(formData.scheduledDateTime)}
              onChange={(e) => updateFormData('scheduledDateTime', e.target.value ? new Date(e.target.value).toISOString() : null)}
              required
            />
            {/* MobiGlas date picker styling overlay */}
            <div className="absolute pointer-events-none inset-0 border-[1px] border-[rgba(var(--mg-primary),0.1)] rounded-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.3)] to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.2)] to-transparent"></div>
            </div>
          </div>
        </div>
        
        {/* Mission Status */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Mission Status *
          </label>
          <select
            className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
            value={formData.status || 'Planning'}
            onChange={(e) => updateFormData('status', e.target.value)}
            required
          >
            <option value="Planning">Planning</option>
            <option value="Briefing">Briefing</option>
            <option value="In Progress">In Progress</option>
            <option value="Debriefing">Debriefing</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        {/* Mission Location */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Starting Location *
          </label>
          <input
            type="text"
            className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
            value={formData.location || ''}
            onChange={(e) => updateFormData('location', e.target.value)}
            placeholder="e.g. Port Olisar, Microtech"
            required
          />
        </div>
      </div>
      
      {/* Mission Details */}
      <div>
        <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
          Mission Details
        </label>
        <textarea
          className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none min-h-[120px]"
          value={formData.details || ''}
          onChange={(e) => updateFormData('details', e.target.value)}
          placeholder="Enter mission details, objectives, and any special instructions"
        />
      </div>
      
      {/* Mission Images */}
      <div>
        <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-2">
          Mission Images
        </label>
        
        {/* Image Gallery */}
        {formData.images && formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {formData.images.map((imageUrl, index) => (
              <div key={index} className="relative group aspect-video border border-[rgba(var(--mg-primary),0.2)] rounded-sm overflow-hidden">
                <Image 
                  src={imageUrl} 
                  alt={`Mission image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    className="p-1 bg-red-500 rounded-full"
                    onClick={() => {
                      const updatedImages = [...formData.images!];
                      updatedImages.splice(index, 1);
                      updateFormData('images', updatedImages);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Image Upload */}
        <div className="flex">
          <input
            type="text"
            className="mg-input flex-grow py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-l-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
            value={imageUploadUrl}
            onChange={(e) => setImageUploadUrl(e.target.value)}
            placeholder="Enter image URL"
          />
          <button
            type="button"
            className="mg-button-secondary py-2 px-4 rounded-r-sm"
            onClick={handleImageUpload}
            disabled={!imageUploadUrl.trim()}
          >
            Add Image
          </button>
        </div>
        <p className="text-xs text-[rgba(var(--mg-primary),0.6)] mt-1">
          Enter the URL of an image to add it to the mission. You can also use image IDs from Star Citizen or other reference images.
        </p>
      </div>
    </motion.div>
  );
};

const PersonnelTab: React.FC<PersonnelTabProps> = ({
  users,
  selectedUsers,
  addUser,
  removeUser,
  searchTerm,
  setSearchTerm,
  loading
}) => {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers([]);
      return;
    }
    
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Search Users */}
      <div>
        <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
          Add Personnel
        </label>
        <div className="flex">
          <div className="relative flex-grow">
            <input
              type="text"
              className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name..."
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-primary),0.9)]"
                onClick={() => setSearchTerm('')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Search Results */}
        {searchTerm && (
          <div className="mt-2 max-h-[200px] overflow-y-auto bg-[rgba(var(--mg-panel-dark),0.8)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm">
            {loading ? (
              <div className="p-4 text-center">
                <div className="mg-loader inline-block"></div>
                <span className="ml-2 text-sm text-[rgba(var(--mg-primary),0.7)]">Searching...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-sm text-[rgba(var(--mg-primary),0.7)]">
                No users found matching &quot;{searchTerm}&quot;
              </div>
            ) : (
              <ul>
                {filteredUsers.map(user => (
                  <li key={user.userId} className="border-b border-[rgba(var(--mg-primary),0.1)] last:border-0">
                    <button
                      type="button"
                      className={`w-full text-left p-3 hover:bg-[rgba(var(--mg-primary),0.1)] transition-colors flex items-center justify-between ${
                        selectedUsers.some(u => u.userId === user.userId) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => addUser(user)}
                      disabled={selectedUsers.some(u => u.userId === user.userId)}
                    >
                      <span className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)] flex items-center justify-center text-sm flex-shrink-0 mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm">{user.name}</span>
                      </span>
                      
                      {!selectedUsers.some(u => u.userId === user.userId) && (
                        <span className="text-[rgba(var(--mg-primary),0.7)]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      {/* Selected Users */}
      <div>
        <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-2">
          Mission Personnel
        </label>
        
        {selectedUsers.length === 0 ? (
          <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] p-4 border border-[rgba(var(--mg-primary),0.1)] rounded-sm text-center">
            <p className="mg-text-secondary text-sm">No personnel assigned to this mission</p>
            <p className="mg-text-secondary text-xs mt-1">Use the search field above to add personnel</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedUsers.map(user => (
              <div
                key={user.userId}
                className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] p-3 border border-[rgba(var(--mg-primary),0.1)] rounded-sm relative group overflow-hidden"
              >
                {/* Hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)] flex items-center justify-center text-sm flex-shrink-0 mr-3">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="mg-text text-sm">{user.name}</p>
                      {user.ships && user.ships.length > 0 && (
                        <p className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                          Has {user.ships.length} ship{user.ships.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-error),0.9)] transition-colors"
                    onClick={() => removeUser(user.userId)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const VesselAssignmentTab: React.FC<VesselAssignmentTabProps> = ({
  selectedUsers,
  selectedShips,
  addShip,
  removeShip,
  setSelectedShips,
  crewAssignments,
  assignCrewToShip,
  commonRoles,
  statusMessage,
  setStatusMessage,
  assignmentsFinalized,
  setAssignmentsFinalized
}) => {
  const [activeShipId, setActiveShipId] = useState<string | null>(null);
  const [showShipSelector, setShowShipSelector] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState<{userId: string, shipId: string} | null>(null);
  const [customRole, setCustomRole] = useState('');
  const [unassignedCrewSelections, setUnassignedCrewSelections] = useState<{[userId: string]: string}>({});
  
  // Get all available ships from selected users
  const availableUserShips = useMemo(() => {
    return selectedUsers.flatMap((user, userIndex) => 
      user.ships.map((ship, shipIndex) => ({
        ...ship,
        ownerId: user.userId,
        ownerName: user.name
      }))
    );
  }, [selectedUsers]);
  
  // Filter out ships that are already selected
  const availableShips = useMemo(() => {
    return availableUserShips.filter(
      ship => !selectedShips.some(s => s.shipId === ship.shipId)
    );
  }, [availableUserShips, selectedShips]);
  
  // Get unassigned crew (users without ship assignments)
  const unassignedCrew = useMemo(() => {
    const unassigned = selectedUsers.filter(
      user => !crewAssignments.some(a => a.userId === user.userId)
    );
    console.log('Unassigned crew:', unassigned.map(u => u.name));
    return unassigned;
  }, [selectedUsers, crewAssignments]);

  // Initialize selections for unassigned crew
  const initializeUnassignedCrewSelections = () => {
    if (selectedShips.length === 0) return;
    
    // Always ensure all selected users have a ship selection
    const newSelections = { ...unassignedCrewSelections };
    let hasChanges = false;
    
    // For all selected users, ensure they have a valid ship selection
    selectedUsers.forEach(user => {
      // Only set selections for users who don't have assignments yet
      if (!crewAssignments.some(a => a.userId === user.userId)) {
        // If no selection or selection is no longer valid, assign to first ship
        if (!newSelections[user.userId] || !selectedShips.some(ship => ship.shipId === newSelections[user.userId])) {
          newSelections[user.userId] = selectedShips[0].shipId;
          hasChanges = true;
        }
      }
    });
    
    // Remove selections for users who are no longer selected or are now assigned
    Object.keys(newSelections).forEach(userId => {
      const userStillUnassigned = selectedUsers.some(user => 
        user.userId === userId && !crewAssignments.some(a => a.userId === userId)
      );
      
      if (!userStillUnassigned) {
        delete newSelections[userId];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      console.log('Updated unassignedCrewSelections:', newSelections);
      setUnassignedCrewSelections(newSelections);
    }
  };
  
  // Run initialization when ships, users, or assignments change
  useEffect(() => {
    initializeUnassignedCrewSelections();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShips.length, selectedUsers.length, crewAssignments.length]);
  
  // When a new ship is added, make it active
  useEffect(() => {
    if (selectedShips.length > 0 && !activeShipId) {
      setActiveShipId(selectedShips[0].shipId);
    }
  }, [selectedShips, activeShipId]);
  
  // Get assigned crew for a specific ship
  const getShipCrew = (shipId: string) => {
    if (!shipId) return [];
    
    const crew = crewAssignments.filter(a => a.shipId === shipId && !a.isGroundSupport);
    console.log(`Crew for ship ${shipId}:`, crew.map(c => c.userName));
    return crew;
  };
  
  // Get ground support crew
  const getGroundSupportCrew = () => {
    const crew = crewAssignments.filter(a => a.isGroundSupport);
    console.log(`Ground support crew:`, crew.map(c => c.userName));
    return crew;
  };
  
  // Handle adding a new ship
  const handleAddShip = (ship: UserShip) => {
    // Make sure ship has a valid ID before adding
    const shipToAdd = {
      ...ship,
      shipId: ship.shipId || `ship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Pass the ship to the parent's addShip function
    addShip(shipToAdd);
    
    // Update UI state
    setShowShipSelector(false);
    setAssignmentsFinalized(false);
    
    // Set this ship as active so users can see the crew assignment section
    setActiveShipId(shipToAdd.shipId);
  };
  
  // Handle assigning a role to a user
  const handleAssignRole = (
    userId: string, 
    userName: string, 
    shipId: string, 
    shipName: string, 
    shipType: string, 
    role: string,
    manufacturer: string = '',
    image: string = '',
    isGroundSupport: boolean = false,
    crewRequirement: number = 0
  ) => {
    // Add validation to ensure we have a valid shipId (unless ground support)
    if (!shipId && !isGroundSupport) {
      console.error('Cannot assign crew: shipId is empty');
      return;
    }
    
    console.log('=== CREW ASSIGNMENT DEBUG ===');
    console.log(`Assigning user: ${userName} (${userId})`);
    console.log(`To ${isGroundSupport ? 'Ground Support' : `ship: ${shipName} (${shipId}) of type: ${shipType}`}`);
    console.log(`With role: ${role}`);
    console.log('Current assignments before:', crewAssignments.length);
    console.log('Current unassigned crew:', unassignedCrew.map(u => u.name));
    
    // Use the parent component's assignCrewToShip function
    assignCrewToShip(
      userId, 
      userName, 
      shipId, 
      shipName, 
      shipType, 
      role,
      manufacturer,
      image,
      isGroundSupport,
      crewRequirement
    );
  };

  // Handle save assignments
  const handleSaveAssignments = () => {
    setStatusMessage({
      type: 'success',
      text: 'Crew assignments have been finalized and will be saved with the mission',
      shipId: null
    });
    setAssignmentsFinalized(true);
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  // Check if we have any crew assignments to save
  const hasAssignments = crewAssignments.length > 0;

  // Reset finalized state when assignments change
  useEffect(() => {
    if (crewAssignments.length > 0) {
      setAssignmentsFinalized(false);
    }
  }, [crewAssignments, setAssignmentsFinalized]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Status Message */}
      {statusMessage && (
        <div className={`px-4 py-3 rounded-sm text-sm mb-4 ${
          statusMessage.type === 'success' ? 'bg-[rgba(var(--mg-success),0.1)] border border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.9)]' :
          statusMessage.type === 'error' ? 'bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.9)]' :
          'bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.3)] text-[rgba(var(--mg-primary),0.9)]'
        }`}>
          {statusMessage.text}
        </div>
      )}
      
      {/* Assignment Status Banner */}
      {hasAssignments && (
        <div className={`px-4 py-3 rounded-sm text-sm mb-4 flex justify-between items-center ${
          assignmentsFinalized 
            ? 'bg-[rgba(var(--mg-success),0.1)] border border-[rgba(var(--mg-success),0.3)]' 
            : 'bg-[rgba(var(--mg-warning),0.1)] border border-[rgba(var(--mg-warning),0.3)]'
        }`}>
          <div className="flex items-center">
            {assignmentsFinalized ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[rgba(var(--mg-success),0.9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[rgba(var(--mg-success),0.9)]">Crew assignments are finalized and ready to save</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[rgba(var(--mg-warning),0.9)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-[rgba(var(--mg-warning),0.9)]">Crew assignments need to be finalized</span>
              </>
            )}
          </div>
          
          {!assignmentsFinalized && (
            <button
              type="button"
              className="mg-button-primary py-1 px-3 text-xs"
              onClick={handleSaveAssignments}
            >
              Finalize Assignments
            </button>
          )}
        </div>
      )}
      
      {/* Selected Ships Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)]">
            Vessel Assignment
          </label>
          
          <button
            type="button"
            className="mg-button-secondary py-1 px-3 text-xs flex items-center"
            onClick={() => setShowShipSelector(!showShipSelector)}
            disabled={availableShips.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Ship
          </button>
        </div>
        
        {/* Ship selector dropdown */}
        {showShipSelector && (
          <div className="mb-4 bg-[rgba(var(--mg-panel-dark),0.8)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm max-h-[200px] overflow-y-auto">
            {availableShips.length === 0 ? (
              <div className="p-4 text-center text-sm text-[rgba(var(--mg-primary),0.7)]">
                No available ships to add. Either add more personnel with ships or all ships are already assigned.
              </div>
            ) : (
              <ul>
                {availableShips.map((ship, index) => (
                  <li key={`ship-option-${ship.shipId}-${index}`} className="border-b border-[rgba(var(--mg-primary),0.1)] last:border-0">
                    <button
                      type="button"
                      className="w-full text-left p-3 hover:bg-[rgba(var(--mg-primary),0.1)] transition-colors"
                      onClick={() => handleAddShip(ship)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-semibold">{ship.name}</span>
                          {ship.type !== ship.name && (
                            <span className="text-xs text-[rgba(var(--mg-primary),0.6)] ml-2">({ship.type})</span>
                          )}
                        </div>
                        <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                          Owned by {ship.ownerName}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {/* Selected ships list */}
        {selectedShips.length === 0 ? (
          <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] p-4 border border-[rgba(var(--mg-primary),0.1)] rounded-sm text-center">
            <p className="mg-text-secondary text-sm">No vessels assigned to this mission</p>
            <p className="mg-text-secondary text-xs mt-1">
              {availableShips.length > 0 
                ? 'Click "Add Ship" to assign vessels from mission personnel' 
                : 'Add personnel with ships to enable vessel assignment'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedShips.map((ship, shipIndex) => (
              <div
                key={`selected-ship-${ship.shipId}-${shipIndex}`}
                className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] border rounded-sm mb-4 border-[rgba(var(--mg-primary),0.2)]"
              >
                {/* Ship header and details - always visible */}
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      {/* Ship image */}
                      <div className="w-56 h-40 mr-3 rounded-sm overflow-hidden bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.2)] flex items-center justify-center flex-shrink-0">
                        <img 
                          src={ship.image}
                          alt={ship.name || ship.type}
                          className="object-contain w-full h-full max-h-full"
                          style={{ maxHeight: "100%" }}
                          onError={(e) => {
                            // Prevent infinite loops by setting a flag
                            if ((e.target as HTMLImageElement).dataset.retried === 'true') {
                              console.error(`Failed to load ship image after retry: ${ship.image}`);
                              
                              // Use a generic placeholder that definitely exists
                              (e.target as HTMLImageElement).src = "/images/ship-placeholder.jpg";
                              return;
                            }
                            
                            // Mark as retried
                            (e.target as HTMLImageElement).dataset.retried = 'true';
                            
                            // Log detailed info for debugging
                            console.warn(`Ship image not found: ${ship.image} for ship: ${ship.name} (${ship.type})`);
                            
                            // Try using the name directly
                            const fallbackByName = getDirectImagePath(ship.name);
                            console.log(`Trying name-based fallback: ${fallbackByName}`);
                            e.currentTarget.src = fallbackByName;
                          }}
                        />
                      </div>
                      
                      {/* Ship details */}
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">{ship.manufacturer || 'Unknown Manufacturer'}</span>
                        </div>
                        <h4 className="text-sm text-[rgba(var(--mg-primary),0.9)] font-medium">{ship.name}</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                          <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                            <span className="opacity-70">Owner:</span> {ship.ownerName}
                          </span>
                          <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                            <span className="opacity-70">Crew:</span> {ship.crewRequirement || "Not specified"}
                          </span>
                          <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                            <span className="opacity-70">Size:</span> {ship.size || "Unknown"}
                          </span>
                          {ship.role && (
                            <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                              <span className="opacity-70">Role:</span> {ship.role}
                            </span>
                          )}
                          {ship.cargoCapacity !== undefined && (
                            <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                              <span className="opacity-70">Cargo:</span> {ship.cargoCapacity} SCU
                            </span>
                          )}
                          {ship.speedSCM !== undefined && (
                            <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                              <span className="opacity-70">Speed:</span> {ship.speedSCM} m/s
                            </span>
                          )}
                          {ship.length !== undefined && (
                            <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                              <span className="opacity-70">Length:</span> {ship.length} m
                            </span>
                          )}
                          {ship.beam !== undefined && (
                            <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                              <span className="opacity-70">Beam:</span> {ship.beam} m
                            </span>
                          )}
                          {ship.height !== undefined && (
                            <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                              <span className="opacity-70">Height:</span> {ship.height} m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {/* Ship control buttons */}
                      <button
                        type="button"
                        className="text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-error),0.9)] ml-2"
                        onClick={() => removeShip(ship.shipId)}
                        aria-label="Remove ship"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Additional ship information */}
                  <div className="mt-3">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Ship role in mission */}
                      <div>
                        <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Role in Mission</label>
                        <select
                          className="mg-input w-full py-1.5 px-2 text-sm bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
                          value={ship.missionRole || ""}
                          onChange={(e) => {
                            const updatedShips = [...selectedShips];
                            const shipIndex = updatedShips.findIndex(s => s.shipId === ship.shipId);
                            if (shipIndex >= 0) {
                              updatedShips[shipIndex] = {
                                ...updatedShips[shipIndex],
                                missionRole: e.target.value
                              };
                              setSelectedShips(updatedShips);
                            }
                          }}
                        >
                          <option value="">Select a role...</option>
                          <option value="Combat">Combat</option>
                          <option value="Transport">Transport</option>
                          <option value="Support">Support</option>
                          <option value="Exploration">Exploration</option>
                          <option value="Medical">Medical</option>
                          <option value="Cargo">Cargo</option>
                          <option value="Mining">Mining</option>
                          <option value="Salvage">Salvage</option>
                          <option value="Refueling">Refueling</option>
                          <option value="Repair">Repair</option>
                        </select>
                      </div>
                      
                      {/* Ship equipment */}
                      <div>
                        <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Equipment</label>
                        <input
                          type="text"
                          className="mg-input w-full py-1.5 px-2 text-sm bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
                          placeholder="e.g. Medical supplies, Mining lasers"
                          value={ship.equipment || ""}
                          onChange={(e) => {
                            const updatedShips = [...selectedShips];
                            const shipIndex = updatedShips.findIndex(s => s.shipId === ship.shipId);
                            if (shipIndex >= 0) {
                              updatedShips[shipIndex] = {
                                ...updatedShips[shipIndex],
                                equipment: e.target.value
                              };
                              setSelectedShips(updatedShips);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ship crew assignment - always visible */}
                <div className="border-t border-[rgba(var(--mg-primary),0.1)] pt-3 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm text-[rgba(var(--mg-primary),0.8)]">Crew Assignment</h4>
                    {unassignedCrew.length > 0 && (
                      <button
                        type="button"
                        className="mg-button-secondary py-1 px-2 text-xs flex items-center"
                        onClick={() => {
                          // Get the first unassigned crew member
                          const firstUnassignedUser = unassignedCrew[0];
                          console.log("Adding crew member to ship:", ship.name, "User:", firstUnassignedUser.name);
                          
                          // Set up the role selector with this user and the current ship
                          setShowRoleSelector({
                            userId: firstUnassignedUser.userId,
                            shipId: ship.shipId
                          });
                          setCustomRole('');
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Crew Member
                      </button>
                    )}
                  </div>
                  
                  {/* Role assignment dialog for ships */}
                  {showRoleSelector && showRoleSelector.shipId && showRoleSelector.shipId !== 'ground-support-temp' && showRoleSelector.shipId === ship.shipId && (
                    <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.6)] p-3 border border-[rgba(var(--mg-primary),0.3)] rounded-sm mt-2 mb-3">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold">Assign Crew Member</h3>
                        <button 
                          type="button"
                          className="text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-primary),0.9)]"
                          onClick={() => setShowRoleSelector(null)}
                          aria-label="Close"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* User selection */}
                      <div className="mb-3">
                        <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Crew Member</label>
                        {unassignedCrew.length > 0 ? (
                          <select
                            className="mg-input w-full py-1.5 px-2 text-sm bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
                            value={showRoleSelector.userId}
                            onChange={(e) => {
                              console.log("Selected crew member changed to:", e.target.value);
                              setShowRoleSelector({
                                ...showRoleSelector, 
                                userId: e.target.value
                              });
                            }}
                          >
                            {unassignedCrew.map((user, userIndex) => (
                              <option key={`crew-option-${user.userId}-${userIndex}`} value={user.userId}>{user.name}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-[rgba(var(--mg-primary),0.6)] py-1">
                            No unassigned personnel available
                          </div>
                        )}
                      </div>
                      
                      {/* Role selection */}
                      <div className="mb-3">
                        <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Role</label>
                        <select
                          className="mg-input w-full py-1.5 px-2 text-sm bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                        >
                          <option value="">Select a role...</option>
                          {commonRoles.map((role, roleIndex) => (
                            <option key={`role-option-${role}-${roleIndex}`} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Assign button */}
                      <button
                        type="button"
                        className="mg-button-primary w-full py-1.5 text-sm"
                        onClick={() => {
                          console.log("Confirm Assignment clicked. Current state:", {
                            showRoleSelector,
                            customRole,
                            unassignedCrew: unassignedCrew.map(u => ({ id: u.userId, name: u.name })),
                            shipId: showRoleSelector?.shipId
                          });
                          
                          // First ensure we have all required data
                          if (!showRoleSelector || !showRoleSelector.userId || !customRole) {
                            console.error('Missing required data for assignment', { 
                              showRoleSelector: !!showRoleSelector,
                              userId: showRoleSelector?.userId || 'missing', 
                              role: customRole || 'missing'
                            });
                            return;
                          }
                          
                          // Find the user
                          const user = selectedUsers.find(u => u.userId === showRoleSelector.userId);
                          if (!user) {
                            console.error(`User with ID ${showRoleSelector.userId} not found in selected users`);
                            return;
                          }
                          
                          // Find the ship using the stored shipId in showRoleSelector
                          const targetShipId = showRoleSelector.shipId;
                          if (!targetShipId || targetShipId === 'ground-support-temp') {
                            console.error('Ship ID is empty or invalid');
                            return;
                          }
                          
                          // Find the ship details using the shipId
                          const targetShip = selectedShips.find(s => s.shipId === targetShipId);
                          if (!targetShip) {
                            console.error(`Ship with ID ${targetShipId} not found in selected ships`);
                            return;
                          }
                          
                          // Assign to the target ship using the found ship details
                          assignCrewToShip(
                            user.userId, 
                            user.name, 
                            targetShip.shipId, 
                            targetShip.name, 
                            targetShip.type, 
                            customRole,
                            targetShip.manufacturer,
                            targetShip.image,
                            false,
                            targetShip.crewRequirement
                          );
                          
                          // Get the updated unassigned crew (after the assignment)
                          const remainingUnassigned = selectedUsers.filter(
                            u => !crewAssignments.some(a => a.userId === u.userId) && u.userId !== user.userId
                          );
                          
                          // If there are still unassigned crew members, update the dialog to the next user
                          if (remainingUnassigned.length > 0) {
                            // Find the next unassigned user
                            const nextUser = remainingUnassigned[0];
                            console.log(`Moving to next unassigned user: ${nextUser.name}`);
                            
                            // Update the role selector with the next user
                            setShowRoleSelector({
                              userId: nextUser.userId,
                              shipId: targetShipId // Keep the same ship
                            });
                            setCustomRole(''); // Reset the role for the next user
                          } else {
                            // If no more unassigned users, close the dialog
                            console.log('No more unassigned users, closing dialog');
                            setShowRoleSelector(null);
                            setCustomRole('');
                          }
                        }}
                        disabled={!customRole || unassignedCrew.length === 0}
                      >
                        Confirm Assignment
                      </button>
                    </div>
                  )}
                  
                  {/* Crew list */}
                  <div className="space-y-2 mt-3">
                    {getShipCrew(ship.shipId).length === 0 ? (
                      <p className="text-sm text-[rgba(var(--mg-primary),0.6)]">No crew assigned to this vessel</p>
                    ) : (
                      getShipCrew(ship.shipId).map((crew, crewIndex) => (
                        <div key={`crew-assignment-${crew.userId}-${crewIndex}`} 
                          className={`flex justify-between items-center bg-[rgba(var(--mg-panel-dark),0.2)] p-2 rounded-sm ${
                            statusMessage?.shipId === ship.shipId && statusMessage?.text.includes(crew.userName) 
                              ? 'border border-[rgba(var(--mg-success),0.3)]' 
                              : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)] flex items-center justify-center text-xs flex-shrink-0 mr-2">
                              {crew.userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm">{crew.userName}</span>
                            <span className="text-xs ml-2 px-2 py-0.5 bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm">
                              {crew.role}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            className="text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-error),0.9)]"
                            onClick={() => {
                              // Remove this crew assignment
                              assignCrewToShip(
                                crew.userId, 
                                crew.userName, 
                                '', 
                                '', 
                                '', 
                                ''
                              );
                            }}
                            aria-label="Remove crew member"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Ground Support Section */}
      <div className="mt-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)]">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[rgba(var(--mg-success),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Ground Support Personnel
            </span>
          </h3>
        </div>
        
        {/* Role assignment dialog for ground support */}
        {showRoleSelector && showRoleSelector.shipId === 'ground-support-temp' && (
          <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.6)] p-3 border border-[rgba(var(--mg-success),0.3)] rounded-sm mt-2 mb-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-[rgba(var(--mg-success),0.9)]">Assign to Ground Support</h3>
              <button 
                type="button"
                className="text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-primary),0.9)]"
                onClick={() => setShowRoleSelector(null)}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* User selection */}
            <div className="mb-3">
              <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Personnel</label>
              {unassignedCrew.length > 0 ? (
                <select
                  className="mg-input w-full py-1.5 px-2 text-sm bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
                  value={showRoleSelector.userId}
                  onChange={(e) => {
                    setShowRoleSelector({
                      ...showRoleSelector, 
                      userId: e.target.value
                    });
                  }}
                >
                  {unassignedCrew.map((user, userIndex) => (
                    <option key={`ground-crew-option-${user.userId}-${userIndex}`} value={user.userId}>{user.name}</option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-[rgba(var(--mg-primary),0.6)] py-1">
                  No unassigned personnel available
                </div>
              )}
            </div>
            
            {/* Role selection for ground support */}
            <div className="mb-4">
              <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {/* Common roles */}
                {["Ground Support", "Medical Support", "Logistics", "Communications", "Security"].map(role => (
                  <button
                    key={`ground-role-${role}`}
                    type="button"
                    className={`text-xs py-1.5 px-2 border rounded-sm text-left ${
                      customRole === role 
                        ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.4)] text-[rgba(var(--mg-success),0.9)]' 
                        : 'bg-[rgba(var(--mg-panel-dark),0.4)] border-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),0.8)]'
                    } hover:bg-[rgba(var(--mg-success),0.05)] hover:border-[rgba(var(--mg-success),0.3)]`}
                    onClick={() => setCustomRole(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Custom role..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="mg-input w-full py-1.5 px-2 text-sm bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
                />
              </div>
            </div>
            
            {/* Confirm button */}
            <div className="flex justify-end">
              <button
                type="button"
                className="mg-button-primary py-1.5 px-3 text-sm bg-[rgba(var(--mg-success),0.2)] border-[rgba(var(--mg-success),0.4)] text-[rgba(var(--mg-success),0.9)]"
                disabled={!customRole || !showRoleSelector.userId}
                onClick={() => {
                  if (customRole && showRoleSelector.userId) {
                    const user = selectedUsers.find(u => u.userId === showRoleSelector.userId);
                    
                    if (user) {
                      // Assign this user to ground support
                      handleAssignRole(
                        user.userId, 
                        user.name, 
                        'ground-support-temp', 
                        'Ground Support', 
                        'Ground Support', 
                        customRole
                      );
                      
                      // Clear the role selector
                      setShowRoleSelector(null);
                      setCustomRole('');
                    }
                  }
                }}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        )}
        
        {/* Ground Support crew list */}
        <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] border border-[rgba(var(--mg-primary),0.15)] rounded-sm p-4">
          {getGroundSupportCrew().length === 0 ? (
            <p className="text-sm text-[rgba(var(--mg-primary),0.6)]">No ground support personnel assigned</p>
          ) : (
            <div className="space-y-2">
              {getGroundSupportCrew().map((crew, crewIndex) => (
                <div 
                  key={`ground-crew-${crew.userId}-${crewIndex}`} 
                  className="flex justify-between items-center bg-[rgba(var(--mg-panel-dark),0.2)] p-2 rounded-sm border border-[rgba(var(--mg-success),0.2)]"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[rgba(var(--mg-success),0.2)] border border-[rgba(var(--mg-success),0.4)] flex items-center justify-center text-xs flex-shrink-0 mr-2">
                      {crew.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{crew.userName}</span>
                    <span className="text-xs ml-2 px-2 py-0.5 bg-[rgba(var(--mg-success),0.1)] border border-[rgba(var(--mg-success),0.2)] rounded-sm">
                      {crew.role}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    className="text-[rgba(var(--mg-primary),0.6)] hover:text-[rgba(var(--mg-error),0.9)]"
                    onClick={() => {
                      // Remove this crew assignment
                      assignCrewToShip(
                        crew.userId, 
                        crew.userName, 
                        '', 
                        '', 
                        '', 
                        ''
                      );
                    }}
                    aria-label="Remove crew member"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Unassigned Personnel Section */}
      <div>
        <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-2">
          Unassigned Personnel
        </label>
        
        {unassignedCrew.length === 0 ? (
          <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] p-4 border border-[rgba(var(--mg-primary),0.1)] rounded-sm text-center">
            <p className="mg-text-secondary text-sm">No unassigned personnel available</p>
            <p className="mg-text-secondary text-xs mt-1">All personnel have been assigned to vessels</p>
          </div>
        ) : (
          <div className="space-y-2">
            {unassignedCrew.map((user, userIndex) => (
              <div
                key={`unassigned-crew-${user.userId}-${userIndex}`}
                className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] p-3 border border-[rgba(var(--mg-primary),0.1)] rounded-sm flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)] flex items-center justify-center text-sm flex-shrink-0 mr-3">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{user.name}</span>
                </div>
                
                {selectedShips.length > 0 && (
                  <div className="flex items-center">
                    <select
                      className="mg-input py-1 px-2 text-xs bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none mr-2"
                      value={unassignedCrewSelections[user.userId] || (selectedShips.length > 0 ? selectedShips[0].shipId : '')}
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedShip = selectedShips.find(s => s.shipId === e.target.value);
                          if (selectedShip) {
                            // Update the selection for this specific crew member
                            setUnassignedCrewSelections({
                              ...unassignedCrewSelections,
                              [user.userId]: selectedShip.shipId
                            });
                          }
                        }
                      }}
                    >
                      {selectedShips.map((ship, index) => (
                        <option key={`ship-select-${ship.shipId}-${index}`} value={ship.shipId}>
                          {ship.name}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      className="mg-button-secondary py-1 px-2 text-xs"
                      onClick={() => {
                        console.log("Assign button clicked for user:", user.name);
                        
                        // Always ensure the user has a selection
                        let targetShipId = unassignedCrewSelections[user.userId];
                        if (!targetShipId && selectedShips.length > 0) {
                          targetShipId = selectedShips[0].shipId;
                          // Update selections for next time
                          setUnassignedCrewSelections({
                            ...unassignedCrewSelections,
                            [user.userId]: targetShipId
                          });
                        }
                        
                        console.log("Using ship ID:", targetShipId);
                        
                        if (!targetShipId) {
                          console.error('No ship selected for this crew member');
                          return;
                        }
                        
                        const targetShip = selectedShips.find(s => s.shipId === targetShipId);
                        if (!targetShip) {
                          console.error(`Ship with ID ${targetShipId} not found in selected ships`);
                          return;
                        }
                        
                        console.log(`Opening role selector for ${user.name} to ship ${targetShip.name}`);
                        
                        // Make this ship active so the role selector is visible
                        setActiveShipId(targetShip.shipId);
                        
                        // Update the role selector with this user and ship
                        setShowRoleSelector({
                          userId: user.userId, 
                          shipId: targetShip.shipId
                        });
                        setCustomRole('');
                      }}
                    >
                      Assign to Ship
                    </button>
                    
                    {/* Ground Support button */}
                    <button
                      type="button"
                      className="mg-button-secondary py-1 px-2 text-xs ml-2 bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.9)]"
                      onClick={() => {
                        // Open a role selector dialog for ground support
                        setShowRoleSelector({
                          userId: user.userId,
                          shipId: 'ground-support-temp' // Special ID for ground support
                        });
                        setCustomRole('Ground Support'); // Default role for ground support
                      }}
                    >
                      Assign to Ground Support
                    </button>
                  </div>
                )}
                
                {selectedShips.length === 0 && (
                  <span className="text-xs text-[rgba(var(--mg-primary),0.6)]">
                    Add ships to enable assignment
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MissionForm; 
