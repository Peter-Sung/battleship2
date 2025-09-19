import React, { useState } from 'react';
import Board from '../components/game/Board';
import ShipPlacement from '../components/game/ShipPlacement';
import FleetStatus from '../components/game/FleetStatus';
import Button from '../components/ui/Button';
import { SHIPS } from '../core/gameLogic';
import { useBattleship } from '../hooks/useBattleship';
import Modal from '../components/ui/Modal';
import HomeIcon from '../components/icons/HomeIcon';

interface GamePageProps {
  onGoHome: () => void;
}

const GamePage: React.FC<GamePageProps> = ({ onGoHome }) => {
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

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleGoHomeClick = () => {
    if (gameState === 'playing') {
      setIsConfirmModalOpen(true);
    } else {
      onGoHome();
    }
  };

  const handleConfirmGoHome = () => {
    setIsConfirmModalOpen(false);
    // Call the original onGoHome which resets the entire game state via App component
    onGoHome();
    // Also call handlePlayAgain to ensure this component's state is reset,
    // in case the user navigates back to the game page without a full app reload.
    handlePlayAgain();
  };

  const handleCancelGoHome = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* This container holds either the title or the notification, ensuring they occupy the same space */}
      <div className="w-full min-h-[56px] flex items-center justify-center relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <Button variant="secondary" size="small" onClick={handleGoHomeClick} className="flex items-center gap-2">
                <HomeIcon className="w-5 h-5" />
                홈으로
            </Button>
        </div>
        
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
      
      {gameState === 'placing' || gameState === 'ai_placing' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
          <div 
            className="flex flex-col items-center" 
            onContextMenu={(e) => {
              if (selectedShip && gameState === 'placing') {
                e.preventDefault();
                toggleOrientation();
              }
            }}
          >
            <h3 className="text-2xl font-bold text-white text-center mb-4">나의 함대</h3>
            <Board 
              grid={playerGrid} 
              onCellClick={gameState === 'placing' ? handlePlayerCellClick : () => {}} 
              onCellHover={gameState === 'placing' ? setHoveredCell : () => {}} 
            />
            <FleetStatus allShipTypes={SHIPS} fleetShips={playerShips} />
          </div>
          <div className="bg-gray-900/50 border-2 border-cyan-800 rounded-md shadow-lg p-6 flex flex-col items-center justify-center min-h-[420px]">
            {gameState === 'placing' ? (
              <ShipPlacement 
                ships={SHIPS} 
                selectedShip={selectedShip} 
                placedShipNames={placedShipNames} 
                onShipSelect={handleShipSelect} 
                onAutoPlace={handleAutoPlace} 
                onReset={handleResetPlacement}
                onStartGame={handleStartGame}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-2xl font-bold text-white mb-6">AI가 함선을 배치하고 있습니다...</h3>
                <div className="flex justify-center items-center space-x-2" aria-label="로딩 중">
                  <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                  <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
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

      <Modal 
        isOpen={isConfirmModalOpen} 
        onClose={handleCancelGoHome} 
        title="홈으로 돌아가시겠습니까?"
      >
        <p className="mb-6">진행중인 게임은 저장되지 않습니다.</p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleConfirmGoHome} variant="primary" size="medium">확인</Button>
          <Button onClick={handleCancelGoHome} variant="secondary" size="medium">취소</Button>
        </div>
      </Modal>
    </div>
  );
};

export default GamePage;