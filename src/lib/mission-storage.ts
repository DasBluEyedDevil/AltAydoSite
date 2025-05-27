import { MissionResponse, MissionStatus, MissionType } from '@/types/Mission';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as mongoDb from './mongodb-client';
import { shouldUseMongoDb } from './storage-utils';
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

// File storage paths
const dataDir = path.join(process.cwd(), 'data');
const missionsFilePath = path.join(dataDir, 'missions.json');

// Tracking if we had to fall back to local storage
let usingFallbackStorage = false;

// Helper functions for local file storage
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    console.log(`STORAGE: Creating data directory: ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(missionsFilePath)) {
    console.log(`STORAGE: Creating empty missions file: ${missionsFilePath}`);
    fs.writeFileSync(missionsFilePath, JSON.stringify([]), 'utf8');
  }
}

function getLocalMissions(): MissionResponse[] {
  console.log('STORAGE: Reading missions from local storage');
  ensureDataDir();
  
  try {
    const data = fs.readFileSync(missionsFilePath, 'utf8');
    const missions = JSON.parse(data) as MissionResponse[];
    console.log(`STORAGE: Found ${missions.length} missions in local storage`);
    return missions;
  } catch (error) {
    console.error('STORAGE: Error reading missions file:', error);
    return [];
  }
}

function saveLocalMission(mission: MissionResponse): void {
  console.log(`STORAGE: Saving mission to local storage: ${mission.name}`);
  ensureDataDir();
  
  const missions = getLocalMissions();
  
  // Check if mission already exists
  const existingMissionIndex = missions.findIndex(m => m.id === mission.id);
  if (existingMissionIndex >= 0) {
    // Update existing mission
    console.log(`STORAGE: Updating existing mission: ${mission.name}`);
    missions[existingMissionIndex] = mission;
  } else {
    // Add new mission
    console.log(`STORAGE: Adding new mission: ${mission.name}`);
    missions.push(mission);
  }
  
  fs.writeFileSync(missionsFilePath, JSON.stringify(missions, null, 2), 'utf8');
  console.log(`STORAGE: Successfully saved missions to file, total count: ${missions.length}`);
}

function deleteLocalMission(id: string): void {
  console.log(`STORAGE: Deleting mission from local storage: ${id}`);
  ensureDataDir();
  
  const missions = getLocalMissions();
  const filteredMissions = missions.filter(m => m.id !== id);
  
  fs.writeFileSync(missionsFilePath, JSON.stringify(filteredMissions, null, 2), 'utf8');
  console.log(`STORAGE: Mission deleted from local storage, remaining missions: ${filteredMissions.length}`);
}

// Mission storage API
export async function getMissionById(id: string): Promise<MissionResponse | null> {
  console.log(`STORAGE: Getting mission by ID: ${id}`);
  
  if (await shouldUseMongoDb()) {
    try {
      // Try to use MongoDB
      const { db } = await connectToDatabase();
      const mission = await db.collection('missions').findOne({ _id: new ObjectId(id) });
      
      if (!mission) {
        console.log(`STORAGE: Mission not found in MongoDB: ${id}`);
        return null;
      }
      
      // Transform MongoDB _id to id for client
      const transformedMission = {
        ...mission,
        id: mission._id.toString(),
        _id: undefined
      };
      
      console.log(`STORAGE: Found mission in MongoDB: ${transformedMission.name}`);
      return transformedMission;
    } catch (error) {
      console.error('STORAGE: MongoDB getMissionById failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Getting mission by ID from local storage: ${id}`);
  const missions = getLocalMissions();
  const mission = missions.find(m => m.id === id) || null;
  console.log(`STORAGE: ${mission ? 'Found' : 'Did not find'} mission with ID: ${id}`);
  return mission;
}

