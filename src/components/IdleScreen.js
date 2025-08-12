import React, { useState, useEffect } from 'react';

// --- Ad Data ---
// In a real app, this would come from a backend API.
// Inspired by your references, but generic and brand-less.
const ads = [
  {
    title: "Fresh Deals Weekly",
    subtitle: "Save big on groceries & produce",
    image: "https://placehold.co/600x400/34d399/ffffff?text=Groceries",
    bgColor: "from-green-500 to-emerald-600",
  },
  {
    title: "Back to School",
    subtitle: "Everything they need for less",
    image: "https://placehold.co/600x400/60a5fa/ffffff?text=School+Supplies",
    bgColor: "from-blue-500 to-indigo-600",
  },
  {
    title: "Game On!",
    subtitle: "The latest electronics & video games",
    image: "https://placehold.co/600x400/a78bfa/ffffff?text=Electronics",
    bgColor: "from-purple-500 to-violet-600",
  },
];

const IdleScreen = ({ onWake }) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // This effect handles the automatic 5-second rotation of ads.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 5000); // 5 seconds

    // Clean up the timer when the component is unmounted
    return () => clearInterval(timer);
  }, []);

  return (
    // The main container is a clickable div that triggers the onWake function.
    <div 
      className="w-full h-full cursor-pointer relative overflow-hidden" 
      onClick={onWake}
    >
      {/* This inner div holds the sliding ad strip. */}
      {/* The `transform` property is what creates the sliding effect. */}
      <div 
        className="h-full flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}
      >
        {/* We map over the ads array to create a slide for each ad. */}
        {ads.map((ad, index) => (
          <div 
            key={index} 
            className={`w-full h-full flex-shrink-0 flex flex-col items-center justify-center p-12 text-white text-center bg-gradient-to-br ${ad.bgColor}`}
          >
            <h1 className="text-6xl font-extrabold drop-shadow-lg">{ad.title}</h1>
            <p className="text-3xl mt-4 opacity-90 drop-shadow-md">{ad.subtitle}</p>
            <img 
              src={ad.image} 
              alt={ad.title} 
              className="mt-8 rounded-2xl shadow-2xl max-w-lg"
            />
          </div>
        ))}
      </div>

      {/* "Touch to login" message at the bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-2xl font-bold px-8 py-4 rounded-full animate-pulse">
        Touch to Login
      </div>
    </div>
  );
};

export default IdleScreen;
