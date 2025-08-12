import React from 'react';
import { ArrowLeft } from 'lucide-react';
import storeMapImage from '../assets/store_map.jpg';

const aislePositions = {
  "22": { top: "70%", left: "65%" },
  "23": { top: "40%", left: "90%" },
  "16": { top: "48%", left: "50%" },
  "29": { top: "60%", left: "90%" },
  // Add more aisle mappings here
};

const StoreMapPage = ({ onBack, aisle }) => {
  const position = aislePositions[String(aisle)];

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white p-4 flex items-center shadow-md z-10 border-b border-gray-200">
        <button 
          onClick={onBack} 
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 ml-4">Store Map</h1>
      </header>

      {/* Map Content */}
      <main className="flex-1 p-4 overflow-auto flex items-center justify-center relative">
        <div className="relative">
          <img 
            src={storeMapImage} 
            alt="Store Map" 
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow"
          />

          {position && (
            <>
              {/* Ping effect */}
              <div
                className="absolute w-5 h-5 bg-red-600 rounded-full animate-ping"
                style={{
                  top: position.top,
                  left: position.left,
                  transform: "translate(-50%, -50%)"
                }}
              />
              {/* Static dot */}
              <div
                className="absolute w-4 h-4 bg-red-700 rounded-full"
                style={{
                  top: position.top,
                  left: position.left,
                  transform: "translate(-50%, -50%)"
                }}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StoreMapPage;
