
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoardState, Color, Piece, Position, GameMode } from './types';
import { INITIAL_BOARD_SETUP, BOARD_WIDTH, BOARD_HEIGHT } from './constants';
import { toKey, fromKey, isValidMove, getBoardPercentage } from './utils/gameLogic';
import { BoardBackground } from './components/Board';
import { PieceComponent } from './components/Piece';
import { getAIMove } from './services/ai';
import { playSound, speakMove } from './utils/audio';
import { RotateCcw, Monitor, Users, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<BoardState>({
    pieces: INITIAL_BOARD_SETUP(),
    turn: 'red',
    selectedPos: null,
    lastMove: null,
    winner: null,
    history: []
  });

  const [gameMode, setGameMode] = useState<GameMode>(GameMode.LOCAL_PVP);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [message, setMessage] = useState<string>('Welcome! Select a mode to start.');
  
  const handleRestart = () => {
    setGameState({
      pieces: INITIAL_BOARD_SETUP(),
      turn: 'red',
      selectedPos: null,
      lastMove: null,
      winner: null,
      history: []
    });
    setMessage('Game Started. Red to move.');
    setIsAIThinking(false);
    playSound('select'); // Feedback for restart
  };

  const executeMove = (from: Position, to: Position, pieces: Map<string, Piece>, currentTurn: Color) => {
    const nextPieces = new Map(pieces);
    const piece = nextPieces.get(toKey(from))!;
    const target = nextPieces.get(toKey(to));
    let winner: Color | null = null;

    // Check for capture of General
    if (target && target.type === 'general') {
      winner = currentTurn;
    }

    nextPieces.delete(toKey(from));
    nextPieces.set(toKey(to), { ...piece });

    const nextTurn = currentTurn === 'red' ? 'black' : 'red';

    setGameState(prev => ({
      ...prev,
      pieces: nextPieces,
      turn: nextTurn,
      selectedPos: null,
      lastMove: { from, to },
      winner: winner,
      history: [...prev.history, `${piece.type} ${from.x},${from.y} to ${to.x},${to.y}`]
    }));

    // Trigger Voice Notation (Standard Xiangqi TTS)
    speakMove(piece.type, piece.color, from, to);

    // Play Sound Effects
    if (winner) {
      playSound('win');
      setMessage(`${winner.toUpperCase()} wins!`);
    } else {
      playSound(target ? 'capture' : 'move');
      setMessage(`${nextTurn === 'red' ? 'Red' : 'Black'}'s turn`);
    }

    return { nextTurn, winner };
  };

  const handleTileClick = async (x: number, y: number) => {
    if (gameState.winner || isAIThinking) return;

    // Prevent moving for AI during their turn
    if (gameMode === GameMode.VS_AI && gameState.turn === 'black') return;

    const clickedPos = { x, y };
    const clickedKey = toKey(clickedPos);
    const clickedPiece = gameState.pieces.get(clickedKey);

    // 1. Select a piece
    if (!gameState.selectedPos) {
      if (clickedPiece && clickedPiece.color === gameState.turn) {
        playSound('select');
        setGameState(prev => ({ ...prev, selectedPos: clickedPos }));
      }
      return;
    }

    // 2. Move or Reselect
    
    // Reselect if clicking another own piece
    if (clickedPiece && clickedPiece.color === gameState.turn) {
        playSound('select');
        setGameState(prev => ({ ...prev, selectedPos: clickedPos }));
        return;
    }

    // Attempt Move
    if (isValidMove(gameState.selectedPos, clickedPos, gameState.pieces, gameState.turn)) {
      const result = executeMove(gameState.selectedPos, clickedPos, gameState.pieces, gameState.turn);
      
      // Trigger AI if applicable
      if (gameMode === GameMode.VS_AI && !result.winner && result.nextTurn === 'black') {
         setIsAIThinking(true);
      }
    } else {
      // Invalid move, deselect (optional: add error sound here if desired)
      setGameState(prev => ({ ...prev, selectedPos: null }));
    }
  };

  // AI Effect
  useEffect(() => {
    const performAIMove = async () => {
      if (gameMode === GameMode.VS_AI && gameState.turn === 'black' && isAIThinking && !gameState.winner) {
        setMessage("Gemini AI is thinking...");
        
        // Small delay for UX
        await new Promise(r => setTimeout(r, 500));

        const move = await getAIMove(gameState.pieces, 'black');
        
        if (move) {
            // Validate AI move just in case
            if (isValidMove(move.from, move.to, gameState.pieces, 'black')) {
                executeMove(move.from, move.to, gameState.pieces, 'black');
            } else {
                setMessage("AI attempted invalid move. Skipping turn (error).");
                setGameState(prev => ({ ...prev, turn: 'red' })); // Skip turn on error to prevent lock
            }
        } else {
            setMessage("AI failed to generate a move. You win by default?");
        }
        setIsAIThinking(false);
      }
    };

    performAIMove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAIThinking, gameMode, gameState.turn]);


  // Calculate marker positions for possible moves of selected piece
  const getPossibleMoves = () => {
      if (!gameState.selectedPos) return [];
      const moves: Position[] = [];
      for (let y=0; y<BOARD_HEIGHT; y++) {
          for (let x=0; x<BOARD_WIDTH; x++) {
              if (isValidMove(gameState.selectedPos, {x,y}, gameState.pieces, gameState.turn)) {
                  moves.push({x,y});
              }
          }
      }
      return moves;
  };
  const possibleMoves = getPossibleMoves();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-6 px-2 font-serif text-stone-800">
      
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-red-900 mb-2 drop-shadow-sm tracking-wide">
            中国象棋 <span className="text-xl text-stone-600 block sm:inline font-sans font-normal mt-1 sm:mt-0">Gemini Xiangqi</span>
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
            Experience the classic strategy game powered by Google Gemini AI.
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <button 
            onClick={() => { setGameMode(GameMode.LOCAL_PVP); handleRestart(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${gameMode === GameMode.LOCAL_PVP ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-300 hover:bg-stone-50'}`}
        >
            <Users size={16} /> Local PvP
        </button>
        <button 
            onClick={() => { setGameMode(GameMode.VS_AI); handleRestart(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${gameMode === GameMode.VS_AI ? 'bg-blue-700 text-white border-blue-700' : 'bg-white border-stone-300 hover:bg-blue-50'}`}
        >
            <BrainCircuit size={16} /> Play vs AI
        </button>
        <button 
            onClick={handleRestart}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-200 text-red-700 hover:bg-red-50 transition-all ml-2"
        >
            <RotateCcw size={16} /> Restart
        </button>
      </div>

      {/* Game Status */}
      <div className={`mb-4 px-6 py-2 rounded-lg shadow-sm border ${gameState.turn === 'red' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-stone-200 border-stone-300 text-stone-800'} transition-colors duration-300`}>
        <div className="flex items-center gap-2 font-bold">
            {isAIThinking && <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>}
            {message}
        </div>
      </div>

      {/* Board Container */}
      {/* Aspect Ratio: 110 (width) / 122.5 (height) = ~44/49 */}
      <div className="relative w-full max-w-[480px] aspect-[44/49] select-none p-2 bg-[#8b5a2b] rounded-lg shadow-2xl border-4 border-[#654321]">
        
        {/* The Board SVG */}
        <div className="w-full h-full relative">
            <BoardBackground />
            
            {/* Click Targets & Move Highlights */}
            {/* Using absolute positioning calculated to match SVG coordinates exactly */}
            <div className="absolute inset-0 z-0">
                {Array.from({ length: 90 }).map((_, i) => {
                    const x = i % 9;
                    const y = Math.floor(i / 9);
                    const isPossible = possibleMoves.some(p => p.x === x && p.y === y);
                    const { left, top } = getBoardPercentage(x, y);
                    
                    return (
                        <div 
                            key={i} 
                            onClick={() => handleTileClick(x, y)}
                            className="absolute cursor-pointer group flex items-center justify-center rounded-full"
                            style={{ 
                                left, 
                                top, 
                                width: '11.36%', // ~12.5/110
                                height: '10.2%', // ~12.5/122.5
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {/* Hover Highlight (Subtle) */}
                            <div className="w-[80%] h-[80%] rounded-full opacity-0 group-hover:opacity-10 bg-black transition-opacity" />
                            
                            {/* Possible Move Indicator */}
                            {isPossible && (
                                <div className={`w-3 h-3 rounded-full ${gameState.pieces.has(toKey({x,y})) ? 'ring-2 ring-blue-500' : 'bg-blue-500 opacity-50'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pieces Layer */}
            <div className="absolute inset-0 pointer-events-none z-10">
                 {Array.from(gameState.pieces.entries()).map(([key, piece]) => {
                     const { x, y } = fromKey(key);
                     return (
                         <div key={piece.id} className="pointer-events-auto">
                            <PieceComponent 
                                piece={piece} 
                                position={{ x, y }}
                                isSelected={gameState.selectedPos?.x === x && gameState.selectedPos?.y === y}
                                isLastMoveSource={gameState.lastMove?.from.x === x && gameState.lastMove?.from.y === y}
                                isLastMoveDest={gameState.lastMove?.to.x === x && gameState.lastMove?.to.y === y}
                                onClick={() => handleTileClick(x, y)}
                            />
                         </div>
                     )
                 })}
            </div>
        </div>
      </div>

      {/* Footer / Instructions */}
      <div className="mt-8 text-stone-400 text-xs text-center">
        <p>Red moves first. Standard Xiangqi rules apply.</p>
        <p className="mt-1">In AI mode, Gemini acts as the Black player.</p>
      </div>

    </div>
  );
};

export default App;
