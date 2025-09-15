'use client';

import React, { useState } from 'react';
import SubsidiariesTab from './SubsidiariesTab';
import OperationsTab from './OperationsTab';

export default function AboutTabs() {
  const [activeTab, setActiveTab] = useState('subsidiaries');

  return (
    <section className="py-16 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="mg-container p-0.5 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 holo-noise opacity-10"></div>
            <div className="absolute inset-0 circuit-bg opacity-5"></div>
            <div className="absolute inset-0 mg-grid-bg opacity-5"></div>
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(var(--mg-primary),0.1)]"></div>
          </div>

          {/* Content container */}
          <div className="relative z-10 bg-black/80 p-6">
            {/* Tab navigation */}
            <div className="flex flex-wrap border-b border-[rgba(var(--mg-primary),0.3)] mb-8">
              <button
                onClick={() => setActiveTab('subsidiaries')}
                className={`px-6 py-3 text-sm transition-colors duration-300 mr-2 ${
                  activeTab === 'subsidiaries'
                    ? 'text-[rgba(var(--mg-primary),1)] border-b-2 border-[rgba(var(--mg-primary),1)]'
                    : 'text-[rgba(var(--mg-text),0.7)] hover:text-[rgba(var(--mg-text),0.9)]'
                }`}
              >
                SUBSIDIARIES
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className={`px-6 py-3 text-sm transition-colors duration-300 mr-2 ${
                  activeTab === 'operations'
                    ? 'text-[rgba(var(--mg-primary),1)] border-b-2 border-[rgba(var(--mg-primary),1)]'
                    : 'text-[rgba(var(--mg-text),0.7)] hover:text-[rgba(var(--mg-text),0.9)]'
                }`}
              >
                OPERATIONS
              </button>
            </div>

            {/* Tab content */}
            <div className="min-h-[400px]">
              {activeTab === 'subsidiaries' && <SubsidiariesTab />}
              {activeTab === 'operations' && <OperationsTab />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}