'use client';

import { useState, useEffect } from 'react';

export default function DashboardWidgets() {
  // Keep only the state variables that are actually used in the UI
  const [balance] = useState("260,000");
  const [reputation] = useState(14);
  const [days] = useState(37);
  const [hours, setHours] = useState(51);

  // Simple effect for stats updates
  useEffect(() => {
    const statsTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        setHours(prevHours => (prevHours + 1) % 60);
      }
    }, 5000);

    return () => {
      clearInterval(statsTimer);
    };
  }, []);

  return (
    <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-4 rounded-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.4)] to-transparent"></div>
      
      {/* Employee Status */}
      <div className="mt-0 pt-0">
        <div className="flex items-center mb-3">
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[rgba(var(--mg-primary),0.15)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="ml-2 text-xs font-quantify tracking-wider text-[rgba(var(--mg-text),0.9)]">EMPLOYEE STATUS</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[rgba(var(--mg-panel-dark),0.2)] p-3 rounded-sm">
            <div className="text-[10px] text-[rgba(var(--mg-text),0.6)]">ACTIVE DAYS</div>
            <div className="text-sm font-quantify text-[rgba(var(--mg-primary),0.9)]">{days}</div>
          </div>
          
          <div className="bg-[rgba(var(--mg-panel-dark),0.2)] p-3 rounded-sm">
            <div className="text-[10px] text-[rgba(var(--mg-text),0.6)]">SERVICE HOURS</div>
            <div className="text-sm font-quantify text-[rgba(var(--mg-primary),0.9)]">{hours}</div>
          </div>
          
          <div className="bg-[rgba(var(--mg-panel-dark),0.2)] p-3 rounded-sm">
            <div className="text-[10px] text-[rgba(var(--mg-text),0.6)]">REPUTATION</div>
            <div className="text-sm font-quantify text-[rgba(var(--mg-primary),0.9)]">{reputation}</div>
          </div>
          
          <div className="bg-[rgba(var(--mg-panel-dark),0.2)] p-3 rounded-sm">
            <div className="text-[10px] text-[rgba(var(--mg-text),0.6)]">BALANCE (UEC)</div>
            <div className="text-sm font-quantify text-[rgba(var(--mg-primary),0.9)]">{balance}</div>
          </div>
        </div>
      </div>
    </div>
  );
}