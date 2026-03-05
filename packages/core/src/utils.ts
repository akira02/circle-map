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
  const { size, layoutConfig, skips = [] } = block;
  const { columns, startNumber, endNumber, numberingDirection, startCorner } = layoutConfig;

  const totalBooths = endNumber - startNumber + 1;
  if (totalBooths <= 0) return booths;
  if (columns <= 0) return booths;

  const isHorizontalPrimary = size.width >= size.height;

  // physical rows is calculated based on capacity and column count
  const rows = Math.ceil(totalBooths / columns);

  let boothWidth = 0;
  let boothHeight = 0;

  if (isHorizontalPrimary) {
    boothWidth = size.width / rows;
    boothHeight = size.height / columns;
  } else {
    boothWidth = size.width / columns;
    boothHeight = size.height / rows;
  }

  const startsOnTop = startCorner === 'top_left' || startCorner === 'top_right';
  const startsOnLeft = startCorner === 'top_left' || startCorner === 'bottom_left';
  const primaryForward = isHorizontalPrimary ? startsOnLeft : startsOnTop;
  const secondaryForward = isHorizontalPrimary ? startsOnTop : startsOnLeft;

  // Iterate over logical booth index (0 to totalBooths-1)
  for (let i = 0; i < totalBooths; i++) {
    const currentNumber = startNumber + i;

    // skip rendering if this logic number is meant to be a gap
    if (skips.includes(currentNumber)) {
      continue;
    }

    // Abstract primary/secondary axes first, then map to x/y grid.
    const secondaryIndex = Math.floor(i / rows);
    const offsetInPrimary = i % rows;
    const reverseInThisColumn = numberingDirection === 'serpentine' && secondaryIndex % 2 === 1;
    const primaryIndex = reverseInThisColumn ? rows - 1 - offsetInPrimary : offsetInPrimary;

    const mappedPrimary = primaryForward ? primaryIndex : rows - 1 - primaryIndex;
    const mappedSecondary = secondaryForward ? secondaryIndex : columns - 1 - secondaryIndex;

    const gridX = isHorizontalPrimary ? mappedPrimary : mappedSecondary;
    const gridY = isHorizontalPrimary ? mappedSecondary : mappedPrimary;

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
