import { Piece, Position, Color } from '../types';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants';

export const toKey = (pos: Position) => `${pos.x},${pos.y}`;
export const fromKey = (key: string): Position => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
};

const isWithinBoard = (x: number, y: number) => x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;

const getPieceAt = (pieces: Map<string, Piece>, x: number, y: number) => pieces.get(toKey({ x, y }));

export const isValidMove = (
  from: Position,
  to: Position,
  pieces: Map<string, Piece>,
  turn: Color
): boolean => {
  const piece = getPieceAt(pieces, from.x, from.y);
  if (!piece || piece.color !== turn) return false;

  // Cannot capture own piece
  const target = getPieceAt(pieces, to.x, to.y);
  if (target && target.color === turn) return false;

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  if (!isWithinBoard(to.x, to.y)) return false;
  if (dx === 0 && dy === 0) return false;

  switch (piece.type) {
    case 'general':
      // Move 1 step orthogonal
      if (adx + ady !== 1) return false;
      // Confined to palace
      if (to.x < 3 || to.x > 5) return false;
      if (piece.color === 'red') {
        if (to.y < 7) return false;
      } else {
        if (to.y > 2) return false;
      }
      // Note: Flying general check is complex (needs full board scan), skipping for basic validation but AI will know.
      return true;

    case 'advisor':
      // Diagonal 1 step
      if (adx !== 1 || ady !== 1) return false;
      // Confined to palace
      if (to.x < 3 || to.x > 5) return false;
      if (piece.color === 'red') {
        if (to.y < 7) return false;
      } else {
        if (to.y > 2) return false;
      }
      return true;

    case 'elephant':
      // Diagonal 2 steps
      if (adx !== 2 || ady !== 2) return false;
      // Cannot cross river
      if (piece.color === 'red' && to.y < 5) return false;
      if (piece.color === 'black' && to.y > 4) return false;
      // Check eye (blockage)
      const eyeX = from.x + dx / 2;
      const eyeY = from.y + dy / 2;
      if (getPieceAt(pieces, eyeX, eyeY)) return false;
      return true;

    case 'horse':
      // L shape
      if (!((adx === 1 && ady === 2) || (adx === 2 && ady === 1))) return false;
      // Check hobble (leg)
      if (ady === 2) {
        // Vertical move dominant, check vertically adjacent
        if (getPieceAt(pieces, from.x, from.y + (dy > 0 ? 1 : -1))) return false;
      } else {
        // Horizontal move dominant
        if (getPieceAt(pieces, from.x + (dx > 0 ? 1 : -1), from.y)) return false;
      }
      return true;

    case 'chariot':
      if (dx !== 0 && dy !== 0) return false; // Must be orthogonal
      return isPathClear(from, to, pieces);

    case 'cannon':
      if (dx !== 0 && dy !== 0) return false;
      const piecesBetween = countPiecesBetween(from, to, pieces);
      if (target) {
        // Capture: must jump exactly one
        return piecesBetween === 1;
      } else {
        // Move: must be clear
        return piecesBetween === 0;
      }

    case 'soldier':
      // Move forward 1
      const forward = piece.color === 'red' ? -1 : 1;
      
      // Before river, only forward
      const crossedRiver = piece.color === 'red' ? from.y <= 4 : from.y >= 5;

      if (!crossedRiver) {
        if (dx !== 0) return false;
        if (dy !== forward) return false;
      } else {
        // After river, forward or side
        if (dy === forward && dx === 0) return true; // Forward
        if (dy === 0 && adx === 1) return true; // Side
        return false;
      }
      return true;
  }

  return false;
};

// Helper for linear pieces (Chariot, Cannon)
const countPiecesBetween = (from: Position, to: Position, pieces: Map<string, Piece>): number => {
  let count = 0;
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  let curX = from.x + dx;
  let curY = from.y + dy;

  while (curX !== to.x || curY !== to.y) {
    if (getPieceAt(pieces, curX, curY)) count++;
    curX += dx;
    curY += dy;
  }
  return count;
};

const isPathClear = (from: Position, to: Position, pieces: Map<string, Piece>): boolean => {
  return countPiecesBetween(from, to, pieces) === 0;
};

/**
 * Calculates the CSS left/top percentage for a piece or hit area.
 * Based on Board SVG ViewBox:
 * Width: 110 units (Grid 100 + 10 padding)
 * Height: 122.5 units (Grid 112.5 + 10 padding)
 * Grid Step: 12.5 units
 * Origin Offset: 5 units (Padding)
 */
export const getBoardPercentage = (x: number, y: number) => {
  const xPct = ((x * 12.5 + 5) / 110) * 100;
  const yPct = ((y * 12.5 + 5) / 122.5) * 100;
  return { left: `${xPct}%`, top: `${yPct}%` };
};
