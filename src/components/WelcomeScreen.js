import React from 'react';
import { ShoppingCart } from 'lucide-react';

// This component is the entry point for the user.
const WelcomeScreen = ({ onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-red-600 text-white p-12 text-center transition-opacity duration-500">
      <div className="flex items-center gap-4 mb-4">
        <ShoppingCart size={64} />
        <h1 className="text-6xl font-bold">Stacy AI</h1>
      </div>
      <p className="text-2xl mb-8 text-red-100">Your personal in-store assistant.</p>
      
      <div className="bg-white p-6 rounded-2xl shadow-2xl">
        <img src="https://placehold.co/256x256/e2e8f0/334155?text=Scan+QR+Code" alt="QR Code Placeholder" className="rounded-lg" />
      </div>
      
      <div className="mt-8">
        <h2 className="text-3xl font-semibold">Ready to Shop?</h2>
        <p className="text-xl mt-2 text-red-200">Scan the QR code in your companion app to begin.</p>
      </div>
      
      <button 
        onClick={onLogin} 
        className="mt-8 px-6 py-3 bg-white text-red-600 font-bold rounded-full text-lg shadow-lg hover:bg-red-50 transition-colors"
      >
        (Manual Scan Simulation)
      </button>
    </div>
  );
};

export default WelcomeScreen;
