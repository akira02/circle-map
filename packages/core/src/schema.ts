export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Venue {
  id: string;
  name: string;
  size: Size; // Total canvas size bounding box
  outlinePoints?: Point[]; // Optional custom polygon points for the building shape
  obstacles: Obstacle[];
}

export interface Obstacle {
  id: string;
  position: Point;
  size: Size;
  color?: string; // Default to a dark color or pattern
}

export interface Facility {
  id: string;
  type: 'ENTRANCE' | 'EXIT' | 'RESTROOM' | 'HQ' | 'TICKET' | 'STAGE' | 'OTHER';
  position: Point;
  size: Size;
  label: string;
  direction?: Direction; // Arrow direction for entrances/exits
}

export type NumberingDirection = 'serpentine' | 'same_direction';

export type StartCorner = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';

export interface LayoutConfig {
  columns: number; // Single row is 1, double row back-to-back is 2
  startNumber: number;
  endNumber: number;
  numberingDirection: NumberingDirection;
  startCorner: StartCorner;
}

export interface BoothBlock {
  id: string;
  type: 'standard_row';
  prefix: string;       // e.g., "A"
  position: Point;      // Block starting top-left bound position
  size: Size;           // Total physical bounding box size
  layoutConfig: LayoutConfig;
  skips?: number[];     // Actual logical numbering to skip
}

export interface SpecialZone {
  id: string;
  label: string;
  points: Point[];      // Supports polygon boundaries
  backgroundColor: string;
  textColor: string;
  textAlign: 'CENTER' | 'LEFT' | 'RIGHT';
  verticalAlign: 'MIDDLE' | 'TOP' | 'BOTTOM';
}

export interface MapData {
  venue: Venue;
  facilities: Facility[];
  boothBlocks: BoothBlock[];
  specialZones: SpecialZone[];
}
