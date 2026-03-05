import React from 'react';
import { useEditorStore } from '../store';

export const Sidebar: React.FC = () => {
  const { mapData, selectedElementId, updateVenueSize } = useEditorStore();

  return (
    <div style={{ width: '320px', backgroundColor: '#fcfcfc', borderRight: '1px solid #e2e8f0', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem 0' }}>Venue Properties</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Width: </label>
            <input
              type="number"
              value={mapData.venue.size.width}
              onChange={(e) => updateVenueSize(Number(e.target.value), mapData.venue.size.height)}
              style={{ width: '120px', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Height: </label>
            <input
              type="number"
              value={mapData.venue.size.height}
              onChange={(e) => updateVenueSize(mapData.venue.size.width, Number(e.target.value))}
              style={{ width: '120px', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />

      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem 0' }}>Selected Item</h3>
        {selectedElementId ? (
          <p style={{ fontSize: '0.875rem', color: '#334155' }}>Editing ID: {selectedElementId}</p>
        ) : (
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>No element selected. Click on an element in the canvas to edit.</p>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem 0' }}>JSON Output</h3>
        <textarea
          readOnly
          value={JSON.stringify(mapData, null, 2)}
          style={{
            flex: 1,
            minHeight: '200px',
            fontSize: '11px',
            fontFamily: 'monospace',
            padding: '0.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            backgroundColor: '#f8fafc',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );
};
