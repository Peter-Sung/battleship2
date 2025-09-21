
import { useState, useMemo, useEffect, useCallback, useRef, useReducer } from 'react';
import { SHIPS, isPlacementValid, placeAiShips, placeShipsRandomly, generateGridFromState, INVALID_COLOR, checkAndUpdateShipHits } from '../core/gameLogic';
import { Ship, ShipType, Orientation } from '../core/types';
import { useBattleshipAI } from './useBattleshipAI';
import { battleshipReducer, initialState } from './useBattleshipReducer';
import { playEffectSound } from '../utils/audio';

interface Notification {
  prefix: string;
  shipName: string;
  suffix: string;
  shipColor: string;
}

export const useBattleship = () => {
  const [state, dispatch] = useReducer(battleshipReducer, initialState);
  const {
    gameState, winner, turn, playerShips, aiShips,
    playerAttacks, aiAttacks, selectedShip, orientation,
    lastPlayerAttack, lastAiAttack
  } = state;

  const { calculateNextAttack, updateAiStrategy, resetAi } = useBattleshipAI();

  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);
  const [isGodMode, setIsGodMode] = useState(false);

  // --- Effects ---

  useEffect(() => {
    const handleGodModeToggle = () => setIsGodMode(prev => !prev);
    window.addEventListener('toggleGodMode', handleGodModeToggle);
    return () => window.removeEventListener('toggleGodMode', handleGodModeToggle);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && gameState === 'placing' && selectedShip) {
        toggleOrientation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShip, gameState]);

  useEffect(() => {
    if (gameState !== 'playing' || winner) return;

    const allPlayerShipsSunk = playerShips.length > 0 && playerShips.every(s => s.hits === s.size);
    const allAiShipsSunk = aiShips.length > 0 && aiShips.every(s => s.hits === s.size);

    if (allPlayerShipsSunk) {
      dispatch({ type: 'END_GAME', payload: 'ai' });
    } else if (allAiShipsSunk) {
      dispatch({ type: 'END_GAME', payload: 'player' });
    }
  }, [playerShips, aiShips, gameState, winner]);

  const showNotification = useCallback((notif: Notification) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(notif);
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);
  
  const aiAttack = useCallback(() => {
    const attackedCoords = new Set(Object.keys(aiAttacks));
    const { row, col } = calculateNextAttack(attackedCoords);

    const { hitShip, updatedShips } = checkAndUpdateShipHits(row, col, playerShips);
    const wasHit = !!hitShip;

    if (wasHit && hitShip) {
      const isSunk = hitShip.hits + 1 === hitShip.size;
      playEffectSound(isSunk ? 'sunk' : 'hit');
      if (isSunk) {
        showNotification({
          prefix: '나의 ',
          shipName: hitShip.name,
          suffix: ' 침몰!',
          shipColor: hitShip.color.text,
        });
      }
    } else {
      playEffectSound('miss');
    }

    updateAiStrategy(wasHit, hitShip ? {...hitShip, hits: hitShip.hits + 1} : null, { row, col });
    
    dispatch({
      type: 'PROCESS_AI_ATTACK',
      payload: { row, col, wasHit, updatedPlayerShips: updatedShips }
    });

    if (!wasHit) {
      dispatch({ type: 'SET_TURN', payload: 'player' });
    }
  }, [aiAttacks, calculateNextAttack, playerShips, showNotification, updateAiStrategy]);

  useEffect(() => {
    if (turn === 'ai' && gameState === 'playing' && !winner) {
      const attackTimeout = setTimeout(() => {
        aiAttack();
      }, 1000);
      return () => clearTimeout(attackTimeout);
    }
  }, [turn, gameState, winner, aiAttack]);

  // --- Memoized Grids ---

  const playerGrid = useMemo(() => {
    const grid = generateGridFromState(playerShips, aiAttacks);
    if (gameState === 'placing' && selectedShip && hoveredCell) {
      const isValid = isPlacementValid(selectedShip, hoveredCell.row, hoveredCell.col, orientation, playerShips);
      for (let i = 0; i < selectedShip.size; i++) {
        const r = orientation === 'vertical' ? hoveredCell.row + i : hoveredCell.row;
        const c = orientation === 'horizontal' ? hoveredCell.col + i : hoveredCell.col;
        if (r < 10 && c < 10) {
          grid[r][c] = { state: 'preview', color: isValid ? selectedShip.color : INVALID_COLOR };
        }
      }
    }
    return grid;
  }, [playerShips, aiAttacks, selectedShip, hoveredCell, orientation, gameState]);
  
  const enemyGrid = useMemo(() => generateGridFromState(aiShips, playerAttacks), [aiShips, playerAttacks]);

  // --- Event Handlers ---

  const handleEnemyCellClick = (row: number, col: number) => {
    if (gameState !== 'playing' || winner || turn !== 'player') return;
    if (playerAttacks[`${row}-${col}`]) return;

    const { hitShip, updatedShips } = checkAndUpdateShipHits(row, col, aiShips);
    const wasHit = !!hitShip;

    if (wasHit && hitShip) {
      const isSunk = hitShip.hits + 1 === hitShip.size;
      playEffectSound(isSunk ? 'sunk' : 'hit');
      if (isSunk) {
        showNotification({
          prefix: 'AI의 ',
          shipName: hitShip.name,
          suffix: ' 침몰!',
          shipColor: hitShip.color.text,
        });
      }
    } else {
      playEffectSound('miss');
    }
    
    dispatch({
      type: 'PROCESS_PLAYER_ATTACK',
      payload: { row, col, wasHit, updatedAiShips: updatedShips }
    });
    
    if (!wasHit) {
      dispatch({ type: 'SET_TURN', payload: 'ai' });
    }
  };

  const handlePlayerCellClick = (row: number, col: number) => {
    if (!selectedShip) return;
    if (isPlacementValid(selectedShip, row, col, orientation, playerShips)) {
      const newShip = { ...selectedShip, row, col, orientation, hits: 0 };
      dispatch({ type: 'PLACE_SHIP', payload: newShip });

      const placedNames = [...playerShips.map(s => s.name), newShip.name];
      const remainingShips = SHIPS.filter(s => !placedNames.includes(s.name));
      dispatch({ type: 'SELECT_SHIP', payload: remainingShips[0] || null });
    }
  };
  
  const handleShipSelect = (ship: ShipType) => {
    dispatch({ type: 'SELECT_SHIP', payload: ship });
  };

  const toggleOrientation = () => dispatch({ type: 'SET_ORIENTATION', payload: orientation === 'horizontal' ? 'vertical' : 'horizontal' });

  const handleAutoPlace = () => {
    const newShips = placeShipsRandomly(SHIPS, []);
    dispatch({ type: 'SET_PLAYER_SHIPS', payload: newShips });
    dispatch({ type: 'SELECT_SHIP', payload: null });
  };
  
  const handleResetPlacement = () => {
    dispatch({ type: 'RESET_PLACEMENT' });
  };

  const handleStartGame = () => {
    dispatch({ type: 'SET_GAME_STATE', payload: 'ai_placing' });
    setTimeout(() => {
        const newAiShips = placeAiShips();
        dispatch({ type: 'START_GAME', payload: { aiShips: newAiShips } });
    }, 2000);
  };

  const handlePlayAgain = () => {
    dispatch({ type: 'RESTART_GAME' });
    resetAi();
  };
  
  // --- UI State/Helpers ---
  const placedShipNames = useMemo(() => playerShips.map(s => s.name), [playerShips]);

  const getGameStatusTitle = () => {
    if (gameState === 'placing') return '함대 배치';
    if (gameState === 'ai_placing') return '전투 준비';
    if (gameState === 'over') {
      return winner === 'player' ? '승리!' : '패배...';
    }
    if (turn === 'player') return 'AI의 함대를 공격하세요.';
    if (turn === 'ai') return 'AI가 조준하고 있습니다.';
    return '전투 중';
  };
  
  const isPlayerBoardActive = gameState === 'playing' && turn === 'ai' && winner === null;
  const isEnemyBoardActive = gameState === 'playing' && turn === 'player' && winner === null;
  
  return {
    gameState,
    playerGrid,
    enemyGrid,
    playerShips,
    aiShips,
    selectedShip,
    placedShipNames,
    winner,
    lastPlayerAttack,
    lastAiAttack,
    notification,
    isGodMode,
    getGameStatusTitle,
    isPlayerBoardActive,
    isEnemyBoardActive,
    handlePlayerCellClick,
    setHoveredCell,
    handleEnemyCellClick,
    handleShipSelect,
    handleAutoPlace,
    handleResetPlacement,
    handleStartGame,
    handlePlayAgain,
    toggleOrientation,
  };
};
