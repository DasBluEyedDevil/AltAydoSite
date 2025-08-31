# OrgChart Component Documentation

## Overview

The `OrgChart` component is a highly flexible and feature-rich React component for rendering hierarchical organizational charts. Built with TypeScript, Framer Motion, and Tailwind CSS, it supports dynamic layouts, multi-parent connections, custom positioning, and sophisticated SVG-based connector routing.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Basic Usage](#basic-usage)
3. [Data Structure](#data-structure)
4. [Component Props](#component-props)
5. [Advanced Features](#advanced-features)
6. [Styling & Theming](#styling--theming)
7. [Examples](#examples)
8. [Implementation Details](#implementation-details)
9. [Troubleshooting](#troubleshooting)

## Installation & Setup

### Prerequisites

- React 18+
- TypeScript
- Framer Motion (`framer-motion`)
- Tailwind CSS

### Basic Import

```typescript
import OrgChart, { ChartNodeData } from '@/components/dashboard/OrgChart';
```

## Basic Usage

```typescript
const simpleHierarchy: ChartNodeData = {
  id: 'ceo',
  level: 'executive',
  front: { title: 'Chief Executive Officer' },
  back: { loreName: 'Supreme Leader', handle: 'CEO_Handle' },
  children: [
    {
      id: 'cto',
      level: 'board',
      front: { title: 'Chief Technology Officer' },
      back: { loreName: 'Tech Wizard', handle: 'CTO_Handle' },
      children: []
    }
  ]
};

function MyOrgChart() {
  return (
    <OrgChart 
      tree={simpleHierarchy}
      className="w-full"
    />
  );
}
```

## Data Structure

### ChartNodeData Interface

```typescript
export interface ChartNodeData {
  id: string;                    // Unique identifier (required for React keys and SVG routing)
  level: 'executive' | 'board' | 'director' | 'manager' | 'staff';
  front: {
    title: string;               // Main title shown on card front
  };
  back: {
    loreName?: string;           // Optional secondary name/title
    handle?: string;             // Optional handle/username
  };
  children: ChartNodeData[];     // Array of child nodes
}
```

### Level-Based Color Coding

The component automatically applies color coding based on container headers:

- **Executive** → Gold borders (`border-yellow-400`)
- **Board** → Orange borders (`border-orange-400`)
- **Management** → Green borders (`border-green-400`)
- **Employee** → Bright Purple borders (`border-purple-400`)
- **Intern** → Standard Cyan borders (`border-cyan-400`)

## Component Props

### OrgChartProps Interface

```typescript
interface OrgChartProps {
  tree: ChartNodeData;                    // Root node of the hierarchy (required)
  className?: string;                     // Additional CSS classes
  headers?: {                             // Static header labels for levels
    ceo?: string;
    executives?: string;
    directors?: string;
    managers?: string;
    [key: string]: string | undefined;
  };
  extraConnections?: Array<{              // Multi-parent connections
    from: string; 
    to: string;
  }>;
  headerResolver?: (levelIndex: number) => string;  // Dynamic header generation
  peerWithParentIds?: string[];           // Nodes to render on parent's row
  nodeOffsets?: Record<string, {          // Custom positioning offsets
    x?: number; 
    y?: number;
  }>;
  isolateRowIds?: string[];               // Nodes to place on isolated rows
  anchorXToId?: Record<string, string>;   // Horizontal alignment anchoring
}
```

### Prop Details

#### `tree` (required)
The root node containing the entire organizational hierarchy.

#### `className`
Additional CSS classes applied to the component wrapper.

#### `headers`
Static header labels for organizational levels:
```typescript
headers={{
  ceo: 'Executive',
  executives: 'Board Members',
  directors: 'Management',
  managers: 'Staff'
}}
```

#### `extraConnections`
Define multi-parent relationships:
```typescript
extraConnections={[
  { from: 'serviceAgent', to: 'associate' },  // Service Agent also reports to Associate
  { from: 'analyst', to: 'manager2' }         // Analyst has dual reporting
]}
```

#### `headerResolver`
Dynamic header generation based on level index:
```typescript
headerResolver={(levelIndex: number) => {
  const labels = ['Executive', 'Upper Management', 'Lower Management', 'Employee', 'Intern'];
  return labels[levelIndex] || `Level ${levelIndex + 1}`;
}}
```

#### `peerWithParentIds`
Render specific nodes on the same row as their parent:
```typescript
peerWithParentIds={['assistantDirector']}  // Assistant Director appears next to Director
```

#### `nodeOffsets`
Fine-tune individual node positions:
```typescript
nodeOffsets={{
  assistantDirector: { x: -120, y: 0 },    // Move 120px left
  manager1: { x: 50, y: -10 }              // Move 50px right, 10px up
}}
```

#### `isolateRowIds`
Force nodes to occupy their own row within a container:
```typescript
isolateRowIds={['assistantDirector']}     // Assistant Director gets own row
```

#### `anchorXToId`
Horizontally align nodes to other nodes' center X:
```typescript
anchorXToId={{
  assistantDirector: 'gunneryManager'      // Align Assistant Director with Gunnery Manager
}}
```

## Advanced Features

### 1. Dynamic Container Grouping

The component automatically groups consecutive levels with the same header label into a single container:

```typescript
// This creates two containers: "Upper Management" and "Lower Management"
headerResolver={(levelIndex) => {
  if (levelIndex <= 1) return 'Upper Management';
  return 'Lower Management';
}}
```

### 2. Complex Branching Logic

The SVG connector system supports sophisticated routing:

- **Direct connections** for single children or peer relationships
- **Branching patterns** for multiple children with trunk-and-distribution layout
- **Container-aware bending** at halfway points between organizational containers
- **Isolated row handling** for special positions like Assistant Directors

### 3. Multi-Parent Connections

Support for matrix organizations and dual reporting:

```typescript
// Service Agent reports to both Loadmaster (hierarchically) and Associate (functionally)
extraConnections={[
  { from: 'serviceAgent', to: 'associate' }
]}
```

### 4. Responsive Layout

- **Single items**: Centered
- **2-4 items**: Horizontal flex layout
- **5+ items**: Responsive grid (2-5 columns based on screen size)

## Styling & Theming

### CSS Custom Properties

The component uses CSS custom properties for theming:
```css
:root {
  --mg-primary: 0, 215, 255;      /* Primary cyan color */
  --mg-background: 8, 15, 25;     /* Background color */
  --mg-panel-dark: 12, 20, 32;    /* Panel background */
  --mg-text: 255, 255, 255;       /* Text color */
}
```

### Level-Specific Styling

Each organizational level has distinct visual styling:

```typescript
// Executive level example
{
  border: 'border-yellow-400/60',
  borderColor: 'bg-yellow-400',
  glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
  accent: 'bg-yellow-400/10'
}
```

### PersonCard Features

- **3D flip animation** on click
- **Hover effects** with scaling and glow
- **Corner decorations** with level-appropriate colors
- **Holographic scan lines** for sci-fi aesthetic
- **Level indicators** with glow effects

## Examples

### Example 1: Basic Corporate Structure

```typescript
const corporateHierarchy: ChartNodeData = {
  id: 'ceo',
  level: 'executive',
  front: { title: 'Chief Executive Officer' },
  back: { loreName: 'Supreme Commander', handle: 'CEO' },
  children: [
    {
      id: 'cto',
      level: 'board',
      front: { title: 'Chief Technology Officer' },
      back: { loreName: 'Tech Lead', handle: 'CTO' },
      children: []
    }
  ]
};

<OrgChart tree={corporateHierarchy} />
```

### Example 2: Multi-Level with Custom Headers

```typescript
const complexHierarchy: ChartNodeData = {
  // ... hierarchy data
};

<OrgChart 
  tree={complexHierarchy}
  headerResolver={(levelIndex) => {
    const headers = ['Executive', 'Upper Management', 'Lower Management', 'Employee', 'Intern'];
    return headers[levelIndex] || `Level ${levelIndex + 1}`;
  }}
/>
```

### Example 3: Advanced Positioning (Assistant Director Example)

```typescript
<OrgChart 
  tree={midnightSecurityHierarchy}
  headerResolver={getMidnightHeaderResolver()}
  isolateRowIds={['assistantDirector']}
  nodeOffsets={{ assistantDirector: { x: -120, y: 0 } }}
  anchorXToId={{ assistantDirector: 'gunneryManager' }}
/>
```

### Example 4: Multi-Parent Connections

```typescript
<OrgChart 
  tree={aydoExpressHierarchy}
  extraConnections={[
    { from: 'serviceAgent', to: 'associate' }
  ]}
/>
```

## Implementation Details

### SVG Connector Routing

The connector system implements sophisticated routing logic:

1. **Position Detection**: Uses `getBoundingClientRect()` to get precise element positions
2. **Container Awareness**: Detects organizational containers and bends lines between them
3. **Branch Calculation**: Dynamically calculates branch points based on child distribution
4. **Collision Avoidance**: Routes lines around tiles and through appropriate midpoints

### Performance Optimizations

- **useCallback** for expensive calculations
- **ResizeObserver** for efficient layout updates
- **Debounced recalculation** with settle delays
- **Selective re-rendering** based on dependency changes

### Responsive Handling

- **Dynamic grid layouts** based on item count
- **Flexible container sizing** with min-height constraints
- **Mobile-optimized** card sizing and spacing
- **Scroll-aware** connector recalculation

## Troubleshooting

### Common Issues

#### 1. Connectors Not Appearing
- Ensure `tree` prop contains valid `ChartNodeData`
- Check that node IDs are unique
- Verify container has proper dimensions

#### 2. Positioning Issues
- Use browser dev tools to inspect element positions
- Check `nodeOffsets` and `anchorXToId` values
- Ensure `isolateRowIds` contains correct node IDs

#### 3. Performance Problems
- Reduce complexity of `headerResolver` function
- Minimize unnecessary re-renders
- Use `React.memo` for wrapper components if needed

#### 4. Layout Breaking
- Verify Tailwind CSS classes are available
- Check container constraints and responsive breakpoints
- Ensure proper CSS custom property definitions

### Debug Helpers

```typescript
// Add debug logging to see what's happening
const debugHeaderResolver = (levelIndex: number) => {
  const result = normalHeaderResolver(levelIndex);
  console.log(`Level ${levelIndex} -> ${result}`);
  return result;
};

// Log connector calculations
useEffect(() => {
  console.log('Current paths:', paths);
}, [paths]);
```

## Advanced Customization

### Custom PersonCard Styling

Override the default styling by modifying the `getLevelStyling` function:

```typescript
const getLevelStyling = (level: string) => {
  switch (level) {
    case 'custom-level':
      return {
        border: 'border-purple-500/60',
        borderColor: 'bg-purple-500',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
        accent: 'bg-purple-500/10'
      };
    // ... other cases
  }
};
```

### Extending Data Structure

Add custom fields to `ChartNodeData`:

```typescript
interface ExtendedChartNodeData extends ChartNodeData {
  department?: string;
  employeeCount?: number;
  budget?: number;
}
```

### Custom Animation

Modify Framer Motion animations:

```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  {/* content */}
</motion.div>
```

## API Reference

### Exported Types

```typescript
export interface ChartNodeData {
  id: string;
  level: 'executive' | 'board' | 'director' | 'manager' | 'staff';
  front: { title: string };
  back: { loreName?: string; handle?: string };
  children: ChartNodeData[];
}

export default OrgChart;
```

### CSS Classes Used

- `mg-panel`: Main panel styling
- `mg-title`: Title text styling
- `mg-subtitle`: Subtitle text styling
- `mg-text`: Body text styling
- `mg-grid-bg`: Background grid pattern
- `mg-dark`: Dark background color

This documentation provides a comprehensive guide for developers and AI agents to understand, implement, and extend the OrgChart component effectively.
