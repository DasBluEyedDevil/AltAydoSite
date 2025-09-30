import { MissionTemplate, MissionTemplateResponse } from '@/types/MissionTemplate';
import fs from 'fs';
import path from 'path';
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

// File storage paths
const dataDir = path.join(process.cwd(), 'data');
const missionTemplatesFilePath = path.join(dataDir, 'mission-templates.json');

// Tracking if we had to fall back to local storage
let usingFallbackStorage = false;

// Helper functions for local file storage
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    console.log(`STORAGE: Creating data directory: ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(missionTemplatesFilePath)) {
    console.log(`STORAGE: Creating empty mission templates file: ${missionTemplatesFilePath}`);
    fs.writeFileSync(missionTemplatesFilePath, JSON.stringify([]), 'utf8');
  }
}

function getLocalMissionTemplates(): MissionTemplateResponse[] {
  console.log('STORAGE: Reading mission templates from local storage');
  ensureDataDir();

  try {
    const data = fs.readFileSync(missionTemplatesFilePath, 'utf8');
    const templates = JSON.parse(data) as MissionTemplateResponse[];
    console.log(`STORAGE: Found ${templates.length} mission templates in local storage`);
    return templates;
  } catch (error) {
    console.error('STORAGE: Error reading mission templates file:', error);
    return [];
  }
}

function saveLocalMissionTemplate(template: MissionTemplateResponse): void {
  console.log(`STORAGE: Saving mission template to local storage: ${template.name}`);
  ensureDataDir();

  const templates = getLocalMissionTemplates();

  // Check if template already exists
  const existingTemplateIndex = templates.findIndex(t => t.id === template.id);
  if (existingTemplateIndex >= 0) {
    // Update existing template
    console.log(`STORAGE: Updating existing mission template: ${template.name}`);
    templates[existingTemplateIndex] = template;
  } else {
    // Add new template
    console.log(`STORAGE: Adding new mission template: ${template.name}`);
    templates.push(template);
  }

  fs.writeFileSync(missionTemplatesFilePath, JSON.stringify(templates, null, 2), 'utf8');
  console.log(`STORAGE: Successfully saved mission templates to file, total count: ${templates.length}`);
}

function deleteLocalMissionTemplate(id: string): void {
  console.log(`STORAGE: Deleting mission template from local storage: ${id}`);
  ensureDataDir();

  const templates = getLocalMissionTemplates();
  const filteredTemplates = templates.filter(t => t.id !== id);

  fs.writeFileSync(missionTemplatesFilePath, JSON.stringify(filteredTemplates, null, 2), 'utf8');
  console.log(`STORAGE: Mission template deleted from local storage, remaining templates: ${filteredTemplates.length}`);
}

// MongoDB helper functions
function tryConvertToObjectId(id: string): ObjectId | string {
  try {
    return new ObjectId(id);
  } catch (error) {
    return id;
  }
}

function createIdFilter(id: string): any {
  try {
    // Try to convert to MongoDB ObjectId
    return { _id: new ObjectId(id) };
  } catch (error) {
    // If conversion fails, it's not a valid ObjectId format
    console.log(`ID ${id} is not a valid MongoDB ObjectId, using string ID filter`);
    return { id: id };
  }
}

// Transform MongoDB document to MissionTemplateResponse
function transformDbToResponse(dbTemplate: any): MissionTemplateResponse {
  return {
    id: (dbTemplate as any)._id.toString(),
    name: dbTemplate.name,
    operationType: dbTemplate.operationType,
    primaryActivity: dbTemplate.primaryActivity,
    secondaryActivity: dbTemplate.secondaryActivity,
    tertiaryActivity: dbTemplate.tertiaryActivity,
    shipRoster: dbTemplate.shipRoster || [],
    personnelRoster: dbTemplate.personnelRoster || [],
    requiredEquipment: dbTemplate.requiredEquipment || '',
    createdBy: dbTemplate.createdBy,
    createdAt: dbTemplate.createdAt,
    updatedAt: dbTemplate.updatedAt,
    creatorName: dbTemplate.creatorName
  };
}

// Transform MissionTemplate to MongoDB document
function transformResponseToDb(template: MissionTemplateResponse): any {
  const dbTemplate = {
    name: template.name,
    operationType: template.operationType,
    primaryActivity: template.primaryActivity,
    secondaryActivity: template.secondaryActivity,
    tertiaryActivity: template.tertiaryActivity,
    shipRoster: template.shipRoster,
    personnelRoster: template.personnelRoster,
    requiredEquipment: template.requiredEquipment,
    createdBy: template.createdBy,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    creatorName: template.creatorName
  };

  // Only add _id if it's a valid ObjectId
  if (template.id && ObjectId.isValid(template.id)) {
    (dbTemplate as any)._id = new ObjectId(template.id);
  }

  return dbTemplate;
}

// Mission Template storage API
export async function getMissionTemplateById(id: string): Promise<MissionTemplateResponse | null> {
  console.log(`STORAGE: Getting mission template by ID: ${id}`);

  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Create a filter that works with the ID format
    const filter = createIdFilter(id);
    const template = await db.collection('mission-templates').findOne(filter);

    if (!template) {
      console.log(`STORAGE: Mission template not found in MongoDB: ${id}`);
      return null;
    }

    // Transform MongoDB document to MissionTemplateResponse
    const transformedTemplate = transformDbToResponse(template);

    console.log(`STORAGE: Found mission template in MongoDB: ${transformedTemplate.name}`);
    return transformedTemplate;
  } catch (error) {
    console.error('STORAGE: MongoDB getMissionTemplateById failed:', error);
    throw new Error('Database connection failed: Cannot retrieve mission template data');
  }
}

export async function getAllMissionTemplates(filters?: { 
  createdBy?: string; 
  operationType?: string; 
  primaryActivity?: string;
  userId?: string;
}): Promise<MissionTemplateResponse[]> {
  console.log('STORAGE: Getting all mission templates');

  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Prepare query filter
    let query: any = {};
    
    if (filters) {
      if (filters.createdBy) {
        query.createdBy = filters.createdBy;
      }
      
      if (filters.operationType && filters.operationType !== 'all') {
        query.operationType = filters.operationType;
      }
      
      if (filters.primaryActivity && filters.primaryActivity !== 'all') {
        query.primaryActivity = filters.primaryActivity;
      }
      
      // For userId filter, we'll show templates created by the user or public templates
      if (filters.userId) {
        query = {
          $or: [
            { createdBy: filters.userId },
            { isPublic: true } // Assuming we might add public templates in the future
          ]
        };
      }
    }
    
    // Get mission templates from MongoDB
    const templates = await db.collection('mission-templates').find(query).toArray();
    
    // Transform to MissionTemplateResponse objects
    const transformedTemplates: MissionTemplateResponse[] = templates.map(template => 
      transformDbToResponse(template)
    );
    
    // Sort by createdAt in descending order (newest first)
    transformedTemplates.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    console.log(`STORAGE: Found ${transformedTemplates.length} mission templates after applying filters`);
    return transformedTemplates;
  } catch (error) {
    console.error('STORAGE: MongoDB getAllMissionTemplates failed:', error);
    throw new Error('Database connection failed: Cannot retrieve mission template data');
  }
}

export async function createMissionTemplate(templateData: Omit<MissionTemplateResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<MissionTemplateResponse> {
  console.log(`STORAGE: Creating mission template: ${templateData.name}`);

  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Create a complete template object with timestamps
    const template = {
      ...templateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert template into database
    const result = await db.collection('mission-templates').insertOne(template);
    
    if (!result.insertedId) {
      throw new Error('Failed to insert mission template: No insertedId returned');
    }
    
    // Create the final template response with the MongoDB _id
    const createdTemplate: MissionTemplateResponse = {
      ...template,
      id: result.insertedId.toString()
    } as MissionTemplateResponse;
    
    console.log(`STORAGE: Mission template created in MongoDB: ${createdTemplate.name} with ID: ${createdTemplate.id}`);
    return createdTemplate;
  } catch (error) {
    console.error('STORAGE: MongoDB createMissionTemplate failed:', error);
    throw new Error('Database connection failed: Cannot create mission template');
  }
}

export async function updateMissionTemplate(id: string, templateData: Partial<MissionTemplateResponse>): Promise<MissionTemplateResponse | null> {
  console.log(`STORAGE: Updating mission template: ${id}`);

  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Create a filter that works with the ID format
    const filter = createIdFilter(id);
    console.log(`STORAGE: Using filter for update:`, filter);
    
    // Create a MongoDB update document without 'id' field
    const updateData = { ...templateData };
    delete (updateData as any).id; // Remove 'id' as it shouldn't be in the $set
    
    // If _id exists in the data, also delete it to prevent update errors
    if ((updateData as any)._id) {
      delete (updateData as any)._id;
    }
    
    // Log the update data for debugging
    console.log(`STORAGE: Update data prepared:`, JSON.stringify(updateData, null, 2).substring(0, 200) + '...');
    
    try {
      // Update template in database
      const result = await db.collection('mission-templates').updateOne(
        filter,
        { 
          $set: { 
            ...updateData,
            updatedAt: new Date().toISOString()
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        console.log(`STORAGE: Mission template not found in MongoDB: ${id}`);
        return null;
      }
      
      // Get updated template
      const updatedTemplate = await getMissionTemplateById(id);
      console.log(`STORAGE: Mission template updated in MongoDB: ${updatedTemplate?.name}`);
      return updatedTemplate;
    } catch (updateError: unknown) {
      console.error('STORAGE: MongoDB update operation failed:', updateError);
      const errorMsg = updateError instanceof Error ? updateError.message : 'Unknown update error';
      throw new Error(`Database update operation failed: ${errorMsg}`);
    }
  } catch (error: unknown) {
    console.error('STORAGE: MongoDB updateMissionTemplate failed:', error);
    
    // Try to provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`STORAGE: Falling back to local storage due to error: ${errorMessage}`);
    
    // Optional: Implement fallback to local storage here if needed
    
    throw new Error(`Database connection failed: Cannot update mission template - ${errorMessage}`);
  }
}

export async function deleteMissionTemplate(id: string): Promise<boolean> {
  console.log(`STORAGE: Deleting mission template: ${id}`);

  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Create a filter that works with the ID format
    const filter = createIdFilter(id);
    
    // Delete template from database
    const result = await db.collection('mission-templates').deleteOne(filter);
    
    if (result.deletedCount === 0) {
      console.log(`STORAGE: Mission template not found in MongoDB: ${id}`);
      return false;
    }
    
    console.log(`STORAGE: Mission template deleted from MongoDB: ${id}`);
    return true;
  } catch (error) {
    console.error('STORAGE: MongoDB deleteMissionTemplate failed:', error);
    throw new Error('Database connection failed: Cannot delete mission template');
  }
}

// Authorization helper functions
export async function canUserAccessTemplate(userId: string, templateId: string): Promise<boolean> {
  try {
    const template = await getMissionTemplateById(templateId);
    if (!template) {
      return false;
    }
    
    // Users can access their own templates
    if (template.createdBy === userId) {
      return true;
    }
    
    // TODO: Add additional authorization logic here based on clearance levels, roles, etc.
    // For now, allow access to all templates (can be restricted later)
    return true;
  } catch (error) {
    console.error('STORAGE: Error checking template access:', error);
    return false;
  }
}

export async function canUserModifyTemplate(userId: string, templateId: string): Promise<boolean> {
  try {
    const template = await getMissionTemplateById(templateId);
    if (!template) {
      return false;
    }
    
    // Users can only modify their own templates
    return template.createdBy === userId;
  } catch (error) {
    console.error('STORAGE: Error checking template modification access:', error);
    return false;
  }
}

export async function canUserDeleteTemplate(userId: string, templateId: string): Promise<boolean> {
  try {
    const template = await getMissionTemplateById(templateId);
    if (!template) {
      return false;
    }
    
    // Users can only delete their own templates
    return template.createdBy === userId;
  } catch (error) {
    console.error('STORAGE: Error checking template deletion access:', error);
    return false;
  }
}

export function isUsingFallbackStorage(): boolean {
  return usingFallbackStorage;
}