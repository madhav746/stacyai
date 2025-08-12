import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User, History, Heart, Map, LogOut, Mic, Send, Navigation, ShoppingCart } from 'lucide-react';

// --- Speech Recognition Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Backend API endpoint (adjust to your actual backend URL)
const BACKEND_API_URL = "http://localhost:8000/ask";

// --- Product Card Component ---
const ProductCard = ({ product, onNavigate }) => {
  if (!product) return null;

  const originalPrice = product.originalPrice;
  const discountedPrice = product.discountedPrice;
  const savedAmount = originalPrice - discountedPrice;

  // Mock functions for Add to Cart/Wishlist
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click event
    alert(`Added "${product.name}" to your cart!`);
  };

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    alert(`Added "${product.name}" to your wishlist!`);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 w-64 md:w-72 flex-shrink-0 shadow-lg">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-40 object-contain rounded-lg mb-3"
        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x300/ef4444/ffffff?text=Image+Not+Found'; }}
      />
      <h3 className="font-bold text-gray-800 h-12 overflow-hidden text-sm">{product.name}</h3>
      
      <div className="flex items-baseline gap-3 mt-2">
        {discountedPrice && discountedPrice < originalPrice ? (
          <>
            <p className="text-xl font-bold text-red-600">${discountedPrice.toFixed(2)}</p>
            <p className="text-md text-gray-400 line-through">${originalPrice.toFixed(2)}</p>
          </>
        ) : (
          <p className="text-xl font-bold text-gray-800">${originalPrice.toFixed(2)}</p>
        )}
      </div>

      {savedAmount > 0 && (
        <div className="mt-2 inline-block bg-red-100 text-red-700 font-bold text-xs px-3 py-1 rounded-full">
          Save ${savedAmount.toFixed(2)}
        </div>
      )}
      
      <div className="mt-4 space-y-2">
        <button 
          onClick={() => onNavigate('map')}
          className="w-full bg-gray-800 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors text-xs">
          <Navigation size={16} />
          <span>Guide Me (Aisle {product.aisle_location})</span>
        </button>
        <div className="flex gap-2">
            <button onClick={handleAddToCart} className="w-full bg-red-500 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors text-xs">
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
            </button>
            <button onClick={handleAddToWishlist} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors text-xs">
                <Heart size={16} />
                <span>Wishlist</span>
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Product Carousel Component ---
const ProductCarousel = ({ products, onNavigate }) => {
    return (
        <div className="w-full">
            <div className="flex space-x-4 overflow-x-auto py-2">
                {products.map((product, index) => (
                    <ProductCard key={index} product={product} onNavigate={onNavigate} />
                ))}
            </div>
        </div>
    );
};


