import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { MapCanvas } from './components/MapCanvas';
import './App.css';

function App() {
  return (
    <div className="editor-container">
      <Toolbar />
      <div className="editor-workspace">
        <Sidebar />
        <MapCanvas />
      </div>
    </div>
  );
}

export default App;
