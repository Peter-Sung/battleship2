import React from 'react';
import Board from '../components/game/Board';
import ShipPlacement from '../components/game/ShipPlacement';
import FleetStatus from '../components/game/FleetStatus';
import Button from '../components/ui/Button';
import { SHIPS } from '../core/gameLogic';
import { useBattleship } from '../hooks/useBattleship';

const GamePage: React.FC = () => {
  const {
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
  } = useBattleship();

  return (
    <div className="flex flex-col items-center gap-8">
      {/* This container holds either the title or the notification, ensuring they occupy the same space */}
      <div className="w-full min-h-[56px] flex items-center justify-center">
        {notification ? (
          <div className="px-6 py-3 bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-500/50 rounded-lg shadow-lg shadow-cyan-400/30 z-50 animate-fadeInOut">
            <p className="text-2xl font-bold text-white whitespace-nowrap">
              <span>{notification.prefix}</span>
              <span className={notification.shipColor}>{notification.shipName}</span>
              <span>{notification.suffix}</span>
            </p>
          </div>
        ) : (
          <h2 className="text-4xl font-black text-cyan-300 tracking-widest uppercase text-center">
            {getGameStatusTitle()}
          </h2>
        )}
      </div>
      
      {gameState === 'placing' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
          <div 
            className="flex flex-col items-center" 
            onContextMenu={(e) => {
              if (selectedShip) {
                e.preventDefault();
                toggleOrientation();
              }
            }}
          >
            <h3 className="text-2xl font-bold text-white text-center mb-4">나의 함대</h3>
            <Board grid={playerGrid} onCellClick={handlePlayerCellClick} onCellHover={setHoveredCell} />
            <FleetStatus allShipTypes={SHIPS} fleetShips={playerShips} />
          </div>
          <div className="bg-gray-900/50 border-2 border-cyan-800 rounded-md shadow-lg p-6 flex flex-col items-center justify-center min-h-[420px]">
            <ShipPlacement 
              ships={SHIPS} 
              selectedShip={selectedShip} 
              placedShipNames={placedShipNames} 
              onShipSelect={handleShipSelect} 
              onAutoPlace={handleAutoPlace} 
              onReset={handleResetPlacement}
              onStartGame={handleStartGame}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-start justify-center gap-32 w-full max-w-7xl mt-4">
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white text-center mb-4">나의 함대</h3>
            <Board grid={playerGrid} onCellClick={() => {}} onCellHover={() => {}} isActive={isPlayerBoardActive} lastAttack={lastAiAttack} isFaintMode={gameState === 'playing'} />
            <FleetStatus allShipTypes={SHIPS} fleetShips={playerShips} />
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white text-center mb-4">AI의 함대</h3>
            <Board grid={enemyGrid} onCellClick={handleEnemyCellClick} onCellHover={() => {}} isEnemyBoard={true} isActive={isEnemyBoardActive} lastAttack={lastPlayerAttack} showHiddenShips={isGodMode} />
            <FleetStatus allShipTypes={SHIPS} fleetShips={aiShips} />
          </div>
        </div>
      )}
       {gameState === 'over' && (
        <div className="mt-4">
          <Button variant="primary" size="large" onClick={handlePlayAgain}>
            다시하기
          </Button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
