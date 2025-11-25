export type Color = 'red' | 'black';

export type PieceType = 'general' | 'advisor' | 'elephant' | 'horse' | 'chariot' | 'cannon' | 'soldier';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: PieceType;
  color: Color;
  id: string; // Unique ID for React keys
}

export interface BoardState {
  pieces: Map<string, Piece>; // Key is "x,y" string
  turn: Color;
  selectedPos: Position | null;
  lastMove: { from: Position; to: Position } | null;
  winner: Color | null;
  history: string[];
}

export enum GameMode {
  LOCAL_PVP = 'LOCAL_PVP',
  VS_AI = 'VS_AI'
}
