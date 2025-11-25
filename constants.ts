import { Piece, PieceType, Color, Position } from './types';

export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 10;

// Helper to create initial pieces
const createPiece = (type: PieceType, color: Color, x: number, y: number): [string, Piece] => {
  return [`${x},${y}`, { type, color, id: `${color}-${type}-${x}-${y}` }];
};

export const INITIAL_BOARD_SETUP = (): Map<string, Piece> => {
  const pieces = new Map<string, Piece>();
  const add = (type: PieceType, color: Color, x: number, y: number) => {
    const [key, piece] = createPiece(type, color, x, y);
    pieces.set(key, piece);
  };

  // Black Pieces (Top, y=0 to 4)
  add('chariot', 'black', 0, 0); add('chariot', 'black', 8, 0);
  add('horse', 'black', 1, 0); add('horse', 'black', 7, 0);
  add('elephant', 'black', 2, 0); add('elephant', 'black', 6, 0);
  add('advisor', 'black', 3, 0); add('advisor', 'black', 5, 0);
  add('general', 'black', 4, 0);
  add('cannon', 'black', 1, 2); add('cannon', 'black', 7, 2);
  add('soldier', 'black', 0, 3); add('soldier', 'black', 2, 3);
  add('soldier', 'black', 4, 3); add('soldier', 'black', 6, 3); add('soldier', 'black', 8, 3);

  // Red Pieces (Bottom, y=5 to 9)
  add('chariot', 'red', 0, 9); add('chariot', 'red', 8, 9);
  add('horse', 'red', 1, 9); add('horse', 'red', 7, 9);
  add('elephant', 'red', 2, 9); add('elephant', 'red', 6, 9);
  add('advisor', 'red', 3, 9); add('advisor', 'red', 5, 9);
  add('general', 'red', 4, 9);
  add('cannon', 'red', 1, 7); add('cannon', 'red', 7, 7);
  add('soldier', 'red', 0, 6); add('soldier', 'red', 2, 6);
  add('soldier', 'red', 4, 6); add('soldier', 'red', 6, 6); add('soldier', 'red', 8, 6);

  return pieces;
};

export const PIECE_LABELS: Record<string, string> = {
  'red-general': '帅', 'black-general': '将',
  'red-advisor': '仕', 'black-advisor': '士',
  'red-elephant': '相', 'black-elephant': '象',
  'red-horse': '马', 'black-horse': '马',
  'red-chariot': '车', 'black-chariot': '车',
  'red-cannon': '炮', 'black-cannon': '炮',
  'red-soldier': '兵', 'black-soldier': '卒',
};
