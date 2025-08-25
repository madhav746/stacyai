import React, { useState } from 'react';

export default function QRGenerator() {
  const [userId, setUserId] = useState('');
  const [qrUrl, setQrUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if(!userId) {
      setError('Enter a user ID (or choose one)');
      return;
    }
    setQrUrl(null);
    setError(null);
    try {
      // Backend URL: adjust if not running locally
      const backendBase = process.env.REACT_APP_API_URL || "http://10.117.150.225:8000";
      // Get the QR code from backend
      const imgUrl = `${backendBase}/generate_qr/${encodeURIComponent(userId)}`;
      setQrUrl(imgUrl);
    } catch (err) {
      setError('Failed to generate QR code.');
    }
  };

  return (
    <div style={{
      padding: 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>Generate QR Code for In-Store Login</h2>
      <p>Enter your User ID or select from your system.</p>
      <input
        type="text"
        value={userId}
        onChange={e => setUserId(e.target.value)}
        placeholder="Enter user ID"
        style={{padding:12, fontSize:18, marginBottom:12}}
      />
      <button 
        onClick={handleGenerate}
        style={{
          padding: "10px 30px",
          fontSize: "18px",
          background: "#e53935",
          color: "white",
          border: "none",
          borderRadius: "8px",
          marginBottom: "18px"
        }}
      >
        Generate QR Code
      </button>
      {error && <div style={{color:'red', marginBottom:10}}>{error}</div>}
      {qrUrl && (
        <div style={{marginTop:30, textAlign:"center"}}>
          <img src={qrUrl} alt="QR Code" style={{width: 220, height: 220, border:"2px solid #e53935"}}/>
          <div style={{marginTop:10, color:"#555"}}>Scan this QR code with the mobile app to sign in.</div>
        </div>
      )}
    </div>
  );
}
