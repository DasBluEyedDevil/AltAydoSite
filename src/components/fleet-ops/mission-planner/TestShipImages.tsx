'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { shipDatabase } from '@/types/ShipData';

// Direct image path formatting function
const formatDirectImagePath = (shipName: string): string => {
  const formattedName = shipName.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[.']/g, '')
    .replace(/\//g, '_')
    .replace(/[āáàäâã]/g, 'a')
    .replace(/[ēéèëê]/g, 'e')
    .replace(/[īíìïî]/g, 'i')
    .replace(/[ōóòöôõ]/g, 'o')
    .replace(/[ūúùüû]/g, 'u')
    .replace(/[ÿý]/g, 'y');
  
  return `/images/${formattedName}.png`;
};

const TestShipImages: React.FC = () => {
  const [selectedShip, setSelectedShip] = useState(shipDatabase[0]);
  const [testResults, setTestResults] = useState<Array<{ship: string, path: string, exists: boolean}>>([]);
  
  const testShipImages = () => {
    // Test the first 10 ships for simplicity
    const shipsToTest = shipDatabase.slice(0, 10);
    const results = shipsToTest.map(ship => {
      const imagePath = formatDirectImagePath(ship.name);
      return {
        ship: ship.name,
        path: imagePath,
        exists: true // placeholder, would need browser fetch to verify
      };
    });
    
    setTestResults(results);
  };
  
  // Get direct image path for selected ship
  const selectedShipImagePath = formatDirectImagePath(selectedShip.name);
  
  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl mb-4">Ship Image Path Test</h2>
      
      <button 
        className="px-4 py-2 bg-blue-600 rounded mb-4"
        onClick={testShipImages}
      >
        Test Ship Images
      </button>
      
      <div className="mb-4">
        <h3 className="text-lg mb-2">Sample Ship</h3>
        <select 
          className="bg-gray-800 p-2 w-full max-w-md mb-2"
          value={selectedShip.name}
          onChange={(e) => {
            const ship = shipDatabase.find(s => s.name === e.target.value);
            if (ship) setSelectedShip(ship);
          }}
        >
          {shipDatabase.map(ship => (
            <option key={ship.name} value={ship.name}>{ship.name}</option>
          ))}
        </select>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm mb-1">Ship Details</h4>
            <pre className="bg-gray-800 p-2 text-xs">
              {JSON.stringify(selectedShip, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="text-sm mb-1">Image Path</h4>
            <div className="bg-gray-800 p-2">
              <p className="text-xs mb-1">Raw name: {selectedShip.name}</p>
              <p className="text-xs mb-1">Formatted name: {selectedShip.name.toLowerCase().replace(/\s+/g, '_')}</p>
              <p className="text-xs mb-1">Full path: {selectedShipImagePath}</p>
            </div>
            
            <div className="mt-2 p-2 bg-gray-800">
              <h4 className="text-sm mb-1">Image Preview</h4>
              <div className="h-32 bg-gray-700 relative">
                <Image
                  src={selectedShipImagePath}
                  alt={selectedShip.name}
                  fill
                  sizes="128px"
                  className="object-contain mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {testResults.length > 0 && (
        <div>
          <h3 className="text-lg mb-2">Test Results</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 text-left">Ship</th>
                <th className="p-2 text-left">Image Path</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="p-2">{result.ship}</td>
                  <td className="p-2 text-xs">{result.path}</td>
                  <td className="p-2">
                    <span className={result.exists ? "text-green-500" : "text-red-500"}>
                      {result.exists ? "OK" : "Not Found"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestShipImages; 