import React from 'react';
import { ShipColor } from '../../core/types';

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk' | 'preview';

interface CellProps {
  state: CellState;
  color?: ShipColor;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isEnemyBoard?: boolean;
  isLastAttack?: boolean;
  isFaintMode?: boolean;
  showHiddenShips?: boolean;
}

const Cell: React.FC<CellProps> = ({ state, color, onClick, onMouseEnter, onMouseLeave, isEnemyBoard = false, isLastAttack = false, isFaintMode = false, showHiddenShips = false }) => {
  const baseClasses =
    'w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300';

  const lastAttackClasses = isLastAttack && (state === 'hit' || state === 'sunk') ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-red-500' : '';

  const getStateClasses = (): string => {
    // For AI board: Faintly show un-hit ships in "god mode"
    if (isEnemyBoard && state === 'ship' && color) {
      return showHiddenShips
        ? `${color.bg} opacity-30 cursor-pointer`
        : 'bg-cyan-900/40 hover:bg-cyan-700/40 cursor-pointer';
    }

    // For Player board in playing mode: Faintly show un-hit ships
    if (isFaintMode && state === 'ship' && color) {
      return `${color.bg} opacity-30`;
    }

    if (state === 'ship' || state === 'preview') {
      return color ? `${color.bg}` : 'bg-gray-500';
    }
    if (state === 'hit') {
      return color ? `${color.bg} cursor-default` : 'bg-red-500/70 cursor-default';
    }
    if (state === 'sunk') {
      return color ? `${color.sunk} cursor-default` : 'bg-red-800/80 cursor-default';
    }
    
    const stateClasses: { [key in CellState]: string } = {
      empty: 'bg-cyan-900/40 hover:bg-cyan-700/40 cursor-pointer',
      ship: 'bg-gray-500 cursor-default', // Fallback
      hit: 'bg-red-500/70 cursor-default', // Fallback
      miss: 'bg-cyan-900/20 cursor-default',
      sunk: 'bg-red-800/80 cursor-default', // Fallback
      preview: 'bg-cyan-500/50 cursor-pointer', // Fallback
    };
    return stateClasses[state];
  }

  const renderContent = () => {
    switch (state) {
      case 'miss':
        return <span className={`text-xl font-black ${isLastAttack ? 'text-red-500' : 'text-gray-400'}`}>X</span>;
      default:
        return null;
    }
  };
  
  const isDisabled = (!isEnemyBoard && (state === 'hit' || state === 'miss' || state === 'sunk' || state === 'ship'));

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`${baseClasses} ${getStateClasses()} ${lastAttackClasses}`}
      aria-label={`Cell state: ${state}`}
      disabled={isDisabled}
    >
      {renderContent()}
    </button>
  );
};

export default Cell;
