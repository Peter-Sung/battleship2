import React from 'react';
import { Ship, ShipType } from '../../core/types';

interface FleetStatusProps {
  allShipTypes: ShipType[];
  fleetShips: Ship[];
}

const FleetStatus: React.FC<FleetStatusProps> = ({ allShipTypes, fleetShips }) => {
  const renderShipStatus = (shipType: ShipType) => {
    const shipOnBoard = fleetShips.find(s => s.name === shipType.name);
    const isPlaced = !!shipOnBoard;
    const isSunk = isPlaced && shipOnBoard.hits === shipOnBoard.size;

    const textColor = isPlaced ? (isSunk ? 'text-gray-500' : 'text-gray-300') : 'text-gray-600';
    const lineThrough = isSunk ? 'line-through' : '';
    
    return (
      <div key={shipType.name} className="flex items-center gap-3">
        <div className="flex gap-px">
          {Array.from({ length: shipType.size }).map((_, i) => {
            let colorClass = 'bg-gray-700'; // Unplaced
            if (isPlaced) {
              colorClass = isSunk ? shipType.color.sunk : shipType.color.bg;
            }
            
            return (
              <div key={i} className={`w-5 h-5 ${colorClass} rounded-sm`} />
            );
          })}
        </div>
        <p className={`text-lg font-bold ${textColor} ${lineThrough}`}>
          {shipType.name}
        </p>
      </div>
    );
  };

  const carrier = allShipTypes.find(s => s.name === '항공모함');
  const secondRow = allShipTypes.filter(s => s.name === '전함' || s.name === '순양함').sort((a,b) => b.size - a.size);
  const thirdRow = allShipTypes.filter(s => s.name === '잠수함' || s.name === '구축함').sort((a,b) => b.size - a.size);

  return (
    <div className="flex flex-col items-center justify-center gap-3 mt-6 w-full max-w-lg">
       {carrier && (
        <div className="flex justify-center">
          {renderShipStatus(carrier)}
        </div>
      )}
      <div className="flex justify-center items-center gap-x-8">
        {secondRow.map(renderShipStatus)}
      </div>
      <div className="flex justify-center items-center gap-x-8">
        {thirdRow.map(renderShipStatus)}
      </div>
    </div>
  );
};

export default FleetStatus;