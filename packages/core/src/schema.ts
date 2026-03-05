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

export type Orientation = 'horizontal' | 'vertical';

export type NumberingDirection =
  | 'bottom_to_top_then_top_to_bottom'
  | 'top_to_bottom_then_bottom_to_top'
  | 'left_to_right_then_right_to_left'
  | 'right_to_left_then_left_to_right'
  | 'left_to_right'
  | 'right_to_left'
  | 'top_to_bottom'
  | 'bottom_to_top';

export interface LayoutConfig {
  columns: number; // Single row is 1, double row back-to-back is 2
  startNumber: number;
  endNumber: number;
  numberingDirection: NumberingDirection;
}

export interface BoothBlock {
  id: string;
  type: 'standard_row';
  prefix: string;       // e.g., "A"
  position: Point;      // Block starting top-left bound position
  size: Size;           // Total physical bounding box size
  orientation: Orientation;
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
