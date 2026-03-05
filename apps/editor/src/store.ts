import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MapData, BoothBlock, Facility, SpecialZone, Obstacle, Point } from '@circlemap/core';
import { ff46Data } from './ff46-data';

const MAX_HISTORY = 50;

interface EditorState {
  mapData: MapData;
  past: MapData[];
  future: MapData[];
  selectedElementId: string | null;
  backgroundImage: string | null;
  backgroundImageNaturalSize: { width: number; height: number } | null;
  setMapData: (data: MapData) => void;
  setSelectedElementId: (id: string | null) => void;
  updateVenueSize: (width: number, height: number) => void;
  setBackgroundImage: (url: string | null, naturalSize?: { width: number; height: number } | null) => void;
  addBoothBlock: (block: BoothBlock) => void;
  addFacility: (facility: Facility) => void;
  addSpecialZone: (zone: SpecialZone) => void;
  addObstacle: (obstacle: Obstacle) => void;
  updateBoothBlockPosition: (id: string, x: number, y: number) => void;
  updateFacilityPosition: (id: string, x: number, y: number) => void;
  updateSpecialZonePoints: (id: string, points: Point[]) => void;
  updateObstaclePosition: (id: string, x: number, y: number) => void;
  updateFacilitySize: (id: string, width: number, height: number) => void;
  updateObstacleSize: (id: string, width: number, height: number) => void;
  updateBoothBlockSize: (id: string, width: number, height: number) => void;
  updateSpecialZoneSize: (id: string, newMaxX: number, newMaxY: number) => void;
  initVenueOutlinePoints: (points: Point[]) => void;
  updateVenueOutlinePoint: (index: number, point: Point) => void;
  patchFacility: (id: string, updates: Partial<Omit<Facility, 'id'>>) => void;
  patchObstacle: (id: string, updates: Partial<Omit<Obstacle, 'id'>>) => void;
  patchBoothBlock: (id: string, updates: Partial<Omit<BoothBlock, 'id'>>) => void;
  patchSpecialZone: (id: string, updates: Partial<Omit<SpecialZone, 'id'>>) => void;
  undo: () => void;
  redo: () => void;
}

