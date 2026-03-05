import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group, Line, Image as KonvaImage, Circle, Label, Tag } from 'react-konva';
import type { BoothBlock, SpecialZone, Facility, Obstacle, Point } from '@circlemap/core';
import { generateBoothsInBlock } from '@circlemap/core';
import { useEditorStore } from '../store';

// Resize handle rendered inside Konva Layer.
// All pixel sizes divided by `scale` so the handle appears at a fixed screen size.
const ResizeHandle: React.FC<{
  anchorX: number;
  anchorY: number;
  originX: number;
  originY: number;
  scale: number;
  onResize: (w: number, h: number) => void;
}> = ({ anchorX, anchorY, originX, originY, scale, onResize }) => {
  const [label, setLabel] = useState<string | null>(null);
  const HALF = 8 / scale;
  const SW   = 2 / scale;
  const FS   = 11 / scale;
  const PAD  = 4 / scale;
  const CR   = 3 / scale;
  return (
    <Group>
      {label && (
        <Label x={anchorX + 10 / scale} y={anchorY - 24 / scale}>
          <Tag fill="rgba(30,41,59,0.9)" cornerRadius={CR} />
          <Text text={label} fill="white" fontSize={FS} padding={PAD} fontFamily="monospace" />
        </Label>
      )}
      <Rect
        x={anchorX - HALF}
        y={anchorY - HALF}
        width={HALF * 2}
        height={HALF * 2}
        fill="#3b82f6"
        stroke="white"
        strokeWidth={SW}
        draggable
        onDragMove={(e) => {
          const nx = e.target.x() + HALF;
          const ny = e.target.y() + HALF;
          const w = Math.max(50, Math.round(nx - originX));
          const h = Math.max(50, Math.round(ny - originY));
          setLabel(`${w} × ${h}`);
        }}
        onDragEnd={(e) => {
          const nx = e.target.x() + HALF;
          const ny = e.target.y() + HALF;
          const w = Math.max(50, Math.round(nx - originX));
          const h = Math.max(50, Math.round(ny - originY));
          setLabel(null);
          onResize(w, h);
        }}
      />
    </Group>
  );
};

