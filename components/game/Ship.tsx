import React from 'react';
import { ShipType } from '../../core/types';

interface ShipProps {
  ship: ShipType;
  isSelected: boolean;
  isPlaced: boolean;
  onClick: () => void;
}

const Ship: React.FC<ShipProps> = ({ ship, isSelected, isPlaced, onClick }) => {
  const cells = Array(ship.size).fill(0);

  const baseCellClasses = 'w-8 h-8 md:w-10 md:h-10 flex-shrink-0';
  const stateClasses = isPlaced
    ? 'bg-gray-600 opacity-70'
    : isSelected
    ? `${ship.color.bg} opacity-100`
    : `${ship.color.bg} opacity-50 hover:opacity-80`;

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-md transition-all ${isSelected ? 'bg-cyan-900/70' : ''} ${!isPlaced ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
      onClick={!isPlaced ? onClick : undefined}
      aria-disabled={isPlaced}
    >
      <div className="flex flex-row gap-0.5">
        {cells.map((_, index) => (
          <div key={index} className={`${baseCellClasses} ${stateClasses}`} />
        ))}
      </div>
      <div className={`text-lg font-bold ${isPlaced ? 'text-gray-500 line-through' : 'text-cyan-300'}`}>
        {ship.name} ({ship.size})
      </div>
    </div>
  );
};

export default Ship;