export async function getAllMissions(filters?: { status?: string; leaderId?: string; userId?: string }): Promise<MissionResponse[]> {
  console.log(`STORAGE: Getting all missions with filters:`, filters);
  
  if (await shouldUseMongoDb()) {
    try {
      // Try to use MongoDB
      const { db } = await connectToDatabase();
      
      // Build query
      const query: any = {};
      
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          query.status = filters.status;
        }
        
        if (filters.leaderId) {
          query.leaderId = filters.leaderId;
        }
        
        if (filters.userId) {
          query['participants.userId'] = filters.userId;
        }
      }
      
      // Get missions from database
      const missions = await db.collection('missions')
        .find(query)
        .sort({ scheduledDateTime: -1 })
        .toArray();
      
      // Transform MongoDB _id to id for client
      const transformedMissions = missions.map(mission => ({
        ...mission,
        id: mission._id.toString(),
        _id: undefined
      }));
      
      console.log(`STORAGE: Found ${transformedMissions.length} missions in MongoDB`);
      return transformedMissions;
    } catch (error) {
      console.error('STORAGE: MongoDB getAllMissions failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Getting missions from local storage`);
  let missions = getLocalMissions();
  
  // Apply filters if provided
  if (filters) {
    if (filters.status && filters.status !== 'all') {
      missions = missions.filter(m => m.status === filters.status);
    }
    
    if (filters.leaderId) {
      missions = missions.filter(m => m.leaderId === filters.leaderId);
    }
    
    if (filters.userId) {
      missions = missions.filter(m => 
        m.leaderId === filters.userId || 
        m.participants.some(p => p.userId === filters.userId)
      );
    }
  }
  
  // Sort by scheduledDateTime in descending order
  missions.sort((a, b) => {
    const dateA = new Date(a.scheduledDateTime).getTime();
    const dateB = new Date(b.scheduledDateTime).getTime();
    return dateB - dateA;
  });
  
  console.log(`STORAGE: Found ${missions.length} missions after applying filters`);
  return missions;
}

export async function createMission(missionData: Omit<MissionResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<MissionResponse> {
  console.log(`STORAGE: Creating mission: ${missionData.name}`);
  
  // Create a complete mission object with ID and timestamps
  const mission: MissionResponse = {
    ...missionData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (await shouldUseMongoDb()) {
    try {
      // Try to use MongoDB
      const { db } = await connectToDatabase();
      
      // Prepare mission data for MongoDB (convert id to _id)
      const mongoMission = {
        ...mission,
        _id: new ObjectId(),
        id: undefined
      };
      
      // Insert mission into database
      const result = await db.collection('missions').insertOne(mongoMission);
      
      if (!result.insertedId) {
        throw new Error('Failed to insert mission: No insertedId returned');
      }
      
      // Update mission with MongoDB _id
      mission.id = result.insertedId.toString();
      
      console.log(`STORAGE: Mission created in MongoDB: ${mission.name} with ID: ${mission.id}`);
      return mission;
    } catch (error) {
      console.error('STORAGE: MongoDB createMission failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Creating mission in local storage: ${mission.name}`);
  saveLocalMission(mission);
  return mission;
}

export async function updateMission(id: string, missionData: Partial<MissionResponse>): Promise<MissionResponse | null> {
  console.log(`STORAGE: Updating mission: ${id}`);
  
  if (await shouldUseMongoDb()) {
    try {
      // Try to use MongoDB
      const { db } = await connectToDatabase();
      
      // Update mission in database
      const result = await db.collection('missions').updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...missionData,
            updatedAt: new Date().toISOString()
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        console.log(`STORAGE: Mission not found in MongoDB: ${id}`);
        return null;
      }
      
      // Get updated mission
      const updatedMission = await getMissionById(id);
      console.log(`STORAGE: Mission updated in MongoDB: ${updatedMission?.name}`);
      return updatedMission;
    } catch (error) {
      console.error('STORAGE: MongoDB updateMission failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Updating mission in local storage: ${id}`);
  const missions = getLocalMissions();
  const missionIndex = missions.findIndex(m => m.id === id);
  
  if (missionIndex === -1) {
    console.log(`STORAGE: Mission not found for update: ${id}`);
    return null;
  }
  
  const updatedMission = {
    ...missions[missionIndex],
    ...missionData,
    updatedAt: new Date().toISOString()
  };
  
  saveLocalMission(updatedMission);
  return updatedMission;
}

export async function deleteMission(id: string): Promise<boolean> {
  console.log(`STORAGE: Deleting mission: ${id}`);
  
  if (await shouldUseMongoDb()) {
    try {
      // Try to use MongoDB
      const { db } = await connectToDatabase();
      
      // Delete mission from database
      const result = await db.collection('missions').deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        console.log(`STORAGE: Mission not found in MongoDB: ${id}`);
        return false;
      }
      
      console.log(`STORAGE: Mission deleted from MongoDB: ${id}`);
      return true;
    } catch (error) {
      console.error('STORAGE: MongoDB deleteMission failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Deleting mission from local storage: ${id}`);
  const missions = getLocalMissions();
  const missionExists = missions.some(m => m.id === id);
  
  if (!missionExists) {
    console.log(`STORAGE: Mission not found: ${id}`);
    return false;
  }
  
  deleteLocalMission(id);
  return true;
}

export function isUsingFallbackStorage(): boolean {
  return usingFallbackStorage;
}