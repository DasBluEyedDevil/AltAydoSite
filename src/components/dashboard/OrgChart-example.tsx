// Example usage of the OrgChart component
// This file demonstrates how to use the new customizable OrgChart component

import React from 'react';
import OrgChart, { ChartNodeData } from './OrgChart';

// Example: Simple company structure
const simpleCompanyData: ChartNodeData = {
  id: 'ceo',
  level: 'executive',
  front: { title: 'CEO' },
  back: { loreName: 'Big Boss', handle: 'CEO_Handle' },
  children: [
    {
      id: 'cto',
      level: 'board',
      front: { title: 'CTO' },
      back: { loreName: 'Tech Leader', handle: 'CTO_Handle' },
      children: [
        {
          id: 'dev-manager',
          level: 'manager',
          front: { title: 'Dev Manager' },
          back: { loreName: 'Code Wrangler', handle: 'DevMgr' },
          children: [
            {
              id: 'senior-dev',
              level: 'staff',
              front: { title: 'Senior Developer' },
              back: { loreName: 'Code Ninja', handle: 'SeniorDev' },
              children: []
            },
            {
              id: 'junior-dev',
              level: 'staff',
              front: { title: 'Junior Developer' },
              back: { loreName: 'Code Apprentice', handle: 'JuniorDev' },
              children: []
            }
          ]
        }
      ]
    },
    {
      id: 'coo',
      level: 'board',
      front: { title: 'COO' },
      back: { loreName: 'Operations Chief', handle: 'COO_Handle' },
      children: [
        {
          id: 'ops-manager',
          level: 'manager',
          front: { title: 'Operations Manager' },
          back: { loreName: 'Process Master', handle: 'OpsMgr' },
          children: [
            {
              id: 'ops-specialist',
              level: 'staff',
              front: { title: 'Operations Specialist' },
              back: { loreName: 'Process Expert', handle: 'OpsSpec' },
              children: []
            }
          ]
        }
      ]
    }
  ]
};

// Example: Military-style structure
const militaryData: ChartNodeData = {
  id: 'general',
  level: 'executive',
  front: { title: 'General' },
  back: { loreName: 'Supreme Commander', handle: 'General' },
  children: [
    {
      id: 'colonel',
      level: 'director',
      front: { title: 'Colonel' },
      back: { loreName: 'Field Commander', handle: 'Colonel' },
      children: [
        {
          id: 'major',
          level: 'manager',
          front: { title: 'Major' },
          back: { loreName: 'Battalion Leader', handle: 'Major' },
          children: [
            {
              id: 'captain',
              level: 'staff',
              front: { title: 'Captain' },
              back: { loreName: 'Company Leader', handle: 'Captain' },
              children: []
            },
            {
              id: 'lieutenant',
              level: 'staff',
              front: { title: 'Lieutenant' },
              back: { loreName: 'Platoon Leader', handle: 'Lieutenant' },
              children: []
            }
          ]
        }
      ]
    }
  ]
};

// Example component showing different usage patterns
export const OrgChartExamples: React.FC = () => {
  return (
    <div className="space-y-16">
      <div>
        <h2 className="mg-title text-2xl mb-6">Simple Company Structure</h2>
        <OrgChart tree={simpleCompanyData} />
      </div>
      
      <div>
        <h2 className="mg-title text-2xl mb-6">Military Command Structure</h2>
        <OrgChart tree={militaryData} />
      </div>
    </div>
  );
};

// How to create your own org chart data:
/*
const myOrgData: ChartNodeData = {
  id: 'unique-root-id',           // Must be unique across the entire tree
  level: 'executive',             // 'executive' | 'board' | 'director' | 'manager' | 'staff'
  front: { 
    title: 'Root Position Title'  // What shows on the front of the card
  },
  back: { 
    loreName: 'Cool Nickname',    // Optional: Shows on back of card
    handle: 'Username'            // Optional: Shows on back of card
  },
  children: [                     // Array of child nodes (same structure)
    {
      id: 'child-1',
      level: 'board',
      front: { title: 'Child 1' },
      back: { loreName: 'Child 1 Nickname' },
      children: []                // Leaf nodes have empty children array
    },
    {
      id: 'child-2', 
      level: 'director',
      front: { title: 'Child 2' },
      back: {},                   // Back info is optional
      children: [
        // More nested children...
      ]
    }
  ]
};
*/

export default OrgChart;
