import React, { useState } from 'react';
import IdleScreen from './components/IdleScreen';
import WelcomeScreen from './components/WelcomeScreen';
import AssistantPage from './components/AssistantPage';
import ShoppingHistoryPage from './components/ShoppingHistoryPage';
import ProfilePage from './components/ProfilePage';
import WishListPage from './components/WishListPage';
import StoreMapPage from './components/StoreMapPage'; // Import the new component

// --- Mock User Data ---
const mockUser = {
  id: 'user123',
  name: 'Alex',
  email: 'alex.doe@example.com',
};

// This component now manages the state for all application pages, the user, and the chat history.
export default function App() {
  const [currentPage, setCurrentPage] = useState('idle');
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]); // Chat history is now stored here

  const handleWake = () => {
    setCurrentPage('welcome');
  };

  // The login function now sets the user and creates the initial welcome message.
  const handleLogin = () => {
    console.log("User logged in:", mockUser.name);
    setCurrentUser(mockUser);
    
    // Create the welcome message for the chat session
    const welcomeText = `Hi there, ${mockUser.name}! I'm Stacy. How can I help you find the perfect deal today?`;
    setMessages([{ id: Date.now(), text: welcomeText, sender: 'stacy' }]);
    
    setCurrentPage('assistant');
  };
  
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomeScreen onLogin={handleLogin} />;
      case 'assistant':
        // Pass the messages and the function to update them to the AssistantPage
        return (
          <AssistantPage 
            onNavigate={handleNavigate} 
            user={currentUser} 
            messages={messages}
            setMessages={setMessages}
          />
        );
      case 'history':
        return <ShoppingHistoryPage onBack={() => setCurrentPage('assistant')} user={currentUser} />;
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('assistant')} user={currentUser} />;
      case 'wishlist':
        return <WishListPage onBack={() => setCurrentPage('assistant')} user={currentUser} />;
      case 'map':
        // Add the new case for the store map page
        return <StoreMapPage onBack={() => setCurrentPage('assistant')} />;
      case 'idle':
      default:
        return <IdleScreen onWake={handleWake} />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderContent()}
    </div>
  );
}
