import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, CheckCircle, WifiOff } from 'lucide-react';
import QRCode from 'qrcode';

// This component now handles the entire real-time QR login flow.
const WelcomeScreen = ({ onLogin }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [status, setStatus] = useState('loading'); // loading, waiting, success, error
  const [error, setError] = useState('');
  
  // Use a ref to hold the polling interval so it can be cleared properly
  const pollingRef = useRef(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const fetchSessionAndGenerateQR = async () => {
      try {
        // 1. Fetch a new session ID and QR data from the backend
        const response = await fetch('http://10.117.150.225:8000/api/generate-qr');
        if (!response.ok) {
          throw new Error('Failed to get QR session from server.');
        }
        const { qrCodeData, sessionId } = await response.json();

        if (!isMounted) return;

        // 2. Generate the QR code image from the received data string
        const qrUrl = await QRCode.toDataURL(qrCodeData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#334155', // slate-700
            light: '#e2e8f0', // slate-200
          },
        });

        if (!isMounted) return;
        setQrCodeDataUrl(qrUrl);
        setStatus('waiting');

        // 3. Start polling the backend to check if the session is authenticated
        pollingRef.current = setInterval(async () => {
          try {
            const statusResponse = await fetch(`http://10.117.150.225:8000/api/session-status/${sessionId}`);
            if (!statusResponse.ok) {
              // Stop polling if session is not found (e.g., expired)
              throw new Error('Session expired or invalid.');
            }
            const sessionStatus = await statusResponse.json();

            if (sessionStatus.authenticated) {
              setStatus('success');
              clearInterval(pollingRef.current);
              // Wait a moment to show the success message, then call onLogin
              setTimeout(() => {
                if(isMounted) onLogin(sessionStatus.userData);
              }, 1500);
            }
          } catch (pollError) {
            if (isMounted) {
              setError(pollError.message);
              setStatus('error');
            }
            clearInterval(pollingRef.current);
          }
        }, 2000); // Poll every 2 seconds

      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setStatus('error');
        }
      }
    };

    fetchSessionAndGenerateQR();

    // Cleanup function to stop polling when the component unmounts
    return () => {
      isMounted = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [onLogin]);

  const renderQRContent = () => {
    switch (status) {
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center text-green-500">
            <CheckCircle size={96} />
            <p className="mt-4 text-2xl font-bold">Authenticated!</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center text-red-500">
            <WifiOff size={96} />
            <p className="mt-4 text-2xl font-bold">Connection Error</p>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        );
      case 'waiting':
        return <img src={qrCodeDataUrl} alt="Scan QR Code to Login" className="rounded-lg" />;
      case 'loading':
      default:
        return <div className="w-64 h-64 bg-gray-200 rounded-lg animate-pulse"></div>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-red-600 text-white p-12 text-center transition-opacity duration-500">
      <div className="flex items-center gap-4 mb-4">
        <ShoppingCart size={64} />
        <h1 className="text-6xl font-bold">Stacy AI</h1>
      </div>
      <p className="text-2xl mb-8 text-red-100">Your personal in-store assistant.</p>
      
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 h-80 flex items-center justify-center">
        {renderQRContent()}
      </div>
      
      <div className="mt-8">
        <h2 className="text-3xl font-semibold">Ready to Shop?</h2>
        <p className="text-xl mt-2 text-red-200">
          {status === 'waiting' ? 'Scan the QR code in your companion app to begin.' : 'Please wait...'}
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
