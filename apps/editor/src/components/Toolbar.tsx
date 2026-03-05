import React, { useRef, useEffect } from 'react';
import { Download, Upload, LayoutTemplate, Undo2, Redo2 } from 'lucide-react';
import { useEditorStore } from '../store';

export const Toolbar: React.FC = () => {
  const { mapData, setMapData, past, future, undo, redo } = useEditorStore();
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleExport = () => {
    const json = JSON.stringify(mapData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapData.venue.name || 'map'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setMapData(data);
      } catch {
        alert('無效的 JSON 格式');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '2rem' }}>
        <LayoutTemplate size={24} color="#38bdf8" />
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Map Editor</h1>
      </div>

      {/* Undo / Redo */}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button
          style={{ ...iconBtnStyle, opacity: past.length === 0 ? 0.4 : 1 }}
          onClick={undo}
          disabled={past.length === 0}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          style={{ ...iconBtnStyle, opacity: future.length === 0 ? 0.4 : 1 }}
          onClick={redo}
          disabled={future.length === 0}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
        {past.length > 0 && `${past.length} 步可還原`}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input ref={importInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImport} />
        <button style={secondaryButtonStyle} onClick={() => importInputRef.current?.click()}>
          <Upload size={16} /> Import JSON
        </button>
        <button style={secondaryButtonStyle} onClick={handleExport}>
          <Download size={16} /> Export JSON
        </button>
      </div>
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.4rem',
  backgroundColor: '#334155',
  color: '#e2e8f0',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  backgroundColor: '#334155',
  color: '#e2e8f0',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
};
