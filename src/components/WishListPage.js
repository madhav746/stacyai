import React from 'react';
import { ArrowLeft, Heart } from 'lucide-react';

const WishListPage = ({ onBack, user }) => {
  // If no user is passed, show a loading or error state
  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading wishlist...</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-800 ml-4">My Wish List</h1>
      </header>

      {/* Wishlist Content */}
      <main className="flex-1 p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <Heart size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Your Wish List is Empty</h2>
          <p className="text-gray-500 mt-2">
            You can add items to your wish list from the main assistant page.
          </p>
        </div>
      </main>
    </div>
  );
};

export default WishListPage;
