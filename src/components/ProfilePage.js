import React from 'react';
import { ArrowLeft, User, Mail } from 'lucide-react';

const ProfilePage = ({ onBack, user }) => {
  // If no user is passed, show a loading or error state
  if (!user) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading user profile...</p>
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
        <h1 className="text-2xl font-bold text-gray-800 ml-4">My Profile</h1>
      </header>

      {/* Profile Content */}
      <main className="flex-1 p-6">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-5xl">{user.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <Mail size={16} />
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
