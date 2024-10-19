import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const Stream = () => {
  const [media, setMedia] = useState(null);
  const socket = useRef(io());
  const userVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:5000");
    const setupMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMedia(mediaStream);
        userVideoRef.current.srcObject = mediaStream;
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    setupMedia();
  }, []);

  const startRecording = () => {
    if (media) {
      mediaRecorderRef.current = new MediaRecorder(media, {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        framerate: 30,
      });

      mediaRecorderRef.current.ondataavailable = (ev) => {
        console.log("Binary Stream Available", ev.data);
        socket.current.emit("binarystream", ev.data);
      };

      mediaRecorderRef.current.start(60);
    }
  };

  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #89f7fe, #66a6ff)', // Gradient background
      fontFamily: 'Arial, sans-serif',
      animation: 'backgroundChange 10s infinite', // Animation for background transition
      overflow: 'hidden',
    }}>
      <style>
        {`
          @keyframes buttonPulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
  
          @keyframes backgroundChange {
            0% {
              background: linear-gradient(135deg, #89f7fe, #66a6ff);
            }
            50% {
              background: linear-gradient(135deg, #ff9a9e, #fad0c4);
            }
            100% {
              background: linear-gradient(135deg, #89f7fe, #66a6ff);
            }
          }
  
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
  
      <h1 style={{
        color: '#fff',
        marginBottom: '20px',
        animation: 'fadeIn 2s ease-out', // Text fades in
      }}>
        Video Streamer
      </h1>
  
      <video 
        ref={userVideoRef} 
        autoPlay 
        muted 
        style={{
          width: '80%',
          maxWidth: '700px',
          borderRadius: '10px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
          marginBottom: '20px',
          border: '4px solid white',
          animation: 'fadeIn 3s ease-out', // Smooth fade-in animation for video
        }}
      />
  
      <button 
        id="start-btn" 
        onClick={startRecording}
        style={{
          padding: '12px 24px',
          backgroundColor: '#ff6f61',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.3s ease',
          animation: 'buttonPulse 2s infinite', // Pulse effect for the button
          outline: 'none',
        }}
        onMouseOver={e => e.target.style.backgroundColor = '#e35d50'}
        onMouseOut={e => e.target.style.backgroundColor = '#ff6f61'}
      >
        Start Streaming
      </button>
    </div>
  );
  
};

export default Stream;
