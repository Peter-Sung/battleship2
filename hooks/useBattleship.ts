import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { SHIPS, isPlacementValid, placeAiShips, placeShipsRandomly, checkAttack, generateGridFromState } from '../core/gameLogic';
import { Ship, ShipType, Orientation, ShipColor, GridCell } from '../core/types';

const INVALID_COLOR: ShipColor = { bg: 'bg-red-500/70', border: 'border-red-400', sunk: 'bg-red-800/70', text: 'text-red-400' };

// Helper function for AI logic: Calculates potential next targets based on current hits.
const calculatePotentialTargets = (
  hits: Array<{ row: number; col: number }>,
  attacks: Record<string, 'hit' | 'miss'>
): Array<{ row: number; col: number }> => {
  const potentialTargets: { row: number; col: number }[] = [];
  const attacked = new Set(Object.keys(attacks));

  const addTarget = (r: number, c: number) => {
    if (r >= 0 && r < 10 && c >= 0 && c < 10 && !attacked.has(`${r}-${c}`)) {
      if (!potentialTargets.some(p => p.row === r && p.col === c)) {
        potentialTargets.push({ row: r, col: c });
      }
    }
  };

  if (hits.length === 1) {
    // First hit. Add neighbors.
    const { row, col } = hits[0];
    addTarget(row + 1, col);
    addTarget(row - 1, col);
    addTarget(row, col + 1);
    addTarget(row, col - 1);
  } else {
    // Second or later hit. Determine orientation and attack along the line.
    const isVertical = hits.length > 1 && hits[0].col === hits[1].col;
    let minRow = 10, maxRow = -1, minCol = 10, maxCol = -1;

    for (const hit of hits) {
      minRow = Math.min(minRow, hit.row);
      maxRow = Math.max(maxRow, hit.row);
      minCol = Math.min(minCol, hit.col);
      maxCol = Math.max(maxCol, hit.col);
    }
    
    if (isVertical) {
      addTarget(minRow - 1, hits[0].col);
      addTarget(maxRow + 1, hits[0].col);
    } else { // Horizontal
      addTarget(hits[0].row, minCol - 1);
      addTarget(hits[0].row, maxCol + 1);
    }
  }
  // Randomize to make the AI less predictable
  return potentialTargets.sort(() => Math.random() - 0.5);
};