export const MapCanvas: React.FC = () => {
  const {
    mapData, backgroundImage,
    setSelectedElementId, selectedElementId,
    updateBoothBlockPosition, updateFacilityPosition,
    updateSpecialZonePoints, updateObstaclePosition,
    updateFacilitySize, updateObstacleSize, updateBoothBlockSize, updateSpecialZoneSize,
    initVenueOutlinePoints, updateVenueOutlinePoint,
  } = useEditorStore();
  const { venue, facilities = [], boothBlocks = [], specialZones = [] } = mapData;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setContainerSize({ width, height });
      }
    });
    ro.observe(el);
    const { width, height } = el.getBoundingClientRect();
    if (width > 0 && height > 0) setContainerSize({ width, height });
    return () => ro.disconnect();
  }, []);

  const { width, height } = containerSize;
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useMemo(() => {
    if (venue?.size && width && height) {
      const scaleX = width / venue.size.width;
      const scaleY = height / venue.size.height;
      const initialScale = Math.min(scaleX, scaleY) * 0.95;
      setScale(initialScale);
      const contentWidth = venue.size.width * initialScale;
      const contentHeight = venue.size.height * initialScale;
      setPosition({
        x: (width - contentWidth) / 2,
        y: (height - contentHeight) / 2,
      });
    }
  }, [venue, width, height]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = e.target.getStage();
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition()!;
    const mousePointTo = {
      x: pointer.x / oldScale - stage.x() / oldScale,
      y: pointer.y / oldScale - stage.y() / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);
    setPosition({
      x: -(mousePointTo.x - pointer.x / newScale) * newScale,
      y: -(mousePointTo.y - pointer.y / newScale) * newScale,
    });
  };

  // Background image
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (backgroundImage) {
      const img = new window.Image();
      img.src = backgroundImage;
      img.onload = () => setBgImage(img);
    } else {
      setBgImage(null);
    }
  }, [backgroundImage]);

  // Venue polygon edit mode
  const [venueEditMode, setVenueEditMode] = useState(false);
  const [dragNodeIdx, setDragNodeIdx] = useState<number | null>(null);
  const [dragNodePos, setDragNodePos] = useState<Point | null>(null);

  const handleDeselect = (e: any) => {
    if (e.target === e.target.getStage() || e.target.name() === 'venue-bg') {
      setSelectedElementId(null);
      setVenueEditMode(false);
    }
  };

  const handleVenueClick = () => {
    if (venueEditMode) return;
    if (!venue.outlinePoints || venue.outlinePoints.length === 0) {
      initVenueOutlinePoints([
        { x: 0, y: 0 },
        { x: venue.size.width, y: 0 },
        { x: venue.size.width, y: venue.size.height },
        { x: 0, y: venue.size.height },
      ]);
    }
    setSelectedElementId(null);
    setVenueEditMode(true);
  };

  // Selected element info for coordinate overlay
  const selectedElementInfo = useMemo(() => {
    if (!selectedElementId) return null;
    const fac = facilities.find((f) => f.id === selectedElementId);
    if (fac) return { id: fac.id, type: 'Facility', x: fac.position.x, y: fac.position.y };
    const obs = (venue?.obstacles ?? []).find((o) => o.id === selectedElementId);
    if (obs) return { id: obs.id, type: 'Obstacle', x: obs.position.x, y: obs.position.y };
    const block = boothBlocks.find((b) => b.id === selectedElementId);
    if (block) return { id: block.id, type: 'BoothBlock', x: block.position.x, y: block.position.y };
    const zone = specialZones.find((z) => z.id === selectedElementId);
    if (zone) {
      const minX = Math.min(...zone.points.map((p) => p.x));
      const minY = Math.min(...zone.points.map((p) => p.y));
      return { id: zone.id, type: 'SpecialZone', x: minX, y: minY };
    }
    return null;
  }, [selectedElementId, mapData]);

  // Resize handle params for selected element
  const resizeHandle = useMemo(() => {
    if (!selectedElementId || venueEditMode) return null;
    const fac = facilities.find((f) => f.id === selectedElementId);
    if (fac) return {
      anchorX: fac.position.x + fac.size.width,
      anchorY: fac.position.y + fac.size.height,
      originX: fac.position.x, originY: fac.position.y,
      onResize: (w: number, h: number) => updateFacilitySize(fac.id, w, h),
    };
    const obs = (venue?.obstacles ?? []).find((o) => o.id === selectedElementId);
    if (obs) return {
      anchorX: obs.position.x + obs.size.width,
      anchorY: obs.position.y + obs.size.height,
      originX: obs.position.x, originY: obs.position.y,
      onResize: (w: number, h: number) => updateObstacleSize(obs.id, w, h),
    };
    const block = boothBlocks.find((b) => b.id === selectedElementId);
    if (block) return {
      anchorX: block.position.x + block.size.width,
      anchorY: block.position.y + block.size.height,
      originX: block.position.x, originY: block.position.y,
      onResize: (w: number, h: number) => updateBoothBlockSize(block.id, w, h),
    };
    const zone = specialZones.find((z) => z.id === selectedElementId);
    if (zone) {
      const minX = Math.min(...zone.points.map((p) => p.x));
      const minY = Math.min(...zone.points.map((p) => p.y));
      const maxX = Math.max(...zone.points.map((p) => p.x));
      const maxY = Math.max(...zone.points.map((p) => p.y));
      return {
        anchorX: maxX, anchorY: maxY,
        originX: minX, originY: minY,
        onResize: (w: number, h: number) => updateSpecialZoneSize(zone.id, minX + w, minY + h),
      };
    }
    return null;
  }, [selectedElementId, venueEditMode, mapData]);

  return (
    <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>

      {/* Coordinate overlay — selected element position */}
      {selectedElementInfo && (
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 10,
          backgroundColor: 'rgba(15,23,42,0.85)', color: 'white',
          borderRadius: 4, padding: '4px 10px',
          fontSize: 12, fontFamily: 'monospace',
          pointerEvents: 'none', lineHeight: 1.6,
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}>
          <div style={{ color: '#94a3b8', fontSize: 10 }}>{selectedElementInfo.type} · {selectedElementInfo.id}</div>
          <div>x: {selectedElementInfo.x} · y: {selectedElementInfo.y}</div>
        </div>
      )}

      {/* Venue edit mode hint */}
      {venueEditMode && (
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 10,
          backgroundColor: 'rgba(245,158,11,0.9)', color: 'white',
          borderRadius: 4, padding: '4px 10px', fontSize: 12,
          pointerEvents: 'none',
        }}>
          場地外框編輯中 — 拖曳節點調整形狀 · 點擊空白處退出
        </div>
      )}

      <Stage
        width={width}
        height={height}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onClick={handleDeselect}
      >
        <Layer>
          {/* Background Image */}
          {bgImage && venue && (
            <KonvaImage
              image={bgImage}
              x={0} y={0}
              width={venue.size.width}
              height={venue.size.height}
              opacity={0.4}
              name="venue-bg"
            />
          )}

          {/* Venue outline */}
          {venue && (
            venue.outlinePoints && venue.outlinePoints.length > 0 ? (
              <Line
                points={venue.outlinePoints.flatMap((p) => [p.x, p.y])}
                fill={bgImage ? 'rgba(255,255,255,0.05)' : '#ffffff'}
                stroke={venueEditMode ? '#f59e0b' : '#000000'}
                strokeWidth={venueEditMode ? 3 : 8}
                closed
                onClick={handleVenueClick}
                name="venue-bg"
              />
            ) : (
              <Rect
                x={0} y={0}
                width={venue.size.width}
                height={venue.size.height}
                fill={bgImage ? 'rgba(255,255,255,0)' : '#ffffff'}
                stroke={venueEditMode ? '#f59e0b' : '#000000'}
                strokeWidth={venueEditMode ? 3 : 8}
                onClick={handleVenueClick}
                name="venue-bg"
              />
            )
          )}

          {/* Obstacles */}
          {(venue?.obstacles ?? []).map((obs: Obstacle) => (
            <Group
              key={obs.id}
              x={obs.position.x}
              y={obs.position.y}
              draggable
              onClick={() => setSelectedElementId(obs.id)}
              onDragEnd={(e) => updateObstaclePosition(obs.id, e.target.x(), e.target.y())}
            >
              <Rect
                width={obs.size.width}
                height={obs.size.height}
                fill={obs.color ?? '#333333'}
                stroke={selectedElementId === obs.id ? '#f59e0b' : undefined}
                strokeWidth={selectedElementId === obs.id ? 4 : 0}
              />
            </Group>
          ))}

          {/* Facilities */}
          {facilities.map((fac: Facility) => (
            <Group
              key={fac.id}
              x={fac.position.x}
              y={fac.position.y}
              draggable
              onClick={() => setSelectedElementId(fac.id)}
              onDragEnd={(e) => updateFacilityPosition(fac.id, e.target.x(), e.target.y())}
            >
              <Rect
                width={fac.size.width}
                height={fac.size.height}
                fill="#ecf0f1"
                stroke={selectedElementId === fac.id ? '#f59e0b' : '#bdc3c7'}
                strokeWidth={selectedElementId === fac.id ? 3 : 1}
              />
              <Text
                text={fac.label}
                width={fac.size.width}
                height={fac.size.height}
                align="center"
                verticalAlign="middle"
                fontSize={Math.min(fac.size.width, fac.size.height) * 0.3}
                fill="#2c3e50"
              />
            </Group>
          ))}

          {/* Special Zones */}
          {specialZones.map((zone: SpecialZone) => {
            const flatPoints = zone.points.flatMap((p) => [p.x, p.y]);
            const minX = Math.min(...zone.points.map((p) => p.x));
            const minY = Math.min(...zone.points.map((p) => p.y));
            const maxX = Math.max(...zone.points.map((p) => p.x));
            const maxY = Math.max(...zone.points.map((p) => p.y));
            return (
              <Group
                key={zone.id}
                draggable
                onClick={() => setSelectedElementId(zone.id)}
                onDragEnd={(e) => {
                  const dx = e.target.x();
                  const dy = e.target.y();
                  e.target.position({ x: 0, y: 0 });
                  updateSpecialZonePoints(zone.id, zone.points.map((p) => ({
                    x: Math.round(p.x + dx), y: Math.round(p.y + dy),
                  })));
                }}
              >
                <Line
                  points={flatPoints}
                  fill={zone.backgroundColor}
                  closed
                  stroke={selectedElementId === zone.id ? '#f59e0b' : zone.textColor}
                  strokeWidth={selectedElementId === zone.id ? 3 : 2}
                />
                <Text
                  x={minX} y={minY}
                  width={maxX - minX} height={maxY - minY}
                  text={zone.label}
                  align={zone.textAlign.toLowerCase()}
                  verticalAlign={zone.verticalAlign.toLowerCase()}
                  fill={zone.textColor}
                  fontSize={(maxY - minY) * 0.15}
                  padding={10}
                />
              </Group>
            );
          })}

          {/* Booth Blocks */}
          {boothBlocks.map((block: BoothBlock) => {
            const booths = generateBoothsInBlock(block);
            const isSelected = selectedElementId === block.id;
            return (
              <Group
                key={block.id}
                draggable
                onClick={() => setSelectedElementId(block.id)}
                onDragEnd={(e) => {
                  const dx = e.target.x();
                  const dy = e.target.y();
                  e.target.position({ x: 0, y: 0 });
                  updateBoothBlockPosition(block.id, block.position.x + dx, block.position.y + dy);
                }}
              >
                {isSelected && (
                  <Rect
                    x={block.position.x - 4}
                    y={block.position.y - 4}
                    width={block.size.width + 8}
                    height={block.size.height + 8}
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth={3}
                  />
                )}
                {booths.map((booth) => (
                  <Group key={booth.id} x={booth.x} y={booth.y}>
                    <Rect
                      width={booth.width}
                      height={booth.height}
                      fill="#ffffff"
                      stroke="#2980b9"
                      strokeWidth={1}
                    />
                    <Text
                      text={booth.label}
                      width={booth.width}
                      height={booth.height}
                      align="center"
                      verticalAlign="middle"
                      fontSize={Math.min(booth.width, booth.height) * 0.4}
                      fill="#2c3e50"
                    />
                  </Group>
                ))}
              </Group>
            );
          })}

          {/* Venue polygon edit nodes */}
          {venueEditMode && (venue.outlinePoints ?? []).map((pt: Point, i: number) => (
            <Group key={i}>
              {dragNodeIdx === i && dragNodePos && (
                <Label x={dragNodePos.x + 12 / scale} y={dragNodePos.y - 28 / scale}>
                  <Tag fill="rgba(30,41,59,0.9)" cornerRadius={3 / scale} />
                  <Text
                    text={`(${dragNodePos.x}, ${dragNodePos.y})`}
                    fill="white" fontSize={11 / scale} padding={4 / scale} fontFamily="monospace"
                  />
                </Label>
              )}
              <Circle
                x={pt.x}
                y={pt.y}
                radius={8 / scale}
                fill={dragNodeIdx === i ? '#ef4444' : '#f59e0b'}
                stroke="white"
                strokeWidth={2 / scale}
                draggable
                onDragMove={(e) => {
                  setDragNodeIdx(i);
                  setDragNodePos({ x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
                }}
                onDragEnd={(e) => {
                  updateVenueOutlinePoint(i, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
                  setDragNodeIdx(null);
                  setDragNodePos(null);
                }}
              />
            </Group>
          ))}

          {/* Resize handle for selected element */}
          {resizeHandle && (
            <ResizeHandle
              key={selectedElementId!}
              anchorX={resizeHandle.anchorX}
              anchorY={resizeHandle.anchorY}
              originX={resizeHandle.originX}
              originY={resizeHandle.originY}
              scale={scale}
              onResize={resizeHandle.onResize}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
