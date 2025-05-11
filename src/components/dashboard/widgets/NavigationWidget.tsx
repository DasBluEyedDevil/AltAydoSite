'use client';

import { useEffect, useRef, useState } from 'react';

interface Waypoint {
  id: number;
  name: string;
  x: number;
  y: number;
  type: 'location' | 'objective' | 'mission' | 'shop';
}

export default function NavigationWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [waypoints] = useState<Waypoint[]>([
    { id: 1, name: 'Central Hub', x: 0.5, y: 0.5, type: 'location' },
    { id: 2, name: 'Mission Point Alpha', x: 0.3, y: 0.2, type: 'mission' },
    { id: 3, name: 'Trading Outpost', x: 0.7, y: 0.6, type: 'shop' },
    { id: 4, name: 'Resource Deposit', x: 0.8, y: 0.3, type: 'objective' },
  ]);
  
  // Draw radar/map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.9;
    
    // Draw function to be called on animation frame
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw outer circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 180, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw inner circles
      [0.75, 0.5, 0.25].forEach(scale => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 180, 255, 0.15)';
        ctx.stroke();
      });
      
      // Draw cross lines
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.strokeStyle = 'rgba(0, 180, 255, 0.15)';
      ctx.stroke();
      
      // Draw radar sweep
      const time = Date.now() / 1000;
      const sweepAngle = (time % 4) * Math.PI / 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(sweepAngle) * maxRadius,
        centerY + Math.sin(sweepAngle) * maxRadius
      );
      const gradient = ctx.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(sweepAngle) * maxRadius,
        centerY + Math.sin(sweepAngle) * maxRadius
      );
      gradient.addColorStop(0, 'rgba(0, 180, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 180, 255, 0)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Create a radar sweep effect
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, sweepAngle - 0.1, sweepAngle, false);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = 'rgba(0, 180, 255, 0.1)';
      ctx.fill();
      
      // Draw waypoints
      waypoints.forEach(waypoint => {
        const x = centerX + (waypoint.x - 0.5) * maxRadius * 2;
        const y = centerY + (waypoint.y - 0.5) * maxRadius * 2;
        
        // Don't draw if outside the radar
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        if (distanceFromCenter > maxRadius) return;
        
        // Draw waypoint
        ctx.beginPath();
        
        // Different styles based on type
        switch (waypoint.type) {
          case 'location':
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
            break;
          case 'mission':
            ctx.fillStyle = 'rgba(255, 180, 0, 0.7)';
            ctx.fillRect(x - 4, y - 4, 8, 8);
            break;
          case 'objective':
            // Diamond shape
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x + 5, y);
            ctx.lineTo(x, y + 5);
            ctx.lineTo(x - 5, y);
            ctx.fillStyle = 'rgba(255, 100, 100, 0.7)';
            break;
          case 'shop':
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x + 4, y);
            ctx.lineTo(x, y + 5);
            ctx.lineTo(x - 4, y);
            ctx.fillStyle = 'rgba(100, 255, 100, 0.7)';
            break;
        }
        
        ctx.fill();
        
        // Highlight selected waypoint
        if (selectedWaypoint?.id === waypoint.id) {
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // Draw label
          ctx.font = '10px Arial';
          ctx.fillStyle = 'rgba(0, 255, 255, 0.9)';
          ctx.fillText(waypoint.name, x + 10, y);
        }
      });
      
      requestAnimationFrame(draw);
    };
    
    // Start animation
    draw();
    
    // Handle resizing
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [waypoints, selectedWaypoint]);
  
  // Handle click on waypoints
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.9;
    
    // Check if clicked on any waypoint
    for (const waypoint of waypoints) {
      const wpX = centerX + (waypoint.x - 0.5) * maxRadius * 2;
      const wpY = centerY + (waypoint.y - 0.5) * maxRadius * 2;
      
      const distance = Math.sqrt(Math.pow(wpX - x, 2) + Math.pow(wpY - y, 2));
      
      if (distance < 10) {
        setSelectedWaypoint(waypoint);
        return;
      }
    }
    
    // If clicked elsewhere, deselect
    setSelectedWaypoint(null);
  };
  
  return (
    <div className="border border-[rgba(var(--mg-primary),0.3)] bg-black/30 rounded-lg overflow-hidden h-full backdrop-blur-sm">
      <div className="border-b border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-primary),0.05)] px-4 py-3 flex justify-between items-center">
        <h3 className="text-[rgba(var(--mg-primary),1)] font-medium">Navigation</h3>
        <div className="text-xs bg-[rgba(var(--mg-primary),0.1)] rounded-full px-2 py-0.5 text-[rgba(var(--mg-primary),0.7)]">
          Local Map
        </div>
      </div>
      
      <div className="flex h-48">
        <div className="w-2/3 h-full p-2">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full cursor-pointer rounded bg-black/30"
            onClick={handleCanvasClick}
          />
        </div>
        
        <div className="w-1/3 border-l border-[rgba(var(--mg-primary),0.2)] p-3 flex flex-col">
          <div className="text-sm text-gray-400 mb-2">Waypoints:</div>
          <div className="space-y-2 flex-grow overflow-auto text-xs">
            {waypoints.map(waypoint => (
              <div 
                key={waypoint.id}
                className={`p-1.5 rounded cursor-pointer ${
                  selectedWaypoint?.id === waypoint.id 
                    ? 'bg-[rgba(var(--mg-primary),0.2)] text-[rgba(var(--mg-primary),1)]' 
                    : 'hover:bg-[rgba(var(--mg-primary),0.1)] text-gray-400'
                }`}
                onClick={() => setSelectedWaypoint(waypoint)}
              >
                {waypoint.name}
              </div>
            ))}
          </div>
          
          {selectedWaypoint && (
            <div className="mt-auto pt-2 border-t border-[rgba(var(--mg-primary),0.1)]">
              <button className="w-full text-center text-xs py-1 bg-[rgba(var(--mg-primary),0.2)] hover:bg-[rgba(var(--mg-primary),0.3)] rounded text-[rgba(var(--mg-primary),0.9)] transition-colors">
                Set Destination
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 