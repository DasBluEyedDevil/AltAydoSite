'use client';

import { useState, useEffect } from 'react';

interface StatusWidgetProps {
  userName?: string;
}

export default function StatusWidget({ userName }: StatusWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cpuUsage, setCpuUsage] = useState(Math.floor(Math.random() * 30) + 15);
  const [memoryUsage, setMemoryUsage] = useState(Math.floor(Math.random() * 40) + 30);
  const [networkLatency, setNetworkLatency] = useState(Math.floor(Math.random() * 50) + 10);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate changing system metrics
      if (Math.random() > 0.7) {
        setCpuUsage(Math.floor(Math.random() * 30) + 15);
        setMemoryUsage(Math.floor(Math.random() * 40) + 30);
        setNetworkLatency(Math.floor(Math.random() * 50) + 10);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="border border-[rgba(var(--mg-primary),0.3)] bg-black/30 rounded-lg overflow-hidden backdrop-blur-sm">
      <div className="border-b border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-primary),0.05)] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[rgba(var(--mg-primary),1)] font-medium">System Status</h3>
        <div className="text-sm text-gray-400">
          {currentTime.toLocaleTimeString()} | {currentTime.toLocaleDateString()}
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-400">Welcome, {userName || 'User'}</span>
            <span className="text-sm text-green-400">ONLINE</span>
          </div>
          <div className="h-1 w-full bg-[rgba(var(--mg-primary),0.1)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[rgba(var(--mg-primary),0.7)] to-[rgba(var(--mg-primary),1)]"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CPU Usage */}
          <div className="p-3 border border-[rgba(var(--mg-primary),0.2)] rounded bg-black/20">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">CPU Usage</span>
              <span className="text-sm text-[rgba(var(--mg-primary),0.9)]">{cpuUsage}%</span>
            </div>
            <div className="h-1 w-full bg-[rgba(var(--mg-primary),0.1)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[rgba(var(--mg-primary),0.5)] to-[rgba(var(--mg-primary),0.8)]"
                style={{ width: `${cpuUsage}%` }}
              ></div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((core) => (
                <div key={core} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Core {core}</div>
                  <div className="h-12 bg-[rgba(var(--mg-primary),0.1)] relative overflow-hidden rounded">
                    <div 
                      className="absolute bottom-0 w-full bg-[rgba(var(--mg-primary),0.3)]"
                      style={{ height: `${Math.random() * 80 + 10}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Memory Usage */}
          <div className="p-3 border border-[rgba(var(--mg-primary),0.2)] rounded bg-black/20">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">Memory</span>
              <span className="text-sm text-[rgba(var(--mg-primary),0.9)]">{memoryUsage}%</span>
            </div>
            <div className="h-1 w-full bg-[rgba(var(--mg-primary),0.1)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[rgba(var(--mg-primary),0.5)] to-[rgba(var(--mg-primary),0.8)]"
                style={{ width: `${memoryUsage}%` }}
              ></div>
            </div>
            <div className="mt-2 flex items-center justify-center h-16">
              <div className="w-16 h-16 rounded-full border-2 border-[rgba(var(--mg-primary),0.3)] relative">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-[rgba(var(--mg-primary),0.15)]"
                  style={{ height: `${memoryUsage}%`, borderRadius: '0 0 9999px 9999px' }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-[rgba(var(--mg-primary),1)]">{memoryUsage}%</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">
              {Math.round(16 * memoryUsage / 100)} GB / 16 GB
            </div>
          </div>
          
          {/* Network */}
          <div className="p-3 border border-[rgba(var(--mg-primary),0.2)] rounded bg-black/20">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">Network</span>
              <span className="text-sm text-[rgba(var(--mg-primary),0.9)]">{networkLatency} ms</span>
            </div>
            <div className="h-1 w-full bg-[rgba(var(--mg-primary),0.1)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[rgba(var(--mg-primary),0.5)] to-[rgba(var(--mg-primary),0.8)]"
                style={{ width: `${(networkLatency / 100) * 100}%` }}
              ></div>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Upload</span>
                <span className="text-[rgba(var(--mg-primary),0.7)]">{Math.floor(Math.random() * 2) + 1}.{Math.floor(Math.random() * 99)} MB/s</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Download</span>
                <span className="text-[rgba(var(--mg-primary),0.7)]">{Math.floor(Math.random() * 10) + 5}.{Math.floor(Math.random() * 99)} MB/s</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Packets</span>
                <span className="text-[rgba(var(--mg-primary),0.7)]">{Math.floor(Math.random() * 1000) + 500}/s</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <span className="text-green-400">CONNECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 