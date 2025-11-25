import React from 'react';
import { Piece as PieceType, Position } from '../types';
import { PIECE_LABELS } from '../constants';
import { getBoardPercentage } from '../utils/gameLogic';

interface PieceProps {
  piece: PieceType;
  position: Position;
  isSelected: boolean;
  isLastMoveSource: boolean;
  isLastMoveDest: boolean;
  onClick: () => void;
}

export const PieceComponent: React.FC<PieceProps> = ({ 
  piece, 
  position, 
  isSelected, 
  isLastMoveSource,
  isLastMoveDest,
  onClick 
}) => {
  const isRed = piece.color === 'red';
  const labelKey = `${piece.color}-${piece.type}`;
  const label = PIECE_LABELS[labelKey] || '?';

  const { left, top } = getBoardPercentage(position.x, position.y);

  const style: React.CSSProperties = {
    left,
    top,
    width: '44px',
    height: '44px',
    transform: 'translate(-50%, -50%)', // Center piece exactly on the point
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`
        absolute rounded-full flex items-center justify-center cursor-pointer shadow-md select-none border-2
        ${isRed ? 'bg-[#f5e6d3] text-[#d63031] border-[#d63031]' : 'bg-[#f5e6d3] text-[#2d3436] border-[#2d3436]'}
        ${isSelected ? 'ring-4 ring-blue-400 scale-110 z-20' : 'z-10'}
        ${(isLastMoveSource || isLastMoveDest) && !isSelected ? 'ring-2 ring-green-400' : ''}
        hover:scale-105 active:scale-95
      `}
      style={style}
    >
      <div className={`
        w-[34px] h-[34px] rounded-full border border-dashed border-opacity-30 
        ${isRed ? 'border-red-800' : 'border-black'} 
        flex items-center justify-center
      `}>
        <span className="text-xl font-bold font-serif leading-none pb-[2px]">{label}</span>
      </div>
      
      {/* 3D effect shadow inset */}
      <div className="absolute inset-0 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] pointer-events-none"></div>
    </div>
  );
};
