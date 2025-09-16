'use client';

import React, { useState } from 'react';
import SubsidiariesTab from './SubsidiariesTab';
import OperationsTab from './OperationsTab';
import { MobiGlasPanel, MobiGlasButton } from '@/components/ui/mobiglas';

export default function AboutTabs() {
  const [activeTab, setActiveTab] = useState('subsidiaries');

  return (
    <section className="py-16 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <MobiGlasPanel
          variant="dark"
          withHologram
          cornerAccents
          padding="lg"
        >
            {/* Tab navigation */}
            <div className="flex flex-wrap border-b border-[rgba(var(--mg-primary),0.3)] mb-8 gap-2">
              <MobiGlasButton
                onClick={() => setActiveTab('subsidiaries')}
                variant={activeTab === 'subsidiaries' ? 'primary' : 'ghost'}
                size="md"
              >
                SUBSIDIARIES
              </MobiGlasButton>
              <MobiGlasButton
                onClick={() => setActiveTab('operations')}
                variant={activeTab === 'operations' ? 'primary' : 'ghost'}
                size="md"
              >
                OPERATIONS
              </MobiGlasButton>
            </div>

            {/* Tab content */}
            <div className="min-h-[400px]">
              {activeTab === 'subsidiaries' && <SubsidiariesTab />}
              {activeTab === 'operations' && <OperationsTab />}
            </div>
        </MobiGlasPanel>
      </div>
    </section>
  );
}