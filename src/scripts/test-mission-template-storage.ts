/**
 * Test script for mission template storage utilities
 * Run with: npx tsx src/scripts/test-mission-template-storage.ts
 */

// SECURITY: Prevent execution in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Test scripts cannot be run in production environment');
  process.exit(1);
}

import * as missionTemplateStorage from '@/lib/mission-template-storage';
import { MissionTemplateResponse } from '@/types/MissionTemplate';

async function testMissionTemplateStorage() {
  console.log('🧪 Testing Mission Template Storage Utilities...\n');

  try {
    // Test data
    const testTemplate: Omit<MissionTemplateResponse, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Test Mining Operation',
      operationType: 'Space Operations',
      primaryActivity: 'Mining',
      secondaryActivity: 'Transport',
      shipRoster: [
        { size: 'Medium', category: 'Industrial', count: 2 },
        { size: 'Small', category: 'Fighter', count: 1 }
      ],
      personnelRoster: [
        { profession: 'Pilot', count: 3 },
        { profession: 'Engineer', count: 2 }
      ],
      requiredEquipment: 'Mining lasers, cargo containers, fuel',
      createdBy: 'test-user-123',
      creatorName: 'Test User'
    };

    console.log('1️⃣ Creating test mission template...');
    const createdTemplate = await missionTemplateStorage.createMissionTemplate(testTemplate);
    console.log('✅ Created template:', {
      id: createdTemplate.id,
      name: createdTemplate.name,
      operationType: createdTemplate.operationType,
      primaryActivity: createdTemplate.primaryActivity
    });

    console.log('\n2️⃣ Retrieving template by ID...');
    const retrievedTemplate = await missionTemplateStorage.getMissionTemplateById(createdTemplate.id);
    if (retrievedTemplate) {
      console.log('✅ Retrieved template:', {
        id: retrievedTemplate.id,
        name: retrievedTemplate.name,
        shipCount: retrievedTemplate.shipRoster.length,
        personnelCount: retrievedTemplate.personnelRoster.length
      });
    } else {
      console.log('❌ Failed to retrieve template');
    }

    console.log('\n3️⃣ Getting all templates...');
    const allTemplates = await missionTemplateStorage.getAllMissionTemplates({ userId: 'test-user-123' });
    console.log(`✅ Found ${allTemplates.length} templates`);

    console.log('\n4️⃣ Updating template...');
    const updateData = {
      name: 'Updated Mining Operation',
      requiredEquipment: 'Updated equipment list'
    };
    const updatedTemplate = await missionTemplateStorage.updateMissionTemplate(createdTemplate.id, updateData);
    if (updatedTemplate) {
      console.log('✅ Updated template:', {
        id: updatedTemplate.id,
        name: updatedTemplate.name,
        equipment: updatedTemplate.requiredEquipment
      });
    } else {
      console.log('❌ Failed to update template');
    }

    console.log('\n5️⃣ Testing authorization checks...');
    const canAccess = await missionTemplateStorage.canUserAccessTemplate('test-user-123', createdTemplate.id);
    const canModify = await missionTemplateStorage.canUserModifyTemplate('test-user-123', createdTemplate.id);
    const canDelete = await missionTemplateStorage.canUserDeleteTemplate('test-user-123', createdTemplate.id);
    
    console.log('✅ Authorization checks:', {
      canAccess,
      canModify,
      canDelete
    });

    console.log('\n6️⃣ Deleting template...');
    const deleteSuccess = await missionTemplateStorage.deleteMissionTemplate(createdTemplate.id);
    console.log(`✅ Delete result: ${deleteSuccess}`);

    console.log('\n7️⃣ Verifying deletion...');
    const deletedTemplate = await missionTemplateStorage.getMissionTemplateById(createdTemplate.id);
    if (!deletedTemplate) {
      console.log('✅ Template successfully deleted');
    } else {
      console.log('❌ Template still exists after deletion');
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testMissionTemplateStorage().catch(console.error);