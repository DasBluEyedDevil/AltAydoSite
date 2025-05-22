'use client';

import React, { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { OperationResponse, OperationStatus, OperationParticipant } from '@/types/Operation';
import { UserShip } from '@/types/user';
import UserSelector from './UserSelector';

interface OperationEditorProps {
  session: Session;
  operation?: OperationResponse;
  onSave: (operation: OperationResponse) => void;
  onCancel: () => void;
}

interface UserWithShips {
  id: string;
  aydoHandle: string;
  ships: UserShip[];
}

const OperationEditor: React.FC<OperationEditorProps> = ({ 
  session, 
  operation, 
  onSave, 
  onCancel 
}) => {
  const isEditing = !!operation;
  
  // Form state
  const [formData, setFormData] = useState({
    name: operation?.name || '',
    description: operation?.description || '',
    status: operation?.status || 'Planning' as OperationStatus,
    plannedDateTime: operation?.plannedDateTime ? new Date(operation.plannedDateTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    location: operation?.location || '',
    objectives: operation?.objectives || '',
    commsChannel: operation?.commsChannel || '',
    diagramLinks: operation?.diagramLinks || ['']
  });
  
  // Participants state
  const [participants, setParticipants] = useState<OperationParticipant[]>(
    operation?.participants || []
  );
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserWithShips[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Fetch users for selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.status}`);
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        console.error('Error fetching users:', err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle diagram links changes
  const handleDiagramLinkChange = (index: number, value: string) => {
    const updatedLinks = [...formData.diagramLinks];
    updatedLinks[index] = value;
    setFormData(prev => ({
      ...prev,
      diagramLinks: updatedLinks
    }));
  };
  
  // Add a new diagram link field
  const addDiagramLink = () => {
    setFormData(prev => ({
      ...prev,
      diagramLinks: [...prev.diagramLinks, '']
    }));
  };
  
  // Remove a diagram link field
  const removeDiagramLink = (index: number) => {
    const updatedLinks = [...formData.diagramLinks];
    updatedLinks.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      diagramLinks: updatedLinks
    }));
  };
  
  // Handle adding a participant
  const handleAddParticipant = (userId: string) => {
    // Check if user is already a participant
    if (participants.some(p => p.userId === userId)) {
      return;
    }
    
    // Add new participant
    setParticipants(prev => [
      ...prev,
      {
        userId,
        role: '',
      }
    ]);
  };
  
  // Handle removing a participant
  const handleRemoveParticipant = (index: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants.splice(index, 1);
    setParticipants(updatedParticipants);
  };
  
  // Handle participant field changes
  const handleParticipantChange = (index: number, field: string, value: string) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      [field]: value
    };
    setParticipants(updatedParticipants);
  };
  
  // Handle ship assignment
  const handleShipAssignment = (index: number, manufacturer: string, name: string) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      shipManufacturer: manufacturer,
      shipName: name
    };
    setParticipants(updatedParticipants);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Filter out empty diagram links
      const filteredDiagramLinks = formData.diagramLinks.filter(link => link.trim() !== '');
      
      // Prepare data for API
      const operationData = {
        ...formData,
        diagramLinks: filteredDiagramLinks,
        participants: participants.map(p => ({
          ...p,
          // Ensure all required fields are present
          userId: p.userId,
          role: p.role || 'Crew',
          shipName: p.shipName,
          shipManufacturer: p.shipManufacturer,
          notes: p.notes
        }))
      };
      
      // Determine if we're creating or updating
      const url = isEditing 
        ? `/api/fleet-ops/operations/${operation.id}` 
        : '/api/fleet-ops/operations';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(operationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} operation`);
      }
      
      const savedOperation = await response.json();
      onSave(savedOperation);
      
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} operation`);
      console.error('Error saving operation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Find user by ID
  const findUser = (userId: string) => {
    return users.find(user => user.id === userId);
  };
  
  // Get user's ships
  const getUserShips = (userId: string) => {
    const user = findUser(userId);
    return user?.ships || [];
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="mg-title text-xl">
          {isEditing ? 'Edit Operation' : 'Create New Operation'}
        </h2>
        <button 
          className="mg-button-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
      
      {error && (
        <div className="mg-panel-error p-4 mb-6">
          <p className="mg-text-error">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mg-panel p-6 mb-6">
          <h3 className="mg-subtitle mb-4">Operation Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mg-label">Operation Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="mg-input w-full"
                value={formData.name}
                onChange={handleInputChange}
                required
                minLength={3}
              />
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="mg-label">Status</label>
              <select
                id="status"
                name="status"
                className="mg-input w-full"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="Planning">Planning</option>
                <option value="Briefing">Briefing</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Debriefing">Debriefing</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Date/Time */}
            <div>
              <label htmlFor="plannedDateTime" className="mg-label">Date & Time</label>
              <input
                type="datetime-local"
                id="plannedDateTime"
                name="plannedDateTime"
                className="mg-input w-full"
                value={formData.plannedDateTime}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="mg-label">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                className="mg-input w-full"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Comms Channel */}
            <div className="md:col-span-2">
              <label htmlFor="commsChannel" className="mg-label">Communications Channel</label>
              <input
                type="text"
                id="commsChannel"
                name="commsChannel"
                className="mg-input w-full"
                value={formData.commsChannel}
                onChange={handleInputChange}
                placeholder="Discord channel, in-game channel, etc."
              />
            </div>
            
            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="mg-label">Description</label>
              <textarea
                id="description"
                name="description"
                className="mg-input w-full h-24"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Objectives */}
            <div className="md:col-span-2">
              <label htmlFor="objectives" className="mg-label">Objectives</label>
              <textarea
                id="objectives"
                name="objectives"
                className="mg-input w-full h-32"
                value={formData.objectives}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Diagram Links */}
        <div className="mg-panel p-6 mb-6">
          <h3 className="mg-subtitle mb-4">Operation Diagrams</h3>
          <p className="mg-text-secondary mb-4">Add links to external diagrams, maps, or other reference materials.</p>
          
          {formData.diagramLinks.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                className="mg-input flex-grow"
                value={link}
                onChange={(e) => handleDiagramLinkChange(index, e.target.value)}
                placeholder="https://example.com/diagram"
              />
              <button 
                type="button"
                className="mg-button-secondary"
                onClick={() => removeDiagramLink(index)}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button 
            type="button"
            className="mg-button-secondary mt-2"
            onClick={addDiagramLink}
          >
            Add Diagram Link
          </button>
        </div>
        
        {/* Participants */}
        <div className="mg-panel p-6 mb-6">
          <h3 className="mg-subtitle mb-4">Operation Participants</h3>
          
          {/* User selector */}
          <div className="mb-6">
            <label className="mg-label">Add Participant</label>
            <UserSelector 
              users={users} 
              onSelectUser={handleAddParticipant} 
              isLoading={isLoadingUsers}
              existingParticipantIds={participants.map(p => p.userId)}
            />
          </div>
          
          {/* Participants list */}
          {participants.length > 0 ? (
            <div className="space-y-4">
              {participants.map((participant, index) => {
                const user = findUser(participant.userId);
                const userShips = getUserShips(participant.userId);
                
                return (
                  <div key={index} className="mg-panel-secondary p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="mg-subtitle">
                        {user?.aydoHandle || participant.userId}
                      </h4>
                      <button 
                        type="button"
                        className="mg-button-danger-small"
                        onClick={() => handleRemoveParticipant(index)}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Role */}
                      <div>
                        <label className="mg-label">Role</label>
                        <input
                          type="text"
                          className="mg-input w-full"
                          value={participant.role}
                          onChange={(e) => handleParticipantChange(index, 'role', e.target.value)}
                          placeholder="e.g. Pilot, Security, Engineer"
                          required
                        />
                      </div>
                      
                      {/* Ship Assignment */}
                      <div>
                        <label className="mg-label">Assigned Ship</label>
                        {userShips.length > 0 ? (
                          <select
                            className="mg-input w-full"
                            value={`${participant.shipManufacturer || ''}|${participant.shipName || ''}`}
                            onChange={(e) => {
                              const [manufacturer, name] = e.target.value.split('|');
                              if (e.target.value === '') {
                                handleParticipantChange(index, 'shipManufacturer', '');
                                handleParticipantChange(index, 'shipName', '');
                              } else {
                                handleShipAssignment(index, manufacturer, name);
                              }
                            }}
                          >
                            <option value="">No Ship Assigned</option>
                            {userShips.map((ship, shipIndex) => (
                              <option 
                                key={shipIndex} 
                                value={`${ship.manufacturer}|${ship.name}`}
                              >
                                {ship.manufacturer} {ship.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="mg-text-secondary">User has no ships registered</p>
                        )}
                      </div>
                      
                      {/* Notes */}
                      <div className="md:col-span-2">
                        <label className="mg-label">Notes</label>
                        <textarea
                          className="mg-input w-full"
                          value={participant.notes || ''}
                          onChange={(e) => handleParticipantChange(index, 'notes', e.target.value)}
                          placeholder="Additional instructions or notes for this participant"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mg-text-secondary">No participants added yet.</p>
          )}
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button 
            type="submit"
            className="mg-button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Operation' : 'Create Operation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OperationEditor; 