import { Ship, ShipType, Orientation, Player, AttackLog } from '../core/types';
import { SHIPS } from '../core/gameLogic';

export type GameState = 'placing' | 'ai_placing' | 'playing' | 'over';

export interface BattleshipState {
  gameState: GameState;
  winner: Player | null;
  turn: Player;
  playerShips: Ship[];
  aiShips: Ship[];
  playerAttacks: AttackLog;
  aiAttacks: AttackLog;
  selectedShip: ShipType | null;
  orientation: Orientation;
  lastPlayerAttack: { row: number; col: number } | null;
  lastAiAttack: { row: number; col: number } | null;
}

export const initialState: BattleshipState = {
  gameState: 'placing',
  winner: null,
  turn: 'player',
  playerShips: [],
  aiShips: [],
  playerAttacks: {},
  aiAttacks: {},
  selectedShip: SHIPS[0],
  orientation: 'horizontal',
  lastPlayerAttack: null,
  lastAiAttack: null,
};

export type BattleshipAction =
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SELECT_SHIP'; payload: ShipType | null }
  | { type: 'SET_ORIENTATION'; payload: Orientation }
  | { type: 'PLACE_SHIP'; payload: Ship }
  | { type: 'RESET_PLACEMENT' }
  | { type: 'SET_PLAYER_SHIPS'; payload: Ship[] }
  | { type: 'START_GAME'; payload: { aiShips: Ship[] } }
  | { type: 'PROCESS_PLAYER_ATTACK'; payload: { row: number, col: number, wasHit: boolean, updatedAiShips: Ship[] } }
  | { type: 'PROCESS_AI_ATTACK'; payload: { row: number, col: number, wasHit: boolean, updatedPlayerShips: Ship[] } }
  | { type: 'SET_TURN'; payload: Player }
  | { type: 'END_GAME'; payload: Player }
  | { type: 'RESTART_GAME' };

export const battleshipReducer = (state: BattleshipState, action: BattleshipAction): BattleshipState => {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    case 'SELECT_SHIP':
      return { ...state, selectedShip: action.payload, orientation: 'horizontal' };
    case 'SET_ORIENTATION':
      return { ...state, orientation: action.payload };
    case 'PLACE_SHIP':
      return { ...state, playerShips: [...state.playerShips, action.payload] };
    case 'RESET_PLACEMENT':
      return { ...state, playerShips: [], selectedShip: SHIPS[0], orientation: 'horizontal' };
    case 'SET_PLAYER_SHIPS':
      return { ...state, playerShips: action.payload };
    case 'START_GAME':
      return { ...state, aiShips: action.payload.aiShips, gameState: 'playing', turn: 'player' };
    case 'PROCESS_PLAYER_ATTACK': {
      const { row, col, wasHit, updatedAiShips } = action.payload;
      const attackKey = `${row}-${col}`;
      return {
        ...state,
        aiShips: updatedAiShips,
        playerAttacks: { ...state.playerAttacks, [attackKey]: wasHit ? 'hit' : 'miss' },
        lastPlayerAttack: { row, col },
      };
    }
    case 'PROCESS_AI_ATTACK': {
      const { row, col, wasHit, updatedPlayerShips } = action.payload;
      const attackKey = `${row}-${col}`;
      return {
        ...state,
        playerShips: updatedPlayerShips,
        aiAttacks: { ...state.aiAttacks, [attackKey]: wasHit ? 'hit' : 'miss' },
        lastAiAttack: { row, col },
      };
    }
    case 'SET_TURN':
      return { ...state, turn: action.payload };
    case 'END_GAME':
      return { ...state, winner: action.payload, gameState: 'over' };
    case 'RESTART_GAME':
      return { ...initialState };
    default:
      return state;
  }
};
