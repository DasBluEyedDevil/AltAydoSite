# Mission Template Storage System

This document describes the mission template storage utilities implemented following AydoCorp patterns.

## Overview

The mission template storage system provides CRUD operations for mission templates with MongoDB integration, proper error handling, data transformation, and user authorization checks.

## Files Created

### Core Storage Utility
- `src/lib/mission-template-storage.ts` - Main storage utility with CRUD functions

### API Routes
- `src/app/api/mission-templates/route.ts` - Collection-level operations (GET, POST, PUT, DELETE)
- `src/app/api/mission-templates/[id]/route.ts` - Individual template operations (GET, PUT, DELETE)

### Database Configuration
- `src/lib/mongo-indexes.ts` - Updated with mission template indexes

### Testing
- `src/scripts/test-mission-template-storage.ts` - Test script for verification

## Features Implemented

### 1. CRUD Operations
- **Create**: `createMissionTemplate()` - Creates new mission templates
- **Read**: `getMissionTemplateById()`, `getAllMissionTemplates()` - Retrieves templates
- **Update**: `updateMissionTemplate()` - Updates existing templates
- **Delete**: `deleteMissionTemplate()` - Removes templates

### 2. MongoDB Integration
- Uses centralized MongoDB connection via `connectToDatabase()`
- Proper ObjectId handling for MongoDB documents
- Collection: `mission-templates`
- Automatic index creation for performance optimization

### 3. Error Handling
- Comprehensive try-catch blocks with specific error messages
- Database connection failure handling
- Validation error reporting
- User-friendly error responses

### 4. Data Transformation
- `transformDbToResponse()` - Converts MongoDB documents to app types
- `transformResponseToDb()` - Converts app types to MongoDB documents
- Handles ObjectId conversion and field mapping

### 5. Authorization Checks
- `canUserAccessTemplate()` - Check if user can view template
- `canUserModifyTemplate()` - Check if user can edit template
- `canUserDeleteTemplate()` - Check if user can delete template
- User-based access control (users can only modify their own templates)

## API Endpoints

### Collection Operations (`/api/mission-templates`)

#### GET - List Templates
```
GET /api/mission-templates?page=1&pageSize=50&operationType=Space Operations&primaryActivity=Mining
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 50, max: 200)
- `operationType` - Filter by operation type
- `primaryActivity` - Filter by primary activity
- `createdBy` - Filter by creator

**Response:**
```json
{
  "items": [...],
  "page": 1,
  "pageSize": 50,
  "total": 25,
  "totalPages": 1
}
```

#### POST - Create Template
```
POST /api/mission-templates
Content-Type: application/json

{
  "name": "Mining Operation",
  "operationType": "Space Operations",
  "primaryActivity": "Mining",
  "secondaryActivity": "Transport",
  "shipRoster": [
    { "size": "Medium", "category": "Industrial", "count": 2 }
  ],
  "personnelRoster": [
    { "profession": "Pilot", "count": 3 }
  ],
  "requiredEquipment": "Mining lasers, cargo containers"
}
```

#### PUT - Update Template
```
PUT /api/mission-templates
Content-Type: application/json

{
  "id": "template-id",
  "name": "Updated Mining Operation",
  "requiredEquipment": "Updated equipment list"
}
```

#### DELETE - Delete Template
```
DELETE /api/mission-templates?id=template-id
```

### Individual Template Operations (`/api/mission-templates/[id]`)

#### GET - Get Template
```
GET /api/mission-templates/template-id
```

#### PUT - Update Template
```
PUT /api/mission-templates/template-id
Content-Type: application/json

