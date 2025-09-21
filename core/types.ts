export type Orientation = 'horizontal' | 'vertical';

export type ShipColor = {
  bg: string;
  border: string;
  sunk: string;
  text: string;
};

export interface ShipType {
  name: string;
  size: number;
  color: ShipColor;
}

export interface Ship extends ShipType {
  row: number;
  col: number;
  orientation: Orientation;
  hits: number;
}

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk' | 'preview';

export type GridCell = {
  state: CellState;
  color?: ShipColor;
};

export type Player = 'player' | 'ai';

export type AttackLog = Record<string, 'hit' | 'miss'>;