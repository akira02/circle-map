import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';
import type { MapData, BoothBlock, SpecialZone, Facility, Obstacle } from '@circlemap/core';
import { generateBoothsInBlock } from '@circlemap/core';

export interface MapViewerProps {
  data: MapData;
  width?: number;
  height?: number;
}

export const MapViewer: React.FC<MapViewerProps> = ({ data, width: widthProp, height: heightProp }) => {
  const { venue, facilities = [], boothBlocks = [], specialZones = [] } = data;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: widthProp ?? 800, height: heightProp ?? 600 });

  // Auto-detect parent size via ResizeObserver when no explicit dimensions given
  useEffect(() => {
    if (widthProp !== undefined && heightProp !== undefined) {
      setContainerSize({ width: widthProp, height: heightProp });
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });
    ro.observe(el);
    // Initial measurement
    const { width, height } = el.getBoundingClientRect();
    if (width > 0 && height > 0) setContainerSize({ width, height });
    return () => ro.disconnect();
  }, [widthProp, heightProp]);

  const { width, height } = containerSize;

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Auto-fit initial map based on venue size and container size
  useMemo(() => {
    if (venue?.size && width && height) {
      const scaleX = width / venue.size.width;
      const scaleY = height / venue.size.height;
      const initialScale = Math.min(scaleX, scaleY) * 0.95; // 5% padding
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

    const mousePointTo = {
      x: stage.getPointerPosition()!.x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition()!.y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);
    setPosition({
      x: -(mousePointTo.x - stage.getPointerPosition()!.x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition()!.y / newScale) * newScale,
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: widthProp !== undefined ? widthProp : '100%',
        height: heightProp !== undefined ? heightProp : '100%',
        overflow: 'hidden',
        background: '#e0e0e0',
      }}
    >
      <Stage
        width={width}
        height={height}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
      >
        <Layer>
          {/* Venue Background */}
          {venue && (
            venue.outlinePoints && venue.outlinePoints.length > 0 ? (
              <Line
                points={venue.outlinePoints.flatMap(p => [p.x, p.y])}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={8}
                closed
              />
            ) : (
              <Rect
                x={0}
                y={0}
                width={venue.size.width}
                height={venue.size.height}
                fill="#ffffff"
                stroke="#000000"
                strokeWidth={8}
              />
            )
          )}

          {/* Obstacles (Pillars, walls) */}
          {(venue?.obstacles || []).map((obs: Obstacle) => (
            <Rect
              key={obs.id}
              x={obs.position.x}
              y={obs.position.y}
              width={obs.size.width}
              height={obs.size.height}
              fill={obs.color || "#333333"}
            />
          ))}

          {/* Facilities */}
          {facilities.map((fac: Facility) => (
            <Group key={fac.id} x={fac.position.x} y={fac.position.y}>
              <Rect
                width={fac.size.width}
                height={fac.size.height}
                fill="#ecf0f1"
                stroke="#bdc3c7"
                strokeWidth={1}
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
            const flatPoints = zone.points.flatMap(p => [p.x, p.y]);
            const minX = Math.min(...zone.points.map(p => p.x));
            const minY = Math.min(...zone.points.map(p => p.y));
            const maxX = Math.max(...zone.points.map(p => p.x));
            const maxY = Math.max(...zone.points.map(p => p.y));

            return (
              <Group key={zone.id}>
                <Line
                  points={flatPoints}
                  fill={zone.backgroundColor}
                  closed
                  stroke={zone.textColor}
                  strokeWidth={2}
                />
                <Text
                  x={minX}
                  y={minY}
                  width={maxX - minX}
                  height={maxY - minY}
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

          {/* Booths Component mapped from Blocks */}
          {boothBlocks.map((block: BoothBlock) => {
            const booths = generateBoothsInBlock(block);
            return (
              <Group key={block.id}>
                {booths.map(booth => (
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
        </Layer>
      </Stage>
    </div>
  );
};
