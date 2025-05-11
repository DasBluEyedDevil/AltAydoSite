'use client';

import { useState, useEffect } from 'react';

export default function WeatherWidget() {
  const [temperature, setTemperature] = useState(22);
  const [humidity, setHumidity] = useState(45);
  const [windSpeed, setWindSpeed] = useState(12);
  const [weatherType, setWeatherType] = useState('Clear');
  
  // Simulated weather changes
  useEffect(() => {
    const timer = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.7) {
        // Fluctuate temperature slightly
        setTemperature(prevTemp => {
          const newTemp = prevTemp + (Math.random() - 0.5) * 2;
          return Number(newTemp.toFixed(1));
        });
        
        // Fluctuate humidity
        setHumidity(prevHumidity => {
          const newHumidity = prevHumidity + Math.floor((Math.random() - 0.5) * 5);
          return Math.max(30, Math.min(90, newHumidity));
        });
        
        // Fluctuate wind speed
        setWindSpeed(prevWind => {
          const newWind = prevWind + (Math.random() - 0.5) * 3;
          return Number(Math.max(0, newWind).toFixed(1));
        });
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="border border-[rgba(var(--mg-primary),0.3)] bg-black/30 rounded-lg overflow-hidden h-full backdrop-blur-sm">
      <div className="border-b border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-primary),0.05)] px-4 py-3">
        <h3 className="text-[rgba(var(--mg-primary),1)] font-medium">Weather</h3>
      </div>
      
      <div className="p-4 flex flex-col h-[calc(100%-3rem)]">
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="text-4xl font-light text-[rgba(var(--mg-primary),1)] mb-1">
            {temperature}°C
          </div>
          <div className="text-gray-400 text-sm mb-6">
            {weatherType}
          </div>
          
          <div className="w-20 h-20 mb-4 relative">
            <div className="w-full h-full rounded-full border-2 border-[rgba(var(--mg-primary),0.3)] flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[rgba(var(--mg-primary),0.1)] to-[rgba(var(--mg-primary),0.3)]"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">☀️</span>
            </div>
            
            {/* Decorative orbit */}
            <div className="absolute top-0 left-0 w-full h-full animate-spin-slow pointer-events-none" style={{ animationDuration: '20s' }}>
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-[rgba(var(--mg-primary),0.7)] rounded-full transform -translate-x-1/2"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center p-2 border border-[rgba(var(--mg-primary),0.2)] rounded bg-black/20">
            <div className="text-xs text-gray-500 mb-1">Humidity</div>
            <div className="text-[rgba(var(--mg-primary),0.9)]">{humidity}%</div>
          </div>
          
          <div className="text-center p-2 border border-[rgba(var(--mg-primary),0.2)] rounded bg-black/20">
            <div className="text-xs text-gray-500 mb-1">Wind</div>
            <div className="text-[rgba(var(--mg-primary),0.9)]">{windSpeed} km/h</div>
          </div>
          
          <div className="text-center p-2 border border-[rgba(var(--mg-primary),0.2)] rounded bg-black/20">
            <div className="text-xs text-gray-500 mb-1">Pressure</div>
            <div className="text-[rgba(var(--mg-primary),0.9)]">1013 hPa</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-4">
          New ArcCorp, Terra • Local Time
        </div>
      </div>
    </div>
  );
} 