{
  "name": "Updated Name",
  "requiredEquipment": "New equipment"
}
```

#### DELETE - Delete Template
```
DELETE /api/mission-templates/template-id
```

## Data Validation

The system validates:

### Required Fields
- `name` - Must be at least 3 characters
- `operationType` - Must be 'Ground Operations' or 'Space Operations'
- `primaryActivity` - Must be valid activity type
- `shipRoster` - Must be valid array of ship objects
- `personnelRoster` - Must be valid array of personnel objects
- `requiredEquipment` - Must be non-empty string

### Valid Values
- **Operation Types**: 'Ground Operations', 'Space Operations'
- **Activities**: 'Mining', 'Salvage', 'Escort', 'Transport', 'Medical', 'Combat'
- **Ship Sizes**: 'Small', 'Medium', 'Large', 'Capital'
- **Ship Categories**: 'Fighter', 'Transport', 'Industrial', 'Medical'
- **Personnel Professions**: 'Pilot', 'Gunner', 'Medic', 'Infantry', 'Engineer'

## Security Features

### Authentication
- All endpoints require valid session via `getServerSession(authOptions)`
- Returns 401 for unauthenticated requests

### Authorization
- Users can only modify/delete their own templates
- Access control checks before operations
- Returns 403 for unauthorized operations

### Input Validation
- Comprehensive validation of all input data
- Prevents invalid data from being stored
- Returns 400 for validation errors

## Database Indexes

The following indexes are automatically created for performance:

```javascript
// User-based queries
{ createdBy: 1, createdAt: -1 }

// Filtering queries
{ operationType: 1, createdAt: -1 }
{ primaryActivity: 1, createdAt: -1 }

// Public template queries (future feature)
{ isPublic: 1, createdAt: -1 }
```

## Error Handling

### Database Errors
- Connection failures return 500 with descriptive messages
- MongoDB operation errors are caught and logged
- Fallback storage support (if implemented)

### Validation Errors
- Field validation returns 400 with specific error messages
- Invalid enum values are rejected with clear feedback

### Authorization Errors
- Unauthorized access returns 401
- Insufficient permissions return 403
- Resource not found returns 404

## Testing

Run the test script to verify functionality:

```bash
npx tsx src/scripts/test-mission-template-storage.ts
```

The test covers:
- Creating templates
- Retrieving templates
- Updating templates
- Authorization checks
- Deleting templates
- Error handling

## Usage Examples

### Creating a Template
```typescript
import * as missionTemplateStorage from '@/lib/mission-template-storage';

const template = await missionTemplateStorage.createMissionTemplate({
  name: 'Escort Mission',
  operationType: 'Space Operations',
  primaryActivity: 'Escort',
  shipRoster: [
    { size: 'Large', category: 'Transport', count: 1 },
    { size: 'Small', category: 'Fighter', count: 2 }
  ],
  personnelRoster: [
    { profession: 'Pilot', count: 3 },
    { profession: 'Gunner', count: 2 }
  ],
  requiredEquipment: 'Escort ships, weapons, fuel',
  createdBy: 'user-123'
});
```

### Getting User's Templates
```typescript
const userTemplates = await missionTemplateStorage.getAllMissionTemplates({
  userId: 'user-123'
});
```

### Checking Permissions
```typescript
const canModify = await missionTemplateStorage.canUserModifyTemplate(
  'user-123', 
  'template-id'
);
```

## Future Enhancements

### Planned Features
- Public template sharing
- Template categories/tags
- Template versioning
- Template import/export
- Advanced search and filtering
- Template usage analytics

### Performance Optimizations
- Caching frequently accessed templates
- Pagination improvements
- Database query optimization
- Index tuning based on usage patterns

## Integration Notes

This storage system integrates with:
- **Authentication**: NextAuth.js session management
- **Database**: MongoDB/Cosmos DB via centralized connection
- **Types**: MissionTemplate types from `/src/types/MissionTemplate.ts`
- **Authorization**: User-based access control
- **Validation**: Comprehensive input validation
- **Error Handling**: Consistent error response format

The implementation follows AydoCorp patterns established in other storage utilities like `mission-storage.ts` and `user-storage.ts`.