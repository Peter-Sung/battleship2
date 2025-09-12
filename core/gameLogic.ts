import { ShipType, Ship, Orientation, GridCell } from "./types";

export const SHIPS: ShipType[] = [
  { name: '항공모함', size: 5, color: { bg: 'bg-yellow-500', border: 'border-yellow-400', sunk: 'bg-yellow-900', text: 'text-yellow-400' } },
  { name: '전함', size: 4, color: { bg: 'bg-orange-500', border: 'border-orange-400', sunk: 'bg-orange-900', text: 'text-orange-400' } },
  { name: '순양함', size: 3, color: { bg: 'bg-green-500', border: 'border-green-400', sunk: 'bg-green-900', text: 'text-green-400' } },
  { name: '잠수함', size: 3, color: { bg: 'bg-pink-500', border: 'border-pink-400', sunk: 'bg-pink-900', text: 'text-pink-400' } },
  { name: '구축함', size: 2, color: { bg: 'bg-purple-500', border: 'border-purple-400', sunk: 'bg-purple-900', text: 'text-purple-400' } },
];

export const isPlacementValid = (
  shipToPlace: ShipType,
  row: number,
  col: number,
  orientation: Orientation,
  playerShips: Ship[]
): boolean => {
  // Check bounds
  if (orientation === 'horizontal') {
    if (col + shipToPlace.size > 10) return false;
  } else { // vertical
    if (row + shipToPlace.size > 10) return false;
  }

  // Check for collisions with already placed ships
  for (let i = 0; i < shipToPlace.size; i++) {
    const r = orientation === 'vertical' ? row + i : row;
    const c = orientation === 'horizontal' ? col + i : col;

    for (const placedShip of playerShips) {
      for (let j = 0; j < placedShip.size; j++) {
        const placed_r = placedShip.orientation === 'vertical' ? placedShip.row + j : placedShip.row;
        const placed_c = placedShip.orientation === 'horizontal' ? placedShip.col + j : placedShip.col;
        if (r === placed_r && c === placed_c) {
          return false; // Collision detected
        }
      }
    }
  }

  return true;
};

export const placeShipsRandomly = (shipsToPlace: ShipType[], existingShips: Ship[]): Ship[] => {
  const newShips: Ship[] = [];
  const allShipsOnBoard = [...existingShips];

  shipsToPlace.forEach(shipType => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);

      if (isPlacementValid(shipType, row, col, orientation, allShipsOnBoard)) {
        const newShip: Ship = {
          ...shipType,
          row,
          col,
          orientation,
          hits: 0,
        };
        newShips.push(newShip);
        allShipsOnBoard.push(newShip);
        placed = true;
      }
      attempts++;
    }
  });

  return newShips;
};


export const placeAiShips = (): Ship[] => {
  return placeShipsRandomly(SHIPS, []);
};

export const checkAttack = (ships: Ship[], row: number, col: number): { hitShip: Ship | null } => {
  const hitShip = ships.find(ship => {
    for (let i = 0; i < ship.size; i++) {
      const r = ship.orientation === 'vertical' ? ship.row + i : ship.row;
      const c = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
      if (r === row && c === col) return true;
    }
    return false;
  });
  return { hitShip: hitShip || null };
};

const createEmptyGrid = (): GridCell[][] => Array(10).fill(null).map(() => Array(10).fill({ state: 'empty' }));

export const generateGridFromState = (ships: Ship[], attacks: Record<string, 'hit' | 'miss'>): GridCell[][] => {
  const grid: GridCell[][] = createEmptyGrid();

  // 1. Place ships and determine hit/sunk status from attacks
  ships.forEach(ship => {
    const isSunk = ship.hits === ship.size;
    for (let i = 0; i < ship.size; i++) {
      const row = ship.orientation === 'vertical' ? ship.row + i : ship.row;
      const col = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
      if (row < 10 && col < 10) {
        const key = `${row}-${col}`;
        const isHit = attacks[key] === 'hit';
        
        if (isSunk) {
          grid[row][col] = { state: 'sunk', color: ship.color };
        } else if (isHit) {
          grid[row][col] = { state: 'hit', color: ship.color };
        } else {
          grid[row][col] = { state: 'ship', color: ship.color };
        }
      }
    }
  });

  // 2. Apply only misses, as hits are handled with ships
  Object.entries(attacks).forEach(([key, result]) => {
    if (result === 'miss') {
      const [row, col] = key.split('-').map(Number);
      if (row < 10 && col < 10 && grid[row][col].state === 'empty') {
        grid[row][col] = { state: 'miss' };
      }
    }
  });

  return grid;
};