const AssistantPage = ({ onNavigate, user, messages, setMessages }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState('push');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const ttsQueueRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("stacySessionId");
    if (existing) return existing;
    const newId = `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem("stacySessionId", newId);
    return newId;
  });

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) setVoices(availableVoices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    if (voices.length > 0 && messages.length === 1 && messages[0].sender === 'stacy') {
      speak(messages[0].text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voices]);

  const menuItems = [
    { text: "My Profile", icon: <User size={24} />, page: "profile" },
    { text: "Shopping History", icon: <History size={24} />, page: "history" },
    { text: "Wish List", icon: <Heart size={24} />, page: "wishlist" },
    { text: "Store Map", icon: <Map size={24} />, page: "map" },
  ];

  const speak = (text) => {
    return new Promise((resolve, reject) => {
      stopListening();
      window.speechSynthesis.cancel();
      if ("speechSynthesis" in window && voices.length > 0) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voices.find((v) => v.name.includes("Female") && v.lang.startsWith("en")) || voices.find((v) => v.name.includes("Zira")) || voices.find((v) => v.lang.startsWith("en-US"));
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => { setIsSpeaking(false); resolve(); };
        utterance.onerror = (e) => { setIsSpeaking(false); reject(e); };
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported by this browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const finalTranscript = event.results[event.results.length - 1][0].transcript.trim();
      if (finalTranscript) {
        ttsQueueRef.current = finalTranscript;
        setMessages((prev) => [...prev, { id: Date.now(), text: finalTranscript, sender: "user" }]);
        stopListening();
      }
    };
    recognition.onerror = (event) => { console.error("Speech recognition error:", event.error); setIsListening(false); };
    recognition.onend = async () => {
      setIsListening(false);
      if (ttsQueueRef.current) {
        const userText = ttsQueueRef.current;
        ttsQueueRef.current = null;
        await sendQueryToBackend(userText);
      }
    };
    return () => { if (recognition) recognition.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voices, setMessages]);

  useEffect(() => {
    if (voiceMode === "active" && !isListening && !isSpeaking) {
      startListening();
    }
  }, [isListening, isSpeaking, voiceMode]);

  const startListening = () => {
    if (!isListening && !isSpeaking && recognitionRef.current) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (e) {
        console.error("Could not start recognition:", e);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      setIsListening(false);
    }
  };

  const handleMicClick = () => {
    if (voiceMode === "push") {
      if (isListening) stopListening();
      else startListening();
    }
  };

  const handleVoiceModeChange = (newMode) => {
    setVoiceMode(newMode);
    stopListening();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendQueryToBackend = async (userQuery) => {
    if (!userQuery.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery, session_id: sessionId }),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();

      if (!data || !data.answer) {
        throw new Error("Invalid response structure from backend.");
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: data.answer,
        sender: "stacy",
        type: data.type,
        product: data.product,
        products: data.products // Handle multiple products
      };
      setMessages((prev) => [...prev, aiMessage]);
      await speak(data.answer);

    } catch (e) {
      console.error("Backend error:", e);
      const errorMsg = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "stacy",
        type: "text"
      };
      setMessages((prev) => [...prev, errorMsg]);
      await speak(errorMsg.text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend = inputText) => {
    const text = textToSend.trim();
    if (text === "") return;
    stopListening();
    const newUserMessage = { id: Date.now(), text, sender: "user" };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    await sendQueryToBackend(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="w-full h-full bg-white flex flex-col relative overflow-hidden">
      {/* Sidebar Menu */}
      <aside className={`absolute top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Stacy AI Menu</h2>
          <nav className="flex flex-col space-y-2 flex-grow">
            {menuItems.map((item) => (
              <button key={item.text} onClick={() => onNavigate(item.page)} className="flex items-center gap-4 p-4 rounded-lg text-lg text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                {item.icon}
                <span>{item.text}</span>
              </button>
            ))}
          </nav>
          <button className="w-full bg-red-600 text-white font-bold py-4 px-4 rounded-lg text-lg flex items-center justify-center gap-3 hover:bg-red-700 transition-colors">
            <LogOut size={24} />
            <span>End Trip</span>
          </button>
        </div>
      </aside>

      {isMenuOpen && (<div className="absolute inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsMenuOpen(false)}></div>)}

      {/* Header */}
      <header className="bg-white p-4 flex items-center justify-between shadow-md z-10 border-b border-gray-200">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-700 hover:text-red-600">
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
        <div className="flex items-center bg-gray-100 rounded-full p-1 text-sm font-semibold">
          <button onClick={() => handleVoiceModeChange("off")} className={`px-4 py-2 rounded-full transition-colors ${voiceMode === "off" ? "bg-white text-gray-800 shadow" : "text-gray-500"}`}>Off</button>
          <button onClick={() => handleVoiceModeChange("push")} className={`px-4 py-2 rounded-full transition-colors ${voiceMode === "push" ? "bg-white text-gray-800 shadow" : "text-gray-500"}`}>Push to Talk</button>
          <button onClick={() => handleVoiceModeChange("active")} className={`px-4 py-2 rounded-full transition-colors ${voiceMode === "active" ? "bg-white text-red-600 shadow" : "text-gray-500"}`}>Always Active</button>
        </div>
      </header>

      {/* Chat History */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50">
        <div className="flex flex-col space-y-4">
          {messages && messages.map((message) => (
            <div key={message.id} className={`flex w-full ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              {message.type === "product" && message.product ? (
                <ProductCard product={message.product} onNavigate={onNavigate} />
              ) : message.type === "products" && message.products ? (
                <ProductCarousel products={message.products} onNavigate={onNavigate} />
              ) : (
                <div className={`px-4 py-3 rounded-2xl max-w-xs md:max-w-md lg:max-w-lg ${message.sender === "user" ? "bg-red-500 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"}`}>
                  <p className="text-base">{message.text}</p>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
          {isLoading && <p className="text-center text-gray-500">Stacy is thinking...</p>}
        </div>
      </main>

      {/* Text Input */}
      <footer className="bg-white p-3 border-t border-gray-200">
        <div className="relative">
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={handleKeyPress} placeholder="Talk to Stacy..." className="w-full bg-gray-100 border-2 border-gray-200 rounded-full py-3 pl-6 pr-16 text-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition" disabled={isSpeaking} />
          <button onClick={() => (inputText ? handleSendMessage() : handleMicClick())} className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:bg-red-300 ${isListening ? "ring-4 ring-red-300" : ""}`} disabled={isSpeaking} aria-label={inputText ? "Send Message" : "Activate Microphone"}>
            {inputText ? <Send size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </footer>
    </div>
  );
};       

export default AssistantPage;