export const useBattleship = () => {
  const [gameState, setGameState] = useState<'placing' | 'playing' | 'over'>('placing');
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [selectedShip, setSelectedShip] = useState<ShipType | null>(null);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  
  const [aiShips, setAiShips] = useState<Ship[]>([]);
  const [enemyGridAttacks, setEnemyGridAttacks] = useState<Record<string, 'hit' | 'miss'>>({});
  const [playerGridAttacks, setPlayerGridAttacks] = useState<Record<string, 'hit' | 'miss'>>({});

  interface AiState {
    mode: 'hunt' | 'target';
    hitStreak: Array<{ row: number; col: number }>;
    potentialTargets: Array<{ row: number; col: number }>;
  }
  const [aiState, setAiState] = useState<AiState>({
    mode: 'hunt',
    hitStreak: [],
    potentialTargets: [],
  });
  
  const [currentTurn, setCurrentTurn] = useState<'player' | 'ai'>('player');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  const [isGodMode, setIsGodMode] = useState(false);
  const [lastPlayerAttack, setLastPlayerAttack] = useState<{ row: number; col: number } | null>(null);
  const [lastAiAttack, setLastAiAttack] = useState<{ row: number; col: number } | null>(null);
  const [notification, setNotification] = useState<{ prefix: string; shipName: string; suffix: string; shipColor: string; } | null>(null);

  const placedShipNames = useMemo(() => playerShips.map(s => s.name), [playerShips]);
  const allShipsPlaced = playerShips.length === SHIPS.length;

  // --- Sound Effects (Temporarily Disabled) ---
  // const soundsRef = useRef<{ [key in 'hit' | 'miss' | 'sunk']?: HTMLAudioElement }>({});
  
  // useEffect(() => {
  //   // This check ensures Audio and window are defined, preventing server-side rendering errors.
  //   if (typeof window !== "undefined" && typeof Audio !== "undefined") {
  //     // Construct the full, absolute URL for audio files. This is the most robust way to handle
  //     // assets in sandboxed environments like AI Studio, preventing CORS or path resolution errors.
  //     const baseUrl = window.location.origin;
      
  //     soundsRef.current = {
  //       hit: new Audio(`${baseUrl}/explosion.mp3`),
  //       miss: new Audio(`${baseUrl}/select.mp3`),
  //       sunk: new Audio(`${baseUrl}/water_bubble.mp3`),
  //     };
      
  //     Object.entries(soundsRef.current).forEach(([name, audio]) => {
  //       if (audio) {
  //         audio.load(); // Preload audio
  //         audio.addEventListener('error', (e) => {
  //           console.error(`Error loading audio file for "${name}":`, e);
  //         });
  //       }
  //     });
  //   }
  // }, []);

  // const playSound = useCallback((sound: 'hit' | 'miss' | 'sunk') => {
  //   const audio = soundsRef.current[sound];
  //   if (audio && audio.src) {
  //     // Cloning the node is a robust way to play sounds in rapid succession
  //     // without interrupting the previous sound.
  //     const soundToPlay = audio.cloneNode() as HTMLAudioElement;
  //     soundToPlay.play().catch(error => {
  //       console.error(`Error playing sound "${sound}" (src: ${soundToPlay.src}):`, error);
  //     });
  //   } else {
  //     console.warn(`Sound effect "${sound}" is not initialized or has no source.`);
  //   }
  // }, []);


  // Effect to clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Effect to check for a winner whenever ships are damaged
  useEffect(() => {
    if (gameState !== 'playing' || winner) return;

    const allPlayerShipsSunk = playerShips.length > 0 && playerShips.every(ship => ship.hits === ship.size);
    if (allPlayerShipsSunk) {
      setWinner('ai');
      setGameState('over');
      return;
    }

    const allAiShipsSunk = aiShips.length > 0 && aiShips.every(ship => ship.hits === ship.size);
    if (allAiShipsSunk) {
      setWinner('player');
      setGameState('over');
    }
  }, [playerShips, aiShips, gameState, winner]);
  
  // Effect to listen for God Mode toggle (Easter Egg)
  useEffect(() => {
    const toggleGodMode = () => setIsGodMode(prev => !prev);
    window.addEventListener('toggleGodMode', toggleGodMode);
    return () => {
      window.removeEventListener('toggleGodMode', toggleGodMode);
    };
  }, []);

  // AI Turn Logic
  useEffect(() => {
    if (gameState === 'playing' && currentTurn === 'ai' && !winner) {
      const timeoutId = setTimeout(() => {
        let attackPos: { row: number; col: number } | undefined;

        // 1. DETERMINE ATTACK POSITION
        if (aiState.mode === 'target' && aiState.potentialTargets.length > 0) {
          attackPos = aiState.potentialTargets[0]; // Take the next target
        } else {
          // HUNT MODE: Find a smart cell to attack
          const availableCells = [];
          // First, try checkerboard pattern
          for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
              if ((r + c) % 2 === 0 && !playerGridAttacks[`${r}-${c}`]) {
                availableCells.push({ row: r, col: c });
              }
            }
          }

          if (availableCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            attackPos = availableCells[randomIndex];
          } else {
            // If checkerboard is full, attack remaining cells
            const remainingCells = [];
            for (let r = 0; r < 10; r++) {
              for (let c = 0; c < 10; c++) {
                if (!playerGridAttacks[`${r}-${c}`]) {
                  remainingCells.push({ row: r, col: c });
                }
              }
            }
            if (remainingCells.length > 0) {
              const randomIndex = Math.floor(Math.random() * remainingCells.length);
              attackPos = remainingCells[randomIndex];
            }
          }
        }

        if (!attackPos) {
          setCurrentTurn('player');
          return;
        }
        
        const { row, col } = attackPos;
        const key = `${row}-${col}`;
        
        // 2. EXECUTE ATTACK
        const { hitShip } = checkAttack(playerShips, row, col);
        const wasHit = !!hitShip;

        setLastAiAttack({ row, col });
        setPlayerGridAttacks(prev => ({ ...prev, [key]: wasHit ? 'hit' : 'miss' }));

        // 3. UPDATE STATE BASED ON RESULT
        if (wasHit) {
          const shipIsSunk = hitShip.hits + 1 === hitShip.size;
          
          setPlayerShips(prevShips =>
            prevShips.map(s =>
              s.name === hitShip.name ? { ...s, hits: s.hits + 1 } : s
            )
          );

          if (shipIsSunk) {
            // playSound('sunk');
            setNotification({
              prefix: "나의 '",
              shipName: hitShip.name,
              suffix: "'이 침몰하였습니다!",
              shipColor: hitShip.color.text,
            });
            setAiState({ mode: 'hunt', hitStreak: [], potentialTargets: [] });
          } else {
            // playSound('hit');
            const newHitStreak = [...aiState.hitStreak, { row, col }];
            // Fix: Explicitly type `newAttacks` to match the expected type for `calculatePotentialTargets`.
            const newAttacks: Record<string, 'hit' | 'miss'> = {...playerGridAttacks, [key]: 'hit'};
            const newTargets = calculatePotentialTargets(newHitStreak, newAttacks);
            
            setAiState({
              mode: 'target',
              hitStreak: newHitStreak,
              potentialTargets: newTargets,
            });
          }
        } else {
          // playSound('miss');
          setAiState(prev => ({
            ...prev,
            potentialTargets: prev.potentialTargets.filter(p => p.row !== row || p.col !== col)
          }))
          setCurrentTurn('player');
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState, currentTurn, winner, playerGridAttacks, playerShips, aiState]);


  const toggleOrientation = useCallback(() => {
    setOrientation(prev => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  }, []);

  // Keyboard listener for rotating ships
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'r' || e.key === 'R') && selectedShip && gameState === 'placing') {
        toggleOrientation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShip, gameState, toggleOrientation]);

  const playerGrid = useMemo((): GridCell[][] => {
    const grid = generateGridFromState(playerShips, playerGridAttacks);

    if (gameState === 'placing' && selectedShip && hoveredCell) {
        const { row, col } = hoveredCell;
        const isValid = isPlacementValid(selectedShip, row, col, orientation, playerShips);
        const previewColor = isValid ? selectedShip.color : INVALID_COLOR;
        for (let i = 0; i < selectedShip.size; i++) {
            const r = orientation === 'vertical' ? row + i : row;
            const c = orientation === 'horizontal' ? col + i : col;
            if (r < 10 && c < 10 && grid[r][c].state === 'empty') {
                grid[r][c] = { state: 'preview', color: previewColor };
            }
        }
    }
    return grid;
  }, [playerShips, playerGridAttacks, selectedShip, hoveredCell, orientation, gameState]);

  const enemyGrid = useMemo((): GridCell[][] => {
    return generateGridFromState(aiShips, enemyGridAttacks);
  }, [aiShips, enemyGridAttacks]);

  const handlePlayerCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'placing') return;

    if (selectedShip) {
        if (isPlacementValid(selectedShip, row, col, orientation, playerShips)) {
            const newShip: Ship = { ...selectedShip, row, col, orientation, hits: 0 };
            setPlayerShips(prevShips => [...prevShips, newShip]);
            setSelectedShip(null);
        }
    } else {
        const clickedShipIndex = playerShips.findIndex(ship => {
            for (let i = 0; i < ship.size; i++) {
                const r = ship.orientation === 'vertical' ? ship.row + i : ship.row;
                const c = ship.orientation === 'horizontal' ? ship.col + i : ship.col;
                if (r === row && c === col) return true;
            }
            return false;
        });

        if (clickedShipIndex > -1) {
            const shipToReplace = playerShips[clickedShipIndex];
            const otherShips = playerShips.filter((_, index) => index !== clickedShipIndex);
            const [newlyPlacedShip] = placeShipsRandomly([shipToReplace], otherShips);

            if(newlyPlacedShip) {
                setPlayerShips([...otherShips, newlyPlacedShip]);
            }
        }
    }
  }, [selectedShip, orientation, playerShips, gameState]);

  const handleEnemyCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing' || currentTurn !== 'player' || winner) return;
    const key = `${row}-${col}`;
    if (enemyGridAttacks[key]) return;

    setLastPlayerAttack({ row, col });

    const { hitShip } = checkAttack(aiShips, row, col);
    const wasHit = !!hitShip;

    setEnemyGridAttacks(prev => ({ ...prev, [key]: wasHit ? 'hit' : 'miss' }));

    if (hitShip) {
        const newHits = hitShip.hits + 1;
        const isSunk = newHits === hitShip.size;
        
        if (isSunk) {
          // playSound('sunk');
          setNotification({
            prefix: "AI의 '",
            shipName: hitShip.name,
            suffix: "'이 침몰하였습니다.",
            shipColor: hitShip.color.text,
          });
        } else {
            // playSound('hit');
        }

        setAiShips(prevShips => 
            prevShips.map(s => 
                s.name === hitShip.name ? { ...s, hits: newHits } : s
            )
        );
    } else {
        // playSound('miss');
        setCurrentTurn('ai');
    }
  }, [gameState, currentTurn, winner, enemyGridAttacks, aiShips]);

  const handleShipSelect = useCallback((ship: ShipType) => {
    if (placedShipNames.includes(ship.name) || gameState !== 'placing') return;
    setSelectedShip(prev => (prev?.name === ship.name ? null : ship));
  }, [placedShipNames, gameState]);

  const handleResetPlacement = useCallback(() => {
    if (gameState !== 'placing') return;
    setPlayerShips([]);
    setSelectedShip(null);
  }, [gameState]);

  const handleAutoPlace = useCallback(() => {
    if (gameState !== 'placing') return;
    if (allShipsPlaced) {
      const newShips = placeShipsRandomly(SHIPS, []);
      setPlayerShips(newShips);
    } else {
      const shipsToPlace = SHIPS.filter(s => !placedShipNames.includes(s.name));
      const newShips = placeShipsRandomly(shipsToPlace, playerShips);
      setPlayerShips(prev => [...prev, ...newShips]);
    }
    setSelectedShip(null);
  }, [playerShips, placedShipNames, allShipsPlaced, gameState]);
  
  const handleStartGame = useCallback(() => {
    if (allShipsPlaced && gameState === 'placing') {
      setGameState('playing');
      setAiShips(placeAiShips());
      setAiState({ mode: 'hunt', hitStreak: [], potentialTargets: [] });
    }
  }, [allShipsPlaced, gameState]);
  
  const handlePlayAgain = useCallback(() => {
    setGameState('placing');
    setPlayerShips([]);
    setSelectedShip(null);
    setOrientation('horizontal');
    setHoveredCell(null);
    setAiShips([]);
    setEnemyGridAttacks({});
    setPlayerGridAttacks({});
    setCurrentTurn('player');
    setWinner(null);
    setLastPlayerAttack(null);
    setLastAiAttack(null);
    setNotification(null);
    setAiState({ mode: 'hunt', hitStreak: [], potentialTargets: [] });
    setIsGodMode(false);
  }, []);

  const getGameStatusTitle = useCallback(() => {
    if (gameState === 'over' && winner) {
      return winner === 'player' ? "당신이 승리했습니다! 🎉" : "AI가 승리했습니다! 😭";
    }
    if (gameState === 'placing') {
      return '나의 함선을 배치하세요';
    }
    return currentTurn === 'player' ? 'AI의 함대를 공격하세요.' : 'AI가 조준하고 있습니다.';
  }, [gameState, winner, currentTurn]);

  const isPlayerBoardActive = gameState === 'playing' && currentTurn === 'ai' && !winner;
  const isEnemyBoardActive = gameState === 'playing' && currentTurn === 'player' && !winner;

  return {
    gameState,
    playerGrid,
    enemyGrid,
    playerShips,
    aiShips,
    selectedShip,
    placedShipNames,
    allShipsPlaced,
    winner,
    currentTurn,
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