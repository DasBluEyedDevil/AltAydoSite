# Mission Template Database UI Revamp Implementation Plan

> **For Claude:** Use `superpowers:executing-plans` or `superpowers:subagent-driven-development` to implement this plan task-by-task.

**Goal:** Transform the mission template page from having 3-4 redundant "Create Template" buttons into an immersive sci-fi interface with expandable template strips, eliminating visual clutter while enhancing the holographic aesthetic.

**Architecture:** Replace multiple panels with a single slim header bar and vertically stacked expandable template strips. Only one template expands at a time (accordion-style). Expanded state shows full details inline with smooth animations. Create/Edit modes remain full-screen forms.

**Tech Stack:**
- React 18 with TypeScript
- Framer Motion for animations
- Existing MobiGlas component library
- Next.js 15.3.3 App Router

---

## Task 1: Create Utility Components for Holographic Effects

**Files:**
- Create: `src/components/ui/mobiglas/DataStreamBackground.tsx`
- Create: `src/components/ui/mobiglas/HolographicBorder.tsx`
- Create: `src/components/ui/mobiglas/index.ts` (if doesn't exist, or modify existing)

### Step 1: Create DataStreamBackground component

Create `src/components/ui/mobiglas/DataStreamBackground.tsx`:

```typescript
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DataStreamBackgroundProps {
  opacity?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'medium' | 'fast';
}

/**
 * Animated data stream background effect - vertical lines with traveling dots
 * Creates an immersive sci-fi atmosphere
 */
const DataStreamBackground: React.FC<DataStreamBackgroundProps> = ({
  opacity = 'low',
  speed = 'medium'
}) => {
  const opacityMap = { low: 0.1, medium: 0.2, high: 0.3 };
  const speedMap = { slow: 8, medium: 5, fast: 3 };

  const opacityValue = opacityMap[opacity];
  const duration = speedMap[speed];

  // Generate 5 vertical data streams at random positions
  const streams = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    left: `${15 + i * 20}%`,
    delay: i * 0.4
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="absolute top-0 bottom-0 w-px"
          style={{
            left: stream.left,
            background: `rgba(var(--mg-primary), ${opacityValue})`
          }}
        >
          <motion.div
            className="w-2 h-2 rounded-full absolute left-1/2 -translate-x-1/2"
            style={{
              background: `rgba(var(--mg-primary), ${opacityValue * 3})`,
              boxShadow: `0 0 8px rgba(var(--mg-primary), ${opacityValue * 2})`
            }}
            animate={{
              y: ['-10%', '110%']
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: stream.delay,
              ease: 'linear'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DataStreamBackground;
```

### Step 2: Create HolographicBorder component

Create `src/components/ui/mobiglas/HolographicBorder.tsx`:

```typescript
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HolographicBorderProps {
  children: React.ReactNode;
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

/**
 * Wrapper component that adds animated holographic border effect
 * Border glows and pulses, especially on hover/active states
 */
const HolographicBorder: React.FC<HolographicBorderProps> = ({
  children,
  isActive = false,
  intensity = 'medium',
  className = ''
}) => {
  const intensityMap = {
    low: { opacity: 0.3, glow: 0.2 },
    medium: { opacity: 0.5, glow: 0.3 },
    high: { opacity: 0.8, glow: 0.5 }
  };

  const { opacity, glow } = intensityMap[intensity];

  return (
    <div className={`relative ${className}`}>
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          border: `1px solid rgba(var(--mg-primary), ${opacity})`,
          boxShadow: isActive
            ? `0 0 20px rgba(var(--mg-primary), ${glow}), inset 0 0 20px rgba(var(--mg-primary), ${glow * 0.5})`
            : `0 0 10px rgba(var(--mg-primary), ${glow * 0.5})`
        }}
        animate={{
          opacity: isActive ? [opacity, opacity * 1.3, opacity] : opacity
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default HolographicBorder;
```

### Step 3: Export new components

Update or create `src/components/ui/mobiglas/index.ts`:

```typescript
// Existing exports (keep all existing exports)
export { default as MobiGlasButton } from './MobiGlasButton';
export { default as CornerAccents } from './CornerAccents';
// ... other existing exports

// New exports
export { default as DataStreamBackground } from './DataStreamBackground';
export { default as HolographicBorder } from './HolographicBorder';
```

### Step 4: Verify components compile

Run: `npm run type-check`

Expected: No TypeScript errors

### Step 5: Commit utility components

```bash
git add src/components/ui/mobiglas/DataStreamBackground.tsx src/components/ui/mobiglas/HolographicBorder.tsx src/components/ui/mobiglas/index.ts
git commit -m "feat: add holographic effect utility components for mission template UI"
```

---

## Task 2: Create TemplateStrip Component

**Files:**
- Create: `src/components/dashboard/TemplateStrip.tsx`

### Step 1: Create the TemplateStrip component file

Create `src/components/dashboard/TemplateStrip.tsx`:

```typescript
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionTemplateResponse } from '@/types/MissionTemplate';
import { HolographicBorder, CornerAccents } from '../ui/mobiglas';

// Icons
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const TemplateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

interface TemplateStripProps {
  template: MissionTemplateResponse;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUseForMission: () => void;
}

/**
 * TemplateStrip - Expandable template card for mission template list
 * Displays collapsed summary, expands to show full details inline
 */
const TemplateStrip: React.FC<TemplateStripProps> = ({
  template,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onUseForMission
}) => {
  return (
    <HolographicBorder isActive={isExpanded} intensity={isExpanded ? 'high' : 'medium'}>
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : '100px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden bg-gradient-to-br from-[rgba(var(--mg-panel-dark),0.6)] to-[rgba(var(--mg-panel-dark),0.3)] rounded-lg relative"
      >
        {/* Header - Always Visible (Clickable to expand/collapse) */}
        <div
          onClick={onToggleExpand}
          className="h-[100px] px-6 py-4 cursor-pointer hover:bg-[rgba(var(--mg-primary),0.05)] transition-colors relative"
        >
          {/* Circuit pattern overlay */}
          <div className="circuit-bg absolute inset-0 rounded-lg pointer-events-none opacity-20"></div>

          <div className="relative z-10 flex items-center justify-between h-full">
            {/* Left: Icon + Name */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="text-[rgba(var(--mg-primary),0.8)]">
                <TemplateIcon />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[rgba(var(--mg-primary),0.9)] mb-1">
                  {template.name}
                </h3>
                <div className="text-sm text-[rgba(var(--mg-text),0.6)]">
                  {template.operationType}
                </div>
              </div>
            </div>

            {/* Center: Primary Activity Badge */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="px-3 py-1 rounded bg-[rgba(var(--mg-primary),0.2)] border border-[rgba(var(--mg-primary),0.4)]">
                <span className="text-sm text-[rgba(var(--mg-primary),0.9)] font-medium">
                  {template.primaryActivity}
                </span>
              </div>
            </div>

            {/* Right: Date + Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:block text-sm text-[rgba(var(--mg-text),0.6)]">
                {new Date(template.createdAt).toLocaleDateString()}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={onEdit}
                  className="p-2 rounded hover:bg-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),0.8)] hover:text-[rgba(var(--mg-primary),1)] transition-colors"
                  title="Edit Template"
                  aria-label={`Edit ${template.name}`}
                >
                  <EditIcon />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 rounded hover:bg-[rgba(var(--mg-danger),0.2)] text-[rgba(var(--mg-danger),0.8)] hover:text-[rgba(var(--mg-danger),1)] transition-colors"
                  title="Delete Template"
                  aria-label={`Delete ${template.name}`}
                >
                  <TrashIcon />
                </button>
                {!isExpanded && (
                  <button
                    onClick={onUseForMission}
                    className="p-2 rounded hover:bg-[rgba(var(--mg-success),0.2)] text-[rgba(var(--mg-success),0.8)] hover:text-[rgba(var(--mg-success),1)] transition-colors"
                    title="Use for Mission"
                    aria-label={`Use ${template.name} for new mission`}
                  >
                    <ArrowRightIcon />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Corner accents */}
          <CornerAccents variant="animated" color="primary" size="sm" />
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="px-6 pb-6 space-y-4"
            >
              {/* Divider */}
              <div className="border-t border-[rgba(var(--mg-primary),0.2)]"></div>

              {/* Operation Details */}
              <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
                <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
                  Operation Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-[rgba(var(--mg-text),0.6)]">Type:</span>
                    <span className="ml-2 text-[rgba(var(--mg-text),0.9)]">{template.operationType}</span>
                  </div>
                  <div>
                    <span className="text-[rgba(var(--mg-text),0.6)]">Activities:</span>
                    <span className="ml-2 text-[rgba(var(--mg-text),0.9)]">
                      {template.primaryActivity} (Primary)
                      {template.secondaryActivity && `, ${template.secondaryActivity} (Secondary)`}
                      {template.tertiaryActivity && `, ${template.tertiaryActivity} (Tertiary)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ship Roster */}
              {template.shipRoster.length > 0 && (
                <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
                  <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
                    Ship Roster
                  </h4>
                  <ul className="space-y-2">
                    {template.shipRoster.map((ship, index) => (
                      <li key={index} className="text-sm text-[rgba(var(--mg-text),0.9)] flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.6)] mr-3"></span>
                        {ship.size} {ship.category} x{ship.count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Personnel Roster */}
              {template.personnelRoster.length > 0 && (
                <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
                  <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
                    Personnel Roster
                  </h4>
                  <ul className="space-y-2">
                    {template.personnelRoster.map((person, index) => (
                      <li key={index} className="text-sm text-[rgba(var(--mg-text),0.9)] flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.6)] mr-3"></span>
                        {person.profession} x{person.count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Equipment */}
              {template.requiredEquipment && (
                <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
                  <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
                    Required Equipment
                  </h4>
                  <p className="text-sm text-[rgba(var(--mg-text),0.9)] whitespace-pre-wrap">
                    {template.requiredEquipment}
                  </p>
                </div>
              )}

              {/* Use Template Button */}
              <div className="pt-2">
                <button
                  onClick={onUseForMission}
                  className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-[rgba(var(--mg-success),0.8)] to-[rgba(var(--mg-success),0.6)] hover:from-[rgba(var(--mg-success),0.9)] hover:to-[rgba(var(--mg-success),0.7)] text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-[0_0_30px_rgba(var(--mg-success),0.5)] relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>USE THIS TEMPLATE FOR NEW MISSION</span>
                    <ArrowRightIcon />
                  </span>
                  {/* Scanline effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan"></div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </HolographicBorder>
  );
};

export default TemplateStrip;
```

### Step 2: Add scanline animation to global CSS

Add to `src/app/globals.css` (or appropriate CSS file):

```css
@keyframes scan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.animate-scan {
  animation: scan 1s ease-in-out;
}
```

### Step 3: Verify component compiles

Run: `npm run type-check`

Expected: No TypeScript errors

### Step 4: Commit TemplateStrip component

```bash
git add src/components/dashboard/TemplateStrip.tsx src/app/globals.css
git commit -m "feat: add TemplateStrip expandable component for mission templates"
```

---

## Task 3: Refactor MissionTemplateCreator to Use TemplateStrip

**Files:**
- Modify: `src/components/dashboard/MissionTemplateCreator.tsx`

### Step 1: Update imports in MissionTemplateCreator

At the top of `src/components/dashboard/MissionTemplateCreator.tsx`, update imports:

```typescript
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import MissionTemplateForm from './MissionTemplateForm';
import TemplateStrip from './TemplateStrip';
import { MobiGlasButton, CornerAccents, DataStreamBackground } from '../ui/mobiglas';
import {
  MissionTemplate,
  MissionTemplateResponse,
  MissionTemplateShip,
  MissionTemplatePersonnel,
  MissionTemplateValidationErrors,
  ActivityType
} from '@/types/MissionTemplate';
```

### Step 2: Add expandedTemplateId state

In the state management section (around line 69), add:

```typescript
const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
```

### Step 3: Add router for navigation

After the state declarations, add:

```typescript
const router = useRouter();
```

### Step 4: Add toggle expand handler

After the `scrollToTop` function (around line 96), add:

```typescript
// Handle template expansion (only one at a time)
const handleToggleExpand = (templateId: string) => {
  setExpandedTemplateId(prev => prev === templateId ? null : templateId);
};

// Handle use template for mission
const handleUseForMission = (templateId: string) => {
  router.push(`/dashboard/operations/missions?template=${templateId}`);
};
```

### Step 5: Collapse expanded template when changing modes

Update the `handleCancel` function (around line 362):

```typescript
const handleCancel = () => {
  resetForm();
  setExpandedTemplateId(null); // Collapse any expanded template
  setViewMode('list');
};
```

And update where `setViewMode('list')` is called after save (around line 295):

```typescript
if (response.ok) {
  setNotification({ type: 'success', message });
  await loadTemplates();
  resetForm();
  setExpandedTemplateId(null); // Collapse any expanded template
  setViewMode('list');
}
```

### Step 6: Replace the list view render (Part 1 - Header)

Find the list view render section (starts around line 384 `if (viewMode === 'list') {`).

Replace the entire return statement with:

```typescript
return (
  <div ref={containerRef} className="relative min-h-screen">
    {/* Background Effects */}
    <DataStreamBackground opacity="low" speed="medium" />

    {/* Slim Header Bar - Sticky */}
    <div className="sticky top-0 z-20 backdrop-blur-lg bg-[rgba(var(--mg-panel-dark),0.85)] border-b border-[rgba(var(--mg-primary),0.2)]">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Title + Icon */}
          <div className="flex items-center space-x-3">
            <TemplateIcon />
            <h1 className="text-xl font-bold text-[rgba(var(--mg-primary),0.9)] uppercase tracking-wide">
              Mission Template Database
            </h1>
          </div>

          {/* Right: New Template Button */}
          <MobiGlasButton
            onClick={() => {
              setExpandedTemplateId(null);
              setViewMode('create');
            }}
            variant="primary"
            size="md"
            disabled={isLoading}
            leftIcon={<CreateIcon />}
            withScanline={true}
            withCorners={true}
            withGlow={true}
          >
            NEW TEMPLATE
          </MobiGlasButton>
        </div>
      </div>
    </div>

    {/* Template List Container */}
    <div className="container mx-auto px-6 py-8">
      {isLoading ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative inline-block">
            <div className="w-12 h-12 border-2 border-[rgba(var(--mg-primary),0.3)] border-t-[rgba(var(--mg-primary),1)] rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-12 h-12 border border-[rgba(var(--mg-primary),0.2)] rounded-full animate-pulse mx-auto"></div>
          </div>
          <div className="text-[rgba(var(--mg-text),0.6)] font-medium animate-pulse">
            Accessing template database...
          </div>
        </motion.div>
      ) : templates.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative max-w-md mx-auto p-12 border-2 border-dashed border-[rgba(var(--mg-primary),0.3)] rounded-lg bg-[rgba(var(--mg-panel-dark),0.3)]">
            <div className="circuit-bg absolute inset-0 rounded-lg pointer-events-none opacity-20"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 border-2 border-[rgba(var(--mg-primary),0.3)] rounded-lg flex items-center justify-center">
                <TemplateIcon />
              </div>
              <h3 className="text-lg font-semibold text-[rgba(var(--mg-text),0.9)] mb-2">
                NO MISSION TEMPLATES FOUND
              </h3>
              <p className="text-[rgba(var(--mg-text),0.6)] mb-6">
                Create your first template to standardize operations and improve mission efficiency
              </p>
              <MobiGlasButton
                onClick={() => setViewMode('create')}
                variant="primary"
                size="lg"
                leftIcon={<CreateIcon />}
                withScanline={true}
                withCorners={true}
                withGlow={true}
              >
                CREATE FIRST TEMPLATE
              </MobiGlasButton>
            </div>
            <CornerAccents variant="animated" color="primary" size="lg" />
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3 max-w-5xl mx-auto">
          {templates.map((template) => (
            <TemplateStrip
              key={template.id}
              template={template}
              isExpanded={expandedTemplateId === template.id}
              onToggleExpand={() => handleToggleExpand(template.id)}
              onEdit={() => handleEdit(template)}
              onDelete={() => setShowDeleteConfirm(template.id)}
              onUseForMission={() => handleUseForMission(template.id)}
            />
          ))}
        </div>
      )}
    </div>

    {/* Delete Confirmation Modal - Keep existing */}
    <AnimatePresence>
      {showDeleteConfirm && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[rgba(var(--mg-panel-dark),0.95)] border border-[rgba(var(--mg-danger),0.5)] rounded-lg p-6 max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-lg font-semibold text-[rgba(var(--mg-danger),0.9)] mb-4">
              Confirm Deletion
            </h3>
            <p className="text-[rgba(var(--mg-text),0.8)] mb-6">
              Are you sure you want to delete this mission template? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-[rgba(var(--mg-text),0.3)] rounded text-[rgba(var(--mg-text),0.8)] hover:bg-[rgba(var(--mg-text),0.1)]"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-[rgba(var(--mg-danger),0.8)] text-white rounded hover:bg-[rgba(var(--mg-danger),0.9)]"
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Notification - Keep existing */}
    <AnimatePresence>
      {notification && (
        <motion.div
          className="fixed top-20 right-6 z-[9999]"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ position: 'fixed', willChange: 'transform' }}
        >
          <div className={`relative px-6 py-4 rounded-lg border-2 backdrop-filter backdrop-blur-md ${
            notification.type === 'success'
              ? 'bg-[rgba(var(--mg-success),0.15)] border-[rgba(var(--mg-success),0.6)] text-[rgba(var(--mg-success),1)]'
              : 'bg-[rgba(var(--mg-danger),0.15)] border-[rgba(var(--mg-danger),0.6)] text-[rgba(var(--mg-danger),1)]'
          } shadow-[0_0_30px_rgba(var(--mg-${notification.type === 'success' ? 'success' : 'danger'}),0.3)]`}>
            <div className="relative z-10 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 animate-pulse ${
                notification.type === 'success' ? 'bg-[rgba(var(--mg-success),1)]' : 'bg-[rgba(var(--mg-danger),1)]'
              }`}></div>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
```

### Step 7: Remove old HoloWrapper component

Delete the `HoloWrapper` component definition (around lines 18-25) as it's no longer needed.

### Step 8: Verify the refactor compiles

Run: `npm run type-check`

Expected: No TypeScript errors

### Step 9: Commit the refactored MissionTemplateCreator

```bash
git add src/components/dashboard/MissionTemplateCreator.tsx
git commit -m "refactor: replace multi-panel layout with slim header and expandable template strips"
```

---

## Task 4: Test the UI in Development

**Files:**
- None (testing only)

### Step 1: Start development server

Run: `npm run dev`

Expected: Server starts on port 3000

### Step 2: Navigate to mission templates page

Navigate to: `http://localhost:3000/dashboard/mission-templates`

Expected: Page loads without errors

### Step 3: Test empty state

If you have templates, temporarily comment them out or test with empty data.

Expected:
- "NO MISSION TEMPLATES FOUND" message displays
- "CREATE FIRST TEMPLATE" button is visible and styled
- Background effects animate smoothly

### Step 4: Test template list with data

Ensure you have at least 2-3 templates.

Expected:
- Templates display as collapsed strips
- Header bar is sticky when scrolling
- "NEW TEMPLATE" button is visible in header
- No redundant create buttons

### Step 5: Test expand/collapse functionality

Click on a template strip header.

Expected:
- Template expands smoothly (300ms animation)
- Full details visible (activities, ships, personnel, equipment)
- "USE THIS TEMPLATE FOR NEW MISSION" button appears
- Border glows more intensely when expanded

Click the header again.

Expected:
- Template collapses back to 100px height
- Animation is smooth

### Step 6: Test single expansion constraint

Expand one template, then click another template.

Expected:
- First template collapses
- Second template expands
- Only one template expanded at a time
- Transitions are smooth

### Step 7: Test action buttons

Test Edit button:
Expected: Navigates to edit form view

Test Delete button:
Expected: Confirmation modal appears

Test "Use for Mission" button (in collapsed state):
Expected: Navigates to `/dashboard/operations/missions?template=[id]`

Test "USE THIS TEMPLATE FOR NEW MISSION" (in expanded state):
Expected: Same navigation behavior

### Step 8: Test create flow

Click "NEW TEMPLATE" in header.

Expected:
- Form view loads
- Any expanded template is collapsed
- Form functions normally

Save a template.

Expected:
- Returns to list view
- New template appears
- All templates are collapsed

### Step 9: Test responsive design

Resize browser to mobile width (< 768px).

Expected:
- Layout adjusts appropriately
- Action buttons remain accessible
- Expanded content is readable

### Step 10: Test keyboard navigation

Use Tab key to navigate.

Expected:
- Can tab to "NEW TEMPLATE" button
- Can tab to template strips
- Can tab to action buttons
- Enter key expands/collapses templates
- Focus indicators visible

### Step 11: Document any issues found

Create a list of any bugs or issues discovered.

Expected: List created (or "No issues found")

---

## Task 5: Accessibility Enhancements

**Files:**
- Modify: `src/components/dashboard/TemplateStrip.tsx`

### Step 1: Add aria-expanded to template strip header

In `TemplateStrip.tsx`, update the header div (around line 87):

```typescript
<div
  onClick={onToggleExpand}
  className="h-[100px] px-6 py-4 cursor-pointer hover:bg-[rgba(var(--mg-primary),0.05)] transition-colors relative"
  role="button"
  tabIndex={0}
  aria-expanded={isExpanded}
  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${template.name} details`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleExpand();
    }
  }}
>
```

### Step 2: Add focus styles

In the same div, update the className to include focus styles:

```typescript
className="h-[100px] px-6 py-4 cursor-pointer hover:bg-[rgba(var(--mg-primary),0.05)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--mg-primary),0.6)] focus:ring-offset-2 focus:ring-offset-[rgba(var(--mg-panel-dark),0.9)] transition-colors relative"
```

### Step 3: Add aria-label to action buttons stopPropagation

The aria-labels are already present (good!), but let's ensure the stopPropagation div also handles keyboard events:

Update the action buttons container (around line 118):

```typescript
<div className="flex space-x-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
```

### Step 4: Add reduced motion support

Add to `src/app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-scan,
  [class*="animate-"] {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Step 5: Test with screen reader

Use a screen reader (NVDA, JAWS, or VoiceOver) to test:

Expected:
- Template names announced
- Expand/collapse state announced
- Action buttons have clear labels
- Focus order is logical

### Step 6: Commit accessibility improvements

```bash
git add src/components/dashboard/TemplateStrip.tsx src/app/globals.css
git commit -m "feat: add keyboard navigation and screen reader support to template strips"
```

---

## Task 6: Performance Optimization

**Files:**
- Modify: `src/components/dashboard/TemplateStrip.tsx`
- Modify: `src/components/dashboard/MissionTemplateCreator.tsx`

### Step 1: Memoize TemplateStrip component

In `TemplateStrip.tsx`, wrap the component export with React.memo:

```typescript
export default React.memo(TemplateStrip);
```

### Step 2: Add memoization comparison function

Before the export, add a custom comparison function:

```typescript
const areEqual = (prevProps: TemplateStripProps, nextProps: TemplateStripProps) => {
  return (
    prevProps.template.id === nextProps.template.id &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.template.updatedAt === nextProps.template.updatedAt
  );
};

export default React.memo(TemplateStrip, areEqual);
```

### Step 3: Memoize handlers in MissionTemplateCreator

In `MissionTemplateCreator.tsx`, import useCallback:

```typescript
import React, { useState, useEffect, useRef, useCallback } from 'react';
```

### Step 4: Wrap toggle handler in useCallback

Update the `handleToggleExpand` function (around line 99):

```typescript
const handleToggleExpand = useCallback((templateId: string) => {
  setExpandedTemplateId(prev => prev === templateId ? null : templateId);
}, []);
```

### Step 5: Wrap use for mission handler in useCallback

Update the `handleUseForMission` function:

```typescript
const handleUseForMission = useCallback((templateId: string) => {
  router.push(`/dashboard/operations/missions?template=${templateId}`);
}, [router]);
```

### Step 6: Test performance with React DevTools Profiler

Open React DevTools, go to Profiler tab, record an interaction.

Expected:
- TemplateStrip components only re-render when their props change
- Expanding one template doesn't re-render other templates unnecessarily

### Step 7: Commit performance optimizations

```bash
git add src/components/dashboard/TemplateStrip.tsx src/components/dashboard/MissionTemplateCreator.tsx
git commit -m "perf: memoize TemplateStrip and handlers to prevent unnecessary re-renders"
```

---

## Task 7: Error Handling & Edge Cases

**Files:**
- Modify: `src/components/dashboard/TemplateStrip.tsx`

### Step 1: Handle templates with no ship roster

In `TemplateStrip.tsx`, update the Ship Roster section (around line 185):

```typescript
{/* Ship Roster */}
{template.shipRoster.length > 0 ? (
  <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
    <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
      Ship Roster
    </h4>
    <ul className="space-y-2">
      {template.shipRoster.map((ship, index) => (
        <li key={index} className="text-sm text-[rgba(var(--mg-text),0.9)] flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.6)] mr-3"></span>
          {ship.size} {ship.category} x{ship.count}
        </li>
      ))}
    </ul>
  </div>
) : (
  <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
    <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
      Ship Roster
    </h4>
    <p className="text-sm italic text-[rgba(var(--mg-text),0.6)]">
      No ships assigned - Ground operations only
    </p>
  </div>
)}
```

### Step 2: Handle templates with no personnel roster

Similarly, update Personnel Roster section:

```typescript
{/* Personnel Roster */}
{template.personnelRoster.length > 0 ? (
  <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
    <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
      Personnel Roster
    </h4>
    <ul className="space-y-2">
      {template.personnelRoster.map((person, index) => (
        <li key={index} className="text-sm text-[rgba(var(--mg-text),0.9)] flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.6)] mr-3"></span>
          {person.profession} x{person.count}
        </li>
      ))}
    </ul>
  </div>
) : (
  <div className="p-4 rounded border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.4)]">
    <h4 className="text-sm font-semibold text-[rgba(var(--mg-primary),0.9)] mb-3 uppercase tracking-wide">
      Personnel Roster
    </h4>
    <p className="text-sm italic text-[rgba(var(--mg-text),0.6)]">
      No personnel assigned
    </p>
  </div>
)}
```

### Step 3: Handle long template names

Update the template name display (around line 96) to handle truncation:

```typescript
<h3 className="text-lg font-semibold text-[rgba(var(--mg-primary),0.9)] mb-1 truncate max-w-md" title={template.name}>
  {template.name}
</h3>
```

### Step 4: Test edge cases

Test with:
- Template with no ships
- Template with no personnel
- Template with very long name (> 50 chars)
- Template with no equipment
- Template with only secondary activity

Expected: All cases display gracefully without errors

### Step 5: Commit edge case handling

```bash
git add src/components/dashboard/TemplateStrip.tsx
git commit -m "fix: handle edge cases for empty rosters and long names in template strips"
```

---

## Task 8: Documentation & Final Polish

**Files:**
- Create: `docs/mission-template-ui.md`
- Modify: `README.md` (if necessary)

### Step 1: Create component documentation

Create `docs/mission-template-ui.md`:

```markdown
# Mission Template UI - Technical Documentation

## Overview

The Mission Template Database provides an immersive sci-fi interface for managing reusable mission templates. The UI features expandable template strips with holographic effects, eliminating visual clutter while maintaining the MobiGlas aesthetic.

## Architecture

### Component Hierarchy

```
MissionTemplateCreator (Main Container)
├── DataStreamBackground (Animated background)
├── Header Bar (Sticky)
│   └── NEW TEMPLATE button
├── Template List
│   └── TemplateStrip (Expandable) × N
│       ├── HolographicBorder (Wrapper)
│       ├── Header (Always visible, clickable)
│       └── Expanded Content (Conditional)
└── Modals (Delete confirmation, Notifications)
```

### Key Components

#### TemplateStrip
- **Purpose**: Displays individual mission template as expandable strip
- **States**: Collapsed (100px) | Expanded (auto height)
- **Interactions**: Click to expand/collapse, action buttons, keyboard navigation
- **File**: `src/components/dashboard/TemplateStrip.tsx`

#### DataStreamBackground
- **Purpose**: Animated vertical data streams for sci-fi atmosphere
- **Customization**: Opacity (low/medium/high), Speed (slow/medium/fast)
- **File**: `src/components/ui/mobiglas/DataStreamBackground.tsx`

#### HolographicBorder
- **Purpose**: Animated glowing border wrapper
- **States**: Active (expanded) | Inactive (collapsed)
- **File**: `src/components/ui/mobiglas/HolographicBorder.tsx`

## User Flows

### Creating a Template
1. Click "NEW TEMPLATE" in header
2. Form view loads
3. Fill in template details
4. Save → Returns to list with new template

### Viewing Template Details
1. Click template strip header
2. Strip expands with smooth animation (300ms)
3. Full details visible inline
4. Click header again to collapse

### Using Template for Mission
1. Expand template (optional)
2. Click "USE THIS TEMPLATE" button
3. Navigates to mission planning with template pre-filled
4. URL: `/dashboard/operations/missions?template=[id]`

### Editing Template
1. Click edit icon on template
2. Form loads with pre-filled data
3. Make changes
4. Save → Returns to updated list

### Deleting Template
1. Click delete icon
2. Confirmation modal appears
3. Confirm → Template removed with animation

## State Management

### Key State Variables

```typescript
viewMode: 'list' | 'create' | 'edit'
expandedTemplateId: string | null
templates: MissionTemplateResponse[]
formData: Partial<MissionTemplate>
notification: { type: 'success' | 'error', message: string } | null
```

### Expansion Logic

Only ONE template can be expanded at a time:
```typescript
const handleToggleExpand = (templateId: string) => {
  setExpandedTemplateId(prev => prev === templateId ? null : templateId);
};
```

## Styling & Theming

### MobiGlas Variables

Uses existing CSS variables:
- `--mg-primary`: Cyan/blue accent color
- `--mg-panel-dark`: Dark panel background
- `--mg-text`: White/gray text
- `--mg-success`: Green for "Use Template" button
- `--mg-danger`: Red for delete actions

### Animations

- Expand/collapse: 300ms ease-in-out
- Opacity fade: 200ms with 100ms delay
- Data streams: 5-8s linear infinite
- Border glow: 2s ease-in-out infinite

## Accessibility

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Expand/collapse template strips
- **Escape**: Close modals

### Screen Reader Support

- Template names announced
- Expand/collapse state announced (`aria-expanded`)
- Action buttons have descriptive labels
- Focus indicators visible

### Reduced Motion

Respects `prefers-reduced-motion` media query:
- Animations reduced to 0.01ms
- Transitions minimized

## Performance

### Optimizations

1. **React.memo**: TemplateStrip only re-renders when props change
2. **useCallback**: Handlers memoized to prevent re-renders
3. **Conditional rendering**: Only expanded content renders when needed
4. **CSS transforms**: GPU-accelerated animations

### Performance Targets

- 60 FPS animations
- < 100ms interaction response time
- < 2s initial page load

## Testing

### Manual Test Checklist

- [ ] Empty state displays correctly
- [ ] Templates load and display
- [ ] Expand/collapse animations smooth
- [ ] Only one template expands at a time
- [ ] Edit button loads form
- [ ] Delete shows confirmation
- [ ] "Use Template" navigates correctly
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Responsive on mobile

### Edge Cases

- Template with no ships → Shows "Ground operations only"
- Template with no personnel → Shows "No personnel assigned"
- Very long name → Truncates with ellipsis
- No equipment → Section omitted

## Future Enhancements

### Phase 2 Features

1. **Search & Filter**: Add search bar, filter by type/activity
2. **Duplicate Template**: Clone existing templates
3. **Sorting**: Sort by name, date, type
4. **Bulk Actions**: Select multiple, delete multiple
5. **Tags**: Add custom tags to templates
6. **Usage Stats**: Track template usage frequency
7. **Export/Import**: Share templates via JSON

### Visual Enhancements

1. **Particle Effects**: Add particles on hover
2. **Glitch Transitions**: Holographic glitch effects
3. **3D Depth**: Parallax scrolling background
4. **Sound Effects**: Optional sci-fi UI sounds

## Troubleshooting

### Common Issues

**Templates not expanding:**
- Check `expandedTemplateId` state
- Verify `onToggleExpand` handler connected
- Check AnimatePresence wrapping

**Animations janky:**
- Enable GPU acceleration (CSS transforms)
- Reduce animation complexity
- Check for unnecessary re-renders

**Accessibility issues:**
- Verify ARIA attributes present
- Test focus indicators
- Check keyboard event handlers

## Related Files

- `src/app/dashboard/mission-templates/page.tsx` - Server component wrapper
- `src/components/dashboard/MissionTemplateCreator.tsx` - Main component
- `src/components/dashboard/TemplateStrip.tsx` - Expandable template card
- `src/components/dashboard/MissionTemplateForm.tsx` - Create/edit form
- `src/types/MissionTemplate.ts` - TypeScript interfaces
- `src/app/globals.css` - Global styles and animations
```

### Step 2: Update README if needed

If the main README has a features section, add a line about the mission template UI.

### Step 3: Add JSDoc comments to key functions

In `MissionTemplateCreator.tsx`, add doc comments to main functions:

```typescript
/**
 * Handles toggling template expansion.
 * Only one template can be expanded at a time.
 */
const handleToggleExpand = useCallback((templateId: string) => {
  setExpandedTemplateId(prev => prev === templateId ? null : templateId);
}, []);

/**
 * Navigates to mission planning page with template pre-filled.
 */
const handleUseForMission = useCallback((templateId: string) => {
  router.push(`/dashboard/operations/missions?template=${templateId}`);
}, [router]);
```

### Step 4: Final visual polish check

Review the UI for any remaining polish items:
- [ ] All colors consistent with theme
- [ ] All animations smooth
- [ ] All text readable
- [ ] All buttons have hover states
- [ ] All icons properly sized
- [ ] Corner accents positioned correctly

### Step 5: Commit documentation

```bash
git add docs/mission-template-ui.md src/components/dashboard/MissionTemplateCreator.tsx
git commit -m "docs: add comprehensive documentation for mission template UI"
```

---

## Task 9: Final Testing & Verification

**Files:**
- None (testing only)

### Step 1: Full UI walkthrough

Perform complete user journey:
1. Navigate to page
2. View empty state (if applicable)
3. Create new template
4. Expand template to view details
5. Edit template
6. Use template for mission
7. Delete template

Expected: All flows work without errors

### Step 2: Cross-browser testing

Test in:
- Chrome
- Firefox
- Safari (if available)
- Edge

Expected: Consistent behavior across browsers

### Step 3: Responsive testing

Test at breakpoints:
- Mobile (375px)
- Tablet (768px)
- Desktop (1920px)

Expected: UI scales appropriately

### Step 4: Performance profiling

Use Chrome DevTools Performance tab:
1. Record page load
2. Record expand/collapse interaction
3. Record create template flow

Expected:
- No long tasks (> 50ms)
- Smooth 60 FPS animations
- No memory leaks

### Step 5: Accessibility audit

Run Lighthouse accessibility audit:

Expected: Score > 90

### Step 6: Console error check

Open browser console, use all features:

Expected: No errors or warnings

### Step 7: Create verification checklist

Document all test results:

```markdown
## Verification Checklist - Mission Template UI Revamp

### Functional Tests
- [x] Single "NEW TEMPLATE" button in header
- [x] No redundant create buttons
- [x] Templates display as expandable strips
- [x] Only one template expands at a time
- [x] Expand/collapse animations smooth (300ms)
- [x] Edit button loads form correctly
- [x] Delete shows confirmation modal
- [x] "Use Template" navigates with template ID
- [x] Create flow works end-to-end
- [x] Empty state displays correctly

### Visual Tests
- [x] Holographic border effects visible
- [x] Data stream background animates
- [x] Corner accents render correctly
- [x] Colors consistent with MobiGlas theme
- [x] Hover states work on all buttons
- [x] Loading spinners display correctly

### Accessibility Tests
- [x] Keyboard navigation works (Tab, Enter, Space)
- [x] Screen reader announces template names
- [x] Expand/collapse state announced (aria-expanded)
- [x] Focus indicators visible
- [x] All buttons have aria-labels

### Performance Tests
- [x] Page loads in < 2 seconds
- [x] Animations run at 60 FPS
- [x] No unnecessary re-renders
- [x] Memoization working correctly

### Browser Tests
- [x] Chrome
- [x] Firefox
- [ ] Safari (optional)
- [x] Edge

### Responsive Tests
- [x] Mobile (375px)
- [x] Tablet (768px)
- [x] Desktop (1920px)

### Edge Cases
- [x] Template with no ships
- [x] Template with no personnel
- [x] Template with long name (> 50 chars)
- [x] Template with no equipment

**Result:** PASS / FAIL
**Notes:** [Any issues or observations]
```

### Step 8: Document completion

Update plan status at top of this file:

```markdown
**Status:** COMPLETED
**Date:** [Current date]
**Tested by:** [Your name or "Automated"]
```

---

## Verification & Deployment

### Final Verification Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build production bundle
npm run build

# Start production server (test build)
npm start
```

### Expected Results

- ✅ No TypeScript errors
- ✅ No ESLint errors (or only minor warnings)
- ✅ Production build succeeds
- ✅ Production server runs without errors

### Deployment Checklist

- [ ] All commits pushed to repository
- [ ] Feature branch merged to main (if using branches)
- [ ] Production build tested locally
- [ ] No console errors in production mode
- [ ] Documentation updated
- [ ] Changelog updated (if applicable)

---

## Summary

This implementation plan revamped the Mission Template Database UI by:

1. **Created utility components** for holographic effects (DataStreamBackground, HolographicBorder)
2. **Built TemplateStrip component** with expand/collapse functionality
3. **Refactored MissionTemplateCreator** to use slim header with single button
4. **Eliminated redundancy** by removing 3 extra "Create Template" buttons
5. **Enhanced accessibility** with keyboard navigation and ARIA attributes
6. **Optimized performance** with React.memo and useCallback
7. **Handled edge cases** for empty rosters and long names
8. **Added comprehensive documentation** for future maintainers

**Key Achievements:**
- ✅ Single prominent "NEW TEMPLATE" button
- ✅ Immersive sci-fi expandable strip interface
- ✅ Smooth animations (300ms expand/collapse)
- ✅ Only one template expands at a time
- ✅ Accessible via keyboard and screen readers
- ✅ Performant with memoization
- ✅ Responsive design for all screen sizes

**Files Modified:**
- `src/components/dashboard/MissionTemplateCreator.tsx` (refactored)
- `src/app/globals.css` (added animations)

**Files Created:**
- `src/components/ui/mobiglas/DataStreamBackground.tsx`
- `src/components/ui/mobiglas/HolographicBorder.tsx`
- `src/components/dashboard/TemplateStrip.tsx`
- `docs/mission-template-ui.md`
- `docs/plans/2025-01-17-mission-template-ui-revamp.md`

**Next Steps:**
- Monitor user feedback
- Consider Phase 2 enhancements (search, filter, sorting)
- Track performance metrics in production
