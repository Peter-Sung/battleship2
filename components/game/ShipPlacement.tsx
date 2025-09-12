
import React from 'react';
import { ShipType } from '../../core/types';
import Ship from './Ship';
import Button from '../ui/Button';

interface ShipPlacementProps {
  ships: ShipType[];
  selectedShip: ShipType | null;
  placedShipNames: string[];
  onShipSelect: (ship: ShipType) => void;
  onAutoPlace: () => void;
  onReset: () => void;
  onStartGame: () => void;
}

const ShipPlacement: React.FC<ShipPlacementProps> = ({
  ships,
  selectedShip,
  placedShipNames,
  onShipSelect,
  onAutoPlace,
  onReset,
  onStartGame,
}) => {
  const allShipsPlaced = placedShipNames.length === ships.length;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <h3 className="text-2xl font-bold text-white text-center">나의 함선</h3>
      <div className="space-y-4">
        {ships.map((ship) => (
          <Ship
            key={ship.name}
            ship={ship}
            isSelected={selectedShip?.name === ship.name}
            isPlaced={placedShipNames.includes(ship.name)}
            onClick={() => onShipSelect(ship)}
          />
        ))}
      </div>
      <div className="flex flex-col gap-4 mt-4 w-full max-w-xs">
        <div className="flex gap-4">
          <Button onClick={onAutoPlace} variant="secondary" size="medium" className="flex-1">
            자동 배치
          </Button>
          <Button onClick={onReset} variant="secondary" size="medium" className="flex-1">
            초기화
          </Button>
        </div>
        <Button onClick={onStartGame} variant="primary" size="large" disabled={!allShipsPlaced}>
          게임 시작
        </Button>
      </div>
      <p className="text-base text-center text-cyan-400 mt-2 leading-relaxed">
        함선을 선택하여 나의 함대에 배치하세요.
        <br />
        <span className="font-bold text-cyan-200">[R]키</span> 또는 <span className="font-bold text-cyan-200">마우스 우클릭</span>으로 회전할 수 있습니다.
      </p>
    </div>
  );
};

export default ShipPlacement;