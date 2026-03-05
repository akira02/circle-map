import React, { useRef, useState } from 'react';
import type { BoothBlock, Facility, SpecialZone, Obstacle, NumberingDirection } from '@circlemap/core';
import { useEditorStore } from '../store';

type AddMode = 'boothBlock' | 'facility' | 'specialZone' | 'obstacle' | null;

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Shared styles ────────────────────────────────────────────────────────────

const sec: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const lbl: React.CSSProperties = { fontSize: '0.75rem', color: '#64748b', fontWeight: 500 };
const inp: React.CSSProperties = {
  padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1',
  borderRadius: '4px', fontSize: '0.8125rem', width: '100%', boxSizing: 'border-box',
};
const row2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' };
const divider: React.CSSProperties = { height: '1px', backgroundColor: '#e2e8f0' };
const primaryBtn: React.CSSProperties = {
  padding: '0.375rem 0.75rem', backgroundColor: '#3b82f6', color: 'white',
  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, width: '100%',
};
const secondaryBtn: React.CSSProperties = { ...primaryBtn, backgroundColor: '#94a3b8' };
const chipBtn = (active: boolean): React.CSSProperties => ({
  padding: '0.25rem 0.625rem',
  backgroundColor: active ? '#3b82f6' : '#f1f5f9',
  color: active ? 'white' : '#475569',
  border: `1px solid ${active ? '#3b82f6' : '#cbd5e1'}`,
  borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
});

// ── Field helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div style={lbl}>{label}</div>{children}</div>;
}

function NumInput({
  value, onChange, min,
}: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <input
      type="number"
      style={inp}
      value={value}
      min={min}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (!isNaN(v)) onChange(v);
      }}
    />
  );
}

// ── Properties panels ────────────────────────────────────────────────────────

