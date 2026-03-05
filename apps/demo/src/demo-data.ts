import type { MapData } from '@venue-map/renderer';

export const demoData: MapData = {
  venue: {
    id: "v1",
    name: "Taipei Expo Dome",
    size: { width: 8000, height: 6000 },
    obstacles: [
      {
        id: "obs1",
        position: { x: 1000, y: 2000 },
        size: { width: 400, height: 400 },
        color: "#333333"
      }
    ]
  },
  facilities: [
    {
      id: "f1",
      type: "ENTRANCE",
      position: { x: 0, y: 3000 },
      size: { width: 400, height: 600 },
      label: "一般入口",
      direction: "RIGHT"
    }
  ],
  boothBlocks: [
    {
      id: "blk1",
      type: "standard_row",
      prefix: "A",
      position: { x: 1500, y: 1000 },
      size: { width: 300, height: 3600 },
      layoutConfig: {
        columns: 2,
        startNumber: 1,
        endNumber: 48,
        numberingDirection: "serpentine",
        startCorner: "top_left"
      },
      skips: [24, 25] 
    }
  ],
  specialZones: [
    {
      id: "sz1",
      label: "企業攤位區",
      points: [
        { x: 5000, y: 1000 },
        { x: 7000, y: 1000 },
        { x: 7000, y: 3000 },
        { x: 5000, y: 3000 }
      ],
      backgroundColor: "rgba(255, 165, 0, 0.3)",
      textColor: "#d35400",
      textAlign: "CENTER",
      verticalAlign: "MIDDLE"
    },
    {
      id: "sz2",
      label: "禁止進入",
      points: [
        { x: 100, y: 100 },
        { x: 800, y: 100 },
        { x: 900, y: 500 },
        { x: 200, y: 600 }
      ],
      backgroundColor: "rgba(255, 0, 0, 0.2)",
      textColor: "#c0392b",
      textAlign: "CENTER",
      verticalAlign: "MIDDLE"
    }
  ]
};
