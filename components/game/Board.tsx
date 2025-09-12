import React from 'react';
import Cell from './Cell';
import { GridCell } from '../../core/types';

interface BoardProps {
  grid: GridCell[][];
  onCellClick: (row: number, col: number) => void;
  onCellHover: (pos: { row: number; col: number } | null) => void;
  isEnemyBoard?: boolean;
  isActive?: boolean;
  lastAttack?: { row: number; col: number } | null;
  isFaintMode?: boolean;
  showHiddenShips?: boolean;
}

const Board: React.FC<BoardProps> = ({ grid, onCellClick, onCellHover, isEnemyBoard = false, isActive = false, lastAttack = null, isFaintMode = false, showHiddenShips = false }) => {
  const baseClasses = 'inline-grid grid-cols-10 p-2 bg-gray-900/50 rounded-md transition-all duration-500 ease-in-out gap-px border border-cyan-700/40';
  const activeClasses = isActive ? 'scale-105 shadow-2xl shadow-cyan-300/70' : 'shadow-lg shadow-cyan-500/10';

  return (
    <div 
      className={`${baseClasses} ${activeClasses}`}
      onMouseLeave={() => onCellHover(null)}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isLastAttack = !!lastAttack && lastAttack.row === rowIndex && lastAttack.col === colIndex;
          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              state={cell.state}
              color={cell.color}
              onClick={() => onCellClick(rowIndex, colIndex)}
              onMouseEnter={() => !isEnemyBoard && onCellHover({ row: rowIndex, col: colIndex })}
              onMouseLeave={() => {}} // Handled by parent div's onMouseLeave
              isEnemyBoard={isEnemyBoard}
              isLastAttack={isLastAttack}
              isFaintMode={isFaintMode}
              showHiddenShips={showHiddenShips}
            />
          )
        })
      )}
    </div>
  );
};

export default Board;