function FacilityPanel({ fac }: { fac: Facility }) {
  const { patchFacility } = useEditorStore();
  const p = (u: Partial<Omit<Facility, 'id'>>) => patchFacility(fac.id, u);
  return (
    <div style={sec}>
      <Field label="類型 Type">
        <select style={inp} value={fac.type} onChange={(e) => p({ type: e.target.value as Facility['type'] })}>
          {(['ENTRANCE','EXIT','RESTROOM','HQ','TICKET','STAGE','OTHER'] as Facility['type'][]).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="標籤 Label">
        <input style={inp} value={fac.label} onChange={(e) => p({ label: e.target.value })} />
      </Field>
      <div style={row2}>
        <Field label="X"><NumInput value={fac.position.x} onChange={(v) => p({ position: { ...fac.position, x: v } })} /></Field>
        <Field label="Y"><NumInput value={fac.position.y} onChange={(v) => p({ position: { ...fac.position, y: v } })} /></Field>
      </div>
      <div style={row2}>
        <Field label="寬 W"><NumInput value={fac.size.width} min={1} onChange={(v) => p({ size: { ...fac.size, width: v } })} /></Field>
        <Field label="高 H"><NumInput value={fac.size.height} min={1} onChange={(v) => p({ size: { ...fac.size, height: v } })} /></Field>
      </div>
      <Field label="方向 Direction">
        <select style={inp} value={fac.direction ?? ''} onChange={(e) => p({ direction: e.target.value as any || undefined })}>
          <option value="">（無）</option>
          {(['UP','DOWN','LEFT','RIGHT'] as const).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>
    </div>
  );
}

function ObstaclePanel({ obs }: { obs: Obstacle }) {
  const { patchObstacle } = useEditorStore();
  const p = (u: Partial<Omit<Obstacle, 'id'>>) => patchObstacle(obs.id, u);
  return (
    <div style={sec}>
      <div style={row2}>
        <Field label="X"><NumInput value={obs.position.x} onChange={(v) => p({ position: { ...obs.position, x: v } })} /></Field>
        <Field label="Y"><NumInput value={obs.position.y} onChange={(v) => p({ position: { ...obs.position, y: v } })} /></Field>
      </div>
      <div style={row2}>
        <Field label="寬 W"><NumInput value={obs.size.width} min={1} onChange={(v) => p({ size: { ...obs.size, width: v } })} /></Field>
        <Field label="高 H"><NumInput value={obs.size.height} min={1} onChange={(v) => p({ size: { ...obs.size, height: v } })} /></Field>
      </div>
      <Field label="顏色 Color">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="color" style={{ ...inp, width: '48px', padding: '1px', height: '30px' }}
            value={obs.color ?? '#333333'} onChange={(e) => p({ color: e.target.value })} />
          <input style={{ ...inp, flex: 1 }} value={obs.color ?? '#333333'}
            onChange={(e) => p({ color: e.target.value })} />
        </div>
      </Field>
    </div>
  );
}

function BoothBlockPanel({ block }: { block: BoothBlock }) {
  const { patchBoothBlock } = useEditorStore();
  const p = (u: Partial<Omit<BoothBlock, 'id'>>) => patchBoothBlock(block.id, u);
  const lc = block.layoutConfig;
  return (
    <div style={sec}>
      <Field label="前綴 Prefix">
        <input style={inp} value={block.prefix} onChange={(e) => p({ prefix: e.target.value })} />
      </Field>
      <div style={row2}>
        <Field label="X"><NumInput value={block.position.x} onChange={(v) => p({ position: { ...block.position, x: v } })} /></Field>
        <Field label="Y"><NumInput value={block.position.y} onChange={(v) => p({ position: { ...block.position, y: v } })} /></Field>
      </div>
      <div style={row2}>
        <Field label="寬 W"><NumInput value={block.size.width} min={1} onChange={(v) => p({ size: { ...block.size, width: v } })} /></Field>
        <Field label="高 H"><NumInput value={block.size.height} min={1} onChange={(v) => p({ size: { ...block.size, height: v } })} /></Field>
      </div>
      <Field label="方向 Orientation">
        <select style={inp} value={block.orientation} onChange={(e) => p({ orientation: e.target.value as any })}>
          <option value="vertical">vertical</option>
          <option value="horizontal">horizontal</option>
        </select>
      </Field>
      <div style={row2}>
        <Field label="排數 Columns">
          <NumInput value={lc.columns} min={1} onChange={(v) => p({ layoutConfig: { ...lc, columns: v } })} />
        </Field>
        <Field label="起始編號">
          <NumInput value={lc.startNumber} min={1} onChange={(v) => p({ layoutConfig: { ...lc, startNumber: v } })} />
        </Field>
      </div>
      <div style={row2}>
        <Field label="結束編號">
          <NumInput value={lc.endNumber} min={1} onChange={(v) => p({ layoutConfig: { ...lc, endNumber: v } })} />
        </Field>
        <Field label="跳號 (逗號分隔)">
          <input
            style={inp}
            value={(block.skips ?? []).join(',')}
            placeholder="22,23"
            onChange={(e) => {
              const skips = e.target.value ? e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];
              p({ skips: skips.length > 0 ? skips : undefined });
            }}
          />
        </Field>
      </div>
      <Field label="編號方向">
        <select style={inp} value={lc.numberingDirection} onChange={(e) => p({ layoutConfig: { ...lc, numberingDirection: e.target.value as NumberingDirection } })}>
          <option value="bottom_to_top_then_top_to_bottom">bottom→top then top→bottom</option>
          <option value="top_to_bottom_then_bottom_to_top">top→bottom then bottom→top</option>
          <option value="left_to_right_then_right_to_left">left→right then right→left</option>
          <option value="right_to_left_then_left_to_right">right→left then left→right</option>
          <option value="left_to_right">left→right</option>
          <option value="right_to_left">right→left</option>
          <option value="top_to_bottom">top→bottom</option>
          <option value="bottom_to_top">bottom→top</option>
        </select>
      </Field>
    </div>
  );
}

function SpecialZonePanel({ zone }: { zone: SpecialZone }) {
  const { patchSpecialZone, updateSpecialZoneSize } = useEditorStore();
  const p = (u: Partial<Omit<SpecialZone, 'id'>>) => patchSpecialZone(zone.id, u);
  const minX = Math.min(...zone.points.map(pt => pt.x));
  const minY = Math.min(...zone.points.map(pt => pt.y));
  const maxX = Math.max(...zone.points.map(pt => pt.x));
  const maxY = Math.max(...zone.points.map(pt => pt.y));
  const w = maxX - minX;
  const h = maxY - minY;
  return (
    <div style={sec}>
      <Field label="標籤 Label">
        <input style={inp} value={zone.label} onChange={(e) => p({ label: e.target.value })} />
      </Field>
      <div style={row2}>
        <Field label="X (左上)">
          <NumInput value={minX} onChange={(v) => {
            const dx = v - minX;
            p({ points: zone.points.map(pt => ({ x: Math.round(pt.x + dx), y: pt.y })) });
          }} />
        </Field>
        <Field label="Y (左上)">
          <NumInput value={minY} onChange={(v) => {
            const dy = v - minY;
            p({ points: zone.points.map(pt => ({ x: pt.x, y: Math.round(pt.y + dy) })) });
          }} />
        </Field>
      </div>
      <div style={row2}>
        <Field label="寬 W">
          <NumInput value={w} min={1} onChange={(v) => updateSpecialZoneSize(zone.id, minX + v, maxY)} />
        </Field>
        <Field label="高 H">
          <NumInput value={h} min={1} onChange={(v) => updateSpecialZoneSize(zone.id, maxX, minY + v)} />
        </Field>
      </div>
      <div style={row2}>
        <Field label="背景色">
          <div style={{ display: 'flex', gap: '4px' }}>
            <input type="color" style={{ ...inp, width: '36px', padding: '1px', height: '28px' }}
              value={zone.backgroundColor.startsWith('rgba') ? '#ffffff' : zone.backgroundColor}
              onChange={(e) => p({ backgroundColor: e.target.value })} />
            <input style={{ ...inp, flex: 1 }} value={zone.backgroundColor} onChange={(e) => p({ backgroundColor: e.target.value })} />
          </div>
        </Field>
        <Field label="文字色">
          <div style={{ display: 'flex', gap: '4px' }}>
            <input type="color" style={{ ...inp, width: '36px', padding: '1px', height: '28px' }}
              value={zone.textColor} onChange={(e) => p({ textColor: e.target.value })} />
            <input style={{ ...inp, flex: 1 }} value={zone.textColor} onChange={(e) => p({ textColor: e.target.value })} />
          </div>
        </Field>
      </div>
      <div style={row2}>
        <Field label="對齊 Align">
          <select style={inp} value={zone.textAlign} onChange={(e) => p({ textAlign: e.target.value as any })}>
            <option value="CENTER">CENTER</option>
            <option value="LEFT">LEFT</option>
            <option value="RIGHT">RIGHT</option>
          </select>
        </Field>
        <Field label="垂直 Vertical">
          <select style={inp} value={zone.verticalAlign} onChange={(e) => p({ verticalAlign: e.target.value as any })}>
            <option value="MIDDLE">MIDDLE</option>
            <option value="TOP">TOP</option>
            <option value="BOTTOM">BOTTOM</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────

export const Sidebar: React.FC = () => {
  const {
    mapData,
    selectedElementId,
    updateVenueSize,
    backgroundImage,
    backgroundImageNaturalSize,
    setBackgroundImage,
    addBoothBlock, addFacility, addSpecialZone, addObstacle,
  } = useEditorStore();

  const { facilities = [], boothBlocks = [], specialZones = [], venue } = mapData;
  const obstacles = venue?.obstacles ?? [];

  const [addMode, setAddMode] = useState<AddMode>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // ── Add-element form state ──
  const [bb, setBb] = useState({
    prefix: 'X', x: '0', y: '0', width: '240', height: '2400',
    orientation: 'vertical' as 'horizontal' | 'vertical',
    columns: '2', startNumber: '1', endNumber: '44',
    numberingDirection: 'bottom_to_top_then_top_to_bottom' as NumberingDirection,
    skips: '',
  });
  const [fac, setFac] = useState({ type: 'ENTRANCE' as Facility['type'], label: '入口', x: '0', y: '0', width: '400', height: '200' });
  const [sz, setSz] = useState({ label: '特殊區域', x1: '0', y1: '0', x2: '600', y2: '400', backgroundColor: 'rgba(200,230,255,0.8)', textColor: '#1e3a5f' });
  const [obs, setObs] = useState({ x: '0', y: '0', width: '250', height: '250', color: '#333333' });

  // ── Background upload ──
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new window.Image();
      img.onload = () => setBackgroundImage(dataUrl, { width: img.naturalWidth, height: img.naturalHeight });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Add handlers ──
  const handleAddBoothBlock = () => {
    const skipsArr = bb.skips ? bb.skips.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];
    const block: BoothBlock = {
      id: `b_${bb.prefix}_${uid()}`, type: 'standard_row',
      prefix: bb.prefix,
      position: { x: Number(bb.x), y: Number(bb.y) },
      size: { width: Number(bb.width), height: Number(bb.height) },
      orientation: bb.orientation,
      layoutConfig: { columns: Number(bb.columns), startNumber: Number(bb.startNumber), endNumber: Number(bb.endNumber), numberingDirection: bb.numberingDirection },
      ...(skipsArr.length > 0 ? { skips: skipsArr } : {}),
    };
    addBoothBlock(block);
    setAddMode(null);
  };
  const handleAddFacility = () => {
    addFacility({ id: `f_${uid()}`, type: fac.type, label: fac.label, position: { x: Number(fac.x), y: Number(fac.y) }, size: { width: Number(fac.width), height: Number(fac.height) } });
    setAddMode(null);
  };
  const handleAddSpecialZone = () => {
    addSpecialZone({ id: `sz_${uid()}`, label: sz.label, points: [{ x: Number(sz.x1), y: Number(sz.y1) }, { x: Number(sz.x2), y: Number(sz.y1) }, { x: Number(sz.x2), y: Number(sz.y2) }, { x: Number(sz.x1), y: Number(sz.y2) }], backgroundColor: sz.backgroundColor, textColor: sz.textColor, textAlign: 'CENTER', verticalAlign: 'MIDDLE' });
    setAddMode(null);
  };
  const handleAddObstacle = () => {
    addObstacle({ id: `p_${uid()}`, position: { x: Number(obs.x), y: Number(obs.y) }, size: { width: Number(obs.width), height: Number(obs.height) }, color: obs.color });
    setAddMode(null);
  };

  // ── Find selected element ──
  const selectedFacility = facilities.find(f => f.id === selectedElementId) ?? null;
  const selectedObstacle = obstacles.find(o => o.id === selectedElementId) ?? null;
  const selectedBoothBlock = boothBlocks.find(b => b.id === selectedElementId) ?? null;
  const selectedSpecialZone = specialZones.find(z => z.id === selectedElementId) ?? null;
  const hasSelection = !!(selectedFacility || selectedObstacle || selectedBoothBlock || selectedSpecialZone);

  return (
    <div style={{ width: '320px', backgroundColor: '#fcfcfc', borderRight: '1px solid #e2e8f0', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Background Image ── */}
      <div style={sec}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>底圖 Background</h2>
        <input ref={bgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
        <button style={primaryBtn} onClick={() => bgInputRef.current?.click()}>
          {backgroundImage ? '更換底圖' : '上傳底圖'}
        </button>
        {backgroundImage && (
          <>
            <button style={secondaryBtn} onClick={() => setBackgroundImage(null)}>移除底圖</button>
            {backgroundImageNaturalSize && (
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                圖片尺寸：{backgroundImageNaturalSize.width} × {backgroundImageNaturalSize.height} px
              </div>
            )}
            {backgroundImageNaturalSize && (
              <button style={{ ...primaryBtn, backgroundColor: '#0ea5e9' }}
                onClick={() => updateVenueSize(backgroundImageNaturalSize.width, backgroundImageNaturalSize.height)}>
                以圖片尺寸設定 Canvas 大小
              </button>
            )}
          </>
        )}
      </div>

      <div style={divider} />

      {/* ── Add Elements ── */}
      <div style={sec}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>新增元素</h2>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {(['boothBlock', 'facility', 'specialZone', 'obstacle'] as AddMode[]).map((mode) => {
            const labels: Record<string, string> = { boothBlock: '攤位排', facility: '設施', specialZone: '特殊區域', obstacle: '障礙物' };
            return <button key={mode!} style={chipBtn(addMode === mode)} onClick={() => setAddMode(addMode === mode ? null : mode)}>{labels[mode!]}</button>;
          })}
        </div>

        {addMode === 'boothBlock' && (
          <div style={{ ...sec, padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <Field label="前綴 Prefix"><input style={inp} value={bb.prefix} onChange={e => setBb({ ...bb, prefix: e.target.value })} /></Field>
            <div style={row2}>
              <Field label="X"><input style={inp} type="number" value={bb.x} onChange={e => setBb({ ...bb, x: e.target.value })} /></Field>
              <Field label="Y"><input style={inp} type="number" value={bb.y} onChange={e => setBb({ ...bb, y: e.target.value })} /></Field>
            </div>
            <div style={row2}>
              <Field label="寬 W"><input style={inp} type="number" value={bb.width} onChange={e => setBb({ ...bb, width: e.target.value })} /></Field>
              <Field label="高 H"><input style={inp} type="number" value={bb.height} onChange={e => setBb({ ...bb, height: e.target.value })} /></Field>
            </div>
            <Field label="方向"><select style={inp} value={bb.orientation} onChange={e => setBb({ ...bb, orientation: e.target.value as any })}><option value="vertical">vertical</option><option value="horizontal">horizontal</option></select></Field>
            <div style={row2}>
              <Field label="排數"><input style={inp} type="number" value={bb.columns} onChange={e => setBb({ ...bb, columns: e.target.value })} /></Field>
              <Field label="起始編號"><input style={inp} type="number" value={bb.startNumber} onChange={e => setBb({ ...bb, startNumber: e.target.value })} /></Field>
            </div>
            <div style={row2}>
              <Field label="結束編號"><input style={inp} type="number" value={bb.endNumber} onChange={e => setBb({ ...bb, endNumber: e.target.value })} /></Field>
              <Field label="跳號"><input style={inp} value={bb.skips} placeholder="22,23" onChange={e => setBb({ ...bb, skips: e.target.value })} /></Field>
            </div>
            <Field label="編號方向">
              <select style={inp} value={bb.numberingDirection} onChange={e => setBb({ ...bb, numberingDirection: e.target.value as NumberingDirection })}>
                <option value="bottom_to_top_then_top_to_bottom">bottom→top then top→bottom</option>
                <option value="top_to_bottom_then_bottom_to_top">top→bottom then bottom→top</option>
                <option value="left_to_right_then_right_to_left">left→right then right→left</option>
                <option value="right_to_left_then_left_to_right">right→left then left→right</option>
                <option value="left_to_right">left→right</option>
                <option value="right_to_left">right→left</option>
                <option value="top_to_bottom">top→bottom</option>
                <option value="bottom_to_top">bottom→top</option>
              </select>
            </Field>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={primaryBtn} onClick={handleAddBoothBlock}>新增</button>
              <button style={secondaryBtn} onClick={() => setAddMode(null)}>取消</button>
            </div>
          </div>
        )}

        {addMode === 'facility' && (
          <div style={{ ...sec, padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <Field label="類型"><select style={inp} value={fac.type} onChange={e => setFac({ ...fac, type: e.target.value as any })}>{(['ENTRANCE','EXIT','RESTROOM','HQ','TICKET','STAGE','OTHER'] as Facility['type'][]).map(t => <option key={t} value={t}>{t}</option>)}</select></Field>
            <Field label="標籤"><input style={inp} value={fac.label} onChange={e => setFac({ ...fac, label: e.target.value })} /></Field>
            <div style={row2}>
              <Field label="X"><input style={inp} type="number" value={fac.x} onChange={e => setFac({ ...fac, x: e.target.value })} /></Field>
              <Field label="Y"><input style={inp} type="number" value={fac.y} onChange={e => setFac({ ...fac, y: e.target.value })} /></Field>
            </div>
            <div style={row2}>
              <Field label="寬"><input style={inp} type="number" value={fac.width} onChange={e => setFac({ ...fac, width: e.target.value })} /></Field>
              <Field label="高"><input style={inp} type="number" value={fac.height} onChange={e => setFac({ ...fac, height: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={primaryBtn} onClick={handleAddFacility}>新增</button>
              <button style={secondaryBtn} onClick={() => setAddMode(null)}>取消</button>
            </div>
          </div>
        )}

        {addMode === 'specialZone' && (
          <div style={{ ...sec, padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <Field label="標籤"><input style={inp} value={sz.label} onChange={e => setSz({ ...sz, label: e.target.value })} /></Field>
            <div style={row2}>
              <Field label="X1"><input style={inp} type="number" value={sz.x1} onChange={e => setSz({ ...sz, x1: e.target.value })} /></Field>
              <Field label="Y1"><input style={inp} type="number" value={sz.y1} onChange={e => setSz({ ...sz, y1: e.target.value })} /></Field>
            </div>
            <div style={row2}>
              <Field label="X2"><input style={inp} type="number" value={sz.x2} onChange={e => setSz({ ...sz, x2: e.target.value })} /></Field>
              <Field label="Y2"><input style={inp} type="number" value={sz.y2} onChange={e => setSz({ ...sz, y2: e.target.value })} /></Field>
            </div>
            <div style={row2}>
              <Field label="背景色"><input style={inp} value={sz.backgroundColor} onChange={e => setSz({ ...sz, backgroundColor: e.target.value })} /></Field>
              <Field label="文字色"><input style={inp} value={sz.textColor} onChange={e => setSz({ ...sz, textColor: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={primaryBtn} onClick={handleAddSpecialZone}>新增</button>
              <button style={secondaryBtn} onClick={() => setAddMode(null)}>取消</button>
            </div>
          </div>
        )}

        {addMode === 'obstacle' && (
          <div style={{ ...sec, padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={row2}>
              <Field label="X"><input style={inp} type="number" value={obs.x} onChange={e => setObs({ ...obs, x: e.target.value })} /></Field>
              <Field label="Y"><input style={inp} type="number" value={obs.y} onChange={e => setObs({ ...obs, y: e.target.value })} /></Field>
            </div>
            <div style={row2}>
              <Field label="寬"><input style={inp} type="number" value={obs.width} onChange={e => setObs({ ...obs, width: e.target.value })} /></Field>
              <Field label="高"><input style={inp} type="number" value={obs.height} onChange={e => setObs({ ...obs, height: e.target.value })} /></Field>
            </div>
            <Field label="顏色"><input style={inp} type="color" value={obs.color} onChange={e => setObs({ ...obs, color: e.target.value })} /></Field>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={primaryBtn} onClick={handleAddObstacle}>新增</button>
              <button style={secondaryBtn} onClick={() => setAddMode(null)}>取消</button>
            </div>
          </div>
        )}
      </div>

      <div style={divider} />

      {/* ── Properties Panel ── */}
      <div style={sec}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
          {hasSelection ? '元件屬性' : '屬性面板'}
        </h2>
        {!hasSelection && (
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            點擊 canvas 上的元素以選取並編輯
          </p>
        )}
        {selectedFacility && <FacilityPanel key={selectedFacility.id} fac={selectedFacility} />}
        {selectedObstacle && <ObstaclePanel key={selectedObstacle.id} obs={selectedObstacle} />}
        {selectedBoothBlock && <BoothBlockPanel key={selectedBoothBlock.id} block={selectedBoothBlock} />}
        {selectedSpecialZone && <SpecialZonePanel key={selectedSpecialZone.id} zone={selectedSpecialZone} />}
      </div>

      <div style={divider} />

      {/* ── Venue Properties ── */}
      <div style={sec}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>Venue 大小</h2>
        <div style={row2}>
          <Field label="Width">
            <input type="number" style={inp} value={mapData.venue.size.width}
              onChange={(e) => updateVenueSize(Number(e.target.value), mapData.venue.size.height)} />
          </Field>
          <Field label="Height">
            <input type="number" style={inp} value={mapData.venue.size.height}
              onChange={(e) => updateVenueSize(mapData.venue.size.width, Number(e.target.value))} />
          </Field>
        </div>
      </div>

      <div style={divider} />

      {/* ── JSON Output ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>JSON Output</h3>
        <textarea
          readOnly
          value={JSON.stringify(mapData, null, 2)}
          style={{ flex: 1, minHeight: '200px', fontSize: '11px', fontFamily: 'monospace', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc', resize: 'vertical' }}
        />
      </div>
    </div>
  );
};
