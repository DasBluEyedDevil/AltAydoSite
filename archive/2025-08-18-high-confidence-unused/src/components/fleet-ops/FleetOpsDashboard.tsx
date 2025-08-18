'use client';

import React, { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { OperationResponse, OperationStatus } from '@/types/Operation';
import OperationCard from './OperationCard';
import OperationEditor from './OperationEditor';
import OperationDetailView from './OperationDetailView';

interface FleetOpsDashboardProps {
  session: Session;
}

const FleetOpsDashboard: React.FC<FleetOpsDashboardProps> = ({ session }) => {
  const [operations, setOperations] = useState<OperationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OperationStatus | 'all'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [viewingOperation, setViewingOperation] = useState<OperationResponse | null>(null);
  const [editingOperation, setEditingOperation] = useState<OperationResponse | null>(null);

  // Check if user has leadership role
  const isLeadership = true; // Remove role restrictions - all users are treated as leadership

  // Fetch operations data
  useEffect(() => {
    const fetchOperations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query string for filters
        let queryParams = '';
        if (statusFilter !== 'all') {
          queryParams = `?status=${statusFilter}`;
        }
        
        const response = await fetch(`/api/fleet-ops/operations${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching operations: ${response.status}`);
        }
        
        const data = await response.json();
        setOperations(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch operations');
        console.error('Error fetching operations:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOperations();
  }, [statusFilter]);
  
  // Group operations by status
  const groupedOperations = {
    planning: operations.filter(op => op.status === 'Planning'),
    briefing: operations.filter(op => op.status === 'Briefing'),
    active: operations.filter(op => op.status === 'Active'),
    completed: operations.filter(op => op.status === 'Completed'),
    debriefing: operations.filter(op => op.status === 'Debriefing'),
    cancelled: operations.filter(op => op.status === 'Cancelled')
  };
  
  // Handle operation creation
  const handleCreateOperation = () => {
    setIsCreating(true);
    setViewingOperation(null);
    setEditingOperation(null);
  };
  
  // Handle operation view
  const handleViewOperation = (operation: OperationResponse) => {
    setViewingOperation(operation);
    setIsCreating(false);
    setEditingOperation(null);
  };
  
  // Handle operation edit
  const handleEditOperation = (operation: OperationResponse) => {
    setEditingOperation(operation);
    setViewingOperation(null);
    setIsCreating(false);
  };
  
  // Handle back to list
  const handleBackToList = () => {
    setViewingOperation(null);
    setIsCreating(false);
    setEditingOperation(null);
  };
  
  // Handle operation save
  const handleOperationSaved = (savedOperation: OperationResponse) => {
    // Refresh operations list
    setOperations(prev => {
      const exists = prev.some(op => op.id === savedOperation.id);
      if (exists) {
        return prev.map(op => op.id === savedOperation.id ? savedOperation : op);
      } else {
        return [...prev, savedOperation];
      }
    });
    
    // View the saved operation
    setViewingOperation(savedOperation);
    setIsCreating(false);
    setEditingOperation(null);
  };
  
  // Handle operation delete
  const handleOperationDeleted = (operationId: string) => {
    setOperations(prev => prev.filter(op => op.id !== operationId));
    setViewingOperation(null);
    setEditingOperation(null);
  };
  
  // Render the appropriate view
  if (isCreating) {
    return (
      <OperationEditor 
        session={session} 
        onSave={handleOperationSaved} 
        onCancel={handleBackToList} 
      />
    );
  }
  
  if (editingOperation) {
    return (
      <OperationEditor 
        session={session} 
        operation={editingOperation} 
        onSave={handleOperationSaved} 
        onCancel={handleBackToList} 
      />
    );
  }
  
  if (viewingOperation) {
    return (
      <OperationDetailView 
        operation={viewingOperation} 
        session={session}
        onBack={handleBackToList}
        onEdit={() => handleEditOperation(viewingOperation)}
        onDelete={handleOperationDeleted}
      />
    );
  }
  
  // Main dashboard view
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with filters and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="mg-subtitle text-xl mb-2">Operations Dashboard</h2>
          <div className="flex gap-2">
            <select 
              className="mg-input text-sm py-1.5 px-3 bg-[rgba(var(--mg-panel-dark),0.6)] border border-[rgba(var(--mg-primary),0.25)] rounded-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OperationStatus | 'all')}
            >
              <option value="all">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="Briefing">Briefing</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Debriefing">Debriefing</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        {isLeadership && (
          <button 
            className="mg-button py-2 px-4 mt-4 md:mt-0 text-sm font-quantify tracking-wider relative group overflow-hidden"
            onClick={handleCreateOperation}
          >
            <span className="relative z-10">CREATE NEW OPERATION</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="radar-sweep"></div>
            </div>
          </button>
        )}
      </div>
      
      {/* Loading and error states */}
      {loading && (
        <div className="text-center py-8">
          <div className="mg-loader mx-auto"></div>
          <p className="mg-text mt-4">Loading operations...</p>
        </div>
      )}
      
      {error && !loading && (
        <div className="mg-panel-error p-4 mb-6 border border-[rgba(var(--mg-error),0.3)] bg-[rgba(var(--mg-error),0.1)] rounded-sm">
          <p className="mg-text-error">{error}</p>
          <button 
            className="mg-button py-1.5 px-3 mt-2 text-xs font-quantify"
            onClick={() => setStatusFilter(statusFilter)} // Trigger a refresh
          >
            RETRY
          </button>
        </div>
      )}
      
      {/* Operations sections */}
      {!loading && !error && (
        <div className="space-y-8">
          {/* Active Operations */}
          <div>
            <h3 className="mg-subtitle text-lg mb-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-2"></span>
              Active Operations
            </h3>
            {groupedOperations.active.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedOperations.active.map(operation => (
                  <OperationCard 
                    key={operation.id} 
                    operation={operation} 
                    onClick={() => handleViewOperation(operation)} 
                  />
                ))}
              </div>
            ) : (
              <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] border border-[rgba(var(--mg-primary),0.1)] rounded-sm p-4 text-center">
                <p className="mg-text-secondary">No active operations at this time.</p>
              </div>
            )}
          </div>
          
          {/* Upcoming Operations (Planning & Briefing) */}
          <div>
            <h3 className="mg-subtitle text-lg mb-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-2"></span>
              Upcoming Operations
            </h3>
            {groupedOperations.planning.length > 0 || groupedOperations.briefing.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...groupedOperations.planning, ...groupedOperations.briefing]
                  .sort((a, b) => new Date(a.plannedDateTime).getTime() - new Date(b.plannedDateTime).getTime())
                  .map(operation => (
                    <OperationCard 
                      key={operation.id} 
                      operation={operation} 
                      onClick={() => handleViewOperation(operation)} 
                    />
                  ))
                }
              </div>
            ) : (
              <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] border border-[rgba(var(--mg-primary),0.1)] rounded-sm p-4 text-center">
                <p className="mg-text-secondary">No upcoming operations at this time.</p>
              </div>
            )}
          </div>
          
          {/* Past Operations (Completed & Debriefing) */}
          <div>
            <h3 className="mg-subtitle text-lg mb-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-2"></span>
              Past Operations
            </h3>
            {groupedOperations.completed.length > 0 || groupedOperations.debriefing.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...groupedOperations.completed, ...groupedOperations.debriefing]
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 6) // Show only most recent
                  .map(operation => (
                    <OperationCard 
                      key={operation.id} 
                      operation={operation} 
                      onClick={() => handleViewOperation(operation)} 
                    />
                  ))
                }
              </div>
            ) : (
              <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.3)] border border-[rgba(var(--mg-primary),0.1)] rounded-sm p-4 text-center">
                <p className="mg-text-secondary">No past operations to display.</p>
              </div>
            )}
          </div>
          
          {/* Cancelled Operations */}
          {groupedOperations.cancelled.length > 0 && (
            <div>
              <h3 className="mg-subtitle text-lg mb-3 flex items-center">
                <span className="w-2 h-2 rounded-full bg-[rgba(var(--mg-error),0.8)] mr-2"></span>
                Cancelled Operations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedOperations.cancelled
                  .slice(0, 3) // Show only most recent
                  .map(operation => (
                    <OperationCard 
                      key={operation.id} 
                      operation={operation} 
                      onClick={() => handleViewOperation(operation)} 
                    />
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FleetOpsDashboard; 