function mutate(
  set: (partial: Partial<EditorState> | ((s: EditorState) => Partial<EditorState>)) => void,
  get: () => EditorState,
  fn: (current: MapData) => MapData,
) {
  const { mapData, past } = get();
  set({
    mapData: fn(mapData),
    past: [...past, mapData].slice(-MAX_HISTORY),
    future: [],
  });
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      mapData: ff46Data,
      past: [],
      future: [],
      selectedElementId: null,
      backgroundImage: null,
      backgroundImageNaturalSize: null,

      setMapData: (data) => {
        const { mapData, past } = get();
        set({ mapData: data, past: [...past, mapData].slice(-MAX_HISTORY), future: [] });
      },
      setSelectedElementId: (id) => set({ selectedElementId: id }),
      setBackgroundImage: (url, naturalSize = null) =>
        set({ backgroundImage: url, backgroundImageNaturalSize: naturalSize }),

      updateVenueSize: (width, height) =>
        mutate(set, get, (m) => ({ ...m, venue: { ...m.venue, size: { width, height } } })),

      addBoothBlock: (block) =>
        mutate(set, get, (m) => ({ ...m, boothBlocks: [...m.boothBlocks, block] })),
      addFacility: (facility) =>
        mutate(set, get, (m) => ({ ...m, facilities: [...m.facilities, facility] })),
      addSpecialZone: (zone) =>
        mutate(set, get, (m) => ({ ...m, specialZones: [...m.specialZones, zone] })),
      addObstacle: (obstacle) =>
        mutate(set, get, (m) => ({
          ...m, venue: { ...m.venue, obstacles: [...m.venue.obstacles, obstacle] },
        })),

      updateBoothBlockPosition: (id, x, y) =>
        mutate(set, get, (m) => ({
          ...m, boothBlocks: m.boothBlocks.map((b) =>
            b.id === id ? { ...b, position: { x: Math.round(x), y: Math.round(y) } } : b,
          ),
        })),
      updateFacilityPosition: (id, x, y) =>
        mutate(set, get, (m) => ({
          ...m, facilities: m.facilities.map((f) =>
            f.id === id ? { ...f, position: { x: Math.round(x), y: Math.round(y) } } : f,
          ),
        })),
      updateSpecialZonePoints: (id, points) =>
        mutate(set, get, (m) => ({
          ...m, specialZones: m.specialZones.map((z) => (z.id === id ? { ...z, points } : z)),
        })),
      updateObstaclePosition: (id, x, y) =>
        mutate(set, get, (m) => ({
          ...m, venue: {
            ...m.venue, obstacles: m.venue.obstacles.map((o) =>
              o.id === id ? { ...o, position: { x: Math.round(x), y: Math.round(y) } } : o,
            ),
          },
        })),

      updateFacilitySize: (id, width, height) =>
        mutate(set, get, (m) => ({
          ...m, facilities: m.facilities.map((f) =>
            f.id === id ? { ...f, size: { width, height } } : f,
          ),
        })),
      updateObstacleSize: (id, width, height) =>
        mutate(set, get, (m) => ({
          ...m, venue: {
            ...m.venue, obstacles: m.venue.obstacles.map((o) =>
              o.id === id ? { ...o, size: { width, height } } : o,
            ),
          },
        })),
      updateBoothBlockSize: (id, width, height) =>
        mutate(set, get, (m) => ({
          ...m, boothBlocks: m.boothBlocks.map((b) =>
            b.id === id ? { ...b, size: { width, height } } : b,
          ),
        })),
      updateSpecialZoneSize: (id, newMaxX, newMaxY) =>
        mutate(set, get, (m) => {
          const zone = m.specialZones.find((z) => z.id === id);
          if (!zone) return m;
          const minX = Math.min(...zone.points.map((p) => p.x));
          const minY = Math.min(...zone.points.map((p) => p.y));
          const oldMaxX = Math.max(...zone.points.map((p) => p.x));
          const oldMaxY = Math.max(...zone.points.map((p) => p.y));
          const scaleX = oldMaxX > minX ? (newMaxX - minX) / (oldMaxX - minX) : 1;
          const scaleY = oldMaxY > minY ? (newMaxY - minY) / (oldMaxY - minY) : 1;
          const points = zone.points.map((p) => ({
            x: Math.round(minX + (p.x - minX) * scaleX),
            y: Math.round(minY + (p.y - minY) * scaleY),
          }));
          return { ...m, specialZones: m.specialZones.map((z) => (z.id === id ? { ...z, points } : z)) };
        }),

      initVenueOutlinePoints: (points) =>
        mutate(set, get, (m) => ({ ...m, venue: { ...m.venue, outlinePoints: points } })),
      updateVenueOutlinePoint: (index, point) =>
        mutate(set, get, (m) => {
          const pts = [...(m.venue.outlinePoints ?? [])];
          pts[index] = point;
          return { ...m, venue: { ...m.venue, outlinePoints: pts } };
        }),

      patchFacility: (id, updates) =>
        mutate(set, get, (m) => ({
          ...m, facilities: m.facilities.map((f) => f.id === id ? { ...f, ...updates } : f),
        })),
      patchObstacle: (id, updates) =>
        mutate(set, get, (m) => ({
          ...m, venue: {
            ...m.venue,
            obstacles: m.venue.obstacles.map((o) => o.id === id ? { ...o, ...updates } : o),
          },
        })),
      patchBoothBlock: (id, updates) =>
        mutate(set, get, (m) => ({
          ...m, boothBlocks: m.boothBlocks.map((b) => b.id === id ? { ...b, ...updates } : b),
        })),
      patchSpecialZone: (id, updates) =>
        mutate(set, get, (m) => ({
          ...m, specialZones: m.specialZones.map((z) => z.id === id ? { ...z, ...updates } : z),
        })),

      undo: () => {
        const { past, mapData, future } = get();
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        set({ mapData: previous, past: past.slice(0, -1), future: [mapData, ...future] });
      },
      redo: () => {
        const { past, mapData, future } = get();
        if (future.length === 0) return;
        const next = future[0];
        set({ mapData: next, past: [...past, mapData], future: future.slice(1) });
      },
    }),
    {
      name: 'circlemap-editor-v1',
      partialize: (state) => ({
        mapData: state.mapData,
        backgroundImage: state.backgroundImage,
        backgroundImageNaturalSize: state.backgroundImageNaturalSize,
      }),
      onRehydrateStorage: () => (_, error) => {
        if (error) console.warn('Failed to restore saved state:', error);
      },
    },
  ),
);
