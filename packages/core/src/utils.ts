import type { BoothBlock } from './schema';

export interface RenderedBooth {
  id: string;
  number: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function generateBoothsInBlock(block: BoothBlock): RenderedBooth[] {
  const booths: RenderedBooth[] = [];
  const { size, orientation, layoutConfig, skips = [] } = block;
  const { columns, startNumber, endNumber, numberingDirection } = layoutConfig;

  const totalBooths = endNumber - startNumber + 1;
  if (totalBooths <= 0) return booths;

  // physical rows is calculated based on capacity and column count
  const rows = Math.ceil(totalBooths / columns);

  let boothWidth = 0;
  let boothHeight = 0;

  if (orientation === 'horizontal') {
    boothWidth = size.width / rows;
    boothHeight = size.height / columns;
  } else {
    boothWidth = size.width / columns;
    boothHeight = size.height / rows;
  }

  // Iterate over logical booth index (0 to totalBooths-1)
  for (let i = 0; i < totalBooths; i++) {
    const currentNumber = startNumber + i;

    // skip rendering if this logic number is meant to be a gap
    if (skips.includes(currentNumber)) {
      continue;
    }

    // Determine logical grid X/Y (0-based) based on orientation and numbering direction
    let gridX = 0;
    let gridY = 0;

    // Abstract the primary axis progression and secondary axis (column split)
    let pr = 0; // index along the primary growth axis
    let sc = 0; // index along the secondary axis (e.g. which column)

    switch (numberingDirection) {
      case 'top_to_bottom':
        pr = i; sc = 0; break;
      case 'bottom_to_top':
        pr = rows - 1 - i; sc = 0; break;
      case 'left_to_right':
        pr = i; sc = 0; break;
      case 'right_to_left':
        pr = rows - 1 - i; sc = 0; break;
      case 'top_to_bottom_then_bottom_to_top':
        sc = Math.floor(i / rows);
        pr = sc % 2 === 0 ? (i % rows) : (rows - 1 - (i % rows));
        break;
      case 'bottom_to_top_then_top_to_bottom':
        sc = Math.floor(i / rows);
        pr = sc % 2 === 0 ? (rows - 1 - (i % rows)) : (i % rows);
        break;
      case 'left_to_right_then_right_to_left':
        sc = Math.floor(i / rows);
        pr = sc % 2 === 0 ? (i % rows) : (rows - 1 - (i % rows));
        break;
      case 'right_to_left_then_left_to_right':
        sc = Math.floor(i / rows);
        pr = sc % 2 === 0 ? (rows - 1 - (i % rows)) : (i % rows);
        break;
    }

    // Map abstract layout to literal Grid X and Y
    if (orientation === 'horizontal') {
      gridX = pr;
      gridY = sc; // Assuming top to bottom columns for horizontal blocks by default
    } else {
      gridX = sc; // Assuming left to right columns for vertical blocks by default
      gridY = pr;
    }

    booths.push({
      id: `${block.id}-${currentNumber}`,
      number: currentNumber,
      label: `${block.prefix}${currentNumber < 10 ? '0' + currentNumber : currentNumber}`,
      x: block.position.x + gridX * boothWidth,
      y: block.position.y + gridY * boothHeight,
      width: boothWidth,
      height: boothHeight,
    });
  }

  return booths;
}
