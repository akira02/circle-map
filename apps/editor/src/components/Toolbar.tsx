import React from 'react';
import { PlusSquare, Download, Upload, Settings, LayoutTemplate } from 'lucide-react';

export const Toolbar: React.FC = () => {
  return (
    <div style={{
      height: '60px',
      backgroundColor: '#1e293b',
      color: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      padding: '0 1.5rem',
      gap: '1rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '2rem' }}>
        <LayoutTemplate size={24} color="#38bdf8" />
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Map Editor</h1>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={buttonStyle}>
          <PlusSquare size={16} /> Add Block
        </button>
        <button style={buttonStyle}>
          <PlusSquare size={16} /> Add Facility
        </button>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={secondaryButtonStyle}>
          <Upload size={16} /> Import JSON
        </button>
        <button style={secondaryButtonStyle}>
          <Download size={16} /> Export JSON
        </button>
        <div style={{ width: '1px', height: '24px', backgroundColor: '#334155', margin: '0 0.5rem' }} />
        <button style={secondaryButtonStyle}>
          <Settings size={16} /> Settings
        </button>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'background-color 0.2s'
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#334155',
  color: '#e2e8f0',
};
