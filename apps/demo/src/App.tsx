import React, { useState, useEffect } from 'react';
import { MapViewer } from '@venue-map/renderer';
import { demoData } from './demo-data';
import { ff46Data } from './ff46-data';
import './App.css';

function App() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      {/* Switch to FF46 complex mapping */}
      <MapViewer 
        data={ff46Data} 
        width={windowSize.width} 
        height={windowSize.height} 
      />
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.8)', padding: 10, borderRadius: 8 }}>
        <h2>Venue Map Engine - FF46 Sandbox</h2>
        <p>Scroll to zoom, Drag to pan.</p>
      </div>
    </div>
  );
}

export default App;
