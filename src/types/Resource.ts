export type ResourceType = 'Vehicle' | 'Ship' | 'Equipment' | 'Consumable' | 'Personnel';

export type ResourceStatus = 'Available' | 'Reserved' | 'Deployed' | 'Maintenance' | 'Unavailable';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  description: string;
  location: string;
  owner: string; // userId
  assignedTo?: string; // operationId
  quantity?: number;
  capacity?: number;
  specs?: Record<string, string>;
  manufacturer?: string;
  model?: string;
  imageUrl?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface ResourceAllocation {
  resourceId: string;
  operationId: string;
  quantity?: number;
  role?: string;
  notes?: string;
  startDateTime: string; // ISO
  endDateTime: string; // ISO
  allocatedById: string; // userId
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
