import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MissionResponse, MissionParticipant } from '@/types/Mission';

interface UserShip {
  shipId: string;
  name: string;
  type: string;
}

interface User {
  userId: string;
  name: string;
  ships: UserShip[];
}

// Interface for API response user data
interface ApiUser {
  id: string;
  aydoHandle: string;
  role?: string;
  division?: string | null;
  position?: string | null;
  ships?: Array<{id: string; name: string; type: string}>;
}

// Common mission roles
const COMMON_ROLES = [
  'Commander', 'Pilot', 'Co-Pilot', 'Gunner', 'Engineer',
  'Medical Officer', 'Security', 'Cargo Specialist', 'Scout',
  'Salvage Specialist', 'Mining Lead', 'Combat Support',
  'Operations Lead', 'Navigation Officer'
];

interface MissionPersonnelFormProps {
  formData: Partial<MissionResponse>;
  updateFormData: (key: keyof MissionResponse, value: any) => void;
}

const MissionPersonnelForm: React.FC<MissionPersonnelFormProps> = ({ 
  formData, 
  updateFormData 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<{[key: string]: string[]}>({});
  const [customRole, setCustomRole] = useState('');
  const [participants, setParticipants] = useState<MissionParticipant[]>(formData.participants || []);
  
  // Fetch real users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch users from the API
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.status}`);
        }
        
        const apiUsers: ApiUser[] = await response.json();
        
        // Transform API users to the format expected by the component
        const transformedUsers: User[] = apiUsers.map(apiUser => ({
          userId: apiUser.id,
          name: apiUser.aydoHandle, // Use aydoHandle as the name
          ships: apiUser.ships ? apiUser.ships.map(ship => ({
            shipId: ship.id,
            name: ship.name,
            type: ship.type
          })) : []
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
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Check if a user is already a participant
  const isParticipant = (userId: string) => {
    return participants.some(p => p.userId === userId);
  };
  
  // Add participant
  const addParticipant = (user: User) => {
    if (isParticipant(user.userId)) return;
    
    const newParticipant: MissionParticipant = {
      userId: user.userId,
      userName: user.name,
      roles: []
    };
    
    const updatedParticipants = [...participants, newParticipant];
    setParticipants(updatedParticipants);
    updateFormData('participants', updatedParticipants);
  };
  
  // Remove participant
  const removeParticipant = (userId: string) => {
    const updatedParticipants = participants.filter(p => p.userId !== userId);
    setParticipants(updatedParticipants);
    updateFormData('participants', updatedParticipants);
    
    // Also remove any roles assigned to this user
    const updatedRoles = { ...selectedRoles };
    delete updatedRoles[userId];
    setSelectedRoles(updatedRoles);
  };
  
  // Update participant ship
  const updateParticipantShip = async (userId: string, shipId: string, shipName: string, shipType: string) => {
    try {
      // Send ship assignment to the server
      const response = await fetch('/api/fleet-ops/operations/assign-ship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          shipId,
          shipName,
          shipType,
          missionId: formData.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assign ship');
      }

      // Update local state after successful server update
      const updatedParticipants = participants.map(p => {
        if (p.userId === userId) {
          return {
            ...p,
            shipId,
            shipName,
            shipType
          };
        }
        return p;
      });
      
      setParticipants(updatedParticipants);
      updateFormData('participants', updatedParticipants);
    } catch (error) {
      console.error('Error assigning ship:', error);
      // You might want to add error handling UI here
    }
  };
  
  // Add role to participant
  const addRoleToParticipant = (userId: string, role: string) => {
    if (!role) return;
    
    // Update local roles state
    const userRoles = selectedRoles[userId] || [];
    if (!userRoles.includes(role)) {
      const updatedRoles = { 
        ...selectedRoles, 
        [userId]: [...userRoles, role] 
      };
      setSelectedRoles(updatedRoles);
      
      // Update participants
      const updatedParticipants = participants.map(p => {
        if (p.userId === userId) {
          return {
            ...p,
            roles: [...userRoles, role]
          };
        }
        return p;
      });
      
      setParticipants(updatedParticipants);
      updateFormData('participants', updatedParticipants);
    }
    
    // Clear custom role input
    setCustomRole('');
  };
  
  // Remove role from participant
  const removeRoleFromParticipant = (userId: string, roleToRemove: string) => {
    // Update local roles state
    const userRoles = selectedRoles[userId] || [];
    const updatedUserRoles = userRoles.filter(role => role !== roleToRemove);
    const updatedRoles = { 
      ...selectedRoles, 
      [userId]: updatedUserRoles 
    };
    setSelectedRoles(updatedRoles);
    
    // Update participants
    const updatedParticipants = participants.map(p => {
      if (p.userId === userId) {
        return {
          ...p,
          roles: updatedUserRoles
        };
      }
      return p;
    });
    
    setParticipants(updatedParticipants);
    updateFormData('participants', updatedParticipants);
  };
  
  // Get user by ID
  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.userId === userId);
  };
  
  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };
  
  // Initialize selectedRoles from formData on first load
  useEffect(() => {
    if (formData.participants && formData.participants.length > 0) {
      const initialRoles: {[key: string]: string[]} = {};
      
      formData.participants.forEach(participant => {
        if (participant.roles && participant.roles.length > 0) {
          initialRoles[participant.userId] = participant.roles;
        }
      });
      
      setSelectedRoles(initialRoles);
      setParticipants(formData.participants);
    }
  }, []);
  
  return (
    <motion.div 
      className="space-y-6"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Personnel Assignment Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="mg-subtitle text-base font-quantify border-b border-[rgba(var(--mg-primary),0.3)] pb-2">
          Mission Personnel
        </h3>
        
        {/* User Search */}
        <div>
          <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
            Search Personnel
          </label>
          <div className="relative">
            <input 
              type="text"
              className="mg-input w-full py-2 pl-10 pr-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[rgba(var(--mg-primary),0.7)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* User List */}
        <div className="border border-[rgba(var(--mg-primary),0.25)] rounded-sm bg-[rgba(var(--mg-panel-dark),0.4)] max-h-[150px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="mg-loader mx-auto scale-50"></div>
              <p className="text-sm mg-text-secondary mt-2">Loading personnel...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <ul className="divide-y divide-[rgba(var(--mg-primary),0.15)]">
              {filteredUsers.map(user => (
                <li key={user.userId} className="p-2 hover:bg-[rgba(var(--mg-primary),0.1)] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[rgba(var(--mg-primary),0.2)] flex items-center justify-center mr-3">
                        <span className="text-xs font-semibold">{user.name.split(' ').map((n: string) => n[0]).join('')}</span>
                      </div>
                      <span className="mg-text">{user.name}</span>
                    </div>
                    
                    {!isParticipant(user.userId) ? (
                      <button
                        type="button"
                        className="mg-button-small py-1 px-2 text-xs"
                        onClick={() => addParticipant(user)}
                      >
                        Add to Mission
                      </button>
                    ) : (
                      <span className="text-xs text-[rgba(var(--mg-primary),0.7)] italic">Added</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm mg-text-secondary">No matching personnel found.</p>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Selected Personnel Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="mg-subtitle text-base font-quantify border-b border-[rgba(var(--mg-primary),0.3)] pb-2">
          Mission Roster
        </h3>
        
        {participants.length === 0 ? (
          <div className="border border-[rgba(var(--mg-primary),0.25)] rounded-sm bg-[rgba(var(--mg-panel-dark),0.4)] p-4 text-center">
            <p className="text-sm mg-text-secondary">No personnel assigned to this mission yet.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {participants.map(participant => {
              const user = getUserById(participant.userId);
              const userShips = user ? user.ships : [];
              
              return (
                <div 
                  key={participant.userId} 
                  className="border border-[rgba(var(--mg-primary),0.25)] rounded-sm bg-[rgba(var(--mg-panel-dark),0.4)] p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="mg-title text-base">{participant.userName}</h4>
                    <button
                      type="button"
                      className="text-[rgba(var(--mg-error),0.7)] hover:text-[rgba(var(--mg-error),0.9)] p-1"
                      onClick={() => removeParticipant(participant.userId)}
                      aria-label="Remove participant"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Ship Selection */}
                  <div className="mb-3">
                    <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">
                      Assigned Ship
                    </label>
                    <select 
                      className="mg-input text-sm w-full py-1.5 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
                      value={participant.shipId || ''}
                      onChange={(e) => {
                        const selectedShip = userShips.find(ship => ship.shipId === e.target.value);
                        if (selectedShip) {
                          updateParticipantShip(
                            participant.userId, 
                            selectedShip.shipId, 
                            selectedShip.name, 
                            selectedShip.type
                          );
                        } else if (e.target.value === '') {
                          // Handle "No Ship" selection
                          updateParticipantShip(participant.userId, '', '', '');
                        }
                      }}
                    >
                      <option key="no-ship" value="">No Designated Ship</option>
                      {userShips.map(ship => (
                        <option key={`ship-${ship.shipId}`} value={ship.shipId}>
                          {ship.name} ({ship.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Roles Assignment */}
                  <div>
                    <label className="block text-xs text-[rgba(var(--mg-primary),0.7)] mb-1">
                      Mission Roles
                    </label>
                    
                    {/* Role Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {participant.roles && participant.roles.map(role => (
                        <div 
                          key={`${participant.userId}-${role}`}
                          className="bg-[rgba(var(--mg-primary),0.1)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm py-1 px-2 text-xs flex items-center"
                        >
                          <span>{role}</span>
                          <button
                            type="button"
                            className="ml-1 text-[rgba(var(--mg-primary),0.7)] hover:text-[rgba(var(--mg-primary),0.9)]"
                            onClick={() => removeRoleFromParticipant(participant.userId, role)}
                            aria-label={`Remove ${role} role`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Role Selection */}
                    <div className="flex space-x-2">
                      {/* Common Roles Dropdown */}
                      <select 
                        className="mg-input text-xs py-1.5 px-2 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none flex-1"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            addRoleToParticipant(participant.userId, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Select a role...</option>
                        {COMMON_ROLES.map(role => (
                          <option 
                            key={role} 
                            value={role}
                            disabled={participant.roles && participant.roles.includes(role)}
                          >
                            {role}
                          </option>
                        ))}
                      </select>
                      
                      {/* Custom Role Input */}
                      <div className="flex flex-1">
                        <input 
                          type="text"
                          className="mg-input text-xs py-1.5 px-2 bg-[rgba(var(--mg-panel-dark),0.6)] border border-r-0 border-[rgba(var(--mg-primary),0.25)] rounded-l-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none flex-1"
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                          placeholder="Custom role..."
                        />
                        <button
                          type="button"
                          className="mg-button-small py-1 px-2 text-xs rounded-l-none"
                          onClick={() => {
                            if (customRole.trim()) {
                              addRoleToParticipant(participant.userId, customRole.trim());
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Mission Leader Selection */}
        {participants.length > 0 && (
          <div>
            <label className="block text-sm text-[rgba(var(--mg-primary),0.8)] mb-1">
              Mission Leader
            </label>
            <select 
              className="mg-input w-full py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
              value={formData.leaderId || ''}
              onChange={(e) => {
                const leaderId = e.target.value;
                const leader = participants.find(p => p.userId === leaderId);
                updateFormData('leaderId', leaderId);
                if (leader) {
                  updateFormData('leaderName', leader.userName);
                } else {
                  updateFormData('leaderName', '');
                }
              }}
            >
              <option value="">Select mission leader...</option>
              {participants.map(p => (
                <option key={p.userId} value={p.userId}>
                  {p.userName}
                </option>
              ))}
            </select>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MissionPersonnelForm; 