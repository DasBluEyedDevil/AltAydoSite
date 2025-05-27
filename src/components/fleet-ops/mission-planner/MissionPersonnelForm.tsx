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
  formData: MissionResponse;
  updateFormData: (field: string, value: any) => void;
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
  const [availableShips, setAvailableShips] = useState<UserShip[]>([]);

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
        const transformedUsers: User[] = apiUsers.map(apiUser => {
          console.log(`Processing API user: ${apiUser.aydoHandle}, ships:`, apiUser.ships);

          const user = {
            userId: apiUser.id,
            name: apiUser.aydoHandle, // Use aydoHandle as the name
            ships: apiUser.ships ? apiUser.ships.map(ship => {
              console.log(`Processing ship for ${apiUser.aydoHandle}: ID=${ship.id}, name=${ship.name}, type=${ship.type}`);
              return {
                shipId: ship.id,
                name: ship.name,
                type: ship.type
              };
            }) : []
          };

          console.log(`Transformed user: ${user.name}, ships:`, user.ships);
          return user;
        });

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

  // We don't need to initialize availableShips as we're only using user's ships
  useEffect(() => {
    // Set availableShips to an empty array since we're only using user's ships
    setAvailableShips([]);
    console.log('Initialized available ships with empty array');
  }, []);

  // Update participant ship
  const updateParticipantShip = async (userId: string, shipId: string, shipName: string, shipType: string) => {
    try {
      console.log(`Updating ship for user ${userId}: ${shipId} - ${shipName} (${shipType})`);
      console.log(`Ship ID type: ${typeof shipId}, value: "${shipId}"`);

      // Ensure shipId is a string
      const safeShipId = String(shipId || '');
      console.log(`Safe ship ID: "${safeShipId}"`);

      // If the shipId looks like a model name (e.g., "400i"), try to find the actual ship
      if (safeShipId && !shipName && !shipType) {
        console.log(`ShipId "${safeShipId}" might be a model name, looking for matching ship`);
        const user = getUserById(userId);
        if (user) {
          // Try to find a ship with a matching name or ID
          const matchingShip = user.ships.find(ship => 
            ship.shipId === safeShipId || 
            ship.name.toLowerCase().includes(safeShipId.toLowerCase())
          );

          if (matchingShip) {
            console.log(`Found matching ship: ${matchingShip.name} (${matchingShip.type}), ID: ${matchingShip.shipId}`);
            // Use the matching ship's details
            shipName = matchingShip.name;
            shipType = matchingShip.type;
          } else {
            console.warn(`No matching ship found for "${safeShipId}" in user's ships`);
          }
        }
      }

      // Update local state first for immediate feedback
      const updatedParticipants = participants.map(p => {
        if (p.userId === userId) {
          const updatedParticipant = {
            ...p,
            shipId: safeShipId,
            shipName: shipName || '',
            shipType: shipType || ''
          };
          console.log(`Updated participant object:`, updatedParticipant);
          return updatedParticipant;
        }
        return p;
      });

      // Update state and parent component
      console.log('Updating participants with new ship assignment:', updatedParticipants);
      setParticipants(updatedParticipants);

      // Find the updated participant to verify the ship assignment
      const updatedParticipant = updatedParticipants.find(p => p.userId === userId);
      console.log('Updated participant ship info:', {
        userId,
        shipId: updatedParticipant?.shipId || 'none',
        shipName: updatedParticipant?.shipName || 'none',
        shipType: updatedParticipant?.shipType || 'none'
      });

      updateFormData('participants', updatedParticipants);

      // Only make API call if we have a valid mission ID and shipId is not empty
      // AND we're not in the process of creating a new mission (formData.id should be a real ID, not a temporary one)
      if (formData.id && safeShipId && !formData.id.startsWith('mission-')) {
        console.log(`Making API call to assign ship for existing mission: ${formData.id}`);
        // Send ship assignment to the server
        const response = await fetch('/api/fleet-ops/operations/assign-ship', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            shipId: safeShipId,
            shipName,
            shipType,
            missionId: formData.id
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Server error assigning ship:', error);
          // Don't throw error to prevent UI disruption
        }
      } else {
        console.log(`Skipping API call for ship assignment - mission is being created or no ship selected`);
      }
    } catch (error) {
      console.error('Error assigning ship:', error);
      // Don't throw error to prevent UI disruption
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

      console.log('Initializing participants from formData:', formData.participants);

      formData.participants.forEach(participant => {
        if (participant.roles && participant.roles.length > 0) {
          initialRoles[participant.userId] = participant.roles;
        }
        // Log each participant's ship info
        console.log(`Participant ${participant.userName} ship info:`, {
          shipId: participant.shipId || 'none',
          shipName: participant.shipName || 'none',
          shipType: participant.shipType || 'none'
        });
      });

      setSelectedRoles(initialRoles);
      setParticipants(formData.participants);
    }
  }, [formData.participants]);

  // Ship selection menu
  const ShipSelectionMenu = ({ userId, onSelect, onClose }: { 
    userId: string; 
    onSelect: (shipId: string, shipName: string, shipType: string) => void;
    onClose: () => void;
  }) => {
    // Get user's ships
    const user = getUserById(userId);
    const userShips = user ? user.ships : [];

    return (
      <div className="absolute z-50 mt-1 w-64 rounded-md bg-[rgba(var(--mg-panel-dark),0.95)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="ship-selection-button">
          {/* No ship option */}
          <button
            key="no-ship"
            className="text-[rgba(var(--mg-primary),0.9)] block w-full px-4 py-2 text-left text-sm hover:bg-[rgba(var(--mg-primary),0.1)] border-b border-[rgba(var(--mg-primary),0.2)]"
            role="menuitem"
            onClick={() => {
              onSelect('', '', '');
              onClose();
            }}
          >
            No Designated Ship
          </button>

          {/* User's ships section */}
          {userShips.length > 0 && (
            <>
              <div className="px-4 py-1 text-xs text-[rgba(var(--mg-primary),0.6)] bg-[rgba(var(--mg-primary),0.05)]">
                User&apos;s Ships
              </div>
              {userShips.map((ship) => (
                <button
                  key={`user-ship-${ship.shipId}`}
                  className="text-[rgba(var(--mg-primary),0.9)] block w-full px-4 py-2 text-left text-sm hover:bg-[rgba(var(--mg-primary),0.1)]"
                  role="menuitem"
                  onClick={() => {
                    console.log(`User ship selected from menu: ${ship.name} (${ship.type}) with ID: ${ship.shipId}`);
                    // Ensure shipId is not undefined or empty
                    const shipId = ship.shipId || '';
                    console.log(`Using shipId: "${shipId}" for selection`);
                    onSelect(shipId, ship.name, ship.type);
                    onClose();
                  }}
                >
                  {ship.name} ({ship.type})
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  // Participant row with ship assignment
  const ParticipantRow = ({ participant }: { participant: MissionParticipant }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
      <div className="flex items-center justify-between py-2 border-b border-[rgba(var(--mg-primary),0.1)]">
        <div>
          <p className="text-sm font-medium text-[rgba(var(--mg-primary),0.9)]">{participant.userName}</p>
          <p className="text-xs text-[rgba(var(--mg-primary),0.6)]">{participant.roles.join(', ')}</p>
        </div>
        <div className="relative">
          <button
            type="button"
            className={`inline-flex items-center px-3 py-1 border ${participant.shipName ? 'border-[rgba(var(--mg-success),0.3)]' : 'border-[rgba(var(--mg-primary),0.2)]'} rounded-sm bg-[rgba(var(--mg-panel-dark),0.6)] text-sm ${participant.shipName ? 'text-[rgba(var(--mg-success),0.9)]' : 'text-[rgba(var(--mg-primary),0.9)]'} hover:bg-[rgba(var(--mg-primary),0.1)]`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {participant.shipName ? `${participant.shipName} (${participant.shipType})` : 'Assign Ship'}
          </button>

          {isMenuOpen && (
            <ShipSelectionMenu
              userId={participant.userId}
              onSelect={(shipId, shipName, shipType) => {
                console.log(`Selected ship from menu: ${shipId} - ${shipName} (${shipType})`);
                updateParticipantShip(participant.userId, shipId, shipName, shipType);
                // Force close the menu after selection
                setIsMenuOpen(false);
              }}
              onClose={() => setIsMenuOpen(false)}
            />
          )}
        </div>
      </div>
    );
  };

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
                      className={`mg-input text-sm w-full py-1.5 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border ${participant.shipId ? 'border-[rgba(var(--mg-success),0.3)]' : 'border-[rgba(var(--mg-primary),0.25)]'} rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none ${participant.shipId ? 'text-[rgba(var(--mg-success),0.9)]' : ''}`}
                      value={participant.shipId || ''}
                      key={`ship-select-${participant.userId}-${participant.shipId || 'none'}`}
                      onChange={(e) => {
                        console.log(`Ship selection changed to: ${e.target.value}`);
                        const selectedValue = e.target.value;
                        console.log(`Selected value type: ${typeof selectedValue}, value: "${selectedValue}"`);

                        if (selectedValue === '') {
                          // Handle "No Ship" selection
                          console.log('No ship selected');
                          updateParticipantShip(participant.userId, '', '', '');
                        } else {
                          // Find the selected ship in user's ships
                          console.log(`Looking for ship with ID "${selectedValue}" in user's ships:`, userShips);
                          const selectedShip = userShips.find(ship => {
                            console.log(`Comparing ship ID: "${ship.shipId}" (${typeof ship.shipId}) with selected value: "${selectedValue}" (${typeof selectedValue})`);
                            return ship.shipId === selectedValue || 
                                  (ship.name && ship.name.toLowerCase().includes(selectedValue.toLowerCase()));
                          });

                          console.log('Selected ship:', selectedShip);
                          console.log('User ships:', userShips);

                          if (selectedShip) {
                            console.log(`Ship found, updating participant with ship: ${selectedShip.name} (${selectedShip.type}), ID: ${selectedShip.shipId}`);
                            updateParticipantShip(
                              participant.userId, 
                              selectedShip.shipId, 
                              selectedShip.name, 
                              selectedShip.type
                            );
                          } else {
                            // If no exact match found, try using the selected value directly
                            // This handles cases where the value might be a model name like "400i"
                            console.log(`No exact match found, trying to use value directly: ${selectedValue}`);
                            updateParticipantShip(participant.userId, selectedValue, '', '');
                          }
                        }
                      }}
                    >
                      <option key="no-ship" value="">No Designated Ship</option>
                      {/* Show user's ships */}
                      {userShips.length > 0 ? (
                        userShips.map((ship, index) => {
                          console.log(`Rendering user ship option: ${ship.name} (${ship.type}) with ID: ${ship.shipId}`);
                          return (
                            <option 
                              key={`user-ship-${ship.shipId || `user-${participant.userId}-ship-${index}`}`} 
                              value={ship.shipId}
                            >
                              {ship.name} ({ship.type})
                            </option>
                          );
                        })
                      ) : (
                        <option disabled>No ships available for this user</option>
                      )}
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
