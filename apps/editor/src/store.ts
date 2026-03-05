import { create } from 'zustand';
import type { MapData } from '@circlemap/core';
import { ff46Data } from './ff46-data';

interface EditorState {
  mapData: MapData;
  selectedElementId: string | null;
  setMapData: (data: MapData) => void;
  setSelectedElementId: (id: string | null) => void;
  updateVenueSize: (width: number, height: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  mapData: ff46Data,
  selectedElementId: null,
  setMapData: (data) => set({ mapData: data }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  updateVenueSize: (width, height) => set((state) => ({
    mapData: {
      ...state.mapData,
      venue: { ...state.mapData.venue, size: { width, height } }
    }
  }))
}));
