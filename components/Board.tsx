import React from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants';

export const BoardBackground: React.FC = () => {
  // SVG drawing logic for the Xiangqi board
  // 9 vertical lines, 10 horizontal lines.
  // River between y=4 and y=5.
  // Palaces at x:3-5, y:0-2 and y:7-9.

  const width = 100; // grid width units (8 * 12.5)
  const height = 112.5; // grid height units (9 * 12.5)
  const gap = width / 8; // 12.5

  // Padding: 5 units on all sides.
  // Total Width: 110
  // Total Height: 122.5

  // Generate grid lines
  const horizontals = [];
  for (let i = 0; i < 10; i++) {
    horizontals.push(
      <line key={`h-${i}`} x1="0" y1={i * gap} x2={width} y2={i * gap} stroke="#5c4033" strokeWidth="0.5" />
    );
  }

  const verticals = [];
  // Top half (0-4)
  for (let i = 0; i < 9; i++) {
    if (i === 0 || i === 8) {
      // Outer borders run full length
      verticals.push(<line key={`v-outer-${i}`} x1={i * gap} y1="0" x2={i * gap} y2={9 * gap} stroke="#5c4033" strokeWidth="1" />);
    } else {
      // Inner lines interrupted by river
      verticals.push(<line key={`v-top-${i}`} x1={i * gap} y1="0" x2={i * gap} y2={4 * gap} stroke="#5c4033" strokeWidth="0.5" />);
      verticals.push(<line key={`v-bot-${i}`} x1={i * gap} y1={5 * gap} x2={i * gap} y2={9 * gap} stroke="#5c4033" strokeWidth="0.5" />);
    }
  }

  // Palaces (Diagonal lines)
  // Top: (3,0) to (5,2) and (5,0) to (3,2)
  const palaceLines = [
    <line key="p-t-1" x1={3 * gap} y1={0} x2={5 * gap} y2={2 * gap} stroke="#5c4033" strokeWidth="0.5" />,
    <line key="p-t-2" x1={5 * gap} y1={0} x2={3 * gap} y2={2 * gap} stroke="#5c4033" strokeWidth="0.5" />,
    // Bottom: (3,9) to (5,7) and (5,9) to (3,7)
    <line key="p-b-1" x1={3 * gap} y1={9 * gap} x2={5 * gap} y2={7 * gap} stroke="#5c4033" strokeWidth="0.5" />,
    <line key="p-b-2" x1={5 * gap} y1={9 * gap} x2={3 * gap} y2={7 * gap} stroke="#5c4033" strokeWidth="0.5" />,
  ];

  // Decoration Crosses (The little L-shapes for setup points)
  // Standard positions:
  // Rows 2 & 7 (Canons): Cols 1, 7
  // Rows 3 & 6 (Soldiers): Cols 0, 2, 4, 6, 8
  const marks = [
    {x: 1, y: 2}, {x: 7, y: 2},
    {x: 1, y: 7}, {x: 7, y: 7},
    {x: 0, y: 3}, {x: 2, y: 3}, {x: 4, y: 3}, {x: 6, y: 3}, {x: 8, y: 3},
    {x: 0, y: 6}, {x: 2, y: 6}, {x: 4, y: 6}, {x: 6, y: 6}, {x: 8, y: 6},
  ];

  // SVG viewBox definition:
  // min-x: -5 (left padding)
  // min-y: -5 (top padding)
  // width: 110 (100 + 5 left + 5 right)
  // height: 122.5 (112.5 + 5 top + 5 bottom)
  return (
    <svg viewBox="-5 -5 110 122.5" className="w-full h-full bg-[#e6cba5] shadow-inner rounded-sm">
        <g transform="translate(0, 0)">
            {horizontals}
            {verticals}
            {palaceLines}
            
            {/* River Text */}
            <text x={width / 4} y={4.5 * gap} textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-[#5c4033] font-serif tracking-widest opacity-60">楚 河</text>
            <text x={width * 0.75} y={4.5 * gap} textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-[#5c4033] font-serif tracking-widest opacity-60">汉 界</text>

            {/* Selection Marks */}
            {marks.map((m, idx) => {
              const mx = m.x * gap;
              const my = m.y * gap;
              const s = 2; // size
              const o = 1; // offset
              return (
                <g key={idx} stroke="#5c4033" strokeWidth="0.5" fill="none">
                   {m.x > 0 && <path d={`M${mx - o - s} ${my - o} L${mx - o} ${my - o} L${mx - o} ${my - o - s}`} />}
                   {m.x > 0 && <path d={`M${mx - o - s} ${my + o} L${mx - o} ${my + o} L${mx - o} ${my + o + s}`} />}
                   {m.x < 8 && <path d={`M${mx + o + s} ${my - o} L${mx + o} ${my - o} L${mx + o} ${my - o - s}`} />}
                   {m.x < 8 && <path d={`M${mx + o + s} ${my + o} L${mx + o} ${my + o} L${mx + o} ${my + o + s}`} />}
                </g>
              )
            })}
        </g>
        {/* Border */}
        <rect x="-2" y="-2" width={width + 4} height={9 * gap + 4} fill="none" stroke="#4a3022" strokeWidth="2" />
    </svg>
  );
};
