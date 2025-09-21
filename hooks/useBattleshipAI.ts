import { useState, useCallback } from 'react';
import { Ship } from '../core/types';

type AiMode = 'hunt' | 'target';
type Direction = 'unknown' | 'horizontal' | 'vertical';

interface TargetInfo {
  firstHit: { row: number; col: number };
  hits: { row: number; col: number }[];
  direction: Direction;
}

const initialTargetInfo: TargetInfo = {
  firstHit: { row: -1, col: -1 },
  hits: [],
  direction: 'unknown',
};

export const useBattleshipAI = () => {
  const [mode, setMode] = useState<AiMode>('hunt');
  const [target, setTarget] = useState<TargetInfo>(initialTargetInfo);

  const resetAi = useCallback(() => {
    setMode('hunt');
    setTarget(initialTargetInfo);
  }, []);

  const calculateNextAttack = useCallback((attackedCoords: Set<string>): { row: number, col: number } => {
    let row = -1, col = -1;
    let attackIsValid = false;
    let attempts = 0;

    while (!attackIsValid && attempts < 100) {
      if (mode === 'hunt' || target.hits.length === 0) {
        // 탐색 모드: 랜덤 공격
        row = Math.floor(Math.random() * 10);
        col = Math.floor(Math.random() * 10);
      } else {
        // 추적 모드
        const potentialTargets: { row: number, col: number }[] = [];
        
        if (target.direction === 'unknown') {
          // 첫 히트 후 주변 4방향 탐색
          const { row: r, col: c } = target.firstHit;
          potentialTargets.push({ row: r - 1, col: c }, { row: r + 1, col: c }, { row: r, col: c - 1 }, { row: r, col: c + 1 });
        } else {
          // 방향 확정 후, 해당 방향으로 계속 공격
          const firstHit = target.firstHit;
          const hitsSorted = [...target.hits].sort((a, b) => target.direction === 'vertical' ? a.row - b.row : a.col - b.col);
          const minHit = hitsSorted[0];
          const maxHit = hitsSorted[hitsSorted.length - 1];
          
          if (target.direction === 'vertical') {
            potentialTargets.push({ row: minHit.row - 1, col: minHit.col });
            potentialTargets.push({ row: maxHit.row + 1, col: maxHit.col });
          } else { // horizontal
            potentialTargets.push({ row: minHit.row, col: minHit.col - 1 });
            potentialTargets.push({ row: maxHit.row, col: maxHit.col + 1 });
          }
        }

        const validTargets = potentialTargets.filter(
          t => t.row >= 0 && t.row < 10 && t.col >= 0 && t.col < 10 && !attackedCoords.has(`${t.row}-${t.col}`)
        );

        if (validTargets.length > 0) {
          const nextTarget = validTargets[Math.floor(Math.random() * validTargets.length)];
          row = nextTarget.row;
          col = nextTarget.col;
        } else {
          // 추적할 곳이 없으면(막다른 길) 다시 탐색 모드로 임시 전환
          row = Math.floor(Math.random() * 10);
          col = Math.floor(Math.random() * 10);
        }
      }

      if (!attackedCoords.has(`${row}-${col}`)) {
        attackIsValid = true;
      }
      attempts++;
    }
    // 100번 시도 후에도 유효한 좌표를 찾지 못했다면, 비어있는 랜덤 좌표를 찾는다.
    if (!attackIsValid) {
        let r, c;
        do {
            r = Math.floor(Math.random() * 10);
            c = Math.floor(Math.random() * 10);
        } while (attackedCoords.has(`${r}-${c}`))
        return { row: r, col: c };
    }


    return { row, col };
  }, [mode, target,]);

  const updateAiStrategy = useCallback((wasHit: boolean, hitShip: Ship | null, attackCoords: { row: number, col: number }) => {
    if (wasHit && hitShip) {
      const isSunk = hitShip.hits === hitShip.size;
      
      if (isSunk) {
        // 침몰 시, 탐색 모드로 전환
        resetAi();
      } else {
        // 명중했지만 침몰은 아닐 때
        setMode('target');
        setTarget(prev => {
          const newHits = [...prev.hits, attackCoords];
          let newDirection = prev.direction;

          if (newHits.length === 1) { // 첫 히트
            return { firstHit: attackCoords, hits: newHits, direction: 'unknown' };
          }
          
          if (newHits.length > 1 && newDirection === 'unknown') {
            const first = newHits[0];
            const second = newHits[1];
            if (first.row === second.row) newDirection = 'horizontal';
            else if (first.col === second.col) newDirection = 'vertical';
          }
          return { ...prev, hits: newHits, direction: newDirection };
        });
      }
    }
    // 빗나갔을 때는 모드 변경 없음 (추적 중 빗나갈 수 있으므로)
  }, [resetAi]);

  return { calculateNextAttack, updateAiStrategy, resetAi };
};