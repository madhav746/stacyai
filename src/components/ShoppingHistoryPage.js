import React from 'react';
import { ArrowLeft, ShoppingBag, Calendar, Tag } from 'lucide-react';

// --- Mock Data for a specific user's history ---
// In a real app, this would be fetched from your backend API.
const shoppingHistory = [
  {
    date: "July 28, 2025",
    totalItems: 12,
    totalSpent: 89.45,
    items: [
      { name: "Organic Whole Milk", price: 5.99 },
      { name: "Artisan Sourdough Bread", price: 4.50 },
      { name: "Family Size Potato Chips", price: 5.00 },
    ]
  },
  {
    date: "July 21, 2025",
    totalItems: 8,
    totalSpent: 54.12,
    items: [
      { name: "Noise-Cancelling Headphones", price: 149.99 },
      { name: "Cola 12-Pack", price: 8.99 },
    ]
  },
  {
    date: "July 14, 2025",
    totalItems: 21,
    totalSpent: 152.80,
    items: [
      { name: "Women's Athletic Leggings", price: 25.00 },
      { name: "Scented Candle, Lavender", price: 15.00 },
      { name: "Grain-Free Dry Dog Food", price: 35.00 },
    ]
  }
];

const ShoppingHistoryPage = ({ onBack }) => {
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
        <h1 className="text-2xl font-bold text-gray-800 ml-4">Shopping History</h1>
      </header>

      {/* History List */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="space-y-6">
          {shoppingHistory.map((trip, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-red-500" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">{trip.date}</h2>
                  </div>
                  <span className="text-lg font-semibold text-gray-700">${trip.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-6 mt-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={20} />
                    <span>{trip.totalItems} items</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                 <p className="text-sm text-gray-500">
                    Includes: {trip.items.slice(0, 2).map(i => i.name).join(', ')}...
                 </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ShoppingHistoryPage;
